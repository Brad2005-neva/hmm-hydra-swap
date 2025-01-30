import { makeStyles } from "@mui/styles";
import { Button, ButtonProps } from "@mui/material";
import { palette, alpha } from "@utils/palette";

const useStyles = makeStyles({
  hydraButton: {
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    padding: "12px 20px",
    textTransform: "initial",
    "& p": {
      fontSize: "16px",
      lineHeight: "24px",
    },
    "&.Mui-disabled": {
      background: palette.gray.primary,
      "& *": {
        color: `${palette.white}${alpha[65]}`,
      },
    },
    "@media (max-width: 600px)": {
      paddingTop: "8px",
      paddingBottom: "8px",
      "& p": {
        fontSize: "14px",
        lineHeight: "20px",
      },
    },
  },
  primaryButton: {
    background: `linear-gradient(88.14deg, ${palette.purple.primary} 16.49%, ${palette.green.primary} 86.39%)`,
    "& *": {
      color: `${palette.white} !important`,
    },
  },
  secondaryButton: {
    background: `linear-gradient(88.14deg, ${palette.purple.primary} 16.49%, ${palette.green.primary} 86.39%)`,
    "& *": {
      position: "relative",
      color: `${palette.green.primary} !important`,
    },
    "&::before": {
      content: "''",
      position: "absolute",
      top: "1px",
      right: "1px",
      bottom: "1px",
      left: "1px",
      borderRadius: "6px",
      backgroundColor: palette.darkBlue.primary,
    },
    "&:hover": {
      "&::before": {
        backgroundColor: palette.darkBlue.lightest,
      },
    },
  },
  smButton: {
    lineHeight: "19px",
    padding: "8px 12px",
    "& p": {
      fontSize: "14px",
    },
  },
  lgButton: {
    padding: "16px 24px",
    "& p": {
      fontWeight: "500",
    },
  },
});

type HydraButtonProps = Omit<ButtonProps, "onClick"> & {
  kind?: "primary" | "secondary";
  size?: "small" | "large";
  onClick?: () => void;
};

function HydraButton({ kind, onClick, ...props }: HydraButtonProps) {
  const classes = useStyles();

  const handleClick = () => {
    onClick && onClick();
  };

  const filteredProps = (originProps: ButtonProps) => {
    const filterList = ["className", "size"];

    const filteredProps = Object.fromEntries(
      Object.entries(originProps).filter(([key]) => !filterList.includes(key))
    );

    return filteredProps;
  };

  return (
    <Button
      className={`${classes.hydraButton} ${
        kind === "primary" ? classes.primaryButton : ""
      } ${kind === "secondary" ? classes.secondaryButton : ""} ${
        props.size === "small" ? classes.smButton : ""
      } ${props.size === "large" ? classes.lgButton : ""}`}
      onClick={handleClick}
      {...filteredProps(props)}
    />
  );
}

export default HydraButton;
