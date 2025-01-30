import { Box } from "@mui/material";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Asset } from "@hydraprotocol/sdk";

import TitleCell from ".";
import { palette } from "@utils/palette";

export default {
  title: "UI/Pool Cell/Title Cell",
  component: TitleCell,
} as ComponentMeta<typeof TitleCell>;

const Template: ComponentStory<typeof TitleCell> = ({ ...args }) => (
  <Box
    maxWidth={"400px"}
    sx={{
      bgcolor: palette.darkBlue.dark,
      color: palette.white,
    }}
  >
    <TitleCell {...args} />
  </Box>
);

export const Primary = Template.bind({});
Primary.args = {
  tokenA: {
    symbol: "USDC",
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
  } as Asset,
  tokenB: {
    symbol: "wBTC",
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh/logo.png",
  } as Asset,
  address: "0000",
};
