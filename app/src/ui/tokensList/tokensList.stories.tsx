import { ComponentStory, ComponentMeta } from "@storybook/react";
import TokensList from ".";
import { palette } from "@utils/palette";

const mockBalances = [
  {
    address: "usdKFrwicfVCmFMHDLM1SKeTEhzFFnHR4gMNzauRr5f",
    balance: 0n,
    chainId: 0,
    decimals: 6,
    logoURI:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
    name: "USDC",
    symbol: "USDC",
  },
];

export default {
  title: "UI/TokensList",
  component: TokensList,
  parameters: {
    backgrounds: {
      default: "default",
      values: [{ name: "default", value: palette.darkBlue.secondary }],
    },
  },
} as ComponentMeta<typeof TokensList>;

//I have had to do is this way, as Storybook.js is still waiting BigInt integration
export const FaucetTokens: ComponentStory<typeof TokensList> = () => (
  <TokensList
    tokens={mockBalances}
    disabled={false}
    onClick={() => {}}
    buttonText="Airdrop"
  />
);

export const WalletTokens: ComponentStory<typeof TokensList> = () => (
  <TokensList tokens={mockBalances} title="Tokens" isWallet />
);
