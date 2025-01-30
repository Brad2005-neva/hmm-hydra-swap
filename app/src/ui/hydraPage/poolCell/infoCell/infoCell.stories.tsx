import { Box } from "@mui/material";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import InfoCell from ".";
import { palette } from "@utils/palette";
import { List } from "../../../icons";

export default {
  title: "UI/Pool Cell/Info Cell",
  component: InfoCell,
} as ComponentMeta<typeof InfoCell>;

const Template: ComponentStory<typeof InfoCell> = ({ ...args }) => (
  <Box
    maxWidth={"200px"}
    sx={{
      bgcolor: palette.darkBlue.dark,
      color: palette.white,
    }}
  >
    <InfoCell {...args} />
  </Box>
);

export const Primary = Template.bind({});
Primary.args = {
  align: "left",
  title: "APR",
  icon: <List />,
  children: "46.72%",
};
