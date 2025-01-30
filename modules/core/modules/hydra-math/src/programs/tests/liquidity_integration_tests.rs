use crate::programs::liquidity_pools::liquidity_calculator::LIQUIDITY_SCALE;
use crate::programs::liquidity_pools::liquidity_calculator_wasm::{
    compute_liquidity_add, compute_liquidity_remove,
};
use crate::programs::liquidity_pools::liquidity_result::LiquidityResult;
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
    #[serde_as(as = "DisplayFromStr")]
    pub x_reserve: u64,
    #[serde_as(as = "DisplayFromStr")]
    pub x_scale: u8,
    #[serde_as(as = "DisplayFromStr")]
    pub y_reserve: u64,
    #[serde_as(as = "DisplayFromStr")]
    pub y_scale: u8,
    #[serde_as(as = "DisplayFromStr")]
    pub liquidity_total: u64,
    pub add: Add,
    pub remove: Remove,
    pub expected: Expected,
}

#[serde_as]
#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Add {
    #[serde_as(as = "DisplayFromStr")]
    pub x_amount: u64,
    #[serde_as(as = "DisplayFromStr")]
    pub y_amount: u64,
}

#[serde_as]
#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Remove {
    #[serde_as(as = "DisplayFromStr")]
    pub liquidity: u64,
}

#[serde_as]
#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Expected {
    #[serde_as(as = "DisplayFromStr")]
    pub x_amount: u64,
    #[serde_as(as = "DisplayFromStr")]
    pub y_amount: u64,
    #[serde_as(as = "DisplayFromStr")]
    pub liquidity: u64,
}

#[test]
fn run_integration_tests() {
    let contents =
        fs::read_to_string("../../../../modules/tests/protocol/fixtures/liquidity_integrated.json")
            .expect("Failure to read the file.");
    let json: Vec<TestCase> = serde_json::from_str(&contents).expect("JSON was not well-formatted");
    let test_iterator = json.iter();

    for test in test_iterator {
        let actual = if test.add.x_amount > 0 {
            LiquidityResult::from(
                compute_liquidity_add(
                    test.add.x_amount,
                    test.x_scale,
                    test.add.y_amount,
                    test.y_scale,
                    test.x_reserve,
                    test.y_reserve,
                    test.liquidity_total,
                    LIQUIDITY_SCALE,
                )
                .expect("liquidity result"),
            )
        } else {
            LiquidityResult::from(
                compute_liquidity_remove(
                    test.remove.liquidity,
                    test.x_scale,
                    test.y_scale,
                    test.x_reserve,
                    test.y_reserve,
                    test.liquidity_total,
                    LIQUIDITY_SCALE,
                )
                .expect("liquidity result"),
            )
        };

        let expected = LiquidityResult {
            x_amount: test.expected.x_amount,
            y_amount: test.expected.y_amount,
            liquidity: test.expected.liquidity,
        };

        assert_eq!(
            actual, expected,
            "Test ID {} failed when {}",
            test.test_id, test.description
        );
    }
}
