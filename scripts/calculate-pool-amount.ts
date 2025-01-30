import { main } from "@hydraprotocol/utils-node";
import { Decimal } from "@hydraprotocol/sdk";
export {};

/*
// BTC:SOL
cpa 
  --tokenXDecimals 8
  --tokenYDecimals 9
  --tokenXPrice 
*/

main(
  {
    "--tokenXDecimals": Number,
    "--tokenXPrice": Number,
    "--tokenYDecimals": Number,
    "--tokenYPrice": Number,
    "--scale": Number,
  },
  async (args) => {
    const xDecimals = args["--tokenXDecimals"];
    const xPrice = args["--tokenXPrice"];
    const yDecimals = args["--tokenYDecimals"];
    const yPrice = args["--tokenYPrice"];
    const scale = args["--scale"];

    if (!xDecimals) throw new Error("xDecimals not provided");
    if (!xPrice) throw new Error("xPrice not provided");
    if (!yDecimals) throw new Error("yDecimals not provided");
    if (!yPrice) throw new Error("yPrice not provided");
    if (!scale) throw new Error("scale not provided");
    const ONE = Decimal.fromNumber(1);
    const ratio = Decimal.fromNumber(xPrice).div(Decimal.fromNumber(yPrice));
    const xScaled = ONE.mul(Decimal.fromNumber(scale));
    const yScaled = ONE.mul(ratio).mul(Decimal.fromNumber(scale));

    const x = Number(xScaled.unscale(BigInt(xDecimals)));
    const y = Number(yScaled.unscale(BigInt(yDecimals)));
    const xDivy = xScaled.div(yScaled);
    const yDivx = yScaled.div(xScaled);
    console.log(
      JSON.stringify({
        xScaled: Number(xScaled),
        yScaled: Number(yScaled),
        x: Number(x),
        y: Number(y),
        xPrice: Number(xPrice),
        yPrice: Number(yPrice),
        xDecimals: Number(xDecimals),
        yDecimals: Number(yDecimals),
        xDivy: Number(xDivy),
        yDivx: Number(yDivx),
      })
    );
  }
);
