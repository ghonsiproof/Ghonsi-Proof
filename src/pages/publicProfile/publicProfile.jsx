import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Share2, CheckCircle2, Calendar, Award, Flag, Trophy, Link as LinkIcon, Mail, Copy, Wallet, ExternalLink, Shield } from 'lucide-react';
import { getProfileByWallet } from '../../utils/profileApi';
import { getUserProofs } from '../../utils/proofsApi';
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
  const [dynamicProfile, setDynamicProfile] = useState(null);
  const [dynamicProofs, setDynamicProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const walletFromUrl = window.location.pathname.split('/').pop();
        const profileData = await getProfileByWallet(walletFromUrl);
        
        if (!profileData) {
          setError('Profile not found');
          setLoading(false);
          return;
        }
        
        setDynamicProfile(profileData);

        const allProofs = await getUserProofs(profileData.user_id);
        const verifiedProofs = allProofs.filter(proof => proof.status === 'verified');
        setDynamicProofs(verifiedProofs);
      } catch (err) {
        setError(err.message);
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const copyEmail = () => {
    const emailToCopy = dynamicProfile?.email || '';
    navigator.clipboard.writeText(emailToCopy.replace(/\*/g, ''));
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const filteredProofs = activeTab === 'All Proofs'
    ? dynamicProofs
    : dynamicProofs.filter(p => p.proof_type === activeTab);

  const dynamicTabs = [
    { name: "All Proofs", count: dynamicProofs.length },
    { name: "Certificate", count: dynamicProofs.filter(p => p.proof_type === 'Certificate').length },
    { name: "Milestone", count: dynamicProofs.filter(p => p.proof_type === 'Milestone').length },
    { name: "Community", count: dynamicProofs.filter(p => p.proof_type === 'Community').length },
    { name: "Work History", count: dynamicProofs.filter(p => p.proof_type === 'Work History').length }
  ];

  const navItemClass = windowWidth < 700 ? "text-[9px]" : "text-[11px]";

  const typeIcons = {
    'Project': Trophy,
    'Certificate': Award,
    'Milestone': Flag,
    'Achievement': Trophy,
    'Community': LinkIcon,
    'Work History': Calendar
  };

  return (
    <div className="min-h-screen pb-28 max-w-full mx-auto bg-[#0B0F1B] border-x border-white/5 text-white font-sans selection:bg-[#C19A4A] selection:text-[#0B0F1B]">
      
      {loading && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#C19A4A]"></div>
            <p className="mt-4 text-[#C19A4A]">Loading profile...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-400 text-lg">Error: {error}</p>
            <button onClick={() => window.history.back()} className="mt-4 bg-[#C19A4A] text-black px-4 py-2 rounded-lg hover:bg-[#a8853b] transition-colors">Go Back</button>
          </div>
        </div>
      )}
      
      {!loading && !error && dynamicProfile && (
      <>
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

      <main className="max-w-full mx-auto px-4" style={{paddingTop: windowWidth < 640 ? '12px' : windowWidth < 1024 ? '60px' : '30px'}}>
        <div className="bg-[#111625] rounded-2xl p-5 border border-white/5 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#C19A4A]/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

          <div className="relative z-10 flex gap-4 flex-wrap">
            <div className="shrink-0">
              <div className="w-16 h-16 rounded-full bg-[#C19A4A]/20 border border-[#C19A4A] flex items-center justify-center text-[#C19A4A] text-2xl font-bold">
                AC
              </div>
            </div>
              
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white mb-1">{dynamicProfile?.name || 'Loading...'}</h1>
              <p className="text-sm text-white mb-3">{dynamicProfile?.title || ''}</p>
              <p className="text-xs text-white leading-relaxed mb-4">{dynamicProfile?.bio || ''}</p>

              <div className={`grid gap-2 mb-4 ${windowWidth < 640 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
                <div className="flex items-center gap-2 text-xs text-white bg-[#0B0F1B]/50 p-1.5 rounded border border-white/5 relative">
                  <Mail size={12} className="text-[#C19A4A] shrink-0" />
                  <span className="truncate">{dynamicProfile?.email || ''}</span>
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
                    <span className="font-mono">{dynamicProfile?.users?.wallet_address || ''}</span>
                  </div>
                  <a href={`https://explorer.solana.com/address/${(dynamicProfile?.users?.wallet_address || '').replace(/\.\.\./g, '')}`} target="_blank" rel="noopener noreferrer" className="text-white hover:text-[#C19A4A] transition-colors flex items-center">
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
            <div className="text-2xl font-bold text-white mb-1">{dynamicProofs.length}</div>
            <div className="text-xs text-white">Total Proofs</div>
          </div>
          <div className="bg-[#1A1F2E] rounded-xl p-4 text-center border border-white/5">
            <div className="text-2xl font-bold text-[#C19A4A] mb-1">{dynamicProofs.length}</div>
            <div className="text-xs text-white">Verified</div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-sm font-bold text-white mb-3">Skills & Expertise</h2>
          <div className="flex flex-wrap gap-2">
            {(dynamicProfile?.skills || []).map(skill => (
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
          {dynamicTabs.map(tab => (
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
          {loading ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              Loading profile...
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-400 text-sm">
              Error loading profile: {error}
            </div>
          ) : (
            filteredProofs.map((proof, idx) => {
              const IconComponent = typeIcons[proof.proof_type] || Trophy;
              return (
                <div key={proof.id || idx} className="bg-[#111625] rounded-xl border border-white/5 overflow-hidden mb-5 hover:border-white/10 transition-colors group">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2 max-w-[calc(100%-40px)]">
                        <h3 className={`text-white font-semibold truncate ${proof.proof_name?.length > 30 ? 'text-[11px]' : 'text-[13px]'}`} title={proof.proof_name}>
                          {proof.proof_name}
                        </h3>
                        {proof.status === 'verified' && (
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
                        <span>{proof.proof_type}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>{new Date(proof.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <p className="text-xs text-white leading-relaxed mb-4">{proof.summary}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="text-[10px] bg-[#1A1F2E] border border-white/10 text-white px-2 py-1 rounded-md font-mono">
                        GH-{proof.proof_type?.charAt(0).toUpperCase()}-{String(proof.id).padStart(3, '0')}
                      </span>
                    </div>

                    <div className="border-t border-white/10 pt-3 flex items-center gap-3">
                      <div className="flex items-center gap-1 text-white text-xs">
                        <LinkIcon size={12} />
                        <span>On-chain verification:</span>
                      </div>
                      <a href="/" className="flex-1 bg-[#1A1F2E] border border-white/10 rounded px-2 py-1.5 flex items-center justify-between group/link hover:border-[#C19A4A]/30 transition-colors">
                        <span className="font-mono text-[#C19A4A] text-xs truncate max-w-[120px]">{proof.tx_hash || 'Pending...'}</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {!loading && !error && filteredProofs.length === 0 && (
            <div className="text-center py-10 text-gray-500 text-sm">
              No proofs found for this category.
            </div>
          )}
        </div>
      </main>
      </>
      )}
    </div>
  );
}

export default PublicProfile;
