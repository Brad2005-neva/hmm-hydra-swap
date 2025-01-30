use crate::decimal::Decimal;
use crate::programs::fees::fee_calculator_wasm::compute_fees;
use crate::programs::fees::fee_result::FeeResult;
use csv::StringRecord;
use serde::Deserialize;
use std::str::FromStr;

#[derive(Deserialize)]
struct Test<'a> {
    fee_calculation: &'a str,
    fee_min_pct: &'a str,
    fee_max_pct: &'a str,
    fee_last_update: &'a str,
    fee_this_update: &'a str,
    fee_last_price: &'a str,
    fee_this_price: &'a str,
    fee_last_ewma: &'a str,
    fee_this_ewma: &'a str,
    fee_percentage: &'a str,
    amount: &'a str,
    amount_scale: &'a str,
    fee_amount: &'a str,
    amount_ex_fee: &'a str,
}

#[test]
fn run_range_tests() {
    let mut reader = csv::Reader::from_path("../../../../modules/tests/protocol/fixtures/fee.csv")
        .expect("fee fixtures");

    for record in reader.records() {
        let record = record.unwrap();
        let header = StringRecord::from(vec![
            "fee_calculation",
            "fee_min_pct",
            "fee_max_pct",
            "fee_last_update",
            "fee_this_update",
            "fee_last_price",
            "fee_this_price",
            "fee_last_ewma",
            "fee_this_ewma",
            "fee_percentage",
            "amount",
            "amount_scale",
            "fee_amount",
            "amount_ex_fee",
        ]);
        let test: Test = record.deserialize(Some(&header)).unwrap();

        let actual = FeeResult::from(
            compute_fees(
                &*test.fee_calculation,
                Decimal::from_str(test.amount).unwrap().into(),
                Decimal::from_str(test.amount_scale).unwrap().value as u8,
                Decimal::from_str(test.fee_min_pct).unwrap().into(),
                Decimal::from_str(test.fee_max_pct).unwrap().into(),
                Decimal::from_str(test.fee_last_update).unwrap().into(),
                Decimal::from_str(test.fee_this_update).unwrap().into(),
                Decimal::from_str(test.fee_last_price).unwrap().into(),
                Decimal::from_str(test.fee_this_price).unwrap().into(),
                12u8,
                Decimal::from_str(test.fee_last_ewma).unwrap().into(),
                3600000000000000u64,
                545000000000u64,
                4166666666u64,
            )
            .expect("fee result"),
        );

        let expected = FeeResult {
            fee_amount: test.fee_amount.replace('.', "").parse::<u64>().unwrap(),
            fee_percentage: test.fee_percentage.replace('.', "").parse::<u64>().unwrap(),
            amount_ex_fee: test.amount_ex_fee.replace('.', "").parse::<u64>().unwrap(),
            fee_last_update: test
                .fee_this_update
                .replace('.', "")
                .parse::<u64>()
                .unwrap(),
            fee_last_price: test.fee_this_price.replace('.', "").parse::<u64>().unwrap(),
            fee_last_ewma: test.fee_this_ewma.replace('.', "").parse::<u64>().unwrap(),
        };

        assert_eq!(actual, expected);
    }
}
