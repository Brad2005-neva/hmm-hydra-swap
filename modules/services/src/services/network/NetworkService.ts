import { getNetworkMeta, Network } from "@hydraprotocol/sdk";
import { CookieService, ICookieService } from "../cookies";
import { ILocationService, LocationService } from "../location";

// Change before launching mainnet
const MAINNET_NETWORK = Network.MAINNET_BETA;

function ensureAllowedNetwork(network?: string) {
  if (!Object.values(Network).includes(network as Network)) {
    throw new Error(`Network ${network} not supported`);
  }
  return network as Network;
}

export class NetworkService {
  constructor(
    private locationService: ILocationService = LocationService.instance(),
    private cookieService: ICookieService = CookieService.instance()
  ) {}

  resetIfQueryParam() {
    const fromQuery = this.locationService.getMainnetQueryParam();
    if (fromQuery && this.cookieService.getMainnetMode() !== fromQuery) {
      this.cookieService.setMainnetMode(fromQuery);
      if (Number(fromQuery) > 0) this.cookieService.setNetwork(MAINNET_NETWORK);
      this.locationService.reloadAndRemoveQueryString();
    }
  }

  isMainnetMode() {
    const showMainnet = Number(this.cookieService.getMainnetMode());
    if (this.locationService.isMainnet() && showMainnet !== 0) return true;
    return showMainnet > 0;
  }

  private getAllowedNetworks() {
    const allowedNetworks: Network[] = [
      Network.LOCALNET,
      Network.DEVNET,
      this.isMainnetMode() && MAINNET_NETWORK,
    ].filter(Boolean) as Network[];
    return allowedNetworks;
  }

  private getDefaultNetwork() {
    if (this.locationService.isServer()) return Network.LOCALNET;
    if (this.locationService.isMainnet()) return Network.MAINNET_BETA;

    const cookieNetwork = this.cookieService.getNetwork();

    if (cookieNetwork) return cookieNetwork;

    const [localnet, devnet, mainnet] = this.getAllowedNetworks();

    if (this.isMainnetMode()) return mainnet;

    if (this.locationService.isLocalnet()) return localnet;

    return devnet;
  }

  getNetwork() {
    return ensureAllowedNetwork(this.getDefaultNetwork());
  }

  setNetwork(network: Network) {
    this.cookieService.setNetwork(network);
    this.locationService.reload();
  }

  getNetworks() {
    return this.getAllowedNetworks().map(getNetworkMeta);
  }

  static instance() {
    return new NetworkService();
  }
}
