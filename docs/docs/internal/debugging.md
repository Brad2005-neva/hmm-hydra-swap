[← 🏠](./CONTRIBUTING.md)

# Debuggng e2e tests

### Debug in HEADED mode with playwright console enabled

Generally e2e tests are best debgged in headful mode. When running e2e tests we check for the installation of `xvfb` and if it is installed we will run in healess mode unless the user passes in a truthy `HEADED` var

```sh
# If you have xvfb
PWDEBUG=console HEADED=1 yarn e2e

# if you dont have xvfb
PWDEBUG=console yarn e2e
```

### Single out the test

E2e tests take time to run so you will be best off singling out the test you are interested in.

```ts
test.only("Do stuff", async ({ context, page }) => {
  const app = new LiquidityPoolsTest(context, "Do stuff");
  await app.doThings();
});
```

### Add an `await page.pause()` and root around.

Insert an `await page.pause()` in an opportune spot to inspect the failure

Root around using the playwright object on window see https://playwright.dev/docs/debug#selectors-in-developer-tools-console

Alternatively just use the inbuilt browser selectors:

```js
$(`[arial=label="Some Line"]`).textContent;
```

### Use DEBUG=1

With the frontend you can now set a flag to enable method debugging:

In a running instance of the app within your console type the following:

```ts
window.DEBUG = true; // or 1 or something truthy
```

You should now find all SDK calls are logged to the console.

The equivalent for node processes (eg. running a migration) is to set the `DEBUG` env var.

```sh
DEBUG=1 yarn save-snapshot-e2e
```

To get a snapshot of the pool state, run the following in the console.

```
hdump(poolID)
```

# VSCode dev environment

You can develop on whatever system you like but it can be difficult in certain situations to ensure that playwright works correctly in various setups. We have put together a docker container for developing within vscode on linux here to help: https://github.com/hydraswap-io/devcontainer

If you are having trouble with playwright and e2e tests a last resport could be to setup a vanilla ubuntu VM in virt manager or virtual box and install the following:

1. [VSCode](https://code.visualstudio.com/docs/setup/linux)
1. [Docker](https://docs.docker.com/desktop/linux/install)
1. Install the `ms-vscode-remote` extension in vscode
1. Set your xhost to connect to local X11 unix socket
   ```
   xhost +local:
   ```
1. Click the button on the bottom left of vscode and select "Reopen in container"

   ![image](https://user-images.githubusercontent.com/93621943/177934969-56246b90-3199-4c8b-a92f-2fc7044bbb71.png)
