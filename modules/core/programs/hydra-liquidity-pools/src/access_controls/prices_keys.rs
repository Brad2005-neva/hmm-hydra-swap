use crate::state::pool_state::PoolState;
use anchor_lang::prelude::*;

pub fn prices_keys(
    remaining_accounts: &[AccountInfo],
    pool_state: &PoolState,
) -> Result<()> {
    if remaining_accounts.len() == 2 {
        let price_account_x = &remaining_accounts[0];
        let price_account_y = &remaining_accounts[1];
        require_keys_eq!(
            price_account_x.key(),
            pool_state.prices.price_account_x.key()
        );

        require_keys_eq!(
            price_account_y.key(),
            pool_state.prices.price_account_y.key()
        );

        Ok(())
    } else {
        Ok(())
    }
}
