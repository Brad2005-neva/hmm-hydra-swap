use criterion::{criterion_group, criterion_main, BenchmarkId, Criterion};
use hydra_math::decimal::ops::Sqrt;
use hydra_math::decimal::*;

criterion_group!(benches, bench_sqrt,);
criterion_main!(benches);

fn bench_sqrt(c: &mut Criterion) {
    let mut group = c.benchmark_group("sqrt");

    {
        let decimal = Decimal::from_u64(u64::MAX);
        let parameter = "big decimal";

        group.bench_with_input(
            BenchmarkId::new("u64::MAX**0.5", parameter),
            &decimal,
            |b, _s| {
                b.iter(|| decimal.sqrt());
            },
        );
    }

    group.finish();
}
