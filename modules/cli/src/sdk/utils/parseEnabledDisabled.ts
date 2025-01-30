export function parseEnabledDisabled(enable?: boolean, disable?: boolean) {
  if (enable && !disable) {
    return true;
  }
  if (!enable && disable) {
    return false;
  }

  throw new Error("Must have either --enable or --disable set");
}
