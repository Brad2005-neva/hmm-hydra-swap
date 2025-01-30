import chalk from "chalk";

const log = (o: any) =>
  JSON.stringify(o, (k, v) => {
    if (typeof v === "bigint") {
      return v.toString() + "n";
    }
    return v;
  });
export function logMethodCalls<T extends object>(instance: T): T {
  return new Proxy(instance, {
    get(t, p) {
      const o = Reflect.get(t, p);
      if (typeof o === "function") {
        const fn = o.bind(t);
        return (...args: any[]) => {
          console.log(
            ` ${chalk.grey(t.constructor.name)} -> ${chalk.cyan(
              p.toString()
            )}(${chalk.yellow(args.map(log).join(","))})`
          );
          return fn(...args);
        };
      }
      return o;
    },
  }) as T;
}
