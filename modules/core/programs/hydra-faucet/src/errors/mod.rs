use anchor_lang::prelude::*;

#[error_code]
pub enum FaucetError {
    #[msg("Another Token is already Exist with the Mint")]
    AlreadyCreatedMint,
}
