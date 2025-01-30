use crate::constants::*;
use crate::state::faucet_state::FaucetState;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token::{self, Mint, MintTo, Token, TokenAccount};

#[derive(Accounts)]
pub struct MintToken<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [ FAUCET_STATE_SEED, token_mint.key().as_ref() ],
        bump,
    )]
    pub faucet_state: Box<Account<'info, FaucetState>>,

    #[account(
        mut,
        address = faucet_state.token_mint,
    )]
    pub token_mint: Box<Account<'info, Mint>>,

    /// CHECK: This is not dangerous because the recipient account is used for only the ata
    pub recipient: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = token_mint,
        associated_token::authority = recipient
    )]
    pub user_token_account: Box<Account<'info, TokenAccount>>,

    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handle(ctx: Context<MintToken>, token_amount: u64) -> Result<()> {
    let faucet_state = &mut &ctx.accounts.faucet_state;

    let mint_amount: u64 = 10_u64
        .checked_pow(faucet_state.token_mint_decimals as u32)
        .unwrap_or_else(|| {
            panic!(
                "mint_tokens: overflow while calculate the mint_amount decimal with checked_pow()"
            )
        })
        .checked_mul(token_amount)
        .unwrap_or_else(|| {
            panic!("mint_tokens: overflow while calculate the mint_amount with checked_mul()")
        });

    let seeds = &[
        FAUCET_STATE_SEED,
        faucet_state.token_mint.as_ref(),
        &[faucet_state.faucet_state_bump],
    ];
    let signer = &[&seeds[..]];

    let cpi_accounts = MintTo {
        mint: ctx.accounts.token_mint.to_account_info().clone(),
        to: ctx.accounts.user_token_account.to_account_info().clone(),
        authority: ctx.accounts.faucet_state.to_account_info().clone(),
    };
    token::mint_to(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info().clone(),
            cpi_accounts,
            signer,
        ),
        mint_amount,
    )?;

    Ok(())
}
