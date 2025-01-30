import { AccountData, Decimal, TokenMint } from "@hydraprotocol/sdk";
import InlineData from "@ui/inlineData";
import LabeledText from "@ui/hydraPage/textWrapper";

function BurntTokens({
  lpTokensToBurn,
  lpTokenMint,
}: {
  lpTokensToBurn: bigint;
  lpTokenMint?: AccountData<TokenMint>;
}) {
  const burntTokens = Decimal.fromAmountAndMint(
    lpTokensToBurn,
    lpTokenMint
  ).toFormat(Decimal.FORMAT_TOKEN, lpTokenMint?.account.data.decimals || 9);
  return (
    <InlineData
      title="LP tokens to be burnt"
      main={<LabeledText label="Burnt Tokens Amount" content={burntTokens} />}
    />
  );
}

export default BurntTokens;
