import React, { useCallback, useEffect, useState } from "react";

export type NumericFieldProps = {
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  value: number;
  decimals?: number;
  onChange?: (inputValue: number) => void;
};

export function useNumericField({
  value: inputValue,
  decimals,
  onFocus: inputOnFocus,
  onChange: inputOnChange,
}: NumericFieldProps) {
  const [draftMode, setDraftMode] = useState(false);
  const [localState, setLocalState] = useState("0");
  const [internalError, setError] = useState("");

  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError("");

      const rawValue = e.target.value;
      const allowedString = rawValue.replace(/[^0-9\\.]/, "");
      setLocalState(allowedString);
      const num = Number(allowedString);
      if (!isNaN(num)) {
        inputOnChange && inputOnChange(num);
      }
    },
    [inputOnChange]
  );

  const onBlur = useCallback(() => {
    const num = Number(localState);
    if (isNaN(num)) {
      setError("Number is not valid");
      return;
    }
    inputOnChange && inputOnChange(num);
    setDraftMode(false);
    setLocalState(inputValue.toString());
  }, [localState, inputValue, inputOnChange]);

  const onFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setTimeout(() => {
        setDraftMode(true);
        inputOnFocus && inputOnFocus(e);
      }, 100);
    },
    [inputOnFocus]
  );

  useEffect(() => {
    if (!draftMode && !internalError) setLocalState(inputValue.toString());
  }, [inputValue, draftMode, internalError]);

  const value = draftMode
    ? localState
    : inputValue.toLocaleString("en-US", {
        useGrouping: false,
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
      });

  const error = !!internalError;
  return {
    error,
    value,
    onChange,
    onBlur,
    onFocus,
  };
}
