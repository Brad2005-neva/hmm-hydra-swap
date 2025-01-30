use crate::access_controls::{
    mints_keys::mints_keys, prices_keys::prices_keys, swap_enabled::swap_enabled,
};
use crate::constants::*;
use crate::errors::ErrorCode;
use crate::state::global_state::GlobalState;
use crate::state::limits::Limits;
use crate::state::pool_state::PoolState;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token;
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer};
use hydra_math::programs::fees::fee_calculator_wasm::compute_fees;
use hydra_math::programs::fees::fee_result::FeeResult;
use hydra_math::programs::liquidity_pools::swap_calculator_wasm::{
    swap_x_to_y_hmm, swap_y_to_x_hmm,
};
use hydra_math::programs::liquidity_pools::swap_result::SwapResult;

#[derive(Accounts)]
pub struct Swap<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [ GLOBAL_STATE_SEED ],
        bump = global_state.global_state_bump,
    )]
    pub global_state: Box<Account<'info, GlobalState>>,

    #[account(
        mut,
        seeds = [ POOL_STATE_SEED, pool_state.pool_id.to_le_bytes().as_ref() ],
        bump = pool_state.pool_state_bump,
        has_one = token_x_vault,
        has_one = token_y_vault,
        has_one = token_x_mint,
        has_one = token_y_mint,
        has_one = lp_token_mint,
    )]
    pub pool_state: Box<Account<'info, PoolState>>,

    #[account(
        mut,
        seeds = [ TOKEN_VAULT_SEED, pool_state.token_x_mint.as_ref(), pool_state.key().as_ref() ],
        bump,
        address = pool_state.token_x_vault,
    )]
    pub token_x_vault: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        seeds = [ TOKEN_VAULT_SEED, pool_state.token_y_mint.as_ref(), pool_state.key().as_ref() ],
        bump,
        address = pool_state.token_y_vault,
    )]
    pub token_y_vault: Box<Account<'info, TokenAccount>>,

    #[account(
        address = pool_state.token_x_mint
    )]
    pub token_x_mint: Box<Account<'info, Mint>>,

    #[account(
        address = pool_state.token_y_mint
    )]
    pub token_y_mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        seeds = [ LP_TOKEN_MINT_SEED, pool_state.key().as_ref() ],
        bump,
        address = pool_state.lp_token_mint
    )]
    pub lp_token_mint: Box<Account<'info, Mint>>,

    #[account(
        mut,
        associated_token::mint = user_from_token.mint,
        associated_token::authority = user,
    )]
    pub user_from_token: Box<Account<'info, TokenAccount>>,

    #[account(
        // custom constraint depends on direction as to which mint is target
        constraint = user_to_mint.key() == pool_state.token_x_mint || user_to_mint.key() == pool_state.token_y_mint,
    )]
    pub user_to_mint: Box<Account<'info, Mint>>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = user_to_mint,
        associated_token::authority = user,
    )]
    pub user_to_token: Box<Account<'info, TokenAccount>>,

    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> Swap<'info> {
    pub fn transfer_tokens_to_user(
        &self,
        from_account: AccountInfo<'info>,
    ) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: from_account,
            to: self.user_to_token.to_account_info(),
            authority: self.pool_state.to_account_info(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }

    pub fn transfer_user_tokens_to_vault(
        &self,
        to_account: AccountInfo<'info>,
    ) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.user_from_token.to_account_info(),
            to: to_account,
            authority: self.user.to_account_info(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }

    pub fn compute_fee_result(
        &self,
        amount: u64,
        amount_scale: u8,
        i: u64,
        i_scale: u8,
        fee_calculation: &str,
    ) -> Result<FeeResult> {
        let fee_result = compute_fees(
            fee_calculation,
            amount,
            amount_scale,
            self.pool_state.fees.fee_min_pct,
            self.pool_state.fees.fee_max_pct,
            self.pool_state.fees.fee_last_update,
            Clock::get().unwrap().unix_timestamp as u64,
            self.pool_state.fees.fee_last_price,
            i,
            i_scale,
            self.pool_state.fees.fee_last_ewma,
            self.pool_state.fees.fee_ewma_window,
            self.pool_state.fees.fee_lambda,
            self.pool_state.fees.fee_velocity,
        );

        match fee_result {
            Ok(fee_result) => Ok(From::from(fee_result)),
            Err(err) => Err(Error::AnchorError(AnchorError {
                error_name: String::from("FeeResultError"),
                error_code_number: 6000,
                error_msg: err,
                error_origin: None,
                compared_values: None,
            })),
        }
    }

    fn check_slippage(&self, amount_out_minimum: &u64, amount_out: &u64) -> Result<()> {
        if amount_out.lt(amount_out_minimum) {
            return Err(ErrorCode::SlippageExceeded.into());
        }

        Ok(())
    }

    fn check_limits(&self, amount_x: &u64, amount_y: &u64, limits: &Limits) -> Result<()> {
        if limits.enabled {
            require!(
                amount_x.le(&limits.swap_token_x_max),
                ErrorCode::LimitsExceededSwapTokenX
            );

            require!(
                amount_y.le(&limits.swap_token_y_max),
                ErrorCode::LimitsExceededSwapTokenY
            );
        }

        Ok(())
    }
}

#[access_control(
    mints_keys(&ctx)
    prices_keys(&ctx.remaining_accounts, &ctx.accounts.pool_state)
    swap_enabled(&ctx.accounts.global_state)
)]
pub fn handle(ctx: Context<Swap>, amount_in: u64, amount_out_minimum: u64) -> Result<()> {
    let seeds = &[
        POOL_STATE_SEED,
        &ctx.accounts.pool_state.pool_id.to_le_bytes(),
        &[ctx.accounts.pool_state.pool_state_bump],
    ];
    let signer = [&seeds[..]];

    let x0 = ctx.accounts.token_x_vault.amount;
    let x_scale = ctx.accounts.token_x_mint.decimals;
    let y0 = ctx.accounts.token_y_vault.amount;
    let y_scale = ctx.accounts.token_y_mint.decimals;
    let c = ctx.accounts.pool_state.c_value;
    let (i, i_scale) = ctx
        .accounts
        .pool_state
        .prices
        .get_oracle_price(ctx.remaining_accounts)
        .unwrap_or((0, 0));

    let x_to_y = ctx.accounts.user_from_token.mint == ctx.accounts.pool_state.token_x_mint;
    let y_to_x = ctx.accounts.user_from_token.mint == ctx.accounts.pool_state.token_y_mint;

    let fee_calculation = ctx.accounts.pool_state.fees.fee_calculation.as_str();

    let fee_result = if x_to_y {
        ctx.accounts
            .compute_fee_result(amount_in, x_scale, i, i_scale, fee_calculation)
    } else {
        ctx.accounts
            .compute_fee_result(amount_in, y_scale, i, i_scale, fee_calculation)
    }?;

    if x_to_y {
        require!(
            ctx.accounts.user_to_token.mint == ctx.accounts.pool_state.token_y_mint,
            ErrorCode::InvalidTokenMintForUserToMint
        );

        let delta_x = fee_result.amount_ex_fee;

        let swap_result = swap_x_to_y_hmm(x0, x_scale, y0, y_scale, c, i, i_scale, delta_x);

        let swap_result: SwapResult = match swap_result {
            Ok(swap_result) => From::from(swap_result),
            Err(err) => {
                return Err(Error::AnchorError(AnchorError {
                    error_name: String::from("SwapResultError"),
                    error_code_number: 6001,
                    error_msg: err,
                    error_origin: None,
                    compared_values: None,
                }))
            }
        };

        let amount_out = swap_result.delta_y;

        ctx.accounts
            .check_slippage(&amount_out_minimum, &amount_out)?;

        ctx.accounts
            .check_limits(&amount_in, &amount_out, &ctx.accounts.pool_state.limits)?;

        token::transfer(
            ctx.accounts
                .transfer_user_tokens_to_vault(ctx.accounts.token_x_vault.to_account_info()),
            amount_in,
        )?;

        token::transfer(
            ctx.accounts
                .transfer_tokens_to_user(ctx.accounts.token_y_vault.to_account_info())
                .with_signer(&signer),
            amount_out,
        )?;
    }

    if y_to_x {
        require!(
            ctx.accounts.user_to_token.mint == ctx.accounts.pool_state.token_x_mint,
            ErrorCode::InvalidTokenMintForUserToMint
        );

        let delta_y = fee_result.amount_ex_fee;

        let swap_result = swap_y_to_x_hmm(x0, x_scale, y0, y_scale, c, i, i_scale, delta_y);

        let swap_result: SwapResult = match swap_result {
            Ok(swap_result) => From::from(swap_result),
            Err(err) => {
                return Err(Error::AnchorError(AnchorError {
                    error_name: String::from("SwapResultError"),
                    error_code_number: 6002,
                    error_msg: err,
                    error_origin: None,
                    compared_values: None,
                }))
            }
        };

        let amount_out = swap_result.delta_x;

        ctx.accounts
            .check_slippage(&amount_out_minimum, &amount_out)?;

        ctx.accounts
            .check_limits(&amount_out, &amount_in, &ctx.accounts.pool_state.limits)?;

        token::transfer(
            ctx.accounts
                .transfer_user_tokens_to_vault(ctx.accounts.token_y_vault.to_account_info()),
            amount_in,
        )?;

        token::transfer(
            ctx.accounts
                .transfer_tokens_to_user(ctx.accounts.token_x_vault.to_account_info())
                .with_signer(&signer),
            amount_out,
        )?;
    }

    if ctx.accounts.pool_state.fees.fee_min_pct.gt(&0)
        && ctx.accounts.pool_state.fees.fee_max_pct.gt(&0)
    {
        ctx.accounts.pool_state.fees.fee_last_update = fee_result.fee_last_update;
        ctx.accounts.pool_state.fees.fee_last_price = fee_result.fee_last_price;
        ctx.accounts.pool_state.fees.fee_last_ewma = fee_result.fee_last_ewma;
    }

    Ok(())
}
