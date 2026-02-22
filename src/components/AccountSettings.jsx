import React, { useState } from 'react';
import { Wallet, Mail, Copy, Check } from 'lucide-react';
import { linkWalletToEmail, linkEmailToWallet } from '../utils/walletEmailLinking';
import { sendOTPToEmail, verifyOTP } from '../utils/supabaseAuth';

function AccountSettings({ user, onUpdate }) {
  const [isBinding, setIsBinding] = useState(false);
  const [bindingType, setBindingType] = useState(null); // 'wallet' or 'email'
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Wallet binding state
  const [tempWalletAddress, setTempWalletAddress] = useState('');

  // Email binding state
  const [tempEmail, setTempEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handleCopyAddress = (address) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Email user binding wallet
  const handleBindWallet = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsBinding(true);

    try {
      if (!tempWalletAddress.trim()) {
        setError('Please enter a wallet address');
        setIsBinding(false);
        return;
      }

      await linkWalletToEmail(user.id, tempWalletAddress.trim());
      setMessage('Wallet linked successfully!');
      setTempWalletAddress('');
      setBindingType(null);
      setTimeout(() => {
        onUpdate();
        setMessage('');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to bind wallet');
      console.error('[v0] Wallet binding error:', err);
    } finally {
      setIsBinding(false);
    }
  };

  // Wallet user adding email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setIsBinding(true);

    try {
      if (!tempEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tempEmail)) {
        setError('Please enter a valid email');
        setIsBinding(false);
        return;
      }

      await sendOTPToEmail(tempEmail);
      setOtpSent(true);
      setMessage('OTP sent to your email');
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
      console.error('[v0] OTP send error:', err);
    } finally {
      setIsBinding(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsBinding(true);

    try {
      if (!otp.trim()) {
        setError('Please enter the OTP');
        setIsBinding(false);
        return;
      }

      const isValid = await verifyOTP(tempEmail, otp);
      if (isValid) {
        await linkEmailToWallet(user.id, tempEmail);
        setMessage('Email linked successfully!');
        setTempEmail('');
        setOtp('');
        setOtpSent(false);
        setBindingType(null);
        setTimeout(() => {
          onUpdate();
          setMessage('');
        }, 1500);
      } else {
        setError('Invalid OTP');
      }
    } catch (err) {
      setError(err.message || 'Failed to verify OTP');
      console.error('[v0] OTP verify error:', err);
    } finally {
      setIsBinding(false);
    }
  };

  const cancelBinding = () => {
    setBindingType(null);
    setTempWalletAddress('');
    setTempEmail('');
    setOtp('');
    setOtpSent(false);
    setError('');
    setMessage('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#C19A4A]">Account Settings</h2>

      {/* Email Display */}
      {user?.email && (
        <div className="p-4 bg-[#1A1F2E] border border-[#C19A4A]/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-[#C19A4A]" />
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white font-mono">{user.email}</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Connected</span>
          </div>
        </div>
      )}

      {/* Wallet Display */}
      {user?.wallet_address && (
        <div className="p-4 bg-[#1A1F2E] border border-[#C19A4A]/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet size={20} className="text-[#C19A4A]" />
              <div>
                <p className="text-sm text-gray-400">Wallet Address</p>
                <p className="text-white font-mono text-sm break-all">{user.wallet_address}</p>
              </div>
            </div>
            <button
              onClick={() => handleCopyAddress(user.wallet_address)}
              className="p-2 hover:bg-[#C19A4A]/10 rounded transition-colors"
            >
              {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} className="text-[#C19A4A]" />}
            </button>
          </div>
        </div>
      )}

      {/* Bind Wallet Button (for email users) */}
      {user?.email && !user?.wallet_address && !isBinding && bindingType !== 'wallet' && (
        <button
          onClick={() => setBindingType('wallet')}
          className="w-full py-3 bg-[#C19A4A]/20 border border-[#C19A4A] text-[#C19A4A] rounded-lg font-semibold hover:bg-[#C19A4A]/30 transition-colors"
        >
          Bind Wallet to Account
        </button>
      )}

      {/* Add Email Button (for wallet users) */}
      {user?.wallet_address && !user?.email && !isBinding && bindingType !== 'email' && (
        <button
          onClick={() => setBindingType('email')}
          className="w-full py-3 bg-[#C19A4A]/20 border border-[#C19A4A] text-[#C19A4A] rounded-lg font-semibold hover:bg-[#C19A4A]/30 transition-colors"
        >
          Add Email to Account
        </button>
      )}

      {/* Wallet Binding Form */}
      {bindingType === 'wallet' && (
        <form onSubmit={handleBindWallet} className="p-4 bg-[#1A1F2E] border border-[#C19A4A]/30 rounded-lg space-y-3">
          <h3 className="font-semibold text-white">Connect Your Wallet</h3>
          <input
            type="text"
            value={tempWalletAddress}
            onChange={(e) => setTempWalletAddress(e.target.value)}
            placeholder="Enter Solana wallet address..."
            className="w-full px-3 py-2 bg-[#0B0F1B] border border-[#C19A4A]/20 rounded text-white placeholder-gray-500 outline-none focus:border-[#C19A4A]"
            disabled={isBinding}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {message && <p className="text-green-400 text-sm">{message}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={cancelBinding}
              disabled={isBinding}
              className="flex-1 py-2 border border-gray-500 text-gray-400 rounded font-semibold hover:bg-gray-500/10 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isBinding}
              className="flex-1 py-2 bg-[#C19A4A] text-[#0B0F1B] rounded font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isBinding ? 'Binding...' : 'Connect'}
            </button>
          </div>
        </form>
      )}

      {/* Email Binding Form */}
      {bindingType === 'email' && (
        <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP} className="p-4 bg-[#1A1F2E] border border-[#C19A4A]/30 rounded-lg space-y-3">
          <h3 className="font-semibold text-white">
            {otpSent ? 'Enter OTP' : 'Add Email Address'}
          </h3>

          {!otpSent ? (
            <>
              <input
                type="email"
                value={tempEmail}
                onChange={(e) => setTempEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 bg-[#0B0F1B] border border-[#C19A4A]/20 rounded text-white placeholder-gray-500 outline-none focus:border-[#C19A4A]"
                disabled={isBinding}
              />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              {message && <p className="text-green-400 text-sm">{message}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={cancelBinding}
                  disabled={isBinding}
                  className="flex-1 py-2 border border-gray-500 text-gray-400 rounded font-semibold hover:bg-gray-500/10 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBinding}
                  className="flex-1 py-2 bg-[#C19A4A] text-[#0B0F1B] rounded font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isBinding ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
            </>
          ) : (
            <>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength="6"
                className="w-full px-3 py-2 bg-[#0B0F1B] border border-[#C19A4A]/20 rounded text-center text-white font-mono text-lg outline-none focus:border-[#C19A4A]"
                disabled={isBinding}
              />
              <p className="text-sm text-gray-400">Check your email for the OTP</p>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              {message && <p className="text-green-400 text-sm">{message}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                    setError('');
                  }}
                  disabled={isBinding}
                  className="flex-1 py-2 border border-gray-500 text-gray-400 rounded font-semibold hover:bg-gray-500/10 transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isBinding}
                  className="flex-1 py-2 bg-[#C19A4A] text-[#0B0F1B] rounded font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isBinding ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </>
          )}
        </form>
      )}
    </div>
  );
}

export default AccountSettings;
