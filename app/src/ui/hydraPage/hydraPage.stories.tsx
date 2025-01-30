import { ComponentStory, ComponentMeta } from "@storybook/react";
import HydraPage from ".";
import { Hydraswap } from "../icons";
import PoolsTab from "../../pages/pools/PoolsTab";
import { palette } from "@utils/palette";

const mockTokenPrices = {
  USDC: 1,
  wBTC: 20845.73154198,
  wETH: 1199.17984458,
  wSOL: 38.229,
};

export default {
  title: "UI/HydraPage",
  component: HydraPage,
  argTypes: {
    icon: {
      name: "icon",
      type: { name: "function", required: false },
    },
    title: {
      name: "title",
      type: { name: "string", required: false },
    },
    description: {
      name: "description",
      type: { name: "string", required: false },
    },
    content: {
      name: "content",
      type: { name: "function", required: false },
    },
  },
  parameters: {
    backgrounds: {
      default: "default",
      values: [{ name: "default", value: palette.darkBlue.secondary }],
    },
  },
} as ComponentMeta<typeof HydraPage>;

// TODO: Find a better way to add innerText into the type without using any
const Template: ComponentStory<typeof HydraPage> = (args) => (
  <HydraPage {...args} />
);

export const PoolsPage = Template.bind({});
PoolsPage.args = {
  icon: <Hydraswap />,
  title: "Pools",
  description: "Providing liquidity can earn swap fee and farm income.",
  content: <PoolsTab tokenPrices={mockTokenPrices} />,
};
