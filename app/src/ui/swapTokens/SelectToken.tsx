import { FC } from "react";
import { makeStyles } from "@mui/styles";
import { Box, Button, ButtonProps, Typography } from "@mui/material";
import { useWallet, TokenField } from "@hydraprotocol/services";
import cn from "classnames";

import HYSD from "@assets/images/symbols/hysd.png";
import { CaretDown } from "@ui/icons";
import HydraButton from "@ui/hydraButton";
import { palette, alpha } from "@utils/palette";

const useStyles = makeStyles({
  tokenContainer: {
    flex: "0 0 120px",
    "& .MuiButton-root": {
      "& p": {
        flexGrow: 1,
        fontSize: "16px !important",
        textAlign: "left",
      },
    },
  },
  tokenButton: {
    backgroundColor: palette.gray.dark,
    borderRadius: "6px !important",
    flex: "0 0 120px",
    padding: "8px 10px !important",
    "& p": {
      color: palette.white,
      fontWeight: "400",
      lineHeight: "24px",
      flexGrow: 1,
      textAlign: "left",
    },
    "& > *": {
      position: "relative",
    },
    "&:hover": {
      background: `linear-gradient(88.14deg, ${palette.purple.primary} 16.49%, ${palette.green.primary} 86.39%)`,
      "&::before": {
        content: "''",
        position: "absolute",
        top: "1px",
        right: "1px",
        bottom: "1px",
        left: "1px",
        background: palette.gray.dark,
        borderRadius: "6px",
      },
    },
  },
  svgCaretDown: {
    width: "12px !important",
    height: "8px !important",
    fill: `${palette.white}${alpha[45]}`,
  },
  buttonImgWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
    marginRight: "4px",
    "& img": {
      maxWidth: "100%",
      maxHeight: "100%",
    },
  },
  noToken: {
    background: `linear-gradient(88.14deg, ${palette.purple.primary} 16.49%, ${palette.green.primary} 86.39%)`,
    "&::before": {
      background: "transparent",
    },
  },
});

interface SelectTokenProps extends Omit<ButtonProps, "type"> {
  type?: "button" | "reset" | "submit";
  token: TokenField;
  changeToken(): void;
}

const SelectToken: FC<SelectTokenProps> = ({
  type,
  token,
  changeToken,
  ...rest
}) => {
  const classes = useStyles();

  const { connected } = useWallet();

  return (
    <Box className={classes.tokenContainer} tabIndex={rest.tabIndex}>
      {token.asset ? (
        <Button
          type={type}
          {...rest}
          className={cn(classes.tokenButton, {
            [classes.noToken]: !token.asset,
          })}
          disableRipple={true}
          fullWidth
          onClick={changeToken}
          disabled={!connected}
        >
          <Box className={classes.buttonImgWrapper}>
            <img
              src={
                token.asset.symbol.includes("HYD") ? HYSD : token.asset.logoURI
              }
              alt="Asset"
            />
          </Box>
          <Typography>{token.asset.symbol}</Typography>
          <CaretDown className={classes.svgCaretDown} />
        </Button>
      ) : (
        <HydraButton
          {...rest}
          kind="primary"
          size="small"
          fullWidth
          onClick={changeToken}
          disabled={!connected}
        >
          <Typography>Select</Typography>
          <CaretDown className={classes.svgCaretDown} />
        </HydraButton>
      )}
    </Box>
  );
};

export default SelectToken;
