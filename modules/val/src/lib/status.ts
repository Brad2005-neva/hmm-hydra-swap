import { isRunning } from "./utils";

export async function status() {
  if (await isRunning()) {
    console.log("validator is running");
  } else {
    console.log("validator is NOT running");
  }
}
