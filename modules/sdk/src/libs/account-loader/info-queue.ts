import {
  AccountInfo,
  Commitment,
  Connection,
  PublicKey,
} from "@solana/web3.js";
import {
  bufferTime,
  concatMap,
  distinctUntilChanged,
  from,
  retry,
  share,
  shareReplay,
  Subject,
  withLatestFrom,
} from "rxjs";

/**
 * This provides an interface to collate getAccountInfo requests
 * to be bundled all together in a single getMultipleAccountsInfo call
 * This works by adding each publickey to a queue and batching them all together
 * and making sense of the results
 */

// Subject to store the connection (will likely be the same for every stream)
export const connectionInput = new Subject<Connection>();
export const infoQueueInput = new Subject<PublicKey>();

// Stream for holding our connection
const connection$ = connectionInput.asObservable().pipe(
  // only provide a new one when it has changed (unlikely)
  distinctUntilChanged(),
  // Multicast to all that want it
  shareReplay(1)
);

const MULTI_ACCOUNT_INFO_WINDOW_TIME = 50; // ms
const MULTI_ACCOUNT_INFO_MAX_KEYS = 100; // 100 pubkeys at once

export const infoQueueOutput$ = infoQueueInput.asObservable().pipe(
  // Gather together all requests for account info in a period
  bufferTime(MULTI_ACCOUNT_INFO_WINDOW_TIME, null, MULTI_ACCOUNT_INFO_MAX_KEYS),
  // Get the latest connection
  withLatestFrom(connection$),
  // Make all requests in order
  concatMap(([keys, connection]) => {
    // Create a function that returns a promise
    async function getMultipleAccountsInfo(): Promise<
      Record<string, AccountInfo<Buffer> | null>
    > {
      // if we have no keys then we dont need to call solana rpc methods
      if (keys.length === 0) return {};
      try {
        // Here we get multiple accounts together in a single request
        const result = await connection.getMultipleAccountsInfo(keys);

        // Lets collate all the returned results in a map so they are easy to find
        const reduced = result.reduce<
          Record<string, AccountInfo<Buffer> | null>
        >((acc, data, i) => {
          const key = `${keys[i]}`;
          return {
            ...acc,
            [key]: data,
          };
        }, {});

        // Return it at the end of the promise
        return reduced;
      } catch (err) {
        console.log("Problem loading multiple account data!");
      }
      return {};
    }

    // Convert the promise to a stream
    return from(getMultipleAccountsInfo()); // assuming default commitment for now
  }),
  retry(),
  // Ensure this is run whenever we need the data
  share()
);

// A nice interface fot our info queue
export const InfoQueue = {
  setConnection(connection: Connection) {
    connectionInput.next(connection);
  },
  addAccount(account: PublicKey) {
    infoQueueInput.next(account);
  },
  onResult(
    pubkey: PublicKey,
    callback: (info: AccountInfo<Buffer> | null) => void,
    onError = (_err: any) => {}
  ) {
    const id = setTimeout(() => {
      subscription.unsubscribe();
      onError(new Error("Key not returned after timeout"));
    }, 10000);

    const subscription = infoQueueOutput$.subscribe((result) => {
      const found = result[`${pubkey}`];

      if (typeof found !== "undefined") {
        clearTimeout(id);
        subscription.unsubscribe();
        callback(found);
      }
    });
  },
};

export async function getInfo(
  pubkey: PublicKey,
  connection: Connection,
  _commitment?: Commitment
): Promise<AccountInfo<Buffer> | null> {
  return new Promise<AccountInfo<Buffer> | null>((resolve) => {
    // We need to listen for a result first incase one comes
    InfoQueue.onResult(pubkey, resolve, console.log);
    InfoQueue.setConnection(connection);
    InfoQueue.addAccount(pubkey);
  });
}
