use crate::constants::*;
use crate::state::global_state::*;
use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(global_state_bump: u8)]
pub struct InitializeGlobalState<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        space = GlobalState::LEN,
        payer = admin,
        seeds = [ GLOBAL_STATE_SEED ],
        bump,
    )]
    pub global_state: Box<Account<'info, GlobalState>>,

    // system accounts
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    
    #[account(
        constraint = program.programdata_address()? == Some(program_data.key()) @ ErrorCode::InvalidProgramDataAccount,
        constraint = program.key() == crate::ID,
    )]
    pub program: Program<'info, crate::program::HydraLiquidityPools>,
    #[account(constraint = program_data.upgrade_authority_address == Some(admin.key()) @ ErrorCode::InvalidDeployer)]
    pub program_data: Account<'info, ProgramData>,
}

pub fn handle(ctx: Context<InitializeGlobalState>, global_state_bump: u8) -> Result<()> {
    let global_state = &mut ctx.accounts.global_state;

    // save admin
    global_state.admin = ctx.accounts.admin.key();

    global_state.global_state_bump = global_state_bump;
    global_state.pool_count = 0;

    // disable public pool creation by default
    global_state.create_public_pools_disabled = true;

    Ok(())
}
