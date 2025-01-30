import { Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

import NumericField from "@components/numericField";
import HydraSlider from "../../hydraSlider";
import { alpha, palette } from "@utils/palette";

const useStyles = makeStyles({
  typography: {
    marginBottom: "10px",
  },
  numericField: {
    "& > .MuiInputBase-root": {
      border: `1px solid ${palette.white}${alpha[5]}`,
      borderRadius: "6px",
      marginBottom: "8px",
      "& input": {
        color: palette.white,
        fontSize: "20px",
        lineHeight: "24px",
        height: "24px",
        padding: "16px",
      },
      "& fieldset": {
        display: "none",
      },
    },
  },
});

const WithdrawLiquidityAmount = ({
  percent,
  setPercent,
}: {
  percent: bigint;
  setPercent(value: bigint): void;
}) => {
  const classes = useStyles();

  return (
    <div aria-label="Withdraw Liquidity Setting">
      <Typography className={classes.typography}>Percentage</Typography>
      <NumericField
        aria-label="Withdraw Liquidity input"
        className={classes.numericField}
        fullWidth={true}
        value={Number(percent) / 100}
        onChange={(num) => {
          setPercent(BigInt((num > 100 ? 100 : num) * 100));
        }}
        autoFocus
      />
      <HydraSlider value={percent} onChange={setPercent} />
    </div>
  );
};

export default WithdrawLiquidityAmount;
