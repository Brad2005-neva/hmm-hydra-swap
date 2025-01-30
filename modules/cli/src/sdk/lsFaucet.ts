import { FaucetState } from "@hydraprotocol/sdk";
import { TokenMint } from "@hydraprotocol/sdk";
import { AccountInfo } from "@solana/web3.js";
import { DefaultArgs } from "./types";
import { createFaucetSDK, createSDK } from "./utils";

export type LsFaucetArgs = DefaultArgs;

export async function lsFaucet({ network, walletLocation }: LsFaucetArgs) {
  const faucetSdk = createFaucetSDK(network, walletLocation);
  const hydraSdk = createSDK(network, walletLocation);
  const faucetStates = await faucetSdk.ctx.connection.getProgramAccounts(
    faucetSdk.ctx.program.programId
  );

  const mints = faucetStates.map((faucetStateAccount) => {
    const faucetState = faucetSdk.ctx.getParser<FaucetState>(
      faucetSdk.ctx.program,
      "FaucetState"
    )(faucetStateAccount.account);

    return faucetState.tokenMint;
  });

  const tokenInfos = await Promise.all(
    mints.map(async (mintKey) => {
      return hydraSdk.accountLoaders.mint(mintKey).info();
    })
  );

  return mints.reduce((acc, pubkey, i) => {
    return { ...acc, [`${pubkey}`]: tokenInfos[i] };
  }, {} as Record<string, AccountInfo<TokenMint>>);
}
