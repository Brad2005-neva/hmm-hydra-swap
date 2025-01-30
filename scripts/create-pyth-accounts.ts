import {
  updatePythPriceAccountData,
  updatePythProductAccountData,
} from "./lib/create-pyth-mock";
import {
  EXAMPLE_PYTH_PRICE_ACCOUNT,
  EXAMPLE_PYTH_PRODUCT_ACCOUNT,
} from "./lib/templates";
import fs from "fs";
import { main, pathFromRoot } from "@hydraprotocol/utils-node";

const FIXTURE_CONFIG = [
  {
    fixtureName: "sol_usd",
    productAccount: { pubkey: "Ay8kmq7KDUHREdyjDWmvwvcyujRmCsGd9z7TmXV1WCyM" },
    priceAccount: {
      pubkey: "CauGFf9AY9kJm9cwBDMBW5jfGrQK5p6tG7WULbvvKSfG",
      price: 38,
      lastSlot: 200000n,
      validSlot: 200001n,
    },
  },
  {
    fixtureName: "usdc_usd",
    productAccount: { pubkey: "8GWTTbNiXdmyZREXbjsZBmCRuzdPrW55dnZGDkTRjWvb" },
    priceAccount: {
      pubkey: "Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD",
      price: 1,
      lastSlot: 200000n,
      validSlot: 200001n,
    },
  },
  {
    fixtureName: "btc_usd",
    productAccount: { pubkey: "3m1y5h2uv7EQL3KaJZehvAJa4yDNvgc5yAdL9KPMKwvk" },
    priceAccount: {
      pubkey: "HovQMDrbAgAYPCmHVSrezcSmkMtXSSUsLDFANExrZh2J",
      price: 22000,
      lastSlot: 200000n,
      validSlot: 200001n,
    },
  },
  {
    fixtureName: "eth_usd",
    productAccount: { pubkey: "EMkxjGC1CQ7JLiutDbfYb7UKb3zm9SJcUmr1YicBsdpZ" },
    priceAccount: {
      pubkey: "JBu1AL4obBcCMqKBBxhpWCNUt136ijcuMZLFvTP7iWdB",
      price: 1627,
      lastSlot: 200000n,
      validSlot: 200001n,
    },
  },
];

function collateIndex(
  acc: object,
  { fixtureName, priceAccount, productAccount }: ReturnType<typeof writeContent>
) {
  return { ...acc, [fixtureName]: { priceAccount, productAccount } };
}

const keycheck = new Set();

function writeContent({
  fixtureName,
  priceAccountFileContent,
  productAccountFileContent,
}: ReturnType<typeof getContent>) {
  console.log(`Writing "${fixtureName}"`);
  fs.writeFileSync(
    `../modules/tests/protocol/fixtures/${fixtureName}.price.json`,
    JSON.stringify(priceAccountFileContent, null, 2)
  );
  fs.writeFileSync(
    `../modules/tests/protocol/fixtures/${fixtureName}.product.json`,
    JSON.stringify(productAccountFileContent, null, 2)
  );

  if (
    keycheck.has(priceAccountFileContent.pubkey) ||
    keycheck.has(productAccountFileContent.pubkey)
  ) {
    throw new Error("Duplicate account!");
  }
  keycheck.add(priceAccountFileContent.pubkey);
  keycheck.add(productAccountFileContent.pubkey);
  return {
    fixtureName,
    priceAccount: priceAccountFileContent.pubkey,
    productAccount: productAccountFileContent.pubkey,
  };
}

function getContent(fixture: typeof FIXTURE_CONFIG[0]) {
  const {
    fixtureName,
    productAccount: { pubkey: productPubKey },
    priceAccount: { pubkey: priceAccountPubKey },
  } = fixture;
  // Create fixture
  const priceAccountFileContent = {
    ...EXAMPLE_PYTH_PRICE_ACCOUNT,
    account: {
      ...EXAMPLE_PYTH_PRICE_ACCOUNT.account,
      data: [
        updatePythPriceAccountData(EXAMPLE_PYTH_PRICE_ACCOUNT.account.data[0], {
          price: fixture.priceAccount.price,
          lastSlot: fixture.priceAccount.lastSlot,
          validSlot: fixture.priceAccount.validSlot,
          publishSlot: fixture.priceAccount.validSlot,
        }),
        "base64",
      ],
    },
    pubkey: priceAccountPubKey,
  };

  const productAccountFileContent = {
    ...EXAMPLE_PYTH_PRODUCT_ACCOUNT,
    account: {
      ...EXAMPLE_PYTH_PRODUCT_ACCOUNT.account,
      data: [
        updatePythProductAccountData(
          EXAMPLE_PYTH_PRODUCT_ACCOUNT.account.data[0],
          {
            priceAccount: priceAccountPubKey,
          }
        ),
        "base64",
      ],
    },
    pubkey: productPubKey,
  };

  return { fixtureName, productAccountFileContent, priceAccountFileContent };
}

function folderToValAccounts(folder: string) {
  type WithPubkey = {
    pubkey: string;
  };

  const files = fs
    .readdirSync(pathFromRoot(folder))
    .filter(
      (filename) => !!filename.match(/\.json$/) && filename !== "index.json"
    );

  return files.map((file) => {
    const location = `./${folder}/${file}`;
    const address = (
      JSON.parse(
        fs.readFileSync(pathFromRoot(location)).toString()
      ) as WithPubkey
    ).pubkey;
    return { address, location };
  });
}

type WithAccounts = {
  accounts: { address: string; location: string };
};
function updateValConfig(filepath: string, folder: string) {
  console.log(`Updating ${filepath}`);
  const config = JSON.parse(
    fs.readFileSync(pathFromRoot(filepath)).toString()
  ) as WithAccounts;

  fs.writeFileSync(
    pathFromRoot(filepath),
    JSON.stringify(
      {
        ...config,
        accounts: folderToValAccounts(folder),
      },
      null,
      2
    ) + "\n"
  );
}

main(async () => {
  const index = FIXTURE_CONFIG.map(getContent)
    .map(writeContent)
    .reduce(collateIndex, {});

  fs.writeFileSync(
    `../modules/tests/protocol/fixtures/index.json`,
    JSON.stringify(index, null, 2)
  );

  // update val to automatically include all fixtures

  updateValConfig("val.json", "modules/tests/protocol/fixtures");
});
