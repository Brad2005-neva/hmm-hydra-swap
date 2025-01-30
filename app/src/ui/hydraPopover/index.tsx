import { Popover, PopoverProps } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ReactNode } from "react";
import { palette, alpha } from "@utils/palette";

const useStyles = makeStyles({
  popover: {
    "& .MuiPaper-root": { background: "none", borderRadius: "6px" },
  },
  childrenWrapper: {
    background: palette.darkBlue.lightest,
    color: `${palette.white}${alpha[85]}`,
    padding: "8px",
    pointerEvents: "none",
    maxWidth: "250px",
  },
});
type HydraPopoverProps = PopoverProps & {
  children: ReactNode;
};

const HydraPopover = ({
  id,
  open,
  anchorEl,
  onClose,
  children,
  ...props
}: HydraPopoverProps) => {
  const classes = useStyles();

  return (
    <Popover
      className={classes.popover}
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      aria-label={"popover"}
      {...props}
    >
      <div className={classes.childrenWrapper}>{children}</div>
    </Popover>
  );
};

export default HydraPopover;
