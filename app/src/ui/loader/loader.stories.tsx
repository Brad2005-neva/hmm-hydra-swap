import { Box } from "@mui/material";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import Loader from ".";

export default {
  title: "UI/Loader",
  component: Loader,
} as ComponentMeta<typeof Loader>;

const Template: ComponentStory<typeof Loader> = () => (
  <Box
    sx={{
      width: "200px",
    }}
  >
    <Loader />
  </Box>
);

export const Primary = Template.bind({});
