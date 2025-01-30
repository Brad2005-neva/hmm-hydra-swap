use crate::errors::ErrorCode;
use crate::state::fees::Fees;
use crate::state::limits::Limits;
use crate::state::prices::Prices;
use anchor_lang::prelude::*;

#[account]
#[derive(Default, Debug)]
pub struct PoolState {
    pub admin: Pubkey,           // 32
    pub token_x_vault: Pubkey,   // 32
    pub token_y_vault: Pubkey,   // 32
    pub token_x_mint: Pubkey,    // 32
    pub token_y_mint: Pubkey,    // 32
    pub lp_token_mint: Pubkey,   // 32
    pub pool_id: u32,            // 4
    pub pool_state_bump: u8,     // 1
    pub token_x_vault_bump: u8,  // 1
    pub token_y_vault_bump: u8,  // 1
    pub lp_token_vault_bump: u8, // 1
    pub lp_token_mint_bump: u8,  // 1
    pub c_value: u8,             // 1
    pub fees: Fees,              // 4 + 18
    pub prices: Prices,          // 64
    pub limits: Limits,          // 33
}

impl PoolState {
    pub const LEN: usize = 8 + (32 * 6) + 4 + 6 + 64 + (4 + 18) + 64 + 33;

    pub fn check_c_value(&mut self) -> Result<()> {
        require!(
            vec![0u8, 100, 125, 150].contains(&self.c_value),
            ErrorCode::InvalidCValue
        );

        Ok(())
    }
}
