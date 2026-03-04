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
        signTransaction, // FIX: was missing, caused "signTransaction is not a function"
    } = solanaWallet;

    // Connect wallet and open modal if needed
    const connectWallet = useCallback(async () => {
        try {
            // Always try to show the modal first - this is the most reliable approach
            // The modal will handle showing previously selected wallets
            if (!connected) {
                setWalletModalVisible(true);
                
                // Also try to connect if a wallet was previously selected
                // This is a fallback in case the modal doesn't auto-connect
                if (wallet) {
                    try {
                        await connect();
                    } catch (err) {
                        // Ignore connection errors - the modal is already shown
                        // User can select wallet from the modal
                        console.log('Waiting for wallet selection from modal');
                    }
                }
            }
            return true;
        } catch (error) {
            console.error('Error connecting wallet:', error);
            // Even on error, try to show the modal as a fallback
            try {
                setWalletModalVisible(true);
            } catch (modalError) {
                console.error('Error showing wallet modal:', modalError);
            }
            return false;
        }
    }, [connected, wallet, connect, setWalletModalVisible]);

    // Disconnect wallet
    const disconnectWallet = useCallback(async () => {
        try {
            await disconnect();
            return true;
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
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
                console.error('Error signing message:', error);
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
        signTransaction, // FIX: now exposed to consumers like TransactionSignerModal

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
