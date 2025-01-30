use crate::constants::*;
use crate::state::global_state::*;
use crate::access_controls::global_admin::global_admin;
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction()]
pub struct SetFeature<'info> {
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
pub fn handle(ctx: Context<SetFeature>, feature_type: FeatureType, value: bool) -> Result<()> {
    let global_state = &mut ctx.accounts.global_state;

    match feature_type {
        FeatureType::Swap => {
            global_state.swap_disabled = value;
        }

        FeatureType::AddLiquidity => {
            global_state.add_liquidity_disabled = value;
        }

        FeatureType::RemoveLiquidity => {
            global_state.remove_liquidity_disabled = value;
        }

        FeatureType::CreatePublicPools => {
            global_state.create_public_pools_disabled = value;
        }

        FeatureType::All => {
            global_state.swap_disabled = value;
            global_state.add_liquidity_disabled = value;
            global_state.remove_liquidity_disabled = value;
            global_state.create_public_pools_disabled = value;
        }
    }

    Ok(())
}
