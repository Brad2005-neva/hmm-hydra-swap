use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Calculation of liquidity pool tokens failed")]
    CalculateLpTokensFailed,

    #[msg("Slippage Amount Exceeded")]
    SlippageExceeded,

    #[msg("Invalid fee percentage")]
    InvalidFeePercentage,

    #[msg("Token addresses order is invalid")]
    InvalidTokenOrder,

    #[msg("Global state admin does not match the address of account provided")]
    InvalidGlobalAdmin,

    #[msg("Pool state admin does not match the address of account provided")]
    InvalidPoolAdmin,

    #[msg("Global state initializer does not match the deployer of program")]
    InvalidDeployer,

    #[msg("Invalid ProgramData account")]
    InvalidProgramDataAccount,

    #[msg("Oracle pricing accounts not provided")]
    OracleAccountsMissing,

    #[msg("Global state swapping is disabled")]
    SwapDisabled,

    #[msg("Global state adding liquidity is disabled")]
    AddLiquidityDisabled,

    #[msg("Global state removing liquidity is disabled")]
    RemoveLiquidityDisabled,

    #[msg("Pool state public creating as non-global admin is disabled")]
    CreatePublicPoolDisabled,

    #[msg("Limits exceeded for swap instruction token X")]
    LimitsExceededSwapTokenX,

    #[msg("Limits exceeded for swap instruction token Y")]
    LimitsExceededSwapTokenY,

    #[msg("Limits exceeded for liquidity instruction token X")]
    LimitsExceededLiquidityTokenX,

    #[msg("Limits exceeded for liquidity instruction token Y")]
    LimitsExceededLiquidityTokenY,

    #[msg("Token mint does not match target for user mint")]
    InvalidTokenMintForUserToMint,

    #[msg("Compensation value can only be 0, 100, 125 or 150")]
    InvalidCValue,
}
