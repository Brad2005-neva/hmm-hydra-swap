use anchor_lang::prelude::*;

declare_id!("2kYXEXWi99JG3yAWeqeDfa5vjEkK1Wup2oTo7pZnuGyh");

#[program]
pub mod hydra_benchmarks {
    use super::*;
    use anchor_lang::solana_program::log::sol_log_compute_units;
    use hydra_math::decimal::base::Decimal;
    use hydra_math::decimal::ops::{Ln, Neg, Pow, Sqrt};
    use hydra_math::decimal::BigDecimal;
    use hydra_math::programs::fees::fee_calculator_wasm::compute_fees;
    use hydra_math::programs::liquidity_pools::swap_calculator_wasm::swap_x_to_y_hmm;

    pub fn decimal_bench(_ctx: Context<Initialize>) -> Result<()> {
        sol_log_compute_units();
        let value = Decimal::from_u64(10).to_compute_scale();
        sol_log_compute_units();
        msg!("[BENCHMARK] Decimal::from_u64: {:?}", value);
        Ok(())
    }

    pub fn big_decimal_bench(_ctx: Context<Initialize>) -> Result<()> {
        sol_log_compute_units();
        let value = BigDecimal::from_u128(10).to_compute_scale();
        sol_log_compute_units();
        msg!("[BENCHMARK] BigDecimal::from_u128: {:?}", value);
        Ok(())
    }

    pub fn ln_bench(_ctx: Context<Initialize>) -> Result<()> {
        sol_log_compute_units();
        let value = Decimal::new(u64::MAX as u128, 12, false);
        let ln_value = value.ln().unwrap();
        sol_log_compute_units();
        msg!("[BENCHMARK] ln(n): {:?}", ln_value);
        Ok(())
    }

    pub fn sqrt_bench(_ctx: Context<Initialize>) -> Result<()> {
        sol_log_compute_units();
        let value = Decimal::from_u64(10).to_compute_scale();
        let sqrt = value.sqrt().unwrap();
        sol_log_compute_units();
        msg!("[BENCHMARK] sqrt(n): {:?}", sqrt);
        Ok(())
    }

    pub fn pow_bench(_ctx: Context<Initialize>) -> Result<()> {
        sol_log_compute_units();
        let value = BigDecimal::from_u128(6000).to_compute_scale();
        let pow = value.pow(Decimal::one_point_five().neg().into());
        sol_log_compute_units();
        msg!("[BENCHMARK] 6000.pow(-1.5): {:?}", pow);
        Ok(())
    }

    pub fn fees_bench(_ctx: Context<Initialize>) -> Result<()> {
        let now = Clock::get().unwrap().unix_timestamp as u64;
        sol_log_compute_units();
        let fee_results = compute_fees(
            "VolatilityAdjusted",
            3_000000,
            6,
            500000000,
            20000000000,
            0,
            now,
            0,
            34_000000,
            6,
            17836758,
            3600,
            545000000000,
            4166666667,
        )
        .expect("fee results");
        sol_log_compute_units();
        msg!("[BENCHMARK] compute_fees: {:?}", fee_results);
        Ok(())
    }

    pub fn swap_bench(_ctx: Context<Initialize>) -> Result<()> {
        sol_log_compute_units();
        let swap_results = swap_x_to_y_hmm(37_000000, 6, 126_000000, 6, 100, 3_000000, 6, 3_000000)
            .expect("swap results");
        sol_log_compute_units();
        msg!("[BENCHMARK] swap_x_to_y_hmm: {:?}", swap_results);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
