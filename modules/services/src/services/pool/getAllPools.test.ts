import {
  captureValues,
  createPoolInfo,
  gatherLast,
  setupPoolStream,
  toPoolDescriptor,
} from "../test-utils";
import tokens from "@hydraprotocol/config/tokens.json";

const [USD, BTC, ETH, SOL] = tokens.localnet;

describe("PoolService.getAllPools()", () => {
  it("should list all pools", async () => {
    const { service, poolStream } = setupPoolStream();
    const pools = [createPoolInfo(USD, ETH, 0), createPoolInfo(USD, BTC, 1)];
    const items = await gatherLast(service.getAllPools(), pools.length, () => {
      for (const key of pools) {
        poolStream.next(key);
      }
    });
    expect(items).toEqual(pools.map(toPoolDescriptor));
  });

  it("should list all pools with paging", async () => {
    const { service, poolStream } = setupPoolStream();
    const pools = [
      createPoolInfo(USD, ETH, 0),
      createPoolInfo(USD, BTC, 1),
      createPoolInfo(USD, SOL, 2),
      createPoolInfo(ETH, BTC, 3),
    ];

    async function testPaging(offset: number, limit: number) {
      const items = await captureValues(
        service.getAllPools(offset, limit),
        () => {
          for (const key of pools) {
            poolStream.next(key);
          }
        }
      );
      const [last] = items.slice(-1);
      expect(last).toEqual(
        pools.slice(offset, offset + limit).map(toPoolDescriptor)
      );
    }

    await testPaging(1, 2);
    await testPaging(0, 3);
  });

  it("should limit assets based on whitelist", async () => {
    const { service, poolStream } = setupPoolStream([USD, BTC, SOL]);
    const pools = [
      createPoolInfo(USD, ETH, 0),
      createPoolInfo(USD, BTC, 1),
      createPoolInfo(USD, SOL, 2),
      createPoolInfo(ETH, BTC, 3),
    ];

    const items = await gatherLast(service.getAllPools(), 2, () => {
      for (const item of pools) {
        poolStream.next(item);
      }
    });
    expect(items).toEqual(
      pools.filter((_, i) => [1, 2].includes(i)).map(toPoolDescriptor)
    );
  });
});
