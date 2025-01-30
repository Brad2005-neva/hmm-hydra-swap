import { render } from "./helpers";
import { PublicKey } from "@solana/web3.js";
test("it renders strings", () => {
  let out = "";
  const log = (m: string) => (out += m);
  render("hello world", undefined, log);

  expect(out).toBe("hello world");
});

test("it renders tables", () => {
  let out = "\n";
  const log = (m: string) => (out += m);

  const table = [
    ["London", "UK"],
    ["Paris", "France"],
    ["Berlin", "Germany"],
  ];

  render(table, ["City", "Country"], log);

  expect(out).toBe(`
 City    Country 
──────── ─────────
 London  UK      
 Paris   France  
 Berlin  Germany 
`);
});

test("it renders lists", () => {
  let out = "\n";
  const log = (m: string) => (out += m);

  const list = ["London", "Paris", "Berlin"];

  render(list, undefined, log);

  expect(out).toBe(`
London 
Paris  
Berlin 
`);
});

test("it renders objects", () => {
  let out = "\n";
  const log = (m: string) => (out += m);

  const obj = {
    someNumbers: "12345678",
    publicKey: new PublicKey("DqBe9WC9dBspUYMdgofNX2fUznH8uT6PCEdWpwZaHFWB"),
  };

  render(obj, undefined, log);

  expect(out).toBe(`
someNumbers 12345678                                     
publicKey   DqBe9WC9dBspUYMdgofNX2fUznH8uT6PCEdWpwZaHFWB 
`);
});

test("it renders deep objects", () => {
  let out = "\n";
  const log = (m: string) => (out += m);

  const obj = {
    poolId: "1",
    tokenX: {
      id: "tokenX",
      child: {
        id: "mything",
      },
    },
  };

  render(obj, undefined, log);

  expect(out).toBe(`
poolId          1       
tokenX.id       tokenX  
tokenX.child.id mything 
`);
});
