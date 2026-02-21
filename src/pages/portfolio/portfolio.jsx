import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, Mail, Copy, Wallet, ExternalLink, CheckCircle2, Calendar, Link, Download, Plus, FolderGit2, Award, Flag, Trophy } from 'lucide-react';
import { getProofStats, getUserProofs } from '../../utils/proofsApi';
import { getCurrentUser } from '../../utils/supabaseAuth';
import { getProfile } from '../../utils/profileApi';
import logo from '../../assets/ghonsi-proof-logos/transparent-png-logo/4.png';

export default function Portfolio() {
  const navigate = useNavigate();
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
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          const profileData = await getProfile(currentUser.id);
          setProfile(profileData);
          const userProofs = await getUserProofs(currentUser.id);
          setProofs(userProofs);
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
    { name: "Community", value: "community", count: proofs.filter(p => p.proof_type === "community").length },
    { name: "Skills", value: "skills", count: proofs.filter(p => p.proof_type === "skills").length }
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
    <div className="min-h-screen pb-20 w-full bg-[#0B0F1B] text-white selection:bg-[#C19A4A]/30 relative overflow-hidden" style={{fontFamily: 'Inter, sans-serif'}}>
      
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

      {/* NavBar */}
      <div className="flex items-center justify-between px-4 md:px-8 py-3 sticky top-0 z-50 bg-[#0B0F1B]/95 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="logo bg-transparent border-none p-0 cursor-pointer">
            <img src={logo} alt="Logo" style={{width: 'auto', height: '75px'}} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className={`${navItemClass} inline text-white cursor-pointer hover:text-[#C19A4A] transition-colors bg-transparent border-none`}>
            Home
          </button>
          <button onClick={() => navigate(`/request?id=${user?.id}`)} className={`${navItemClass} inline text-white cursor-pointer hover:text-[#C19A4A] transition-colors bg-transparent border-none`}>
            Public Profile
          </button>
          <button className="ml-2 bg-[#C19A4A] text-black text-[9px] px-3 py-1.5 rounded-md font-semibold flex items-center gap-2 hover:bg-[#a8853b] transition-colors">
            <Share2 size={14} /> <span>Share</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-full mx-auto px-4 md:px-8 relative z-10" style={{paddingTop: windowWidth < 640 ? '12px' : windowWidth < 1024 ? '60px' : '30px'}}>
        
        {/* Top Section - Profile & Stats */}
        <div 

          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-2">
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500">
              <div className="relative bg-[#111625] rounded-2xl p-6 border border-white/5">
                <div className="absolute inset-0 bg-gradient-to-br from-[#C19A4A]/5 via-transparent to-[#d9b563]/5 rounded-2xl" />
                
                <div className="flex items-start gap-6 relative z-10">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#C19A4A] to-[#d9b563] rounded-2xl blur-xl opacity-40" />
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.display_name} className="relative w-20 h-20 rounded-2xl border-2 border-[#C19A4A] object-cover" />
                    ) : (
                      <div className="relative w-20 h-20 rounded-2xl border-2 border-[#C19A4A] bg-gradient-to-br from-[#C19A4A]/20 to-[#d9b563]/20 flex items-center justify-center">
                        <span className="text-2xl font-bold text-[#C19A4A]">{initials}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {profile?.display_name || 'Anonymous User'}
                    </h1>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">{profile?.bio || 'No bio available'}</p>
                    
                    <div className="flex items-center gap-3 mb-3 text-sm">
                      <button onClick={copyEmail} className="flex items-center gap-2 text-gray-400 hover:text-[#C19A4A] transition-colors group">
                        <Mail size={16} />
                        <span className="text-xs">{emailCopied ? 'Copied!' : user?.email || 'No email'}</span>
                        <Copy size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mb-4 p-3 bg-[#0B0F1B]/50 rounded-lg border border-white/5">
                      <Wallet size={16} className="text-[#C19A4A] flex-shrink-0" />
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <code className="text-xs text-gray-400 truncate flex-1 font-mono">
                          {profile?.users?.wallet_address || 'No wallet connected'}
                        </code>
                        <a href={`https://solscan.io/account/${profile?.users?.wallet_address || ''}`} target="_blank" rel="noopener noreferrer" aria-label="Open wallet address in explorer" className="text-white hover:text-[#C19A4A] transition-colors flex items-center">
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    </div>

                    {renderSocialLinks()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Stats & Skills */}
          <div 

            className="flex flex-col gap-4"
          >
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A]/30 to-transparent">
                <div className="bg-[#1A1F2E] rounded-xl p-4 text-center border border-white/5 h-full">
                  <div className="text-2xl font-bold text-white mb-1">{stats.verified}</div>
                  <div className="text-xs text-gray-400">Total Proofs</div>
                </div>
              </div>
              <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A] to-[#d9b563]">
                <div className="bg-[#1A1F2E] rounded-xl p-4 text-center h-full">
                  <div className="text-2xl font-bold text-[#C19A4A] mb-1">{stats.verified}</div>
                  <div className="text-xs text-white">Achievements</div>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-white/10 to-transparent flex-1">
              <div className="bg-[#111625] rounded-xl p-5 border border-white/5 h-full">
                <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <span className="w-1 h-4 bg-gradient-to-b from-[#C19A4A] to-[#d9b563] rounded-full" />
                  Skills & Expertise
                </h2>
                <div className="flex flex-wrap gap-2">
                  {(profile?.skills || []).map(skill => (
                    <span key={skill} className="text-xs text-[#C19A4A] bg-[#1A1F2E] border border-[#C19A4A]/20 px-3 py-1.5 rounded-full hover:bg-[#C19A4A]/10 transition-colors">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Tabs */}
        <div

        >
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
                className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  activeTab === tab.name 
                    ? 'bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-black shadow-[0_0_30px_rgba(193,154,74,0.3)]' 
                    : 'bg-[#1A1F2E] text-white border border-white/5 hover:bg-[#252b3d] hover:text-gray-200 hover:border-[#C19A4A]/20'
                }`}
              >
                {tab.name} <span className={`ml-1 text-[10px] ${activeTab === tab.name ? 'text-black/60' : 'text-gray-400'}`}>({tab.count})</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Proof Feed */}
        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-5">
          {filteredProofs.map((proof, idx) => (
            <div
              key={idx}

              className="group"
            >
              <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-white/10 to-transparent h-full">
                <div className="bg-[#111625] rounded-2xl border border-white/5 overflow-hidden hover:border-[#C19A4A]/30 transition-all duration-300 h-full flex flex-col group-hover:shadow-[0_0_30px_rgba(193,154,74,0.15)]">
                  <div className="relative h-32 overflow-hidden shrink-0">
                    <img 
                      src={proof.files?.[0]?.file_url || 'https://via.placeholder.com/400x200?text=No+Image'} 
                      alt={proof.proof_name} 
                      className="w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500" 
                    />
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
                      <button className="text-gray-400 hover:text-[#C19A4A] transition-colors" aria-label="Share proof">
                        <Share2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                      <div className="flex items-center gap-1.5">
                        {proof.proof_type === 'Project' && <FolderGit2 size={14} className="text-[#C19A4A]" />}
                        {proof.proof_type === 'Certificate' && <Award size={14} className="text-[#C19A4A]" />}
                        {proof.proof_type === 'Milestone' && <Flag size={14} className="text-[#C19A4A]" />}
                        {proof.proof_type === 'Achievement' && <Trophy size={14} className="text-[#C19A4A]" />}
                        <span>{proof.proof_type}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>{new Date(proof.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-400 leading-relaxed flex-1 line-clamp-2">{proof.summary}</p>

                    <div className="flex flex-wrap gap-2 mb-4 mt-4">
                      <span className="text-[10px] bg-[#1A1F2E] border border-[#C19A4A]/20 text-[#C19A4A] px-2 py-1 rounded-md font-mono">
                        GH-{proof.proof_type?.charAt(0).toUpperCase()}-{String(proof.id).padStart(3, '0')}
                      </span>
                    </div>

                    <div className="border-t border-white/10 pt-3 flex items-center gap-3 mt-auto">
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <Link size={12} />
                        <span>On-chain:</span>
                      </div>
                      <a href="/" className="flex-1 bg-[#1A1F2E] border border-white/10 rounded px-2 py-1.5 flex items-center justify-between group/link hover:border-[#C19A4A]/30 transition-colors">
                        <span className="font-mono text-[#C19A4A] text-xs truncate max-w-[120px]">{proof.blockchain_tx || 'Pending...'}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {filteredProofs.length === 0 && (
            <div className="text-center py-10 text-gray-500 text-sm col-span-full">
              No proofs found for this category.
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Bar */}
      <div

        className="fixed bottom-2 left-3 right-3 z-40"
      >
        <div className="w-full max-w-7xl mx-auto relative p-[2px] rounded-xl bg-gradient-to-r from-[#C19A4A] via-[#d9b563] to-blue-500">
          <div className="bg-[#1C1C1C]/95 backdrop-blur-md border border-white/10 p-2 rounded-xl shadow-2xl flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-white">Ready to Build Your Portfolio?</h4>
              <p className="text-[11px] text-gray-400 truncate">Start uploading your proofs and build your on-chain reputation</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => navigate('/upload')} className="px-3 py-2 rounded-lg border border-[#C19A4A] text-[#C19A4A] text-xs font-semibold hover:bg-[#C19A4A]/10 transition-colors flex items-center gap-1.5">
                <Download size={14} />
                <span className="hidden sm:inline">Export Portfolio</span>
                <span className="sm:hidden">Export</span>
              </button>
              <button onClick={() => navigate('/upload')} className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-black text-xs font-semibold hover:shadow-[0_0_20px_rgba(193,154,74,0.4)] transition-all flex items-center gap-1.5">
                <Plus size={14} />
                <span className="hidden sm:inline">Add New Proof</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

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

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
