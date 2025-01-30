import { Asset, Decimal, HydraSDK, LoaderFinder } from "@hydraprotocol/sdk";
import { getPoolIdFromName } from "./hdump";

export default async function swapDump(
  poolIdOrName: number | string,
  sdk: HydraSDK,
  assetBalances: Asset[],
  tokenPrices?: Record<string, number>
) {
  globalThis.DEBUG = true;
  const poolId =
    typeof poolIdOrName === "number"
      ? poolIdOrName
      : await getPoolIdFromName(
          () => sdk.liquidityPools.getAllPoolsAsList(),
          poolIdOrName,
          assetBalances
        );
  try {
    console.log(await sdk.liquidityPools.getAllPoolsAsList());
    const poolState = await LoaderFinder.fromCtx(sdk.ctx)
      .poolState(poolId)
      .info();

    const tokenXVault = await sdk.accountLoaders
      .token(poolState.data.tokenXVault)
      .info();
    const tokenYVault = await sdk.accountLoaders
      .token(poolState.data.tokenYVault)
      .info();

    const tokenXMint = await sdk.accountLoaders
      .mint(poolState.data.tokenXMint)
      .info();

    const tokenYMint = await sdk.accountLoaders
      .mint(poolState.data.tokenYMint)
      .info();

    console.log({ tokenXMint, tokenXVault });

    const tokenXSymbol = assetBalances.filter(
      (asset) => asset.address === poolState.data.tokenXMint.toString()
    )[0].symbol;
    const tokenYSymbol = assetBalances.filter(
      (asset) => asset.address === poolState.data.tokenYMint.toString()
    )[0].symbol;

    const tokenXPrice = !!tokenPrices && tokenPrices[tokenXSymbol];
    const tokenYPrice = !!tokenPrices && tokenPrices[tokenYSymbol];
    const tokenXPoolAmount = Decimal.from(
      tokenXVault.data.amount,
      BigInt(tokenXMint.data.decimals)
    ).toFormat(Decimal.FORMAT_TOKEN, tokenXMint.data.decimals);

    const tokenYPoolAmount = Decimal.from(
      tokenYVault.data.amount,
      BigInt(tokenYMint.data.decimals)
    ).toFormat(Decimal.FORMAT_TOKEN, tokenYMint.data.decimals);

    sdk.ctx.log({
      [`${tokenXSymbol}-pyth`]: tokenXPrice,
      [`${tokenYSymbol}-pyth`]: tokenYPrice,
      [`${tokenXSymbol}-pool`]: tokenXPoolAmount,
      [`${tokenYSymbol}-pool`]: tokenYPoolAmount,
    });
  } catch {
    console.log("There is no pool with that id.");
  }
}
