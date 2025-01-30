export function ensure<T>(
  value: T | null | undefined,
  msg = "Expected value was undefined or null"
): T {
  if (typeof value === "undefined" || value === null) throw new Error(msg);
  return value;
}
