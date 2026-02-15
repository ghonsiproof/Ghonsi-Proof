/**
 * Solana Wallet Connection Utilities
 * Simple direct wallet provider API - no bullshit
 */

/**
 * Get direct wallet provider
 */
const getWalletProvider = (walletName) => {
  const name = walletName.toLowerCase();

  switch (name) {
    case 'phantom':
      return window.phantom?.solana;
    case 'solflare':
      return window.solflare;
    case 'backpack':
      return window.backpack;
    case 'glow':
      return window.glow;
    default:
      return null;
  }
};

/**
 * Check if wallet is installed
 */
export const isWalletInstalled = (walletName) => {
  const provider = getWalletProvider(walletName);
  return !!provider;
};

/**
 * Connect to a Solana wallet
 */
export const connectWallet = async (walletName) => {
  console.log(`[walletAdapter] connectWallet called for: ${walletName}`);

  const provider = getWalletProvider(walletName);
  console.log(`[walletAdapter] Provider found:`, !!provider);

  if (!provider) {
    throw new Error(`${walletName} wallet not installed. Please install it from the browser extension store.`);
  }

  try {
    console.log(`[walletAdapter] Provider.isConnected:`, provider.isConnected);

    // Special handling for Phantom - try connect with onlyIfTrusted first
    if (walletName.toLowerCase() === 'phantom') {
      console.log(`[walletAdapter] Phantom detected, trying eager connect first...`);
      try {
        // Try eager connect (won't show popup if already trusted)
        const eagerResponse = await provider.connect({ onlyIfTrusted: true });
        if (eagerResponse && eagerResponse.publicKey) {
          console.log(`[walletAdapter] Eager connect succeeded`);
          const walletAddress = eagerResponse.publicKey.toString();
          localStorage.setItem('wallet_address', walletAddress);
          localStorage.setItem('connected_wallet', walletName);
          console.log(`[walletAdapter] Stored in localStorage`);
          return walletAddress;
        }
      } catch (eagerError) {
        console.log(`[walletAdapter] Eager connect failed (expected), will show popup:`, eagerError.message);
      }
    }

    // IMPORTANT: Disconnect first to force a fresh connection prompt
    if (provider.isConnected) {
      console.log(`[walletAdapter] Already connected, disconnecting first...`);
      try {
        await provider.disconnect();
        console.log(`[walletAdapter] Disconnected successfully`);
        // Wait a bit for disconnect to complete
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (disconnectError) {
        console.warn('[walletAdapter] Disconnect failed (continuing anyway):', disconnectError);
        // Continue even if disconnect fails
      }
    }

    console.log(`[walletAdapter] Calling provider.connect()...`);
    // Connect to the wallet - THIS SHOULD SHOW POPUP
    const connectOptions = walletName.toLowerCase() === 'phantom' ? {} : undefined;
    const response = await provider.connect(connectOptions);
    console.log(`[walletAdapter] Connect response received:`, response);

    // Try to get the public key from different possible locations
    let publicKey = null;

    // Some wallets return it in the response
    if (response && response.publicKey) {
      publicKey = response.publicKey;
      console.log(`[walletAdapter] PublicKey from response.publicKey`);
    }
    // Some wallets store it on the provider after connection
    else if (provider.publicKey) {
      publicKey = provider.publicKey;
      console.log(`[walletAdapter] PublicKey from provider.publicKey`);
    }

    console.log(`[walletAdapter] PublicKey object:`, publicKey);

    if (!publicKey) {
      const errorMsg = `Could not get public key from ${walletName} wallet. Response: ${JSON.stringify(response)}`;
      console.error(`[walletAdapter] ${errorMsg}`);
      throw new Error(errorMsg);
    }

    // Convert to string
    let walletAddress;
    if (typeof publicKey === 'string') {
      walletAddress = publicKey;
      console.log(`[walletAdapter] PublicKey was already a string`);
    } else if (publicKey.toString) {
      walletAddress = publicKey.toString();
      console.log(`[walletAdapter] Used publicKey.toString()`);
    } else if (publicKey.toBase58) {
      walletAddress = publicKey.toBase58();
      console.log(`[walletAdapter] Used publicKey.toBase58()`);
    } else {
      const errorMsg = `Unable to convert public key to string. PublicKey type: ${typeof publicKey}, keys: ${Object.keys(publicKey || {})}`;
      console.error(`[walletAdapter] ${errorMsg}`);
      throw new Error(errorMsg);
    }

    console.log(`[walletAdapter] Wallet address:`, walletAddress);

    if (!walletAddress || walletAddress.length < 32) {
      throw new Error(`Invalid wallet address received: ${walletAddress}`);
    }

    // Store it
    localStorage.setItem('wallet_address', walletAddress);
    localStorage.setItem('connected_wallet', walletName);
    console.log(`[walletAdapter] Stored in localStorage`);

    return walletAddress;
  } catch (error) {
    console.error(`[walletAdapter] Error in connectWallet:`, error);
    console.error(`[walletAdapter] Error stack:`, error.stack);

    if (error.code === 4001) {
      throw new Error('Connection request rejected by user');
    }

    // Add helpful message for Phantom users
    if (walletName.toLowerCase() === 'phantom' && error.message?.includes('Unexpected error')) {
      throw new Error('Phantom connection failed. Please make sure your Phantom wallet is unlocked and try again.');
    }

    // Re-throw with more context
    throw new Error(`${walletName} connection failed: ${error.message}`);
  }
};

/**
 * Disconnect wallet
 */
export const disconnectWallet = async () => {
  const walletName = localStorage.getItem('connected_wallet');

  if (walletName) {
    const provider = getWalletProvider(walletName);
    if (provider?.disconnect) {
      try {
        await provider.disconnect();
      } catch (e) {
        console.error('Disconnect error:', e);
      }
    }
  }

  localStorage.removeItem('wallet_address');
  localStorage.removeItem('connected_wallet');
};

/**
 * Get connected wallet address
 */
export const getConnectedWalletAddress = () => {
  return localStorage.getItem('wallet_address');
};

/**
 * Get connected wallet name
 */
export const getConnectedWalletName = () => {
  return localStorage.getItem('connected_wallet');
};

/**
 * Check if wallet is connected
 */
export const isWalletConnected = () => {
  return !!getConnectedWalletAddress();
};
