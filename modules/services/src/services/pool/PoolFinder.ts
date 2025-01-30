import { PublicKey } from "@solana/web3.js";

export type PoolFinderValue = {
  tokenXMint: PublicKey;
  tokenYMint: PublicKey;
  poolId: number;
  cValue: number;
};

function setOnIndex<U, V>(map: Map<U, Set<V>>, key: U, value: V) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const set = map.has(key) ? map.get(key)! : new Set<V>();
  set.add(value);
  map.set(key, set);
}

function intersect<T>(...toIntersect: Set<T>[]): Set<T> {
  const [a, ...rest] = toIntersect;
  return new Set(
    [...a].filter((i) =>
      rest.reduce((acc, set) => set.has(i) && acc, true as boolean)
    )
  );
}

/**
 * Class to find pools based on metadata
 */
export class PoolFinder {
  constructor(
    private poolIdByMint: Map<string, Set<number>>,
    private poolIdByCValue: Map<number, Set<number>>,
    private poolDescriptorByPoolId: Map<number, PoolFinderValue>
  ) {}

  add(value: PoolFinderValue) {
    const { tokenXMint, tokenYMint, poolId, cValue } = value;

    // Bail if we already have the value
    // Note values are immutable
    if (this.poolDescriptorByPoolId.has(poolId)) {
      return this;
    }

    // Save the value
    this.poolDescriptorByPoolId.set(poolId, value);

    // Set indexes so we can find stuff quickly
    setOnIndex(this.poolIdByMint, `${tokenXMint}`, poolId);
    setOnIndex(this.poolIdByMint, `${tokenYMint}`, poolId);
    setOnIndex(this.poolIdByCValue, cValue, poolId);

    return this;
  }

  findPool(
    search: {
      tokenA?: PublicKey;
      tokenB?: PublicKey;
      c?: number;
    },
    limit: number = 20
  ) {
    const { tokenA, tokenB, c } = search;

    const tokenASet = tokenA
      ? this.poolIdByMint.get(`${tokenA}`) ?? new Set<number>()
      : undefined;

    const tokenBSet = tokenB
      ? this.poolIdByMint.get(`${tokenB}`) ?? new Set<number>()
      : undefined;

    const cSet =
      typeof c !== "undefined" ? this.poolIdByCValue.get(c) : undefined;

    const foundSets = [tokenASet, tokenBSet, cSet].filter(
      Boolean
    ) as Set<number>[];

    const intersection = intersect(...foundSets);

    return Array.from(intersection.values())
      .slice(0, limit)
      .map((poolId) => {
        const descr = this.poolDescriptorByPoolId.get(poolId);

        if (!descr)
          throw new Error(
            "Data corruption in PoolFinder. Descriptor not found."
          );

        return descr;
      });
  }

  getCValues() {
    return Array.from(this.poolIdByCValue.keys()).sort();
  }

  public static new(
    poolIdByMint: Map<string, Set<number>> = new Map(),
    poolIdByCValue: Map<number, Set<number>> = new Map(),
    poolDescriptorByPoolId: Map<number, PoolFinderValue> = new Map()
  ) {
    return new PoolFinder(poolIdByMint, poolIdByCValue, poolDescriptorByPoolId);
  }
}
