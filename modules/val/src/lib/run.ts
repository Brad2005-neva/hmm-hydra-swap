import { spawn } from "child_process";

export async function run(
  instruction: string,
  { detached = false, quiet = false } = {}
) {
  const [executable, ...args] = instruction.split(" ").filter(Boolean);
  await new Promise<void>((resolve, reject) => {
    const stdio = !quiet ? "inherit" : "ignore";
    const proc = spawn(executable, args, { detached, stdio });
    proc.on("close", (val) => {
      if (val === 1) return reject("Process closed with non 0 error code");
      resolve();
    });
    if (detached) proc.unref();
  });
}
