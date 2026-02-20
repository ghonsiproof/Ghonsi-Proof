import React, { useState, useEffect } from 'react';
import { Eye, Users, Lightbulb, Accessibility, ChevronLeft, ChevronRight } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faLinkedinIn, faDiscord } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import Header from '../../components/header/header.jsx';
import missionDiagram from '../../assets/ghonsi-proof-logos/transparent-png-logo/Get-noticed.PNG';
import logo from '../../assets/ghonsi-proof-logos/transparent-png-logo/4.png';
import prosperImg from '../../assets/team/Prosper.png';
import godwinImg from '../../assets/team/godwin.jpg';
import progressImg from '../../assets/team/progress.png';
import nieImg from '../../assets/team/nie.jpg';
import successImg from '../../assets/team/success.jpg';
import './about.css';

function About() {
  const [activeValueSlide, setActiveValueSlide] = useState(0);
  const [currentTeamSlide, setCurrentTeamSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  useEffect(() => {
    const valueInterval = setInterval(() => {
      setActiveValueSlide((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(valueInterval);
  }, []);

  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('opacity-0', 'translate-y-[18px]');
          entry.target.classList.add('opacity-100', 'translate-y-0');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(r => obs.observe(r));
    
    return () => obs.disconnect();
  }, []);

   const teamMembers = [
    { 
      name: 'Prosper Ayere', 
      role: 'Founder & Product Lead', 
      bio: 'Prosper Ayere leads Ghonsi’s product direction and partnerships. With experience in Web3 developers, professional and ecosystem operations - she understands the trust issues with unverifiable portfolios and is driving Ghonsi’s mission to make builder records provable on-chain.', 
      image: prosperImg 
    },
    { 
      name: 'Godwin Adakonye John', 
      role: 'Blockchain Engineer', 
      bio: 'Godwin is a Solana smart contract developer skilled in Rust and Anchor. He specializes in building scalable, decentralized applications (DApps) on Solana, combining deep technical expertise with a focus on reliability and real-world usability.', 
      image: godwinImg 
    },
    { 
      name: 'Progress Ayere', 
      role: 'Lead Frontend Engineer', 
      bio: 'Progress is a front-end developer and blockchain educator specializing in clean, scalable, high-performance interfaces with HTML, CSS, JavaScript, and React. He implements UI/UX designs, shapes component architecture, and ensures a seamless user experience. He is also the co-founder of BlockChain on Campus (BCC), a student-led community driving Web3 awareness and adoption.', 
      image: progressImg 
    },
    { 
      name: 'Nie Osaoboh', 
      role: 'Product Lead', 
      bio: 'Nie is a product designer with a background in digital marketing, focused on creating simple, user-friendly experiences. He designs products that are visually appealing and easy to use, helping bring ideas to life seamlessly.', 
      image: nieImg
    },
    { 
      name: 'Success Ola-Ojo', 
      role: 'Advisor', 
      bio: 'Success aka Web3Geek, is a community builder and blockchain educator with years of experience helping top web3 brands grow strong engaged communities. He currently serves as Regional Captain for SuperteamNG North East and North West, while also supporting major projects with community strategy and growth.', 
      image: successImg 
    }
  ];
  // Define values as plain objects without JSX
  const valuesData = [
    { 
      iconName: 'Eye',
      title: 'Transparency', 
      desc: 'Making every verification provably true on-chain' 
    },
    { 
      iconName: 'Users',
      title: 'Accessibility', 
      desc: 'Building tools that empower everyone in Web3' 
    },
    { 
      iconName: 'Lightbulb',
      title: 'Innovation', 
      desc: 'Pioneering trust infrastructure for Web3' 
    },
    { 
      iconName: 'Accessibility',
      title: 'Inclusivity', 
      desc: 'Creating opportunities for all builders' 
    }
  ];

  // Helper function to render icons
  const renderIcon = (iconName) => {
    const iconSize = 32;
    switch(iconName) {
      case 'Eye':
        return <Eye size={iconSize} />;
      case 'Users':
        return <Users size={iconSize} />;
      case 'Lightbulb':
        return <Lightbulb size={iconSize} />;
      case 'Accessibility':
        return <Accessibility size={iconSize} />;
      default:
        return null;
    }
  };

  const handleNextTeamSlide = () => {
    setCurrentTeamSlide((prev) => (prev + 1) % teamMembers.length);
  };

  const handlePrevTeamSlide = () => {
    setCurrentTeamSlide((prev) => (prev - 1 + teamMembers.length) % teamMembers.length);
  };

  const handleValueSlideClick = (index) => {
    setActiveValueSlide(index);
  };

  const handleKeyboardNavigation = (e, direction) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (direction === 'next') {
        handleNextTeamSlide();
      } else if (direction === 'prev') {
        handlePrevTeamSlide();
      }
    }
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleNextTeamSlide();
    }
    if (isRightSwipe) {
      handlePrevTeamSlide();
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1B] text-white selection:bg-[#C19A4A]/30 relative overflow-hidden">
      
      {/* Background elements - matching home page */}
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
      
      <div className="max-w-full mx-auto mt-[70px] min-h-screen relative z-10">
        
        {/* About Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          id="about" 
          className="p-4 text-center max-w-[80%] my-0 mx-auto mt-[110px] relative z-10"
        >
          <div className="opacity-85 font-semibold mb-2 text-xl">
            <span className="text-[#C19A4A]">About</span>
            <span className="text-white"> Ghonsi proof</span>
          </div>
          <h1 className="text-base text-center leading-[1.4] mb-3 font-normal text-gray-300">
            We are building the essential infrastructure that makes your work and project contributions verifiable.
          </h1>
        </motion.section>

        {/* Mission Section - SHRUNKEN */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          id="mission" 
          className="m-4 p-3 max-w-5xl mx-auto relative"
          aria-labelledby="missionTitle"
        >
          <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-white/50">
            <div className="bg-white rounded-2xl p-5">
              <h2 id="missionTitle" className="text-base mb-2.5 text-[#07090d] font-bold tracking-[0.1px]">Our Mission</h2>
              <p className="text-sm leading-[1.5] text-[#222] mb-2">
                Ghonsi proof was founded on a simple, frustrating truth: the web3 talent ecosystem is broken. Genuine builders struggle to prove their value, while projects risk time and capital on unverified claims. We realized that for web3 to truly thrive, it needed a verifiable, tamper-proof professional identity layer.
              </p>
              <p className="text-sm leading-[1.5] text-[#222] mb-2">
                Our mission is to provide that layer, ensuring every contribution is permanently recorded and easily verifiable using the blockchain technology.
              </p>
              <p className="text-sm leading-[1.5] text-[#222] mb-3.5">
                We are committed to making trust a fundamental, on-chain primitive.
              </p>
              <button className="inline-flex gap-2 bg-[#C19A4A] text-[#0B0F1B] py-2 px-3 rounded-lg font-bold cursor-pointer border-none shadow-[0_6px_18px_rgba(193,154,74,0.12)] hover:bg-[#a8853b] transition-all hover:shadow-[0_8px_24px_rgba(193,154,74,0.25)] text-sm">
                Join Our Mission
              </button>
              <div className="mt-4 mb-3 p-3 min-h-[5.5rem] rounded-xl bg-gradient-to-br from-[#C19A4A]/5 to-[#d9b563]/5 border border-[#C19A4A]/20 flex justify-center items-center">
                <img src={missionDiagram} alt="Ghonsi proof mission infrastructure diagram" width="280px" className="max-w-full h-auto" />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Values Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          id="values" 
          className="py-16 px-5 text-center rounded-lg m-4 relative max-w-5xl mx-auto"
        >
          <div>
            <h2 className="text-white text-[1.875rem] mb-4 font-[Inter] font-bold">Our Values</h2>
          </div>
          <div 
            className="relative max-w-[25rem] mx-auto h-72 cursor-pointer" 
            id="valuesGallery"
            role="region"
            aria-label="Company values carousel"
            onClick={() => setActiveValueSlide((prev) => (prev + 1) % 4)}
          >
        
            {valuesData.map((value, index) => (
              <div
                key={value.title}
                className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-500 ${
                  activeValueSlide === index ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                }`}
              >
                <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] to-[#d9b563] mb-6">
                  <div className="bg-[#0B0F1B] rounded-2xl p-4 text-[#C19A4A]">
                    {renderIcon(value.iconName)}
                  </div>
                </div>
                <h3 className="text-white text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-400 text-sm max-w-[300px]">{value.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-6" role="tablist" aria-label="Values navigation">
            {valuesData.map((value, i) => (
              <button
                key={value.title}
                onClick={(e) => {
                  e.stopPropagation();
                  handleValueSlideClick(i);
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  activeValueSlide === i ? 'bg-[#C19A4A] w-8' : 'bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Show ${value.title} value`}
                aria-current={activeValueSlide === i ? 'true' : 'false'}
                role="tab"
              />
            ))}
          </div>
        </motion.section>

        {/* Team Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          id="team" 
          className="py-16 px-5 text-center rounded-lg m-4 relative"
        >
          <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A]/30 to-blue-500/30">
            <div className="bg-[#0B0F1B]/80 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
              <h2 className="text-white text-[1.875rem] mb-8 font-[Inter] font-bold">Meet Our Team</h2>
              <div className="relative max-w-[700px] mx-auto">
                <button 
                  className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-none bg-black/40 text-white cursor-pointer flex items-center justify-center z-10 transition-[background] duration-300 hover:bg-[#C19A4A] hover:text-[#0B0F1B] -left-12" 
                  id="teamPrev" 
                  onClick={handlePrevTeamSlide}
                  onKeyDown={(e) => handleKeyboardNavigation(e, 'prev')}
                  aria-label="Previous team member"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div 
                  className="overflow-hidden min-h-[400px] relative"
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
                >
                  {teamMembers.map((member, index) => (
                    <div
                      key={member.name}
                      className={`transition-all duration-500 ${
                        currentTeamSlide === index ? 'opacity-100 relative' : 'opacity-0 absolute inset-0 pointer-events-none'
                      }`}
                    >
                      <div className="p-6">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                          <div className="absolute inset-0 bg-gradient-to-br from-[#C19A4A] to-[#d9b563] rounded-full blur-xl opacity-50" />
                          <img 
                            src={member.image} 
                            alt={`${member.name}, ${member.role}`}
                            className="relative w-full h-full rounded-full border-4 border-[#C19A4A] object-cover"
                          />
                        </div>
                        <h3 className="text-white text-xl font-bold mb-2 text-center">{member.name}</h3>
                        <p className="text-[#C19A4A] text-sm font-semibold mb-4 text-center">{member.role}</p>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-full text-left">{member.bio}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button 
                  className="absolute top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-none bg-black/40 text-white cursor-pointer flex items-center justify-center z-10 transition-[background] duration-300 hover:bg-[#C19A4A] hover:text-[#0B0F1B] -right-12" 
                  id="teamNext" 
                  onClick={handleNextTeamSlide}
                  onKeyDown={(e) => handleKeyboardNavigation(e, 'next')}
                  aria-label="Next team member"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                {teamMembers.map((member, i) => (
                  <button
                    key={member.name}
                    onClick={() => setCurrentTeamSlide(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      currentTeamSlide === i ? 'bg-[#C19A4A] w-8' : 'bg-white/20 hover:bg-white/40'
                    }`}
                    aria-label={`Show ${member.name}`}
                    aria-current={currentTeamSlide === i ? 'true' : 'false'}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Journey Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          id="journey" 
          className="py-16 px-5 text-center rounded-lg m-4 relative max-w-5xl mx-auto"
        >
          <div>
            <h2 className="text-white text-[1.875rem] mb-8 font-[Inter] font-bold">Our Journey</h2>
            <p className="text-white/80 mb-8">From concept to reality here's how we're building the future of Web3 professional verification.</p>
          </div>
            <div className="grid grid-cols-[60px_30px_1fr] items-start relative mb-6">
              <div className="text-sm text-white/60">Q4 2025</div>
              <div className="relative h-full flex justify-center">
                <span className="w-2.5 h-2.5 bg-[#C19A4A] rounded-full relative z-[2]"></span>
                <span className="absolute top-[14px] left-1/2 -translate-x-1/2 w-0.5 h-[calc(100%+30px)] bg-white/20"></span>
              </div>
              <div className="pl-5">
                <div>
                  <h3 className="m-0 text-xl text-white font-bold font-[Inter] text-left">Foundation</h3>
                  <hr className="border-0 border-t border-white/15 my-2" />
                  <p className="m-0 text-white/80 text-sm leading-[1.6] text-left">Strategic partnerships and waitlist launch.</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-[60px_30px_1fr] items-start relative mb-6">
              <div className="text-sm text-white/60">Q1 2026</div>
              <div className="relative h-full flex justify-center">
                <span className="w-2.5 h-2.5 bg-[#C19A4A] rounded-full relative z-[2]"></span>
                <span className="absolute top-[14px] left-1/2 -translate-x-1/2 w-0.5 h-[calc(100%+30px)] bg-white/20"></span>
              </div>
              <div className="pl-5">
                <div>
                  <h3 className="m-0 text-xl text-white font-bold font-[Inter] text-left">MVP Launch</h3>
                  <hr className="border-0 border-t border-white/15 my-2" />
                  <p className="m-0 text-white/80 text-sm leading-[1.6] text-left">Beta and Public MVP launch (open signup & onboarding).</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-[60px_30px_1fr] items-start relative mb-6">
              <div className="text-sm text-white/60">Q2 2026</div>
              <div className="relative h-full flex justify-center">
                <span className="w-2.5 h-2.5 bg-[#C19A4A] rounded-full relative z-[2]"></span>
                <span className="absolute top-[14px] left-1/2 -translate-x-1/2 w-0.5 h-[calc(100%+30px)] bg-white/20"></span>
              </div>
              <div className="pl-5">
                <div>
                  <h3 className="m-0 text-xl text-white font-bold font-[Inter] text-left">Community Growth</h3>
                  <hr className="border-0 border-t border-white/15 my-2" />
                  <p className="m-0 text-white/80 text-sm leading-[1.6] text-left">Talent & hiring features. (job listings, applications, DMs)</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-[60px_30px_1fr] items-start relative mb-6">
              <div className="text-sm text-white/60"> Q3 2026</div>
              <div className="relative h-full flex justify-center">
                <span className="w-2.5 h-2.5 bg-[#C19A4A] rounded-full relative z-[2]"></span>
              </div>
              <div className="pl-5">
                <div>
                  <h3 className="m-0 text-xl text-white font-bold font-[Inter] text-left">Ecosystem Expansion</h3>
                  <hr className="border-0 border-t border-white/15 my-2" />
                  <p className="m-0 text-white/80 text-sm leading-[1.6] text-left">Ecosystem expansion.</p>
                </div>
              </div>
            </div>
        </motion.section>

        {/* Footer */}
        <footer className="py-[60px] px-5 bg-[#0B0F1B] text-white font-[Inter] relative z-10">
          <div className="block md:flex md:gap-[160px]">
            <div>
              <div className="text-sm opacity-70 mb-[25px] font-normal">
                <img src={logo} alt="Ghonsi proof Logo" width="90" height="90" className="mr-[2px] align-middle" />
              </div>
              <p className="max-w-[360px] text-sm leading-[1.6] opacity-90 m-0">Building the trust layer for the Web3 workforce. Prove your skills, authenticate your work, and showcase verified credentials on-chain.</p>
              <div className="flex gap-[5px] justify-start mb-5 mt-5 pt-5">
                <a href="https://x.com/Ghonsiproof" className="w-9 h-9 no-underline flex items-center justify-center text-base cursor-pointer transition-[0.3s]" aria-label="Follow us on Twitter">
                  <FontAwesomeIcon icon={faXTwitter} className="text-xl text-[#C19A4A] cursor-pointer transition-transform duration-200 hover:scale-110" />
                </a>
                <a href="https://linkedin.com" className="w-9 h-9 no-underline flex items-center justify-center text-base cursor-pointer transition-[0.3s]" aria-label="Connect on LinkedIn">
                  <FontAwesomeIcon icon={faLinkedinIn} className="text-xl text-[#C19A4A] cursor-pointer transition-transform duration-200 hover:scale-110" />
                </a>
                <a href="mailto:support@ghonsiproof.com" className="w-9 h-9 no-underline flex items-center justify-center text-base cursor-pointer transition-[0.3s]" aria-label="Email us">
                  <FontAwesomeIcon icon={faEnvelope} className="text-xl text-[#C19A4A] cursor-pointer transition-transform duration-200 hover:scale-110" />
                </a>
                <a href="https://discord.com/" className="w-9 h-9 no-underline flex items-center justify-center text-base cursor-pointer transition-[0.3s]" aria-label="Join our Discord">
                  <FontAwesomeIcon icon={faDiscord} className="text-xl text-[#C19A4A] cursor-pointer transition-transform duration-200 hover:scale-110" />
                </a>
              </div>
            </div>
            <div>
              <ul className="list-none p-0 mt-[30px] mb-0 leading-[2.1] text-sm opacity-90">
                <li><a href="/home" className="no-underline text-white cursor-pointer transition-colors duration-200 hover:text-[#C19A4A]">How It works</a></li>
                <li><a href="/about" className="no-underline text-white cursor-pointer transition-colors duration-200 hover:text-[#C19A4A]">About</a></li>
                <li><a href="/faq" className="no-underline text-white cursor-pointer transition-colors duration-200 hover:text-[#C19A4A]">FAQ</a></li>
                <li><a href="/contact" className="no-underline text-white cursor-pointer transition-colors duration-200 hover:text-[#C19A4A]">Contact</a></li>
                <li><a href="https://x.com/Ghonsiproof" className="no-underline text-white cursor-pointer transition-colors duration-200 hover:text-[#C19A4A]">Support</a></li>
                <li><a href="https://x.com/Ghonsiproof" className="no-underline text-white cursor-pointer transition-colors duration-200 hover:text-[#C19A4A]">Help Center</a></li>
                <li><a href="https://x.com/Ghonsiproof" className="no-underline text-white cursor-pointer transition-colors duration-200 hover:text-[#C19A4A]">Community</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white mt-10 pt-5 flex flex-wrap gap-[15px] justify-between text-[13px] opacity-70">
            <a href="/terms" className="text-white cursor-pointer transition-colors duration-200 hover:text-[#C19A4A] no-underline">
              Terms of Service
            </a>
            <a href="/policy" className="text-white cursor-pointer transition-colors duration-200 hover:text-[#C19A4A] no-underline">
              Privacy Policy
            </a>
            <a href="/contact" className="text-white cursor-pointer transition-colors duration-200 hover:text-[#C19A4A] no-underline">
              Contact
            </a>
            <p className="m-0 text-[13px] text-white">&copy; 2026 Ghonsi proof. All rights reserved.</p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
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
      `}</style>
    </div>
  );
}

export default About;