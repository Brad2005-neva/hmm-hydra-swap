use anchor_lang::prelude::*;

#[event]
pub struct SlippageExceeded {
    pub x_amount_adjusted: u64,
    pub y_amount_adjusted: u64,
    pub x_amount_max: u64,
    pub y_amount_max: u64,
}
