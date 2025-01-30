import { Asset, getAssets } from "@hydraprotocol/sdk";
import { distinctUntilChanged, map, Observable, shareReplay } from "rxjs";
import { ClientService } from "../client";
import { AssetMap } from "../types";

export class AssetsService {
  private assetMap$?: Observable<AssetMap>;

  constructor(
    private readonly assetList: Asset[],
    private readonly clientService: ClientService
  ) {}

  get assetMap(): Observable<AssetMap> {
    if (!this.assetMap$) {
      this.assetMap$ = this.getAssetsAsList().pipe(
        distinctUntilChanged(),
        map((assets) => {
          return assets.reduce((acc, asset) => {
            acc.set(asset.address, asset);
            return acc;
          }, new Map<string, Asset>());
        }),
        shareReplay(1)
      );
    }
    return this.assetMap$;
  }

  private getAssetsAsList() {
    return this.clientService.client.pipe(
      map((client) => {
        let assets = this.assetList;

        if (assets.length === 0) {
          assets = getAssets(client.ctx.network);
        }
        return assets;
      })
    );
  }

  get asset(): Observable<Asset[]> {
    return this.getAssetsAsList();
  }

  static new(
    assetList: Asset[] = [],
    clientService = ClientService.instance()
  ) {
    return new AssetsService(assetList, clientService);
  }

  private static _instance: AssetsService;
  static instance() {
    if (!this._instance) {
      this._instance = AssetsService.new();
    }
    return this._instance;
  }
}
