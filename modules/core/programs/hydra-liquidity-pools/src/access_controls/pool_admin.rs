use crate::errors::ErrorCode;
use crate::state::pool_state::PoolState;
use anchor_lang::prelude::*;

pub fn pool_admin(pool_state: &PoolState, admin: &Signer) -> Result<()> {
    require_keys_eq!(admin.key(), pool_state.admin, ErrorCode::InvalidPoolAdmin);

    Ok(())
}
