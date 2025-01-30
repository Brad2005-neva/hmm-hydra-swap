export const normalizeAddress = (address: string) => {
  return address ? address.slice(0, 6) + "..." + address.slice(-4) : "";
};

export const normalizeBalance = (balance: number, maxDigits: number = 4) => {
  return balance
    ? balance.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: maxDigits,
      })
    : "0";
};
