use crate::decimal::Decimal;
use crate::programs::liquidity_pools::liquidity_calculator::LiquidityCalculatorBuilder;
use wasm_bindgen::prelude::wasm_bindgen;

/// Interface to be used by programs and front end
/// these functions shadow functions of the implemented liquidity calculator
#[wasm_bindgen]
#[allow(clippy::too_many_arguments)]
pub fn compute_liquidity_add(
    x_amount: u64,
    x_scale: u8,
    y_amount: u64,
    y_scale: u8,
    x_reserve: u64,
    y_reserve: u64,
    liquidity_total: u64,
    liquidity_scale: u8,
) -> Result<Vec<u64>, String> {
    let x_amount = Decimal::from_scaled_amount(x_amount, x_scale);
    let y_amount = Decimal::from_scaled_amount(y_amount, y_scale);
    let x_reserve = Decimal::from_scaled_amount(x_reserve, x_scale);
    let y_reserve = Decimal::from_scaled_amount(y_reserve, y_scale);
    let liquidity_total = Decimal::from_scaled_amount(liquidity_total, liquidity_scale);

    let calculator = LiquidityCalculatorBuilder::default()
        .x_reserve(x_reserve)
        .y_reserve(y_reserve)
        .liquidity_total(liquidity_total)
        .build()
        .map_err(|e| e.to_string())?;

    let result = calculator
        .compute_liquidity_add(&x_amount, &y_amount)
        .map_err(|e| e.to_string())?;

    Ok(result.into())
}

#[wasm_bindgen]
#[allow(clippy::too_many_arguments)]
pub fn compute_liquidity_remove(
    liquidity: u64,
    x_scale: u8,
    y_scale: u8,
    x_reserve: u64,
    y_reserve: u64,
    liquidity_total: u64,
    liquidity_scale: u8,
) -> Result<Vec<u64>, String> {
    let x_reserve = Decimal::from_scaled_amount(x_reserve, x_scale);
    let y_reserve = Decimal::from_scaled_amount(y_reserve, y_scale);
    let liquidity_total = Decimal::from_scaled_amount(liquidity_total, liquidity_scale);
    let liquidity = Decimal::from_scaled_amount(liquidity, liquidity_scale);

    let calculator = LiquidityCalculatorBuilder::default()
        .x_reserve(x_reserve)
        .y_reserve(y_reserve)
        .liquidity_total(liquidity_total)
        .build()
        .map_err(|e| e.to_string())?;

    let result = calculator
        .compute_liquidity_remove(&liquidity)
        .map_err(|e| e.to_string())?;

    Ok(result.into())
}
