use crate::errors::ErrorCode;
use crate::state::global_state::GlobalState;
use anchor_lang::prelude::*;

pub fn swap_enabled(global_state: &GlobalState) -> Result<()> {
    require!(global_state.is_enabled_swap(), ErrorCode::SwapDisabled);

    Ok(())
}
