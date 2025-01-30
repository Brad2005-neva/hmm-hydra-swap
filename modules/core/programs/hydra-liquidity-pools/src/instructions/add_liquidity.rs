use crate::constants::*;
use crate::errors::ErrorCode;
use crate::events::liquidity_added::LiquidityAdded;
use crate::events::slippage_exceeded::SlippageExceeded;
use crate::state::global_state::GlobalState;
use crate::state::limits::Limits;
use crate::state::pool_state::PoolState;
use crate::access_controls::add_liquidity_enabled::add_liquidity_enabled;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token;
use anchor_spl::token::{Mint, MintTo, Token, TokenAccount, Transfer};
use hydra_math::programs::liquidity_pools::liquidity_calculator::LIQUIDITY_MINIMUM;
use hydra_math::programs::liquidity_pools::liquidity_calculator_wasm::compute_liquidity_add;
use hydra_math::programs::liquidity_pools::liquidity_result::LiquidityResult;

#[derive(Accounts)]
pub struct AddLiquidity<'info> {
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
        address = pool_state.token_x_mint,
    )]
    pub token_x_mint: Box<Account<'info, Mint>>,

    #[account(
        address = pool_state.token_y_mint,
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
        associated_token::mint = token_x_mint,
        associated_token::authority = user,
    )]
    pub user_token_x: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = token_y_mint,
        associated_token::authority = user,
    )]
    pub user_token_y: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        seeds = [ LP_TOKEN_VAULT_SEED, lp_token_mint.key().as_ref() ],
        bump,
        // custom constraint matches owner to mint_authority
        constraint = lp_token_vault.owner == lp_token_mint.mint_authority.unwrap()
    )]
    pub lp_token_vault: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = user,
        associated_token::mint = lp_token_mint,
        associated_token::authority = user
    )]
    pub lp_token_to: Box<Account<'info, TokenAccount>>,

    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

impl<'info> AddLiquidity<'info> {
    pub fn transfer_x_amount_to_vault(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.user_token_x.to_account_info(),
            to: self.token_x_vault.to_account_info(),
            authority: self.user.to_account_info(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }

    pub fn transfer_y_amount_to_vault(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        let cpi_accounts = Transfer {
            from: self.user_token_y.to_account_info(),
            to: self.token_y_vault.to_account_info(),
            authority: self.user.to_account_info(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }

    pub fn mint_liquidity_to_user(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        let cpi_accounts = MintTo {
            mint: self.lp_token_mint.to_account_info(),
            to: self.lp_token_to.to_account_info(),
            authority: self.pool_state.to_account_info(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }

    pub fn mint_liquidity_to_vault(&self) -> CpiContext<'_, '_, '_, 'info, MintTo<'info>> {
        let cpi_accounts = MintTo {
            mint: self.lp_token_mint.to_account_info(),
            to: self.lp_token_vault.to_account_info(),
            authority: self.pool_state.to_account_info(),
        };
        let cpi_program = self.token_program.to_account_info();
        CpiContext::new(cpi_program, cpi_accounts)
    }

    pub fn check_limits(&self, amount_x: &u64, amount_y: &u64, limits: &Limits) -> Result<()> {
        if limits.enabled {
            require!(
                amount_x.le(&limits.liquidity_token_x_max),
                ErrorCode::LimitsExceededLiquidityTokenX
            );

            require!(
                amount_y.le(&limits.liquidity_token_y_max),
                ErrorCode::LimitsExceededLiquidityTokenY
            );
        }

        Ok(())
    }
}

#[access_control(add_liquidity_enabled(&ctx.accounts.global_state))]
pub fn handle(
    ctx: Context<AddLiquidity>,
    x_amount: u64,
    y_amount: u64,
    x_amount_max: u64,
    y_amount_max: u64,
) -> Result<()> {
    let seeds = &[
        POOL_STATE_SEED,
        &ctx.accounts.pool_state.pool_id.to_le_bytes(),
        &[ctx.accounts.pool_state.pool_state_bump],
    ];
    let signer = [&seeds[..]];

    let x_scale = ctx.accounts.token_x_mint.decimals;
    let y_scale = ctx.accounts.token_y_mint.decimals;
    let x_reserve = ctx.accounts.token_x_vault.amount;
    let y_reserve = ctx.accounts.token_y_vault.amount;
    let liquidity_total = ctx.accounts.lp_token_mint.supply;
    let liquidity_scale = ctx.accounts.lp_token_mint.decimals;

    let liquidity_result = compute_liquidity_add(
        x_amount,
        x_scale,
        y_amount,
        y_scale,
        x_reserve,
        y_reserve,
        liquidity_total,
        liquidity_scale,
    );

    let liquidity_result: LiquidityResult = match liquidity_result {
        Ok(liquidity_result) => From::from(liquidity_result),
        Err(err) => {
            return Err(Error::AnchorError(AnchorError {
                error_name: String::from("AddLiquidityResultError"),
                error_code_number: 6003,
                error_msg: err,
                error_origin: None,
                compared_values: None,
            }))
        }
    };

    let liquidity = liquidity_result.liquidity;
    let x_amount_adjusted = liquidity_result.x_amount;
    let y_amount_adjusted = liquidity_result.y_amount;

    if (x_amount_adjusted.gt(&x_amount_max)) || (y_amount_adjusted.gt(&y_amount_max)) {
        emit!(SlippageExceeded {
            x_amount_adjusted,
            y_amount_adjusted,
            x_amount_max,
            y_amount_max,
        });
        return Err(ErrorCode::SlippageExceeded.into());
    }

    ctx.accounts.check_limits(
        &x_amount_adjusted,
        &y_amount_adjusted,
        &ctx.accounts.pool_state.limits,
    )?;

    if liquidity_total.eq(&0) {
        token::mint_to(
            ctx.accounts.mint_liquidity_to_vault().with_signer(&signer),
            LIQUIDITY_MINIMUM as u64,
        )?;
    }

    token::mint_to(
        ctx.accounts.mint_liquidity_to_user().with_signer(&signer),
        liquidity,
    )?;

    token::transfer(ctx.accounts.transfer_x_amount_to_vault(), x_amount)?;

    token::transfer(ctx.accounts.transfer_y_amount_to_vault(), y_amount)?;

    emit!(LiquidityAdded {
        x_amount,
        y_amount,
        liquidity,
    });

    Ok(())
}
