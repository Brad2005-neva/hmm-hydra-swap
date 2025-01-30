import { ReactNode } from "react";
import { makeStyles } from "@mui/styles";
import { Box, Typography } from "@mui/material";
import Banner from "@assets/images/pools/banner.png";
import { palette, alpha } from "@utils/palette";
import { CaretDown } from "../../icons";

const useStyles = makeStyles({
  poolsContainer: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    maxWidth: "1100px",
  },
  poolsBanner: {
    background: `${palette.white}${alpha[2]}`,
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    height: "200px",
    width: "100%",
    "@media (max-width: 800px)": {
      flexDirection: "column",
      height: "initial",
      padding: "20px 24px",
      width: "calc(100% - 48px)",
    },
  },
  bannerLeft: {
    backgroundImage: `url(${Banner})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
    flexGrow: 1,
    display: "flex",
    alignItems: "center",
    position: "relative",
    height: "100%",
    "@media (max-width: 800px)": {
      background: "none",
      justifyContent: "center",
      width: "100%",
      paddingBottom: "20px",
    },
    "@media (max-width: 600px)": {
      justifyContent: "flex-start",
      paddingBottom: "0",
    },
  },
  bannerIcon: {
    position: "relative",
    padding: "12px",
    margin: "0 50px",
    "& > svg": {
      width: "97px",
      height: "97px",
    },
    "&::before": {
      content: "''",
      position: "absolute",
      width: "80%",
      height: "80%",
      top: "10%",
      left: "10%",
      background:
        "linear-gradient(226deg, #2FE4C9 15.08%, #39B5F1 29.84%, #6C83E1 56.57%, #CF489D 86.03%)",
      opacity: "0.4",
      filter: "blur(24px)",
    },
    "@media (max-width: 1400px)": {
      margin: "0 20px",
      "& > svg": {
        width: "78px",
        height: "78px",
      },
    },
    "@media (min-width: 801px) and (max-width: 1100px)": {
      display: "none",
    },
    "@media (max-width: 600px)": {
      display: "none",
    },
  },
  bannerTitle: {
    maxWidth: "250px",
    "& > p": {
      lineHeight: "24px",
      "&:first-of-type": {
        color: palette.green.primary,
        fontSize: "32px",
        fontWeight: "700",
        marginBottom: "24px",
        "& svg": {
          color: palette.gray.primary,
          width: "20px",
          height: "20px",
          "@media (min-width: 601px)": {
            display: "none",
          },
        },
      },
      "&:last-of-type": {
        color: palette.white,
        fontSize: " 16px",
      },
    },
    "@media (max-width: 1150px)": {
      maxWidth: "200px",
    },
    "@media (max-width: 1100px)": {
      paddingLeft: "20px",
    },
    "@media (max-width: 800px)": {
      maxWidth: "initial",
      padding: "0 24px",
      "& > p": {
        "&:first-of-type": {
          marginBottom: "16px",
        },
      },
    },
    "@media (max-width: 600px)": {
      padding: 0,
    },
  },
  bannerRight: {
    display: "flex",
    alignItems: "center",
    paddingRight: "39px",
    "@media (max-width: 1400px)": {
      paddingRight: "9px",
    },
    "@media (max-width: 800px)": {
      borderTop: `1px solid ${palette.white}${alpha[2]}`,
      paddingTop: "20px",
      justifyContent: "space-around",
      width: "100%",
    },
    "@media (max-width: 600px)": {
      display: "none",
      paddingRight: 0,
      marginTop: "20px",
    },
  },
  showStatus: {
    display: "flex",
  },
  reportItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "0 22px",
    "& > svg": {
      width: "32px",
      height: "32px",
      marginBottom: "10px",
    },
    "& > p": {
      lineHeight: "24px",
      "&:first-of-type": {
        color: `${palette.white}${alpha[65]}`,
        fontSize: "14px",
      },
      "&:last-of-type": {
        color: palette.white,
        fontSize: "24px",
        fontWeight: "500",
      },
    },
    "&:first-of-type": {
      marginLeft: "11px",
    },
    "&:last-of-type": {
      marginRight: "11px",
    },
    "@media (max-width: 1250px)": {
      margin: "0 11px",
      "& > svg": {
        width: "23px",
        height: "23px",
      },
      "& > p": {
        lineHeight: "20px",
        "&:first-of-type": {
          fontSize: "12px",
        },
        "&:last-of-type": {
          fontSize: "20px",
        },
      },
    },
    "@media (max-width: 960px)": {
      margin: "0 5px",
      "& > p": {
        "&:last-of-type": {
          fontSize: "16px",
        },
      },
    },
    "@media (max-width: 600px)": {
      margin: 0,
      "& > p": {
        "&:first-of-type": {
          fontSize: "10px",
          lineHeight: "12px",
          marginBottom: "5px",
        },
        "&:last-of-type": {
          fontSize: "12px",
          lineHeight: "15px",
        },
      },
    },
  },
});

export function HydraMainContainer(props: { children: ReactNode }) {
  return (
    <Box component="main" className="container">
      {props.children}
    </Box>
  );
}

export function HydraPageContainer(props: { children: ReactNode }) {
  const classes = useStyles();

  return <Box className={classes.poolsContainer}>{props.children}</Box>;
}

export function HydraPageHeader(props: {
  icon: ReactNode;
  onClick?: (arg: void) => void;
  title: ReactNode;
  description: ReactNode;
}) {
  const classes = useStyles();

  return (
    <Box className={classes.poolsBanner}>
      <Box className={classes.poolsBanner}>
        <Box className={classes.bannerLeft}>
          <Box className={classes.bannerIcon}>{props.icon}</Box>
          <Box className={classes.bannerTitle}>
            <Typography>
              {props.title}{" "}
              {props.onClick && <CaretDown onClick={props.onClick} />}
            </Typography>
            <Typography>{props.description}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
