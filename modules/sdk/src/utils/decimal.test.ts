import { AccountData, TokenAccount, TokenMint } from "..";
import { Decimal } from "./decimal";

describe("the Decimal class", () => {
  it("checks precision", () => {
    expect(Decimal.from(1_000000n, 6n).unscale(18n)).toBe(1n * 10n ** 18n);
    expect(Decimal.from(1_000000n, 6n).unscale(4n)).toBe(1n * 10n ** 4n);
    expect(Decimal.from(100_000000n, 6n).unscale(4n)).toBe(100n * 10n ** 4n);
  });

  it("checks the add method", () => {
    const decimal = Decimal.from(2_0n, 1n);
    const added = decimal.add(Decimal.from(1_14159n, 5n)).unscale(5n);
    expect(added).toEqual(3_14159n);
  });

  it("checks the subtract method", () => {
    const decimal = Decimal.from(10_00n, 2n);
    const subtract = decimal.sub(Decimal.from(6_8584n, 4n)).unscale(4n);
    expect(subtract).toEqual(3_1416n);
  });

  it("checks the multiply method", () => {
    const decimal = Decimal.from(300_00000n, 5n);
    const multiply = decimal.mul(Decimal.from(5n)).unscale(2n);
    expect(multiply).toEqual(150000n);
  });

  it("to checks the divid method", () => {
    // https://mathworld.wolfram.com/PiApproximations.html
    const numerator = Decimal.from(
      233546921420225777694970883318153571_000n,
      3n
    );
    const denominator = new Decimal(74340293968115785654927455866388593n);
    expect(numerator.div(denominator).unscale(18n)).toBe(3_141592653916501746n);
  });

  it("creates a decimal with the different from methods", () => {
    const mockToken = { asset: { decimals: 6 } };
    const mockVault = {
      account: { data: { amount: 1_000000n } },
    } as AccountData<TokenAccount>;
    const mockMint = {
      account: { data: { decimals: 6 } },
    } as AccountData<TokenMint>;

    expect(Decimal.fromAmountAndToken(1_000000n, mockToken).unscale(18n)).toBe(
      1n * 10n ** 18n
    );
    expect(Decimal.fromVaultAndToken(mockVault, mockToken).unscale(18n)).toBe(
      1n * 10n ** 18n
    );
    expect(Decimal.fromVaultAndMint(mockVault, mockMint).unscale(18n)).toBe(
      1n * 10n ** 18n
    );
    expect(Decimal.fromAmountAndMint(1_000000n, mockMint).unscale(18n)).toBe(
      1n * 10n ** 18n
    );
    expect(Decimal.fromNumber(111.22).unscale(18n)).toBe(111_22n * 10n ** 16n);
  });

  it("adds two Decimals and returns a number", () => {
    const decimal = Decimal.from(10_00n, 2n);
    const subtract = decimal.sub(Decimal.from(6_8584n, 4n)).toNumber();
    expect(subtract).toEqual(3.1416);
  });

  it("returns Decimal as a fixed string", () => {
    expect(Decimal.from(3_141590n, 6n).toString()).toBe("3.14159");
  });

  it("Fails you when you try to divide by 0", () => {
    expect(() => Decimal.from(10n, 6n).div(Decimal.from(0n))).toThrowError(
      "Attempted divide by zero"
    );
  });

  it("returns Decimal as a string with different formats", () => {
    expect(Decimal.from(1000_00n, 2n).toFormat(Decimal.FORMAT_EUR)).toBe(
      "1.000"
    );

    expect(Decimal.from(1000_36n, 2n).toFormat(Decimal.FORMAT_EUR)).toBe(
      "1.000,36"
    );

    expect(
      Decimal.from(1000000_0000n, 4n).toFormat(Decimal.FORMAT_DOLLAR)
    ).toBe("1,000,000");

    expect(
      Decimal.from(1000000_1000n, 4n).toFormat(Decimal.FORMAT_DOLLAR)
    ).toBe("1,000,000.10");

    expect(
      Decimal.from(1000000_111111n, 6n).toFormat(Decimal.FORMAT_TOKEN, 8)
    ).toBe("1,000,000.111111");
  });
});
