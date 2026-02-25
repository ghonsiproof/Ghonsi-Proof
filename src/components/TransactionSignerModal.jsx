import React, { useState, useEffect, useRef } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useConnection } from '@solana/wallet-adapter-react';
import { createTransferTransaction } from '../utils/transactionSigner';
import { Loader2, AlertCircle } from 'lucide-react';
import '../pages/upload/upload.css';

/**
 * TransactionSignerModal
 *
 * Sole responsibility: get the user to sign and confirm a SOL transfer.
 * Once confirmed it calls onSuccess({ txHash, amount, documentData }) and
 * closes itself immediately — no success screen, no delay.
 * The parent (upload.jsx) owns all post-payment UI.
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
  const [transactionDetails, setTransactionDetails] = useState(null);

  // Hard guard — prevents double-submission on re-render
  const isSubmittingRef = useRef(false);

  // Reset every time modal opens so there is never stale state
  useEffect(() => {
    if (!isOpen) return;
    isSubmittingRef.current = false;
    setError(null);
    setIsLoading(false);

    if (!publicKey || !treasuryAddress) return;
    setTransactionDetails({
      from: publicKey.toString(),
      to: treasuryAddress,
      amount: `${amount} SOL`,
      fee: '5,000 lamports (~$0.0000075)',
    });
  }, [isOpen]); // only fires on open/close — intentional

  const handleSignTransaction = async () => {
    if (isSubmittingRef.current) return;
    if (!publicKey || !connected) {
      setError('Wallet not connected. Please connect your wallet first.');
      return;
    }
    if (!treasuryAddress) {
      setError('Treasury address not configured.');
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      console.log('[v0] Starting transaction signing process');

      // Always build a FRESH transaction with a fresh blockhash right before
      // signing — never reuse a previously created or signed transaction.
      const transaction = await createTransferTransaction(
        publicKey,
        amount,
        treasuryAddress,
        connection
      );

      console.log('[v0] Requesting wallet signature');
      const signedTx = await signTransaction(transaction);
      if (!signedTx) throw new Error('Transaction signing was cancelled or failed.');

      console.log('[v0] Sending signed transaction');
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      });

      console.log('[v0] Confirming transaction:', signature);
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      if (confirmation.value.err) {
        throw new Error(`Transaction failed on-chain: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log('[v0] Transaction successful:', signature);

      // Close this modal IMMEDIATELY then hand off to parent.
      // Parent shows "Submitting Proof..." spinner then the final success modal.
      // No success screen here — this prevents the two-modal race condition.
      onSuccess({ txHash: signature, amount, documentData });

    } catch (err) {
      console.error('[v0] Transaction error:', err);
      isSubmittingRef.current = false; // allow retry

      if (
        err.message?.includes('4001') ||
        err.message?.toLowerCase().includes('user rejected') ||
        err.message?.toLowerCase().includes('rejected the request')
      ) {
        setError('Transaction cancelled. Click "Sign & Send" to try again.');
      } else if (err.message?.includes('already been processed')) {
        setError('This transaction was already submitted. Please close and try uploading again.');
      } else if (err.message?.includes('Blockhash not found')) {
        setError('Transaction expired. Please close and try again.');
      } else {
        setError(err.message || 'Failed to sign and send transaction.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#0B0F1B] to-[#1a1f2e] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Confirm Transaction</h2>
          {!isLoading && (
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              ✕
            </button>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4 text-center py-4">
            <div className="flex justify-center">
              <Loader2 size={40} className="text-[#C19A4A] animate-spin" />
            </div>
            <p className="text-white font-medium">Processing Transaction</p>
            <p className="text-sm text-gray-400">
              Please confirm in your wallet and wait for confirmation...
            </p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* Transaction details */}
        {!isLoading && transactionDetails && (
          <div className="space-y-4 mb-6">
            <div className="space-y-3 bg-[#1a1f2e] border border-white/10 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">From</span>
                <span className="text-xs font-mono text-white">
                  {transactionDetails.from.slice(0, 8)}...{transactionDetails.from.slice(-8)}
                </span>
              </div>
              <div className="border-t border-white/5" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">To (Treasury)</span>
                <span className="text-xs font-mono text-white">
                  {transactionDetails.to.slice(0, 8)}...{transactionDetails.to.slice(-8)}
                </span>
              </div>
              <div className="border-t border-white/5" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Amount</span>
                <span className="text-sm font-semibold text-[#C19A4A]">{transactionDetails.amount}</span>
              </div>
              <div className="border-t border-white/5" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Network Fee</span>
                <span className="text-xs text-gray-500">{transactionDetails.fee}</span>
              </div>
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-200">
                This transaction pays for document verification and permanent storage on IPFS.
              </p>
            </div>
          </div>
        )}

        {/* Buttons */}
        {!isLoading && (
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSignTransaction}
              disabled={!connected}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#C19A4A] text-black font-medium hover:bg-[#d4a855] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {!connected ? 'Connect Wallet' : 'Sign & Send'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default TransactionSignerModal;