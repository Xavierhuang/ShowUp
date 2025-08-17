'use client';

import React from 'react';
import { ThemeProvider } from "@/components/theme-provider";
import { DynamicContextProvider } from "@/lib/dynamic";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { FlowWalletConnectors } from "@dynamic-labs/flow";
// Note: Flare uses EthereumWalletConnectors (EVM compatible)

// Simple React Error Boundary to catch Dynamic SDK errors
class DynamicErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): { hasError: boolean } {
    // Log non-critical Dynamic errors but don't crash the app
    if (error.message.includes('pub is no longer') || 
        error.message.includes('WalletConnector') ||
        error.message.includes('Dynamic')) {
      console.warn('Dynamic SDK Error (suppressed):', error.message);
      return { hasError: false }; // Don't trigger error UI for Dynamic issues
    }
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Only log genuine application errors
    if (!error.message.includes('Dynamic') && !error.message.includes('pub is no longer')) {
      console.error('Application Error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong with the application.</div>;
    }
    return this.props.children;
  }
}


export default function Providers({ children }: { children: React.ReactNode }) {
  

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >   
        <DynamicContextProvider
            theme="light"
            settings={{
              environmentId:
                // replace with your own environment ID
                process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID ||
                "2762a57b-faa4-41ce-9f16-abff9300e2c9",
              walletConnectors: [EthereumWalletConnectors, FlowWalletConnectors],
              // Custom EVM networks including Flare mainnet
              overrides: {
                evmNetworks: [
                  {
                    blockExplorerUrls: ['https://flare-explorer.flare.network/'],
                    chainId: 14,
                    chainName: 'Flare Mainnet',
                    iconUrls: ['https://portal.flare.network/images/flare-logo.svg'],
                    name: 'Flare',
                    nativeCurrency: {
                      decimals: 18,
                      name: 'Flare',
                      symbol: 'FLR',
                      iconUrl: 'https://portal.flare.network/images/flare-logo.svg',
                    },
                    networkId: 14,
                    rpcUrls: ['https://flare-api.flare.network/ext/bc/C/rpc'],
                    vanityName: 'Flare Mainnet',
                  },
                  // Keep Ethereum networks for multi-chain support
                  {
                    blockExplorerUrls: ['https://etherscan.io/'],
                    chainId: 1,
                    chainName: 'Ethereum Mainnet',
                    iconUrls: ['https://app.dynamic.xyz/assets/networks/eth.svg'],
                    name: 'Ethereum',
                    nativeCurrency: {
                      decimals: 18,
                      name: 'Ether',
                      symbol: 'ETH',
                      iconUrl: 'https://app.dynamic.xyz/assets/networks/eth.svg',
                    },
                    networkId: 1,
                    rpcUrls: ['https://mainnet.infura.io/v3/'],
                    vanityName: 'ETH Mainnet',
                  }
                ]
              },
              // Disable features that require API calls to prevent network errors
              enableFiatOnramps: false,
              enableNftView: false,
              enableTokenView: false,
              // Disable ALL automatic Flow interactions to prevent Cadence conflicts
              enableWalletBalances: false,
              enableAccountInfo: false,
              enableNetworkSwitching: true, // Enable for multi-chain
              // Only enable what we need for wallet connection
              appName: "ShowUp",
              appLogoUrl: undefined,
            }}
          >
          {children}
        </DynamicContextProvider>
    </ThemeProvider>
  );
}