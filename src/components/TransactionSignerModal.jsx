import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useConnection } from '@solana/wallet-adapter-react';
import { createTransferTransaction } from '../utils/transactionSigner';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import '../pages/upload/upload.css';

/**
 * TransactionSignerModal Component
 * Displays transaction details and prompts user to sign the transaction
 * Used after document extraction to charge SOL fee to Pinata upload
 */
const TransactionSignerModal = ({
  isOpen,
  onClose,
  onSuccess,
  amount = 0.01,
  treasuryAddress,
  documentData,
}) => {
  const { publicKey, signTransaction, connected } = useWallet();
  const { connection } = useConnection();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [transactionDetails, setTransactionDetails] = useState(null);

  // Create and display transaction details when modal opens
  useEffect(() => {
    if (!isOpen || !publicKey || !treasuryAddress) return;

    const prepareTransaction = async () => {
      try {
        setError(null);
        console.log('[v0] Preparing transaction details');

        await createTransferTransaction(
          publicKey,
          amount,
          treasuryAddress,
          connection
        );

        setTransactionDetails({
          from: publicKey.toString(),
          to: treasuryAddress,
          amount: `${amount} SOL`,
          fee: '5,000 lamports (~$0.0000075)',
          total: `${amount} SOL + network fee`,
        });
      } catch (err) {
        console.error('[v0] Transaction preparation error:', err);
        setError(err.message || 'Failed to prepare transaction');
      }
    };

    prepareTransaction();
  }, [isOpen, publicKey, treasuryAddress, amount, connection]);

  // Handle transaction signing
  const handleSignTransaction = async () => {
    if (!publicKey || !connected) {
      setError('Wallet not connected. Please connect your wallet first.');
      return;
    }

    if (!treasuryAddress) {
      setError('Treasury address not configured');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('[v0] Starting transaction signing process');

      // Create the transaction
      const transaction = await createTransferTransaction(
        publicKey,
        amount,
        treasuryAddress,
        connection
      );

      // Sign the transaction with user's wallet
      console.log('[v0] Requesting wallet signature');
      const signedTx = await signTransaction(transaction);

      if (!signedTx) {
        throw new Error('Transaction signing failed');
      }

      // Send the transaction
      console.log('[v0] Sending signed transaction');
      const signature = await connection.sendRawTransaction(signedTx.serialize());

      // Confirm transaction
      console.log('[v0] Confirming transaction:', signature);
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log('[v0] Transaction successful:', signature);
      setTxHash(signature);
      setSuccess(true);

      // Call success callback after a short delay
      setTimeout(() => {
        onSuccess({
          txHash: signature,
          amount,
          documentData,
        });
      }, 1500);
    } catch (err) {
      console.error('[v0] Transaction error:', err);

      // Handle wallet rejection
      if (err.message.includes('4001') || err.message.includes('user rejected')) {
        setError('You rejected the transaction. Please try again if you want to continue.');
      } else {
        setError(err.message || 'Failed to sign and send transaction');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#0B0F1B] to-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Confirm Transaction</h2>
          {!isLoading && !success && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
              disabled={isLoading}
            >
              ✕
            </button>
          )}
        </div>

        {/* Success State */}
        {success && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 size={48} className="text-green-500 animate-pulse" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Payment Successful!</h3>
              <p className="text-sm text-gray-400 mb-4">
                Your transaction has been confirmed on the blockchain
              </p>
              <div className="bg-[#1a1f2e] border border-white/10 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">Transaction Hash:</p>
                <p className="text-xs text-green-400 font-mono break-all">{txHash}</p>
              </div>
              <a
                href={`https://solscan.io/tx/${txHash}?cluster=devnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#C19A4A] hover:text-[#d4a855] transition-colors"
              >
                View on Solscan →
              </a>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && !success && (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <Loader2 size={40} className="text-[#C19A4A] animate-spin" />
            </div>
            <div>
              <p className="text-white font-medium mb-1">Processing Transaction</p>
              <p className="text-sm text-gray-400">
                Please confirm the transaction in your wallet and wait for confirmation...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && !success && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* Transaction Details */}
        {!isLoading && !success && transactionDetails && (
          <div className="space-y-4 mb-6">
            <div className="space-y-3 bg-[#1a1f2e] border border-white/10 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">From</span>
                <span className="text-xs font-mono text-white truncate">
                  {transactionDetails.from.slice(0, 8)}...{transactionDetails.from.slice(-8)}
                </span>
              </div>
              <div className="border-t border-white/5"></div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">To (Treasury)</span>
                <span className="text-xs font-mono text-white truncate">
                  {transactionDetails.to.slice(0, 8)}...{transactionDetails.to.slice(-8)}
                </span>
              </div>
              <div className="border-t border-white/5"></div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Amount</span>
                <span className="text-sm font-semibold text-[#C19A4A]">
                  {transactionDetails.amount}
                </span>
              </div>
              <div className="border-t border-white/5"></div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Network Fee</span>
                <span className="text-xs text-gray-500">{transactionDetails.fee}</span>
              </div>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-200">
                This transaction pays for document verification and storage on IPFS via Pinata.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!isLoading && !success && (
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSignTransaction}
              disabled={isLoading || !connected}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#C19A4A] text-black font-medium hover:bg-[#d4a855] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!connected ? 'Connect Wallet' : 'Sign & Send'}
            </button>
          </div>
        )}

        {success && (
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 rounded-lg bg-[#C19A4A] text-black font-medium hover:bg-[#d4a855] transition-colors"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default TransactionSignerModal;
