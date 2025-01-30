import LabeledText from "@ui/hydraPage/textWrapper";
import InlineData from "@ui/inlineData";

function DisplayCValue({ cValue }: { cValue: number }) {
  return (
    <InlineData
      title="Compensation Parameter"
      main={<LabeledText label="cValue Amount" content={cValue / 100} />}
    />
  );
}

export default DisplayCValue;
