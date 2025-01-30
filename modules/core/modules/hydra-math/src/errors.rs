use crate::programs::fees::fee_result::FeeResultBuilderError;
use crate::programs::liquidity_pools::liquidity_result::LiquidityResultBuilderError;
use crate::programs::liquidity_pools::swap_result::SwapResultBuilderError;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum ErrorCode {
    // Decimal
    #[error("Scale is different")]
    DifferentScale,
    #[error("Exceeds allowable range for value")]
    ExceedsRange,
    #[error("Exceeds allowable range for precision")]
    ExceedsPrecisionRange,
    #[error("Signed decimals not supported for this function")]
    SignedDecimalsNotSupported,

    // Decimal from string
    #[error("String input cannot be parsed")]
    StringNotParsed,
    #[error("String input base is empty")]
    BaseIsEmpty,
    #[error("String input does not use base 10 radix")]
    RadixNotBase10,

    // Swap calculator
    #[error("Delta input provided was not positive or greater than zero")]
    DeltaNotPositive,
    #[error(transparent)]
    SwapResultBuilderError(#[from] SwapResultBuilderError),

    // Liquidity calculator
    #[error("Amount input provided was not positive or greater than zero")]
    AmountNotPositive,
    #[error("Liquidity calculated was not positive or greater than zero")]
    LiquidityNotPositive,
    #[error("Liquidity calculated exceeds range for mint total supply")]
    LiquidityExceedsRange,
    #[error("Liquidity to be removed greater than mint total supply")]
    LiquidityInsufficientSupply,
    #[error(transparent)]
    LiquidityResultBuilderError(#[from] LiquidityResultBuilderError),

    // Fee calculator
    #[error("Fees are greater than input amount")]
    FeesGreaterThanAmount,
    #[error(transparent)]
    FeeResultBuilderError(#[from] FeeResultBuilderError),
}
