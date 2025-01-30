import { FC, useEffect, useRef } from "react";

import generateIdenticon from "@metamask/jazzicon";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles({
  identiconWrapper: {
    display: "flex",
    borderRadius: "50%",
    marginBottom: "16px",
  },
});

interface WalletIconProps {
  address?: string | PublicKey;
  diameter?: number;
}

export const WalletIcon: FC<WalletIconProps> = (props) => {
  const classes = useStyles();
  const address =
    typeof props.address === "string"
      ? props.address
      : props.address?.toBase58();
  const diameter = props.diameter ?? 56;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (address && ref.current) {
      ref.current.innerHTML = "";
      ref.current.appendChild(
        generateIdenticon(
          diameter,
          parseInt(bs58.decode(address).toString().slice(5, 15), 16)
        )
      );
    }
  }, [address, diameter]);

  return (
    <div
      className={classes.identiconWrapper}
      ref={ref}
      style={{ width: diameter, height: diameter }}
    />
  );
};
