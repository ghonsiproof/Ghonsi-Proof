import React, { useState, useEffect, useRef } from 'react';
import { Share2, Mail, Copy, Wallet, ExternalLink, CheckCircle2, Calendar, Link, Download, Plus, FolderGit2, Award, Flag, Trophy, ArrowLeft } from 'lucide-react';
import { getProofStats, getUserProofs } from '../../utils/proofsApi';
import { getCurrentUser } from '../../utils/supabaseAuth';
import { getProfile } from '../../utils/profileApi';
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
  const [stats, setStats] = useState({ total: 0, verified: 0 });
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [proofs, setProofs] = useState([]);

  const tabsRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const currentUser = await getCurrentUser(); // Get auth user for email
        if (currentUser) {
          setUser(currentUser);

          // Fetch profile and proofs
          const profileData = await getProfile(currentUser.id); // Get profile for display name and bio
          setProfile(profileData);

          const userProofs = await getUserProofs(currentUser.id);
          setProofs(userProofs);

          // Update stats
          const liveStats = await getProofStats(currentUser.id);
          setStats({ total: liveStats.total, verified: liveStats.verified });
        }
      } catch (err) {
        console.error('Error loading profile data:', err);
      }
    };
    loadProfileData();
  }, []);

  const copyEmail = () => {
    const emailToCopy = user?.email || "";
    if (emailToCopy) {
      navigator.clipboard.writeText(emailToCopy).then(() => {
        setEmailCopied(true);
        setTimeout(() => setEmailCopied(false), 2000);
      });
    }
  };

  // Logic to only show social links if they exist in the JSONB field
  const renderSocialLinks = () => {
    if (!profile?.social_links) return null;
    const { twitter, github, linkedin } = profile.social_links;

    return (
      <div className="flex flex-wrap gap-2">
        {twitter && (
          <a href={twitter.startsWith('http') ? twitter : `https://x.com/${twitter}`} target="_blank" rel="noreferrer" className="bg-[#0B0F1B]/50 hover:bg-white/5 border border-white/5 rounded px-2 py-1 flex items-center gap-1.5 transition-colors group">
            <span className="text-[10px] text-white">Twitter</span>
          </a>
        )}
        {github && (
          <a href={github.startsWith('http') ? github : `https://github.com/${github}`} target="_blank" rel="noreferrer" className="bg-[#0B0F1B]/50 hover:bg-white/5 border border-white/5 rounded px-2 py-1 flex items-center gap-1.5 transition-colors group">
            <span className="text-[10px] text-white">GitHub</span>
          </a>
        )}
        {linkedin && (
          <a href={linkedin.startsWith('http') ? linkedin : `https://linkedin.com/in/${linkedin}`} target="_blank" rel="noreferrer" className="bg-[#0B0F1B]/50 hover:bg-white/5 border border-white/5 rounded px-2 py-1 flex items-center gap-1.5 transition-colors group">
            <span className="text-[10px] text-white">LinkedIn</span>
          </a>
        )}
      </div>
    );
  };

  const initials = profile?.display_name
    ? profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : "??";

  const tabs = [
    { name: "All Proofs", value: "All Proofs", count: proofs.length },
    { name: "Work History", value: "job_history", count: proofs.filter(p => p.proof_type === "job_history").length },
    { name: "Certificates", value: "certificates", count: proofs.filter(p => p.proof_type === "certificates").length },
    { name: "Milestones", value: "milestones", count: proofs.filter(p => p.proof_type === "milestones").length },
    { name: "Community", value: "community", count: proofs.filter(p => p.proof_type === "community").length }
  ];

  const activeTabValue = tabs.find(tab => tab.name === activeTab)?.value || 'All Proofs';
  const filteredProofs = activeTabValue === 'All Proofs'
    ? proofs
    : proofs.filter(p => p.proof_type === activeTabValue);

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
                  {initials}
                </div>
              </div>
                
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-white mb-1">{profile?.display_name || 'Loading...'}</h1>
                <p className="text-sm text-white mb-3">{profile?.profession || ''}</p>
                <p className="text-xs text-white leading-relaxed mb-4 max-w-3xl">{profile?.bio || ''}</p>

                <div className={`grid gap-2 mb-4 ${windowWidth < 640 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2'}`}>
                  <div className="flex items-center gap-2 text-xs text-white bg-[#0B0F1B]/50 p-1.5 rounded border border-white/5 relative">
                    <Mail size={12} className="text-[#C19A4A] shrink-0" />
                    <span className="truncate">{user?.email || ''}</span>
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
                      <span className="font-mono">{profile?.users?.wallet_address || ''}</span>
                    </div>
                    <a href={`https://explorer.solana.com/address/${(profile?.users?.wallet_address || '').replace(/\.\.\./g, '')}`} target="_blank" rel="noopener noreferrer" aria-label="Open wallet address in explorer" className="text-white hover:text-[#C19A4A] transition-colors flex items-center">
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>

                {renderSocialLinks()}
              </div>
            </div>
          </div>

          {/* Right Column: Stats & Skills */}
          <div className="flex flex-col gap-4">
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1A1F2E] rounded-xl p-4 text-center border border-white/5">
                <div className="text-2xl font-bold text-white mb-1">{stats.total}</div>
                <div className="text-xs text-white">Total Proofs</div>
              </div>
              <div className="bg-[#1A1F2E] rounded-xl p-4 text-center border border-white/5">
                <div className="text-2xl font-bold text-[#C19A4A] mb-1">{stats.verified}</div>
                <div className="text-xs text-white">Verified</div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-[#111625] rounded-xl p-5 border border-white/5 flex-1">
              <h2 className="text-sm font-bold text-white mb-3">Skills & Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {(profile?.skills || []).map(skill => (
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
                <img src={proof.files?.[0]?.file_url || 'https://via.placeholder.com/400x200?text=No+Image'} alt={proof.proof_name} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111625] to-transparent"></div>
              </div>
              
              <div className="p-4 -mt-6 relative z-10 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 max-w-[calc(100%-40px)]">
                    <h3 className={`text-white font-semibold truncate ${proof.proof_name?.length > 30 ? 'text-[11px]' : 'text-[13px]'}`} title={proof.proof_name}>
                      {proof.proof_name}
                    </h3>
                    {proof.status === 'verified' && (
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
                    {proof.proof_type === 'Project' && <FolderGit2 size={14} className="text-white" />}
                    {proof.proof_type === 'Certificate' && <Award size={14} className="text-white" />}
                    {proof.proof_type === 'Milestone' && <Flag size={14} className="text-white" />}
                    {proof.proof_type === 'Achievement' && <Trophy size={14} className="text-white" />}
                    <span>{proof.proof_type}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    <span>{new Date(proof.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <p className="text-xs text-white leading-relaxed flex-1">{proof.summary}</p>

                <div className="flex flex-wrap gap-2 mb-4 mt-4">
                  <span className="text-[10px] bg-[#1A1F2E] border border-white/10 text-white px-2 py-1 rounded-md font-mono">
                    GH-{proof.proof_type?.charAt(0).toUpperCase()}-{String(proof.id).padStart(3, '0')}
                  </span>
                </div>

                <div className="border-t border-white/10 pt-3 flex items-center gap-3 mt-auto">
                  <div className="flex items-center gap-1 text-white text-xs">
                    <Link size={12} />
                    <span>On-chain verification:</span>
                  </div>
                  <a href="/" className="flex-1 bg-[#1A1F2E] border border-white/10 rounded px-2 py-1.5 flex items-center justify-between group/link hover:border-[#C19A4A]/30 transition-colors">
                    <span className="font-mono text-[#C19A4A] text-xs truncate max-w-[120px]">{proof.blockchain_tx || 'Pending...'}</span>
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
