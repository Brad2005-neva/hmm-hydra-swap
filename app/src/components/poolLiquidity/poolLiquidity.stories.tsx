import { Box } from "@mui/material";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { TokenField } from "@hydraprotocol/services";
import { AccountData, TokenAccount } from "@hydraprotocol/sdk";
import PoolLiquidity from ".";

export default {
  title: "UI/Pool Liquidity",
  component: PoolLiquidity,
} as ComponentMeta<typeof PoolLiquidity>;

const Template: ComponentStory<typeof PoolLiquidity> = () => (
  <Box
    sx={{
      bgcolor: "#2a2d3a",
      color: "#FFF",
    }}
  >
    <PoolLiquidity
      tokenA={
        {
          asset: {
            symbol: "wETH",
            logoURI:
              "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EoMgMnWvkkqAFKRRktf4XRYuCvXykH6hW3DYv793HrG1/logo.png",
            decimals: 9,
          },
        } as TokenField
      }
      tokenB={
        {
          asset: {
            symbol: "BERI",
            logoURI:
              "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
            decimals: 6,
          },
        } as TokenField
      }
      tokenAVault={
        {
          account: {
            data: {
              amount: 1000000000000n,
            },
          },
        } as AccountData<TokenAccount>
      }
      tokenBVault={
        {
          account: {
            data: {
              amount: 2000000000000n,
            },
          },
        } as AccountData<TokenAccount>
      }
    />
  </Box>
);

export const Primary = Template.bind({});
