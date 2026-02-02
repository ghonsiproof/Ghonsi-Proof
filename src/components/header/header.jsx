import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { getCurrentUser, logout } from '../../utils/supabaseAuth';
import { getUnreadCount } from '../../utils/messagesApi';
import logo from '../../assets/ghonsi-proof-logos/transparent-png-logo/4.png';
import './header.css';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const checkAuthStatus = async () => {
    try {
      const currentUser = await getCurrentUser();
      setIsLoggedIn(!!currentUser);
      if (currentUser) {
        const count = await getUnreadCount(currentUser.id);
        setUnreadCount(count);
      }
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const handleSignIn = () => {
    navigate('/login?mode=signin');
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      setIsMenuOpen(false);
      navigate('/home');
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  const handleGetStarted = () => {
    navigate('/login?mode=getstarted');
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

  return (
    <header className="p-[0px_20px] fixed top-0 w-full z-[100] bg-black/30 backdrop-blur-[10px] box-border">
      <div className="flex justify-between items-center">
        <img src={logo} alt="Ghonsi proof Logo" className="h-[90px] w-auto object-contain" />
        <div className="flex items-center gap-3">
          {isLoggedIn && (
            <button
              onClick={() => navigate('/message')}
              className="relative p-2 rounded-lg hover:bg-[#151925] transition-colors"
            >
              <Bell size={20} className="text-[#C19A4A]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          )}
          <button
            ref={buttonRef}
            className="bg-none border-none p-0 flex items-center justify-center cursor-pointer" 
            onClick={handleMenuToggle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <Menu 
              size={24} 
              color={isHovered ? "#C19A4A" : "currentColor"}
              style={{
                transform: isHovered ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'all 0.3s ease'
              }}
            />
          </button>
        </div>
      </div>
      <div ref={menuRef} className={`${isMenuOpen ? 'flex' : 'hidden'} absolute top-[70px] right-0 w-full bg-[#0B0F1B] backdrop-blur-[10px] flex-col gap-0 p-5 box-border`}>
        <nav>
          <ul className="p-0 m-0">
            <li className="py-3 px-0 font-bold list-none"><Link to="/home" onClick={handleLinkClick} className="text-white no-underline text-[19px] transition-colors duration-200 ease-in-out block hover:text-[#C19A4A]"> Home </Link></li>
            <li className="py-3 px-0 font-bold list-none"><Link to="/about" onClick={handleLinkClick} className="text-white no-underline text-[19px] transition-colors duration-200 ease-in-out block hover:text-[#C19A4A]"> About </Link></li>
            <li className="py-3 px-0 font-bold list-none"><Link to="/portfolio" onClick={handlePortfolioClick} className="text-white no-underline text-[19px] transition-colors duration-200 ease-in-out block hover:text-[#C19A4A]"> Portfolio </Link></li>
            {isLoggedIn && <li className="py-3 px-0 font-bold list-none"><Link to="/dashboard" onClick={handleLinkClick} className="text-white no-underline text-[19px] transition-colors duration-200 ease-in-out block hover:text-[#C19A4A]"> Dashboard </Link></li>}
            <li className="py-3 px-0 font-bold list-none"><Link to="/contact" onClick={handleLinkClick} className="text-white no-underline text-[19px] transition-colors duration-200 ease-in-out block hover:text-[#C19A4A]"> Contact </Link></li>
            <li className="py-3 px-0 font-bold list-none"><Link to="/faq" onClick={handleLinkClick} className="text-white no-underline text-[19px] transition-colors duration-200 ease-in-out block hover:text-[#C19A4A]"> FAQ </Link></li>
          </ul>
        </nav>
        <div className="flex flex-col gap-3 mt-10 pt-[30px]">
          {isLoggedIn ? (
            <button id="signOutBtn" className="mt-1 mx-auto py-2.5 px-5 text-white border border-[#C19A4A] bg-transparent rounded-lg text-[13px] font-normal cursor-pointer transition-all duration-200 ease-in-out w-4/5 max-w-[200px] box-border hover:bg-[rgba(212,175,55,0.1)] hover:text-[#C19A4A] hover:scale-[0.98]" onClick={handleSignOut}>Sign Out</button>
          ) : (
            <>
              <button id="signInBtn" className="mt-1 mx-auto py-2.5 px-5 text-white border border-[#C19A4A] bg-transparent rounded-lg text-[13px] font-normal cursor-pointer transition-all duration-200 ease-in-out w-4/5 max-w-[200px] box-border hover:bg-[rgba(212,175,55,0.1)] hover:text-[#C19A4A] hover:scale-[0.98]" onClick={handleSignIn}>Sign In</button>
              <button id="getStartedBtn" className="mt-1 mx-auto mb-2.5 py-2.5 px-5 text-white border-none bg-[#C19A4A] rounded-lg text-[13px] font-normal cursor-pointer transition-all duration-200 ease-in-out w-4/5 max-w-[200px] box-border hover:text-[#0B0F1B] hover:scale-[0.98]" onClick={handleGetStarted}>Get Started</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;