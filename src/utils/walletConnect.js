export const connectWallet = async (walletName) => {
  const provider = getWalletProvider(walletName);
  
  if (!provider) {
    throw new Error(`${walletName} wallet not installed. Please install it from the browser extension store.`);
  }

  try {
    const response = await provider.connect();
    return response.publicKey.toString();
  } catch (error) {
    if (error.code === 4001) {
      throw new Error('Connection request rejected');
    }
    throw error;
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
  return !!getWalletProvider(walletName);
};
