import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  HydraClientProvider,
  HydraNetworkProvider,
  HydraWalletProvider,
  PricesProvider,
  QueryProvider,
} from "@hydraprotocol/services";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  LedgerWalletAdapter,
  // SolongWalletAdapter,
  // BloctoWalletAdapter,
  // BitKeepWalletAdapter,
  // BitpieWalletAdapter,
  // CloverWalletAdapter,
  // Coin98WalletAdapter,
  // CoinhubWalletAdapter,
  // MathWalletAdapter,
  // GlowWalletAdapter,
  // SafePalWalletAdapter,
  // SlopeWalletAdapter,
  // TokenPocketWalletAdapter,
  // TorusWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { ReactNode } from "react";
import { StyledEngineProvider } from "@mui/material";
import { FlowProvider } from "./components/flows";
import { NetworkSwitcherProvider } from "@components/networkSwitcher";

const getWallets = (network?: WalletAdapterNetwork) => [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter({ network }),
  new SolletExtensionWalletAdapter({ network }),
  new SolletWalletAdapter({ network }),
  new LedgerWalletAdapter(),
  // new SolongWalletAdapter(),
  // new BloctoWalletAdapter({ network }),
  // new BitKeepWalletAdapter(),
  // new BitpieWalletAdapter(),
  // new CloverWalletAdapter(),
  // new Coin98WalletAdapter(),
  // new CoinhubWalletAdapter(),
  // new MathWalletAdapter(),
  // new GlowWalletAdapter(),
  // new SafePalWalletAdapter(),
  // new SlopeWalletAdapter(),
  // new TokenPocketWalletAdapter(),
  // new TorusWalletAdapter(),
];

export function Providers({ children }: { children: ReactNode }) {
  return (
    <StyledEngineProvider injectFirst>
      <QueryProvider>
        <HydraNetworkProvider>
          <HydraWalletProvider wallets={getWallets}>
            <HydraClientProvider>
              <FlowProvider>
                <NetworkSwitcherProvider>
                  <PricesProvider>{children}</PricesProvider>
                </NetworkSwitcherProvider>
              </FlowProvider>
            </HydraClientProvider>
          </HydraWalletProvider>
        </HydraNetworkProvider>
      </QueryProvider>
    </StyledEngineProvider>
  );
}
