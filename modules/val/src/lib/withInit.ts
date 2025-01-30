import { idempotentInit } from "./idempotentInit";

// eslint-disable-next-line no-unused-vars
export function withInit<T extends unknown[]>(fn: (...args: T) => any) {
  return async (...args: T) => {
    await idempotentInit();
    return await fn(...args);
  };
}
