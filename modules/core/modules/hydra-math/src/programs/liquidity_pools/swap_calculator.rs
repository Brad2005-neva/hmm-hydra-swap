//! Swap calculator
use crate::decimal::core::Compare;
use crate::decimal::ops::{Add, BigDiv, BigMul, Div, Ln, Mul, Pow, Sqrt, Sub};
use crate::decimal::{BigDecimal, Decimal, COMPUTE_SCALE};
use crate::errors::ErrorCode;
use crate::programs::liquidity_pools::swap_calculator_scale::{
    SwapCalculatorScale, SwapCalculatorScaleBuilder,
};
use crate::programs::liquidity_pools::swap_result::SwapResult;

#[derive(Default, Builder, Debug)]
#[builder(setter(into))]
pub struct SwapCalculator {
    /// Number of tokens x currently in liquidity pool
    #[builder(default = "Decimal::zero()")]
    pub x0: Decimal,
    /// Number of tokens y currently in liquidity pool
    #[builder(default = "Decimal::zero()")]
    pub y0: Decimal,

    // HMM related settings
    /// Compensation value c
    /// Range c = 0, 1, 1.25, 1.5
    #[builder(default = "Decimal::zero()")]
    pub c: Decimal,
    /// Oracle price relative to x
    #[builder(default = "Decimal::zero()")]
    pub i: Decimal,

    /// Track the scale of the various input amounts
    #[builder(setter(custom = true))]
    pub scale: SwapCalculatorScale,
}

/// [SwapCalculator] custom setters
impl SwapCalculatorBuilder {
    pub fn scale(&mut self, x: u8, y: u8) -> &mut Self {
        self.scale = Some(
            SwapCalculatorScaleBuilder::default()
                .x(x)
                .y(y)
                .build()
                .expect("failed to build SwapCalculatorScale"),
        );
        self
    }
}

impl SwapCalculator {
    /// Compute swap result from x to y using a constant product curve given delta x
    pub fn swap_x_to_y_hmm(&self, delta_x: &Decimal) -> Result<SwapResult, ErrorCode> {
        if delta_x.is_negative() || delta_x.is_zero() {
            return Err(ErrorCode::DeltaNotPositive);
        }

        let delta_y = self.compute_delta_y_hmm(delta_x);

        Ok(SwapResult {
            delta_x: delta_x.to_scaled_amount(self.scale.x),
            delta_y: delta_y?.to_scaled_amount(self.scale.y),
        })
    }

    /// Compute swap result from y to x using a constant product curve given delta y
    pub fn swap_y_to_x_hmm(&self, delta_y: &Decimal) -> Result<SwapResult, ErrorCode> {
        if delta_y.is_negative() || delta_y.is_zero() {
            return Err(ErrorCode::DeltaNotPositive);
        }

        let delta_x = self.compute_delta_x_hmm(delta_y);

        Ok(SwapResult {
            delta_x: delta_x?.to_scaled_amount(self.scale.x),
            delta_y: delta_y.to_scaled_amount(self.scale.y),
        })
    }

    /// Compute delta y using a constant product curve given delta x
    /// delta_y = k/(x0 + delta_x) - k/x0
    fn compute_delta_y_amm(&self, delta_x: &Decimal) -> Result<Decimal, ErrorCode> {
        let k = self.compute_k()?;
        let x_new = self.compute_x_new(delta_x)?;

        k.big_div(x_new).sub(k.big_div(self.x0))
    }

    /// Compute delta x using a constant product curve given delta y
    /// delta_x = k/(y0 + delta_y) - k/y0
    fn compute_delta_x_amm(&self, delta_y: &Decimal) -> Result<Decimal, ErrorCode> {
        let k = self.compute_k()?;
        let y_new = self.compute_y_new(delta_y)?;

        k.big_div(y_new).sub(k.big_div(self.y0))
    }

    /// Compute delta y using a baseline curve given delta y
    fn compute_delta_y_hmm(&self, delta_x: &Decimal) -> Result<Decimal, ErrorCode> {
        if self.i.is_zero() || self.c.is_zero() {
            // Condition 0 - use AMM
            // Oracle price is zero, return early
            return self.compute_delta_y_amm(delta_x);
        }

        let x_new = self.compute_x_new(delta_x)?;
        let k = self.compute_k()?;
        let xi = self.compute_xi()?;

        if self.x0.gte(xi)? {
            // Condition 1 - use AMM
            // Oracle price is better than the constant product price
            Ok(self.compute_delta_y_amm(delta_x)?)
        } else if x_new.lte(xi)? {
            // Condition 2 - use HMM
            // Constant product price is better than the oracle price even after the full trade
            Ok(self.compute_integral(&k, &self.x0, &x_new, &xi, &self.c)?)
        } else {
            // Condition 3 - use HMM
            // Constant product price is better than the oracle price at the start of the trade

            // lhs = compute_integral(k, x0, xi, xi, c)
            let lhs = self.compute_integral(&k, &self.x0, &xi, &xi, &self.c)?;

            // rhs = (k/x_new - k/xi)
            let k_div_x_new = k.div(x_new);
            let k_div_xi = k.div(xi);
            let rhs = k_div_x_new.sub(k_div_xi)?;

            Ok(lhs.add(rhs)?)
        }
    }

    /// Compute delta x using a baseline curve given delta y
    fn compute_delta_x_hmm(&self, delta_y: &Decimal) -> Result<Decimal, ErrorCode> {
        if self.i.is_zero() || self.c.is_zero() {
            // Condition 0 - use AMM
            // Oracle price is zero, return early.
            return self.compute_delta_x_amm(delta_y);
        }

        let y_new = self.compute_y_new(delta_y)?;
        let k = self.compute_k()?;
        let yi = self.compute_yi()?;

        if self.y0.gte(yi)? {
            // Condition 1 - use AMM
            // Oracle price is better than the constant product price.
            Ok(self.compute_delta_x_amm(delta_y)?)
        } else if y_new.lte(yi)? {
            // Condition 2 - use HMM
            // Constant product price is better than the oracle price even after the full trade
            // delta_x = compute_integral(k, y0, y_new, yi, c)
            Ok(self.compute_integral(&k, &self.y0, &y_new, &yi, &self.c)?)
        } else {
            // Condition 3 - use HMM
            // Constant product price is better than the oracle price at the start of the trade
            // delta_x = compute_integral(k, y0, yi, yi, c) + (k/x_new - k/xi)

            // lhs = compute_integral(k, y0, yi, yi, c)
            let lhs = self.compute_integral(&k, &self.y0, &yi, &yi, &self.c)?;

            // rhs = (k/x_new - k/xi)
            let k_div_y_new = k.div(y_new);
            let k_div_yi = k.div(yi);
            let rhs = k_div_y_new.sub(k_div_yi)?;

            Ok(lhs.add(rhs)?)
        }
    }

    /// Compute the integral with different coefficient values of c
    fn compute_integral(
        &self,
        k: &Decimal,
        q0: &Decimal,
        q_new: &Decimal,
        qi: &Decimal,
        c: &Decimal,
    ) -> Result<Decimal, ErrorCode> {
        let one = Decimal::one();

        if c.eq(&one) {
            // return k/(qi ** c) * ln(q0 / q_new)
            let k_div_qi_pow_c = k.big_div(*qi); // qi**1 == qi

            let q0_div_q_new = q0.div(*q_new);
            let ln_q0_div_q_new = q0_div_q_new.ln()?;

            Ok(k_div_qi_pow_c.mul(ln_q0_div_q_new))
        } else {
            // return k / (qi ** c) / (c - 1) * (q0 ** (c - 1) - q_new ** (c - 1))
            let c_sub_one: BigDecimal = BigDecimal::from(c.sub(one)?).to_compute_scale();
            let qi: BigDecimal = BigDecimal::from(*qi).to_compute_scale();
            let c: BigDecimal = BigDecimal::from(*c).to_compute_scale();
            let qi_pow_c: BigDecimal = qi.pow(c).to_compute_scale();
            let k: BigDecimal = BigDecimal::from(*k).to_compute_scale();
            let lhs = k.div(qi_pow_c).div(c_sub_one);

            let q0: BigDecimal = BigDecimal::from(*q0).to_compute_scale();
            let q0_pow_c_sub_one: BigDecimal = q0.pow(c_sub_one);
            let q_new: BigDecimal = BigDecimal::from(*q_new).to_compute_scale();
            let q_new_pow_c_sub_one: BigDecimal = q_new.pow(c_sub_one);
            let rhs = q0_pow_c_sub_one.sub(q_new_pow_c_sub_one)?;

            let result = lhs.mul(rhs).to_scale(COMPUTE_SCALE);
            Ok(Decimal::from(result))
        }
    }

    /// Compute constant product curve invariant k
    fn compute_k(&self) -> Result<Decimal, ErrorCode> {
        // k = x0 * y0
        Ok(self.x0.big_mul(self.y0))
    }

    /// Compute the token balance of x assuming the constant product price is the same as the oracle price.
    fn compute_xi(&self) -> Result<Decimal, ErrorCode> {
        let k = self.compute_k()?;
        // xi = sqrt(k/i)
        k.big_div(self.i).sqrt()
    }

    /// Compute the token balance of y assuming the constant product price is the same as the oracle price.
    fn compute_yi(&self) -> Result<Decimal, ErrorCode> {
        // yi = (k/(1/i))**0.5 == k**0.5 / (1/i)**0.5
        let k: BigDecimal = BigDecimal::from(self.compute_k()?).to_compute_scale();
        let k_sqrt = k.sqrt()?;

        let i: BigDecimal = BigDecimal::from(self.i).to_compute_scale();
        let one: BigDecimal = BigDecimal::from(Decimal::one()).to_compute_scale();
        let one_div_i: BigDecimal = one.div(i);
        let one_div_i_sqrt = one_div_i.sqrt()?;

        let result = k_sqrt.div(one_div_i_sqrt).to_scale(COMPUTE_SCALE);
        Ok(Decimal::from(result))
    }

    /// Compute new amount for x
    fn compute_x_new(&self, delta_x: &Decimal) -> Result<Decimal, ErrorCode> {
        // x_new = x0 + delta_x
        self.x0.add(*delta_x)
    }

    /// Compute new amount for y
    fn compute_y_new(&self, delta_y: &Decimal) -> Result<Decimal, ErrorCode> {
        // y_new = y0 + delta_y
        self.y0.add(*delta_y)
    }
}
