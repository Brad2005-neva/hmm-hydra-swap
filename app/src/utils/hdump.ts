import { PublicKey } from "@solana/web3.js";
import {
  Asset,
  Decimal,
  HydraSDK,
  LoaderFinder,
  PoolState,
} from "@hydraprotocol/sdk";

type AssetMap = Record<string, Asset>;

function normalizeName(name: string) {
  return name.split("-").sort().join("-").toLowerCase();
}

export async function getPoolIdFromName(
  getList: () => Promise<
    {
      key: PublicKey;
      info: PoolState;
    }[]
  >,
  name: string,
  assets: Asset[]
) {
  const list = await getList();
  const assetsMap = assets.reduce((acc, item) => {
    acc[`${item.address}`] = item;
    return acc;
  }, {} as AssetMap);

  const found = list.find((item) => {
    const poolName = [
      assetsMap[`${item.info.tokenXMint}`],
      assetsMap[`${item.info.tokenYMint}`],
    ]
      .map((a) => a.symbol)
      .sort()
      .join("-");

    return normalizeName(poolName) === normalizeName(name);
  });

  if (!found) throw new Error("pool not found: " + name);

  return found.info.poolId;
}

export default async function hdump(
  poolIdOrName: number | string,
  sdk: HydraSDK,
  assetBalances: Asset[],
  tokenPrices?: Record<string, number>
) {
  const poolId =
    typeof poolIdOrName === "number"
      ? poolIdOrName
      : await getPoolIdFromName(
          () => sdk.liquidityPools.getAllPoolsAsList(),
          poolIdOrName,
          assetBalances
        );
  try {
    const globalState = await LoaderFinder.fromCtx(sdk.ctx)
      .globalState()
      .info();
    const poolState = await LoaderFinder.fromCtx(sdk.ctx)
      .poolState(poolId)
      .info();

    const tokenXMint = await sdk.accountLoaders
      .mint(poolState.data.tokenXMint)
      .info();

    const tokenYMint = await sdk.accountLoaders
      .mint(poolState.data.tokenYMint)
      .info();

    const tokenXUserAmount = assetBalances.filter(
      (asset) => asset.address === poolState.data.tokenXMint.toString()
    )[0].balance;

    const tokenYUserAmount = assetBalances.filter(
      (asset) => asset.address === poolState.data.tokenYMint.toString()
    )[0].balance;

    const tokenXSymbol = assetBalances.filter(
      (asset) => asset.address === poolState.data.tokenXMint.toString()
    )[0].symbol;
    const tokenYSymbol = assetBalances.filter(
      (asset) => asset.address === poolState.data.tokenYMint.toString()
    )[0].symbol;

    const tokenXVault = await sdk.accountLoaders
      .token(poolState.data.tokenXVault)
      .info();
    const tokenYVault = await sdk.accountLoaders
      .token(poolState.data.tokenYVault)
      .info();
    const userWalletAmount = {
      tokenX: Decimal.from(
        tokenXUserAmount || 0n,
        BigInt(tokenXMint.data.decimals)
      ).toFormat(Decimal.FORMAT_TOKEN, tokenXMint.data.decimals),
      tokenY: Decimal.from(
        tokenYUserAmount || 0n,
        BigInt(tokenYMint.data.decimals)
      ).toFormat(Decimal.FORMAT_TOKEN, tokenYMint.data.decimals),
    };

    const tokenXPrice = !!tokenPrices && tokenPrices[tokenXSymbol];
    const tokenYPrice = !!tokenPrices && tokenPrices[tokenYSymbol];

    const hdumpData = {
      poolState: poolState.data,
      tokenXSymbol,
      tokenXPrice,
      tokenYSymbol,
      tokenYPrice,
      globalState,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      commit: (window as any).gch,
      userWalletAmount,
      tokenXMint,
      tokenYMint,
      tokenXVault,
      tokenYVault,
    };
    console.log(
      JSON.stringify(hdumpData, (_key, value) =>
        typeof value === "bigint" ? value.toString() + "n" : value
      )
    );
  } catch {
    console.log("There is no pool with that id.");
  }
}
