import { Network } from "@hydraprotocol/sdk";
import Cookies from "js-cookie";
const COOKIE_IS_MAINNET_MODE = "_hyd_show_mainnet";
const COOKIE_CURRENT_NETWORK = "_hyd_network";

export interface ICookieService {
  getNetwork(): string | undefined;

  setNetwork(network: Network): void;

  getMainnetMode(): string | undefined;

  setMainnetMode(index: string): void;
}

export class CookieService implements ICookieService {
  constructor(private cookies = Cookies) {}
  getNetwork() {
    return this.cookies.get(COOKIE_CURRENT_NETWORK);
  }

  setNetwork(network: Network) {
    this.cookies.set(COOKIE_CURRENT_NETWORK, network);
  }

  getMainnetMode() {
    return this.cookies.get(COOKIE_IS_MAINNET_MODE);
  }

  setMainnetMode(index: string) {
    this.cookies.set(COOKIE_IS_MAINNET_MODE, index);
  }

  static instance() {
    return new CookieService();
  }
}

export type CookieConfig = {
  network: string | undefined;
  mainnetMode: string | undefined;
};
export function createFakeCookieService(config: CookieConfig): ICookieService {
  return {
    getNetwork() {
      return config.network;
    },
    setNetwork(_: Network) {},

    getMainnetMode() {
      return config.mainnetMode;
    },

    setMainnetMode(_: string) {},
  };
}
