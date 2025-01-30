use criterion::{criterion_group, criterion_main, BenchmarkId, Criterion};
use hydra_math::decimal::ops::Ln;
use hydra_math::decimal::*;

criterion_group!(benches, bench_ln,);
criterion_main!(benches);

fn bench_ln(c: &mut Criterion) {
    let mut group = c.benchmark_group("ln");

    {
        let decimal = Decimal::from_u64(u64::MAX);
        let parameter = "decimal";

        group.bench_with_input(
            BenchmarkId::new("u64::MAX.ln() iterative approximation", parameter),
            &decimal,
            |b, _s| {
                b.iter(|| decimal.ln());
            },
        );
    }

    group.finish();
}
