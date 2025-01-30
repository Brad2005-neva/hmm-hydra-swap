import { TokenMint } from "../../types";
import { AccountData } from "../../libs/account-loader";
import * as wasm from "@hydraprotocol/math";
import { loadWasm } from "@hydraprotocol/wasm-loader";
import { Log, PoolState } from "../types";
import { Decimal } from "../..";

const hydraMath = loadWasm(wasm);

function parseCalculatorValues({
  tokenXMint,
  tokenYMint,
  poolState,
  amount,
  direction,
  feeThisUpdate,
  tokenXPrice,
  tokenYPrice,
  feeThisPrice,
}: {
  tokenXMint: AccountData<TokenMint>;
  tokenYMint: AccountData<TokenMint>;
  poolState: AccountData<PoolState>;
  amount: bigint;
  direction: string;
  feeThisUpdate: bigint;
  feeThisPrice: bigint;
  tokenXPrice: number;
  tokenYPrice: number;
}) {
  const feeCalculation = poolState.account.data.fees.feeCalculation.toString();

  const amountScale =
    direction === "xy"
      ? tokenXMint.account.data.decimals
      : tokenYMint.account.data.decimals;

  const feeMinPct = BigInt(poolState.account.data.fees.feeMinPct.toString());
  const feeMaxPct = BigInt(poolState.account.data.fees.feeMaxPct.toString());

  const feeLastUpdate = BigInt(
    poolState.account.data.fees.feeLastUpdate.toString()
  );

  const feeLastPrice = BigInt(
    poolState.account.data.fees.feeLastPrice.toString()
  );

  const feeThisPrice_scale =
    tokenXPrice && tokenYPrice ? tokenXMint.account.data.decimals : 0;

  // safe to retrieve from pool state
  const feeLastEwma = BigInt(
    poolState.account.data.fees.feeLastEwma.toString()
  );

  const feeEwmaWindow = BigInt(
    poolState.account.data.fees.feeEwmaWindow.toString()
  );

  const feeLambda = BigInt(poolState.account.data.fees.feeLambda.toString());

  const feeVelocity = BigInt(
    poolState.account.data.fees.feeVelocity.toString()
  );

  return [
    feeCalculation,
    amount,
    amountScale,
    feeMinPct,
    feeMaxPct,
    feeLastUpdate,
    feeThisUpdate,
    feeLastPrice,
    feeThisPrice,
    feeThisPrice_scale,
    feeLastEwma,
    feeEwmaWindow,
    feeLambda,
    feeVelocity,
  ] as [
    typeof feeCalculation,
    typeof amount,
    typeof amountScale,
    typeof feeMinPct,
    typeof feeMaxPct,
    typeof feeLastUpdate,
    typeof feeThisUpdate,
    typeof feeLastPrice,
    typeof feeThisPrice,
    typeof feeThisPrice_scale,
    typeof feeLastEwma,
    typeof feeEwmaWindow,
    typeof feeLambda,
    typeof feeVelocity
  ];
}

export async function calculateFees(
  tokenXMint: AccountData<TokenMint>,
  tokenYMint: AccountData<TokenMint>,
  poolState: AccountData<PoolState>,
  amount: bigint,
  direction: "xy" | "yx",
  feeThisUpdate: bigint,
  log: Log,
  tokenXPrice: Decimal,
  tokenYPrice: Decimal
): Promise<[bigint, bigint, bigint, bigint, bigint, bigint]> {
  try {
    const isHmm = !!(poolState.account.data.cValue > 0);

    const feeThisPrice =
      isHmm && tokenXPrice && tokenYPrice
        ? tokenXPrice.div(tokenYPrice).unscale(8n)
        : 0n;

    const args = parseCalculatorValues({
      tokenXMint,
      tokenYMint,
      poolState,
      amount,
      direction,
      feeThisUpdate,
      feeThisPrice,
      tokenXPrice: tokenXPrice.toNumber(),
      tokenYPrice: tokenXPrice.toNumber(),
    });

    log("flappy: calculateFees IN: ", {
      args,
      amount,
    });

    const [
      feeAmount,
      feePercentage,
      amountExFee,
      feeLastUpdate,
      feeLastPrice,
      feeLastEwma,
    ] = await hydraMath.compute_fees(...args);
    log("flappy: calculateFees OUT:", {
      feeAmount,
      feePercentage,
      amountExFee,
      feeLastUpdate,
      feeLastPrice,
      feeLastEwma,
    });

    return [
      feeAmount,
      feePercentage,
      amountExFee,
      feeLastUpdate,
      feeLastPrice,
      feeLastEwma,
    ];
  } catch (err) {
    log("swappy: ERROR: calculateSwap", `${err}`);
    return [0n, 0n, 0n, 0n, 0n, 0n];
  }
}
