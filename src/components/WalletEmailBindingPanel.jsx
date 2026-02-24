import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useConnection } from '@solana/wallet-adapter-react';
import { Mail, Wallet, Plus, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { bindWallet, unbindWallet, updateEmail, getWalletBindings } from '../utils/walletEmailBinding';
import { getCurrentUser } from '../utils/supabaseAuth';

/**
 * WalletEmailBindingPanel Component
 * Allows users to manage wallet and email connections in their profile
 */
const WalletEmailBindingPanel = ({ userId }) => {
  const { publicKey, connected, signMessage } = useWallet();
  const { connection } = useConnection();

  const [bindings, setBindings] = useState({ wallets: [], emails: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [showAddEmail, setShowAddEmail] = useState(false);

  // Load current bindings
  useEffect(() => {
    if (!userId) return;
    
    const loadBindings = async () => {
      try {
        const data = await getWalletBindings(userId);
        setBindings(data);
      } catch (err) {
        console.error('[v0] Error loading bindings:', err);
      }
    };

    loadBindings();
  }, [userId]);

  // Handle adding new wallet
  const handleAddWallet = async () => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await bindWallet(userId, publicKey.toString(), signMessage, connection);
      setSuccess('Wallet connected successfully!');
      setShowAddWallet(false);
      
      // Reload bindings
      const data = await getWalletBindings(userId);
      setBindings(data);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('[v0] Error binding wallet:', err);
      setError(err.message || 'Failed to bind wallet');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle removing wallet
  const handleRemoveWallet = async (walletAddress) => {
    if (!window.confirm('Are you sure you want to disconnect this wallet?')) return;

    setIsLoading(true);
    setError(null);

    try {
      await unbindWallet(userId, walletAddress);
      setSuccess('Wallet disconnected');
      
      // Reload bindings
      const data = await getWalletBindings(userId);
      setBindings(data);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('[v0] Error unbinding wallet:', err);
      setError(err.message || 'Failed to unbind wallet');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding email
  const handleAddEmail = async () => {
    if (!newEmail.trim()) {
      setError('Please enter an email address');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateEmail(userId, newEmail);
      setSuccess('Email updated successfully!');
      setShowAddEmail(false);
      setNewEmail('');
      
      // Reload bindings
      const data = await getWalletBindings(userId);
      setBindings(data);

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('[v0] Error updating email:', err);
      setError(err.message || 'Failed to update email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#1A1F2E] border border-white/10 rounded-xl p-6 space-y-6">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2">
        <Wallet size={20} />
        Account Connections
      </h2>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex gap-3">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex gap-3">
          <CheckCircle2 size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-200">{success}</p>
        </div>
      )}

      {/* Wallets Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-white font-medium flex items-center gap-2">
            <Wallet size={16} />
            Connected Wallets
          </h3>
          {!showAddWallet && (
            <button
              onClick={() => setShowAddWallet(true)}
              className="text-[#C19A4A] hover:text-[#d4a855] text-sm flex items-center gap-1"
            >
              <Plus size={16} /> Add Wallet
            </button>
          )}
        </div>

        {bindings.wallets.length > 0 ? (
          <div className="space-y-2">
            {bindings.wallets.map((wallet) => (
              <div
                key={wallet}
                className="flex items-center justify-between p-3 bg-[#0B0F1B] border border-white/5 rounded-lg"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Wallet size={16} className="text-[#C19A4A] flex-shrink-0" />
                  <code className="text-sm text-gray-300 truncate">
                    {wallet.slice(0, 8)}...{wallet.slice(-8)}
                  </code>
                </div>
                <button
                  onClick={() => handleRemoveWallet(wallet)}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No wallets connected</p>
        )}

        {showAddWallet && (
          <div className="p-4 bg-[#0B0F1B] border border-[#C19A4A]/20 rounded-lg space-y-3">
            {connected ? (
              <>
                <p className="text-sm text-gray-300">
                  Connect wallet: <code className="text-[#C19A4A]">{publicKey?.toString().slice(0, 8)}...</code>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddWallet}
                    disabled={isLoading}
                    className="flex-1 px-3 py-2 bg-[#C19A4A] text-black text-sm font-medium rounded-lg hover:bg-[#d4a855] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowAddWallet(false)}
                    className="flex-1 px-3 py-2 bg-white/5 text-white text-sm font-medium rounded-lg hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-yellow-300">Please connect your wallet first</p>
            )}
          </div>
        )}
      </div>

      {/* Email Section */}
      <div className="space-y-3 pt-4 border-t border-white/10">
        <div className="flex justify-between items-center">
          <h3 className="text-white font-medium flex items-center gap-2">
            <Mail size={16} />
            Email Address
          </h3>
          {!showAddEmail && (
            <button
              onClick={() => setShowAddEmail(true)}
              className="text-[#C19A4A] hover:text-[#d4a855] text-sm flex items-center gap-1"
            >
              <Plus size={16} /> {bindings.emails.length > 0 ? 'Update' : 'Add'}
            </button>
          )}
        </div>

        {bindings.emails.length > 0 ? (
          <div className="p-3 bg-[#0B0F1B] border border-white/5 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Mail size={16} className="text-[#C19A4A] flex-shrink-0" />
              <span className="text-sm text-gray-300 truncate">{bindings.emails[0]}</span>
            </div>
            <span className="text-xs text-green-400 flex-shrink-0">Verified</span>
          </div>
        ) : (
          <p className="text-sm text-gray-400">No email connected</p>
        )}

        {showAddEmail && (
          <div className="p-4 bg-[#0B0F1B] border border-[#C19A4A]/20 rounded-lg space-y-3">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-3 py-2 bg-[#111625] border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:border-[#C19A4A] outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddEmail}
                disabled={isLoading || !newEmail.trim()}
                className="flex-1 px-3 py-2 bg-[#C19A4A] text-black text-sm font-medium rounded-lg hover:bg-[#d4a855] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                Confirm
              </button>
              <button
                onClick={() => {
                  setShowAddEmail(false);
                  setNewEmail('');
                }}
                className="flex-1 px-3 py-2 bg-white/5 text-white text-sm font-medium rounded-lg hover:bg-white/10"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletEmailBindingPanel;
