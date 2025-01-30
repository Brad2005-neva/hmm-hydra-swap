use crate::errors::ErrorCode;
use crate::state::global_state::GlobalState;
use anchor_lang::prelude::*;

pub fn add_liquidity_enabled(global_state: &GlobalState) -> Result<()> {
    require!(
        global_state.is_enabled_add_liquidity(),
        ErrorCode::AddLiquidityDisabled
    );

    Ok(())
}
