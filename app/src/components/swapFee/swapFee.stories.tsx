import { Box } from "@mui/material";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import SwapFee from ".";

export default {
  title: "UI/Swap Fee",
  component: SwapFee,
} as ComponentMeta<typeof SwapFee>;

const Template: ComponentStory<typeof SwapFee> = () => (
  <Box
    maxWidth={"200px"}
    sx={{
      bgcolor: "#2a2d3a",
    }}
  >
    <SwapFee fee={200000000n} />
  </Box>
);

export const Primary = Template.bind({});
