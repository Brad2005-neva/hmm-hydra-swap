import { captureValues, createPoolInfo, setupPoolStream } from "../test-utils";
import { PublicKey } from "@solana/web3.js";
import { EnrichedPoolState } from "../types";
import { Subject } from "rxjs";
import tokens from "@hydraprotocol/config/tokens.json";

const [USD, BTC, ETH, SOL] = tokens.localnet;
describe("PoolService.findPools()", () => {
  it("should find the pools in the stream", async () => {
    const usdSol$ = new Subject<EnrichedPoolState>();
    const usdBtc$ = new Subject<EnrichedPoolState>();

    const { service, poolStream } = setupPoolStream(
      // Assets = default
      [],
      // Here we inject our subjects above into the streamCache
      [
        [`${1}`, usdBtc$],
        [`${2}`, usdSol$],
      ]
    );

    const pools = [
      createPoolInfo(USD, ETH, 0),
      createPoolInfo(USD, BTC, 1),
      createPoolInfo(USD, SOL, 2),
      createPoolInfo(ETH, BTC, 3),
    ];

    const usdSol = { message: "usdSol" } as any as EnrichedPoolState;
    const usdBtc = { message: "usdBtc" } as any as EnrichedPoolState;

    const foundUsdSol$ = service.findPool({
      tokenA: new PublicKey(USD.address),
      tokenB: new PublicKey(SOL.address),
    });
    const foundUsdBtc$ = service.findPool({
      tokenA: new PublicKey(BTC.address),
      tokenB: new PublicKey(USD.address),
    });

    expect(foundUsdSol$).not.toBe(foundUsdBtc$);
    const gatheredData = Promise.all([
      captureValues(foundUsdSol$),
      captureValues(foundUsdBtc$),
    ]);

    for (const key of pools) {
      poolStream.next(key);
    }
    usdSol$.next(usdSol);
    usdBtc$.next(usdBtc);

    const [[usdSolPool], [usdBtcPool]] = await gatheredData;

    expect(usdSolPool).toBe(usdSol);
    expect(usdBtcPool).toBe(usdBtc);
  });
});
