import React, { FC } from "react";
import { makeStyles } from "@mui/styles";
import { Tabs as MuiTabs } from "@mui/material";
import { Tab as MuiTab } from "@mui/material";

import { palette, alpha } from "@utils/palette";

const useStyles = makeStyles({
  tabs: {
    borderBottom: `1px solid ${palette.white}${alpha[5]}`,
    marginBottom: "14px",
    "& .MuiTabs-scroller": {
      "& .MuiTabs-flexContainer": {
        "& .MuiTab-root": {
          color: `${palette.white}${alpha[65]}`,
          fontSize: "16px",
          fontWeight: 400,
          lineHeight: "19px",
          padding: 0,
          margin: "12px 12px",
          minWidth: "initial",
          minHeight: "initial",
          textTransform: "capitalize",
          "&.Mui-selected": {
            color: palette.green.primary,
          },
          "& span": {
            display: "none",
          },
          "&:first-of-type": {
            marginLeft: 0,
          },
          "&:last-of-type": {
            marginRight: 0,
          },
        },
        "@media (max-width: 600px)": {
          justifyContent: "space-between",
          width: "100%",
        },
      },
      "& .MuiTabs-indicator": {
        display: "flex",
        justifyContent: "center",
        backgroundColor: "transparent",
        "& .MuiTabs-indicatorSpan": {
          maxWidth: "32px",
          width: "100%",
          background: `linear-gradient(88.14deg, ${palette.purple.primary} 16.49%, ${palette.green.primary} 86.39%)`,
        },
      },
    },
    "@media (max-width: 600px)": {
      marginBottom: "6px",
    },
  },
});

interface TabsProps {
  tab: number;
  onChange(event: React.SyntheticEvent, newValue: number): void;
  children: JSX.Element | (JSX.Element | null)[];
}

export const Tabs: FC<TabsProps> = ({ tab, onChange, children }) => {
  const classes = useStyles();

  return (
    <MuiTabs
      className={classes.tabs}
      value={tab}
      onChange={onChange}
      TabIndicatorProps={{
        children: <span className="MuiTabs-indicatorSpan" />,
      }}
    >
      {children}
    </MuiTabs>
  );
};

export const Tab = MuiTab;
