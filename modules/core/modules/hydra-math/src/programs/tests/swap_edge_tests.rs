use crate::decimal::Decimal;
use crate::programs::liquidity_pools::swap_calculator_wasm::{swap_x_to_y_hmm, swap_y_to_x_hmm};
use crate::programs::liquidity_pools::swap_result::SwapResult;
use csv::ReaderBuilder;
use math_simulator::Model;
use std::str::FromStr;

pub const PRICE_SCALE: u8 = 8u8;
pub const AMOUNT_SCALE: u8 = 9u8;

#[test]
#[allow(clippy::unwrap_used)]
#[allow(clippy::inconsistent_digit_grouping)]
fn run_edge_tests() {
    // original
    {
        let delta_y = SwapResult::from(
            swap_x_to_y_hmm(1000_000000, 6, 1000_000000, 6, 50, 50000000, 8, 10_000000)
                .expect("swap_result"),
        )
        .delta_y;

        // delta_y =  -8.34641792401218
        let expected: u64 = 8_346417;
        assert_eq!(delta_y, expected);

        let delta_x = SwapResult::from(
            swap_y_to_x_hmm(1000_000000, 6, 1000_000000, 6, 50, 50000000, 8, 8_346417)
                .expect("swap_result"),
        )
        .delta_x;

        // delta_y =  -8.277330944291862
        let expected: u64 = 8_277330;
        assert_eq!(delta_x, expected);
    }

    // max inputs
    {
        let actual = SwapResult::from(
            swap_y_to_x_hmm(
                u64::MAX,
                AMOUNT_SCALE,
                u64::MAX,
                AMOUNT_SCALE,
                1_00,
                10u64.pow(6),
                PRICE_SCALE,
                u64::MAX >> 1,
            )
            .expect("swap_result"),
        )
        .delta_x;
        // -6148914691.23651758829752604166666666666666666666666666666666667
        let expected: u64 = 6148914691_236517204;
        assert_eq!(actual, expected);
    }
}

#[test]
fn test_swappy() {
    let args = "x0,x0_scale,y0,y0_scale,c,i,i_scale
44494631,6,4449462983,8,125,49,6";
    let direction = "xy";
    let amount = "999500000";

    let mut reader = ReaderBuilder::new()
        .delimiter(b',')
        .from_reader(args.as_bytes());

    for record in reader.records() {
        let record = record.unwrap();
        let x0 = Decimal::from_scaled_amount(
            u64::from_str(&record[0]).unwrap(),
            u8::from_str(&record[1]).unwrap(),
        );
        let y0 = Decimal::from_scaled_amount(
            u64::from_str(&record[2]).unwrap(),
            u8::from_str(&record[3]).unwrap(),
        );
        let c = Decimal::new(u128::from_str(&record[4]).unwrap(), 2, false);
        let i = Decimal::from_scaled_amount(
            u64::from_str(&record[5]).unwrap(),
            u8::from_str(&record[6]).unwrap(),
        );

        let amount_scale = if direction == "xy" {
            u8::from_str(&record[1]).unwrap()
        } else {
            u8::from_str(&record[3]).unwrap()
        };

        let result_scale = if direction == "xy" {
            u8::from_str(&record[3]).unwrap()
        } else {
            u8::from_str(&record[1]).unwrap()
        };

        let amount = Decimal::from_scaled_amount(u64::from_str(amount).unwrap(), amount_scale);

        let model = Model::new(
            x0.to_string(),
            y0.to_string(),
            c.to_string(),
            i.to_string(),
            result_scale,
        );

        if direction == "xy" {
            let actual = Decimal::from_scaled_amount(
                swap_x_to_y_hmm(
                    x0.into(),
                    x0.scale,
                    y0.into(),
                    y0.scale,
                    c.value as u8,
                    i.into(),
                    i.scale,
                    amount.into(),
                )
                .expect("swap result")[1],
                result_scale,
            );
            let (expected, _) = model.sim_delta_y_hmm(amount.to_string());
            let expected = Decimal::from_scaled_amount(expected as u64, result_scale);
            println!(
                "x0 = {}\ny0 = {}\nc = {}\ni = {}\nactual = \t{}\nexpected = \t{}\nprint(\"delta_y_hmm = \", get_delta_y(x0, y0, i, c, {}))",
                x0, y0, c, i, actual, expected, amount
            );
        } else {
            let actual = Decimal::from_scaled_amount(
                swap_y_to_x_hmm(
                    x0.into(),
                    x0.scale,
                    y0.into(),
                    y0.scale,
                    c.value as u8,
                    i.into(),
                    i.scale,
                    amount.into(),
                )
                .expect("swap result")[0],
                result_scale,
            );
            let (expected, _) = model.sim_delta_x_hmm(amount.to_string());
            let expected = Decimal::from_scaled_amount(expected as u64, result_scale);
            println!(
                "x0 = {}\ny0 = {}\nc = {}\ni = {}\nactual = \t{}\nexpected = \t{}\nprint(\"delta_y_hmm = \", get_delta_y(x0, y0, i, c, {}))",
                x0, y0, c, i, actual, expected, amount
            );
        }
    }
}
