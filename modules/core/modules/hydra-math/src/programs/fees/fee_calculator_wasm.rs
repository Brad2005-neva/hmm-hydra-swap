use crate::decimal::base::COMPUTE_SCALE;
use crate::decimal::Decimal;
use crate::programs::fees::fee_calculator::{FeeCalculation, FeeCalculatorBuilder};
use wasm_bindgen::prelude::wasm_bindgen;

/// Interface to be used by programs and front end
/// these functions shadow functions of the implemented fee calculator
#[wasm_bindgen]
#[allow(clippy::too_many_arguments)]
pub fn compute_fees(
    fee_calculation: &str,

    amount: u64,
    amount_scale: u8,

    fee_min_pct: u64,
    fee_max_pct: u64,

    fee_last_update: u64,
    fee_this_update: u64,

    fee_last_price: u64,
    fee_this_price: u64,
    fee_this_price_scale: u8,

    fee_last_ewma: u64,
    fee_ewma_window: u64,
    fee_lambda: u64,
    fee_velocity: u64,
) -> Result<Vec<u64>, String> {
    let amount = Decimal::from_scaled_amount(amount, amount_scale);

    let fee_min_pct = Decimal::from_scaled_amount(fee_min_pct, COMPUTE_SCALE);
    let fee_max_pct = Decimal::from_scaled_amount(fee_max_pct, COMPUTE_SCALE);

    let fee_last_update = Decimal::from_u64(fee_last_update).to_compute_scale();
    let fee_this_update = Decimal::from_u64(fee_this_update).to_compute_scale();

    let fee_last_price = Decimal::from_scaled_amount(fee_last_price, COMPUTE_SCALE);
    let fee_this_price =
        Decimal::from_scaled_amount(fee_this_price, fee_this_price_scale).to_compute_scale();

    let fee_last_ewma = Decimal::from_scaled_amount(fee_last_ewma, COMPUTE_SCALE);
    let fee_ewma_window = Decimal::from_scaled_amount(fee_ewma_window, COMPUTE_SCALE);
    let fee_lambda = Decimal::from_scaled_amount(fee_lambda, COMPUTE_SCALE);
    let fee_velocity = Decimal::from_scaled_amount(fee_velocity, COMPUTE_SCALE);

    let fee_result = match fee_calculation {
        "VolatilityAdjusted" => FeeCalculatorBuilder::default()
            .fee_calculation(FeeCalculation::VolatilityAdjusted)
            .fee_min_pct(fee_min_pct)
            .fee_max_pct(fee_max_pct)
            .fee_last_update(fee_last_update)
            .fee_this_update(fee_this_update)
            .fee_last_price(fee_last_price)
            .fee_this_price(fee_this_price)
            .fee_last_ewma(fee_last_ewma)
            .fee_ewma_window(fee_ewma_window)
            .fee_lambda(fee_lambda)
            .fee_velocity(fee_velocity)
            .build()
            .expect("failed to build FeeCalculator")
            .compute_fees(&amount)
            .map_err(|e| e.to_string())?,
        _ => FeeCalculatorBuilder::default()
            .fee_calculation(FeeCalculation::Percent)
            .fee_min_pct(fee_min_pct)
            .build()
            .expect("failed to build percent based FeeCalculator")
            .compute_fees(&amount)
            .map_err(|e| e.to_string())?,
    };

    Ok(fee_result.into())
}
