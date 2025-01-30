use crate::constants::*;
use crate::errors::*;
use crate::state::faucet_state::*;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, InitializeMint, Mint, Token};
use solana_program::program::invoke;
use solana_program::system_instruction;

#[derive(Accounts)]
#[instruction(faucet_state_bump: u8)]
pub struct InitFaucet<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        space = FaucetState::LEN,
        payer = payer,
        seeds = [ FAUCET_STATE_SEED, token_mint.key().as_ref() ],
        bump,
        rent_exempt = enforce,
    )]
    pub faucet_state: Box<Account<'info, FaucetState>>,

    /// token_mint
    #[account(mut)]
    pub token_mint: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handle(ctx: Context<InitFaucet>, faucet_state_bump: u8, token_decimal: u8) -> Result<()> {
    let token_mint = &mut &ctx.accounts.token_mint;
    ctx.accounts.faucet_state.token_mint = token_mint.key();
    ctx.accounts.faucet_state.faucet_state_bump = faucet_state_bump;
    ctx.accounts.faucet_state.token_mint_decimals = token_decimal;

    require!(
        !ctx.accounts.token_mint.owner.eq(&Token::id()),
        FaucetError::AlreadyCreatedMint
    );

    let rent = &mut &ctx.accounts.rent;
    let token_program = &mut &ctx.accounts.token_program;
    let system_program = &mut &ctx.accounts.system_program;
    let seeds = &[
        FAUCET_STATE_SEED,
        token_mint.key.as_ref(),
        &[faucet_state_bump],
    ];
    let signer = &[&seeds[..]];

    let size: u64 = Mint::LEN as u64;
    let required_lamports = rent
        .minimum_balance(size as usize)
        .max(1)
        .saturating_sub(token_mint.lamports());
    invoke(
        &system_instruction::create_account(
            ctx.accounts.payer.key,
            token_mint.key,
            required_lamports,
            size,
            token_program.key,
        ),
        &[
            ctx.accounts.payer.to_account_info().clone(),
            token_mint.to_account_info().clone(),
            system_program.to_account_info().clone(),
            token_program.to_account_info().clone(),
            rent.to_account_info().clone(),
        ],
    )?;

    let cpi_accounts = InitializeMint {
        mint: token_mint.to_account_info().clone(),
        rent: rent.to_account_info().clone(),
    };
    token::initialize_mint(
        CpiContext::new_with_signer(
            token_program.clone().to_account_info(),
            cpi_accounts,
            signer,
        ),
        token_decimal,
        &ctx.accounts.faucet_state.key(),
        Some(&ctx.accounts.faucet_state.key()),
    )?;

    Ok(())
}
