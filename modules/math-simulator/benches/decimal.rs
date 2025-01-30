#[macro_use]
extern crate bencher;

use bencher::{black_box, Bencher};
use checked_decimal_macro::Decimal;
use checked_decimal_macro::*;
use hydra_math::decimal::Decimal as HydraPrice;

#[decimal(12)]
#[derive(Default, PartialEq, Debug, Clone, Copy)]
struct Price(u128);

fn hydra(bench: &mut Bencher) {
    bench.iter(|| black_box(HydraPrice::from_u64(1).to_compute_scale()))
}

fn other(bench: &mut Bencher) {
    bench.iter(|| black_box(Price::from_integer(1)))
}

benchmark_group!(benches, hydra, other);
benchmark_main!(benches);
