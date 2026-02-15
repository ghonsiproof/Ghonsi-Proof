/**
 * Solana Wallet Connection Utilities
 * Supports desktop extensions and mobile deep links with return flow
 */

// Detect if user is on mobile
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

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

// Generate mobile deep link with return URL
const getMobileDeepLink = (walletName) => {
  const currentUrl = window.location.href;
  const cluster = 'mainnet-beta'; // or 'devnet'

  switch (walletName.toLowerCase()) {
    case 'phantom':
      return `https://phantom.app/ul/v1/connect?app_url=${encodeURIComponent(currentUrl)}&cluster=${cluster}`;
    case 'solflare':
      return `https://solflare.com/ul/v1/connect?app_url=${encodeURIComponent(currentUrl)}`;
    default:
      return null;
  }
};

export const isWalletInstalled = (walletName) => {
  const provider = getWalletProvider(walletName);
  return !!provider;
};

export const connectWallet = async (walletName) => {
  const provider = getWalletProvider(walletName);

  // Mobile handling: Open wallet app with deep link
  if (isMobile() && !provider) {
    const deepLink = getMobileDeepLink(walletName);

    if (!deepLink) {
      throw new Error(`${walletName} mobile wallet not supported yet. Try Phantom or Solflare.`);
    }

    // Store connection attempt
    localStorage.setItem('pending_wallet_connection', walletName);
    localStorage.setItem('connection_timestamp', Date.now().toString());

    // Open wallet app
    window.location.href = deepLink;

    // This will redirect, so throw to stop execution
    throw new Error('REDIRECTING_TO_WALLET');
  }

  // Desktop or in-app browser handling
  if (!provider) {
    throw new Error(`${walletName} wallet not installed. Please install the browser extension.`);
  }

  try {
    // Try eager connect for Phantom if already trusted
    if (walletName.toLowerCase() === 'phantom') {
      try {
        const eagerResponse = await provider.connect({ onlyIfTrusted: true });
        if (eagerResponse?.publicKey) {
          const walletAddress = eagerResponse.publicKey.toString();
          localStorage.setItem('wallet_address', walletAddress);
          localStorage.setItem('connected_wallet', walletName);
          return walletAddress;
        }
      } catch (e) {
        // Expected if not trusted, continue to normal connect
      }
    }

    // Disconnect if already connected to force fresh popup
    if (provider.isConnected) {
      await provider.disconnect();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Connect and show popup
    const response = await provider.connect();

    // Get public key from response or provider
    const publicKey = response?.publicKey || provider.publicKey;

    if (!publicKey) {
      throw new Error(`Could not get public key from ${walletName} wallet`);
    }

    // Convert to string
    const walletAddress = typeof publicKey === 'string'
      ? publicKey
      : (publicKey.toString?.() || publicKey.toBase58?.());

    if (!walletAddress || walletAddress.length < 32) {
      throw new Error('Invalid wallet address received');
    }

    localStorage.setItem('wallet_address', walletAddress);
    localStorage.setItem('connected_wallet', walletName);
    localStorage.removeItem('pending_wallet_connection');
    localStorage.removeItem('connection_timestamp');

    return walletAddress;
  } catch (error) {
    console.error(`${walletName} connection error:`, error);

    if (error.code === 4001) {
      throw new Error('Connection request rejected by user');
    }

    if (walletName.toLowerCase() === 'phantom' && error.message?.includes('Unexpected error')) {
      throw new Error('Phantom connection failed. Please make sure your Phantom wallet is unlocked and try again.');
    }

    throw new Error(`${walletName} connection failed: ${error.message}`);
  }
};

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
  localStorage.removeItem('pending_wallet_connection');
  localStorage.removeItem('connection_timestamp');
};

export const getConnectedWalletAddress = () => {
  return localStorage.getItem('wallet_address');
};

export const getConnectedWalletName = () => {
  return localStorage.getItem('connected_wallet');
};

export const isWalletConnected = () => {
  return !!getConnectedWalletAddress();
};

// Check if returning from mobile wallet
export const checkPendingConnection = () => {
  const pending = localStorage.getItem('pending_wallet_connection');
  const timestamp = localStorage.getItem('connection_timestamp');

  // Clear if older than 5 minutes
  if (pending && timestamp) {
    const age = Date.now() - parseInt(timestamp);
    if (age > 5 * 60 * 1000) {
      localStorage.removeItem('pending_wallet_connection');
      localStorage.removeItem('connection_timestamp');
      return null;
    }
  }

  return pending;
};

// Helper to check if on mobile
export const checkIfMobile = () => {
  return isMobile();
};