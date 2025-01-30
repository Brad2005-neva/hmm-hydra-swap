import { AccountData, HydraSDK, TokenAccount } from "@hydraprotocol/sdk";
import { Observable, of, ReplaySubject } from "rxjs";
import {
  captureValues,
  createPoolInfo,
  sleep,
  setupPoolStream,
  toPoolDescriptor,
} from "../test-utils";
import { PoolDescriptor, PoolInfoItem } from "../types";
import tokens from "@hydraprotocol/config/tokens.json";

const [USD, BTC, ETH] = tokens.localnet;

type MaybeTokenAccount = AccountData<TokenAccount> | undefined;

// Make it easier to test accounts by casting numbers to token accounts
function intAsTokenStream(int: bigint): Observable<MaybeTokenAccount> {
  return of(int as any as MaybeTokenAccount);
}

function intAsTokenStreamChanger(
  int: bigint
): [Observable<MaybeTokenAccount>, (i: bigint) => void] {
  const s = new ReplaySubject<bigint>();
  const setAmount = (i: bigint) => {
    s.next(i);
  };
  setAmount(int);
  return [s.asObservable() as any as Observable<MaybeTokenAccount>, setAmount];
}

// Fake get amount from casted token accounts
function getAmount(maybeToken: MaybeTokenAccount) {
  return maybeToken as any as bigint; // substituting  numbers for bigints
}

describe("PoolService.getMyPoolsNoOffset()", () => {
  let pools: PoolInfoItem[];
  let descriptors: PoolDescriptor[];
  let lpAssTokenAmtStreams: Observable<MaybeTokenAccount>[];
  let timeout: number;
  let resultDelay: number;
  let setSecondAccountAmount: (int: bigint) => void;

  function lpTokenFinder(_client: HydraSDK, item: PoolDescriptor) {
    return lpAssTokenAmtStreams[item.poolId];
  }

  beforeEach(() => {
    const tokenCtrl = intAsTokenStreamChanger(200n);
    setSecondAccountAmount = tokenCtrl[1];
    pools = [createPoolInfo(USD, ETH, 0), createPoolInfo(USD, BTC, 1)];
    descriptors = pools.map(toPoolDescriptor);
    lpAssTokenAmtStreams = [
      intAsTokenStream(0n), // USD,ETH,
      tokenCtrl[0], // USD,BTC
    ];
  });

  it("should respond to filter changes", async () => {
    const { service, poolStream } = setupPoolStream();
    const out = service.getMyPoolsNoOffset(lpTokenFinder, getAmount, 500);
    const items = await captureValues(out, async () => {
      for (const key of pools) {
        poolStream.next(key);
      }
      setSecondAccountAmount(0n);
    });
    expect(items).toEqual([[descriptors[1]], []]);
  });

  describe("when timeout occurs before results", () => {
    beforeEach(() => {
      timeout = 20;
      resultDelay = 50;
    });

    it("should provide an empty list first", async () => {
      // test with fast timeout
      const { service, poolStream } = setupPoolStream();
      const out = service.getMyPoolsNoOffset(lpTokenFinder, getAmount, timeout);
      const items = await captureValues(
        out,
        async () => {
          await sleep(resultDelay);
          for (const key of pools) {
            poolStream.next(key);
          }
        },
        200
      );
      expect(items).toEqual([
        [], // timeout delivers empty set
        [descriptors[1]],
      ]);
    });
  });

  describe("when timeout occurs after results", () => {
    beforeEach(() => {
      timeout = 40;
      resultDelay = 5;
    });

    it("should provide the results and no default", async () => {
      // test with fast timeout
      const { service, poolStream } = setupPoolStream();
      const out = service.getMyPoolsNoOffset(lpTokenFinder, getAmount, timeout);
      const items = await captureValues(out, async () => {
        await sleep(resultDelay);
        for (const key of pools) {
          poolStream.next(key);
        }
      });
      expect(items).toEqual([[descriptors[1]]]);
    });
  });
});
