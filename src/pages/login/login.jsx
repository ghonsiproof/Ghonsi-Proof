import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { signInWithMagicLink } from '../../utils/supabaseAuth';
import phantomIcon from '../../assets/wallet-icons/phantom.png';
import solflareIcon from '../../assets/wallet-icons/solflare.png';
import backpackIcon from '../../assets/wallet-icons/backpack.png';
import glowIcon from '../../assets/wallet-icons/glow.png';

function Login() {
  const [activeTab, setActiveTab] = useState('wallet');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isGetStarted, setIsGetStarted] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setActiveTab('wallet');
    const params = new URLSearchParams(location.search);
    setIsGetStarted(params.get('mode') === 'getstarted');
  }, [location]);

  const validateEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const handleWalletConnect = (walletName) => {
    console.log('Connected with:', walletName);
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userWallet', walletName);
    navigate('/home');
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      setMessage('Please enter your email address');
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      setMessage('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    setMessage('');
    
    try {
      await signInWithMagicLink(trimmedEmail);
      setMessage('✅ Magic link sent! Check your email to sign in.');
      setEmail('');
    } catch (error) {
      setMessage('❌ Failed to send magic link: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <div className="mt-[115px] mx-auto py-10 px-5 text-center flex flex-col">
        {!isGetStarted && <h2 className="text-2xl font-bold text-white mb-2.5">Welcome Back</h2>}
        {isGetStarted && <h2 className="text-2xl font-bold text-white mb-2.5">Get Started</h2>}
        <p className="text-sm text-[#ccc] leading-[1.5] mb-[30px]">Connect your wallet or sign in to access your proof portfolio</p>
        <div className="flex flex-row gap-2.5 justify-center items-center mt-5">
          <button className={`flex items-center justify-center flex-1 max-w-[150px] py-3 px-[15px] rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-200 ease-in-out box-border whitespace-nowrap ${activeTab === 'wallet' ? 'bg-[#C19A4A] text-[#1a1a2e] border-none' : 'bg-white/10 text-white border border-white/20'}`} onClick={() => setActiveTab('wallet')}>Wallet Connect</button>
          <button className={`flex items-center justify-center flex-1 max-w-[150px] py-3 px-[15px] rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-200 ease-in-out box-border whitespace-nowrap ${activeTab === 'email' ? 'bg-[#C19A4A] text-[#1a1a2e] border-none' : 'bg-white/10 text-white border border-white/20'}`} onClick={() => setActiveTab('email')}>Email Login</button>
        </div>
      </div>

      {activeTab === 'wallet' && (
        <section>
          <div className="bg-white/5 py-[30px] px-5 my-5 mx-5 rounded-xl border border-white/10">
            <h3 className="text-lg font-bold text-white mb-5 text-center">Choose your wallet</h3>
            <div className="bg-white/[0.08] py-[15px] px-5 mb-3 rounded-lg border border-white/10 flex items-center gap-[15px] cursor-pointer transition-all duration-200 ease-in-out hover:bg-[#0B0F1B] hover:border-[#C19A4A] group" onClick={() => handleWalletConnect('Phantom')}>
              <img src={phantomIcon} alt="Phantom" className="w-5 h-5 flex-shrink-0 object-contain" />
              <h4 className="text-[15px] font-semibold text-white transition-colors duration-200 ease-in-out group-hover:text-[#C19A4A]">Phantom</h4>
            </div>
            <div className="bg-white/[0.08] py-[15px] px-5 mb-3 rounded-lg border border-white/10 flex items-center gap-[15px] cursor-pointer transition-all duration-200 ease-in-out hover:bg-[#0B0F1B] hover:border-[#C19A4A] group" onClick={() => handleWalletConnect('Solflare')}>
              <img src={solflareIcon} alt="Solflare" className="w-5 h-5 flex-shrink-0 object-contain" />
              <h4 className="text-[15px] font-semibold text-white transition-colors duration-200 ease-in-out group-hover:text-[#C19A4A]">Solflare</h4>
            </div>
            <div className="bg-white/[0.08] py-[15px] px-5 mb-3 rounded-lg border border-white/10 flex items-center gap-[15px] cursor-pointer transition-all duration-200 ease-in-out hover:bg-[#0B0F1B] hover:border-[#C19A4A] group" onClick={() => handleWalletConnect('Backpack')}>
              <img src={backpackIcon} alt="Backpack" className="w-5 h-5 flex-shrink-0 object-contain" />
              <h4 className="text-[15px] font-semibold text-white transition-colors duration-200 ease-in-out group-hover:text-[#C19A4A]">Backpack</h4>
            </div>
            <div className="bg-white/[0.08] py-[15px] px-5 mb-0 rounded-lg border border-white/10 flex items-center gap-[15px] cursor-pointer transition-all duration-200 ease-in-out hover:bg-[#0B0F1B] hover:border-[#C19A4A] group" onClick={() => handleWalletConnect('Glow')}>
              <img src={glowIcon} alt="Glow" className="w-5 h-5 flex-shrink-0 object-contain" />
              <h4 className="text-[15px] font-semibold text-white transition-colors duration-200 ease-in-out group-hover:text-[#C19A4A]">Glow</h4>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'email' && (
        <section>
          <div className="bg-white/5 py-[30px] px-5 my-5 mx-5 rounded-xl border border-[#C19A4A]">
            <h2 className="text-lg font-bold text-white mb-[25px]">Sign in with Email</h2>
            <p className="text-sm text-[#ccc] mb-5">We'll send you a magic link to sign in without a password.</p>
            
            {message && (
              <div className={`mb-5 p-3 rounded-lg text-sm ${message.startsWith('✅') ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
                {message}
              </div>
            )}
            
            <h2 className="text-sm font-bold text-[#ccc] mb-3">Email Address</h2>
            <form onSubmit={handleEmailSignIn} className="mb-5">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full py-3 px-[15px] bg-white/[0.08] border border-[#C19A4A] rounded-lg text-white text-sm box-border transition-all duration-200 ease-in-out placeholder:text-white/50 focus:outline-none focus:bg-[#0B0F1B] focus:border-[#C19A4A] disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              />
              <div className="relative">
                <input
                  type="text"
                  id="otpCode"
                  name="otpCode"
                  placeholder="Enter code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  disabled={isLoading}
                  className="w-full py-3 px-[15px] pr-[100px] bg-white/[0.08] border border-[#C19A4A] rounded-lg text-white text-sm box-border transition-all duration-200 ease-in-out placeholder:text-white/50 focus:outline-none focus:bg-[#0B0F1B] focus:border-[#C19A4A] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 py-1.5 px-4 bg-transparent text-[#C19A4A] border-none rounded text-sm font-semibold cursor-pointer transition-all duration-200 ease-in-out hover:text-[#d9b563] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isLoading}
                >
                  Get Code
                </button>
              </div>
            </form>
            <button 
              className="w-full py-3 px-5 bg-[#C19A4A] text-[#0B0F1B] border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 ease-in-out box-border hover:text-[#C19A4A] hover:bg-[#0B0F1B] hover:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" 
              onClick={handleEmailSignIn}
              disabled={isLoading}
            >
              {isLoading ? 'Verifying OTP...' : 'Sign in'}
            </button>
          </div>
        </section>
      )}

      <div className="py-[30px] px-5 text-center">
        <h4 className="text-xs text-[#ccc] leading-[1.8] mb-[15px]">Don't have a wallet? <a href="https://x.com/Ghonsiproof" className="text-[#C19A4A] no-underline cursor-pointer transition-colors duration-200 ease-in-out hover:text-[#C19A4A]">Learn how to get one</a></h4>
        <h4 className="text-xs text-[#ccc] leading-[1.8] mb-[15px]">Continue without connecting (limited access)</h4>
        <h4 className="text-xs text-[#ccc] leading-[1.8] mb-[15px]">By connecting you agree to our <a href="/terms" className="text-[#C19A4A] no-underline cursor-pointer transition-colors duration-200 ease-in-out hover:text-[#C19A4A]">Terms of Service</a> and <a href="/policy" className="text-[#C19A4A] no-underline cursor-pointer transition-colors duration-200 ease-in-out hover:text-[#C19A4A]">Privacy Policy</a></h4>
      </div>
    </main>
  );
}

export default Login;