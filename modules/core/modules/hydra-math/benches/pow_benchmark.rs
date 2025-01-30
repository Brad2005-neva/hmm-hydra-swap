use criterion::{criterion_group, criterion_main, BenchmarkId, Criterion};
use hydra_math::decimal::ops::{Neg, Pow};
use hydra_math::decimal::*;
criterion_group!(benches, bench_pow,);
criterion_main!(benches);

fn bench_pow(c: &mut Criterion) {
    let mut group = c.benchmark_group("pow");

    {
        let decimal = BigDecimal::from_u128(6000).to_compute_scale();
        let parameter = "big decimal";

        group.bench_with_input(BenchmarkId::new("x**-1.5", parameter), &decimal, |b, _s| {
            b.iter(|| decimal.pow(Decimal::one_point_five().neg().into()));
        });
    }

    group.finish();
}
