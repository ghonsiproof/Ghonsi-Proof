/**
 * Solana Wallet Connection - Mobile & Desktop
 * Mobile: Instructs users to use wallet's dApp browser
 * Desktop: Direct provider connection
 */

// Detect mobile - more accurate detection
const isMobile = () => {
  // Check for touch support AND small screen
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const smallScreen = window.innerWidth <= 768;
  const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Must have mobile UA AND (touch or small screen)
  return mobileUA && (hasTouch || smallScreen);
};

// Check if in wallet's dApp browser
const isInWalletBrowser = () => {
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('phantom') || ua.includes('solflare') || ua.includes('backpack') || ua.includes('glow');
};

// Get wallet provider
const getWalletProvider = (walletName) => {
  const name = walletName.toLowerCase();
  switch (name) {
    case 'phantom': return window.phantom?.solana || window.solana;
    case 'solflare': return window.solflare;
    case 'backpack': return window.backpack;
    case 'glow': return window.glow;
    default: return null;
  }
};

// Desktop wallet connection
const connectDesktop = async (walletName) => {
  const provider = getWalletProvider(walletName);

  if (!provider) {
    throw new Error(`${walletName} wallet not installed. Please install the browser extension.`);
  }

  try {
    // Try eager connect first (if already trusted)
    if (walletName.toLowerCase() === 'phantom' && provider.connect) {
      try {
        const resp = await provider.connect({ onlyIfTrusted: true });
        if (resp?.publicKey) {
          const address = resp.publicKey.toString();
          saveWalletConnection(walletName, address);
          return address;
        }
      } catch (e) {
        // Not trusted yet, continue to regular connect
      }
    }

    // Regular connect
    if (provider.isConnected) {
      await provider.disconnect();
      await new Promise(r => setTimeout(r, 100));
    }

    const response = await provider.connect();
    const publicKey = response?.publicKey || provider.publicKey;

    if (!publicKey) throw new Error('No public key returned');

    const address = publicKey.toString?.() || publicKey.toBase58?.();
    if (!address || address.length < 32) throw new Error('Invalid wallet address');

    saveWalletConnection(walletName, address);
    return address;

  } catch (error) {
    if (error.code === 4001) throw new Error('Connection rejected by user');
    throw error;
  }
};

// Mobile wallet connection (in dApp browser)
const connectMobile = async (walletName) => {
  // If in wallet's dApp browser, connect normally
  if (isInWalletBrowser()) {
    return await connectDesktop(walletName);
  }

  // Not in dApp browser - throw error with instructions
  throw new Error(`MOBILE_INSTRUCTION:${walletName}`);
};

// Save wallet connection
const saveWalletConnection = (walletName, address) => {
  localStorage.setItem('wallet_address', address);
  localStorage.setItem('connected_wallet', walletName);
};

// Main connect function
export const connectWallet = async (walletName) => {
  try {
    if (isMobile()) {
      return await connectMobile(walletName);
    } else {
      return await connectDesktop(walletName);
    }
  } catch (error) {
    console.error('Wallet connection error:', error);
    throw error;
  }
};

// Disconnect
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

// Check for pending connection on page load
export const checkPendingConnection = async () => {
  // Check if we're in a wallet browser that just loaded the page
  if (isMobile() && isInWalletBrowser()) {
    // Try to auto-connect if in wallet browser
    const wallets = ['Phantom', 'Solflare', 'Backpack', 'Glow'];

    for (const wallet of wallets) {
      const provider = getWalletProvider(wallet);
      if (provider?.publicKey) {
        const address = provider.publicKey.toString();
        saveWalletConnection(wallet, address);
        return { success: true, wallet, address };
      }
    }
  }

  return { success: false };
};

// Getters
export const getConnectedWalletAddress = () => localStorage.getItem('wallet_address');
export const getConnectedWalletName = () => localStorage.getItem('connected_wallet');
export const isWalletConnected = () => !!getConnectedWalletAddress();
export const isWalletInstalled = (walletName) => !!getWalletProvider(walletName);
export const checkIfMobile = () => isMobile();
export const checkIfInWalletBrowser = () => isInWalletBrowser();