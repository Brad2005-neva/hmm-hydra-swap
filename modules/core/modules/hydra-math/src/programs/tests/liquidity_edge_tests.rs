use crate::decimal::Decimal;
use crate::programs::liquidity_pools::liquidity_calculator::{
    LiquidityCalculator, LIQUIDITY_SCALE,
};
use crate::programs::liquidity_pools::liquidity_calculator_wasm::{
    compute_liquidity_add, compute_liquidity_remove,
};
use crate::programs::liquidity_pools::liquidity_result::LiquidityResult;
use std::str::FromStr;

#[test]
fn test_minimum_liquidity() {
    let liquidity_minimum = LiquidityCalculator::liquidity_minimum();

    // 1000 / 10^6 = 0.001
    let expected = Decimal::from_str("0.001")
        .unwrap()
        .to_scale(LIQUIDITY_SCALE);

    assert_eq!(liquidity_minimum, expected);
}

#[test]
#[should_panic(expected = "Liquidity calculated exceeds range for mint total supply")]
fn test_breaking_range() {
    let _ = LiquidityResult::from(
        compute_liquidity_add(
            1000_000000,
            6,
            1000_000000,
            6,
            u64::MAX >> 1,
            u64::MAX >> 1,
            u64::MAX,
            LIQUIDITY_SCALE,
        )
        .expect("liquidity result"),
    );
}

#[test]
#[should_panic(expected = "Amount input provided was not positive or greater than zero")]
fn test_exploit_non_zero_amount() {
    {
        let _ = LiquidityResult::from(
            compute_liquidity_add(0, 6, 1000_000000, 6, 0, 0, 0, LIQUIDITY_SCALE)
                .expect("liquidity result"),
        );
    }
    {
        let _ = LiquidityResult::from(
            compute_liquidity_add(1000_000000, 6, 0, 6, 0, 0, 0, LIQUIDITY_SCALE)
                .expect("liquidity result"),
        );
    }
}

#[test]
#[should_panic(expected = "Liquidity calculated was not positive or greater than zero")]
fn test_exploit_tiny_amounts() {
    // negative liquidity first time
    // (0.000001 * 0.000001)^0.5 - 0.001 = -0.000999
    {
        let _ = LiquidityResult::from(
            compute_liquidity_add(1, 6, 1, 6, 0, 0, 0, LIQUIDITY_SCALE).expect("liquidity result"),
        );
    }

    // negative liquidity first time
    // (0.000000000001 * 0.000000000001)^0.5 - 0.001 = -0.001
    {
        let _ = LiquidityResult::from(
            compute_liquidity_add(1, 12, 1, 12, 0, 0, 0, LIQUIDITY_SCALE)
                .expect("liquidity result"),
        );
    }

    // negative liquidity first time
    // (0.001 * 0.001)^0.5 - 0.001 = 0
    {
        let _ = LiquidityResult::from(
            compute_liquidity_add(1000, 12, 1000, 12, 0, 0, 0, LIQUIDITY_SCALE)
                .expect("liquidity result"),
        );
    }
}

#[test]
#[should_panic(expected = "Liquidity calculated was not positive or greater than zero")]
fn test_exploit_front_run() {
    // prevent first deposit from stealing funds of subsequent deposits by ensuring minimum liquidity
    // https://www.reddit.com/r/solana/comments/q97gxs/comment/hgug6i3/
    // https://www.rileyholterhus.com/writing/bunni
    // (x * y)^0.5 = 0.001
    // y ≈ (1.×10^-6)/x
    // x = 1
    // y = 0.000001
    // liquidity = 0.001 - 0001 = 0
    {
        let _ = LiquidityResult::from(
            compute_liquidity_add(1_000000, 6, 1, 6, 0, 0, 0, LIQUIDITY_SCALE)
                .expect("liquidity result"),
        );
    }
}

#[test]
#[should_panic(expected = "Liquidity to be removed greater than mint total supply")]
fn test_exploit_remove_more_than_supply() {
    // should not be able to remove more liquidity than is in total supply
    let _ = LiquidityResult::from(
        compute_liquidity_remove(1999000, 6, 6, 1000000, 1000000, 999000, LIQUIDITY_SCALE)
            .expect("liquidity result"),
    );
}
