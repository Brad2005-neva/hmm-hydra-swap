import arg from "arg";

type MainFn<T extends arg.Spec> = (args: arg.Result<T>) => Promise<void>;

/**
 * Provides top level async
 */

function parseArgs<T extends arg.Spec>(
  fnOrArgs: T | MainFn<T>,
  givenFn?: MainFn<T>
): [MainFn<T>, T] {
  if (typeof fnOrArgs === "function") {
    return [fnOrArgs, {} as T];
  }

  if (typeof fnOrArgs !== "undefined" && typeof givenFn === "function") {
    return [givenFn, fnOrArgs];
  }

  throw new Error("Bad arguments");
}

export async function main<T extends arg.Spec>(
  fnOrArgs: MainFn<T>
): Promise<void>;
export async function main<T extends arg.Spec>(
  fnOrArgs: T,
  givenFn: MainFn<T>
): Promise<void>;
export async function main<T extends arg.Spec>(
  fnOrArgs: T | MainFn<T>,
  givenFn?: MainFn<T>
) {
  const [fn, argSpec] = parseArgs(fnOrArgs, givenFn);

  // Allow to use args outside of this runner
  const args =
    Object.keys(argSpec).length > 0 ? arg(argSpec) : ({} as arg.Result<T>);

  try {
    await fn(args);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
  process.exit(0);
}
