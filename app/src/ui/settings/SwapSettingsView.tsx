import { Box, Typography, InputAdornment } from "@mui/material";
import cn from "classnames";
import NumericField from "@components/numericField";
import { SlippageButton } from "./SlippageButton";
import { makeStyles } from "@mui/styles";

import { palette, alpha } from "@utils/palette";
export const useStyles = makeStyles({
  typography: {
    color: `${palette.white} !important`,
    lineHeight: "16px !important",
    opacity: "0.6",
  },
  optionWrapper: {
    display: "flex",
    marginTop: "13px",
    justifyContent: "space-between",
    "& button": {
      border: `1px solid ${palette.white}${alpha[25]}`,
      borderRadius: "4px",
      color: palette.white,
      fontSize: "18px",
      fontWeight: "400",
      height: "48px",
      padding: "14px 6px",
      width: "70px",
      marginTop: "12px",
      marginRight: "12px",
      "&:last-of-type": {
        marginRight: "24px",
      },
    },
    "@media (max-width: 600px)": {
      flexWrap: "wrap",
      "& button": {
        marginRight: "0 !important",
        width: "30%",
      },
    },
  },
  optionActive: {
    background: `linear-gradient(88.14deg, ${palette.purple.primary} 16.49%, ${palette.green.primary} 86.39%)`,
    border: "none !important",
  },
  optionInput: {
    background: palette.gray.secondary,
    borderRadius: "6px",
    marginTop: "12px",
    "& .MuiInputBase-root": {
      padding: "0 16px 0 0",
      height: "48px",
      "& fieldset": {
        display: "none",
      },
    },
    "& input": {
      color: palette.white,
      fontSize: "18px",
      fontWeight: "400",
      padding: "14px 8px 14px 16px",
    },
    "& .MuiInputAdornment-root": {
      marginLeft: "4px",
      "& p": {
        color: palette.white,
        fontSize: "18px",
        fontWeight: "400",
        lineHeight: "21px",
      },
    },
    "&::before": {
      content: "''",
      position: "absolute",
      top: "1px",
      right: "1px",
      bottom: "1px",
      left: "1px",
      background: palette.darkBlue.primary,
      borderRadius: "6px",
    },
    "@media (max-width: 600px)": {
      order: "-1",
      width: "100%",
    },
  },
  inputError: {
    background: palette.red.primary,
  },
  inputActive: {
    background: `linear-gradient(88.14deg, ${palette.purple.primary} 16.49%, ${palette.green.primary} 86.39%)`,
  },
  error: {
    color: `${palette.red.primary} !important`,
    lineHeight: "16px !important",
    marginTop: "16px",
  },
});

export function SwapSettingsView({
  slippage,
  isError,
  buttons,
  onSlippageButtonClicked,
  onSlippageChanged,
}: {
  slippage: bigint;
  isError: boolean;
  buttons: { label: string; value: bigint }[];
  onSlippageButtonClicked: (amount: bigint) => void;
  onSlippageChanged: (amount: number) => void;
}) {
  const classes = useStyles();

  return (
    <>
      <Typography className={classes.typography}>Slippage Tolerance</Typography>
      <Box className={classes.optionWrapper}>
        {buttons.map(({ label, value }) => (
          <SlippageButton
            className={cn({
              [classes.optionActive]: slippage === value,
            })}
            amount={value}
            onClick={onSlippageButtonClicked}
          >
            {label}
          </SlippageButton>
        ))}
        <NumericField
          aria-label="Slippage Fee"
          className={cn(classes.optionInput, {
            [classes.inputError]: isError,
            [classes.inputActive]: !isError,
          })}
          hiddenLabel
          InputProps={{
            endAdornment: <InputAdornment position="end">%</InputAdornment>,
          }}
          value={Number(slippage) / 100}
          onChange={onSlippageChanged}
        />
      </Box>
      {isError && (
        <Typography className={classes.error}>
          Enter a valid slippage percentage
        </Typography>
      )}
    </>
  );
}
