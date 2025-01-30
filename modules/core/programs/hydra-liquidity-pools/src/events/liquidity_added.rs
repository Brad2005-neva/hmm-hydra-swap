use anchor_lang::prelude::*;

#[event]
pub struct LiquidityAdded {
    pub x_amount: u64,
    pub y_amount: u64,
    pub liquidity: u64,
}
