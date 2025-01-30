import { TokenField } from "@hydraprotocol/services";
import { AccountData, Decimal, TokenAccount } from "@hydraprotocol/sdk";
import InlineData from "@ui/inlineData";
import LabeledText from "@ui/hydraPage/textWrapper";

function PoolLiquidity({
  tokenA,
  tokenB,
  tokenAVault,
  tokenBVault,
}: {
  tokenA: TokenField;
  tokenB: TokenField;
  tokenAVault?: AccountData<TokenAccount>;
  tokenBVault?: AccountData<TokenAccount>;
}) {
  const tokenAAmount = Decimal.fromVaultAndToken(tokenAVault, tokenA).toFormat(
    Decimal.FORMAT_TOKEN,
    tokenA.asset?.decimals
  );

  const tokenBAmount = Decimal.fromVaultAndToken(tokenBVault, tokenB).toFormat(
    Decimal.FORMAT_TOKEN,
    tokenB.asset?.decimals
  );

  return (
    <InlineData
      title="Pool Liquidity"
      main={
        <>
          <LabeledText
            label={`Token ${tokenA.asset?.symbol} Pool`}
            content={`${tokenAAmount} ${tokenA.asset?.symbol}`}
          />
          <LabeledText
            label={`Token ${tokenB.asset?.symbol} Pool`}
            content={`${tokenBAmount} ${tokenB.asset?.symbol}`}
          />
        </>
      }
    />
  );
}

export default PoolLiquidity;
