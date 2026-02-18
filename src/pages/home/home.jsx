import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Wallet, Upload, X, ArrowRight, Sparkles, Trophy, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/header/header.jsx';
import Footer from '../../components/footer/footer.jsx';
import NotificationWidget from '../../components/NotificationWidget.jsx';
import logo1 from '../../assets/ghonsi-proof-logos/png-logo/1.png';
import queenSmithProfile from '../../assets/home/queen-smith-profile.jpg'; 
import { profileWithfileProofs } from '../../utils/proofsApi.js';

import './home.css';

// Queen Smith profile photo - using imported image from assets/home folder
const QUEEN_SMITH_PROFILE_IMG = queenSmithProfile;

function Home() {
  const [bubbles, setBubbles] = useState([]);
  const [selectedBubble, setSelectedBubble] = useState(null);
  const [isPinned, setIsPinned] = useState(false);
  const [cardPos, setCardPos] = useState({ top: 0, left: 0 });
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const scrollToBubbleSection = () => {
    const element = document.getElementById('bubble-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global listener to close popups when clicking/tapping blank areas
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.bubble-item') && !event.target.closest('.profile-popup-card')) {
        setSelectedBubble(null);
        setIsPinned(false);
      }
    };
    // mousedown for desktop, touchstart for mobile (iOS Safari doesn't reliably fire mousedown on non-interactive elements)
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const data = await profileWithfileProofs();
        if (data && data.length > 0) {
          const getValidPosition = (existingPositions, minDistance) => {
            let attempts = 0;
            while (attempts < 100) {
              let top = Math.random() * 55 + 30;
              let left = Math.random() * 70 + 15;

              if (top < 35 && left > 40 && left < 60) {
                top += 10;
              }

              const isValid = existingPositions.every(pos => {
                const dx = Math.abs(pos.left - left);
                const dy = Math.abs(pos.top - top);
                return Math.sqrt(dx * dx + dy * dy) >= minDistance;
              });

              if (isValid) {
                return { top, left };
              }
              attempts++;
            }
            return { top: Math.random() * 55 + 30, left: Math.random() * 70 + 15 };
          };

          const formatted = [];
          const existingPositions = [];
          const minDistance = 10;

          data.forEach((profile, index) => {
            const pos = getValidPosition(existingPositions, minDistance);
            existingPositions.push(pos);

            formatted.push({
              name: profile.display_name || 'Anonymous',
              bio: profile.bio || 'Web3 Professional',
              img: profile.avatar_url || logo1,
              wallet: profile.users?.wallet_address || '',
              id: profile.id,
              userId: profile.user_id,
              initialPos: { top: `${pos.top}%`, left: `${pos.left}%` },
              delay: index * 0.1
            });
          });

          setBubbles(formatted);
        }
      } catch (error) {
        console.error('Error fetching bubbles:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProfiles();
  }, []);

  const handleBubbleInteraction = (bubble, event, type = 'hover') => {
    // Stop propagation so the global handleClickOutside doesn't fire
    // and immediately close the popup we're about to open
    event.stopPropagation();

    if (isMobile) {
      setSelectedBubble(bubble);
      return;
    }

    if (type === 'click') setIsPinned(true);

    const rect = event.currentTarget.getBoundingClientRect();
    const container = event.currentTarget.closest('.bubbles-section');
    const containerRect = container.getBoundingClientRect();
    
    const popupWidth = 320;
    const popupHeight = 220;

    const bubbleCenterX = rect.left - containerRect.left + rect.width / 2;
    const bubbleBottom = rect.bottom - containerRect.top;

    let leftPosition = bubbleCenterX - popupWidth / 2;
    let topPosition = bubbleBottom + 10;

    leftPosition = Math.max(10, Math.min(leftPosition, containerRect.width - popupWidth - 10));
    topPosition = Math.max(10, Math.min(topPosition, containerRect.height - popupHeight - 10));

    setCardPos({ top: topPosition, left: leftPosition });
    setSelectedBubble(bubble);
  };

  return (
    <div className="min-h-screen bg-[#0B0F1B] text-white font-sans selection:bg-[#C19A4A]/30 relative overflow-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-[#C19A4A] rounded-full mix-blend-multiply filter blur-[128px] animate-blob" />
        <div className="absolute top-0 -right-40 w-96 h-96 bg-[#d9b563] rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-4000" />
      </div>

      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(193,154,74,0.1) 1px, transparent 1px),
            linear-gradient(0deg, rgba(193,154,74,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }} />
      </div>

      <Header />
      <NotificationWidget />

      <main className="pt-16 md:pt-20 lg:pt-24 relative z-10">
        
        {/* HERO SECTION */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 xl:py-20 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
            
            {/* Left Column: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-start text-left w-full order-1 lg:order-1"
            >
              {/* Heading - CENTER on mobile, LEFT on desktop */}
              <div className="w-full text-center md:text-left mb-6 sm:mb-8">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.15] max-w-2xl mx-auto md:mx-0">
                  <span className="block">
                    Prove your <span className="relative inline-block">
                      <span className="bg-gradient-to-r from-[#C19A4A] via-[#d9b563] to-[#C19A4A] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                        work
                      </span>
                      <span className="absolute -inset-1 bg-gradient-to-r from-[#C19A4A] to-[#d9b563] opacity-30 blur-2xl" />
                    </span>
                  </span>
                  <span className="block mt-1 sm:mt-2">
                    <span className="bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 bg-clip-text text-transparent">as you </span>
                    <span className="bg-gradient-to-br from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                      GO
                    </span>
                  </span>
                </h1>
              </div>

              {/* Description */}
              <div className="w-full max-w-xl space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-left">
                <p className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed">
                  Ghonsi Proof lets you turn your work into a{' '}
                  <span className="text-[#C19A4A] font-semibold">verifiable on-chain portfolio</span>
                  , so you get noticed for the contributions you've actually made.
                </p>
                <p className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed">
                  Scattered work across GitHub, Discord, X, and other platforms makes proving your skills slow and frustrating.
                  Ghonsi Proof solves this by letting you upload and verify your work in one trusted place.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto items-stretch sm:items-center">
                <NavLink
                  to="/dashboard"
                  className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#030712] font-bold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(193,154,74,0.4)] flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
                >
                  <span className="relative z-10">Create my portfolio</span>
                  <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </NavLink>

                <button
                  onClick={scrollToBubbleSection}
                  className="group relative px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold overflow-hidden transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-xl" />
                  <div className="absolute inset-[1px] bg-[#0B0F1B]/80 backdrop-blur-xl rounded-[11px]" />
                  <span className="relative z-10">Verify talent now</span>
                  <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </button>
              </div>
            </motion.div>

            {/* Right Column: 3D Card - DESKTOP ONLY */}
            <div className="hidden lg:flex items-center justify-center lg:justify-end order-2 lg:order-2">
              <div className="relative w-full max-w-[420px] xl:max-w-[460px]" style={{ height: '480px' }}>
                <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d', perspective: '1200px' }}>

                  {/* Background Ghost Layer */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.15 }}
                    className="absolute inset-0 p-6 lg:p-8 rounded-3xl bg-[#131825]/90 backdrop-blur-3xl border border-[#C19A4A]/20"
                    style={{
                      top: '16px',
                      left: '-24px',
                      right: '24px',
                      bottom: '-16px',
                      filter: 'blur(8px)',
                      transform: 'perspective(1200px) rotateY(-8deg) rotateX(3deg) translateZ(-50px) scale(0.97)'
                    }}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative flex-shrink-0">
                        <img src={QUEEN_SMITH_PROFILE_IMG} className="w-16 h-16 rounded-full border-2 border-[#C19A4A] object-cover" alt="Profile" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-white text-lg truncate">Queen Smith</h4>
                        <p className="text-gray-400 text-xs">Product Designer</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center text-center min-h-[80px]">
                        <div className="text-3xl font-bold text-white mb-2">12</div>
                        <div className="text-gray-400 text-[11px] uppercase font-semibold tracking-tight">
                          Total Proofs
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 border border-[#C19A4A]/20 flex flex-col items-center justify-center text-center min-h-[80px]">
                        <div className="text-3xl font-bold text-white mb-2">9</div>
                        <div className="text-gray-400 text-[11px] uppercase font-semibold tracking-tight">
                          Achievements
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5 col-span-2">
                        <div className="flex items-center gap-2 text-gray-400 text-[10px] mb-1 uppercase font-bold tracking-tight">
                          <Trophy size={12} className="text-[#C19A4A] flex-shrink-0" /> 
                          <span className="truncate">Recent Achievement</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-white truncate">Hackathon Winner</span>
                          <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">Verifiable</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Main Card (Front Layer) */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ 
                      rotateY: -2,
                      rotateX: 1,
                      translateZ: 30,
                      transition: { duration: 0.4 }
                    }}
                    className="absolute inset-0 p-6 lg:p-8 rounded-3xl bg-[#131825]/90 backdrop-blur-3xl border border-[#C19A4A]/20 flex flex-col gap-6"
                    style={{
                      transform: 'perspective(1200px) rotateY(-6deg) rotateX(3deg) translateZ(20px)',
                      transformStyle: 'preserve-3d',
                      boxShadow: '-24px 24px 72px rgba(193,154,74,0.15), 0 24px 48px rgba(0,0,0,0.6)'
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <img src={QUEEN_SMITH_PROFILE_IMG} className="w-16 h-16 rounded-full border-2 border-[#C19A4A] object-cover" alt="Profile" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-white text-lg truncate">Queen Smith</h4>
                        <p className="text-gray-400 text-xs">Product Designer</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center text-center min-h-[80px]">
                        <div className="text-3xl font-bold text-white mb-2">12</div>
                        <div className="text-gray-400 text-[11px] uppercase font-semibold tracking-tight">
                          Total Proofs
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 border border-[#C19A4A]/20 flex flex-col items-center justify-center text-center min-h-[80px]">
                        <div className="text-3xl font-bold text-white mb-2">9</div>
                        <div className="text-gray-400 text-[11px] uppercase font-semibold tracking-tight">
                          Achievements
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5 col-span-2">
                        <div className="flex items-center gap-2 text-gray-400 text-[10px] mb-1 uppercase font-bold tracking-tight">
                          <Trophy size={12} className="text-[#C19A4A] flex-shrink-0" /> 
                          <span className="truncate">Recent Achievement</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-white truncate">Hackathon Winner</span>
                          <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">Verifiable</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative p-[1px] rounded-3xl lg:rounded-[2.5rem] bg-gradient-to-br from-[#C19A4A]/50 via-[#d9b563]/30 to-blue-500/30"
          >
            <div className="relative rounded-[23px] lg:rounded-[2.3rem] bg-[#0B0F1B]/90 backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 p-6 sm:p-8 lg:p-10 xl:p-12 overflow-hidden border border-white/10">
              <div className="absolute inset-0 bg-gradient-to-br from-[#C19A4A]/5 via-transparent to-[#d9b563]/5 rounded-[23px] lg:rounded-[2.3rem]" />

              <div className="relative text-center mb-8 sm:mb-10 lg:mb-12">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                  How It Works
                </h2>
                <p className="text-gray-400 text-sm sm:text-base lg:text-lg xl:text-xl">
                  Create your permanent work history in 3 steps.
                </p>
              </div>

              <div className="relative mx-auto max-w-4xl p-[1px] rounded-2xl bg-gradient-to-br from-[#C19A4A]/20 to-[#d9b563]/20">
                <div className="relative rounded-[15px] bg-[#0B0F1B]/50 backdrop-blur-xl p-4 sm:p-6 lg:p-8">
                  <div className="relative space-y-5 sm:space-y-6 lg:space-y-8">
                    {[
                      {
                        icon: Wallet,
                        title: "Connect",
                        desc: "Sign up and link your wallet.",
                        gradient: "from-blue-500 to-cyan-500"
                      },
                      {
                        icon: Upload,
                        title: "Upload",
                        desc: "Add your work and verify it on-chain.",
                        gradient: "from-[#d9b563] to-pink-500"
                      },
                      {
                        icon: Share,
                        title: "Share",
                        desc: "Instantly share your verified portfolio with employers or collaborators.",
                        gradient: "from-[#C19A4A] to-[#d9b563]"
                      }
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.2 }}
                        className="group relative"
                      >
                        <div className="relative p-[1px] rounded-xl lg:rounded-2xl bg-gradient-to-r from-white/10 to-white/5 hover:from-[#C19A4A]/30 hover:to-[#d9b563]/30 transition-all duration-500">
                          <div className="flex flex-row items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-[11px] lg:rounded-[15px] bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl">
                            <div className="relative flex-shrink-0">
                              <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl bg-gradient-to-br ${item.gradient} p-[1px]`}>
                                <div className="w-full h-full rounded-[10px] lg:rounded-[14px] bg-[#0B0F1B] flex items-center justify-center">
                                  <item.icon size={20} className="text-[#C19A4A] sm:w-6 sm:h-6" />
                                </div>
                              </div>
                              <div className={`absolute inset-0 rounded-xl lg:rounded-2xl bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                {item.title}
                              </h3>
                              <p className="text-gray-400 text-xs sm:text-sm lg:text-base leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="pt-6 sm:pt-8 flex justify-center">
                    <NavLink
                      to="/dashboard"
                      className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#030712] font-bold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(193,154,74,0.4)] flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center max-w-xs"
                    >
                      <span className="relative z-10">Create my portfolio</span>
                      <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#d9b563] to-[#C19A4A] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </NavLink>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* QUEEN SMITH PROFILE CARD - MOBILE/TABLET ONLY */}
        <section className="lg:hidden max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="relative w-full max-w-[340px] sm:max-w-[380px]">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="p-6 sm:p-8 rounded-3xl bg-[#131825]/90 backdrop-blur-3xl border border-[#C19A4A]/20 flex flex-col gap-6 shadow-[0_20px_60px_rgba(193,154,74,0.15)]"
              >
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <img src={QUEEN_SMITH_PROFILE_IMG} className="w-16 h-16 rounded-full border-2 border-[#C19A4A] object-cover" alt="Profile" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-white text-base sm:text-lg truncate">Queen Smith</h4>
                    <p className="text-gray-400 text-xs">Product Designer</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-white/5 rounded-2xl p-3 sm:p-4 border border-white/5 flex flex-col items-center justify-center text-center min-h-[80px]">
                    <div className="text-3xl font-bold text-white mb-2">12</div>
                    <div className="text-gray-400 text-[11px] uppercase font-semibold tracking-tight">
                      Total Proofs
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3 sm:p-4 border border-[#C19A4A]/20 flex flex-col items-center justify-center text-center min-h-[80px]">
                    <div className="text-3xl font-bold text-white mb-2">9</div>
                    <div className="text-gray-400 text-[11px] uppercase font-semibold tracking-tight">
                      Achievements
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-3 sm:p-4 border border-white/5 col-span-2">
                    <div className="flex items-center gap-1.5 text-gray-400 text-[10px] mb-1 uppercase font-bold tracking-tight">
                      <Trophy size={12} className="text-[#C19A4A] flex-shrink-0" /> 
                      <span className="truncate">Recent Achievement</span>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs sm:text-sm font-bold text-white truncate">Hackathon Winner</span>
                      <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">Verifiable</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* TRUST LAYER SECTION */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -top-10 sm:-top-20 -left-10 sm:-left-20 w-32 h-32 sm:w-40 sm:h-40 bg-[#C19A4A] rounded-full opacity-20 blur-[80px] sm:blur-[100px]" />
            <div className="absolute -bottom-10 sm:-bottom-20 -right-10 sm:-right-20 w-32 h-32 sm:w-40 sm:h-40 bg-[#d9b563] rounded-full opacity-20 blur-[80px] sm:blur-[100px]" />
            
            <div className="relative text-left">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl sm:text-3xl lg:text-4xl mb-4 sm:mb-6 text-white leading-tight"
              >
                Building the trust layer for the global workforce.
              </motion.h2>
              
              <div className="max-w-3xl space-y-3 sm:space-y-4 mb-6 sm:mb-10 lg:mb-12 text-left">
                <p className="text-gray-300 text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed">
                  Your reputation should be easy to prove and accessible anytime.
                </p>
                <p className="text-gray-400 text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed">
                  Ghonsi Proof bridges the gap between doing the work and getting the credit you deserve.
                </p>
              </div>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center"
              >
                <NavLink 
                  to="/dashboard" 
                  className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#030712] font-bold rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(193,154,74,0.4)] flex items-center gap-2 text-sm sm:text-base justify-center whitespace-nowrap"
                >
                  <span className="relative z-10">Create my portfolio</span>
                  <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#d9b563] to-[#C19A4A] opacity-0 group-hover:opacity-100 transition-opacity" />
                </NavLink>
                
                <button
                  onClick={scrollToBubbleSection}
                  className="group relative px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold overflow-hidden transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm sm:text-base justify-center whitespace-nowrap"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-xl" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#C19A4A]/0 via-[#C19A4A]/10 to-[#C19A4A]/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  <div className="absolute inset-[1px] bg-[#0B0F1B]/80 backdrop-blur-xl rounded-[11px]" />
                  <span className="relative z-10">Verify talent now</span>
                  <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* DISCOVER VERIFIED TALENT */}
        <section id="bubble-section" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-14 pb-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6 sm:mb-10 lg:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
              Discover Verified Talent
            </h2>
            <p className="text-gray-300 text-sm sm:text-base lg:text-lg px-2">Browse on-chain portfolios of proven Web3 builders.</p>
          </motion.div>
        </section>

        {/* BUBBLE EXPLORER */}
        <section className="mx-4 sm:mx-6 lg:mx-8 mb-12 sm:mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative p-[2px] rounded-3xl lg:rounded-[2.5rem] bg-gradient-to-br from-[#C19A4A]/50 via-[#d9b563]/30 to-blue-500/30"
          >
            <div className="relative p-[1px] rounded-[22px] lg:rounded-[2.4rem] bg-gradient-to-br from-white/10 to-white/5">
<div className="relative h-[600px] sm:h-[750px] lg:h-[850px] xl:h-[950px] rounded-[20px] lg:rounded-[2.3rem] bg-gradient-to-b from-[#0B0F1B]/95 to-[#0B0F1B]/80 backdrop-blur-2xl bubbles-section overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#C19A4A15_0%,transparent_70%)] rounded-[20px] lg:rounded-[2.3rem]" />
                
                <div className="absolute inset-0 opacity-30 rounded-[20px] lg:rounded-[2.3rem]" style={{
                  backgroundImage: `
                    radial-gradient(circle at 20% 50%, rgba(193,154,74,0.15) 0%, transparent 50%),
                    radial-gradient(circle at 80% 50%, rgba(147,51,234,0.15) 0%, transparent 50%)
                  `
                }} />

                <div className="absolute top-4 sm:top-6 lg:top-8 left-1/2 -translate-x-1/2 z-20 px-2">
                  <div className="relative px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-full bg-gradient-to-r from-[#C19A4A]/20 to-[#d9b563]/20 border border-[#C19A4A]/30 backdrop-blur-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#C19A4A]/10 to-[#d9b563]/10 rounded-full animate-pulse" />
                    <span className="relative text-[#C19A4A] text-[10px] sm:text-xs font-bold uppercase tracking-wider whitespace-nowrap flex items-center gap-1.5 sm:gap-2">
                      <Sparkles size={12} className="flex-shrink-0 sm:w-[14px] sm:h-[14px]" />
                      <span className="hidden xs:inline">Explore Verified Professionals</span>
                      <span className="xs:hidden">Verified Professionals</span>
                    </span>
                  </div>
                </div>

                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="relative">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-t-[#C19A4A] border-r-[#d9b563] border-b-blue-500 border-l-[#C19A4A]/20 rounded-full animate-spin" />
                      <div className="absolute inset-0 w-12 h-12 sm:w-16 sm:h-16 border-4 border-[#C19A4A] rounded-full opacity-20 blur-xl animate-pulse" />
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full p-4 sm:p-8 lg:p-10">
                    {bubbles.map((bubble) => (
                      <motion.div
                        key={bubble.id}
                        className="absolute cursor-pointer group bubble-item"
                        style={{ top: bubble.initialPos.top, left: bubble.initialPos.left }}
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, ease: "easeInOut", delay: bubble.delay }}
                        onClick={(e) => handleBubbleInteraction(bubble, e, 'click')}
                        onMouseEnter={(e) => !isMobile && !isPinned && handleBubbleInteraction(bubble, e, 'hover')}
                        onMouseLeave={() => !isMobile && !isPinned && setSelectedBubble(null)}
                        whileHover={!isMobile ? { scale: 1.1 } : {}}
                      >
                        <div className={`relative p-[2px] rounded-full bg-gradient-to-br ${selectedBubble?.id === bubble.id ? 'from-[#C19A4A] to-[#d9b563]' : 'from-white/20 to-white/5'} transition-all duration-300`}>
                          <div className="relative p-1 rounded-full bg-[#0B0F1B]">
                            <img 
                              src={bubble.img} 
                              alt={bubble.name} 
                              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 rounded-full grayscale group-hover:grayscale-0 transition-all shadow-xl object-cover" 
                            />
                          </div>
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#C19A4A] to-[#d9b563] opacity-0 group-hover:opacity-50 blur-xl transition-opacity" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* PROFILE POPUP */}
                <AnimatePresence>
                  {selectedBubble && (
                    <>
                      {isMobile && (
                        <motion.div 
                          initial={{ opacity: 0 }} 
                          animate={{ opacity: 1 }} 
                          exit={{ opacity: 0 }} 
                          onClick={() => setSelectedBubble(null)} 
                          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1001]" 
                        />
                      )}
                      <motion.div
                        initial={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.9 }}
                        animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1 }}
                        exit={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={`z-[1002] profile-popup-card ${isMobile ? 'fixed bottom-0 left-0 right-0 max-w-full' : 'absolute w-[280px] sm:w-[320px]'}`}
                        style={!isMobile ? { top: cardPos.top, left: cardPos.left } : {}}
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                      >
                        <div className="relative p-[2px] rounded-t-3xl sm:rounded-3xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
                          <div className="relative rounded-t-[22px] sm:rounded-[22px] bg-[#0B0F1B] backdrop-blur-2xl p-5 sm:p-6 shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#C19A4A]/10 via-transparent to-[#d9b563]/10 rounded-t-[22px] sm:rounded-[22px]" />
                            
                            <button 
                              onClick={() => { setSelectedBubble(null); setIsPinned(false); }} 
                              className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 text-gray-400 hover:text-white transition-colors p-1"
                              aria-label="Close"
                            >
                              <X size={18} className="sm:w-5 sm:h-5" />
                            </button>
                            
                            <div className="relative flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5 pr-8">
                              <div className="relative flex-shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#C19A4A] to-[#d9b563] rounded-full blur-md opacity-50" />
                                <img 
                                  src={selectedBubble.img} 
                                  className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-[#C19A4A] object-cover" 
                                  alt={selectedBubble.name} 
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-base sm:text-lg bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent truncate">
                                  {selectedBubble.name}
                                </h3>
                                <p className="text-[#C19A4A] text-xs sm:text-sm uppercase font-bold tracking-tight flex items-center gap-1">
                                  <Sparkles size={10} className="flex-shrink-0 sm:w-3 sm:h-3" />
                                  Verified Member
                                </p>
                              </div>
                            </div>
                            
                            <p className="relative text-gray-400 text-xs sm:text-sm mb-5 sm:mb-6 leading-relaxed line-clamp-2">
                              {selectedBubble.bio}
                            </p>
                            
                            <NavLink 
                              to={`/request?id=${selectedBubble.userId}`} 
                              className="relative group flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#030712] font-bold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(193,154,74,0.4)] text-sm sm:text-base"
                            >
                              <span className="relative z-10">View Full Profile</span>
                              <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                              <div className="absolute inset-0 bg-gradient-to-r from-[#d9b563] to-[#C19A4A] opacity-0 group-hover:opacity-100 transition-opacity" />
                            </NavLink>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
      
      <Footer />

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Extra small devices */
        @media (min-width: 375px) {
          .xs\\:inline {
            display: inline;
          }
          .xs\\:hidden {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;