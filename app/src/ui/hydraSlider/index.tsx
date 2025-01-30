import { Box, Slider } from "@mui/material";
import { makeStyles } from "@mui/styles";

import { alpha, palette } from "@utils/palette";

const useStyles = makeStyles({
  sliderWrapper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    padding: "0 12px",
    "& .MuiSlider-root": {
      color: "transparent",
      "& .MuiSlider-rail": {
        color: `${palette.darkBlue.secondary}`,
      },
      "& .MuiSlider-track": {
        background: `linear-gradient(88.14deg, ${palette.purple.primary} 16.49%, ${palette.green.primary} 86.39%)`,
      },
      "& .MuiSlider-mark": {
        color: `${palette.green.primary}`,
      },
      "& .MuiSlider-markLabel": {
        color: `${palette.green.primary}`,
      },
      "& .MuiSlider-thumb": {
        color: `${palette.green.primary}`,
        "&:hover": {
          boxShadow: `0 0 0 8px ${palette.white}${alpha[5]}`,
        },
      },
    },
  },
});

const marks = [
  {
    value: 0,
    label: "0%",
  },
  {
    value: 25,
    label: "25%",
  },
  {
    value: 50,
    label: "50%",
  },
  {
    value: 75,
    label: "75%",
  },
  {
    value: 100,
    label: "100%",
  },
];

const HydraSlider = ({
  value,
  onChange,
}: {
  value: bigint;
  onChange(value: bigint): void;
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.sliderWrapper}>
      <Slider
        aria-label="Withdraw Percentage"
        value={Number(value) / 100}
        onChange={(event, newValue) => {
          onChange(BigInt((newValue as number) * 100));
        }}
        step={1}
        valueLabelDisplay="off"
        marks={marks}
      />
    </Box>
  );
};

export default HydraSlider;
