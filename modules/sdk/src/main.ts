import { AnchorProvider } from "@project-serum/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { createCtx, createReadonlyCtx, createCtxAnchor } from "./ctx";
import { Ctx, Network, Wallet } from "./types";
import { CommonApi } from "./common";
import { LiquidityPools } from "./liquidity-pools";
import { AccountLoaders } from "./accountLoaders";

export function networkFrom(network: string): Network {
  return network as Network;
}

export function fromProvider(
  provider: AnchorProvider,
  network: Network,
  publicKey?: PublicKey
) {
  const ctx = createReadonlyCtx(
    provider.connection,
    network,
    publicKey ? new PublicKey(publicKey) : undefined
  );
  return HydraSDK.fromCtx(ctx);
}

/**
 * Main Hydraprotocol SDK Library
 */
export class HydraSDK {
  constructor(
    public ctx: Ctx,
    public accountLoaders = AccountLoaders.fromCtx(ctx),
    public liquidityPools = LiquidityPools.fromCtx(ctx),
    public common = CommonApi.fromCtx(ctx)
  ) {}

  as(publicKey: PublicKey | string) {
    return fromProvider(
      this.ctx.provider,
      this.ctx.network,
      typeof publicKey === "string" ? new PublicKey(publicKey) : publicKey
    );
  }

  static fromCtx(ctx: Ctx) {
    return new HydraSDK(ctx);
  }

  /**
   * Create an instance of the SDK.
   * @param network One of either `mainnet`, `testnet`, `devnet` or `localnet` this informs which programIds are supplied to the system.
   * @param connectionOrEndpoint The RPC endpoint the application will be connecting to.
   * @param wallet An optional wallet to sign transactions. If left out a readonly SDK will be created.
   * @returns HydraAPI
   */
  static create(
    network: Network,
    connectionOrEndpoint: Connection | string,
    wallet?: Wallet
  ): HydraSDK {
    const connection =
      typeof connectionOrEndpoint === "string"
        ? new Connection(connectionOrEndpoint)
        : connectionOrEndpoint;
    const ctx = wallet
      ? createCtx(wallet, connection, network)
      : createReadonlyCtx(connection, network);
    return HydraSDK.fromCtx(ctx);
  }

  /**
   * Creates an SDK instance configured for tests using an anchor provider.
   * @param provider Anchor provider
   * @param programIdsOrNetwork Map of program ids to build off for testing or a network string
   * @returns HydraAPI
   */
  static fromAnchorProvider(
    provider: AnchorProvider,
    network: Network
  ): HydraSDK {
    const ctx = createCtxAnchor(provider, network);
    return HydraSDK.fromCtx(ctx);
  }
}
