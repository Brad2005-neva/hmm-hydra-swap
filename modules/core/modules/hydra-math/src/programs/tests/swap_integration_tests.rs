use crate::programs::liquidity_pools::swap_calculator_wasm::{swap_x_to_y_hmm, swap_y_to_x_hmm};
use crate::programs::liquidity_pools::swap_result::SwapResult;
use serde::Deserialize;
use serde_json;
use serde_with::{serde_as, DisplayFromStr};
use std::fs;

#[serde_as]
#[derive(Debug, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub(crate) struct TestCase {
    pub test_id: u16,
    pub description: String,
    #[serde_as(as = "DisplayFromStr")]
    pub x0: u64,
    #[serde_as(as = "DisplayFromStr")]
    pub x_scale: u8,
    #[serde_as(as = "DisplayFromStr")]
    pub y0: u64,
    #[serde_as(as = "DisplayFromStr")]
    pub y_scale: u8,
    #[serde_as(as = "DisplayFromStr")]
    pub c: u8,
    #[serde_as(as = "DisplayFromStr")]
    pub i: u64,
    #[serde_as(as = "DisplayFromStr")]
    pub i_scale: u8,
    #[serde_as(as = "DisplayFromStr")]
    pub amount: u64,
    pub xy: bool,
    pub expected: Expected,
}

#[serde_as]
#[derive(Debug, Default, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Expected {
    #[serde_as(as = "DisplayFromStr")]
    pub delta_x: u64,
    #[serde_as(as = "DisplayFromStr")]
    pub delta_y: u64,
}

#[test]
fn run_integration_tests() {
    let contents =
        fs::read_to_string("../../../../modules/tests/protocol/fixtures/swap_integrated.json")
            .expect("Failure to read the file.");
    let json: Vec<TestCase> = serde_json::from_str(&contents).expect("JSON was not well-formatted");
    let test_iterator = json.iter();

    for test in test_iterator {
        let actual = if test.xy {
            SwapResult::from(
                swap_x_to_y_hmm(
                    test.x0,
                    test.x_scale,
                    test.y0,
                    test.y_scale,
                    test.c,
                    test.i,
                    test.i_scale,
                    test.amount,
                )
                .expect("swap_result"),
            )
            .delta_y
        } else {
            SwapResult::from(
                swap_y_to_x_hmm(
                    test.x0,
                    test.x_scale,
                    test.y0,
                    test.y_scale,
                    test.c,
                    test.i,
                    test.i_scale,
                    test.amount,
                )
                .expect("swap_result"),
            )
            .delta_x
        };

        let expected = if test.xy {
            test.expected.delta_y
        } else {
            test.expected.delta_x
        };

        assert_eq!(
            actual, expected,
            "Test ID {} failed when {}",
            test.test_id, test.description
        );
    }
}
