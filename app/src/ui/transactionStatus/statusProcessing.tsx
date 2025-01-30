import { makeStyles } from "@mui/styles";
import { Box, Typography } from "@mui/material";

import { palette, alpha } from "@utils/palette";
import Loader from "@ui/loader";

const useStyles = makeStyles({
  swapContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    "& > p": {
      marginBottom: "16px",
    },
    "& > span": {
      color: `${palette.white}${alpha[85]}`,
      fontSize: "14px",
      lineHeight: "17px",
      marginBottom: "16px",
    },
  },
});

export const StatusProcessing = ({ content }: { content: string }) => {
  const classes = useStyles();

  return (
    <Box className={classes.swapContent}>
      <Loader />
      <Typography>Waiting For Confirmation</Typography>
      <Typography component="span">{content}</Typography>
      <Typography component="span">
        Confirm this transaction in your wallet
      </Typography>
    </Box>
  );
};
