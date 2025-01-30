// This script will allow for the creation of dynamic pyth mock accounts
// Using the following for reference
// https://github.com/pyth-network/pyth-client-js/blob/main/src/index.ts

import { parsePriceData, parseProductData } from "@pythnetwork/client";
import {
  EXAMPLE_PYTH_PRICE_STRUCTURE,
  EXAMPLE_PYTH_PRICE_ACCOUNT,
} from "./templates";
import { PublicKey } from "@solana/web3.js";

export type PriceStructure = typeof EXAMPLE_PYTH_PRICE_STRUCTURE;

export type Account = typeof EXAMPLE_PYTH_PRICE_ACCOUNT;
export const Magic = 0xa1b2c3d4;

type PythPriceDataTransform = {
  price: number;
  validSlot: bigint;
  lastSlot: bigint;
  publishSlot: bigint;
};
type PythProductDataTransform = {
  priceAccount: string;
};
function insertBigInt(buff: Buffer, loc: number, value: bigint) {
  const head = buff.slice(0, loc);
  const mid = buff.slice(loc, loc + 8);
  const tail = buff.slice(loc + 8);
  mid.writeBigInt64LE(value);
  return Buffer.concat([head, mid, tail]);
}

function insertPublicKey(buff: Buffer, loc: number, value: string) {
  const mid = new PublicKey(value).toBytes();
  const head = buff.slice(0, loc);
  const tail = buff.slice(loc + 32);
  return Buffer.concat([head, mid, tail]);
}

export function updatePythProductAccountData(
  base64EncStringDataFromAccount: string,
  { priceAccount }: Partial<PythProductDataTransform>
): string {
  let buff = Buffer.from(base64EncStringDataFromAccount, "base64");

  // public key
  if (typeof priceAccount !== "undefined") {
    buff = insertPublicKey(buff, 16, priceAccount);
  }

  // so far we dont have a technical need to deserialize more product information aside from price key
  // so we are not doing it as it is complex. This may change in the future.

  return buff.toString("base64");
}

export function deserializePythProductData(data: string) {
  return parseProductData(Buffer.from(data, "base64"));
}

export function updatePythPriceAccountData(
  base64EncStringDataFromAccount: string,
  { price, validSlot, lastSlot, publishSlot }: Partial<PythPriceDataTransform>
): string {
  // serialize newValues to update locations within the data buffer and return the data buffer
  let buff = Buffer.from(base64EncStringDataFromAccount, "base64");

  if (typeof price !== "undefined") {
    buff = insertBigInt(buff, 208, BigInt(price * 100000000));
  }

  if (typeof publishSlot !== "undefined") {
    buff = insertBigInt(buff, 232, publishSlot);
  }

  if (typeof lastSlot !== "undefined") {
    buff = insertBigInt(buff, 32, lastSlot);
  }

  if (typeof validSlot !== "undefined") {
    buff = insertBigInt(buff, 40, validSlot);
  }

  return buff.toString("base64");
}

export function deserializePythPriceData(data: string) {
  return parsePriceData(Buffer.from(data, "base64"));
}
