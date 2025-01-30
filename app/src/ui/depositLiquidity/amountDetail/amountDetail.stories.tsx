import { Box } from "@mui/material";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import AmountDetail from ".";
import { palette } from "@utils/palette";

export default {
  title: "UI/Deposit Liquidity/Amount Detail",
  component: AmountDetail,
} as ComponentMeta<typeof AmountDetail>;

const Template: ComponentStory<typeof AmountDetail> = () => (
  <Box
    maxWidth={"200px"}
    sx={{
      bgcolor: palette.darkBlue.dark,
      color: palette.white,
    }}
  >
    <AmountDetail
      tokenBalance={10000000n}
      tokenSymbol={"USDC"}
      tokenDecimal={6}
      onMaxClicked={() => {}}
    />
  </Box>
);

export const Primary = Template.bind({});
