import bs58 from "bs58";
process.stdin.on("data", (buf) => {
  const key = `${buf}`.trim();
  const b = bs58.decode(key);
  const j = new Uint8Array(
    b.buffer,
    b.byteOffset,
    b.byteLength / Uint8Array.BYTES_PER_ELEMENT
  );
  process.stdout.write(`[${j}]`);
  process.exit(0);
});
