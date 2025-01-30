import {
  Tooltip as MuiTooltip,
  tooltipClasses,
  TooltipProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { palette } from "@utils/palette";

export const Tooltip = styled(({ className, ...props }: TooltipProps) => (
  <MuiTooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: palette.darkBlue.dark,
    backdropFilter: "blur(10px)",
    borderRadius: "4px",
    padding: "10px 12px",
    fontSize: "13px",
    lineHeight: "16px",
    marginTop: "8px",
  },
  [`& .${tooltipClasses.tooltip} a`]: {
    color: palette.white,
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: palette.darkBlue.dark,
  },
});
