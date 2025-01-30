import fs from "fs";
import { SNAPS_FOLDER } from "../constants";

export async function list() {
  const files = fs.readdirSync(SNAPS_FOLDER);
  console.log(files.join("\n"));
  return files;
}
