/**
 * Solana Wallet Connection Utilities
 * Direct wallet provider API integration
 */

// Detect if user is on mobile
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Mobile wallet deep links
const getMobileWalletURL = (walletName, dappUrl) => {
  const encodedUrl = encodeURIComponent(dappUrl);

  switch (walletName.toLowerCase()) {
    case 'phantom':
      return `https://phantom.app/ul/browse/${encodedUrl}?ref=${encodedUrl}`;
    case 'solflare':
      return `https://solflare.com/ul/v1/browse/${encodedUrl}`;
    case 'backpack':
      return `https://backpack.app/ul/browse/${encodedUrl}`;
    case 'glow':
      return `https://glow.app/ul/browse/${encodedUrl}`;
    default:
      return null;
  }
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

export const isWalletInstalled = (walletName) => {
  // On mobile, wallets are always "available" via deep links
  if (isMobile()) {
    return true;
  }

  const provider = getWalletProvider(walletName);
  return !!provider;
};

export const connectWallet = async (walletName) => {
  // Mobile wallet handling
  if (isMobile()) {
    const currentUrl = window.location.origin;
    const walletUrl = getMobileWalletURL(walletName, currentUrl);

    if (walletUrl) {
      // Store pending connection state
      localStorage.setItem('pending_wallet_connection', walletName);

      // Redirect to mobile wallet app
      window.location.href = walletUrl;

      // Throw to prevent further execution
      throw new Error('Redirecting to mobile wallet...');
    } else {
      throw new Error(`Mobile wallet not supported: ${walletName}`);
    }
  }

  // Desktop wallet handling
  const provider = getWalletProvider(walletName);

  if (!provider) {
    throw new Error(`${walletName} wallet not installed. Please install it from the browser extension store.`);
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
  return localStorage.getItem('pending_wallet_connection');
};