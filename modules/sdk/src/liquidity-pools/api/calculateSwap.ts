import { AccountData } from "../../libs/account-loader";
import { TokenAccount } from "../../types";
import { TokenMint } from "../../types";
import * as wasm from "@hydraprotocol/math";
import { loadWasm } from "@hydraprotocol/wasm-loader";
import { Log, PoolState } from "../types";
import { Decimal } from "../..";

const hydraMath = loadWasm(wasm);

function parseCalculatorValues({
  tokenXMint,
  tokenXVault,
  tokenYMint,
  tokenYVault,
  poolState,
  i,
  iScale,
}: {
  tokenXMint: AccountData<TokenMint>;
  tokenYMint: AccountData<TokenMint>;
  tokenXVault: AccountData<TokenAccount>;
  tokenYVault: AccountData<TokenAccount>;
  poolState: AccountData<PoolState>;
  i: bigint;
  iScale: number;
}) {
  const x0 = tokenXVault.account.data.amount;
  const x0Scale = tokenXMint.account.data.decimals;

  const y0 = tokenYVault.account.data.amount;
  const y0Scale = tokenYMint.account.data.decimals;
  const c = poolState.account.data.cValue;

  return [x0, x0Scale, y0, y0Scale, c, i, iScale] as [
    typeof x0,
    typeof x0Scale,
    typeof y0,
    typeof y0Scale,
    typeof c,
    typeof i,
    typeof iScale
  ];
}

export const swapXToYHmm = hydraMath.swap_x_to_y_hmm;

export const swapYToXHmm = hydraMath.swap_y_to_x_hmm;

export async function calculateSwap(
  tokenXMint: AccountData<TokenMint>,
  tokenYMint: AccountData<TokenMint>,
  tokenXVault: AccountData<TokenAccount>,
  tokenYVault: AccountData<TokenAccount>,
  poolState: AccountData<PoolState>,
  amount: bigint,
  direction: "xy" | "yx",
  log: Log,
  tokenXPrice: Decimal,
  tokenYPrice: Decimal
): Promise<[bigint, bigint]> {
  const isHmm = poolState.account.data.cValue > 0;

  const iScale = isHmm && tokenXPrice && tokenYPrice ? 8 : 0;
  const i =
    isHmm && tokenXPrice && tokenYPrice
      ? tokenXPrice.div(tokenYPrice).unscale(8n)
      : 0n;

  if (amount === 0n) return [0n, 0n];
  try {
    const args = parseCalculatorValues({
      tokenXMint,
      tokenXVault,
      tokenYMint,
      tokenYVault,
      poolState,
      i,
      iScale,
    });

    log("swappy: calculateSwap IN:", { args, direction, amount });

    const swapper =
      direction === "xy"
        ? hydraMath.swap_x_to_y_hmm
        : hydraMath.swap_y_to_x_hmm;
    log("swappy: selected direction " + direction);

    const [deltaX, deltaY] = await swapper(...args, amount);
    log("swappy: calculateSwap OUT:", { deltaX, deltaY });

    return [deltaX, deltaY];
  } catch (err) {
    log("swappy: ERROR: calculateSwap", `${err}`);
    return [0n, 0n];
  }
}
