//! Fee Result storage

#[derive(Default, Builder, Debug, PartialEq, Clone, Copy)]
#[builder(setter(into))]
pub struct FeeResult {
    #[builder(default = "0")]
    pub fee_amount: u64,
    #[builder(default = "0")]
    pub fee_percentage: u64,
    #[builder(default = "0")]
    pub amount_ex_fee: u64,
    #[builder(default = "0")]
    pub fee_last_update: u64,
    #[builder(default = "0")]
    pub fee_last_price: u64,
    #[builder(default = "0")]
    pub fee_last_ewma: u64,
}

impl From<Vec<u64>> for FeeResult {
    fn from(vector: Vec<u64>) -> Self {
        FeeResult {
            fee_amount: vector[0],
            fee_percentage: vector[1],
            amount_ex_fee: vector[2],
            fee_last_update: vector[3],
            fee_last_price: vector[4],
            fee_last_ewma: vector[5],
        }
    }
}

impl From<FeeResult> for Vec<u64> {
    fn from(fee_result: FeeResult) -> Vec<u64> {
        vec![
            fee_result.fee_amount,
            fee_result.fee_percentage,
            fee_result.amount_ex_fee,
            fee_result.fee_last_update,
            fee_result.fee_last_price,
            fee_result.fee_last_ewma,
        ]
    }
}
