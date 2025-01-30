import { Box } from "@mui/material";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import LoaderSpinner from ".";

export default {
  title: "UI/LoaderSpinner",
  component: LoaderSpinner,
} as ComponentMeta<typeof LoaderSpinner>;

const Template: ComponentStory<typeof LoaderSpinner> = () => (
  <Box
    sx={{
      width: "200px",
    }}
  >
    <LoaderSpinner />
  </Box>
);

export const Primary = Template.bind({});
