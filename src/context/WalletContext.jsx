import React, { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter styles — add this to your index.js or App.js instead if preferred
import '@solana/wallet-adapter-react-ui/styles.css';

export function WalletContextProvider({ children }) {
  const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), []);

  // Wallet standard wallets (Phantom, Solflare, Backpack, etc.) are auto-detected.
  // These explicit adapters are fallbacks for older versions.
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}