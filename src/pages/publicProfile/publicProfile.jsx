import React, { useState, useEffect } from 'react';
import { Share2, CheckCircle2, Calendar, Award, Flag, Trophy, Link as LinkIcon, Mail, Copy, Wallet, ExternalLink, Shield } from 'lucide-react';
import { getProfileByWallet } from '../../utils/profileApi';
import { getUserProofs } from '../../utils/proofsApi';
import logo from '../../assets/ghonsi-proof-logos/transparent-png-logo/4.png';
import './publicProfile.css';

// ─── Gradient border wrapper — mirrors portfolio's p-[2px] card pattern ───────
// variant: 'hero'   = gold→blue full gradient  (profile card, verified proofs)
//          'gold'   = full gold gradient        (verified stat)
//          'subtle' = faint gold fade           (total stat, skills section)
//          'dim'    = white/10 fade             (proof cards, info pills)
const GradientCard = ({ children, variant = 'subtle', className = '', innerClassName = '' }) => {
  const gradients = {
    hero:   'bg-gradient-to-br from-[#C19A4A] via-[#d9b563] to-blue-500',
    gold:   'bg-gradient-to-br from-[#C19A4A] to-[#d9b563]',
    subtle: 'bg-gradient-to-br from-[#C19A4A]/30 to-transparent',
    dim:    'bg-gradient-to-br from-white/10 to-transparent',
  };
  return (
    <div className={`relative p-[2px] rounded-2xl ${gradients[variant]} ${className}`}>
      <div className={`bg-[#111625] rounded-2xl ${innerClassName}`}>
        {children}
      </div>
    </div>
  );
};

//Section heading with portfolio's gold left-bar accent 
const SectionTitle = ({ children }) => (
  <h2 className="text-sm font-bold text-white flex items-center gap-2">
    <span className="w-1 h-4 bg-gradient-to-b from-[#C19A4A] to-[#d9b563] rounded-full shrink-0" />
    {children}
  </h2>
);

function PublicProfile() {
  const [windowWidth, setWindowWidth]       = useState(window.innerWidth);
  const [emailCopied, setEmailCopied]       = useState(false);
  const [activeTab, setActiveTab]           = useState('All Proofs');
  const [isDragging, setIsDragging]         = useState(false);
  const [startX, setStartX]                 = useState(0);
  const [scrollLeft, setScrollLeft]         = useState(0);
  const [dynamicProfile, setDynamicProfile] = useState(null);
  const [dynamicProofs, setDynamicProofs]   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);

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
        const profileData   = await getProfileByWallet(walletFromUrl);
        setDynamicProfile(profileData);
        const allProofs      = await getUserProofs(profileData.user_id);
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
    { name: 'All Proofs',   count: dynamicProofs.length },
    { name: 'Certificate',  count: dynamicProofs.filter(p => p.proof_type === 'Certificate').length },
    { name: 'Milestone',    count: dynamicProofs.filter(p => p.proof_type === 'Milestone').length },
    { name: 'Community',    count: dynamicProofs.filter(p => p.proof_type === 'Community').length },
    { name: 'Work History', count: dynamicProofs.filter(p => p.proof_type === 'Work History').length },
  ];

  const navItemClass = windowWidth < 700 ? 'text-[9px]' : 'text-[11px]';

  const typeIcons = {
    'Project':      Trophy,
    'Certificate':  Award,
    'Milestone':    Flag,
    'Achievement':  Trophy,
    'Community':    LinkIcon,
    'Work History': Calendar,
  };

  return (
    <div
      className="min-h-screen pb-28 max-w-full mx-auto bg-[#0B0F1B] text-white selection:bg-[#C19A4A]/30 relative overflow-hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* ── Ambient blobs — identical to portfolio ──────────────────────── */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-[#C19A4A] rounded-full mix-blend-multiply filter blur-[128px] animate-blob" />
        <div className="absolute top-0 -right-40 w-96 h-96 bg-[#d9b563] rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-4000" />
      </div>

      {/* ── Gold grid overlay — identical to portfolio ──────────────────── */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(193,154,74,0.1) 1px, transparent 1px),
              linear-gradient(0deg,  rgba(193,154,74,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* ── Nav bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 md:px-8 py-3 sticky top-0 z-50 bg-[#0B0F1B]/95 backdrop-blur-sm border-b border-white/5">
        <a href="/">
          <img src={logo} alt="Logo" style={{ width: 'auto', height: '75px' }} />
        </a>
        <div className="flex items-center gap-3">
          <a href="/home"          className={`${navItemClass} text-white hover:text-[#C19A4A] transition-colors`}>Home</a>
          <a href="/publicProfile" className={`${navItemClass} text-white hover:text-[#C19A4A] transition-colors`}>Public Profile</a>
          <button className="ml-2 bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-black text-[9px] px-3 py-1.5 rounded-md font-semibold flex items-center gap-2 hover:shadow-[0_0_16px_rgba(193,154,74,0.4)] transition-all">
            <Share2 size={14} /> <span>Share</span>
          </button>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main
        className="max-w-full mx-auto px-4 relative z-10"
        style={{ paddingTop: windowWidth < 640 ? '12px' : windowWidth < 1024 ? '60px' : '30px' }}
      >

        {/* Profile Card — hero gradient border (gold→blue), same as portfolio */}
        <GradientCard variant="hero" className="mb-6">
          {/* Inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#C19A4A]/5 via-transparent to-[#d9b563]/5 rounded-2xl pointer-events-none" />

          <div className="relative z-10 p-5">
            <div className="flex gap-4 flex-wrap">

              {/* Avatar with blur glow ring — portfolio style */}
              <div className="shrink-0">
                <div className="relative" style={{ width: 64, height: 64 }}>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#C19A4A] to-[#d9b563] blur-lg opacity-40" />
                  <div className="relative w-16 h-16 rounded-full bg-[#C19A4A]/15 border-2 border-[#C19A4A] flex items-center justify-center text-[#C19A4A] text-2xl font-bold">
                    {dynamicProfile?.name
                      ? dynamicProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                      : 'AC'}
                  </div>
                </div>
              </div>

              {/* Profile info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-white mb-1">{dynamicProfile?.name || 'Loading...'}</h1>
                {dynamicProfile?.title && (
                  <p className="text-xs text-[#C19A4A] font-medium mb-2">{dynamicProfile.title}</p>
                )}
                <p className="text-xs text-gray-400 leading-relaxed mb-4">{dynamicProfile?.bio || ''}</p>

                {/* Email & wallet pills — match portfolio's info panel rows */}
                <div className={`grid gap-2 mb-4 ${windowWidth < 640 ? 'grid-cols-1' : 'grid-cols-2'}`}>

                  {/* Email pill */}
                  <div className="flex items-center gap-2 text-xs bg-[#0B0F1B]/60 px-3 py-2 rounded-xl border border-white/5 relative min-w-0">
                    <Mail size={12} className="text-[#C19A4A] shrink-0" />
                    <span className="truncate flex-1 text-gray-300">{dynamicProfile?.email || 'No email'}</span>
                    <button
                      onClick={copyEmail}
                      className="ml-1 text-gray-500 hover:text-[#C19A4A] transition-colors flex items-center bg-transparent border-none cursor-pointer shrink-0"
                    >
                      <Copy size={12} />
                    </button>
                    {emailCopied && (
                      <span className="absolute right-2 top-0 text-[10px] text-green-400 font-semibold select-none">
                        Copied!
                      </span>
                    )}
                  </div>

                  {/* Wallet pill */}
                  <div className="flex items-center gap-2 text-xs bg-[#0B0F1B]/60 px-3 py-2 rounded-xl border border-white/5 min-w-0">
                    <Wallet size={12} className="text-[#C19A4A] shrink-0" />
                    <span className="font-mono text-gray-300 truncate flex-1">
                      {dynamicProfile?.users?.wallet_address || 'Not connected'}
                    </span>
                    <a
                      href={`https://explorer.solana.com/address/${(dynamicProfile?.users?.wallet_address || '').replace(/\.\.\./g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-[#C19A4A] transition-colors shrink-0"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </GradientCard>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Total Proofs — subtle gradient border */}
          <GradientCard variant="subtle" innerClassName="p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">{dynamicProofs.length}</div>
            <div className="text-xs text-gray-400 font-medium">Total Proofs</div>
          </GradientCard>

          {/* Verified — full gold gradient border + gold number */}
          <GradientCard variant="subtle" innerClassName="relative overflow-hidden p-4 text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-[#C19A4A]/8 to-transparent rounded-2xl pointer-events-none" />
            <div className="relative text-2xl font-bold text-[#C19A4A] mb-1">{dynamicProofs.length}</div>
            <div className="relative text-xs text-white font-medium">Verified</div>
          </GradientCard>
        </div>

        {/* Skills & Expertise */}
        <GradientCard variant="subtle" className="mb-8" innerClassName="p-5">
          <div className="mb-3">
            <SectionTitle>Skills & Expertise</SectionTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            {(dynamicProfile?.skills || []).length > 0 ? (
              (dynamicProfile.skills).map(skill => (
                <span
                  key={skill}
                  className="text-xs text-[#C19A4A] bg-[#1A1F2E] border border-[#C19A4A]/20 px-3 py-1.5 rounded-full hover:bg-[#C19A4A]/10 transition-colors"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-600 italic">No skills listed</span>
            )}
          </div>
        </GradientCard>

        {/* Proof type tabs — match portfolio tab style exactly */}
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
            e.currentTarget.scrollLeft = scrollLeft - (x - startX) * 2;
          }}
        >
          {dynamicTabs.map(tab => (
            <button
              key={tab.name}
              onClick={() => !isDragging && setActiveTab(tab.name)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                activeTab === tab.name
                  ? 'bg-gradient-to-r from-[#C19A4A] to-[#d9b563] text-black shadow-[0_0_30px_rgba(193,154,74,0.3)]'
                  : 'bg-[#1A1F2E] text-white border border-white/5 hover:bg-[#252b3d] hover:border-[#C19A4A]/20'
              }`}
            >
              {tab.name}{' '}
              <span className={`ml-1 text-[10px] ${activeTab === tab.name ? 'text-black/60' : 'text-gray-400'}`}>
                ({tab.count})
              </span>
            </button>
          ))}
        </div>

        {/* Verified Proofs header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <SectionTitle>Verified Proofs</SectionTitle>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Shield size={13} className="text-[#C19A4A]" />
            <span>All proofs verified on-chain</span>
          </div>
        </div>

        {/* Proof cards */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-10 text-gray-400 text-sm">Loading profile...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-400 text-sm">Error loading profile: {error}</div>
          ) : (
            filteredProofs.map((proof, idx) => {
              const IconComponent = typeIcons[proof.proof_type] || Trophy;
              return (
                // Each proof card — dim (white/10) gradient border, same as portfolio proof cards
                <div
                  key={proof.id || idx}
                  className="relative p-[2px] rounded-2xl bg-gradient-to-br from-white/10 to-transparent group"
                >
                  <div className="bg-[#111625] rounded-2xl border border-white/5 hover:border-[#C19A4A]/30 group-hover:shadow-[0_0_30px_rgba(193,154,74,0.12)] transition-all duration-300 overflow-hidden">
                    <div className="p-4">

                      {/* Proof title + status */}
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 max-w-[calc(100%-40px)]">
                          <h3
                            className={`text-white font-semibold truncate ${proof.proof_name?.length > 30 ? 'text-[11px]' : 'text-[13px]'}`}
                            title={proof.proof_name}
                          >
                            {proof.proof_name}
                          </h3>
                          {proof.status === 'verified' && (
                            <div className="flex items-center gap-0.5 text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                              <CheckCircle2 size={11} />
                              <span className="font-medium text-[9px]">Verified</span>
                            </div>
                          )}
                        </div>
                        <button className="text-gray-500 hover:text-[#C19A4A] transition-colors shrink-0">
                          <Share2 size={15} />
                        </button>
                      </div>

                      {/* Type & date */}
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                        <div className="flex items-center gap-1.5">
                          <IconComponent size={13} className="text-[#C19A4A]" />
                          <span>{proof.proof_type}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} />
                          <span>{new Date(proof.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Summary */}
                      <p className="text-xs text-gray-400 leading-relaxed mb-4">{proof.summary}</p>

                      {/* Proof ID tag — matches portfolio's font-mono tag */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-[10px] bg-[#1A1F2E] border border-[#C19A4A]/20 text-[#C19A4A] px-2 py-1 rounded-md font-mono">
                          GH-{proof.proof_type?.charAt(0).toUpperCase()}-{String(proof.id).padStart(3, '0')}
                        </span>
                      </div>

                      {/* On-chain verification row */}
                      <div className="border-t border-white/8 pt-3 flex items-center gap-3">
                        <div className="flex items-center gap-1 text-gray-400 text-xs shrink-0">
                          <LinkIcon size={12} />
                          <span>On-chain:</span>
                        </div>
                        <a
                          href="/"
                          className="flex-1 bg-[#1A1F2E] border border-white/10 rounded-lg px-2 py-1.5 flex items-center hover:border-[#C19A4A]/30 transition-colors"
                        >
                          <span className="font-mono text-[#C19A4A] text-xs truncate max-w-[140px]">
                            {proof.tx_hash || 'Pending...'}
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {!loading && !error && filteredProofs.length === 0 && (
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-white/10 to-transparent">
              <div className="bg-[#111625] rounded-2xl py-10 text-center">
                <p className="text-sm text-gray-500">No proofs found for this category.</p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Blob animation keyframes — identical to portfolio */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25%       { transform: translate(20px, -50px) scale(1.1); }
          50%       { transform: translate(-20px, 20px) scale(0.9); }
          75%       { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}

export default PublicProfile;