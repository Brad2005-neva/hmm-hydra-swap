use crate::constants::*;
use crate::state::global_state::*;
use crate::access_controls::global_admin::global_admin;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction()]
pub struct TransferGlobalAdmin<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [ GLOBAL_STATE_SEED ],
        bump = global_state.global_state_bump,
    )]
    pub global_state: Box<Account<'info, GlobalState>>,
}

#[access_control(global_admin(&ctx.accounts.global_state, &ctx.accounts.admin))]
pub fn handle(ctx: Context<TransferGlobalAdmin>, new_admin: Pubkey) -> Result<()> {
    let global_state = &mut ctx.accounts.global_state;

    global_state.admin = new_admin;

    Ok(())
}
