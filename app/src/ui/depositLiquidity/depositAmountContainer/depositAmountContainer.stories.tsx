import { Box } from "@mui/material";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import { TokenField } from "@hydraprotocol/services";
import AmountDetailContainer from ".";
import { palette } from "@utils/palette";

export default {
  title: "UI/Deposit Liquidity/Amount Detail Container",
  component: AmountDetailContainer,
} as ComponentMeta<typeof AmountDetailContainer>;

const Template: ComponentStory<typeof AmountDetailContainer> = () => (
  <Box
    sx={{
      bgcolor: palette.darkBlue.dark,
      color: palette.white,
    }}
  >
    <AmountDetailContainer
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
      tokenABalance={1000000000000n}
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
      tokenBBalance={3000000000000n}
      setMaxFromBalance={() => {}}
      setMaxToBalance={() => {}}
      setFocus={(_position: "from" | "to") => {}}
    />
  </Box>
);

export const Primary = Template.bind({});
