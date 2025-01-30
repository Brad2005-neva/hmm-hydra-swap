import { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import cn from "classnames";

import { palette, alpha } from "@utils/palette";

const useStyles = makeStyles({
  infoCellWrapper: {
    display: "flex",
    flexDirection: "column",
    margin: "0 12px",
    "&:first-child": {
      marginLeft: 0,
    },
    "&:last-child": {
      marginRight: 0,
    },
    "@media (max-width: 600px)": {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      margin: "0 0 12px 0",
      width: "100% !important",
      "& > p:first-of-type": {
        marginRight: "0 !important",
        marginBottom: "0 !important",
      },
    },
  },
  itemLabel: {
    display: "flex",
    alignItems: "center",
    marginBottom: "8px !important",
    "& span": {
      color: `${palette.white}${alpha[65]}`,
      fontSize: "14px",
      lineHeight: "16px",
    },
    "& svg": {
      fill: `${palette.white}${alpha[85]}`,
      width: "16px",
      height: "16px",
      marginLeft: "2px",
    },
  },
  itemContent: {
    color: palette.white,
    fontSize: "16px",
    lineHeight: "20px",
    "& span": {
      color: `${palette.white}${alpha[65]}`,
      display: "block",
      fontSize: "14px",
      marginTop: "4px",
    },
    "@media (max-width: 600px)": {
      fontSize: "18px",
      fontWeight: "500",
      lineHeight: "22px",
    },
  },
  alignRight: {
    alignItems: "flex-end",
  },
});

function InfoCell({
  align,
  title,
  icon,
  children,
}: {
  align: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode | string;
}) {
  const classes = useStyles();

  return (
    <Box
      className={cn(classes.infoCellWrapper, {
        [classes.alignRight]: align === "right",
      })}
    >
      <Typography className={classes.itemLabel}>
        <span>{title}</span>
        {icon}
      </Typography>
      <Typography className={classes.itemContent} aria-label={title}>
        {children}
      </Typography>
    </Box>
  );
}

export default InfoCell;
