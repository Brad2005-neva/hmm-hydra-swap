import { FC } from "react";
import TokensList from "../tokensList";
import { Asset } from "@hydraprotocol/sdk";
import { ListMenu } from "../listMenu";
import { ChangeWalletButton } from "@ui/wallet";

interface TokenMenuProps {
  address: string;
  balances: Asset[];
  isMobile: boolean | undefined;
  onUserButtonClick: () => void;
}

export const TokenMenu: FC<TokenMenuProps> = ({
  address,
  balances,
  isMobile,
  onUserButtonClick,
}) => {
  return (
    <>
      <ListMenu onOpen={() => {}}>
        <TokensList title={"Your Tokens"} tokens={balances} isWallet />
      </ListMenu>
      <ChangeWalletButton
        address={address}
        isMobile={isMobile}
        onClick={onUserButtonClick}
      />
    </>
  );
};
