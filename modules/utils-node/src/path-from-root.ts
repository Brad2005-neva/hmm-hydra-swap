import { resolve } from "path";

/**
 * Returns the filepath resolved from the root of the monorepo
 * @param path file path
 * @returns the file path resolved from the root of the monorepo
 */
export function pathFromRoot(path: string) {
  return resolve(__dirname, "../../..", path);
}
