# Development Environment Container

This conatiner can be used as a development environment for vscode when a local environment is not available. It is rough. It may or may not serve our needs going forward.

## Usage

To use this container in vscode on linux (macos instructions welcome):

1. Install the `ms-vscode-remote` extension in vscode
2. Create a `.devcontainer` folder
3. Create a `.devcontainer/devcontainer.json` file with the following config:

   ```json
   {
     "name": "Hydraswap Devcontainer",
     "image": "ghcr.io/hydraswap-io/hydraswap-dev:0.0.32",
     "runArgs": ["--net", "host", "-e", "DISPLAY=${env:DISPLAY}"],
     "remoteUser": "vscode",
     "mounts": [
       "type=bind,source=${localEnv:HOME}/.ssh,target=/home/vscode/.ssh",
       "type=bind,source=${localEnv:HOME}/.config/git/config,target=/home/vscode/.config/git/config",
       "type=bind,source=/tmp/.X11-unix,target=/tmp/.X11-unix"
     ]
   }
   ```

4. Set your xhost to connect to local X11 unix socket
   ```
   xhost +local:
   ```
5. Click the button on the bottom left of vscode and select "Reopen in container"

   ![image](https://user-images.githubusercontent.com/93621943/177934969-56246b90-3199-4c8b-a92f-2fc7044bbb71.png)

[more information](https://code.visualstudio.com/docs/remote/containers) and [a helpful github issue](https://github.com/microsoft/vscode-remote-release/issues/550)

#### Known issues:

- Docker in docker works via socket sharing - but you likely need to setup your workspace under `/workspaces/monorepo` or setup a symlink eg. `/workspaces/monorepo -> /home/me/hydraswap/monorepo`
