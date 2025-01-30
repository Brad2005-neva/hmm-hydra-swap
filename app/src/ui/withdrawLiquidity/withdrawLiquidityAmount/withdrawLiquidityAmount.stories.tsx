import { Box } from "@mui/material";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import WithdrawLiquidityAmount from ".";
import { palette } from "@utils/palette";

export default {
  title: "UI/Withdraw Liquidity/Withdraw Liquidity Amount",
  component: WithdrawLiquidityAmount,
} as ComponentMeta<typeof WithdrawLiquidityAmount>;

const Template: ComponentStory<typeof WithdrawLiquidityAmount> = () => (
  <Box
    sx={{
      bgcolor: palette.darkBlue.dark,
      color: palette.white,
      width: "400px",
    }}
  >
    <WithdrawLiquidityAmount percent={1000n} setPercent={() => {}} />
  </Box>
);

export const Primary = Template.bind({});
