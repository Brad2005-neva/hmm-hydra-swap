import { makeStyles } from "@mui/styles";
import { Box, Typography } from "@mui/material";
import { useWallet } from "@hydraprotocol/services";

import HydraButton from "@ui/hydraButton";
import { useFlow } from "@components/flows";

const useStyles = makeStyles({
  buttonWapper: {
    marginTop: "20px",
    width: "100%",
  },
});

export const SwapButton = ({
  content,
  disabled,
  onConfirm,
}: {
  content: string;
  disabled: boolean;
  onConfirm: () => void;
}) => {
  const classes = useStyles();

  const { connected } = useWallet();
  const { startWalletFlow } = useFlow();

  return (
    <Box className={classes.buttonWapper}>
      {connected ? (
        <HydraButton
          kind="primary"
          size="large"
          aria-label="Trigger Swap"
          fullWidth
          disabled={disabled}
          onClick={onConfirm}
        >
          <Typography>{content}</Typography>
        </HydraButton>
      ) : (
        <HydraButton
          kind="primary"
          size="large"
          aria-label="Connect wallet from content section"
          fullWidth
          onClick={startWalletFlow}
        >
          <Typography>Connect Wallet</Typography>
        </HydraButton>
      )}
    </Box>
  );
};
