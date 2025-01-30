import React, { FC, useState } from "react";
import { Menu, IconButton } from "@mui/material";
import { makeStyles } from "@mui/styles";
import cn from "classnames";

import { CaretDown, Wallet as WalletSVG } from "../icons";
import { alpha, palette } from "@utils/palette";

const useStyles = makeStyles({
  tokensButton: {
    backgroundColor: palette.gray.dark,
    borderRadius: "6px",
    padding: "12px",
    marginRight: "8px",
    "& > svg": {
      fill: `${palette.white}${alpha[85]}`,
      position: "relative",
      "&:last-of-type": {
        fill: `${palette.white}${alpha[45]}`,
        marginLeft: "16px",
        width: "9px",
        height: "6px",
      },
    },
    "&::before": {
      content: "''",
      position: "absolute",
      top: "1px",
      right: "1px",
      bottom: "1px",
      left: "1px",
      borderRadius: "6px",
      background: palette.darkBlue.secondary,
    },
    "&:hover": {
      background: `linear-gradient(88.14deg, ${palette.purple.primary} 16.49%, ${palette.green.primary} 86.39%)`,
    },
    "@media (max-width: 600px)": {
      padding: "8px 7px",
      marginRight: "16px",
      "& > svg": {
        width: "18px",
        height: "16px",
        "&:last-of-type": {
          display: "none",
        },
      },
    },
  },
  activeTokensButton: {
    background: `linear-gradient(88.14deg, ${palette.purple.primary} 16.49%, ${palette.green.primary} 86.39%)`,
  },
  tokensWrapper: {
    "& .MuiPaper-root": {
      backgroundColor: "initial",
      marginTop: "4px",
    },
    "& .MuiList-root": {
      background: `linear-gradient(180deg, ${palette.green.light}${alpha[25]} 0%, ${palette.blue.light}${alpha[0]} 100%)`,
      borderRadius: "6px",
      padding: "1px",
    },
  },
});

interface ListMenuProps {
  onOpen: () => void;
}

export const ListMenu: FC<ListMenuProps> = ({ children, onOpen }) => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const tokenListOpen = Boolean(anchorEl);

  const handleOpenTokenList = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    onOpen();
  };

  const handleCloseTokenList = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        aria-label="View wallet"
        className={cn(classes.tokensButton, {
          [classes.activeTokensButton]: tokenListOpen,
        })}
        onClick={handleOpenTokenList}
      >
        <WalletSVG />
        <CaretDown />
      </IconButton>
      <Menu
        className={classes.tokensWrapper}
        anchorEl={anchorEl}
        open={tokenListOpen}
        onClose={handleCloseTokenList}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {children}
      </Menu>
    </>
  );
};
