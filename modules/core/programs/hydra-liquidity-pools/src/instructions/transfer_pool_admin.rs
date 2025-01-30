use crate::constants::*;
use crate::state::pool_state::*;
use crate::access_controls::pool_admin::pool_admin;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction()]
pub struct TransferPoolAdmin<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [ POOL_STATE_SEED, pool_state.pool_id.to_le_bytes().as_ref() ],
        bump = pool_state.pool_state_bump,
    )]
    pub pool_state: Box<Account<'info, PoolState>>,
}

#[access_control(pool_admin(&ctx.accounts.pool_state, &ctx.accounts.admin))]
pub fn handle(ctx: Context<TransferPoolAdmin>, new_admin: Pubkey) -> Result<()> {
    let pool_state = &mut ctx.accounts.pool_state;

    pool_state.admin = new_admin;

    Ok(())
}
