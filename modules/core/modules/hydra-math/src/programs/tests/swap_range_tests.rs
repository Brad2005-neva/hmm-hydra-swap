use crate::programs::liquidity_pools::swap_calculator_wasm::{swap_x_to_y_hmm, swap_y_to_x_hmm};
use crate::programs::liquidity_pools::swap_result::SwapResult;
use csv::StringRecord;
use math_simulator::Model;
use serde::Deserialize;

pub const PRICE_SCALE: u8 = 8u8;
pub const PRECISION: u64 = 10u64.pow(6); // accuracy to 3 decimal places

#[derive(Deserialize)]
struct Test<'a> {
    x0: &'a str,
    x_scale: &'a str,
    y0: &'a str,
    y_scale: &'a str,
    c: &'a str,
    i: &'a str,
    delta_x: &'a str,
    delta_y: &'a str,
}

#[test]
fn run_range_tests() {
    let mut reader = csv::Reader::from_path("../../../../modules/tests/protocol/fixtures/swap.csv")
        .expect("swap fixtures");

    for record in reader.records() {
        let record = record.unwrap();
        let header = StringRecord::from(vec![
            "x0", "x_scale", "y0", "y_scale", "c", "i", "delta_x", "delta_y",
        ]);
        let test: Test = record.deserialize(Some(&header)).unwrap();

        let actual_delta_y = SwapResult::from(
            swap_x_to_y_hmm(
                test.x0.replace('.', "").parse::<u64>().unwrap(),
                test.x_scale.replace('.', "").parse::<u8>().unwrap(),
                test.y0.replace('.', "").parse::<u64>().unwrap(),
                test.y_scale.replace('.', "").parse::<u8>().unwrap(),
                test.c.replace('.', "").parse::<u8>().unwrap(),
                test.i.replace('.', "").parse::<u64>().unwrap(),
                PRICE_SCALE,
                test.delta_x.replace('.', "").parse::<u64>().unwrap(),
            )
            .expect("swap result"),
        )
        .delta_y;

        let model = Model::new(
            test.x0.to_string(),
            test.y0.to_string(),
            test.c.to_string(),
            test.i.to_string(),
            test.y_scale.replace('.', "").parse::<u8>().unwrap(),
        );
        let (expected_delta_y, _) = model.sim_delta_y_hmm(test.delta_x.to_string());

        let diff = actual_delta_y.saturating_sub(expected_delta_y as u64);
        assert!(
            diff.lt(&PRECISION),
            "{} {} {} {} {} {} {}",
            test.x0,
            test.y0,
            test.c,
            test.i,
            test.delta_x,
            actual_delta_y,
            expected_delta_y
        );

        let actual_delta_x = SwapResult::from(
            swap_y_to_x_hmm(
                test.x0.replace('.', "").parse::<u64>().unwrap(),
                test.x_scale.replace('.', "").parse::<u8>().unwrap(),
                test.y0.replace('.', "").parse::<u64>().unwrap(),
                test.y_scale.replace('.', "").parse::<u8>().unwrap(),
                test.c.replace('.', "").parse::<u8>().unwrap(),
                test.i.replace('.', "").parse::<u64>().unwrap(),
                PRICE_SCALE,
                test.delta_y.replace('.', "").parse::<u64>().unwrap(),
            )
            .expect("swap result"),
        )
        .delta_x;

        let model = Model::new(
            test.x0.to_string(),
            test.y0.to_string(),
            test.c.to_string(),
            test.i.to_string(),
            test.x_scale.replace('.', "").parse::<u8>().unwrap(),
        );
        let (expected_delta_x, _) = model.sim_delta_x_hmm(test.delta_y.to_string());

        let diff = actual_delta_x.saturating_sub(expected_delta_x as u64);
        assert!(
            diff.lt(&PRECISION),
            "{} {} {} {} {} {} {}",
            test.x0,
            test.y0,
            test.c,
            test.i,
            test.delta_y,
            actual_delta_x,
            expected_delta_x
        );
    }
}
