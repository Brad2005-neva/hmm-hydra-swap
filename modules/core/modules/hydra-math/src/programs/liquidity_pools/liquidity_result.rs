//! Liquidity Result storage
#[derive(Default, Builder, Debug, PartialEq, Clone, Copy)]
#[builder(setter(into))]
pub struct LiquidityResult {
    #[builder(default = "0")]
    pub x_amount: u64,
    #[builder(default = "0")]
    pub y_amount: u64,
    #[builder(default = "0")]
    pub liquidity: u64,
}

impl From<Vec<u64>> for LiquidityResult {
    fn from(vector: Vec<u64>) -> Self {
        LiquidityResult {
            x_amount: vector[0],
            y_amount: vector[1],
            liquidity: vector[2],
        }
    }
}

impl From<LiquidityResult> for Vec<u64> {
    fn from(liquidity_result: LiquidityResult) -> Vec<u64> {
        vec![
            liquidity_result.x_amount,
            liquidity_result.y_amount,
            liquidity_result.liquidity,
        ]
    }
}
