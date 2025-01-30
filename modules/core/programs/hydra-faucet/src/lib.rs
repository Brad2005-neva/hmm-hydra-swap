mod errors;
mod instructions;
mod state;

use anchor_lang::prelude::*;
use instructions::init_faucet::*;
use instructions::mint_token::*;

declare_id!("6UHCxu3LhszCSb2haeb8qWqo1MoAwowHDv61UvwJkDXp");

pub mod constants {
    pub const FAUCET_STATE_SEED: &[u8] = b"faucet_state_seed";
    pub const DEFAULT_FAUCET_AMOUNT: u64 = 1_000;
}

#[program]
pub mod hydra_faucet {
    use super::*;

    /// initialize token mint and faucet pda
    pub fn init_faucet(
        ctx: Context<InitFaucet>,
        faucet_state_bump: u8,
        token_decimal: u8,
    ) -> Result<()> {
        instructions::init_faucet::handle(ctx, faucet_state_bump, token_decimal)
    }

    pub fn mint_token(ctx: Context<MintToken>, token_amount: u64) -> Result<()> {
        instructions::mint_token::handle(ctx, token_amount)
    }
}
