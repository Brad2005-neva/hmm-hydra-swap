import { Box, Typography } from "@mui/material";
import { DefaultTheme, makeStyles } from "@mui/styles";
import { Asset, Decimal } from "@hydraprotocol/sdk";
import { palette, alpha } from "@utils/palette";
import HYSD from "@assets/images/symbols/hysd.png";
import ButtonContainer from "../hydraPage/buttonContainer";
import HydraButton from "../hydraButton";

interface Props {
  isWallet?: boolean;
}

const useStyles = makeStyles<DefaultTheme, Props>({
  tokensContent: {
    background: palette.darkBlue.primary,
    borderRadius: "5px",
    width: "300px",
    "& > p": {
      borderBottom: `1px solid ${palette.white}${alpha[5]}`,
      color: `${palette.white}${alpha[85]}`,
      fontSize: "18px",
      lineHeight: "21px",
      padding: "15px 23px",
    },
  },
  tokensList: {
    padding: "0 23px",
    maxHeight: ({ isWallet }) => (isWallet ? "300px" : undefined),
    overflowY: "auto",
    "@media (max-width: 600px)": {
      maxHeight: "600px",
    },
  },
  tokenItem: {
    borderBottom: `1px solid ${palette.white}${alpha[5]}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "16px 0",
    "& > img": {
      width: "32px",
      height: "32px",
      marginRight: "10px",
    },
    "& > div": {
      "& > p": {
        "&:first-of-type": {
          color: palette.white,
          fontSize: "14px",
          fontWeight: "500",
          lineHeight: "17px",
          marginBottom: "4px",
        },
      },
    },
    "&:last-of-type": {
      borderBottom: "none",
    },
  },
  tokenImgWrapper: {
    display: "flex",
    alignItmes: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    marginRight: "10px",
    "& > img": {
      maxWidth: "100%",
      maxHeight: "100%",
    },
  },
  poolButtons: {
    display: "flex",
    justifyContent: "flex-end",
    flexGrow: 1,
    "& .MuiButton-root": {
      width: "112px",
      "& > p": {
        fontWeight: 500,
      },
      "&:last-of-type": {
        marginLeft: "12px",
      },
    },
    "@media (max-width: 600px)": {
      width: "calc(100% - 16px)",
      "& .MuiButton-root": {
        flexGrow: 1,
      },
    },
  },
});

function WalletTokensList({
  title,
  tokens,
  isWallet,
}: {
  title?: string;
  tokens: Asset[];
  isWallet: boolean;
}) {
  const classes = useStyles({ isWallet });

  return (
    <Box className={classes.tokensContent}>
      <Typography>{title}</Typography>
      <Box className={classes.tokensList}>
        {tokens.map((token: Asset) => (
          <Box
            data-aria-label={`${token.symbol} balance`}
            className={classes.tokenItem}
            key={token.symbol}
          >
            <span className={classes.tokenImgWrapper}>
              <img
                src={token.symbol.includes("HYD") ? HYSD : token.logoURI}
                alt="Token"
              />
            </span>
            <Box>
              <Typography>
                {Decimal.fromAsset(token).toFormat(
                  Decimal.FORMAT_TOKEN,
                  token.decimals
                )}{" "}
                {token.symbol}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function PageTokensList({
  tokens,
  disabled,
  onClick,
  buttonText,
}: {
  tokens: Asset[];
  onClick?: (token: Asset) => void;
  disabled?: boolean;
  buttonText?: string;
}) {
  const classes = useStyles({});

  return (
    <Box className={classes.tokensList}>
      {tokens.map((token: Asset) => (
        <Box
          data-aria-label={`${token.symbol} balance`}
          className={classes.tokenItem}
          key={token.address}
        >
          <span className={classes.tokenImgWrapper}>
            <img src={token.logoURI || HYSD} alt={token.symbol} />
          </span>
          <Box>
            <Typography>
              {`${Decimal.from(
                token.balance || 0n,
                BigInt(token.decimals || 8)
              ).toFormat(Decimal.FORMAT_TOKEN, token.decimals)} ${
                token.symbol
              }`}
            </Typography>
          </Box>
          <ButtonContainer>
            <HydraButton
              kind="primary"
              size="small"
              disabled={disabled}
              onClick={() => onClick && onClick(token)}
            >
              <Typography>{buttonText}</Typography>
            </HydraButton>
          </ButtonContainer>
        </Box>
      ))}
    </Box>
  );
}

function TokensList({
  tokens,
  title,
  isWallet = false,
  disabled,
  onClick,
  buttonText,
}: {
  tokens: Asset[];
  title?: string;
  isWallet?: boolean;
  disabled?: boolean;
  onClick?: (token: Asset) => void;
  buttonText?: string;
}) {
  return isWallet ? (
    <WalletTokensList title={title} tokens={tokens} isWallet={isWallet} />
  ) : (
    <PageTokensList
      tokens={tokens}
      disabled={disabled}
      onClick={onClick}
      buttonText={buttonText}
    />
  );
}
export default TokensList;
