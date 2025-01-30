use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Default, Clone, Debug)]
pub struct Limits {
    pub enabled: bool,              // 1
    pub liquidity_token_x_max: u64, // 8
    pub liquidity_token_y_max: u64, // 8
    pub swap_token_x_max: u64,      // 8
    pub swap_token_y_max: u64,      // 8
}
