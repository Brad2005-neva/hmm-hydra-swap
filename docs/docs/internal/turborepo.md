[← 🏠](./CONTRIBUTING.md)

# Turborepo

We use Turborepo for managing our monorepo tasks. This enables us to ensure long tasks can be aggressively cached.

To configure turborepo you can use the [`turbo.json`](../../../turbo.json) file. This file can be confusing if you have not worked with turborepo before. It looks like the following:

```jsonc
{
  "$schema": "https://turborepo.org/schema.json",
  "baseBranch": "origin/devnet",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"]
    },
    "@hydraprotocol/services#build": {
      "dependsOn": ["^build"],
      "inputs": [],
      "outputs": ["dist/**"]
    }
    // ...
  }
}
```

We have also written a turborepo script [`./turbo.sh`](../../../turbo.sh) for managing the execution of these tasks.

Basically a task that has a `dependsOn` array with `"^build"` will ensure that before this task is run every package within that package's `package.json` `"dependencies"` or `"devDependencies"` that has a `build` script will be executed.

Without a caret in the `dependsOn` tag you are referring to a task in the `pipeline` which you should be able to see in the `turbo.json` file.
