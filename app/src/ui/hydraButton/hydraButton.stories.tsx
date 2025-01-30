import { Typography } from "@mui/material";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import HydraButton from ".";

type HydraButtonSBType = { innerText: string } & typeof HydraButton;
export default {
  title: "UI/Button",
  component: HydraButton,
  argTypes: {
    innerText: {
      name: "innerText",
      type: { name: "string", required: false },
      control: { type: "text" },
    },
  },
} as ComponentMeta<typeof HydraButton>;

// TODO: Find a better way to add innerText into the type without using any
const Template: ComponentStory<any> = ({
  innerText,
  ...args
}: HydraButtonSBType) => (
  <HydraButton {...args}>
    <Typography>{innerText}</Typography>
  </HydraButton>
);

export const Primary = Template.bind({});
Primary.args = {
  kind: "primary",
  innerText: "This is the primary button",
};

export const Secondary = Template.bind({});
Secondary.args = {
  kind: "secondary",
  children: "Text",
  innerText: "This is the secondary button",
};
