use crate::decimal::ops::Div;
use crate::decimal::Decimal;
use crate::programs::liquidity_pools::swap_calculator::{SwapCalculator, SwapCalculatorBuilder};
use wasm_bindgen::prelude::wasm_bindgen;

/// Interface to be used by programs and front end
/// these functions shadow functions of the implemented swap calculator
#[wasm_bindgen]
#[allow(clippy::too_many_arguments)]
pub fn swap_x_to_y_hmm(
    x0: u64,
    x_scale: u8,
    y0: u64,
    y_scale: u8,
    c: u8,
    i: u64,
    i_scale: u8,
    delta_x: u64,
) -> Result<Vec<u64>, String> {
    let calculator = calculator(x0, x_scale, y0, y_scale, c, i, i_scale);

    let delta_x = Decimal::from_scaled_amount(delta_x, x_scale).to_compute_scale();

    let result = calculator
        .swap_x_to_y_hmm(&delta_x)
        .map_err(|e| e.to_string())?;

    Ok(result.into())
}

#[wasm_bindgen]
#[allow(clippy::too_many_arguments)]
pub fn swap_y_to_x_hmm(
    x0: u64,
    x_scale: u8,
    y0: u64,
    y_scale: u8,
    c: u8,
    i: u64,
    i_scale: u8,
    delta_y: u64,
) -> Result<Vec<u64>, String> {
    let calculator = calculator(x0, x_scale, y0, y_scale, c, i, i_scale);

    let delta_y = Decimal::from_scaled_amount(delta_y, y_scale).to_compute_scale();

    let result = calculator
        .swap_y_to_x_hmm(&delta_y)
        .map_err(|e| e.to_string())?;

    Ok(result.into())
}

#[allow(clippy::too_many_arguments)]
pub fn calculator(
    x0: u64,
    x_scale: u8,
    y0: u64,
    y_scale: u8,
    c: u8,
    i: u64,
    i_scale: u8,
) -> SwapCalculator {
    let x0 = Decimal::from_scaled_amount(x0, x_scale).to_compute_scale();
    let y0 = Decimal::from_scaled_amount(y0, y_scale).to_compute_scale();

    let c = Decimal::from_u64(c as u64)
        .to_compute_scale()
        .div(Decimal::from_u64(100).to_compute_scale());

    let i = Decimal::from_scaled_amount(i, i_scale).to_compute_scale();

    SwapCalculatorBuilder::default()
        .x0(x0)
        .y0(y0)
        .c(c)
        .i(i)
        .scale(x_scale, y_scale)
        .build()
        .expect("failed to build SwapCalculator")
}
