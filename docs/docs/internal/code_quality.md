[← 🏠](./CONTRIBUTING.md)

# TypeScript Code Quality Tips

Here are some tips on good patterns in TypeScript.

## Injecting Dependencies without DI

Whether working React with hooks, a component or within TypeScript we should be thinking about our interface first as we design our code.

Test Driven Development is not really as useful in finding bugs as it is a design tool. By Following TDD we think about our interface for our component / hook / function or class first. We also work out how to pass in the things collaborators.

An example of what we should avoid would be creating collaboators in the processing body of the component:

```tsx
class AssetService {
  private clientService: ClientService;
  private assetList: Asset[];

  constructor() {
    // ❌❌❌❌❌❌
    // This one defaults to a singleton but what if
    // we want to write several unit tests that use
    // this class to be run in paralell??
    this.clientService = ClientService.instance();
    this.assetList = [];
  }

  // other methods...
}
```

The issue here is that the singleton must be used no matter where the component is tested or used. What if we run 12 unit tests against this component simultaneously and the ClientService had it's state set by this component? Our tests would probably fail!

Most "things" take arguments which can be defaulted and this is usually the best way to pass in fakes or mocks to a thing while making it easy to keep access patterns like singletons handy. Here is an example:

```tsx
class AssetService {
  // ✅✅✅✅✅
  // Here we create these private properties on the class and provide the default values
  constructor(
    private readOnly assetList : Asset[] = [],
    // This one defaults to a singleton but for a test we can pass in a mock.
    private readOnly clientService = ClientService.instance()
  ) {}

  // other methods...
}
```

This makes things easy to test:

```ts
test("AssetService", () => {
  const fakeClientService = jest.spy();

  const assetsService = new AssetService([BTC, ETH], fakeClientService);

  // ... run test
});
```

We can also do exactly the same technique with hooks:

```tsx
function useMyThing(clientService = ClientService.instance()) {
  // ...
}
```

React components:

```tsx
type MyComponentProps = {
  children: React.ReactNode;
  clientService?: ClientService;
};

function MyComponent({
  clientService = ClientService.instance(),
}: MyComponentProps) {
  // render component
}
```

Or plain functions:

```ts
function doSomething(clientService = ClientService.instance()) {
  clientService.setClient(HydraSDK.fromCtx(new Ctx()));
}
```

Often folks resort to DI containers for this but doing this with languages that support optional params with defaulting is much simpler and causes less head scratching
