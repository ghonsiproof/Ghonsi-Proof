import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import logo from '../../assets/ghonsi-proof-logos/transparent-png-logo/4.png';

const ADMIN_EMAIL = 'support@ghonsiproof.com'; // The admin mail

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (email !== ADMIN_EMAIL) {
      setError('Unauthorized email address');
      return;
    }

    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      setError(error.message);
    } else {
      setStep('otp');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email'
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.user) {
      localStorage.setItem('adminAuth', 'true');
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1121] text-white flex items-center justify-center p-4">
      <div className="bg-[#1A2332] border border-gray-700 rounded-lg p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Ghonsi Proof" className="h-12" />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-2">Admin Login</h1>
        <p className="text-gray-400 text-sm text-center mb-6">Secure access to admin dashboard</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={handleSendOTP}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter admin email"
                required
                className="w-full bg-[#0B1121] border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#C19A4A]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C19A4A] text-black font-medium py-2 rounded-lg hover:bg-[#D4A854] disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                required
                maxLength={6}
                className="w-full bg-[#0B1121] border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#C19A4A]"
              />
              <p className="text-xs text-gray-400 mt-2">Check your email for the OTP code</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C19A4A] text-black font-medium py-2 rounded-lg hover:bg-[#D4A854] disabled:opacity-50 mb-2"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              onClick={() => setStep('email')}
              className="w-full text-gray-400 text-sm hover:text-white"
            >
              Back to email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminLogin;
