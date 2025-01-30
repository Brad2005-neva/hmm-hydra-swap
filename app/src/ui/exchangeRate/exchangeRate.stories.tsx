import { ComponentStory, ComponentMeta } from "@storybook/react";
import { Box } from "@mui/material";

import { TokenField } from "@hydraprotocol/services";

import ExchangeRate from ".";
import { palette } from "@utils/palette";

export default {
  title: "UI/Exchange Rate",
  component: ExchangeRate,
} as ComponentMeta<typeof ExchangeRate>;

const Template: ComponentStory<typeof ExchangeRate> = () => (
  <Box
    maxWidth={"200px"}
    sx={{
      bgcolor: palette.darkBlue.dark,
    }}
  >
    <ExchangeRate
      tokenA={
        {
          asset: {
            symbol: "wETH",
            decimals: 2,
          },
        } as TokenField
      }
      tokenAAmount={100n}
      tokenB={
        {
          amount: 100n,
          asset: {
            symbol: "BERI",
            decimals: 2,
          },
        } as TokenField
      }
      tokenBAmount={100n}
    />
  </Box>
);

export const Primary = Template.bind({});
