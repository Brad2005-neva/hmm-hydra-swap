import { BN } from "@project-serum/anchor";
import { AccountData, Asset, TokenAccount, TokenMint } from "..";

export type FormatLocale = "de-DE" | "en-US";

export type FormatType = {
  code: FormatLocale;
  options?: Intl.NumberFormatOptions;
};

const FORMATS: { [key: string]: FormatType } = {
  EUR: {
    code: "de-DE",
    options: {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
  DOLLAR: {
    code: "en-US",
    options: {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
  TOKEN: {
    code: "en-US",
  },
  PERCENT: {
    code: "en-US",
    options: {
      useGrouping: false,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
};

const INTERNAL_SCALE = 18n;

const SCALE_FOR_MULTI_DIVI = new BN(`${10n ** INTERNAL_SCALE}`);

const toBN = (decimal: Decimal): BN => {
  return new BN(`${decimal.unscale(INTERNAL_SCALE)}`);
};

const toBigInt = (bn: BN): bigint => {
  return BigInt(bn.toString());
};

const toDecimal = (bn: BN): Decimal => {
  return new Decimal(toBigInt(bn), INTERNAL_SCALE);
};

export class Decimal {
  #scaled: BN;
  static FORMAT_EUR: FormatType = FORMATS.EUR;
  static FORMAT_DOLLAR: FormatType = FORMATS.DOLLAR;
  static FORMAT_TOKEN: FormatType = FORMATS.TOKEN;
  static FORMAT_PERCENT: FormatType = FORMATS.PERCENT;

  constructor(value: bigint, exponent: bigint = 0n) {
    this.#scaled = new BN(`${value * 10n ** (INTERNAL_SCALE - exponent)}`);
  }

  static from(value: bigint, exponent: bigint = 0n): Decimal {
    return new Decimal(value, exponent);
  }

  static fromAmountAndToken(
    value: bigint,
    token: { asset?: { decimals: number } }
  ): Decimal {
    const exponent = BigInt(token?.asset?.decimals || 0);
    return new Decimal(value, exponent);
  }

  static fromVaultAndToken(
    vault?: AccountData<TokenAccount>,
    token?: { asset?: { decimals: number } }
  ): Decimal {
    const value = vault?.account.data.amount || 0n;
    const exponent = BigInt(token?.asset?.decimals || 0);
    return new Decimal(value, exponent);
  }

  static fromVaultAndMint(
    vault: AccountData<TokenAccount>,
    mint: AccountData<TokenMint>
  ): Decimal {
    const value = vault?.account.data.amount || 0n;
    const exponent = BigInt(mint.account.data.decimals);
    return new Decimal(value, exponent);
  }

  static fromAmountAndMint(
    amount: bigint,
    mint?: AccountData<TokenMint>
  ): Decimal {
    const exponent = BigInt(mint?.account.data.decimals || 8);
    return new Decimal(amount, exponent);
  }

  static fromAmountAndAsset(amount: bigint, asset: Asset): Decimal {
    const exponent = BigInt(asset.decimals);
    return new Decimal(amount, exponent);
  }

  static fromAsset(asset: Asset) {
    return new Decimal(asset.balance || 0n, BigInt(asset.decimals));
  }

  static fromToken(token: { amount?: bigint; asset?: { decimals: number } }) {
    const value = token.amount || 0n;
    const exponent = BigInt(token?.asset?.decimals || 0);
    return new Decimal(value, exponent);
  }

  static fromNumber(number: number) {
    if (number % 1 === 0) {
      return Decimal.from(BigInt(number));
    }
    const [int, float] = number.toString().split(".");
    const value = BigInt(`${int}${float}`);
    const exponent = BigInt(float.length);
    return new Decimal(value, exponent);
  }

  static ZERO = Decimal.from(0n);

  unscale(precision: bigint): bigint {
    const diff = INTERNAL_SCALE - precision;
    return toBigInt(this.#scaled) / 10n ** diff;
  }

  toNumber(): number {
    const unscaled = toDecimal(this.#scaled).unscale(INTERNAL_SCALE);
    return Number(unscaled) / 10 ** Number(INTERNAL_SCALE);
  }

  toString(): string {
    const unscaledNumber = toDecimal(this.#scaled).toNumber();
    return `${unscaledNumber}`;
  }

  toFormat(locale: FormatType, fractionalLength?: number): string {
    const unscaledNumber = toDecimal(this.#scaled).toNumber();
    const options =
      locale !== Decimal.FORMAT_TOKEN &&
      Number.isInteger(Number(unscaledNumber.toFixed(2)))
        ? {
            ...locale.options,
            minimumFractionDigits: 0,
          }
        : {
            maximumFractionDigits: fractionalLength,
            ...locale.options,
          };
    return unscaledNumber.toLocaleString(locale.code, options);
  }

  add(other: Decimal): Decimal {
    const added = this.#scaled.add(toBN(other));
    return toDecimal(added);
  }

  sub(other: Decimal): Decimal {
    const sub = this.#scaled.sub(toBN(other));
    return toDecimal(sub);
  }

  mul(other: Decimal): Decimal {
    const multi = this.#scaled.mul(toBN(other));
    const demulti = multi.div(SCALE_FOR_MULTI_DIVI);
    return toDecimal(demulti);
  }

  div(other: Decimal): Decimal {
    if (other.eq(Decimal.ZERO)) throw new Error("Attempted divide by zero");
    const mult = this.#scaled.mul(SCALE_FOR_MULTI_DIVI);
    const divi = mult.div(toBN(other));
    return toDecimal(divi);
  }

  eq(other: Decimal): boolean {
    return this.#scaled.eq(toBN(other));
  }
}
