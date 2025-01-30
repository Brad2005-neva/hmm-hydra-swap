import { Asset, HydraSDK } from "@hydraprotocol/sdk";
import {
  combineLatest,
  map,
  Observable,
  shareReplay,
  switchMap,
  withLatestFrom,
} from "rxjs";
import { PublicKey } from "@solana/web3.js";
import { ClientService, AssetsService } from "..";

function assetToBalStream(asset: Asset, client: HydraSDK): Observable<bigint> {
  // Get loader for the associatedToken
  const tokenBal$ = client.accountLoaders
    .associatedToken(new PublicKey(asset.address))
    .stream()
    .pipe(map((account) => account?.account.data.amount ?? 0n));

  // If we are not dealing with native sol return the token stream
  if (asset.address !== "So11111111111111111111111111111111111111112") {
    return tokenBal$;
  }

  // Get the solana balance for the wallet
  const noop = () => {};
  const createWalletLoader = client.accountLoaders.account(noop);
  const solBal$ = createWalletLoader(client.ctx.provider.wallet.publicKey)
    .stream()
    .pipe(map((val) => BigInt(val?.account.lamports ?? 0)));

  // When we have native sol as well wsol deliver the combined balance
  return combineLatest([solBal$, tokenBal$]).pipe(
    map(([sol, wsol]) => sol + wsol)
  );
}

export class BalancesService {
  private balances$?: Observable<Asset[]>;

  constructor(
    private readonly clientService: ClientService,
    private readonly assetsService: AssetsService
  ) {}

  get balances(): Observable<Asset[]> {
    if (!this.balances$) {
      console.log("creating balances");

      const assetArray$ = this.assetsService.asset;

      this.balances$ = assetArray$.pipe(
        withLatestFrom(this.clientService.client),
        switchMap(([assetList, client]) =>
          combineLatest(
            assetList.map((asset) => assetToBalStream(asset, client))
          )
        ),
        withLatestFrom(assetArray$),
        map(([balances, assetList]) =>
          // zip arrays
          balances.map((balance, index) => {
            return { ...assetList[index], balance };
          })
        ),
        shareReplay(1)
      );
    }
    return this.balances$;
  }

  static new(
    clientService = ClientService.instance(),
    assetsService = AssetsService.instance()
  ) {
    return new BalancesService(clientService, assetsService);
  }

  private static _instance: BalancesService;
  static instance() {
    if (!this._instance) {
      this._instance = BalancesService.new();
    }
    return this._instance;
  }
}
