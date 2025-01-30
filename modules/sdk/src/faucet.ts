import { BN, Coder, Program, AnchorProvider } from "@project-serum/anchor";
import {
  AccountInfo,
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { getProgramIds } from "./config/get-program-ids";
import { createFakeWallet } from "./ctx";
import { Network, ProgramIds, Wallet } from "./types";
import * as faucets from "@hydraprotocol/idls/codegen/types/hydra_faucet";
import * as utils from "./utils";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";

function isNetwork(value: any): value is Network {
  return typeof value === "string";
}

export type FaucetState = {
  tokenMint: PublicKey;
  tokenMintDecimals: number;
  faucetStateBump: number;
};

export const FAUCET_PDA_DATA_SIZE = 42; // 8 + 34
export const DEFAULT_FAUCET_AMOUNT = 100_000;
export const FAUCET_STATE_SEED = "faucet_state_seed";

export type faucetCtx = ReturnType<typeof createFaucetCtx>;

export type HydraFaucetSDK = ReturnType<typeof createFaucetApi>;

/**
 * Base object for instantiating the SDK for use on the client.
 */
export const HydraFaucetSDK = {
  /**
   * Create an instance of the SDK.
   * @param network One of either `testnet`, `devnet` or `localnet` this informs which programIds are supplied to the system.
   * @param endpoint The RPC endpoint the application will be connecting to.
   * @param wallet An optional wallet to sign transactions. If left out a readonly SDK will be created.
   * @returns HydraAPI
   */
  create(
    network: Network,
    connectionOrEndpoint: Connection | string,
    wallet?: Wallet
  ) {
    const programIds = getProgramIds(network);
    const connection =
      typeof connectionOrEndpoint === "string"
        ? new Connection(connectionOrEndpoint)
        : connectionOrEndpoint;
    let ctx;
    if (wallet) {
      const provider = new AnchorProvider(connection, wallet, {});
      ctx = createFaucetCtx(provider, programIds.hydraFaucet, network);
    } else {
      // Create readonly provider
      const provider = new AnchorProvider(connection, createFakeWallet(), {});
      ctx = createFaucetCtx(provider, programIds.hydraFaucet, network);
    }
    return createFaucetApi(ctx);
  },

  /**
   * Creates an SDK instance configured for tests using an anchor provider.
   * @param provider Anchor provider
   * @param programIdsOrNetwork Map of program ids to build off for testing or a network string
   * @returns HydraAPI
   */
  fromAnchorProvider(
    provider: AnchorProvider,
    programIdsOrNetwork: ProgramIds | Network
  ) {
    const programIds = isNetwork(programIdsOrNetwork)
      ? getProgramIds(programIdsOrNetwork)
      : programIdsOrNetwork;
    const network = isNetwork(programIdsOrNetwork)
      ? programIdsOrNetwork
      : undefined;
    const ctx = createFaucetCtx(provider, programIds.hydraFaucet, network);
    return createFaucetApi(ctx);
  },
};

// Accounts
const faucetState = (ctx: faucetCtx) => async (tokenMint: PublicKey) => {
  const programId = ctx.program.programId;
  const seeds = [FAUCET_STATE_SEED, tokenMint];
  const parser = ctx.getParser<FaucetState>(ctx.program, "FaucetState");

  const [key, bump] = await ctx.utils.getPDA(programId, seeds);

  async function data() {
    let info: AccountInfo<Buffer> | null = null;
    try {
      const res = await ctx.connection.getAccountInfo(key);
      if (res && res.data) {
        info = res;
      }
    } catch (e) {
      throw new Error("info couldnt be fetched for " + key.toString());
    }
    return !info
      ? null
      : {
          ...info,
          data: parser(info),
        };
  }

  return { key, bump, data };
};

const userToken =
  (ctx: faucetCtx) => async (tokenMint: PublicKey, recipient: PublicKey) => {
    const key = await ctx.utils.findAssociatedTokenAddress(
      recipient,
      tokenMint
    );
    async function balance() {
      const bal = await ctx.connection.getTokenAccountBalance(key);
      return BigInt(bal.value.amount);
    }
    return {
      key,
      balance,
    };
  };

const getAllCreatedTokens = (ctx: faucetCtx) => async () => {
  const pdaInfo = (
    await ctx.connection.getProgramAccounts(ctx.program.programId, {
      filters: [
        {
          dataSize: FAUCET_PDA_DATA_SIZE,
        },
      ],
    })
  ).map((res) => {
    return {
      pubkey: res.pubkey,
      data: res.account.data,
    };
  });

  const result = pdaInfo.map((info) => {
    return {
      pubkey: new PublicKey(info.data.slice(8, 40)),
      decimal: new BN(info.data.slice(40, 41).reverse()).toNumber(),
    };
  });
  return result;
};

// Methods
function initFaucet(ctx: faucetCtx) {
  return async (tokenDecimal: number, tokenPair: Keypair) => {
    const tokenMint = tokenPair.publicKey;
    const getFaucetState = faucetState(ctx);
    const faucetStateKey = (await getFaucetState(tokenMint)).key;
    const faucetStateBump = (await getFaucetState(tokenMint)).bump;
    const program = ctx.program;

    const instruction = program.methods
      .initFaucet(faucetStateBump, tokenDecimal)
      .accounts({
        payer: ctx.provider.wallet.publicKey,
        faucetState: faucetStateKey,
        tokenMint,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      })
      .signers([
        (ctx.provider.wallet as NodeWallet).payer || ctx.provider.wallet,
        tokenPair,
      ]);
    const tx = await instruction.rpc({ commitment: "confirmed" });
    return tx;
  };
}

function mintTokens(ctx: faucetCtx) {
  return async (tokenMint: PublicKey, recipient: PublicKey, amount: bigint) => {
    const getFaucetState = faucetState(ctx);
    const getUserToken = userToken(ctx);

    const faucetStateKey = (await getFaucetState(tokenMint)).key;
    const userTokenAccount = (await getUserToken(tokenMint, recipient)).key;
    const program = ctx.program;
    const instruction = program.methods
      .mintToken(new BN(amount.toString()))
      .accounts({
        payer: ctx.provider.wallet.publicKey,
        faucetState: faucetStateKey,
        tokenMint,
        recipient,
        userTokenAccount,
        systemProgram: SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
      });
    const tx = await instruction.rpc({ commitment: "confirmed" });
    return tx;
  };
}

export const createFaucetApi = (ctx: faucetCtx) => {
  return {
    accounts: {
      faucetState: faucetState(ctx),
      userToken: userToken(ctx),
    },
    methods: {
      initFaucet: initFaucet(ctx),
      mintTokens: mintTokens(ctx),
    },
    utils: {
      getAllCreatedTokens: getAllCreatedTokens(ctx),
    },
    ctx,
  };
};

/**
 * Create context from within an anchor test
 * @param provider Anchor provider
 * @param programIds A map of programIds for the SDK
 * @param network The network the connection is attached to
 * @returns Ctx
 */
export function createFaucetCtx(
  provider: AnchorProvider,
  programId: string,
  network: Network = Network.LOCALNET
) {
  if (network == Network.MAINNET_BETA) {
    throw "Faucet won't work for mainnet";
  }

  function isSignedIn() {
    return provider.wallet.publicKey !== PublicKey.default;
  }
  // Create facuet program objects
  const hydraFaucet = new Program(faucets.IDL, programId, provider);

  /**
   * Lookup public key from initial programIds
   * @param name
   * @returns
   */
  function getKey() {
    return new PublicKey(programId);
  }

  /**
   * Create a parser function to parse using the given coder
   * @param program
   * @param name
   * @returns
   */
  function getParser<T>(program: { coder: Coder }, name: string) {
    return (info: AccountInfo<Buffer>) =>
      program.coder.accounts.decode(name, info.data) as T;
  }

  return {
    connection: provider.connection,
    wallet: provider.wallet,
    program: hydraFaucet,
    provider,
    getKey,
    getParser,
    isSignedIn,
    network,
    utils,
  };
}
