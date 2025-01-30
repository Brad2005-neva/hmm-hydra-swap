import { FC, useState, useEffect } from "react";
import { WalletName } from "@solana/wallet-adapter-base";

import { useWallet, useNetworkProvider } from "@hydraprotocol/services";
import { HydraModal } from "@ui/hydraModal";
import {
  WalletNotDetectedView,
  WalletConnectingView,
  WalletDisconnectedView,
  WalletConnectedView,
} from "@ui/wallet";
import { toast } from "react-toastify";

interface WalletModalProps {
  open: boolean;
  onClose(): void;
  address: string;
}

const WalletModal: FC<WalletModalProps> = ({ open, onClose, address }) => {
  const { meta } = useNetworkProvider();
  const { wallets, select, wallet, connected, connecting } = useWallet();
  const [changeWallet, setChangeWallet] = useState(false);

  useEffect(() => {
    if (wallet && !connected) {
      const adapter = wallet.adapter;

      console.log(adapter.name, " : ", adapter.readyState, " : ", adapter.url);

      if (
        adapter.readyState === "Installed" ||
        adapter.readyState === "Loadable"
      ) {
        setChangeWallet(false);
      }
    }

    if (open) {
      setChangeWallet(false);
    }
  }, [wallet, connected, open]);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast("Successfully copied address!");
  };

  const disconnectWallet = () => {
    if (wallet) {
      const adapter = wallet.adapter;

      adapter.disconnect().catch((error) => {
        console.log(error);
      });
    }
  };

  const resetWallet = () => {
    select("" as WalletName);
  };

  const handleClose = () => {
    if (wallet && wallet.readyState !== "Installed") {
      resetWallet();
    }
    onClose();
  };

  return (
    <HydraModal
      open={open}
      onClose={handleClose}
      mainContent={
        <>
          {(!wallet || changeWallet) && (
            <WalletDisconnectedView wallets={wallets} select={select} />
          )}
          {wallet && connecting && (
            <WalletConnectingView wallet={wallet} select={select} />
          )}
          {wallet && wallet.readyState === "NotDetected" && (
            <WalletNotDetectedView wallet={wallet} select={select} />
          )}
          {wallet && connected && !changeWallet && (
            <WalletConnectedView
              wallet={wallet}
              meta={meta}
              address={address}
              setChangeWallet={setChangeWallet}
              disconnectWallet={disconnectWallet}
              copyAddress={copyAddress}
            />
          )}
        </>
      }
    />
  );
};

export default WalletModal;
