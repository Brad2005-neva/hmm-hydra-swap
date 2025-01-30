import { useEffect, useMemo } from "react";
import {
  useAnchorWallet,
  useAssetBalances,
  useConnection,
  useNetworkProvider,
  useOraclePrices,
} from "@hydraprotocol/services";
import { HydraSDK } from "@hydraprotocol/sdk";

import PageRoutes from "../../pages";
import { Sidebar } from "../sidebar";
import { WalletButton } from "../wallet";
import { WelcomePopup } from "../welcomePopup";
import hdump from "@utils/hdump";
import swapDump from "@utils/swapDump";
import { keydump } from "@utils/keydump";
import { SvgGradient } from "@ui/icons";
import { HydraMainContainer } from "@ui/hydraPage/pageContainer";

function Main() {
  const { network } = useNetworkProvider();
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const { data: tokenPrices } = useOraclePrices();
  const assetBalances = useAssetBalances();

  const sdk = useMemo(
    () => HydraSDK.create(network, connection, wallet),
    [connection, wallet, network]
  );

  useEffect(() => {
    const win: any = globalThis;

    win.hdump = (poolIdOrName: number | string) =>
      hdump(
        poolIdOrName,
        sdk,
        assetBalances,
        tokenPrices ? tokenPrices.oracle : undefined
      );

    win.swapDump = (poolIdOrName: number | string) =>
      swapDump(
        poolIdOrName,
        sdk,
        assetBalances,
        tokenPrices ? tokenPrices.oracle : undefined
      );
  }, [sdk, assetBalances, tokenPrices]);

  useEffect(() => {
    const win: any = globalThis;
    win.keydump = () => keydump(sdk);
  }, [sdk]);

  return (
    <div className="layout">
      <SvgGradient />
      <Sidebar />
      <HydraMainContainer>
        <WalletButton />
        <PageRoutes />
      </HydraMainContainer>
      <WelcomePopup />
    </div>
  );
}

export default Main;
