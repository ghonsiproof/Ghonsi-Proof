import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Wallet } from 'lucide-react';
import { getCurrentUser, logout } from '../../utils/supabaseAuth';
import { useWallet } from '../../hooks/useWallet';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { connected, getWalletAddress, wallet, disconnectWallet } = useWallet();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const walletMenuRef = useRef(null);
  const walletButtonRef = useRef(null);

  const walletAddress = getWalletAddress();
  const walletName = wallet?.adapter?.name || null;

  const checkAuthStatus = useCallback(async () => {
    try {
      if (connected && walletAddress) {
        setIsLoggedIn(true);
      } else {
        const currentUser = await getCurrentUser();
        setIsLoggedIn(!!currentUser);
      }
    } catch (error) {
      setIsLoggedIn(false);
    }
  }, [connected, walletAddress]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target) &&
        buttonRef.current && !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
      if (
        walletMenuRef.current && !walletMenuRef.current.contains(event.target) &&
        walletButtonRef.current && !walletButtonRef.current.contains(event.target)
      ) {
        setIsWalletMenuOpen(false);
      }
    };

    if (isMenuOpen || isWalletMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen, isWalletMenuOpen]);

  const handleSignOut = async () => {
    try {
      await logout();
      if (connected) {
        await disconnectWallet();
      }
      setIsLoggedIn(false);
      setIsMenuOpen(false);
      setIsWalletMenuOpen(false);
      navigate('/home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handlePortfolioClick = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      navigate('/portfolio');
    }
    setIsMenuOpen(false);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    setIsWalletMenuOpen(false);

    const tempDiv = document.createElement('div');
    tempDiv.textContent = '✓ Copied!';
    tempDiv.style.cssText = `
      position: fixed; top: 80px; right: 20px;
      background: #C19A4A; color: #0B0F1B;
      padding: 8px 16px; border-radius: 6px;
      font-size: 14px; font-weight: 600;
      z-index: 9999; animation: fadeInOut 2s ease-in-out;
    `;
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-10px); }
        15% { opacity: 1; transform: translateY(0); }
        85% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-10px); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(tempDiv);
    setTimeout(() => {
      document.body.removeChild(tempDiv);
      document.head.removeChild(style);
    }, 2000);
  };

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <header className="p-[0px_20px] fixed top-0 w-full z-[100] bg-black/30 backdrop-blur-[10px] box-border">
      <div className="flex justify-between items-center">
        {/* Replace with your logo */}
        <div className="h-[90px] flex items-center">
          <span className="text-[#C19A4A] font-bold text-xl">Ghonsi Proof</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Wallet button (desktop) */}
          {walletAddress && (
            <div className="hidden sm:block relative">
              <button
                ref={walletButtonRef}
                onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-[#151925] rounded-lg border border-[#C19A4A]/30 hover:border-[#C19A4A] transition-all cursor-pointer"
              >
                <Wallet size={16} className="text-[#C19A4A]" />
                <span className="text-[#C19A4A] text-sm font-medium">
                  {shortenAddress(walletAddress)}
                </span>
                {walletName && (
                  <span className="text-xs text-gray-400">({walletName})</span>
                )}
              </button>

              {isWalletMenuOpen && (
                <div
                  ref={walletMenuRef}
                  className="absolute right-0 mt-2 w-64 bg-[#0B0F1B] border border-[#C19A4A]/30 rounded-lg shadow-xl overflow-hidden z-50"
                >
                  <div className="p-3 border-b border-[#C19A4A]/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet size={14} className="text-[#C19A4A]" />
                      <span className="text-xs text-gray-400">{walletName} Wallet</span>
                    </div>
                    <div className="text-xs text-gray-300 break-all font-mono">
                      {walletAddress}
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleCopyAddress}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#151925] rounded transition-colors"
                    >
                      📋 Copy Address
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    >
                      🔌 Disconnect Wallet
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hamburger */}
          <button
            ref={buttonRef}
            className="bg-none border-none p-0 flex items-center justify-center cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Menu
              size={24}
              color={isHovered ? '#C19A4A' : 'currentColor'}
              style={{
                transform: isHovered ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'all 0.3s ease'
              }}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        ref={menuRef}
        className={`${isMenuOpen ? 'flex' : 'hidden'} absolute top-[70px] right-0 w-full bg-[#0B0F1B] backdrop-blur-[10px] flex-col gap-0 p-5 box-border`}
      >
        {/* Wallet info (mobile) */}
        {walletAddress && (
          <div className="sm:hidden mb-4">
            <div className="p-3 bg-[#151925] rounded-lg border border-[#C19A4A]/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wallet size={16} className="text-[#C19A4A]" />
                  <span className="text-[#C19A4A] text-sm font-medium">
                    {shortenAddress(walletAddress)}
                  </span>
                </div>
                {walletName && (
                  <span className="text-xs text-gray-400">{walletName}</span>
                )}
              </div>
              <div className="text-xs text-gray-400 break-all mb-3">{walletAddress}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(walletAddress);
                    alert('Wallet address copied!');
                  }}
                  className="flex-1 py-2 px-3 text-xs bg-[#0B0F1B] text-white rounded hover:bg-[#151925] transition-colors"
                >
                  📋 Copy
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex-1 py-2 px-3 text-xs bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors"
                >
                  🔌 Disconnect
                </button>
              </div>
            </div>
          </div>
        )}

        <nav>
          <ul className="p-0 m-0">
            <li className="py-3 px-0 font-bold list-none">
              <Link to="/home" onClick={() => setIsMenuOpen(false)} className="text-white no-underline text-[19px] transition-colors duration-200 ease-in-out block hover:text-[#C19A4A]">Home</Link>
            </li>
            <li className="py-3 px-0 font-bold list-none">
              <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-white no-underline text-[19px] transition-colors duration-200 ease-in-out block hover:text-[#C19A4A]">About</Link>
            </li>
            <li className="py-3 px-0 font-bold list-none">
              <Link to="/portfolio" onClick={handlePortfolioClick} className="text-white no-underline text-[19px] transition-colors duration-200 ease-in-out block hover:text-[#C19A4A]">Portfolio</Link>
            </li>
            {isLoggedIn && (
              <li className="py-3 px-0 font-bold list-none">
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-white no-underline text-[19px] transition-colors duration-200 ease-in-out block hover:text-[#C19A4A]">Dashboard</Link>
              </li>
            )}
            <li className="py-3 px-0 font-bold list-none">
              <Link to="/contact" onClick={() => setIsMenuOpen(false)} className="text-white no-underline text-[19px] transition-colors duration-200 ease-in-out block hover:text-[#C19A4A]">Contact</Link>
            </li>
            <li className="py-3 px-0 font-bold list-none">
              <Link to="/faq" onClick={() => setIsMenuOpen(false)} className="text-white no-underline text-[19px] transition-colors duration-200 ease-in-out block hover:text-[#C19A4A]">FAQ</Link>
            </li>
          </ul>
        </nav>

        <div className="flex flex-col gap-3 mt-10 pt-[30px]">
          {isLoggedIn ? (
            <button
              className="mt-1 mx-auto py-2.5 px-5 text-white border border-[#C19A4A] bg-transparent rounded-lg text-[13px] font-normal cursor-pointer transition-all duration-200 ease-in-out w-4/5 max-w-[200px] box-border hover:bg-[rgba(212,175,55,0.1)] hover:text-[#C19A4A] hover:scale-[0.98]"
              onClick={handleSignOut}
            >
              {walletAddress ? 'Disconnect Wallet' : 'Sign Out'}
            </button>
          ) : (
            <>
              <button
                className="mt-1 mx-auto py-2.5 px-5 text-white border border-[#C19A4A] bg-transparent rounded-lg text-[13px] font-normal cursor-pointer transition-all duration-200 ease-in-out w-4/5 max-w-[200px] box-border hover:bg-[rgba(212,175,55,0.1)] hover:text-[#C19A4A] hover:scale-[0.98]"
                onClick={() => navigate('/login?mode=signin')}
              >
                Sign In
              </button>
              <button
                className="mt-1 mx-auto mb-2.5 py-2.5 px-5 text-white border-none bg-[#C19A4A] rounded-lg text-[13px] font-normal cursor-pointer transition-all duration-200 ease-in-out w-4/5 max-w-[200px] box-border hover:text-[#0B0F1B] hover:scale-[0.98]"
                onClick={() => navigate('/login?mode=getstarted')}
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
