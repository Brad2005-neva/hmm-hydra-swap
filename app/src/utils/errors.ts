export const getErrorContent = (error: string) => {
  // Custom Defined Errors
  if (error.includes("CalculateLpTokensFailed"))
    return "Calculation of liquidity pool tokens failed";
  if (error.includes("SlippageExceeded")) return "Slippage Amount Exceed";
  if (error.includes("InvalidFee")) return "Invalid fee input";
  if (error.includes("InvalidTokenOrder"))
    return "Token addresses order is invalid";
  if (error.includes("InvalidGlobalAdmin"))
    return "Global state admin does not match the address of account provided";
  if (error.includes("OracleAccountsMissing"))
    return "Oracle pricing accounts not provided";
  if (error.includes("SwapDisabled"))
    return "Global state swapping is disabled";
  if (error.includes("AddLiquidityDisabled"))
    return "Global state adding liquidity is disabled";
  if (error.includes("AddLiquidityDisabled"))
    return "Global state removing liquidity is disabled";
  if (error.includes("CreatePoolDisabled"))
    return "Global state creating pool is disabled";
  if (error.includes("InvalidPoolAdmin"))
    return "Pool state admin does not match the address of account provided";
  if (error.includes("LimitsScale"))
    return "Unable to scale limits to match input amount";
  if (error.includes("LimitsExceededSwapIn"))
    return "Limits exceeded for swap instruction on amount in";
  if (error.includes("LimitsExceededSwapOut"))
    return "Limits exceeded for swap instruction on amount out";
  if (error.includes("LimitsExceededAddLiquidity"))
    return "Limits exceeded for add liquidity instruction";
  if (error.includes("LimitsExceededRemoveLiquidity"))
    return "Limits exceeded for remove liquidity instruction";
  if (error.includes("InvalidTokenMintForUserToMint"))
    return "Token mint does not match target for user mint";
  if (error.includes("InvalidCValue"))
    return "Compensation value can only be 0, 100, 125 or 150";

  // Wallet rejection error
  if (error.includes("WalletSignTransactionError"))
    return "User Rejected The Request";

  // Solana token error codes
  if (error.includes("0x0"))
    return "Lamport balance below rent-exempt threshold";
  if (error.includes("0x1")) return "Insufficient funds";
  if (error.includes("0x2")) return "Invalid Mint";
  if (error.includes("0x3")) return "Account not associated with this Mint";
  if (error.includes("0x4")) return "Owner does not match";
  if (error.includes("0x5")) return "Fixed supply";
  if (error.includes("0x6")) return "Already in use";
  if (error.includes("0x7")) return "Invalid number of provided signers";
  if (error.includes("0x8")) return "Invalid number of required signers";
  if (error.includes("0x9")) return "State is uninitialized";
  if (error.includes("0xa"))
    return "Instruction does not support native tokens";
  if (error.includes("0xb"))
    return "Non-native account can only be closed if its balance is zero";
  if (error.includes("0xc")) return "Invalid instruction";
  if (error.includes("0xd")) return "State is invalid for requested operation";
  if (error.includes("0xe")) return "Operation overflowed";
  if (error.includes("0xf"))
    return "Account does not support specified authority type";
  if (error.includes("0x10")) return "This token mint cannot freeze accounts";
  if (error.includes("0x11")) return "Account is frozen";
  if (error.includes("0x12"))
    return "The provided decimals value different from the Mint decimals";
  if (error.includes("0x13"))
    return "Instruction does not support non-native tokens";
};
