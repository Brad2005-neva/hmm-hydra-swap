use crate::access_controls::create_public_pool_enabled::create_public_pool_enabled;
use crate::access_controls::prices_owner::prices_owner;
use crate::constants::*;
use crate::errors::ErrorCode;
use crate::state::fees::Fees;
use crate::state::global_state::*;
use crate::state::pool_state::*;
use crate::Limits;
use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use hydra_math::programs::liquidity_pools::liquidity_calculator::LIQUIDITY_SCALE;

#[derive(Accounts)]
#[instruction(token_a_vault_bump: u8, token_b_vault_bump: u8, pool_state_bump: u8, lp_token_vault_bump: u8, lp_token_mint_bump: u8)]
pub struct InitializePoolState<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [ GLOBAL_STATE_SEED ],
        bump = global_state.global_state_bump,
    )]
    pub global_state: Box<Account<'info, GlobalState>>,

    #[account(
        init,
        space = PoolState::LEN,
        payer = admin,
        seeds = [ POOL_STATE_SEED, global_state.pool_count.to_le_bytes().as_ref() ],
        bump,
    )]
    pub pool_state: Box<Account<'info, PoolState>>,

    pub token_x_mint: Box<Account<'info, Mint>>,

    pub token_y_mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = admin,
        mint::decimals = LIQUIDITY_SCALE,
        mint::authority = pool_state,
        seeds = [ LP_TOKEN_MINT_SEED, pool_state.key().as_ref() ],
        bump,
    )]
    pub lp_token_mint: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = admin,
        token::mint = token_x_mint,
        token::authority = pool_state,
        seeds = [ TOKEN_VAULT_SEED, token_x_mint.key().as_ref(), pool_state.key().as_ref() ],
        bump,
    )]
    pub token_x_vault: Box<Account<'info, TokenAccount>>,

    #[account(
        init,
        payer = admin,
        token::mint = token_y_mint,
        token::authority = pool_state,
        seeds = [ TOKEN_VAULT_SEED, token_y_mint.key().as_ref(), pool_state.key().as_ref() ],
        bump,
    )]
    pub token_y_vault: Box<Account<'info, TokenAccount>>,

    #[account(
        init,
        payer = admin,
        token::mint = lp_token_mint,
        token::authority = pool_state,
        seeds = [ LP_TOKEN_VAULT_SEED, lp_token_mint.key().as_ref() ],
        bump,
    )]
    pub lp_token_vault: Box<Account<'info, TokenAccount>>,

    // system accounts
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

#[allow(clippy::too_many_arguments)]
#[access_control(prices_owner(&ctx.remaining_accounts, &ctx.accounts.global_state))]
#[access_control(create_public_pool_enabled(&ctx.accounts.global_state, &ctx.accounts.admin))]
pub fn handle(
    ctx: Context<InitializePoolState>,
    token_x_vault_bump: u8,
    token_y_vault_bump: u8,
    pool_state_bump: u8,
    lp_token_vault_bump: u8,
    lp_token_mint_bump: u8,
    c_value: u8,
    fees: Fees,
) -> Result<()> {
    if c_value > 0 {
        require!(
            ctx.remaining_accounts.len() == 2,
            ErrorCode::OracleAccountsMissing
        );
    }

    let global_state = &mut ctx.accounts.global_state;
    let pool_state = &mut ctx.accounts.pool_state;

    // save admin
    pool_state.admin = ctx.accounts.admin.to_account_info().key();

    // save token_a_mint, token_b_mint and lp_token_mint
    pool_state.token_x_mint = ctx.accounts.token_x_mint.to_account_info().key();
    pool_state.token_y_mint = ctx.accounts.token_y_mint.to_account_info().key();
    pool_state.lp_token_mint = ctx.accounts.lp_token_mint.to_account_info().key();

    // save token_a_vault and token_b_vault public keys
    pool_state.token_x_vault = ctx.accounts.token_x_vault.to_account_info().key();
    pool_state.token_y_vault = ctx.accounts.token_y_vault.to_account_info().key();

    // save pool index info
    pool_state.pool_id = global_state.pool_count;
    global_state.pool_count = pool_state.pool_id + 1;

    // save pool_state_bump, token_a_vault_bump and token_a_vault_bump
    pool_state.pool_state_bump = pool_state_bump;
    pool_state.token_x_vault_bump = token_x_vault_bump;
    pool_state.token_y_vault_bump = token_y_vault_bump;
    pool_state.lp_token_vault_bump = lp_token_vault_bump;
    pool_state.lp_token_mint_bump = lp_token_mint_bump;

    pool_state.fees = fees;
    pool_state.limits = Limits::default();

    pool_state.c_value = c_value;
    pool_state.check_c_value()?;

    pool_state
        .prices
        .set_price_accounts(ctx.remaining_accounts)?;

    Ok(())
}
