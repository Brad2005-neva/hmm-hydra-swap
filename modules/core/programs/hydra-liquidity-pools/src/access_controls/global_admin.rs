use crate::errors::ErrorCode;
use crate::state::global_state::GlobalState;
use anchor_lang::prelude::*;

pub fn global_admin(global_state: &GlobalState, admin: &Signer) -> Result<()> {
    require!(
        global_state.is_admin(&admin.key()),
        ErrorCode::InvalidGlobalAdmin
    );

    Ok(())
}
