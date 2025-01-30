import { AccountData, TokenAccount } from "@hydraprotocol/sdk";

export function useGetDirectionalVaults(
  direction?: "xy" | "yx",
  tokenXVault?: AccountData<TokenAccount>,
  tokenYVault?: AccountData<TokenAccount>
) {
  return direction === "xy"
    ? { tokenAVault: tokenXVault, tokenBVault: tokenYVault }
    : direction === "yx"
    ? { tokenAVault: tokenYVault, tokenBVault: tokenXVault }
    : { tokenAVault: undefined, tokenBVault: undefined };
}
