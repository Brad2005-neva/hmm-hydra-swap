#[macro_use]
extern crate bencher;

use bencher::{black_box, Bencher};
use checked_decimal_macro::Decimal;
use checked_decimal_macro::*;
use hydra_math::decimal::ops::Sqrt;
use hydra_math::decimal::Decimal as HydraPrice;

#[decimal(12)]
#[derive(Default, PartialEq, Debug, Clone, Copy)]
struct Price(u128);

impl Price {
    pub fn sqrt(self) -> Price {
        let zero = Price::from_integer(0);
        let one = Price::from_integer(1);

        if self.get().lt(&0u128) || self.get().gt(&u128::MAX) {
            return self;
        }

        if self.eq(&zero) || self.eq(&one) {
            return self;
        }

        let value = self.0;
        let value_scaled = match value.checked_mul(1000000000000) {
            Some(x) => x,
            None => 0,
        };
        let value_scaled_bit_length = 128u32
            .checked_sub(value_scaled.leading_zeros())
            .expect("bit_length");
        let value_scaled_mid_length = value_scaled_bit_length
            .checked_div(2)
            .expect("value_scaled_mid_length");
        let value_approx = 2u128
            .checked_pow(value_scaled_mid_length)
            .expect("value_approx");
        let mut y = value_scaled.checked_div(value_approx).expect("y");
        let mut y_0 = 0u128;
        let threshold = 1u128;

        loop {
            if y.gt(&y_0) && (y.checked_sub(y_0).unwrap()).gt(&threshold)
                || y.lt(&y_0) && (y_0.checked_sub(y).unwrap()).gt(&threshold)
            {
                let tmp_y = value_scaled.checked_div(y).unwrap();
                y_0 = y;
                y = y.checked_add(tmp_y).unwrap();
                y >>= 1;
            } else {
                break;
            }
        }

        Price::new(y)
    }
}

fn hydra(bench: &mut Bencher) {
    bench.iter(|| black_box(HydraPrice::from_u64(16).to_compute_scale().sqrt()))
}

fn other(bench: &mut Bencher) {
    bench.iter(|| black_box(Price::from_integer(16).sqrt()))
}

benchmark_group!(benches, hydra, other);
benchmark_main!(benches);
