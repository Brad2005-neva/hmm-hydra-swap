use crate::programs::fees::fee_calculator_wasm::compute_fees;
use crate::programs::fees::fee_result::FeeResult;
use crate::programs::liquidity_pools::liquidity_calculator::LIQUIDITY_SCALE;
use crate::programs::liquidity_pools::liquidity_calculator_wasm::{
    compute_liquidity_add, compute_liquidity_remove,
};
use crate::programs::liquidity_pools::liquidity_result::LiquidityResult;
use crate::programs::liquidity_pools::swap_calculator_wasm::{swap_x_to_y_hmm, swap_y_to_x_hmm};
use crate::programs::liquidity_pools::swap_result::SwapResult;
use crate::programs::tests::{
    fee_integration_tests, liquidity_integration_tests, swap_integration_tests,
};
use serde::Deserialize;
use serde_json;
use serde_with::serde_as;
use std::fs;

#[serde_as]
#[derive(Debug, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
struct TestScenario {
    scenario_id: u16,
    liquidity: Box<[liquidity_integration_tests::TestCase]>,
    fee: Box<[fee_integration_tests::TestCase]>,
    swap: Box<[swap_integration_tests::TestCase]>,
}

#[test]
fn run_integration_tests() {
    let contents =
        fs::read_to_string("../../../../modules/tests/protocol/fixtures/e2e_integrated.json")
            .expect("Failure to read the file.");
    let json: Vec<TestScenario> =
        serde_json::from_str(&contents).expect("JSON was not well-formatted");
    let scenario_iterator = json.iter();

    for scenario in scenario_iterator {
        // execute liquidity test cases
        for test in scenario.liquidity.iter() {
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
                "Scenario ID {} failed executing test ID {} when {}",
                scenario.scenario_id, test.test_id, test.description
            );
        }

        // execute fee test case
        for test in scenario.fee.iter() {
            {
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
                    "Scenario ID {} failed executing test ID {} when {}",
                    scenario.scenario_id, test.test_id, test.description
                );
            }
        }

        // execute swap test case
        for test in scenario.swap.iter() {
            {
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
                };

                let expected = SwapResult {
                    delta_x: test.expected.delta_x,
                    delta_y: test.expected.delta_y,
                };

                assert_eq!(
                    actual, expected,
                    "Scenario ID {} failed executing test ID {} when {}",
                    scenario.scenario_id, test.test_id, test.description
                );
            }
        }
    }
}
