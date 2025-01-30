import { restore } from "./restore";

export function resetState(alias = "anchor-fixture") {
  return async () => await restore(true, alias);
}
