# Hydraswap CI environment

To access this you will need to connect with ghcr. See https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry

1. Create a new personal access token (PAT)
2. Save your PAT. We recommend saving your PAT as an environment variable.
   ```
   $ export CR_PAT=YOUR_TOKEN
   ```
3. Login with the docker binary:
   ```
   $ echo $CR_PAT | docker login ghcr.io -u USERNAME --password-stdin
   ```
