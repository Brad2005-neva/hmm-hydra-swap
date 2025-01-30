import { Decimal, PoolFeeType } from "@hydraprotocol/sdk";
import InlineData from "@ui/inlineData";
import { COMPUTE_SCALE } from "@utils/constants";
import LabeledText from "@ui/hydraPage/textWrapper";

interface SwapFeeProps {
  fee: bigint;
  feeType?: PoolFeeType;
  tabIndex?: number;
}

const FEEMAP: { [key in PoolFeeType]: string } = {
  Percent: "Percent fee",
  VolatilityAdjusted: "Volatility Adjusted Fee",
};

function SwapFee({ fee, feeType, tabIndex }: SwapFeeProps) {
  const feeAmount = Decimal.from(fee, COMPUTE_SCALE)
    .mul(Decimal.from(100n))
    .toString();

  return (
    <InlineData
      title="Swap Fee"
      main={<LabeledText label="Exchange Fee Text" content={`${feeAmount}%`} />}
      tipContent={feeType && FEEMAP[feeType]}
      ariaLabel="Swap Fee Popover"
      tabIndex={tabIndex}
    />
  );
}

export default SwapFee;
