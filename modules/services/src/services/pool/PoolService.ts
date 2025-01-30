import {
  combineLatest,
  distinctUntilChanged,
  filter,
  from,
  map,
  mergeMap,
  Observable,
  of,
  scan,
  shareReplay,
  switchMap,
  withLatestFrom,
} from "rxjs";
import { AssetsService } from "../assets";
import { ClientService } from "../client";
import { PublicKey } from "@solana/web3.js";
import { EnrichedPoolState, PoolInfoItem, PoolDescriptor } from "../types";
import { PoolFinder } from "./PoolFinder";
import { sendDefaultAfter } from "./sendDefaultAfter";
import { AccountData, HydraSDK, TokenAccount } from "@hydraprotocol/sdk";

export const POOL_TIMEOUT = 1_500;

const stringify = (o: any) =>
  JSON.stringify(o, (k, v) => {
    if (typeof v === "bigint") {
      return v.toString() + "n";
    }
    return v;
  });

export function equals(a: any, b: any) {
  return stringify(a) === stringify(b);
}

export function getLpTokenAssociatedAccountStream(
  client: HydraSDK,
  item: PoolDescriptor
): Observable<AccountData<TokenAccount> | undefined> {
  return client.liquidityPools.accounts
    .getLoaderFinder(item.tokenXMint, item.tokenYMint, item.poolId)
    .lpTokenAssociatedAccount()
    .stream();
}

export function getTokenAccountAmount(
  maybeTokenAccount: AccountData<TokenAccount> | undefined
) {
  return maybeTokenAccount?.account.data.amount ?? 0n;
}

export async function getAccountLoaders(
  client: HydraSDK,
  poolId: number,
  tokenXMint: PublicKey,
  tokenYMint: PublicKey
) {
  const accounts = await client.liquidityPools.accounts.getAccountLoaders(
    tokenXMint,
    tokenYMint,
    poolId
  );

  return {
    ...accounts,
    tokenXMint: client.accountLoaders.mint(tokenXMint),
    tokenYMint: client.accountLoaders.mint(tokenYMint),
  };
}

// TODO: Rename PoolsService

export class PoolService {
  private allPools$?: Observable<PoolDescriptor[]>;
  private myPools$?: Observable<PoolDescriptor[]>;
  private rawPools$?: Observable<PoolInfoItem>;
  private poolFinder$?: Observable<PoolFinder>;

  getLegalPools() {
    return this.getRawPools().pipe(
      map<PoolInfoItem, PoolDescriptor>((item) => {
        return {
          poolId: item.info.poolId,
          tokenXMint: item.info.tokenXMint,
          tokenYMint: item.info.tokenYMint,
        };
      }),
      // Filter by whitelisted tokens
      withLatestFrom(this.assetService.assetMap),
      filter(([item, assetMap]) => {
        const { tokenXMint, tokenYMint } = item;
        return assetMap.has(`${tokenXMint}`) && assetMap.has(`${tokenYMint}`);
      }),
      map(([item]) => item)
    );
  }

  getAllPoolsNoOffset(timeout = POOL_TIMEOUT): Observable<PoolDescriptor[]> {
    if (this.allPools$) return this.allPools$;

    const allPoolsStream = this.getLegalPools().pipe(
      // Collate results to a list
      scan(
        (acc, item) => acc.set(item.poolId, item),
        new Map<number, PoolDescriptor>()
      ),
      map((set) => Array.from(set.values())),
      distinctUntilChanged(equals),
      shareReplay(1)
    );

    this.allPools$ = sendDefaultAfter([], timeout, allPoolsStream);

    return this.allPools$;
  }

  getMyPoolsNoOffset(
    lpTokenFinder = getLpTokenAssociatedAccountStream,
    getAmount = getTokenAccountAmount,
    timeout = POOL_TIMEOUT
  ): Observable<PoolDescriptor[]> {
    if (this.myPools$) return this.myPools$;

    const myPoolsStream = this.getLegalPools().pipe(
      withLatestFrom(this.clientService.client),
      mergeMap(([item, client]) =>
        combineLatest([of(item), lpTokenFinder(client, item)])
      ),
      // Colate results to a list
      scan(
        (acc, [item, lpTokenAcc]) => {
          const isMyPool = lpTokenAcc ? getAmount(lpTokenAcc) > 0n : false;

          if (isMyPool) {
            acc = acc || new Map();
            acc.set(item.poolId, item);
            return acc;
          }

          if (acc) {
            acc.delete(item.poolId);
            return acc;
          }

          return acc;
        },
        // Starting with a null Map
        // null is returned if there have never been any
        // items in the list
        // This probably means we are loading the list
        // and the default value has not been returned
        null as null | Map<number, PoolDescriptor>
      ),
      filter((item) => item !== null),
      // Unwrap the map
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      map((set) => Array.from(set!.values())),
      distinctUntilChanged(equals),
      shareReplay(1)
    );

    this.myPools$ = sendDefaultAfter([], timeout, myPoolsStream);

    return this.myPools$;
  }

  /**
   * @returns an observable of lists of all pools
   */
  getAllPools(offset = 0, limit = Number.POSITIVE_INFINITY) {
    return this.getAllPoolsNoOffset().pipe(
      map((result) => result.slice(offset, offset + limit))
    );
  }
  /**
   * @returns an observable of lists of my pools
   */
  getMyPools(offset = 0, limit = Number.POSITIVE_INFINITY) {
    return this.getMyPoolsNoOffset().pipe(
      map((result) => result.slice(offset, offset + limit))
    );
  }

  getPoolFinder() {
    if (this.poolFinder$) return this.poolFinder$;
    this.poolFinder$ = this.getRawPools().pipe(
      scan(
        (poolFinder, { info: { cValue, tokenXMint, tokenYMint, poolId } }) =>
          poolFinder.add({
            tokenXMint,
            tokenYMint,
            poolId,
            cValue,
          }),
        this.poolFinder
      ),
      shareReplay(1)
    );

    return this.poolFinder$;
  }

  private getRawPools(): Observable<PoolInfoItem> {
    if (this.rawPools$) return this.rawPools$;

    this.rawPools$ = this.clientService.client.pipe(
      switchMap((client) => client.liquidityPools.getAllPoolsAsStream())
    );

    return this.rawPools$;
  }

  getPool(poolDescriptor: PoolDescriptor): Observable<EnrichedPoolState> {
    const key = `${poolDescriptor.poolId}`;
    // Use cached version if it exists
    const maybeStream = this.streamCache.get(key);
    if (maybeStream) {
      return maybeStream;
    }

    const poolStream$: Observable<EnrichedPoolState> =
      this.clientService.client.pipe(
        // Convert from client to account loaders
        switchMap((client) => {
          const { poolId, tokenXMint, tokenYMint } = poolDescriptor;
          return from(
            getAccountLoaders(client, poolId, tokenXMint, tokenYMint)
          );
        }),
        // Convert from account loaders to an enriched pool state
        switchMap((accounts) =>
          combineLatest({
            poolState: accounts.poolState.stream(),
            tokenXVault: accounts.tokenXVault.stream(),
            tokenYVault: accounts.tokenYVault.stream(),
            tokenXMint: accounts.tokenXMint.stream(),
            tokenYMint: accounts.tokenYMint.stream(),
            lpTokenMint: accounts.lpTokenMint.stream(),
            lpTokenAssociatedAccount:
              accounts.lpTokenAssociatedAccount.stream(),
          })
        ),
        // Dont forget isInitialized
        map((poolState) => ({
          ...poolState,
          isInitialized: !!poolState.poolState,
        })),
        // We want to share this stream and replay when new subscriptions occur
        shareReplay(1)
      );
    this.streamCache.set(key, poolStream$);
    return poolStream$;
  }

  findPool(search: { tokenA?: PublicKey; tokenB?: PublicKey; c?: number }) {
    return this.getPoolFinder().pipe(
      // Do the search
      map((poolFinder) => poolFinder.findPool(search)),
      // Unwrap the descriptor
      map(([descriptor]) => descriptor),
      // Remove times when the stream cannot find any pools (say before all pools have loaded)
      filter(Boolean),
      // The following is required to ensure the stream emits values
      // Not sure 100% why - guess is that the first time we do a search
      // on this stream it returns nothing we then need to resubscribe later
      shareReplay(1),
      // switch to the poolStream
      switchMap((descriptor) => {
        return this.getPool(descriptor);
      })
    );
  }

  getCValues() {
    return this.poolFinder.getCValues();
  }

  constructor(
    private readonly assetService: AssetsService,
    private readonly clientService: ClientService,
    private readonly poolFinder: PoolFinder,
    private readonly streamCache: Map<string, Observable<EnrichedPoolState>>
  ) {}
  static new(
    assetService = AssetsService.instance(),
    clientService = ClientService.instance(),
    poolFinder = PoolFinder.new(),
    streamCache: Map<string, Observable<EnrichedPoolState>> = new Map()
  ) {
    return new PoolService(
      assetService,
      clientService,
      poolFinder,
      streamCache
    );
  }

  private static _instance: PoolService;

  static instance() {
    if (!this._instance) {
      this._instance = PoolService.new();
    }
    return this._instance;
  }
}
