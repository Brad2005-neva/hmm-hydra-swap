import React from "react";
import { makeStyles } from "@mui/styles";
import { TextField, TextFieldProps } from "@mui/material";
import { palette } from "@utils/palette";

const useStyles = makeStyles({
  textField: {
    "& > .MuiInputBase-root": {
      paddingLeft: "8px",
      paddingRight: "8px",
      "& input": {
        "&.Mui-disabled": {
          textFillColor: "#FFF",
        },
        color: palette.white,
        padding: 0,
        fontSize: "16px",
        fontWeight: "500",
      },
      "& > fieldset": {
        display: "none",
      },
    },
  },
});

export type NumericFieldInputProps = Omit<
  TextFieldProps,
  "onFocus" | "value" | "onChange"
> & {
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  value: number;
  decimals?: number;
  onChange?: (value: number) => void;
};

export function NumericFieldInput({
  fullWidth = true,
  ...props
}: TextFieldProps) {
  const classes = useStyles();

  return (
    <TextField className={classes.textField} fullWidth={fullWidth} {...props} />
  );
}
