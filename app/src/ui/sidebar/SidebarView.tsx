import React from "react";
import MuiDrawer from "@mui/material/Drawer";
import {
  List,
  ListSubheader,
  Box,
  IconButton,
  Link,
  Typography,
} from "@mui/material";
import cn from "classnames";
import Collapse from "@assets/images/collapse.png";
import Expand from "@assets/images/expand.png";
import {
  Menu as MenuHandler,
  Network,
  Doc,
  Bars,
  Share,
  Twitter,
  Telegram,
  Speaker,
  Medium,
  Discord,
  HydraswapLong,
  Hydraswap,
} from "../icons";

import { makeStyles } from "@mui/styles";
import { palette, alpha } from "@utils/palette";

export const useStyles = makeStyles({
  drawer: {
    height: "100%",
    width: "240px",
    "& .MuiDrawer-paper": {
      background: palette.darkBlue.dark,
      borderRight: "none",
      width: "100%",
      height: "100vh",
      position: "static",
      justifyContent: "space-between",
      overflow: "visible",
    },
    "&.collapsed": {
      width: "104px",
    },
    "&.expanded": {
      "& .MuiDrawer-paper": {
        position: "fixed",
      },
    },
    "@media (max-width:600px)": {
      width: "100%",
      height: "60px",
      overflow: "hidden",
    },
  },
  drawerHeader: {
    backgroundColor: "transparent",
    borderBottom: `1px solid ${palette.white}${alpha[5]}`,
    lineHeight: "initial !important",
    padding: "24px !important",
    display: "flex",
    "&.collapsed": {
      justifyContent: "center",
      padding: "12px 16px !important",
    },
    "@media (max-width:600px)": {
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 16px !important",
      height: "60px",
    },
  },
  logo: {
    width: "160px",
    height: "36px",
    "@media screen and (max-width: 600px)": {
      width: "120px",
      height: "27px",
    },
  },
  logoSM: {
    width: "36px",
    height: "36px",
  },
  mobileActionWrapper: {
    display: "flex",
    alignItems: "center",
  },
  menuHandler: {
    padding: "0 !important",
    marginLeft: "16px !important",
    "& svg": {
      fill: `${palette.white}${alpha[85]}`,
      width: "22px !important",
      height: "17px !important",
    },
  },
  list: {
    "& *": {
      transition: "width .3s !important",
    },
    "& .MuiListItemButton-root": {
      color: `${palette.white}${alpha[45]}`,
      padding: "12px 24px",
      "& .MuiListItemIcon-root": {
        minWidth: "initial",
        "& svg": {
          width: "28px",
          height: "28px",
          marginRight: "8px",
        },
      },
      "& .MuiListItemText-root": {
        marginTop: 0,
        marginBottom: 0,
        "& span": {
          fontSize: "16px",
          lineHeight: "28px",
        },
        "&.active": {
          "& span": {
            color: palette.green.primary,
          },
        },
      },
      "&:hover": {
        "& *": {
          color: palette.white,
        },
      },
    },
    "&.collapsed": {
      "& .MuiListItemButton-root": {
        flexDirection: "column",
        "& .MuiListItemIcon-root": {
          "& svg": {
            marginRight: 0,
            marginBottom: "8px",
          },
        },
      },
    },
  },
  links: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px 24px",
    position: "relative",
    "& .MuiLink-root": {
      color: `${palette.white}${alpha[45]}`,
      display: "flex",
      alignItems: "center",
      fontSize: "14px",
      padding: "5px 6px",
      margin: "5px 0",
      width: "calc(100% - 14px)",
      justifyContent: "center",
      "& svg": {
        width: "20px",
        height: "20px",
        margin: "0 10px 0 0",
      },
      "&:hover": {
        color: palette.white,
      },
    },
    "&.expanded": {
      padding: "0 16px 8px",
    },
  },
  linkWrapper: {
    position: "relative",
    height: "41px",
    width: "192px",
    "& .MuiLink-root": {
      position: "absolute",
      justifyContent: "flex-start",
      "&.devRpc": {
        color: `${palette.pink.primary}`,
      },
    },
    "&.collapsed": {
      width: "38.5px",
      overflow: "hidden",
      "& .MuiLink-root": {
        border: `1px solid ${palette.white}${alpha[50]}`,
        borderRadius: "15px",
        boxSizing: "content-box",
        justifyContent: "flex-start",
        "& svg": {
          marginLeft: "2.5px",
        },
        "& span": {
          whiteSpace: "nowrap",
          marginRight: "2.5px",
        },
      },
      "&:hover": {
        overflow: "visible",
        zIndex: 999,
        "& .MuiLink-root": {
          width: "initial",
        },
      },
    },
  },
  handler: {
    padding: "0 !important",
    position: "absolute",
    width: "12px",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    "& img": {
      width: "100%",
    },
  },
  socialWrapper: {
    position: "relative",
    height: "50px",
    width: "192px",
    "&.collapsed": {
      width: "39px",
      overflow: "hidden",
      "&:hover": {
        overflow: "visible",
        zIndex: 999,
        "& .MuiBox-root": {
          width: "initial",
        },
      },
    },
  },
  social: {
    display: "flex",
    margin: "10px 0",
    padding: "5px 6px",
    position: "absolute",
    width: "calc(100% - 14px)",
    "& .MuiLink-root": {
      border: "none",
      width: "initial",
      padding: "0",
      margin: "0",
      "& svg": {
        margin: "0 10px",
      },
      "&:first-of-type": {
        "& svg": {
          marginLeft: 0,
        },
      },
      "&:last-of-type": {
        "& svg": {
          marginRight: 0,
        },
      },
    },
    "& > svg": {
      color: `${palette.white}${alpha[50]}`,
      marginRight: "20px",
      width: "20px",
      height: "20px",
      cursor: "pointer",
    },
    "&.collapsed": {
      border: `1px solid ${palette.white}${alpha[50]}`,
      borderRadius: "15px",
      "& > svg": {
        marginLeft: "2.5px",
        marginRight: "10px",
      },
      "& .MuiLink-root": {
        "&:first-of-type": {
          "& svg": {
            marginLeft: "10px",
          },
        },
        "&:last-of-type": {
          "& svg": {
            marginRight: "2.5px",
          },
        },
      },
    },
  },
  bottomLinks: {
    margin: "0 24px",
    "& .MuiListItemButton-root": {
      padding: "12px 0",
      "& .MuiListItemIcon-root": {
        "& svg": {
          fill: `${palette.white}${alpha[45]}`,
        },
      },
      "&:first-of-type": {
        borderTop: `1px solid ${palette.white}${alpha[5]}`,
        borderBottom: `1px solid ${palette.white}${alpha[5]}`,
      },
    },
  },
});

// TODO:
// - Rewrite this to be driven completely from list data
// - Break into components
// - Provide separate templates for mobile and desktop
export function SidebarView({
  open,
  mobile,
  handleDrawer,
  mainnetMode,
  sidebarItems,
  launchNetworkSwitcher,
  networkName,
  utilItems,
  walletButton,
}: {
  networkName: string;
  launchNetworkSwitcher: () => void;
  mainnetMode: boolean;
  mobile: boolean;
  open: boolean;
  sidebarItems: React.ReactNode[];
  handleDrawer: () => void;
  utilItems: React.ReactNode[];
  walletButton: React.ReactNode;
}) {
  const classes = useStyles();

  return (
    <>
      <MuiDrawer
        className={cn(classes.drawer, {
          collapsed: !open && !mobile,
          expanded: !open && mobile,
        })}
        variant="permanent"
      >
        <List
          className={cn(classes.list, {
            collapsed: !open && !mobile,
            expanded: !open && mobile,
          })}
          component="nav"
          subheader={
            <ListSubheader
              className={cn(classes.drawerHeader, {
                collapsed: !open && !mobile,
                expanded: !open && mobile,
              })}
              component="div"
            >
              {(open || mobile) && <HydraswapLong className={classes.logo} />}
              {!open && !mobile && <Hydraswap className={classes.logoSM} />}
              {mobile && (
                <Box className={classes.mobileActionWrapper}>
                  {walletButton}
                  <IconButton
                    className={classes.menuHandler}
                    onClick={handleDrawer}
                    aria-label="Menu Handler"
                  >
                    <MenuHandler />
                  </IconButton>
                </Box>
              )}
            </ListSubheader>
          }
        >
          {sidebarItems}
          {mobile && !mainnetMode && (
            <Box className={classes.bottomLinks}>{utilItems}</Box>
          )}
        </List>
        {!mobile && (
          <IconButton className={classes.handler} onClick={handleDrawer}>
            {open ? (
              <img src={Collapse} alt="Menu" width="12px" height="42px" />
            ) : (
              <img src={Expand} alt="Menu" width="12px" height="42px" />
            )}
          </IconButton>
        )}
        <Box
          className={cn(classes.links, {
            collapsed: !open && !mobile,
            expanded: !open && mobile,
          })}
        >
          {!mobile && !mainnetMode && (
            <Box
              className={cn(classes.linkWrapper, {
                collapsed: !open && !mobile,
              })}
            >
              <Link
                component="button"
                underline="none"
                className={networkName.includes("Mainnet") ? "" : "devRpc"}
                onClick={launchNetworkSwitcher}
              >
                <Network />
                <Typography variant="body2" component="span">
                  {networkName}
                </Typography>
              </Link>
            </Box>
          )}
          {!mobile && (
            <Box
              className={cn(classes.linkWrapper, {
                collapsed: !open && !mobile,
              })}
            >
              <Link
                href="https://hydraswap.gitbook.io/hydra-beta-testing-guide"
                underline="none"
              >
                <Doc />
                <Typography variant="body2" component="span">
                  Test Guide
                </Typography>
              </Link>
            </Box>
          )}
          {!mobile && (
            <Box
              className={cn(classes.linkWrapper, {
                collapsed: !open && !mobile,
              })}
            >
              <Link
                href="https://hydraswap.gitbook.io/hydraswap-gitbook/"
                underline="none"
              >
                <Bars />
                <Typography variant="body2" component="span">
                  Paper & Docs
                </Typography>
              </Link>
            </Box>
          )}
          <Box
            className={cn(classes.socialWrapper, {
              collapsed: !open && !mobile,
            })}
          >
            <Box
              className={cn(classes.social, { collapsed: !open && !mobile })}
            >
              {!open && !mobile && <Share />}
              <Link href="https://twitter.com/HydraSwap_io" underline="none">
                <Twitter />
              </Link>
              <Link href="https://t.me/hydraswap" underline="none">
                <Telegram />
              </Link>
              <Link href="https://t.me/hydraswap_ANN" underline="none">
                <Speaker />
              </Link>
              <Link href="https://medium.com/hydraswap" underline="none">
                <Medium />
              </Link>
              <Link
                href="https://discord.com/invite/AA26dw6Hpm"
                underline="none"
              >
                <Discord />
              </Link>
            </Box>
          </Box>
        </Box>
      </MuiDrawer>
    </>
  );
}
