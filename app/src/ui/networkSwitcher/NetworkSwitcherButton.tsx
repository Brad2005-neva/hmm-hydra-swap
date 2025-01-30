import { ReactNode, useCallback } from "react";
import { Button } from "@mui/material";
import { Check } from "../icons";
import { Network } from "@hydraprotocol/sdk";

export function NetworkSwitcherButton({
  onClick,
  name,
  network,
  showCheck,
}: {
  showCheck: boolean;
  network: Network;
  name: ReactNode;
  onClick: (network: Network) => void;
}) {
  const handleClick = useCallback(() => {
    onClick(network);
  }, [onClick, network]);

  return (
    <Button onClick={handleClick}>
      <span>{name}</span>
      {showCheck && <Check />}
    </Button>
  );
}
