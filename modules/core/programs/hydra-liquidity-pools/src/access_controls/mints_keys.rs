use crate::Swap;
use anchor_lang::prelude::*;

pub fn mints_keys(ctx: &Context<Swap>) -> Result<()> {
    let x_to_y = ctx.accounts.user_from_token.mint == ctx.accounts.pool_state.token_x_mint;

    if x_to_y {
        require_keys_eq!(
            ctx.accounts.user_from_token.mint,
            ctx.accounts.pool_state.token_x_mint
        );

        require_keys_eq!(
            ctx.accounts.user_to_token.mint,
            ctx.accounts.pool_state.token_y_mint
        );
    } else {
        require_keys_eq!(
            ctx.accounts.user_from_token.mint,
            ctx.accounts.pool_state.token_y_mint
        );

        require_keys_eq!(
            ctx.accounts.user_to_token.mint,
            ctx.accounts.pool_state.token_x_mint
        );
    }

    Ok(())
}
