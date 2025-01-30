import { resolve } from "path";
import { getCwd } from "./lib/config";

export const VAL_FOLDER = resolve(getCwd(), ".val");
export const SNAPS_FOLDER = resolve(getCwd(), "validator-snapshots");
export const SOLANA_PROCESS_SEARCH = "solana-test-val";
export const SOLANA_EXEC = "solana-test-validator";
export const CUR_FOLDER = `${VAL_FOLDER}/current`;
