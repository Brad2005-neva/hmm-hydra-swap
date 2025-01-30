#!/usr/bin/env node

import bs58 from "bs58";
const one = process.argv[2];
const two = process.argv[3];

const abuff = Buffer.from(bs58.decode(one));
const bbuff = Buffer.from(bs58.decode(two));
// console.log({ abuff, one });
// console.log({ bbuff, two });

console.log((abuff.compare(bbuff) < 0 ? [one, two] : [two, one]).join(" "));
