import { VAL_FOLDER } from "../constants";
import { run } from "./run";
import { isInitializd } from "./isInitializd";

const doneFile = `${VAL_FOLDER}/done`;

export async function idempotentInit() {
  if (isInitializd()) return;
  await run(`mkdir -p ${VAL_FOLDER}`, { quiet: true });
  await run(`echo 0 > ${doneFile}`, { quiet: true });
}
