import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Wallet, Upload, X, ArrowRight, Sparkles, ShieldCheck, FileText, Trophy, Share } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../../components/header/header.jsx';
import Footer from '../../components/footer/footer.jsx';
import NotificationWidget from '../../components/NotificationWidget.jsx';
import logo1 from '../../assets/ghonsi-proof-logos/png-logo/1.png';
import { profileWithfileProofs } from '../../utils/proofsApi.js';

import './home.css';

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

  // Global listener to close popups when clicking blank areas
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.bubble-item') && !event.target.closest('.profile-popup-card')) {
        setSelectedBubble(null);
        setIsPinned(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
      {/* Background elements preserved as requested */}
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

      <main className="pt-16 md:pt-24 relative z-10">
        
        {/* REDESIGNED HERO SECTION */}
        <section className="relative px-4 md:px-6 py-12 lg:py-20 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center flex-col-reverse lg:flex-row">
            
            {/* Left Column: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-start text-left w-full"
            >
              <div className="w-full text-center mb-6">
                <h1 className="text-[2.5rem] leading-[1.1] sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter max-w-xl lg:max-w-2xl lg:tracking-wide inline-block">
                  <span className="block">
                    Prove your <span className="relative inline-block">
                      <span className="bg-gradient-to-r from-[#C19A4A] via-[#d9b563] to-[#C19A4A] bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                        work
                      </span>
                      <span className="absolute -inset-1 bg-gradient-to-r from-[#C19A4A] to-[#d9b563] opacity-30 blur-2xl" />
                    </span>
                  </span>
                  <span className="block mt-1">
                    <span className="bg-gradient-to-br from-gray-300 via-gray-400 to-gray-500 bg-clip-text text-transparent">as you </span>
                    <span className="bg-gradient-to-br from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                      GO
                    </span>
                  </span>
                </h1>
              </div>

              <div className="max-w-lg space-y-4 mb-8">
                <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
                  Ghonsi Proof lets you turn your work into a{' '}
                  <span className="text-[#C19A4A] font-semibold">verifiable on-chain portfolio</span>
                  , so you get noticed for the contributions you've actually made.
                </p>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed mt-4">
                  Scattered work across GitHub, Discord, X, and other platforms makes proving your skills slow and frustrating.
                  Ghonsi Proof solves this by letting you upload and verify your work in one trusted place.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <NavLink
                  to="/dashboard"
                  className="group relative px-8 py-4 bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#030712] font-bold rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(193,154,74,0.4)] flex items-center gap-2 text-sm md:text-base justify-center"
                >
                  <span className="relative z-10">Create my portfolio</span>
                  <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </NavLink>

                <button
                  onClick={scrollToBubbleSection}
                  className="group relative px-8 py-4 rounded-xl font-bold overflow-hidden transition-all hover:scale-105 flex items-center gap-2 text-sm md:text-base justify-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-xl" />
                  <div className="absolute inset-[1px] bg-[#0B0F1B]/80 backdrop-blur-xl rounded-[11px]" />
                  <span className="relative z-10">Verify talent now</span>
                  <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>

            {/* Right Column: 3D DEPTH LAYERED CARD */}
            <div className="hidden md:block relative h-[280px] md:h-[450px] w-full flex items-center justify-center lg:justify-end scale-85 md:scale-100">
              <div className="relative w-full max-w-[380px] h-full" style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}>

                {/* Background Ghost Layer (Depth Reflection) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.18 }}
                  className="hidden md:block absolute p-8 rounded-3xl bg-[#131825]/90 backdrop-blur-3xl border border-[#C19A4A]/20"
                  style={{
                    top: '12px',
                    left: '-18px',
                    right: '18px',
                    zIndex: -1,
                    filter: 'blur(6px)',
                    transform: 'perspective(1000px) rotateY(-6deg) rotateX(2deg) translateZ(-40px) scale(0.98)'
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img src={logo1} className="w-16 h-16 rounded-full border-2 border-[#C19A4A]" alt="Profile" />
                      <div className="absolute -bottom-1 -right-1 bg-[#C19A4A] rounded-full p-1 border-2 border-[#0B0F1B]">
                        <ShieldCheck size={12} className="text-black" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">Clara Nekamoto</h4>
                      <p className="text-gray-400 text-xs">Fullstack Developer</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 text-gray-400 text-[10px] mb-1 uppercase font-bold tracking-tighter">
                        <FileText size={12} className="text-[#C19A4A]" /> Total Proofs
                      </div>
                      <div className="text-base font-bold text-white">12 </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-[#C19A4A]/20">
                      <div className="flex items-center gap-2 text-[#C19A4A] text-[10px] mb-1 uppercase font-bold tracking-tighter">
                        <ShieldCheck size={12} /> Verified
                      </div>
                      <div className="text-base font-bold text-white">9 </div>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 col-span-2">
                      <div className="flex items-center gap-2 text-gray-400 text-[10px] mb-1 uppercase font-bold tracking-tighter">
                        <Trophy size={12} className="text-[#C19A4A]" /> Recent Achievement
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">Hackathon Winner</span>
                        <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">System Verified</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Main Card (Front Layer with 3D Tilt) */}
                <div className="relative z-20 hero-card-3d">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ 
                      rotateY: -9,
                      translateZ: 30,
                      transition: { duration: 0.3 }
                    }}
                    className="p-6 md:p-8 rounded-3xl bg-[#131825]/90 backdrop-blur-3xl border border-[#C19A4A]/20 flex flex-col gap-6"
                    style={{
                      transform: 'perspective(1000px) rotateY(-6deg) rotateX(2deg) translateZ(20px)',
                      transformStyle: 'preserve-3d',
                      boxShadow: '-20px 20px 60px rgba(193,154,74,0.12), 0 20px 40px rgba(0,0,0,0.5)'
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img src={logo1} className="w-16 h-16 rounded-full border-2 border-[#C19A4A]" alt="Profile" />
                        <div className="absolute -bottom-1 -right-1 bg-[#C19A4A] rounded-full p-1 border-2 border-[#0B0F1B]">
                          <ShieldCheck size={12} className="text-black" />
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg">Clara Nekamoto</h4>
                        <p className="text-gray-400 text-xs">Fullstack Developer</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 text-gray-400 text-[10px] mb-1 uppercase font-bold tracking-tighter">
                          <FileText size={12} className="text-[#C19A4A]" /> Total Proofs
                        </div>
                        <div className="text-base font-bold text-white">12</div>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 border border-[#C19A4A]/20">
                        <div className="flex items-center gap-2 text-[#C19A4A] text-[10px] mb-1 uppercase font-bold tracking-tighter">
                          <ShieldCheck size={12} /> Verified
                        </div>
                        <div className="text-base font-bold text-white">9 </div>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5 col-span-2">
                        <div className="flex items-center gap-2 text-gray-400 text-[10px] mb-1 uppercase font-bold tracking-tighter">
                          <Trophy size={12} className="text-[#C19A4A]" /> Recent Achievement
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">Hackathon Winner</span>
                          <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">System Verified</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* HOW IT WORKS SECTION - Mobile Optimized */}
        <section className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">

          {/* Premium layered container - Mobile Optimized */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative p-[1px] rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-[#C19A4A]/50 via-[#d9b563]/30 to-blue-500/30"
          >
              <div className="relative rounded-[1.9rem] md:rounded-[2.3rem] bg-[#0B0F1B]/90 backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 p-4 md:p-6 lg:p-8 overflow-hidden border border-white/10">
                {/* Inner glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#C19A4A]/5 via-transparent to-[#d9b563]/5 rounded-[1.9rem] md:rounded-[2.3rem]" />

                <div className="text-center mb-6">
                  <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                    How It Works
                  </h2>
                  <p className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl">
                    Create your permanent work history in 3 steps.
                  </p>
                </div>

                <div className="relative mx-2 md:mx-4 lg:mx-6 p-[1px] rounded-2xl bg-gradient-to-br from-[#C19A4A]/20 to-[#d9b563]/20">
                  <div className="relative rounded-[15px] bg-[#0B0F1B]/50 backdrop-blur-xl p-4 md:p-6">
                    <div className="relative space-y-6 md:space-y-8">
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
                          {/* Card with gradient border */}
                          <div className="relative p-[1px] rounded-xl md:rounded-2xl bg-gradient-to-r from-white/10 to-white/5 hover:from-[#C19A4A]/30 hover:to-[#d9b563]/30 transition-all duration-500">
                            <div className="flex flex-col items-start gap-4 md:gap-6 p-4 md:p-6 rounded-[11px] md:rounded-[15px] bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-xl">
                              {/* Icon container with gradient */}
                              <div className="relative flex-shrink-0">
                                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${item.gradient} p-[1px]`}>
                                  <div className="w-full h-full rounded-[10px] md:rounded-[14px] bg-[#0B0F1B] flex items-center justify-center">
                                    <item.icon size={20} className="text-[#C19A4A] md:w-6 md:h-6" />
                                  </div>
                                </div>
                                {/* Glow effect */}
                                <div className={`absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />
                              </div>

                              <div className="flex-1">
                                <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                  {item.title}
                                </h3>
                                <p className="text-gray-400 text-sm md:text-base leading-relaxed">{item.desc}</p>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="pt-4 md:pt-6 flex justify-center">
                      <NavLink
                        to="/dashboard"
                        className="group relative px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#030712] font-bold rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(193,154,74,0.4)] flex items-center gap-2 text-sm md:text-base w-full sm:w-auto justify-center"
                      >
                        <span className="relative z-10">Create my portfolio</span>
                        <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform md:w-[18px] md:h-[18px]" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#d9b563] to-[#C19A4A] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </NavLink>
                    </div>
                  </div>
                </div>
              </div>
          </motion.div>
        </section>

        {/* MOBILE CARD SECTION - Shows Clara Nekamoto card below How It Works on mobile */}
        <section className="md:hidden max-w-6xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="relative w-full max-w-[320px]">
              <motion.div
                className="p-6 rounded-3xl bg-[#131825]/90 backdrop-blur-3xl border border-[#C19A4A]/20 flex flex-col gap-6"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img src={logo1} className="w-16 h-16 rounded-full border-2 border-[#C19A4A]" alt="Profile" />
                    <div className="absolute -bottom-1 -right-1 bg-[#C19A4A] rounded-full p-1 border-2 border-[#0B0F1B]">
                      <ShieldCheck size={12} className="text-black" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">Clara Nekamoto</h4>
                    <p className="text-gray-400 text-xs">Fullstack Developer</p>
                </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] mb-1 uppercase font-bold tracking-tighter">
                      <FileText size={12} className="text-[#C19A4A]" /> Total Proofs
                    </div>
                    <div className="text-base font-bold text-white">12</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-[#C19A4A]/20">
                    <div className="flex items-center gap-2 text-[#C19A4A] text-[10px] mb-1 uppercase font-bold tracking-tighter">
                      <ShieldCheck size={12} /> Verified
                    </div>
                    <div className="text-base font-bold text-white">9</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/5 col-span-2">
                    <div className="flex items-center gap-2 text-gray-400 text-[10px] mb-1 uppercase font-bold tracking-tighter">
                      <Trophy size={12} className="text-[#C19A4A]" /> Recent Achievement
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">Hackathon Winner</span>
                      <span className="text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">System Verified</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* TRUST LAYER SECTION - Mobile Optimized */}
        <section className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            {/* Decorative gradient orbs - adjusted for mobile */}
            <div className="absolute -top-10 md:-top-20 -left-10 md:-left-20 w-32 h-32 md:w-40 md:h-40 bg-[#C19A4A] rounded-full opacity-20 blur-[80px] md:blur-[100px]" />
            <div className="absolute -bottom-10 md:-bottom-20 -right-10 md:-right-20 w-32 h-32 md:w-40 md:h-40 bg-[#d9b563] rounded-full opacity-20 blur-[80px] md:blur-[100px]" />
            
            <div className="relative text-left">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl mb-4 md:mb-6 text-white"
              >
                Building the trust layer for the global workforce.
              </motion.h2>
              
              <div className="max-w-3xl space-y-2 md:space-y-4 mb-6 md:mb-12">
                <p className="text-gray-300 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                  Your reputation should be easy to prove and accessible anytime.
                </p>
                <p className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed">
                  Ghonsi Proof bridges the gap between doing the work and getting the credit you deserve.
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-start items-start"
              >
                <NavLink 
                  to="/dashboard" 
                  className="group relative px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#030712] font-bold rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(193,154,74,0.4)] flex items-center gap-2 text-sm md:text-base w-full sm:w-auto justify-center"
                >
                  <span className="relative z-10">Create my portfolio</span>
                  <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform md:w-[18px] md:h-[18px]" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#d9b563] to-[#C19A4A] opacity-0 group-hover:opacity-100 transition-opacity" />
                </NavLink>
                
                <button
                  onClick={scrollToBubbleSection}
                  className="group relative px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold overflow-hidden transition-all hover:scale-105 flex items-center gap-2 text-sm md:text-base w-full sm:w-auto justify-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 rounded-xl" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#C19A4A]/0 via-[#C19A4A]/10 to-[#C19A4A]/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  <div className="absolute inset-[1px] bg-[#0B0F1B]/80 backdrop-blur-xl rounded-[11px]" />
                  <span className="relative z-10">Verify talent now</span>
                  <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform md:w-[18px] md:h-[18px]" />
                </button>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* DISCOVER VERIFIED TALENT - BUBBLE EXPLORER - Mobile Optimized */}
        <section id="bubble-section" className="max-w-6xl mx-auto px-4 md:px-6 pt-10 md:pt-14 pb-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
              Discover Verified Talent
            </h2>
            <p className="text-gray-300 text-sm md:text-base lg:text-lg px-2">Browse on-chain portfolios of proven Web3 builders.</p>
          </motion.div>
        </section>

        {/* Premium Bubble Container - Mobile Optimized */}
        <section className="mx-2 md:mx-4 mb-12 md:mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative p-[2px] rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-[#C19A4A]/50 via-[#d9b563]/30 to-blue-500/30"
          >
            <div className="relative p-[1px] rounded-[1.95rem] md:rounded-[2.4rem] bg-gradient-to-br from-white/10 to-white/5">
              <div className="relative h-[500px] md:h-[600px] lg:h-[700px] rounded-[1.9rem] md:rounded-[2.3rem] bg-gradient-to-b from-[#0B0F1B]/95 to-[#0B0F1B]/80 backdrop-blur-2xl bubbles-section overflow-visible">
                {/* Radial gradient overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#C19A4A15_0%,transparent_70%)] rounded-[1.9rem] md:rounded-[2.3rem]" />
                
                {/* Animated gradient lines */}
                <div className="absolute inset-0 opacity-30 rounded-[1.9rem] md:rounded-[2.3rem]" style={{
                  backgroundImage: `
                    radial-gradient(circle at 20% 50%, rgba(193,154,74,0.15) 0%, transparent 50%),
                    radial-gradient(circle at 80% 50%, rgba(147,51,234,0.15) 0%, transparent 50%)
                  `
                }} />

                <div className="absolute top-4 md:top-8 left-1/2 -translate-x-1/2 z-20">
                  <div className="relative px-4 md:px-6 py-2 md:py-3 rounded-full bg-gradient-to-r from-[#C19A4A]/20 to-[#d9b563]/20 border border-[#C19A4A]/30 backdrop-blur-xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#C19A4A]/10 to-[#d9b563]/10 rounded-full animate-pulse" />
                    <span className="relative text-[#C19A4A] text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap flex items-center gap-1.5 md:gap-2">
                      <Sparkles size={12} className="md:w-[14px] md:h-[14px]" />
                      Explore Verified Professionals
                    </span>
                  </div>
                </div>

                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="relative">
                      <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-t-[#C19A4A] border-r-[#d9b563] border-b-blue-500 border-l-[#C19A4A]/20 rounded-full animate-spin" />
                      <div className="absolute inset-0 w-12 h-12 md:w-16 md:h-16 border-4 border-[#C19A4A] rounded-full opacity-20 blur-xl animate-pulse" />
                    </div>
                  </div>
                ) : (
                  <div className="relative w-full h-full p-6 md:p-10">
                    {bubbles.map((bubble) => (
                      <motion.div
                        key={bubble.id}
                        className="absolute cursor-pointer group bubble-item"
                        style={{ top: bubble.initialPos.top, left: bubble.initialPos.left }}
                        animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
                        transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, ease: "easeInOut", delay: bubble.delay }}
                        onClick={(e) => handleBubbleInteraction(bubble, e, 'click')}
                        onMouseEnter={(e) => !isMobile && !isPinned && handleBubbleInteraction(bubble, e, 'hover')}
                        onMouseLeave={() => !isMobile && !isPinned && setSelectedBubble(null)}
                        whileHover={{ scale: 1.1 }}
                      >
                        <div className={`relative p-[2px] rounded-full bg-gradient-to-br ${selectedBubble?.id === bubble.id ? 'from-[#C19A4A] to-[#d9b563]' : 'from-white/20 to-white/5'} transition-all duration-300`}>
                          <div className="relative p-1 rounded-full bg-[#0B0F1B]">
                            <img 
                              src={bubble.img} 
                              alt="" 
                              className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 rounded-full grayscale group-hover:grayscale-0 transition-all shadow-xl" 
                            />
                          </div>
                          {/* Glow effect on hover */}
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#C19A4A] to-[#d9b563] opacity-0 group-hover:opacity-50 blur-xl transition-opacity" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

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
                        className={`z-[1002] profile-popup-card ${isMobile ? 'fixed bottom-0 left-0 right-0' : 'absolute w-[300px] md:w-[320px]'}`}
                        style={!isMobile ? { top: cardPos.top, left: cardPos.left } : {}}
                      >
                        {/* Premium card with gradient border */}
                        <div className="relative p-[2px] rounded-t-3xl md:rounded-3xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
                          <div className="relative rounded-t-[22px] md:rounded-[22px] bg-[#0B0F1B] backdrop-blur-2xl p-5 md:p-6 shadow-2xl">
                            {/* Inner glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-[#C19A4A]/10 via-transparent to-[#d9b563]/10 rounded-t-[22px] md:rounded-[22px]" />
                            
                            <button 
                              onClick={() => { setSelectedBubble(null); setIsPinned(false); }} 
                              className="absolute top-3 md:top-4 right-3 md:right-4 z-10 text-gray-400 hover:text-white transition-colors"
                            >
                              <X size={18} className="md:w-5 md:h-5" />
                            </button>
                            
                            <div className="relative flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                              <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#C19A4A] to-[#d9b563] rounded-full blur-md opacity-50" />
                                <img 
                                  src={selectedBubble.img} 
                                  className="relative w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-[#C19A4A]" 
                                  alt="" 
                                />
                              </div>
                              <div>
                                <h3 className="font-bold text-base md:text-lg bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                  {selectedBubble.name}
                                </h3>
                                <p className="text-[#C19A4A] text-xs md:text-sm uppercase font-bold tracking-tighter flex items-center gap-1">
                                  <Sparkles size={10} className="md:w-3 md:h-3" />
                                  Verified Member
                                </p>
                              </div>
                            </div>
                            
                            <p className="relative text-gray-400 text-xs md:text-sm mb-5 md:mb-6 leading-relaxed">
                              {selectedBubble.bio}
                            </p>
                            
                            <NavLink 
                              to={`/request?id=${selectedBubble.userId}`} 
                              className="relative group flex items-center justify-center gap-2 w-full py-2.5 md:py-3 bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-[#030712] font-bold rounded-xl overflow-hidden transition-all hover:shadow-[0_0_30px_rgba(193,154,74,0.4)] text-sm md:text-base"
                            >
                              <span className="relative z-10">View Full Profile</span>
                              <ArrowRight size={16} className="relative z-10 group-hover:translate-x-1 transition-transform md:w-[18px] md:h-[18px]" />
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

        /* Mobile 3D Card Adjustments */
        @media (max-width: 768px) {
          .hero-card-3d > div {
            transform: perspective(1000px) rotateY(-3deg) rotateX(1deg) translateZ(10px) !important;
          }
          .hero-card-3d ~ div {
            top: 8px !important;
            left: -10px !important;
            filter: blur(3px) !important;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;
