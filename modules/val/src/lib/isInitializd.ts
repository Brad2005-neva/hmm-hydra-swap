import fs from "fs";
import { VAL_FOLDER } from "../constants";

const doneFile = `${VAL_FOLDER}/done`;

export function isInitializd() {
  return fs.existsSync(doneFile);
}
