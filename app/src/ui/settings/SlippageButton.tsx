import { useCallback, ReactNode } from "react";
import { Button } from "@mui/material";

export function SlippageButton({
  children,
  className,
  amount,
  onClick,
}: {
  amount: bigint;
  className?: string;
  children: ReactNode;
  onClick?: (amount: bigint) => void;
}) {
  const handleClick = useCallback(() => {
    onClick && onClick(amount);
  }, [onClick, amount]);
  return (
    <Button className={className} onClick={handleClick}>
      {children}
    </Button>
  );
}
