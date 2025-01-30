import { Keypair } from "@solana/web3.js";
import { PoolFinder, PoolFinderValue } from "./PoolFinder";

const A = Keypair.generate().publicKey;
const B = Keypair.generate().publicKey;
const C = Keypair.generate().publicKey;
const D = Keypair.generate().publicKey;

const pools: PoolFinderValue[] = [
  { tokenXMint: A, tokenYMint: B, cValue: 0, poolId: 0 },
  { tokenXMint: A, tokenYMint: B, cValue: 125, poolId: 1 },
  { tokenXMint: A, tokenYMint: C, cValue: 125, poolId: 2 },
  { tokenXMint: A, tokenYMint: D, cValue: 150, poolId: 3 },
  { tokenXMint: C, tokenYMint: D, cValue: 0, poolId: 4 },
];

test("PoolFinder", () => {
  const finder = PoolFinder.new();

  pools.forEach((pool) => {
    finder.add(pool);
  });

  expect(finder.findPool({ tokenA: A, tokenB: B, c: 0 })).toEqual([pools[0]]);

  expect(
    finder.findPool({
      tokenA: A,
      tokenB: B,
      c: 150,
    })
  ).toEqual([]);

  expect(
    finder.findPool({
      tokenA: A,
    })
  ).toEqual([pools[0], pools[1], pools[2], pools[3]]);

  expect(finder.getCValues()).toEqual([0, 125, 150]);
});
