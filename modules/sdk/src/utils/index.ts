import * as anchor from "@project-serum/anchor";
import { BN, AnchorProvider } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { Option } from "../types";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as SPLToken from "@solana/spl-token";
export * from "./NetworkMeta";

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

function encodeString(input: string) {
  return anchor.utils.bytes.utf8.encode(input);
}

function encodeUInt32(input: number) {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(input);
  return new Uint8Array(b);
}

/**
 * Gets a PDA derived based on seed
 * @param programId ProgramID to derive this key from
 * @param seeds array of seeds
 * @returns
 */
export async function getPDA(
  programId: PublicKey,
  seeds: (PublicKey | string | number)[]
) {
  const parsedSeeds = seeds.map((seed) => {
    if (typeof seed === "string") return encodeString(seed);
    if (typeof seed === "number") return encodeUInt32(seed);
    return seed.toBuffer();
  });

  const [pubkey, bump] = await anchor.web3.PublicKey.findProgramAddress(
    parsedSeeds,
    programId
  );
  return [pubkey, bump] as [typeof pubkey, typeof bump];
}

export function toBigInt(amount: BN): bigint {
  return BigInt(amount.toString());
}

export function toBN(amount: bigint): BN {
  const str = amount.toString();
  return new BN(str);
}

export async function tryGet<T>(fn: Promise<T>): Promise<T | undefined> {
  try {
    return await fn;
  } catch (err) {
    return undefined;
  }
}

export function isDefaultProvider(provider: AnchorProvider) {
  // TODO: use constant
  return (
    provider.wallet.publicKey.toString() === "11111111111111111111111111111111"
  );
}

// Testing utility to stringify public keys
export function stringifyProps<
  T extends Record<string, { toString: Function }>
>(obj: T): { [K in keyof T]: string } {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => {
      let valStr = v.toString();
      valStr = valStr === "[object Object]" ? stringifyProps(v) : valStr;
      return [k, valStr];
    })
  ) as { [K in keyof T]: string };
}

/**
 * Return the first tokenAccount publicKey for the given mint address
 * @param provider anchor provider
 * @param mint mintAddress
 * @returns publicKey
 */
export async function getExistingOwnerTokenAccount(
  provider: AnchorProvider,
  mint: PublicKey
): Promise<Option<PublicKey>> {
  const account = await provider.connection.getTokenAccountsByOwner(
    provider.wallet.publicKey,
    {
      mint,
    }
  );
  const accounts = account.value;
  if (accounts.length > 0) {
    return accounts[0].pubkey;
  }
  return undefined;
}

export async function findAssociatedTokenAddress(
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey
): Promise<PublicKey> {
  return await SPLToken.getAssociatedTokenAddress(
    tokenMintAddress, // mint
    walletAddress, // token account authority
    false,
    TOKEN_PROGRAM_ID, // always token program id
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID // always associated token program id
  );
}

export function isEqual(a: PublicKey, b: PublicKey): boolean {
  return `${a}` === `${b}`;
}
