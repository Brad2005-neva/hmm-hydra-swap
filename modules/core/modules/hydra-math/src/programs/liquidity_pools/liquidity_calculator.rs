//! Liquidity calculator
use crate::decimal::core::Compare;
use crate::decimal::ops::{Add, BigDiv, BigMul, DivUp, Sqrt, Sub};
use crate::decimal::Decimal;
use crate::errors::ErrorCode;
use crate::programs::liquidity_pools::liquidity_result::LiquidityResult;

pub const LIQUIDITY_MINIMUM: u128 = 1000;
pub const LIQUIDITY_SCALE: u8 = 6;

#[derive(Default, Builder, Debug)]
#[builder(setter(into))]
pub struct LiquidityCalculator {
    #[builder(default = "Decimal::zero()")]
    pub x_reserve: Decimal,
    #[builder(default = "Decimal::zero()")]
    pub y_reserve: Decimal,
    #[builder(default = "Decimal::zero()")]
    pub liquidity_total: Decimal,
}

impl LiquidityCalculator {
    pub fn liquidity_minimum() -> Decimal {
        Decimal::new(LIQUIDITY_MINIMUM, LIQUIDITY_SCALE, false).to_scale(LIQUIDITY_SCALE)
    }

    pub fn compute_liquidity_add(
        &self,
        x_amount: &Decimal,
        y_amount: &Decimal,
    ) -> Result<LiquidityResult, ErrorCode> {
        if x_amount.is_negative() || x_amount.is_zero() {
            return Err(ErrorCode::AmountNotPositive);
        }
        if y_amount.is_negative() || y_amount.is_zero() {
            return Err(ErrorCode::AmountNotPositive);
        }

        let x_amount_scale = self.x_reserve.scale;
        let y_amount_scale = self.y_reserve.scale;
        let liquidity_scale = self.liquidity_total.scale;

        let x_amount = x_amount.to_compute_scale();
        let y_amount = y_amount.to_compute_scale();
        let x_reserve = self.x_reserve.to_compute_scale();
        let y_reserve = self.y_reserve.to_compute_scale();
        let liquidity_total = self.liquidity_total.to_compute_scale();
        let liquidity_minimum = LiquidityCalculator::liquidity_minimum().to_compute_scale();

        let (x_amount, y_amount, liquidity) = Self::liquidity_add(
            x_amount,
            y_amount,
            x_reserve,
            y_reserve,
            liquidity_total,
            liquidity_minimum,
        );

        if liquidity.is_negative() || liquidity.is_zero() {
            return Err(ErrorCode::LiquidityNotPositive);
        }

        if liquidity_total
            .add(liquidity)
            .expect("new_liquidity_total")
            .to_scale(liquidity_scale)
            .bit_length()
            .gt(&64)
        {
            return Err(ErrorCode::LiquidityExceedsRange);
        }

        Ok(LiquidityResult {
            x_amount: x_amount.to_scaled_amount(x_amount_scale),
            y_amount: y_amount.to_scaled_amount(y_amount_scale),
            liquidity: liquidity.to_scaled_amount(liquidity_scale),
        })
    }

    pub fn compute_liquidity_remove(
        &self,
        liquidity: &Decimal,
    ) -> Result<LiquidityResult, ErrorCode> {
        if liquidity.is_negative() || liquidity.is_zero() {
            return Err(ErrorCode::LiquidityNotPositive);
        }

        // get scale
        let x_amount_scale = self.x_reserve.scale;
        let y_amount_scale = self.y_reserve.scale;
        let liquidity_scale = self.liquidity_total.scale;

        // convert to compute scale
        let x_reserve = self.x_reserve.to_compute_scale();
        let y_reserve = self.y_reserve.to_compute_scale();
        let liquidity = liquidity.to_compute_scale();
        let liquidity_total = self.liquidity_total.to_compute_scale();

        if liquidity.gt(liquidity_total).expect("bool") {
            return Err(ErrorCode::LiquidityInsufficientSupply);
        }

        // calculate liquidity to remove
        let (x_amount, y_amount, liquidity) =
            Self::liquidity_remove(liquidity, x_reserve, y_reserve, liquidity_total);

        if x_amount.is_negative() || x_amount.is_zero() {
            return Err(ErrorCode::AmountNotPositive);
        }
        if y_amount.is_negative() || y_amount.is_zero() {
            return Err(ErrorCode::AmountNotPositive);
        }

        Ok(LiquidityResult {
            x_amount: x_amount.to_scaled_amount(x_amount_scale),
            y_amount: y_amount.to_scaled_amount(y_amount_scale),
            liquidity: liquidity.to_scaled_amount(liquidity_scale),
        })
    }

    fn liquidity_add(
        x_amount: Decimal,
        y_amount: Decimal,
        x_reserve: Decimal,
        y_reserve: Decimal,
        liquidity_total: Decimal,
        liquidity_minimum: Decimal,
    ) -> (Decimal, Decimal, Decimal) {
        if liquidity_total.is_zero() {
            let liquidity = x_amount
                .big_mul(y_amount)
                .sqrt()
                .unwrap()
                .sub(liquidity_minimum)
                .expect("liquidity first time");
            (x_amount, y_amount, liquidity)
        } else {
            let x = x_amount.big_mul(liquidity_total).big_div(x_reserve);
            let y = y_amount.big_mul(liquidity_total).big_div(y_reserve);
            let liquidity = x.min(y);
            let x_amount = x_amount.min(liquidity.big_div(liquidity_total).big_mul(x_reserve));
            let y_amount = y_amount.min(liquidity.big_div(liquidity_total).big_mul(y_reserve));
            (x_amount, y_amount, liquidity)
        }
    }

    fn liquidity_remove(
        liquidity: Decimal,
        x_reserve: Decimal,
        y_reserve: Decimal,
        liquidity_total: Decimal,
    ) -> (Decimal, Decimal, Decimal) {
        let x_amount = liquidity.big_mul(x_reserve).div_up(liquidity_total);

        let y_amount = liquidity.big_mul(y_reserve).div_up(liquidity_total);

        (x_amount, y_amount, liquidity)
    }
}
