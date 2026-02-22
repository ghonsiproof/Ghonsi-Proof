import React, { useState } from 'react';
import { X, Mail, User, ArrowRight, Check } from 'lucide-react';
import { createWalletOnboardingUser, linkEmailToWallet } from '../utils/walletEmailLinking';
import { sendOTPToEmail, verifyOTP } from '../utils/supabaseAuth';

function WalletOnboardingModal({ walletAddress, walletType, onComplete, onClose }) {
  const [step, setStep] = useState('profile'); // 'profile' or 'email'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Profile form state
  const [name, setName] = useState('');
  const [userId, setUserId] = useState(null);

  // Email verification state
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!name.trim()) {
        setError('Please enter your name');
        setIsLoading(false);
        return;
      }

      const result = await createWalletOnboardingUser(walletAddress, walletType, {
        name: name.trim(),
      });

      if (result.success) {
        setUserId(result.user.id);
        localStorage.setItem('user_id', result.user.id);
        localStorage.setItem('wallet_address', walletAddress);
        
        setMessage('Profile created successfully!');
        // Move to email step or complete
        setTimeout(() => {
          setStep('email');
          setMessage('');
        }, 1000);
      }
    } catch (err) {
      setError(err.message || 'Failed to create profile');
      console.error('[v0] Profile creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email');
        setIsLoading(false);
        return;
      }

      await sendOTPToEmail(email);
      setOtpSent(true);
      setMessage('OTP sent to your email');
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
      console.error('[v0] OTP send error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!otp.trim()) {
        setError('Please enter the OTP');
        setIsLoading(false);
        return;
      }

      const isValid = await verifyOTP(email, otp);
      if (isValid) {
        // Link email to wallet user
        if (userId) {
          await linkEmailToWallet(userId, email);
        }
        setMessage('Email verified and linked!');
        setTimeout(() => {
          onComplete();
        }, 1500);
      } else {
        setError('Invalid OTP');
      }
    } catch (err) {
      setError(err.message || 'Failed to verify OTP');
      console.error('[v0] OTP verify error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipEmail = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#0B0F1B]/80 backdrop-blur-lg border border-[#C19A4A]/40 rounded-2xl p-8 max-w-md w-full max-h-96 overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#C19A4A]">Complete Your Profile</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#C19A4A]/20 rounded-lg transition-colors"
          >
            <X size={20} className="text-[#C19A4A]" />
          </button>
        </div>

        {step === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <p className="text-sm text-gray-300 mb-4">
              Complete your profile to get started with your wallet
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-[#1A1F2E] border border-[#C19A4A]/20 rounded-lg">
                <User size={18} className="text-[#C19A4A]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
            {message && <p className="text-green-400 text-sm mt-3">{message}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-[#C19A4A] text-[#0B0F1B] rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Continue'}
            </button>
          </form>
        )}

        {step === 'email' && (
          <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP} className="space-y-4">
            <p className="text-sm text-gray-300 mb-4">
              {otpSent ? 'Enter the OTP sent to your email' : 'Add an email to your account (optional)'}
            </p>

            {!otpSent ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#1A1F2E] border border-[#C19A4A]/20 rounded-lg">
                    <Mail size={18} className="text-[#C19A4A]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="flex-1 bg-transparent outline-none text-white placeholder-gray-500"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleSkipEmail}
                    disabled={isLoading}
                    className="flex-1 py-2 border border-[#C19A4A]/30 text-[#C19A4A] rounded-lg font-semibold hover:bg-[#C19A4A]/10 transition-colors disabled:opacity-50"
                  >
                    Skip
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2 bg-[#C19A4A] text-[#0B0F1B] rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength="6"
                    className="w-full px-3 py-2 bg-[#1A1F2E] border border-[#C19A4A]/20 rounded-lg text-center text-white font-mono text-lg outline-none"
                    disabled={isLoading}
                  />
                </div>

                {error && <p className="text-red-400 text-sm">{error}</p>}
                {message && <p className="text-green-400 text-sm">{message}</p>}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpSent(false);
                      setOtp('');
                      setError('');
                    }}
                    disabled={isLoading}
                    className="flex-1 py-2 border border-[#C19A4A]/30 text-[#C19A4A] rounded-lg font-semibold hover:bg-[#C19A4A]/10 transition-colors disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2 bg-[#C19A4A] text-[#0B0F1B] rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default WalletOnboardingModal;
