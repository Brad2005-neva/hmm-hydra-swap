import { FC, useState, useEffect, ReactNode } from "react";
import { useAssetBalances, useWallet } from "@hydraprotocol/services";
import { PublicKey } from "@solana/web3.js";
import { WalletName } from "@solana/wallet-adapter-base";

import { useFlow } from "../../flows";
import ClusterConnection from "../../clusterConnection";
import { TokenMenu } from "@ui/tokenMenu";
import { LoggedInWalletButton, WalletWrapper } from "@ui/wallet";
import getBrowserProvider from "@utils/getBrowserProvider";

const browserProvider = getBrowserProvider();

const Wrapper = ({
  children,
  mobile,
}: {
  children: ReactNode;
  mobile?: boolean;
}) => {
  return mobile ? <>{children}</> : <WalletWrapper>{children}</WalletWrapper>;
};

interface WalletButtonProps {
  mobile?: boolean;
}

const WalletButton: FC<WalletButtonProps> = ({ mobile }) => {
  const balances = useAssetBalances();
  const { select, connected, connecting, publicKey } = useWallet();

  const [address, setAddress] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const { startWalletFlow, endWalletFlow, setWalletAddress } = useFlow();
  startWalletFlow;

  useEffect(() => {
    // Windows Resize Handler
    function handleResize() {
      setIsMobile(window.innerWidth <= 600);
    }

    // Add event listener
    window.addEventListener("resize", handleResize);

    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!browserProvider) return;

    browserProvider.on("connect", (publicKey: PublicKey) => {
      console.log(`Connected to account ${publicKey.toBase58()}`);
    });

    browserProvider.on("disconnect", () => {
      console.log("diconnect");

      const walletName = localStorage.getItem("currentWalletName");
      if (walletName) {
        localStorage.removeItem("currentWalletName");
        select(walletName as WalletName);
      }
    });

    browserProvider.on("accountChanged", (publicKey: PublicKey | null) => {
      if (publicKey) {
        console.log(`Switched to account ${publicKey.toBase58()}`);

        const walletName = localStorage.getItem("walletName");
        if (walletName) {
          localStorage.setItem(
            "currentWalletName",
            walletName.replaceAll('"', "")
          );
          select("" as WalletName);
        }
      } else {
        browserProvider.connect().catch((error) => {
          console.log(`Failed to re-connect: ${error.message}`);
        });
      }
    });

    return () => {
      browserProvider.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (connected) {
      endWalletFlow();
      const base58 = publicKey ? publicKey.toBase58() : "";
      setAddress(base58);

      if (setWalletAddress) {
        setWalletAddress(base58);
      }
    }
  }, [connected, publicKey, setWalletAddress, endWalletFlow]);

  return (
    <Wrapper mobile={mobile}>
      <ClusterConnection />
      {connected ? (
        <TokenMenu
          isMobile={isMobile}
          address={!isMobile ? address : ""}
          balances={balances}
          onUserButtonClick={startWalletFlow}
        />
      ) : (
        <LoggedInWalletButton
          isMobile={isMobile}
          connecting={connecting}
          onClick={startWalletFlow}
        />
      )}
    </Wrapper>
  );
};

export default WalletButton;
