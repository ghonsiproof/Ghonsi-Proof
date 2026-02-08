import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Wallet, Shield, Upload, X, ArrowRight } from 'lucide-react';
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
              let top = Math.random() * 75 + 15; // 15% to 90%
              let left = Math.random() * 80 + 10; // 10% to 90%

              // Subtle avoidance: if bubble is in the top center 20% area, nudge it down
              if (top < 25 && left > 40 && left < 60) {
                top += 15;
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
            // Fallback: return a random position if no valid position found
            return { top: Math.random() * 75 + 15, left: Math.random() * 80 + 10 };
          };

          const formatted = [];
          const existingPositions = [];
          const minDistance = 10; // Minimum distance in percentage

          data.forEach((profile, index) => {
            const pos = getValidPosition(existingPositions, minDistance);
            existingPositions.push(pos);

            formatted.push({
              name: profile.display_name || 'Anonymous',
              bio: profile.bio || 'Web3 Professional',
              img: profile.avatar_url || logo1,
              wallet: profile.users?.wallet_address || '',
              id: profile.id,
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

    // Keep popup within container boundaries
    leftPosition = Math.max(10, Math.min(leftPosition, containerRect.width - popupWidth - 10));
    topPosition = Math.max(10, Math.min(topPosition, containerRect.height - popupHeight - 10));

    setCardPos({ top: topPosition, left: leftPosition });
    setSelectedBubble(bubble);
  };

  return (
    <div className="min-h-screen bg-[#0B0F1B] text-white font-sans selection:bg-[#C19A4A]/30">
      <Header />
      <NotificationWidget />

      <main className="pt-24">
        {/* HERO SECTION */}
        <section className="relative px-6 py-12 text-center max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-7xl font-bold tracking-tighter leading-tight mb-6">
              Prove what you've <span className="text-[#C19A4A] drop-shadow-[0_0_15px_rgba(193,154,74,0.3)]">built.</span>
              <br />
              <span className="text-gray-400">Unlock your potential.</span>
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Ghonsi Proof is the on-chain trust engine for the Web3 workforce. 
              Verify your work history and store your portfolio on the blockchain.
            </p>
          </motion.div>
        </section>

        {/* BUBBLE EXPLORER */}
        <section className="relative h-[600px] md:h-[700px] mx-4 border border-white/5 rounded-[2rem] bg-gradient-to-b from-white/[0.02] to-transparent bubbles-section overflow-visible mb-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#C19A4A10_0%,transparent_70%)]" />

          <p className="absolute top-8 left-1/2 -translate-x-1/2 z-20 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-[#C19A4A] text-xs font-bold uppercase tracking-widest whitespace-nowrap">
            Explore Verified Professionals
          </p>

          {loading ? (
             <div className="flex h-full items-center justify-center">
                <div className="w-12 h-12 border-4 border-t-[#C19A4A] border-white/10 rounded-full animate-spin" />
             </div>
          ) : (
            <div className="relative w-full h-full p-10">
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
                >
                  <div className={`relative p-1 rounded-full transition-all duration-300 ${selectedBubble?.id === bubble.id ? 'ring-4 ring-[#C19A4A]' : 'ring-2 ring-white/10'}`}>
                    <img src={bubble.img} alt="" className="w-12 h-12 md:w-16 md:h-16 rounded-full grayscale hover:grayscale-0 transition-all shadow-xl" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <AnimatePresence>
            {selectedBubble && (
              <>
                {isMobile && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedBubble(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1001]" />
                )}
                <motion.div
                  initial={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.9 }}
                  animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1 }}
                  exit={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.9 }}
                  className={`bg-[#0B0F1B]/95 backdrop-blur-2xl border border-[#C19A4A]/30 p-6 z-[1002] shadow-2xl profile-popup-card ${isMobile ? 'fixed bottom-0 left-0 right-0 rounded-t-3xl' : 'absolute rounded-2xl w-[300px]'}`}
                  style={!isMobile ? { top: cardPos.top, left: cardPos.left } : {}}
                >
                  <button onClick={() => { setSelectedBubble(null); setIsPinned(false); }} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
                  <div className="flex items-center gap-4 mb-4">
                    <img src={selectedBubble.img} className="w-16 h-16 rounded-full border-2 border-[#C19A4A]" alt="" />
                    <div>
                        <h3 className="font-bold text-lg">{selectedBubble.name}</h3>
                        <p className="text-[#C19A4A] text-sm uppercase font-bold tracking-tighter">Verified Member</p>
                    </div>
                  </div>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">{selectedBubble.bio}</p>
                  <NavLink to={`/request?wallet=${selectedBubble.wallet}`} className="flex items-center justify-center gap-2 w-full py-3 bg-[#C19A4A] text-[#030712] font-bold rounded-xl hover:bg-[#d9b563] transition-all">
                    View Full Profile <ArrowRight size={18} />
                  </NavLink>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </section>

        {/* FEATURES GRID */}
        <section className="max-w-6xl mx-auto px-6 pb-32">
            <div className="grid md:grid-cols-3 gap-6">
                {[
                    { 
                      title: "On-Chain Identity", 
                      icon: <Wallet size={32}/>, 
                      desc: "Aggregate your scattered contributions into one verifiable ID." 
                    },
                    { 
                      title: "Proof of Work", 
                      icon: <Shield size={32}/>, 
                      desc: "No more fake resumes. Your history is backed by the blockchain." 
                    },
                    { 
                      title: "Talent Discovery", 
                      icon: <Upload size={32}/>, 
                      desc: "Founders find you based on what you have actually built."
                    }
                ].map((item, i) => (
                    <div key={i} className="p-10 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors group">
                        <div className="flex flex-col items-center mb-6">
                            <div className="text-[#C19A4A] mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
                            <h4 className="text-xl font-bold mb-3 text-center">{item.title}</h4>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed text-center">{item.desc}</p>
                    </div>
                ))}
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Home;