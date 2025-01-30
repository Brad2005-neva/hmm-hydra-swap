#!/usr/bin/env node

const main = require("./dist/cli").default;

main()
  .then(() => {
    process.exit();
  })
  .catch((err) => {
    console.log("\n\nLooks like something has gone wrong\n\n");
    console.log(err);
    console.log("\n\n");
    process.exit(1);
  });
