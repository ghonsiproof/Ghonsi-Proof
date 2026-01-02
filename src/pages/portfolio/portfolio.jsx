import React, { useState, useEffect, useRef } from 'react';
import { Share2, Mail, Copy, Wallet, ExternalLink, CheckCircle2, Calendar, Link, Download, Plus, FolderGit2, Award, Flag, Trophy, Home, User, ArrowLeft } from 'lucide-react';
import logo from '../../assets/ghonsi-proof-logos/transparent-png-logo/4.png';

// Mock components for other pages to demonstrate navigation
const PlaceholderPage = ({ title, onNavigate }) => (
  <div className="min-h-screen bg-[#0B0F1B] text-white flex flex-col items-center justify-center p-4">
    <h1 className="text-3xl font-bold text-[#C19A4A] mb-4">{title}</h1>
    <p className="mb-8 text-gray-400">This page is under construction.</p>
    <button 
      onClick={() => onNavigate('portfolio')}
      className="flex items-center gap-2 px-4 py-2 bg-[#1A1F2E] border border-white/10 rounded-lg hover:bg-[#252b3d] transition-colors"
    >
      <ArrowLeft size={16} /> Back to Portfolio
    </button>
  </div>
);

// Main Application Component that handles routing
export default function App() {
  const [currentView, setCurrentView] = useState('portfolio');

  // Simple router logic without external dependencies
  const renderView = () => {
    switch(currentView) {
      case 'portfolio':
        return <Portfolio onNavigate={setCurrentView} />;
      case 'home':
        return <PlaceholderPage title="Home Page" onNavigate={setCurrentView} />;
      case 'publicProfile':
        return <PlaceholderPage title="Public Profile" onNavigate={setCurrentView} />;
      case 'upload':
        return <PlaceholderPage title="Upload Proof" onNavigate={setCurrentView} />;
      default:
        return <Portfolio onNavigate={setCurrentView} />;
    }
  };

  return (
    <>
      <style>
        {`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
      {renderView()}
    </>
  );
}

// Portfolio Component
function Portfolio({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('All Proofs');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [emailCopied, setEmailCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const tabsRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const copyEmail = () => {
    navigator.clipboard.writeText(profile.email.replace(/\*/g, '')).then(() => {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    }).catch(() => {});
  };

  const profile = {
    name: "Alex Chen",
    title: "Senior Web3 Developer",
    bio: "Passionate Web3 developer with 5+ years of experience building decentralized applications on Solana. Specialized in DeFi protocols, smart contract security, and full-stack dApp development. Committed to advancing the Web3 ecosystem.",
    email: "alex.c***@gmail.com",
    wallet: "7x9k...mN2p",
    stats: { total: 12, verified: 8 },
    skills: ["Solana Development", "React", "Security Auditing", "Smart Contracts", "Web3.js", "Anchor Framework", "DeFi Protocols"]
  };

  const proofs = [
    {
      id: "GH-C-012",
      title: "Senior Frontend Developer Certification",
      type: "Certificate",
      date: "2024-01-15",
      description: "Advanced React and TypeScript certification from Web3 Academy. Demonstrated proficiency in modern frontend development practices, component architecture, and state management.",
      tags: ["React", "TypeScript", "Web3.js"],
      verified: true,
      hash: "0x7f9a2b8c3d4...",
      image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: "GH-M-018",
      title: "Blockchain Security Audit",
      type: "Milestone",
      date: "2023-12-20",
      description: "Completed comprehensive security audit for major DeFi protocol, identifying and resolving critical vulnerabilities. Improved protocol security by 95% and prevented potential $5M+ in losses.",
      tags: ["Security Auditing", "Smart Contracts", "DeFi"],
      verified: true,
      hash: "0x8a1b2c3d4e5...",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: "GH-P-022",
      title: "DeFi Protocol Development",
      type: "Project",
      date: "2023-11-10",
      description: "Built and deployed a yield farming protocol on Solana with $2M+ TVL. Implemented innovative tokenomics and automated market making features.",
      tags: ["Solana", "Smart Contracts", "DeFi"],
      verified: true,
      hash: "0x9b2c3d4e5f6...",
      image: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: "GH-A-011",
      title: "Web3 Hackathon Winner",
      type: "Achievement",
      date: "2023-09-15",
      description: "First place winner at Solana Global Hackathon for building an innovative NFT marketplace with cross-chain compatibility.",
      tags: ["NFTs", "Cross-chain", "Marketplace"],
      verified: true,
      hash: "0x8a1b2c3d4e5...",
      image: "https://images.unsplash.com/photo-1642104704074-907c0698b98d?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: "GH-C-007",
      title: "Rust Programming Mastery",
      type: "Certificate",
      date: "2023-08-20",
      description: "Advanced Rust programming certification focusing on systems programming and blockchain development.",
      tags: ["Rust", "Systems Programming", "Blockchain"],
      verified: true,
      hash: "0xb3d4e5f6a7b...",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: "GH-P-067",
      title: "DAO Governance Implementation",
      type: "Project",
      date: "2023-07-05",
      description: "Designed and implemented governance mechanisms for a 10,000+ member DAO, including voting systems and proposal management.",
      tags: ["DAO", "Governance", "Community"],
      verified: true,
      hash: "0x8a1b2c3d4e5...",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop"
    }
  ];

  const tabs = [
    { name: "All Proofs", count: 6 },
    { name: "Project", count: 3 },
    { name: "Certifications", count: 2 },
    { name: "Achievements", count: 1 }
  ];

  const filteredProofs = activeTab === 'All Proofs' 
    ? proofs 
    : activeTab === 'Certifications' 
      ? proofs.filter(p => p.type === 'Certificate')
      : activeTab === 'Achievements'
        ? proofs.filter(p => p.type === 'Achievement')
        : proofs.filter(p => p.type === activeTab);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - tabsRef.current.offsetLeft);
    setScrollLeft(tabsRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - tabsRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    tabsRef.current.scrollLeft = scrollLeft - walk;
  };

  const navItemClass = windowWidth < 700 ? "text-[9px]" : "text-[11px]";

  return (
    <div className="min-h-screen pb-20 w-full bg-[#0B0F1B]" style={{fontFamily: 'Inter, sans-serif'}}>
      {/* NavBar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-3 sticky top-0 z-50 bg-[#0B0F1B]/95 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('home')} className="logo bg-transparent border-none p-0 cursor-pointer">
            <img src={logo} alt="Logo" style={{width: 'auto', height: '75px'}} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('home')} className={`${navItemClass} inline text-white cursor-pointer hover:text-[#C19A4A] transition-colors bg-transparent border-none`}>
            Home
          </button>
          <button onClick={() => onNavigate('publicProfile')} className={`${navItemClass} inline text-white cursor-pointer hover:text-[#C19A4A] transition-colors bg-transparent border-none`}>
            Public Profile
          </button>
          <button className="ml-2 bg-[#C19A4A] text-black text-[9px] px-3 py-1.5 rounded-md font-semibold flex items-center gap-2 hover:bg-[#a8853b] transition-colors">
            <Share2 size={14} /> <span>Share</span>
          </button>
        </div>
      </div>

      {/* Main Content - Full width responsive container */}
      <main className="max-w-full mx-auto px-4 md:px-8" style={{paddingTop: windowWidth < 640 ? '12px' : windowWidth < 1024 ? '60px' : '30px'}}>
        
        {/* Top Section - Dispersed Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-2 bg-[#111625] rounded-2xl p-5 border border-white/5 relative overflow-hidden flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C19A4A]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

            <div className="relative z-10 flex gap-4 flex-wrap">
              <div className="shrink-0">
                <div className="w-16 h-16 rounded-full bg-[#C19A4A]/20 border border-[#C19A4A] flex items-center justify-center text-[#C19A4A] text-2xl font-bold">
                  AC
                </div>
              </div>
                
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-white mb-1">{profile.name}</h1>
                <p className="text-sm text-white mb-3">{profile.title}</p>
                <p className="text-xs text-white leading-relaxed mb-4 max-w-3xl">{profile.bio}</p>

                <div className={`grid gap-2 mb-4 ${windowWidth < 640 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'}`}>
                  <div className="flex items-center gap-2 text-xs text-white bg-[#0B0F1B]/50 p-1.5 rounded border border-white/5 relative">
                    <Mail size={12} className="text-[#C19A4A] shrink-0" />
                    <span className="truncate">{profile.email}</span>
                    <button onClick={copyEmail} aria-label="Copy email address" className="ml-2 text-white hover:text-[#C19A4A] transition-colors flex items-center" style={{background: 'transparent', border: 'none', cursor: 'pointer'}}>
                      <Copy size={14} />
                    </button>
                    {emailCopied && (
                      <span className="absolute right-1 top-0 text-[10px] text-[#22c55e] font-semibold select-none" style={{userSelect: 'none'}}>
                        Copied!
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white bg-[#0B0F1B]/50 p-1.5 rounded border border-white/5 justify-between group cursor-pointer">
                    <div className="flex items-center gap-2 truncate">
                      <Wallet size={12} className="text-[#C19A4A] shrink-0" />
                      <span className="font-mono">{profile.wallet}</span>
                    </div>
                    <a href={`https://explorer.solana.com/address/${profile.wallet.replace(/\.\.\./g, '')}`} target="_blank" rel="noopener noreferrer" aria-label="Open wallet address in explorer" className="text-white hover:text-[#C19A4A] transition-colors flex items-center">
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a href="#" className="bg-[#0B0F1B]/50 hover:bg-white/5 border border-white/5 rounded px-2 py-1 flex items-center gap-1.5 transition-colors group">
                    <svg viewBox="0 0 24 24" width={10} height={10} className="text-white group-hover:text-white">
                      <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span className="text-[10px] text-white group-hover:text-white">@alexchen_web3</span>
                  </a>
                  <a href="#" className="bg-[#0B0F1B]/50 hover:bg-white/5 border border-white/5 rounded px-2 py-1 flex items-center gap-1.5 transition-colors group">
                    <svg viewBox="0 0 24 24" width={10} height={10} className="text-white group-hover:text-white">
                      <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1. 911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <span className="text-[10px] text-white group-hover:text-white">@alexchen</span>
                  </a>
                  <a href="#" className="bg-[#0B0F1B]/50 hover:bg-white/5 border border-white/5 rounded px-2 py-1 flex items-center gap-1.5 transition-colors group">
                    <svg viewBox="0 0 24 24" width={10} height={10} className="text-white group-hover:text-white">
                      <path fill="currentColor" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                    <span className="text-[10px] text-white group-hover:text-white">@AlecChen</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Stats & Skills */}
          <div className="flex flex-col gap-4">
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1A1F2E] rounded-xl p-4 text-center border border-white/5">
                <div className="text-2xl font-bold text-white mb-1">{profile.stats.total}</div>
                <div className="text-xs text-white">Total Proofs</div>
              </div>
              <div className="bg-[#1A1F2E] rounded-xl p-4 text-center border border-white/5">
                <div className="text-2xl font-bold text-[#C19A4A] mb-1">{profile.stats.verified}</div>
                <div className="text-xs text-white">Verified</div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-[#111625] rounded-xl p-5 border border-white/5 flex-1">
              <h2 className="text-sm font-bold text-white mb-3">Skills & Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(skill => (
                  <span key={skill} className="text-xs text-[#C19A4A] bg-[#1A1F2E] border border-white/5 px-3 py-1.5 rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div 
          ref={tabsRef}
          className={`flex items-center gap-2 overflow-x-auto no-scrollbar mb-6 pb-2 select-none cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {tabs.map(tab => (
            <button 
              key={tab.name}
              onClick={() => !isDragging && setActiveTab(tab.name)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${activeTab === tab.name ? 'bg-[#C19A4A] text-black shadow-[0_0_20px_rgba(193,154,74,0.15)]' : 'bg-[#1A1F2E] text-white border border-white/5 hover:bg-[#252b3d] hover:text-gray-200'}`}
            >
              {tab.name} <span className={`ml-1 text-[10px] ${activeTab === tab.name ? 'text-black/60' : 'text-white'}`}>({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Proof Feed - Responsive Grid */}
        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-5">
          {filteredProofs.map((proof, idx) => (
            <div key={idx} className="bg-[#111625] rounded-xl border border-white/5 overflow-hidden hover:border-white/10 transition-colors group h-full flex flex-col">
              <div className="relative h-32 overflow-hidden shrink-0">
                <img src={proof.image} alt={proof.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111625] to-transparent"></div>
              </div>
              
              <div className="p-4 -mt-6 relative z-10 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 max-w-[calc(100%-40px)]">
                    <h3 className={`text-white font-semibold truncate ${proof.title.length > 30 ? 'text-[11px]' : 'text-[13px]'}`} title={proof.title}>
                      {proof.title}
                    </h3>
                    {proof.verified && (
                      <div className="flex items-center gap-0.5 text-[#22c55e] bg-[#22c55e]/10 px-1.5 py-0.5 rounded whitespace-nowrap">
                        <CheckCircle2 size={12} />
                        <span className="font-medium text-[9px]">Verified</span>
                      </div>
                    )}
                  </div>
                  <button className="text-white hover:text-white transition-colors" aria-label="Share proof">
                    <Share2 size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-2 text-xs text-white mb-3">
                  <div className="flex items-center gap-1.5">
                    {proof.type === 'Project' && <FolderGit2 size={14} className="text-white" />}
                    {proof.type === 'Certificate' && <Award size={14} className="text-white" />}
                    {proof.type === 'Milestone' && <Flag size={14} className="text-white" />}
                    {proof.type === 'Achievement' && <Trophy size={14} className="text-white" />}
                    <span>{proof.type}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>{proof.date}</span>
                  </div>
                </div>

                <p className="text-xs text-white leading-relaxed flex-1">{proof.description}</p>

                <div className="flex flex-wrap gap-2 mb-4 mt-4">
                  {proof.tags.map(tag => (
                    <span key={tag} className="text-[10px] bg-[#1A1F2E] border border-white/10 text-white px-2 py-1 rounded-md">
                      {tag}
                    </span>
                  ))}
                  <span className="text-[10px] bg-[#1A1F2E] border border-white/10 text-white px-2 py-1 rounded-md font-mono">
                    {proof.id}
                  </span>
                </div>

                <div className="border-t border-white/10 pt-3 flex items-center gap-3 mt-auto">
                  <div className="flex items-center gap-1 text-white text-xs">
                    <Link size={12} />
                    <span>On-chain verification:</span>
                  </div>
                  <a href="/" className="flex-1 bg-[#1A1F2E] border border-white/10 rounded px-2 py-1.5 flex items-center justify-between group/link hover:border-[#C19A4A]/30 transition-colors">
                    <span className="font-mono text-[#C19A4A] text-xs truncate max-w-[120px]">{proof.hash}</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
          
          {filteredProofs.length === 0 && (
            <div className="text-center py-10 text-gray-500 text-sm col-span-full">
              No proofs found for this category.
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-2 left-3 right-3 z-40">
        <div className="w-full max-w-7xl mx-auto bg-[#1C1C1C]/95 backdrop-blur-md border border-white/10 p-2 rounded-xl shadow-2xl flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-white">Ready to Build Your Portfolio?</h4>
            <p className="text-[11px] text-white truncate">Start uploading your proofs and build your on-chain reputation</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => onNavigate('upload')} className="px-3 py-2 rounded-lg border border-[#C19A4A] text-[#C19A4A] text-xs font-semibold hover:bg-[#C19A4A]/10 transition-colors flex items-center gap-1.5">
              <Download size={14} />
              <span className="hidden sm:inline">Export Portfolio</span>
              <span className="sm:hidden">Export</span>
            </button>
            <button onClick={() => onNavigate('upload')} className="px-3 py-2 rounded-lg bg-[#C19A4A] text-black text-xs font-semibold hover:bg-[#a8853b] transition-colors flex items-center gap-1.5">
              <Plus size={14} />
              <span className="hidden sm:inline">Add New Proof</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
