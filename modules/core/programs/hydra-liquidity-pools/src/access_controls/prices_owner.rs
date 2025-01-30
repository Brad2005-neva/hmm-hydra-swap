use crate::state::global_state::GlobalState;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::system_program;

pub fn prices_owner(remaining_accounts: &[AccountInfo], global_state: &GlobalState) -> Result<()> {
    if remaining_accounts.len() == 2 {
        for unchecked_account in remaining_accounts {
            require!(
                unchecked_account.owner.key() == global_state.prices_owner.key(),
                ErrorCode::AccountOwnedByWrongProgram
            );

            require!(
                unchecked_account.owner != &system_program::ID && unchecked_account.lamports() != 0,
                ErrorCode::AccountNotInitialized
            );
        }

        Ok(())
    } else {
        Ok(())
    }
}
