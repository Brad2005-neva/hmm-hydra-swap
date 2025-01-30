use crate::errors::ErrorCode;
use crate::state::global_state::GlobalState;
use anchor_lang::prelude::*;

pub fn create_public_pool_enabled(global_state: &GlobalState, admin: &Signer) -> Result<()> {
    if !global_state.is_enabled_create_public_pools() {
        require!(
            global_state.is_admin(&admin.key()),
            ErrorCode::CreatePublicPoolDisabled
        );
    }

    Ok(())
}
