import { Asset, HydraSDK, Network } from "@hydraprotocol/sdk";
import { PublicKey, Keypair } from "@solana/web3.js";

import { PoolService } from "./pool/PoolService";
import { merge } from "lodash";
import {
  identity,
  last,
  Observable,
  of,
  OperatorFunction,
  pipe,
  Subject,
  take,
  takeWhile,
  timeout,
  toArray,
} from "rxjs";
import { EnrichedPoolState, PoolDescriptor, PoolInfoItem } from "./types";
import { ClientService } from "./client";
import { AssetsService } from "./assets";

export class MockClientBuilder {
  private client: Partial<HydraSDK> = {};
  public $poolStream = new Subject<
    Partial<{
      key: PublicKey;
      info: { tokenXMint: PublicKey; tokenYMint: PublicKey };
    }>
  >();
  withTokenBalance(
    getVals: (
      tokenXMint: PublicKey,
      tokenYMint: PublicKey,
      poolId: number
    ) => {
      field: string;
      isInitialized: boolean;
      balance: bigint;
    }
  ) {
    this.client = merge(this.client, {
      liquidityPools: {
        accounts: {
          getAccountLoaders(
            tokenXMint: PublicKey,
            tokenYMint: PublicKey,
            poolId: number
          ) {
            const { field, isInitialized, balance } = getVals(
              tokenXMint,
              tokenYMint,
              poolId
            );
            return {
              [field]: {
                async isInitialized() {
                  return isInitialized;
                },
                async info() {
                  return {
                    data: {
                      amount: balance,
                    },
                  };
                },
              },
            };
          },
        },
      },
    });
    return this;
  }
  withNetwork(network: Network = Network.LOCALNET) {
    this.client = merge(this.client, {
      ctx: {
        network,
      },
    });
    return this;
  }
  withPoolStream() {
    const stream = this.$poolStream.asObservable();
    this.client = merge(this.client, {
      liquidityPools: {
        getAllPoolsAsStream() {
          return stream;
        },
      },
    });
    return this;
  }

  build() {
    return this.client as HydraSDK;
  }

  buildWithStream() {
    return { poolStream: this.$poolStream, client: this.client as HydraSDK };
  }

  static new() {
    return new MockClientBuilder();
  }
}
function takeUntilTimeout<T>(waitTime = -1): OperatorFunction<T, T> {
  const fn =
    waitTime > 0
      ? pipe(
          timeout({
            each: waitTime,
            with: () => of("_done" as any as T), // fake it to avoid TS issues
          }),
          takeWhile((val: any) => val !== "_done")
        )
      : identity;

  return fn;
}

export function captureValues<T>(
  // Stream to capture values from
  o: Observable<T>,
  // Run event emitting code within act
  act: () => void | Promise<void> = () => {},
  // If waitTime has elapsed after a value has been sent
  // close the stream and return the results
  waitTime = 50
): Promise<T[]> {
  return new Promise((res) => {
    // Define the observable chain
    o.pipe(takeUntilTimeout(waitTime), toArray()).subscribe((value) => {
      res(value);
    });
    // Run any event producing effects
    act();
  });
}

export const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function setupPoolStream(
  allowedAssets: Asset[] = [],
  streams: Array<[string, Observable<EnrichedPoolState>]> = []
) {
  const { client, poolStream } = MockClientBuilder.new()
    .withNetwork(Network.LOCALNET)
    .withPoolStream()
    .buildWithStream();

  const clientService = ClientService.new();
  const assetService = AssetsService.new(allowedAssets, clientService);

  const streamCache: Map<string, Observable<EnrichedPoolState>> = streams.length
    ? new Map(streams)
    : new Map();
  const service = PoolService.new(
    assetService,
    clientService,
    undefined,
    streamCache
  );
  clientService.setClient(client);

  return { service, poolStream };
}

export function toPoolDescriptor({
  info: { tokenXMint, tokenYMint, poolId },
}: PoolInfoItem): PoolDescriptor {
  return { tokenXMint, tokenYMint, poolId };
}

export function createPoolInfo(
  tokenA: Asset,
  tokenB: Asset,
  poolId: number,
  cValue = 0
): PoolInfoItem {
  const tokenAMint = new PublicKey(tokenA.address);
  const tokenBMint = new PublicKey(tokenB.address);
  const [tokenXMint, tokenYMint] =
    tokenAMint.toBuffer().compare(tokenBMint.toBuffer()) > 0
      ? [tokenBMint, tokenAMint]
      : [tokenAMint, tokenBMint];

  return {
    key: Keypair.generate().publicKey,
    info: {
      poolId,
      tokenXMint,
      tokenYMint,
      cValue,
    },
  } as PoolInfoItem;
}

export function gatherLast<T>(ob$: Observable<T>, num = 1, act?: () => any) {
  const prom = new Promise<T>((res) => {
    ob$.pipe(take(num), last()).subscribe(res);
  });
  act && act();
  return prom;
}

export function createRandomKeys(num: number) {
  return new Array(num).fill(0).map(() => Keypair.generate().publicKey);
}

export function fromCallback<T>() {
  const sub$ = new Subject<T>();
  function callback(value: T) {
    sub$.next(value);
  }
  return [callback, sub$.asObservable()] as const;
}
