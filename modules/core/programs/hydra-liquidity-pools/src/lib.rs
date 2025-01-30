mod access_controls;
mod errors;
mod events;
mod instructions;
mod state;

use instructions::add_liquidity::*;
use instructions::initialize_global_state::*;
use instructions::initialize_pool_state::*;
use instructions::remove_liquidity::*;
use instructions::set_c_value::*;
use instructions::set_feature::*;
use instructions::set_fees::*;
use instructions::set_limits::*;
use instructions::set_prices_owner::*;
use instructions::swap::*;
use instructions::transfer_global_admin::*;
use instructions::transfer_pool_admin::*;
use state::fees::Fees;
use state::global_state::FeatureType;
use state::limits::Limits;

use anchor_lang::prelude::*;

declare_id!("HXSFUHtZxxj2MvSfpoqKWKeSKCeER3Br6rpbe3Qr8NS9");

pub mod constants {
    pub const GLOBAL_STATE_SEED: &[u8] = b"global_state_seed";
    pub const LP_TOKEN_VAULT_SEED: &[u8] = b"lp_token_vault_seed";
    pub const LP_TOKEN_MINT_SEED: &[u8] = b"lp_token_mint_seed";
    pub const TOKEN_VAULT_SEED: &[u8] = b"token_vault_seed";
    pub const POOL_STATE_SEED: &[u8] = b"pool_state_seed";
}

#[program]
pub mod hydra_liquidity_pools {
    use super::*;
    use crate::state::limits::Limits;
    use solana_security_txt::security_txt;

    /// Initializes a HydraSwap global state account.
    /// Deployer becomes the initial admin of global state.
    ///
    /// ### Parameters
    /// - `global_state_bump` - The bump value when deriving the PDA of the program address.
    ///
    pub fn initialize_global_state(
        ctx: Context<InitializeGlobalState>,
        global_state_bump: u8,
    ) -> Result<()> {
        instructions::initialize_global_state::handle(ctx, global_state_bump)
    }

    /// Initializes a HydraSwap pool state account.
    /// Global admin becomes the initial admin of pool state.
    ///
    /// ### Parameters
    /// - `token_x_vault_bump` - The bump value when deriving the PDA of token X.
    /// - `token_y_vault_bump` - The bump value when deriving the PDA of token X.
    /// - `pool_state_bump` - The bump value when deriving the PDA of pool state.
    /// - `lp_token_vault_bump` - The bump value when deriving the PDA of liquidity pool token vault.
    /// - `lp_token_mint_bump` - The bump value when deriving the PDA of liquidity pool token mint.
    /// - `c_value` - The compensation value (c) of the HMM algorithm.
    /// - `fees` - The fee configuration for the liquidity pool.
    ///
    /// #### Special Errors
    /// `OracleAccountsMissing` - Oracle pricing accounts not provided when using c > 0
    /// `CreatePublicPoolDisabled` - Public creation of pool state as non-global admin is disabled
    /// `InvalidCValue` - Compensation value (c) can only be 0, 100, 125 or 150
    ///
    #[allow(clippy::too_many_arguments)]
    pub fn initialize_pool_state(
        ctx: Context<InitializePoolState>,
        token_x_vault_bump: u8,
        token_y_vault_bump: u8,
        pool_state_bump: u8,
        lp_token_vault_bump: u8,
        lp_token_mint_bump: u8,
        c_value: u8,
        fees: Fees,
    ) -> Result<()> {
        instructions::initialize_pool_state::handle(
            ctx,
            token_x_vault_bump,
            token_y_vault_bump,
            pool_state_bump,
            lp_token_vault_bump,
            lp_token_mint_bump,
            c_value,
            fees,
        )
    }

    /// Transfer admin of global state to another address.
    /// Restricted to global admin.
    ///
    /// ### Parameters
    /// - `new_admin` - The new address for global admin.
    ///
    /// #### Special Errors
    /// `InvalidGlobalAdmin` - Global state admin does not match the address of account provided
    ///
    pub fn transfer_global_admin(
        ctx: Context<TransferGlobalAdmin>,
        new_admin: Pubkey,
    ) -> Result<()> {
        instructions::transfer_global_admin::handle(ctx, new_admin)
    }

    /// Transfer admin of pool state to another address.
    /// Restricted to pool admin.
    ///
    /// ### Parameters
    /// - `new_admin` - The new address for pool admin.
    ///
    /// #### Special Errors
    /// `InvalidPoolAdmin` - Pool state admin does not match the address of account provided
    ///
    pub fn transfer_pool_admin(ctx: Context<TransferPoolAdmin>, new_admin: Pubkey) -> Result<()> {
        instructions::transfer_pool_admin::handle(ctx, new_admin)
    }

    /// Set pool state level feature flags.
    /// Restricted to global admin.
    ///
    /// ### Parameters
    /// - `feature_type` - The feature flag being set [Swap, AddLiquidity, RemoveLiquidity, CreatePublicPools, All]
    /// - `value` - The boolean value of the feature flag.
    ///
    pub fn set_feature(
        ctx: Context<SetFeature>,
        feature_type: FeatureType,
        value: bool,
    ) -> Result<()> {
        instructions::set_feature::handle(ctx, feature_type, value)
    }

    /// Set prices owner of oracle accounts
    /// Restricted to pool admin.
    ///
    /// ### Parameters
    /// - `new_owner` - The new address for owner of oracle accounts.
    ///
    pub fn set_prices_owner(ctx: Context<SetPricesOwner>, new_owner: Pubkey) -> Result<()> {
        instructions::set_prices_owner::handle(ctx, new_owner)
    }

    /// Set pool state level fees.
    /// Restricted to pool admin.
    ///
    /// ### Parameters
    /// - `fee_calculation` - The fee calculation method to use <Percent, VolatilityAdjusted>
    /// - `fee_min_pct` - The fee minimum percentage for both percent and volatility adjusted
    /// - `fee_max_pct` - The volatility adjusted fee maximum percentage
    /// - `fee_last_ewma` - The volatility adjusted fee exponentially weighted moving average (EWMA) variance
    /// - `fee_ewma_window` - The volatility adjusted fee EWMA window in seconds
    /// - `fee_lambda` - The volatility adjusted fee calibrated lambda
    /// - `fee_velocity` - The volatility adjusted fee calibrated velocity
    /// #### Special Errors
    /// `InvalidFeePercentage` - The input fee percentage was outside range of 0 - 100%
    ///
    #[allow(clippy::too_many_arguments)]
    pub fn set_fees(
        ctx: Context<SetFees>,
        fee_calculation: String,
        fee_min_pct: Option<u64>,
        fee_max_pct: Option<u64>,
        fee_last_ewma: Option<u64>,
        fee_ewma_window: Option<u64>,
        fee_lambda: Option<u64>,
        fee_velocity: Option<u64>,
    ) -> Result<()> {
        instructions::set_fees::handle(
            ctx,
            fee_calculation,
            fee_min_pct,
            fee_max_pct,
            fee_ewma_window,
            fee_last_ewma,
            fee_lambda,
            fee_velocity,
        )
    }

    /// Set pool state compensation value.
    /// Restricted to pool admin.
    ///
    /// ### Parameters
    /// - `c_value` - The compensation value (c) of the HMM algorithm.
    /// #### Special Errors
    /// `InvalidCValue` - Compensation value (c) can only be 0, 100, 125 or 150
    ///
    pub fn set_c_value(ctx: Context<SetCValue>, c_value: u8) -> Result<()> {
        instructions::set_c_value::handle(ctx, c_value)
    }

    /// Set pool state limits.
    /// Restricted to pool admin.
    ///
    /// ### Parameters
    /// - `limits` - The limits of the pool state for add/remove liquidity and swap in/out amounts.
    ///
    pub fn set_limits(ctx: Context<SetLimits>, limits: Limits) -> Result<()> {
        instructions::set_limits::handle(ctx, limits)
    }

    /// Add liquidity to a liquidity pool
    /// Public.
    ///
    /// ### Parameters
    /// - `x_amount` - The amount of token X being deposited to the liquidity pool.
    /// - `y_amount` - The amount of token Y being deposited to the liquidity pool.
    /// - `x_amount_max` - The maximum amount of token X being deposited to the liquidity pool.
    /// - `y_amount_max` - The maximum amount of token Y being deposited to the liquidity pool.
    ///
    pub fn add_liquidity(
        ctx: Context<AddLiquidity>,
        x_amount: u64,
        y_amount: u64,
        x_amount_max: u64,
        y_amount_max: u64,
    ) -> Result<()> {
        instructions::add_liquidity::handle(ctx, x_amount, y_amount, x_amount_max, y_amount_max)
    }

    /// Remove liquidity from a liquidity pool
    /// Public.
    ///
    /// ### Parameters
    /// - `liquidity` - The amount of liquidity being withdrawn from a liquidity pool.
    ///
    pub fn remove_liquidity(
        ctx: Context<RemoveLiquidity>,
        liquidity: u64, // calculate the % client side
    ) -> Result<()> {
        instructions::remove_liquidity::handle(ctx, liquidity)
    }

    /// Swap tokens within a liquidity pool
    /// Public.
    ///
    /// ### Parameters
    /// - `amount_in` - The amount in of token X/Y being swapped.
    /// - `minimum_amount_out` - The minimum amount out of token X/Y being swapped.
    ///
    pub fn swap(ctx: Context<Swap>, amount_in: u64, minimum_amount_out: u64) -> Result<()> {
        instructions::swap::handle(ctx, amount_in, minimum_amount_out)
    }

    security_txt! {
        name: "HydraSwap",
        project_url: "https://hydraswap.io/",
        contacts: "email:security@hydraswap.io,link:https://discord.gg/AA26dw6Hpm",
        policy: "https://hydraswap.io/terms-and-condition",

        // Optional Fields
        preferred_languages: "en",
        source_code: "https://github.com/hydraswap-io",
        auditors: "None",
        acknowledgements: "
    The following hackers could've stolen all our money but didn't:
    - Correkthorse
    "
    }
}
