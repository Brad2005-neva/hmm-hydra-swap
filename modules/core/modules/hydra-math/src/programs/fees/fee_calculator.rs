use crate::decimal::core::Compare;
use crate::decimal::ops::{Add, Div, Mul, Neg, Pow, Sub};
use crate::decimal::Decimal;
use crate::errors::ErrorCode;
use crate::programs::fees::fee_result::{FeeResult, FeeResultBuilder};
use std::str::FromStr;

#[derive(Default, Builder, Debug)]
#[builder(setter(into))]
pub struct FeeCalculator {
    #[builder(default = "FeeCalculation::Percent")]
    fee_calculation: FeeCalculation,

    #[builder(default = r#"Decimal::from_str("0.0005").unwrap().to_compute_scale()"#)]
    fee_min_pct: Decimal,
    #[builder(default = r#"Decimal::from_str("0.02").unwrap().to_compute_scale()"#)]
    fee_max_pct: Decimal,

    #[builder(default = "Decimal::zero()")]
    fee_last_update: Decimal,
    #[builder(default = "Decimal::zero()")]
    fee_this_update: Decimal,

    #[builder(default = "Decimal::zero()")]
    fee_last_price: Decimal,
    #[builder(default = "Decimal::zero()")]
    fee_this_price: Decimal,

    #[builder(default = r#"
            // 1.25^2/365/24
            Decimal::from_str("1.25")
                .unwrap()
                .to_compute_scale()
                .pow(Decimal::two())
                .div(Decimal::from_u64(24).to_compute_scale())
                .div(Decimal::from_u64(365).to_compute_scale())
        "#)]
    fee_last_ewma: Decimal,

    #[builder(default = "Decimal::from_u64(3600).to_compute_scale()")]
    fee_ewma_window: Decimal,

    #[builder(default = r#"Decimal::from_str("0.545").unwrap().to_compute_scale()"#)]
    fee_lambda: Decimal,

    #[builder(default = r#"
            // 0.1 / 24 hours
            Decimal::from_str("0.1")
                .unwrap()
                .to_compute_scale()
                .div(Decimal::from_u64(24).to_compute_scale())
        "#)]
    fee_velocity: Decimal,
}

#[derive(Debug, Clone)]
pub enum FeeCalculation {
    /// Percent based
    Percent,
    /// Volatility adjusted
    VolatilityAdjusted,
}

impl Default for FeeCalculation {
    fn default() -> Self {
        FeeCalculation::Percent
    }
}

impl FeeCalculator {
    /// Compute fees for the [FeeCalculator] based on fee calculation type
    pub fn compute_fees(&self, amount: &Decimal) -> Result<FeeResult, ErrorCode> {
        match self.fee_calculation {
            FeeCalculation::Percent => Ok(FeeCalculatorBuilder::default()
                .fee_min_pct(self.fee_min_pct.to_compute_scale())
                .build()
                .expect("failed to build percent based FeeCalculator")
                .compute_percent_fee(amount)?),
            FeeCalculation::VolatilityAdjusted => Ok(FeeCalculatorBuilder::default()
                .fee_min_pct(self.fee_min_pct.to_compute_scale())
                .fee_this_update(self.fee_this_update.to_compute_scale())
                .fee_last_update(self.fee_last_update.to_compute_scale())
                .fee_this_price(self.fee_this_price.to_compute_scale())
                .fee_last_price(self.fee_last_price.to_compute_scale())
                .fee_last_ewma(self.fee_last_ewma.to_compute_scale())
                .build()
                .expect("failed to build volatility adjusted FeeCalculator")
                .compute_vol_adj_fee(amount)?),
        }
    }

    /// Compute a volatility adjusted based fee for the [FeeCalculator]
    fn compute_vol_adj_fee(&self, amount: &Decimal) -> Result<FeeResult, ErrorCode> {
        if self.fee_min_pct.is_zero() || self.fee_max_pct.is_zero() {
            return Ok(FeeResultBuilder::default().amount_ex_fee(*amount).build()?);
        }

        let this_ewma = self.compute_ewma()?;

        let vol_adj_fee = if self.fee_this_price.is_zero() {
            Decimal::zero()
        } else {
            // x = -ewma / 8
            let x = this_ewma.neg().div(Decimal::from_u64(8).to_compute_scale());

            // exp(x) = 1+x+x^2/2
            let exp_x = Decimal::one()
                .add(x)?
                .add(x.pow(2u128).div(Decimal::two()))?;

            Decimal::one().sub(exp_x)?.div(self.fee_velocity)
        };

        // fee = MAX(min_fee,MIN(max_fee, vol_adj_fee)
        let fee_percentage = self.fee_min_pct.max(self.fee_max_pct.min(vol_adj_fee));

        let amount_scaled = amount.to_compute_scale();
        let fee_amount = fee_percentage.mul(amount_scaled);

        if fee_amount.gte(amount_scaled)? {
            return Err(ErrorCode::FeesGreaterThanAmount);
        }

        if fee_percentage.is_zero() {
            return Ok(FeeResultBuilder::default()
                .fee_amount(Decimal::zero())
                .amount_ex_fee(*amount)
                .build()?);
        }

        let amount_ex_fee = amount_scaled.sub(fee_amount)?;

        Ok(FeeResultBuilder::default()
            .fee_amount(fee_amount.to_scale_up(amount.scale))
            .fee_percentage(fee_percentage)
            .amount_ex_fee(amount_ex_fee.to_scale(amount.scale))
            .fee_last_update(self.fee_this_update.to_scale(0))
            .fee_last_price(self.fee_this_price)
            .fee_last_ewma(this_ewma)
            .build()?)
    }

    /// Compute a percentage based fee for the [FeeCalculator]
    fn compute_percent_fee(&self, amount: &Decimal) -> Result<FeeResult, ErrorCode> {
        if self.fee_min_pct.is_zero() {
            return Ok(FeeResultBuilder::default().amount_ex_fee(*amount).build()?);
        }

        let fee_percentage = self.fee_min_pct;

        let amount_scaled = amount.to_compute_scale();
        let fee_amount = fee_percentage.mul(amount_scaled);

        if fee_amount.gte(amount_scaled)? {
            return Err(ErrorCode::FeesGreaterThanAmount);
        }

        let amount_ex_fee = amount_scaled.sub(fee_amount)?;

        Ok(FeeResultBuilder::default()
            .fee_amount(fee_amount.to_scale_up(amount.scale))
            .fee_percentage(fee_percentage)
            .amount_ex_fee(amount_ex_fee.to_scale(amount.scale))
            .build()?)
    }

    /// Determine if variance should be computed based on window period for a volatility adjusted [FeeCalculator]
    fn should_update(&self) -> Result<bool, ErrorCode> {
        Ok(self.fee_this_price.gt(Decimal::zero())?
            && self.fee_last_update.gt(Decimal::zero())?
            && self
                .fee_this_update
                .sub(self.fee_last_update)?
                .gte(self.fee_ewma_window)?)
    }

    /// Compute exponentially weighted moving average (ewma) variance for a volatility adjusted [FeeCalculator]
    fn compute_ewma(&self) -> Result<Decimal, ErrorCode> {
        if self.should_update()? {
            // this_ewma = lambda * last_ewma + (1-lambda) * (this_price / last_price - 1)**2
            // * ewma_window / (this_update - last_update)

            // a = (1-lambda)
            let a = Decimal::one().sub(self.fee_lambda)?;

            // b = (this_price / last_price - 1)**2
            let b = self
                .fee_this_price
                .div(self.fee_last_price)
                .sub(Decimal::one())?
                .pow(Decimal::two());

            // c = ewma_window / (this_update - last_update)
            let c = self
                .fee_ewma_window
                .div(self.fee_this_update.sub(self.fee_last_update)?);

            Ok(self
                .fee_lambda
                .mul(self.fee_last_ewma)
                .add(a.mul(b).mul(c))?)
        } else {
            Ok(self.fee_last_ewma)
        }
    }
}

#[cfg(test)]
#[allow(clippy::unwrap_used)]
mod tests {
    use super::*;
    use crate::decimal::{Decimal, COMPUTE_SCALE};

    #[test]
    fn test_compute_percent_fee() {
        let fee_calculator = FeeCalculatorBuilder::default()
            .fee_min_pct(Decimal::from_str("0.02").unwrap())
            .fee_calculation(FeeCalculation::Percent)
            .build()
            .expect("calculator");

        let amount = Decimal::from_str("1000").unwrap().to_scale(6);

        let fee_result = fee_calculator.compute_fees(&amount).unwrap();

        assert_eq!(
            // 0.02 * 1000.000000 = 20.000000
            fee_result.fee_amount,
            u64::from(Decimal::from_str("20").unwrap().to_scale(6))
        );

        assert_eq!(
            fee_result.fee_percentage,
            u64::from(Decimal::from_str("0.02").unwrap().to_compute_scale())
        );

        assert_eq!(
            // 1000.000000 - 20.000000 = 920.000000
            fee_result.amount_ex_fee,
            u64::from(Decimal::from_str("980").unwrap().to_scale(6))
        );
    }

    #[test]
    fn test_compute_vol_adj_fee() {
        {
            let fee_calculator = FeeCalculatorBuilder::default()
                .fee_this_price(Decimal::from_str("3400").unwrap().to_scale(8))
                .fee_calculation(FeeCalculation::VolatilityAdjusted)
                .build()
                .expect("calculator");

            let amount = Decimal::from_str("1000").unwrap().to_scale(6);

            let fee_result = fee_calculator.compute_fees(&amount).unwrap();

            assert_eq!(
                Decimal::from_scaled_amount(fee_result.fee_amount, 6),
                Decimal::from_str("5.350968").unwrap()
            );

            assert_eq!(
                Decimal::from_scaled_amount(fee_result.fee_percentage, COMPUTE_SCALE),
                Decimal::from_str("0.005350967760").unwrap()
            );

            assert_eq!(
                Decimal::from_scaled_amount(fee_result.amount_ex_fee, 6),
                Decimal::from_str("994.649032").unwrap()
            );
        }
    }
}
