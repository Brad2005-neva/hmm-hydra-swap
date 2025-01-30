import { ClientService } from "../client";
import { AssetsService } from ".";
import { captureValues, MockClientBuilder } from "../test-utils";
import { Network } from "@hydraprotocol/sdk";
import tokens from "@hydraprotocol/config/tokens.json";

describe("AssetService", () => {
  test(".assetMap", async () => {
    const [USD, BTC, ETH, SOL] = tokens.localnet;

    const clientService = new ClientService();
    const assetsService = new AssetsService(
      [USD, BTC, ETH, SOL],
      clientService
    );
    const client = MockClientBuilder.new()
      .withNetwork(Network.LOCALNET)
      .build();

    const sub = assetsService.assetMap.subscribe();
    const gathering = captureValues(assetsService.assetMap);
    clientService.setClient(client);

    const [lookup] = await gathering;

    expect(lookup.get(SOL.address)).toEqual(SOL);
    expect(lookup.get(USD.address)).toEqual(USD);
    expect(lookup.get(BTC.address)).toEqual(BTC);
    expect(lookup.get(ETH.address)).toEqual(ETH);

    sub.unsubscribe();
  });

  test(".asset", async () => {
    const [USD, BTC, ETH, SOL] = tokens.localnet;

    const clientService = new ClientService();
    const assetsService = new AssetsService(
      [USD, BTC, ETH, SOL],
      clientService
    );
    const client = MockClientBuilder.new()
      .withNetwork(Network.LOCALNET)
      .build();

    // let subAssetList: Asset[] = [];
    // const sub = assetsService.asset.subscribe((i) => subAssetList.push(i));
    const gathering = captureValues(assetsService.asset);
    clientService.setClient(client);

    const [assets] = await gathering;

    expect(assets).toEqual([USD, BTC, ETH, SOL]);
    // expect(subAssetList).toEqual([USD, BTC, ETH, SOL]);
    // sub.unsubscribe();
  });
});
