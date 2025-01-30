import { Wallet, ProgramIds, Ctx, Network } from "../types";
import { AccountInfo, Connection, PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider } from "@project-serum/anchor";
import * as liquidityPools from "@hydraprotocol/idls/codegen/types/hydra_liquidity_pools";
import * as utils from "../utils";
import { Logger } from "../utils/Logger";
import { getProgramIds } from "../config/get-program-ids";

// TODO: convert to class pattern

/**
 * Creates a context object
 * @param wallet An Anchor wallet like object
 * @param connection A connection
 * @param network The network the connection is attached to
 * @returns Ctx
 */
export function createCtx(
  wallet: Wallet,
  connection: Connection,
  network: Network
): Ctx {
  const provider = new AnchorProvider(connection, wallet, {});
  return createCtxAnchor(provider, network);
}

// create a fake wallet for when we are signed out.
export function createFakeWallet(publicKey = PublicKey.default): Wallet {
  const createSignedInError = () =>
    new Error("You must connect a wallet to sign a transaction.");
  return {
    publicKey,

    signAllTransactions: () => {
      throw createSignedInError();
    },
    signTransaction: () => {
      throw createSignedInError();
    },
  };
}

export function createReadonlyCtx(
  connection: Connection,
  network: Network,
  publicKey?: PublicKey
) {
  const provider = new AnchorProvider(
    connection,
    createFakeWallet(publicKey),
    {}
  );
  return createCtxAnchor(provider, network);
}

/**
 * Create context from within an anchor test
 * @param provider Anchor provider
 * @param network The network the connection is attached to
 * @returns Ctx
 */
export function createCtxAnchor(
  provider: AnchorProvider,
  network: Network = Network.LOCALNET,
  log = Logger.new(network).log
): Ctx {
  const programIds = getProgramIds(network);
  function isSignedIn() {
    return provider.wallet.publicKey !== PublicKey.default;
  }
  // Create our program objects
  const hydraLiquidityPools = new Program(
    liquidityPools.IDL,
    programIds.hydraLiquidityPools,
    provider
  );
  const programs = {
    hydraLiquidityPools,
  };

  /**
   * Lookup public key from initial programIds
   * @param name
   * @returns
   */
  function getKey(name: keyof ProgramIds) {
    return new PublicKey(programIds[name]);
  }

  /**
   * Create a parser function to parse using the given coder
   * @param program
   * @param name
   * @returns
   */
  function getParser<T>(name: string) {
    return (info: AccountInfo<Buffer>) =>
      programs.hydraLiquidityPools.coder.accounts.decode(name, info.data) as T;
  }

  const {
    findAssociatedTokenAddress,
    getExistingOwnerTokenAccount,
    getPDA,
    isDefaultProvider,
    isEqual,
    stringifyProps,
    toBN,
    toBigInt,
    tryGet,
  } = utils;

  return {
    connection: provider.connection,
    wallet: provider.wallet,
    programs,
    provider,
    getKey,
    getParser,
    isSignedIn,
    network,
    utils: {
      findAssociatedTokenAddress,
      getExistingOwnerTokenAccount,
      getPDA,
      isDefaultProvider,
      isEqual,
      stringifyProps,
      toBN,
      toBigInt,
      tryGet,
    },
    log,
  };
}
