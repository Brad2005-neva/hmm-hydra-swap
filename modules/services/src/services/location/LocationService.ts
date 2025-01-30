export interface ILocationService {
  isServer(): boolean;
  isLocalnet(): boolean;
  isMainnet(): boolean;
  getMainnetQueryParam(): string | null;
  reloadAndRemoveQueryString(): void;
  reload(): void;
}

export class LocationService implements ILocationService {
  constructor(
    private location = globalThis.location,
    private history = globalThis.history,
    private document = globalThis.document
  ) {}
  isServer() {
    return typeof this.location === "undefined";
  }

  isLocalnet() {
    return !this.isServer() && this.location.hostname === "localhost";
  }

  isMainnet() {
    return !this.isServer() && this.location.hostname === "app.hydraswap.io";
  }

  getMainnetQueryParam() {
    const matches = this.location.search.match(/\?mainnet=(\d+)/);
    const index = matches && matches[1];
    return index;
  }

  reloadAndRemoveQueryString() {
    const uri = this.location.toString();
    this.history.replaceState(
      {},
      this.document.title,
      uri.substring(0, uri.indexOf("?"))
    );
  }

  reload() {
    this.location.reload();
  }

  static instance() {
    return new LocationService();
  }
}

export type LocationConfig = {
  isServer: boolean;
  isLocalnet: boolean;
  isMainnet: boolean;
  getMainnetQueryParam: string | null;
};
export function createFakeLocationService(
  config: LocationConfig
): ILocationService {
  return {
    isServer() {
      return config.isServer;
    },
    isLocalnet() {
      return config.isLocalnet;
    },
    isMainnet() {
      return config.isMainnet;
    },
    getMainnetQueryParam() {
      return config.getMainnetQueryParam;
    },
    reloadAndRemoveQueryString() {},
    reload() {},
  };
}
