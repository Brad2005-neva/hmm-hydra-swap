import { useState } from "react";
import { IconButton } from "@mui/material";
import { makeStyles } from "@mui/styles";
import HydraPopover from "../hydraPopover";
import { PopoverOrigin } from "@types";

const useStyles = makeStyles({
  iconButton: {
    height: "15px",
    width: "15px",
    marginLeft: "5px",
  },
});

const IconPopover = ({
  icon,
  content,
  ariaLabel,
  tabIndex,
  anchorOrigin,
  transformOrigin,
}: {
  icon: JSX.Element;
  content: string;
  ariaLabel?: string;
  tabIndex?: number;
  anchorOrigin?: PopoverOrigin;
  transformOrigin?: PopoverOrigin;
}) => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <>
      <IconButton
        className={classes.iconButton}
        color="inherit"
        aria-describedby={id}
        onClick={handleClick}
        aria-label={ariaLabel}
        tabIndex={tabIndex}
      >
        {icon}
      </IconButton>
      <HydraPopover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={
          anchorOrigin ?? { vertical: "center", horizontal: "right" }
        }
        transformOrigin={
          transformOrigin ?? { vertical: "center", horizontal: "left" }
        }
      >
        {content}
      </HydraPopover>
    </>
  );
};

export default IconPopover;
