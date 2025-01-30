import { Grid, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ReactNode } from "react";
import IconPopover from "../iconPopover";
import QuestionIcon from "../iconPopover/QuestionIcon";
import { palette, alpha } from "@utils/palette";

const useStyles = makeStyles({
  container: {
    display: "flex",
    color: `${palette.white}${alpha[85]}`,
    justifyContent: "space-between",
    marginBottom: "10px",
    "& p": {
      fontSize: "14px",
      lineHeight: "17px",
    },
  },
  titleWrapper: {
    display: "flex",
  },
  amountBox: {
    color: palette.white,
    textAlign: "end",
  },
});

function InlineData({
  title,
  main,
  tipContent,
  tabIndex,
  ariaLabel,
}: {
  title: string;
  main: ReactNode;
  tipContent?: string;
  tabIndex?: number;
  ariaLabel?: string;
}) {
  const classes = useStyles();

  return (
    <Grid className={classes.container}>
      <Grid className={classes.titleWrapper}>
        <Typography>{title}</Typography>
        {tipContent && (
          <IconPopover
            icon={<QuestionIcon size="small" />}
            content={tipContent}
            ariaLabel={ariaLabel}
            tabIndex={tabIndex}
          />
        )}
      </Grid>
      <Grid className={classes.amountBox}>{main}</Grid>
    </Grid>
  );
}

export default InlineData;
