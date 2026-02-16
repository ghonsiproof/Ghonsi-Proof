/**
 * Solana Wallet Connection Utilities
 * Desktop: Direct wallet provider API integration
 * Mobile: Deep linking to wallet apps
 */

// Detect if user is on mobile
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Generate a unique session ID for mobile connections
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Deep link URLs for different wallets
const getWalletDeepLink = (walletName, action = 'connect') => {
  const currentUrl = encodeURIComponent(window.location.href);
  const appName = encodeURIComponent('Ghonsi Proof');

  const deepLinks = {
    phantom: {
      connect: `https://phantom.app/ul/browse/${currentUrl}?ref=${appName}`,
      // Alternative: phantom://browse/${currentUrl}
    },
    solflare: {
      connect: `https://solflare.com/ul/v1/browse/${currentUrl}?ref=${appName}`,
    },
    backpack: {
      connect: `https://backpack.app/browse/${currentUrl}?ref=${appName}`,
    },
    glow: {
      connect: `https://glow.app/browse/${currentUrl}?ref=${appName}`,
    }
  };

  return deepLinks[walletName.toLowerCase()]?.[action];
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
  const provider = getWalletProvider(walletName);
  return !!provider;
};

// Mobile wallet connection via deep linking
const connectMobileWallet = async (walletName) => {
  return new Promise((resolve, reject) => {
    const sessionId = generateSessionId();
    const deepLink = getWalletDeepLink(walletName);

    if (!deepLink) {
      reject(new Error(`${walletName} mobile deep link not available`));
      return;
    }

    // Store pending connection state
    sessionStorage.setItem('pending_wallet_connection', JSON.stringify({
      wallet: walletName,
      sessionId,
      timestamp: Date.now()
    }));

    // Set up listener for when user returns from wallet app
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        // User returned to browser
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for provider to initialize

        const provider = getWalletProvider(walletName);

        if (provider?.publicKey) {
          // Connection successful
          const walletAddress = provider.publicKey.toString();

          localStorage.setItem('wallet_address', walletAddress);
          localStorage.setItem('connected_wallet', walletName);
          sessionStorage.removeItem('pending_wallet_connection');

          document.removeEventListener('visibilitychange', handleVisibilityChange);
          resolve(walletAddress);
        } else {
          // Check if enough time has passed (user might have rejected)
          const pending = JSON.parse(sessionStorage.getItem('pending_wallet_connection') || '{}');
          const elapsed = Date.now() - (pending.timestamp || 0);

          if (elapsed > 3000) { // 3 seconds
            sessionStorage.removeItem('pending_wallet_connection');
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            reject(new Error('Wallet connection failed or was cancelled'));
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Timeout after 2 minutes
    setTimeout(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      sessionStorage.removeItem('pending_wallet_connection');
      reject(new Error('Wallet connection timeout'));
    }, 120000);

    // Open wallet app via deep link
    window.location.href = deepLink;
  });
};

// Desktop wallet connection
const connectDesktopWallet = async (walletName) => {
  const provider = getWalletProvider(walletName);

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

// Main connect function - routes to mobile or desktop
export const connectWallet = async (walletName) => {
  try {
    if (isMobile()) {
      // On mobile, always use deep linking
      return await connectMobileWallet(walletName);
    } else {
      // On desktop, use provider API
      return await connectDesktopWallet(walletName);
    }
  } catch (error) {
    console.error('Wallet connection error:', error);
    throw error;
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
  sessionStorage.removeItem('pending_wallet_connection');
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

// Helper to check if on mobile
export const checkIfMobile = () => {
  return isMobile();
};

// Check for pending connection on page load (when user returns from wallet app)
export const checkPendingConnection = async () => {
  const pending = sessionStorage.getItem('pending_wallet_connection');

  if (pending) {
    try {
      const { wallet, timestamp } = JSON.parse(pending);
      const elapsed = Date.now() - timestamp;

      // If less than 2 minutes old, try to complete connection
      if (elapsed < 120000) {
        const provider = getWalletProvider(wallet);

        if (provider?.publicKey) {
          const walletAddress = provider.publicKey.toString();
          localStorage.setItem('wallet_address', walletAddress);
          localStorage.setItem('connected_wallet', wallet);
          sessionStorage.removeItem('pending_wallet_connection');
          return { success: true, wallet, address: walletAddress };
        }
      } else {
        // Expired, clean up
        sessionStorage.removeItem('pending_wallet_connection');
      }
    } catch (e) {
      console.error('Error checking pending connection:', e);
      sessionStorage.removeItem('pending_wallet_connection');
    }
  }

  return { success: false };
};