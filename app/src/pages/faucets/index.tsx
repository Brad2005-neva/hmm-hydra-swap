import { useMemo, useState } from "react";
import {
  useAnchorWallet,
  useAssetBalances,
  useConnection,
  useNetworkProvider,
} from "@hydraprotocol/services";
import { toast } from "react-toastify";

import { Hydraswap } from "@ui/icons";
import { Asset, HydraFaucetSDK } from "@hydraprotocol/sdk";
import { PublicKey } from "@solana/web3.js";
import HydraPage from "@ui/hydraPage";
import TokensList from "@ui/tokensList";
import PageMessage from "@ui/hydraPage/placeholder";

const Faucets = () => {
  const { network } = useNetworkProvider();
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const assetBalances = useAssetBalances();
  const [processing, setProcessing] = useState(false);

  // TODO: Replace with useHydraClient()
  const sdk = useMemo(
    () => HydraFaucetSDK.create(network, connection, wallet),
    [connection, wallet, network]
  );

  const [filteredAssetsBalance, solAssetBalance] = assetBalances.reduce(
    ([filtered, wSOL]: Asset[][], asset: Asset) => {
      return asset.symbol !== "wSOL"
        ? [[...filtered, asset], wSOL]
        : [filtered, [...wSOL, asset]];
    },
    [[], []]
  );

  const handleFaucet = async (token: Asset) => {
    if (!wallet || !wallet.publicKey) return;
    setProcessing(true);
    toast.info(
      <span>
        Airdropping <br /> {token.address}
      </span>
    );

    try {
      await sdk.methods.mintTokens(
        new PublicKey(token.address),
        wallet.publicKey,
        100_000n
      );
      toast.success(
        <span>
          You airdropped <br /> {token.address} <br /> successfully.
        </span>
      );
    } catch (error) {
      console.log(error);
      toast.error(
        <span>
          Airdropping <br /> {token.address} <br /> failed.
        </span>
      );
    }
    setProcessing(false);
  };

  return (
    <HydraPage
      icon={<Hydraswap />}
      title={"Faucets"}
      description={"Faucet enough tokens for testing."}
      content={
        <>
          {solAssetBalance.length && solAssetBalance[0].balance === 0n && (
            <PageMessage
              message={
                <>
                  It appears you do not have any SOL. Click{" "}
                  <a
                    href="https://solfaucet.com/"
                    rel="noreferrer"
                    target="_blank"
                    style={{ color: "#ffffff" }}
                  >
                    here
                  </a>{" "}
                  to airdrop some SOL for your gas fees.
                </>
              }
            />
          )}
          <TokensList
            tokens={filteredAssetsBalance}
            disabled={
              !wallet ||
              !wallet.publicKey ||
              processing ||
              solAssetBalance.length === 0 ||
              solAssetBalance[0].balance === 0n
            }
            onClick={handleFaucet}
            buttonText="Airdrop"
          />
        </>
      }
    />
  );
};

export default Faucets;
