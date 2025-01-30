import { createFakeCookieService, CookieConfig } from "../cookies";
import { createFakeLocationService, LocationConfig } from "../location";
import { NetworkService } from "./NetworkService";

const defaultLocation: LocationConfig = {
  getMainnetQueryParam: "",
  isLocalnet: false,
  isServer: false,
  isMainnet: false,
};
const defaultCookies: CookieConfig = {
  mainnetMode: undefined,
  network: undefined,
};

function buildNetworkService(
  location: LocationConfig = defaultLocation,
  cookies: CookieConfig = defaultCookies
) {
  const lService = createFakeLocationService(location);
  const cService = createFakeCookieService(cookies);
  return new NetworkService(lService, cService);
}

test("When localnet it should select localnet", () => {
  const networkService = buildNetworkService(
    {
      getMainnetQueryParam: "",
      isLocalnet: true,
      isMainnet: false,
      isServer: false,
    },
    {
      mainnetMode: undefined,
      network: undefined,
    }
  );
  expect(networkService.isMainnetMode()).toBe(false);
  expect(networkService.getNetworks().map((n) => n.network)).toEqual([
    "localnet",
    "devnet",
  ]);
  expect(networkService.getNetwork()).toEqual("localnet");
});

test("When not localnet it should default to devnet", () => {
  const networkService = buildNetworkService(
    {
      getMainnetQueryParam: "",
      isLocalnet: false,
      isMainnet: false,
      isServer: false,
    },
    {
      mainnetMode: undefined,
      network: undefined,
    }
  );
  expect(networkService.isMainnetMode()).toBe(false);
  expect(networkService.getNetwork()).toEqual("devnet");
});

test("When location is mainnet it should default to mainnet", () => {
  const networkService = buildNetworkService(
    {
      getMainnetQueryParam: "",
      isLocalnet: false,
      isMainnet: true,
      isServer: false,
    },
    {
      mainnetMode: undefined,
      network: undefined,
    }
  );
  expect(networkService.isMainnetMode()).toBe(true);
  expect(networkService.getNetwork()).toEqual("mainnet-beta");
});

test("When location is mainnet and mainnet mode cookie is false it should not be in mainnet mode", () => {
  const networkService = buildNetworkService(
    {
      getMainnetQueryParam: "",
      isLocalnet: false,
      isMainnet: true,
      isServer: false,
    },
    {
      mainnetMode: "0",
      network: undefined,
    }
  );
  expect(networkService.isMainnetMode()).toBe(false);
  expect(networkService.getNetwork()).toEqual("mainnet-beta");
});

test("When mainnet cookie it should default to mainnet", () => {
  const networkService = buildNetworkService(
    {
      getMainnetQueryParam: "",
      isLocalnet: false,
      isServer: false,
      isMainnet: false,
    },
    {
      mainnetMode: "1",
      network: undefined,
    }
  );
  expect(networkService.isMainnetMode()).toBe(true);
  expect(networkService.getNetwork()).toEqual("mainnet-beta");
});
