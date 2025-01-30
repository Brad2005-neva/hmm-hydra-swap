import { Box, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { FC, ReactNode } from "react";
import { palette, alpha } from "@utils/palette";

const useStyles = makeStyles({
  wrapper: {
    background: palette.darkBlue.primary,
    borderRadius: "6px",
    display: "flex",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    color: `${palette.white}${alpha[65]}`,
    padding: "12px 0 12px 24px",
    marginBottom: "20px",
    marginTop: "17px",
    "@media (max-width: 600px)": {
      flexDirection: "column",
      alignItems: "flex-start",
      padding: "12px 0 12px 16px",
    },
  },
});

export const PageMessage: FC<{ message: string | ReactNode }> = ({
  message,
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.wrapper} aria-label="Page Message">
      <Typography>{message}</Typography>
    </Box>
  );
};

export default PageMessage;
