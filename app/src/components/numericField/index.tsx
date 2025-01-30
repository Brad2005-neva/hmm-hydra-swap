import { useNumericField } from "@hydraprotocol/services";
import {
  NumericFieldInput,
  NumericFieldInputProps,
} from "@ui/numericFieldInput";

function NumericField({
  value,
  decimals,
  onFocus,
  onChange,
  fullWidth = true,
  ...props
}: NumericFieldInputProps) {
  const numericProps = useNumericField({ value, decimals, onFocus, onChange });

  return (
    <NumericFieldInput fullWidth={fullWidth} {...numericProps} {...props} />
  );
}

export default NumericField;
