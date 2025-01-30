import { Box } from "@mui/material";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { TokenField } from "@hydraprotocol/services";
import DepositLiquidityAmount from ".";
import { palette } from "@utils/palette";

export default {
  title: "UI/Deposit Liquidity/Deposit Liquidity Amount",
  component: DepositLiquidityAmount,
} as ComponentMeta<typeof DepositLiquidityAmount>;

const Template: ComponentStory<typeof DepositLiquidityAmount> = () => (
  <Box
    sx={{
      bgcolor: palette.darkBlue.dark,
      color: palette.white,
    }}
  >
    <DepositLiquidityAmount
      token={
        {
          asset: {
            symbol: "BERI",
            logoURI:
              "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
            decimals: 6,
          },
        } as TokenField
      }
      tokenBalance={10000000000n}
      setMaxBalance={() => {}}
      setFocus={() => {}}
    />
  </Box>
);

export const Primary = Template.bind({});
