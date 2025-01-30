# Service Layer

Our service layer future proofs our app by enabling clients to be bult off our streaming state data layer.

Each service exports an `instance:Service` created during module time for live service interactions. This instance is used by the app and should be injected to components.

Services should be classes with readonly constructor properties.

```ts
import { ClientService, AssetsService, PoolService } from "./services";

// Here is an example of how to test the services
const clientService = ClientService.new();
const assetsService = AssetsService.new(tokens.localnet, clientService);
const poolService = PoolService.new(assetsService, clientService);

// Then do something
clientService.setClient(client);
```

You can then pass services as props for components and hooks you want to substitute services within tests.

```ts
import { PoolService } from "../services";
import { useObservable } from "./useObservable";

export function useMyPools(
  poolService = PoolService.instance() /* inject poolservice here uses singletons by default */
) {
  const [keys, error] = useObservable(poolService.myPoolsList, []);
  error && console.error(error);
  return keys;
}
```
