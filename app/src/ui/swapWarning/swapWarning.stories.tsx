import { Box } from "@mui/material";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import SwapWarning from ".";

export default {
  title: "UI/Swap/SwapWarning",
  component: SwapWarning,
} as ComponentMeta<typeof SwapWarning>;

const Template: ComponentStory<typeof SwapWarning> = ({ ...args }) => (
  <Box
    sx={{
      width: "200px",
    }}
  >
    <SwapWarning {...args} />
  </Box>
);

export const Primary = Template.bind({});

Primary.args = {
  warning: "This is a warning",
};
