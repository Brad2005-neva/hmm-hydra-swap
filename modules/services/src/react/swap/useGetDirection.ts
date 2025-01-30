import { AccountData, TokenMint } from "@hydraprotocol/sdk";

export function useGetDirection(
  tokenXMint?: AccountData<TokenMint>,
  tokenYMint?: AccountData<TokenMint>,
  address?: string
): "xy" | "yx" | undefined {
  return `${tokenXMint?.pubkey}` === address
    ? "xy"
    : `${tokenYMint?.pubkey}`
    ? "yx"
    : undefined;
}
