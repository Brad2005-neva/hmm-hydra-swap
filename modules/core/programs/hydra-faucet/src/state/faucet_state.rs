use anchor_lang::prelude::*;

#[account]
#[derive(Debug, Default)]
pub struct FaucetState {
    pub token_mint: Pubkey,      // 32
    pub token_mint_decimals: u8, // 1
    pub faucet_state_bump: u8,   // 1
}

impl FaucetState {
    pub const LEN: usize = 8 + 32 + 1 + 1;
}
