use crate::programs::fees::fee_calculator_wasm::compute_fees;
use crate::programs::fees::fee_result::FeeResult;
use serde::Deserialize;
use serde_json;
use serde_with::{serde_as, DisplayFromStr};
use std::fs;

#[serde_as]
#[derive(Debug, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct TestCase {
    pub test_id: u16,
    pub description: String,
    pub fee_calculation: String,

    #[serde_as(as = "DisplayFromStr")]
    pub amount: u64,
    #[serde_as(as = "DisplayFromStr")]
    pub amount_scale: u8,

    #[serde_as(as = "DisplayFromStr")]
    pub fee_min_pct: u64,
    #[serde_as(as = "DisplayFromStr")]
    pub fee_max_pct: u64,

    #[serde_as(as = "DisplayFromStr")]
    pub fee_last_update: u64,
    #[serde_as(as = "DisplayFromStr")]
    pub fee_this_update: u64,

    #[serde_as(as = "DisplayFromStr")]
    pub fee_last_price: u64,
    #[serde_as(as = "DisplayFromStr")]
    pub fee_this_price: u64,
    #[serde_as(as = "DisplayFromStr")]
    pub fee_this_price_scale: u8,

    #[serde_as(as = "DisplayFromStr")]
    pub fee_last_ewma: u64,
    #[serde_as(as = "DisplayFromStr")]
    pub fee_ewma_window: u64,
    #[serde_as(as = "DisplayFromStr")]
    pub fee_lambda: u64,
    #[serde_as(as = "DisplayFromStr")]
    pub fee_velocity: u64,

    pub expected: Expected,
}

#[serde_as]
#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Expected {
    #[serde_as(as = "DisplayFromStr")]
    pub fee_amount: u64,
    #[serde_as(as = "DisplayFromStr")]
    pub fee_percentage: u64,
    #[serde_as(as = "DisplayFromStr")]
    pub amount_ex_fee: u64,
    #[serde_as(as = "DisplayFromStr")]
    pub fee_last_update: u64,
    #[serde_as(as = "DisplayFromStr")]
    pub fee_last_price: u64,
    #[serde_as(as = "DisplayFromStr")]
    pub fee_last_ewma: u64,
}

#[test]
fn run_integration_tests() {
    let contents =
        fs::read_to_string("../../../../modules/tests/protocol/fixtures/fee_integrated.json")
            .expect("Failure to read the file.");
    let json: Vec<TestCase> = serde_json::from_str(&contents).expect("JSON was not well-formatted");
    let test_iterator = json.iter();

    for test in test_iterator {
        let actual = FeeResult::from(
            compute_fees(
                &*test.fee_calculation,
                test.amount,
                test.amount_scale,
                test.fee_min_pct,
                test.fee_max_pct,
                test.fee_last_update,
                test.fee_this_update,
                test.fee_last_price,
                test.fee_this_price,
                test.fee_this_price_scale,
                test.fee_last_ewma,
                test.fee_ewma_window,
                test.fee_lambda,
                test.fee_velocity,
            )
            .expect("fee result"),
        );

        let expected = FeeResult {
            fee_amount: test.expected.fee_amount,
            fee_percentage: test.expected.fee_percentage,
            amount_ex_fee: test.expected.amount_ex_fee,
            fee_last_update: test.expected.fee_last_update,
            fee_last_price: test.expected.fee_last_price,
            fee_last_ewma: test.expected.fee_last_ewma,
        };

        assert_eq!(
            actual, expected,
            "Test ID {} failed when {}",
            test.test_id, test.description
        );
    }
}
