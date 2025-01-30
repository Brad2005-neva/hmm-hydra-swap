import { Box } from "@mui/material";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import InlineData from ".";
import { palette } from "@utils/palette";

export default {
  title: "UI/Inline Data",
  component: InlineData,
  argTypes: {
    title: {
      name: "title",
      type: { name: "string", required: false },
      control: { type: "text" },
    },
  },
} as ComponentMeta<typeof InlineData>;

const Template: ComponentStory<typeof InlineData> = ({ ...args }) => (
  <Box
    sx={{
      bgcolor: palette.darkBlue.dark,
      color: palette.white,
      width: "200px",
    }}
  >
    <InlineData {...args} />
  </Box>
);

export const Primary = Template.bind({});
Primary.args = {
  title: "Deposit Amount",
  main: "100 $$",
};
