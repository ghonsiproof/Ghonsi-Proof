import { useContext, useCallback } from 'react';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { WalletContext } from '../context/WalletProvider';

/**
 * Custom hook to manage Solana wallet connection
 * Wraps the Solana Wallet Adapter and provides simplified methods
 */
export const useWallet = () => {
    const solanaWallet = useSolanaWallet();
    const { setVisible: setWalletModalVisible } = useWalletModal();
    const walletContext = useContext(WalletContext);

    const {
        publicKey,
        connected,
        connecting,
        disconnecting,
        connect,
        disconnect,
        wallet,
        signMessage,
    } = solanaWallet;

    // Connect wallet and open modal if needed
    const connectWallet = useCallback(async () => {
        try {
            if (!connected) {
                // Open wallet modal if no wallet is selected
                if (!wallet) {
                    setWalletModalVisible(true);
                } else {
                    // Connect to the selected wallet
                    await connect();
                }
            }
            return true;
        } catch (error) {
            console.error('[v0] Error connecting wallet:', error);
            return false;
        }
    }, [connected, wallet, connect, setWalletModalVisible]);

    // Disconnect wallet
    const disconnectWallet = useCallback(async () => {
        try {
            await disconnect();
            return true;
        } catch (error) {
            console.error('[v0] Error disconnecting wallet:', error);
            return false;
        }
    }, [disconnect]);

    // Get wallet address as string
    const getWalletAddress = useCallback(() => {
        return publicKey ? publicKey.toString() : null;
    }, [publicKey]);

    // Sign a message with the wallet
    const sign = useCallback(
        async (message) => {
            try {
                if (!signMessage) {
                    throw new Error('Wallet does not support message signing');
                }

                const messageBuffer = new TextEncoder().encode(message);
                const signature = await signMessage(messageBuffer);
                return {
                    signature: Buffer.from(signature).toString('base64'),
                    publicKey: publicKey.toString(),
                };
            } catch (error) {
                console.error('[v0] Error signing message:', error);
                return null;
            }
        },
        [signMessage, publicKey]
    );

    return {
        // Connection state
        connected,
        connecting,
        disconnecting,
        publicKey,
        wallet,

        // Methods
        connectWallet,
        disconnectWallet,
        getWalletAddress,
        sign,

        // Raw solana wallet for advanced usage
        solanaWallet,

        // Network info
        network: walletContext?.network || 'devnet',
    };
};

export default useWallet;