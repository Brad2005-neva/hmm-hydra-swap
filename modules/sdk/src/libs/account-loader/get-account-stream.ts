import {
  AccountInfo,
  Commitment,
  Connection,
  PublicKey,
} from "@solana/web3.js";
import { concat, from, Observable, shareReplay } from "rxjs";
import { AccountData, Parser } from "./types";
import { cache } from "./cache";
import { getInfo } from "./info-queue";

// TODO: maintain a list of streams by public key to avoid setting up too many streams
const streamStore = new Map<string, Observable<any>>();

async function getAccountData<T>(
  pubkey: PublicKey,
  connection: Connection,
  accountParser: Parser<T>,
  commitment?: Commitment
): Promise<AccountData<T> | undefined> {
  let account: AccountInfo<T>;
  try {
    const info = await getInfo(pubkey, connection, commitment);
    if (info === null) return;
    account = { ...info, data: accountParser(info) };
  } catch (err) {
    console.log(err);
    return;
  }

  return {
    account,
    pubkey,
  };
}

export function getAccountStream<T>(
  pubkey: PublicKey,
  connection: Connection,
  accountParser: Parser<T>,
  commitment?: Commitment
): Observable<AccountData<T> | undefined> {
  const cachedStream = cache(streamStore, pubkey, () => {
    // first send current data then changes

    const currentData$ = from(
      getAccountData(pubkey, connection, accountParser, commitment)
    );

    const changes$ = new Observable<AccountData<T>>((subscriber) => {
      // Listen for account change events
      // Send events to stream
      const id = connection.onAccountChange(
        pubkey,
        (rawAccount: AccountInfo<Buffer> | null) => {
          if (rawAccount) {
            const account = {
              ...rawAccount,
              data: accountParser(rawAccount),
            };
            subscriber.next({ pubkey, account });
          } else {
            subscriber.next();
          }
        },
        commitment
      );

      return () => {
        connection.removeAccountChangeListener(id);
      };
    });
    return concat(currentData$, changes$).pipe(
      shareReplay({ bufferSize: 1, refCount: true })
    );
  });

  return cachedStream;
}
