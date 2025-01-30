use crate::decimal::{Decimal, COMPUTE_SCALE};
use crate::programs::fees::fee_calculator_wasm::compute_fees;
use crate::programs::fees::fee_result::FeeResult;
use csv::ReaderBuilder;
use std::str::FromStr;

#[test]
#[allow(clippy::unwrap_used)]
fn test_flappy() {
    let args = "feeCalculation,amount,amountScale,feeMinPct,feeMaxPct,feeLastUpdate,feeThisUpdate,feeLastPrice,feeThisPrice,feeThisPrice_scale,feeLastEwma,feeEwmaWindow,feeLambda,feeVelocity
Percent,100000000,6,500000000,20000000000,0,1662006366,0,49,6,17836758,3600,545000000000,4166666666
VolatilityAdjusted,1000000000,6,500000000,20000000000,1663144693,1663476734,0,0,0,17836758,3600000000000000,545000000000,4166666666
";

    let mut reader = ReaderBuilder::new()
        .delimiter(b',')
        .from_reader(args.as_bytes());

    for record in reader.records() {
        let record = record.unwrap();
        println!("record: {:?}", record);
        let actual = compute_fees(
            &record[0],
            u64::from_str(&record[1]).unwrap(),
            u8::from_str(&record[2]).unwrap(),
            u64::from_str(&record[3]).unwrap(),
            u64::from_str(&record[4]).unwrap(),
            u64::from_str(&record[5]).unwrap(),
            u64::from_str(&record[6]).unwrap(),
            u64::from_str(&record[7]).unwrap(),
            u64::from_str(&record[8]).unwrap(),
            u8::from_str(&record[9]).unwrap(),
            u64::from_str(&record[10]).unwrap(),
            u64::from_str(&record[11]).unwrap(),
            u64::from_str(&record[12]).unwrap(),
            u64::from_str(&record[13]).unwrap(),
        );

        let amount = u64::from_str(&record[1]).unwrap();
        let amount_scale = u8::from_str(&record[2]).unwrap();
        let fee_result: FeeResult = From::from(actual.expect("fee results"));
        println!("actual: {:?}", fee_result);
        println!(
                "amount: \t\t{:>12}\nfee_amount: \t{:>12}\namount_ex_fee: \t{:>12}\nfee_percent: \t{:>12}\n",
                Decimal::from_scaled_amount(amount, amount_scale),
                Decimal::from_scaled_amount(fee_result.fee_amount, amount_scale),
                Decimal::from_scaled_amount(fee_result.amount_ex_fee, amount_scale),
                Decimal::from_scaled_amount(fee_result.fee_percentage, COMPUTE_SCALE).to_scale(amount_scale)
            );
        assert_eq!(fee_result.amount_ex_fee + fee_result.fee_amount, amount);
    }
}

#[test]
#[allow(clippy::unwrap_used)]
#[allow(clippy::inconsistent_digit_grouping)]
fn run_edge_tests() {
    // when oracle price i == 0 for volatility fee it should fall back to percentage fee
    {
        let actual = FeeResult::from(
            compute_fees(
                "VolatilityAdjusted",
                1000_000000,
                6,
                500000000,
                20000000000,
                0,
                1662006366,
                0,
                0,
                0,
                0,
                3600,
                545000000000,
                4166666667,
            )
            .expect("fee result"),
        );

        // fee = 0.05% * 1000 = 0.5 * 10^6 = 500000
        assert_eq!(actual.fee_amount, 500000);
    }
}
