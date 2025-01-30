use crate::errors::ErrorCode;
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct Fees {
    pub fee_calculation: String, // 4 + 18
    pub fee_last_update: u64,    // 8
    pub fee_last_price: u64,     // 8
    pub fee_ewma_window: u64,    // 8
    pub fee_last_ewma: u64,      // 8
    pub fee_lambda: u64,         // 8
    pub fee_velocity: u64,       // 8
    pub fee_min_pct: u64,        // 8
    pub fee_max_pct: u64,        // 8
}

impl Default for Fees {
    fn default() -> Fees {
        Fees {
            fee_calculation: "Percent".to_string(),
            fee_min_pct: 500_000_000,
            fee_max_pct: 20_000_000_000,
            fee_last_ewma: 178_367_580,
            fee_ewma_window: 3_600_000_000_000_000,
            fee_lambda: 545_000_000_000,
            fee_velocity: 4_166_666_666,
            fee_last_update: 0,
            fee_last_price: 0,
        }
    }
}

impl Fees {
    #[allow(clippy::too_many_arguments)]
    pub fn update(
        &mut self,
        fee_calculation: String,
        fee_min_pct: Option<u64>,
        fee_max_pct: Option<u64>,
        fee_ewma_window: Option<u64>,
        fee_last_ewma: Option<u64>,
        fee_lambda: Option<u64>,
        fee_velocity: Option<u64>,
    ) -> Result<()> {
        self.fee_calculation = fee_calculation;

        if let Some(new_fee_min_pct) = fee_min_pct {
            self.fee_min_pct = new_fee_min_pct;
        }

        if let Some(new_fee_max_pct) = fee_max_pct {
            self.fee_max_pct = new_fee_max_pct;
        }

        if let Some(new_fee_ewma_window) = fee_ewma_window {
            self.fee_ewma_window = new_fee_ewma_window;
        }

        if let Some(new_fee_last_ewma) = fee_last_ewma {
            self.fee_last_ewma = new_fee_last_ewma;
        }

        if let Some(new_fee_lambda) = fee_lambda {
            self.fee_lambda = new_fee_lambda;
        }

        if let Some(new_fee_velocity) = fee_velocity {
            self.fee_velocity = new_fee_velocity;
        }

        Ok(())
    }

    pub fn validate(&self) -> Result<()> {
        require!(
            self.fee_min_pct.le(&100_000_000_000_000),
            ErrorCode::InvalidFeePercentage
        );

        require!(
            self.fee_max_pct.le(&100_000_000_000_000),
            ErrorCode::InvalidFeePercentage
        );

        Ok(())
    }
}
