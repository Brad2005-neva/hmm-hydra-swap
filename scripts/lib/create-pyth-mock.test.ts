import {
  deserializePythPriceData,
  deserializePythProductData,
  updatePythPriceAccountData,
  updatePythProductAccountData,
} from "./create-pyth-mock";
import {
  EXAMPLE_PYTH_PRICE_STRUCTURE,
  EXAMPLE_PYTH_PRICE_ACCOUNT,
  EXAMPLE_PYTH_PRODUCT_ACCOUNT,
  EXAMPLE_PYTH_PRODUCT_STRUCTURE,
} from "./templates";
import { PublicKey } from "@solana/web3.js";
// Potential things to alter
// emaPrice.valueComponent
// emaPrice.value
// emaPrice.numerator
// emaPrice.denominator
// emaconfidence.valueComponent
// emaconfidence.value
// emaconfidence.numerator
// emaconfidence.denominator
// previousPriceComponent
// previousPrice
// aggregate.priceComponent
// aggregate.price
// price

describe("updatePythPriceAccount", () => {
  const base64AccountData = EXAMPLE_PYTH_PRICE_ACCOUNT.account.data[0];
  it("should update price", () => {
    expect(
      deserializePythPriceData(
        updatePythPriceAccountData(base64AccountData, {
          price: 123.4567,
        })
      )
    ).toMatchObject({
      ...EXAMPLE_PYTH_PRICE_STRUCTURE,
      price: 123.4567,
      aggregate: {
        price: 123.4567,
        priceComponent: 12345670000n,
      },
    });
  });

  it("should update the lastSlot", () => {
    expect(
      deserializePythPriceData(
        updatePythPriceAccountData(base64AccountData, {
          lastSlot: 12345678n,
        })
      )
    ).toMatchObject({
      ...EXAMPLE_PYTH_PRICE_STRUCTURE,
      lastSlot: 12345678n,
    });
  });

  it("should update the validSlot", () => {
    expect(
      deserializePythPriceData(
        updatePythPriceAccountData(base64AccountData, {
          validSlot: 12345678n,
        })
      )
    ).toMatchObject({
      ...EXAMPLE_PYTH_PRICE_STRUCTURE,
      validSlot: 12345678n,
    });
  });
  it("should update the publishSlot", () => {
    expect(
      deserializePythPriceData(
        updatePythPriceAccountData(base64AccountData, {
          publishSlot: 12345678n,
        })
      )
    ).toMatchObject({
      ...EXAMPLE_PYTH_PRICE_STRUCTURE,
      aggregate: {
        publishSlot: 12345678,
      },
    });
  });
});

describe("updatePythProductAccount", () => {
  const base64AccountData = EXAMPLE_PYTH_PRODUCT_ACCOUNT.account.data[0];

  // so far we dont have a technical need to deserialize more product information aside from price key
  // so we are not doing it as it is complex. This may change in the future.

  it("should update the account", () => {
    const key = "Gnvzq9oW4rycXfGttVxC2MejzFscv8crWAT4kYnS6265";
    expect(
      // flattenPubKey(
      deserializePythProductData(
        // base64AccountData
        updatePythProductAccountData(base64AccountData, {
          priceAccount: key,
        })
      )
      // )
    ).toEqual({
      ...EXAMPLE_PYTH_PRODUCT_STRUCTURE,
      priceAccountKey: new PublicKey(key),
      product: {
        ...EXAMPLE_PYTH_PRODUCT_STRUCTURE.product,
        price_account: key,
      },
    });
  });
});
