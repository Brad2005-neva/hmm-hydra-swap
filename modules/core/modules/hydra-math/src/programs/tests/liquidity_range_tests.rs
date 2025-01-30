use crate::programs::liquidity_pools::liquidity_calculator::LIQUIDITY_SCALE;
use crate::programs::liquidity_pools::liquidity_calculator_wasm::compute_liquidity_add;
use crate::programs::liquidity_pools::liquidity_result::LiquidityResult;
use csv::StringRecord;
use math_simulator::Model;
use serde::Deserialize;

#[derive(Deserialize, Debug)]
struct Test<'a> {
    x_reserve: &'a str,
    x_scale: &'a str,
    y_reserve: &'a str,
    y_scale: &'a str,
    liquidity_total: &'a str,
    x_amount: &'a str,
    y_amount: &'a str,
}

#[test]
fn run_range_tests() {
    let mut reader =
        csv::Reader::from_path("../../../../modules/tests/protocol/fixtures/liquidity.csv")
            .expect("liquidity fixtures");

    for record in reader.records() {
        let record = record.unwrap();
        let header = StringRecord::from(vec![
            "x_reserve",
            "x_scale",
            "y_reserve",
            "y_scale",
            "liquidity_total",
            "x_amount",
            "y_amount",
        ]);
        let test: Test = record.deserialize(Some(&header)).unwrap();
        let model = Model::new(
            "0".to_string(),
            "0".to_string(),
            "0".to_string(),
            "0".to_string(),
            LIQUIDITY_SCALE,
        );

        let (expected, _negative) = model.sim_add_liquidity(
            test.x_amount.to_string(),
            test.y_amount.to_string(),
            test.x_reserve.to_string(),
            test.y_reserve.to_string(),
            test.liquidity_total.to_string(),
        );

        if expected > u64::MAX as u128 {
            // Liquidity calculated exceeds range for mint total supply
        } else {
            let actual = LiquidityResult::from(
                compute_liquidity_add(
                    test.x_amount.replace('.', "").parse::<u64>().unwrap(),
                    test.x_scale.replace('.', "").parse::<u8>().unwrap(),
                    test.y_amount.replace('.', "").parse::<u64>().unwrap(),
                    test.y_scale.replace('.', "").parse::<u8>().unwrap(),
                    test.x_reserve.replace('.', "").parse::<u64>().unwrap(),
                    test.y_reserve.replace('.', "").parse::<u64>().unwrap(),
                    test.liquidity_total
                        .replace('.', "")
                        .parse::<u64>()
                        .unwrap(),
                    LIQUIDITY_SCALE,
                )
                .expect("liquidity result"),
            );
            assert_eq!(actual.liquidity, expected as u64)
        }
    }
}
