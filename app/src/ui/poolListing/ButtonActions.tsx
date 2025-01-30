import ButtonContainer from "../hydraPage/buttonContainer";
import HydraButton from "../hydraButton";
import { useWallet } from "@hydraprotocol/services";

import { Typography } from "@mui/material";
import { useFlow } from "@components/flows";

type ButtonActionsProps = {
  showWithdraw?: boolean;
  onDepositClicked: () => void;
  onWithdrawClicked: () => void;
};
export function ButtonActions({
  showWithdraw,
  onDepositClicked,
  onWithdrawClicked,
}: ButtonActionsProps) {
  const { connected: walletConnected } = useWallet();
  const { startWalletFlow } = useFlow();

  return (
    <ButtonContainer>
      <HydraButton
        kind="primary"
        size="small"
        onClick={walletConnected ? onDepositClicked : startWalletFlow}
      >
        <Typography>
          {walletConnected ? "Deposit" : "Connect to Deposit"}
        </Typography>
      </HydraButton>
      {showWithdraw && (
        <HydraButton kind="secondary" size="small" onClick={onWithdrawClicked}>
          <Typography>Withdraw</Typography>
        </HydraButton>
      )}
    </ButtonContainer>
  );
}
