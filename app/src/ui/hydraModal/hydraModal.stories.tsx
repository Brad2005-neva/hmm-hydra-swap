import { ComponentStory, ComponentMeta } from "@storybook/react";
import { AccountData, TokenMint } from "@hydraprotocol/sdk";
import { HydraModal } from ".";
import BurntTokens from "@components/burntTokens";
import WithdrawLiquidityAmount from "../withdrawLiquidity/withdrawLiquidityAmount";

export default {
  title: "UI/Modal/Hydra Modal",
  component: WithdrawLiquidityAmount,
} as ComponentMeta<typeof WithdrawLiquidityAmount>;

const Template: ComponentStory<typeof WithdrawLiquidityAmount> = () => (
  <HydraModal
    open={true}
    onClose={() => {}}
    title="Withdraw Liquidity"
    mainContent={
      <WithdrawLiquidityAmount percent={1000n} setPercent={() => {}} />
    }
    subContent={
      <BurntTokens
        lpTokensToBurn={1000n}
        lpTokenMint={
          { account: { data: { decimals: 6 } } } as AccountData<TokenMint>
        }
      />
    }
    buttonText="Withdraw"
    buttonDisabled={false}
    onConfirm={() => {}}
    buttonAriaLabel="Trigger Withdraw"
  />
);

export const Primary = Template.bind({});
