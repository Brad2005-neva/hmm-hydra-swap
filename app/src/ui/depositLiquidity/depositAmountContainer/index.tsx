import { makeStyles } from "@mui/styles";
import DepositLiquidityAmount from "../depositLiquidityAmount";
import { Plus } from "../../icons";
import { TokenField } from "@hydraprotocol/services";
import { palette } from "@utils/palette";

const useStyles = makeStyles({
  svgPlus: {
    color: palette.white,
    width: "16px",
    height: "16px",
    margin: "20px 0",
    alignSelf: "center",
  },
});

const AmountDetailContainer = ({
  tokenA,
  tokenB,
  tokenABalance,
  tokenBBalance,
  setMaxFromBalance,
  setMaxToBalance,
  setFocus,
}: {
  tokenA: TokenField;
  tokenABalance: bigint;
  tokenB: TokenField;
  tokenBBalance: bigint;
  setMaxFromBalance(): void;
  setMaxToBalance(): void;
  setFocus(position: "from" | "to"): void;
}) => {
  const classes = useStyles();

  return (
    <>
      <DepositLiquidityAmount
        token={tokenA}
        tokenBalance={tokenABalance}
        setMaxBalance={setMaxFromBalance}
        setFocus={() => setFocus("from")}
        autoFocus
      />
      <Plus className={classes.svgPlus} />
      <DepositLiquidityAmount
        token={tokenB}
        tokenBalance={tokenBBalance}
        setMaxBalance={setMaxToBalance}
        setFocus={() => setFocus("to")}
      />
    </>
  );
};

export default AmountDetailContainer;
