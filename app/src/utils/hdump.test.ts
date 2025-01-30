import { Keypair, PublicKey } from "@solana/web3.js";
import { getPoolIdFromName } from "./hdump";
import tokens from "@hydraprotocol/config/tokens.json";
import { Asset, PoolState } from "@hydraprotocol/sdk";

const findToken = (symb: string, assets: Asset[]) => {
  const found = assets.find(
    (a) => a.symbol.toLowerCase() === symb.toLowerCase()
  );
  if (!found) throw new Error("Not found!");
  return found;
};

const list = (key: PublicKey, tokenXMint: PublicKey, tokenYMint: PublicKey) => [
  {
    key,
    info: {
      tokenXMint,
      tokenYMint,
    } as any as PoolState,
  },
];

test("getPoolIdFromName", () => {
  const assets = tokens["localnet"];
  const usdc = findToken("usdc", assets);
  const weth = findToken("weth", assets);
  const tokenXMint = new PublicKey(usdc.address);
  const tokenYMint = new PublicKey(weth.address);

  const one = Keypair.generate().publicKey;

  getPoolIdFromName(
    async () => list(one, tokenXMint, tokenYMint),
    "USDC-wETH",
    assets
  );
});
