use crate::constants::*;
use crate::state::fees::Fees;
use crate::state::pool_state::*;
use crate::access_controls::pool_admin::pool_admin;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction()]
pub struct SetFees<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
    mut,
    seeds = [ POOL_STATE_SEED, pool_state.pool_id.to_le_bytes().as_ref() ],
    bump = pool_state.pool_state_bump,
    )]
    pub pool_state: Box<Account<'info, PoolState>>,
}

#[allow(clippy::too_many_arguments)]
#[access_control(pool_admin(&ctx.accounts.pool_state, &ctx.accounts.admin))]
pub fn handle(
    ctx: Context<SetFees>,
    fee_calculation: String,
    fee_min_pct: Option<u64>,
    fee_max_pct: Option<u64>,
    fee_ewma_window: Option<u64>,
    fee_last_ewma: Option<u64>,
    fee_lambda: Option<u64>,
    fee_velocity: Option<u64>,
) -> Result<()> {
    let pool_state = &mut ctx.accounts.pool_state;

    let mut fees: Fees = Fees::default();

    fees.update(
        fee_calculation,
        fee_min_pct,
        fee_max_pct,
        fee_ewma_window,
        fee_last_ewma,
        fee_lambda,
        fee_velocity,
    )?;

    fees.validate()?;

    pool_state.fees = fees;

    Ok(())
}
