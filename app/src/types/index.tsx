import { PublicKey, Transaction, SendOptions } from "@solana/web3.js";
import { ReactNode } from "react";

export type PromiseVal<T> = T extends Promise<infer J> ? J : never;

export type AssetBalance = Map<string, bigint>;

export type TokenPrices = Record<string, number | undefined>;

type DisplayEncoding = "utf8" | "hex";
type PhantomEvent = "connect" | "disconnect" | "accountChanged";
type PhantomRequestMethod =
  | "connect"
  | "disconnect"
  | "signAndSendTransaction"
  | "signTransaction"
  | "signAllTransactions"
  | "signMessage";
interface ConnectOpts {
  onlyIfTrusted: boolean;
}

export type SideBarItem = {
  name: string;
  icon: ReactNode;
  activeIcon: ReactNode;
  link: string;
  isActive: boolean;
};

export interface PhantomProvider {
  publicKey: PublicKey | null;
  isConnected: boolean | null;
  signAndSendTransaction: (
    transaction: Transaction,
    opts?: SendOptions
  ) => Promise<{ signature: string; publicKey: PublicKey }>;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  signMessage: (
    message: Uint8Array | string,
    display?: DisplayEncoding
  ) => Promise<any>;
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

export type PopoverOrigin = {
  vertical: "top" | "center" | "bottom";
  horizontal: "left" | "center" | "right";
};
