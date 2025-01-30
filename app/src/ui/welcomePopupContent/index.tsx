import { makeStyles } from "@mui/styles";
import { Box, Typography } from "@mui/material";
import { Hydraswap } from "../icons";

const useStyles = makeStyles({
  welcomeWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "24px 0",
  },
  hydraIcon: {
    width: "108px",
    height: "108px",
  },
  description: {
    fontSize: "20px !important",
    lineHeight: "1 !important",
    marginTop: "24px",
    textAlign: "center",
  },
  subDescription: {
    fontSize: "15px !important",
    lineHeight: "1 !important",
    marginTop: "24px",
    textAlign: "center",
  },
  buttonWrapper: {
    display: "flex",
    justifyContent: "space-around",
    marginTop: "24px",
    width: "100%",
    "@media screen and (max-width: 440px)": {
      flexDirection: "column",
      "& button": {
        "&:first-of-type": {
          marginBottom: "12px",
        },
      },
    },
  },
});

const WelcomePopupContent = ({
  title,
  content,
  callToAction,
}: {
  title: string;
  content: string;
  callToAction: JSX.Element;
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.welcomeWrapper}>
      <Hydraswap className={classes.hydraIcon} />
      <Typography className={classes.description}>{title}</Typography>
      <Typography className={classes.subDescription}>{content}</Typography>
      <Box className={classes.buttonWrapper}>{callToAction}</Box>
    </Box>
  );
};

export default WelcomePopupContent;
