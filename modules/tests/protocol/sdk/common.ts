import * as anchor from "@project-serum/anchor";
import { Keypair } from "@solana/web3.js";
import assert from "assert";
import {
  HydraSDK,
  TokenAccount,
  Network,
  AccountData,
  LiquidityPoolsCalculator,
  TokenMint,
  PoolState,
  Decimal,
} from "@hydraprotocol/sdk";
import { take, toArray, filter } from "rxjs/operators";
import { resetState } from "@hydraprotocol/val";

describe("HydraSDK", () => {
  // This whole describe block runs off the same state
  before(resetState("anchor-fixture"));

  let provider: anchor.AnchorProvider;

  let sdk: HydraSDK;
  beforeEach(() => {
    provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);
    sdk = HydraSDK.fromAnchorProvider(provider, Network.LOCALNET);
  });

  it("should get the mint from accounts", async () => {
    const mint = Keypair.generate();
    const vault = Keypair.generate();

    await sdk.common.createMintAndVault(mint, vault, 100_000_000n);
    const loader = sdk.accountLoaders.token(vault.publicKey);

    const { data } = await loader.info();

    assert.strictEqual(data.amount, 100000000n);
    assert.strictEqual(`${data.mint}`, `${mint.publicKey}`);
    assert.strictEqual(`${data.owner}`, `${provider.wallet.publicKey}`);
  });

  describe("accountLoader.stream()", () => {
    async function setup() {
      const mint = Keypair.generate();
      const vault = Keypair.generate();
      const owner = sdk.ctx.wallet.publicKey;
      await sdk.common.createMintAndVault(mint, vault, 100_000_000n);

      const token = await sdk.common.createTokenAccount(mint.publicKey, owner);
      const account = sdk.accountLoaders.token(token);

      return { account, mint, token, owner, vault };
    }
    type AccountArray = AccountData<TokenAccount>[];
    it("should emit a value on subscription", async () => {
      const { account, mint, owner } = await setup();
      const [val] = await new Promise<AccountArray>((resolve) => {
        account
          .stream()
          .pipe(filter(Boolean), take(1), toArray())
          .subscribe(resolve);
      });
      assert.strictEqual(`${val.pubkey}`, `${await account.key()}`);
      assert.strictEqual(`${val.account.data.amount}`, `0`);
      assert.strictEqual(`${val.account.data.mint}`, `${mint.publicKey}`);
      assert.strictEqual(`${val.account.data.owner}`, `${owner}`);
    });

    it("should emit a value when updated", async () => {
      const { account, vault, token } = await setup();

      const [val1, val2] = await new Promise<AccountArray>((resolve) => {
        account
          .stream()
          .pipe(filter(Boolean), take(2), toArray())
          .subscribe(resolve);

        sdk.common.transfer(vault.publicKey, token, 1000);
      });

      assert.strictEqual(`${val1.account.data.amount}`, `0`);
      assert.strictEqual(`${val2.account.data.amount}`, `1000`);
    });

    // mainnet swapping x to y for SOL/USDC
    // price SOL.USD = 33
    // price USDC.USD = 1
    // price i = 33/1
    // 1 SOL expect 11.625774 USDC
    it("should ensure that the i value is properly calculated for a XY swap", async () => {
      const calculator = LiquidityPoolsCalculator.create();
      const tokenXMint = {
        account: { data: { decimals: 9 } },
      } as unknown as AccountData<TokenMint>;

      const tokenYMint = {
        account: { data: { decimals: 6 } },
      } as unknown as AccountData<TokenMint>;

      const tokenXVault = {
        account: { data: { amount: 3_171071301n } },
      } as unknown as AccountData<TokenAccount>;
      const tokenYVault = {
        account: { data: { amount: 48_491935n } },
      } as unknown as AccountData<TokenAccount>;

      const poolState = {
        account: { data: { cValue: 150 } },
      } as unknown as AccountData<PoolState>;

      const results = await calculator.calculateSwap(
        tokenXMint,
        tokenYMint,
        tokenXVault,
        tokenYVault,
        poolState,
        1_000000000n,
        "xy",
        console.log,
        Decimal.fromNumber(33),
        Decimal.fromNumber(1)
      );
      console.log({ results });
      assert.deepStrictEqual(results, [1_000000000n, 11_625774n]);
    });

    // mainnet swapping y to x for SOL/USDC
    // price SOL.USD = 33
    // price USDC.USD = 1
    // price i = 33/1
    // 50 USDC expect 1.352634911 SOL
    it("should ensure that the i value is properly calculated for a YX swap", async () => {
      const calculator = LiquidityPoolsCalculator.create();
      const tokenXMint = {
        account: { data: { decimals: 9 } },
      } as unknown as AccountData<TokenMint>;

      const tokenYMint = {
        account: { data: { decimals: 6 } },
      } as unknown as AccountData<TokenMint>;

      const tokenXVault = {
        account: { data: { amount: 3_171071301n } },
      } as unknown as AccountData<TokenAccount>;
      const tokenYVault = {
        account: { data: { amount: 48_491935n } },
      } as unknown as AccountData<TokenAccount>;

      const poolState = {
        account: { data: { cValue: 150 } },
      } as unknown as AccountData<PoolState>;

      const results = await calculator.calculateSwap(
        tokenXMint,
        tokenYMint,
        tokenXVault,
        tokenYVault,
        poolState,
        50_000000n,
        "yx",
        console.log,
        Decimal.fromNumber(33),
        Decimal.fromNumber(1)
      );
      console.log({ results });
      assert.deepStrictEqual(results, [1_352634911n, 50_000000n]);
    });
  });
});
