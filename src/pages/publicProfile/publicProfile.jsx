import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, CheckCircle2, Calendar, Award, Flag, Trophy, Link as LinkIcon, Mail, Copy, Wallet, ExternalLink, Shield } from 'lucide-react';
import logo from '../../assets/ghonsi-proof-logos/transparent-png-logo/4.png';
import './publicProfile.css';

function PublicProfile () {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [emailCopied, setEmailCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('All Proofs');
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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
      description: "Advanced React and TypeScript certification from Web3 Academy. ",
      tags: ["React", "TypeScript", "Web3.js"],
      verified: true,
      hash: "0x7f9a2b8c3d4..."
    },
    {
      id: "GH-M-018",
      title: "Blockchain Security Audit",
      type: "Milestone",
      date: "2023-12-20",
      description: "Completed comprehensive security audit for major DeFi protocol, identifying and resolving critical vulnerabilities.",
      tags: ["Security Auditing", "Smart Contracts", "DeFi"],
      verified: true,
      hash: "0x8a1b2c3d4e5..."
    },
    {
      id: "GH-P-022",
      title: "DeFi Protocol Development",
      type: "Project",
      date: "2023-11-10",
      description: "Built and deployed a yield farming protocol on Solana with $2M+ TVL.",
      tags: ["Solana", "Smart Contracts", "DeFi"],
      verified: true,
      hash: "0x9b2c3d4e5f6..."
    },
    {
      id: "GH-A-011",
      title: "Web3 Hackathon Winner",
      type: "Achievement",
      date: "2023-09-15",
      description: "First place winner at Solana Global Hackathon for building an innovative NFT marketplace with cross-chain compatibility.",
      tags: ["NFTs", "Cross-chain", "Marketplace"],
      verified: true,
      hash: "0x8a1b2c3d4e5..."
    },
    {
      id: "GH-C-007",
      title: "Rust Programming Mastery",
      type: "Certificate",
      date: "2023-08-20",
      description: "Advanced Rust programming certification focusing on systems programming and blockchain development.",
      tags: ["Rust", "Systems Programming", "Blockchain"],
      verified: true,
      hash: "0xb3d4e5f6a7b..."
    },
    {
      id: "GH-P-067",
      title: "DAO Governance Implementation",
      type: "Project",
      date: "2023-07-05",
      description: "Designed and implemented governance mechanisms for a 10,000+ member DAO, including voting systems and proposal management.",
      tags: ["DAO", "Governance", "Community"],
      verified: true,
      hash: "0x8a1b2c3d4e5..."
    }
  ];

  const tabs = [
    { name: "All Proofs", count: 6 },
    { name: "Project", count: 3 },
    { name: "Certifications", count: 2 },
    { name: "Achievements", count: 1 }
  ];

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const copyEmail = () => {
    navigator.clipboard.writeText(profile.email.replace(/\*/g, ''));
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const filteredProofs = activeTab === 'All Proofs' 
    ? proofs 
    : activeTab === 'Certifications' 
      ? proofs.filter(p => p.type === 'Certificate')
      : activeTab === 'Achievements'
        ? proofs.filter(p => p.type === 'Achievement')
        : proofs.filter(p => p.type === activeTab);

  const navItemClass = windowWidth < 700 ? "text-[9px]" : "text-[11px]";

  const typeIcons = {
    'Project': Trophy,
    'Certificate': Award,
    'Milestone': Flag,
    'Achievement': Trophy
  };

  return (
    <div className="min-h-screen pb-28 max-w-xl mx-auto bg-[#0B0F1B] border-x border-white/5 text-white font-sans selection:bg-[#C19A4A] selection:text-[#0B0F1B]">
      
      <div className="flex items-center justify-between px-4 py-3 sticky top-0 z-50 bg-[#0B0F1B]/95 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-3">
          <a href="/" className="logo">
            <img src={logo} alt="Logo" style={{width: 'auto', height: '75px'}} />
          </a>
        </div>
        <div className="flex items-center gap-3">
          <span className={`${navItemClass} inline text-white cursor-pointer hover:text-[#C19A4A] transition-colors`}><a href="/home">Home</a></span>
          <span className={`${navItemClass} inline text-white cursor-pointer hover:text-[#C19A4A] transition-colors`}><a href="/publicProfile" >Public Profile</a></span>
          <button className="ml-2 bg-[#C19A4A] text-black text-[9px] px-3 py-1.5 rounded-md font-semibold flex items-center gap-2 hover:bg-[#a8853b] transition-colors">
            <Share2 size={14} /> <span>Share</span>
          </button>
        </div>
      </div>

      <main className="max-w-xl mx-auto px-4" style={{paddingTop: windowWidth < 640 ? '12px' : windowWidth < 1024 ? '60px' : '30px'}}>
        <div className="bg-[#111625] rounded-2xl p-5 border border-white/5 mb-6 relative overflow-hidden">
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
              <p className="text-xs text-white leading-relaxed mb-4">{profile.bio}</p>

              <div className={`grid gap-2 mb-4 ${windowWidth < 640 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
                <div className="flex items-center gap-2 text-xs text-white bg-[#0B0F1B]/50 p-1.5 rounded border border-white/5 relative">
                  <Mail size={12} className="text-[#C19A4A] shrink-0" />
                  <span className="truncate">{profile.email}</span>
                  <button onClick={copyEmail} className="ml-2 text-white hover:text-[#C19A4A] transition-colors flex items-center bg-transparent border-none cursor-pointer">
                    <Copy size={14} />
                  </button>
                  {emailCopied && (
                    <span className="absolute right-1 top-0 text-[10px] text-green-500 font-semibold select-none">
                      Copied!
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-white bg-[#0B0F1B]/50 p-1.5 rounded border border-white/5 justify-between group cursor-pointer">
                  <div className="flex items-center gap-2 truncate">
                    <Wallet size={12} className="text-[#C19A4A] shrink-0" />
                    <span className="font-mono">{profile.wallet}</span>
                  </div>
                  <a href={`https://explorer.solana.com/address/${profile.wallet.replace(/\.\.\./g, '')}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#C19A4A] transition-colors flex items-center">
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>

              <div className="mt-4">
                <button onClick={() => navigate('/request')} className="bg-[#C19A4A] hover:bg-[#a8853b] text-black px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg shadow-yellow-900/10">
                  Request Portfolio
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#1A1F2E] rounded-xl p-4 text-center border border-white/5">
            <div className="text-2xl font-bold text-white mb-1">{profile.stats.total}</div>
            <div className="text-xs text-white">Total Proofs</div>
          </div>
          <div className="bg-[#1A1F2E] rounded-xl p-4 text-center border border-white/5">
            <div className="text-2xl font-bold text-[#C19A4A] mb-1">{profile.stats.verified}</div>
            <div className="text-xs text-white">Verified</div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-bold text-white mb-3">Skills & Expertise</h2>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map(skill => (
              <span key={skill} className="text-xs text-[#C19A4A] bg-[#1A1F2E] border border-white/5 px-3 py-1.5 rounded-full">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div 
          className={`flex items-center gap-2 overflow-x-auto no-scrollbar mb-6 pb-2 select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={(e) => {
            setIsDragging(true);
            setStartX(e.pageX - e.currentTarget.offsetLeft);
            setScrollLeft(e.currentTarget.scrollLeft);
          }}
          onMouseLeave={() => setIsDragging(false)}
          onMouseUp={() => setIsDragging(false)}
          onMouseMove={(e) => {
            if (!isDragging) return;
            e.preventDefault();
            const x = e.pageX - e.currentTarget.offsetLeft;
            const walk = (x - startX) * 2;
            e.currentTarget.scrollLeft = scrollLeft - walk;
          }}
        >
          {tabs.map(tab => (
            <button 
              key={tab.name}
              onClick={() => !isDragging && setActiveTab(tab.name)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                activeTab === tab.name 
                  ? 'bg-[#C19A4A] text-black shadow-[0_0_20px_rgba(193,154,74,0.15)]' 
                  : 'bg-[#1A1F2E] text-white border border-white/5 hover:bg-[#252b3d] hover:text-gray-200'
              }`}
            >
              {tab.name} <span className={`ml-1 text-[10px] ${activeTab === tab.name ? 'text-black/60' : 'text-white'}`}>({tab.count})</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white">Verified Proofs</h2>
          <div className="flex items-center gap-1.5 text-xs text-white">
            <Shield size={14} />
            <span>All proofs are verified on-chain</span>
          </div>
        </div>

        <div className="space-y-4">
          {filteredProofs.map((proof, idx) => {
            const IconComponent = typeIcons[proof.type] || Trophy;
            return (
              <div key={idx} className="bg-[#111625] rounded-xl border border-white/5 overflow-hidden mb-5 hover:border-white/10 transition-colors group">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 max-w-[calc(100%-40px)]">
                      <h3 className={`text-white font-semibold truncate ${proof.title.length > 30 ? 'text-[11px]' : 'text-[13px]'}`} title={proof.title}>
                        {proof.title}
                      </h3>
                      {proof.verified && (
                        <div className="flex items-center gap-0.5 text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded whitespace-nowrap">
                          <CheckCircle2 size={12} />
                          <span className="font-medium text-[9px]">Verified</span>
                        </div>
                      )}
                    </div>
                    <button className="text-white hover:text-white transition-colors">
                      <Share2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-white mb-3">
                    <div className="flex items-center gap-1.5">
                      <IconComponent size={14} className="text-white" />
                      <span>{proof.type}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      <span>{proof.date}</span>
                    </div>
                  </div>

                  <p className="text-xs text-white leading-relaxed mb-4">{proof.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {proof.tags.map(tag => (
                      <span key={tag} className="text-[10px] bg-[#1A1F2E] border border-white/10 text-white px-2 py-1 rounded-md">
                        {tag}
                      </span>
                    ))}
                    <span className="text-[10px] bg-[#1A1F2E] border border-white/10 text-white px-2 py-1 rounded-md font-mono">
                      {proof.id}
                    </span>
                  </div>

                  <div className="border-t border-white/10 pt-3 flex items-center gap-3">
                    <div className="flex items-center gap-1 text-white text-xs">
                      <LinkIcon size={12} />
                      <span>On-chain verification:</span>
                    </div>
                    <a href="/" className="flex-1 bg-[#1A1F2E] border border-white/10 rounded px-2 py-1.5 flex items-center justify-between group/link hover:border-[#C19A4A]/30 transition-colors">
                      <span className="font-mono text-[#C19A4A] text-xs truncate max-w-[120px]">{proof.hash}</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
            
          {filteredProofs.length === 0 && (
            <div className="text-center py-10 text-gray-500 text-sm">
              No proofs found for this category.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default PublicProfile;
