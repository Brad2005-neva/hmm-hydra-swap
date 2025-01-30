import { Grid, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";

import IconPopover from "../iconPopover";
import QuestionIcon from "../iconPopover/QuestionIcon";
import { palette } from "../../utils/palette";
import { getErrorContent } from "../../utils/errors";

const useStyles = makeStyles({
  errorWrapper: {
    display: "flex",
    alignItems: "center",
    marginBottom: "27px",
  },
  error: {
    color: palette.red.primary,
  },
});

const ErrorDetail = ({ error }: { error: string }) => {
  const classes = useStyles();

  const message = getErrorContent(error);

  if (message)
    return (
      <Grid className={classes.errorWrapper}>
        <Typography
          className={classes.error}
          component="span"
          aria-label="Transaction Error"
        >
          {message}
        </Typography>
        <IconPopover
          icon={<QuestionIcon size="small" color={palette.red.primary} />}
          content={error}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        />
      </Grid>
    );
  else return <></>;
};

export default ErrorDetail;
