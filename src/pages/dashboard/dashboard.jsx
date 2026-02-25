import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, linkWalletToUser, sendOTPToEmail, verifyOTP } from '../../utils/supabaseAuth';
import { getUserProofs, getProofStats } from '../../utils/proofsApi';
import { getProfile, updateProfile } from '../../utils/profileApi';
import Header from '../../components/header/header.jsx';
import Footer from '../../components/footer/footer.jsx';
import { 
  CheckCircle2, ExternalLink, FileText, Award, Plus, Briefcase, 
  Share2, Settings, Copy, User, Clock, Wallet, Mail, X, Loader2 
} from 'lucide-react';

// ─── Gradient border wrapper — mirrors portfolio's p-[2px] card pattern ───────
// variant: 'hero'   = gold→blue full gradient  (profile card, quick actions)
//          'gold'   = full gold gradient        (verifiable stat)
//          'subtle' = faint gold fade           (total stat, section wrappers)
//          'dim'    = white/10 fade             (proof items)
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

// ─── Section heading with portfolio's gold left-bar accent ────────────────────
const SectionTitle = ({ children }) => (
  <h3 className="text-sm font-bold text-white flex items-center gap-2">
    <span className="w-1 h-4 bg-gradient-to-b from-[#C19A4A] to-[#d9b563] rounded-full shrink-0" />
    {children}
  </h3>
);

// ─── Badge ────────────────────────────────────────────────────────────────────
const Badge = ({ status }) => {
  if (status === 'Verified') {
    return (
      <span className="text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 whitespace-nowrap">
        Verified <CheckCircle2 size={10} strokeWidth={3} />
      </span>
    );
  }
  if (status === 'Pending') {
    return (
      <span className="text-[10px] font-bold text-[#C19A4A] bg-[#C19A4A]/10 border border-[#C19A4A]/20 px-2 py-0.5 rounded-full whitespace-nowrap">
        Pending
      </span>
    );
  }
  return null;
};

// ─── Profile Section ──────────────────────────────────────────────────────────
const ProfileSection = ({ user, profile, onProfileUpdate }) => {
  const navigate = useNavigate();
  const [copied, setCopied]               = useState(false);
  const [uidCopied, setUidCopied]         = useState(false);
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [emailInput, setEmailInput]       = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isLinkingWallet, setIsLinkingWallet] = useState(false);
  const [otpSent, setOtpSent]             = useState(false);
  const [otpCode, setOtpCode]             = useState('');
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

  const walletAddress    = profile?.wallet_address;
  const hasWallet        = walletAddress && walletAddress !== 'Not connected';
  const truncatedAddress = hasWallet
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : 'Not connected';

  const generateUID = useCallback((userId) => {
    if (!userId) return '000000000';
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString().padStart(9, '0').slice(0, 9);
  }, []);

  const userUID = generateUID(user?.id);

  const handleCopy = useCallback(() => {
    if (!hasWallet) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [walletAddress, hasWallet]);

  const handleUIDCopy = useCallback(() => {
    navigator.clipboard.writeText(userUID);
    setUidCopied(true);
    setTimeout(() => setUidCopied(false), 2000);
  }, [userUID]);

  const handleLinkWallet = async () => {
    setIsLinkingWallet(true);
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        if (user && address) {
          // Use linkWalletToUser from supabaseAuth to properly update the users table
          const { error } = await linkWalletToUser(user.id, address);
          if (error) throw error;
          // Also update the profile table for display purposes
          await updateProfile(user.id, { wallet_address: address });
          onProfileUpdate();
          alert('Wallet linked successfully!');
        }
      } else {
        alert('Please install Phantom or any Solana powered wallet extension.');
      }
    } catch (error) {
      console.error('Wallet linking failed:', error);
      alert('Failed to link wallet: ' + error.message);
    } finally {
      setIsLinkingWallet(false);
    }
  };

  const handleSendOTP = async () => {
    if (!emailInput || !emailInput.includes('@')) {
      alert('Please enter a valid email.');
      return;
    }
    setIsSavingEmail(true);
    try {
      await sendOTPToEmail(emailInput);
      setOtpSent(true);
      alert('OTP sent to your email. Please check your inbox.');
    } catch (error) {
      console.error('Failed to send OTP:', error);
      alert('Error sending OTP: ' + error.message);
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleVerifyOTPAndSaveEmail = async () => {
    if (!otpCode || otpCode.trim().length === 0) {
      alert('Please enter the OTP code.');
      return;
    }
    setIsVerifyingOTP(true);
    try {
      // Verify OTP with Supabase
      const { error: verifyError } = await verifyOTP(emailInput, otpCode);
      if (verifyError) throw verifyError;

      // OTP verified, now update the profile
      await updateProfile(user.id, { email: emailInput });
      onProfileUpdate();
      setIsAddingEmail(false);
      setOtpSent(false);
      setOtpCode('');
      setEmailInput('');
      alert('Email verified and saved successfully!');
    } catch (error) {
      console.error('OTP verification failed:', error);
      alert('Error verifying OTP: ' + error.message);
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  return (
    // Hero card — full gold→blue gradient border, exact same as portfolio profile card
    <GradientCard variant="hero">
      {/* Inner glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#C19A4A]/5 via-transparent to-[#d9b563]/5 rounded-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center p-5">

        {/* Avatar — portfolio-style blur glow ring */}
        <div className="relative mb-3">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#C19A4A] to-[#d9b563] blur-lg opacity-40" />
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name || 'Profile'}
              className="relative w-16 h-16 rounded-full object-cover border-2 border-[#C19A4A]"
            />
          ) : (
            <div className="relative w-16 h-16 rounded-full border-2 border-[#C19A4A] bg-[#C19A4A]/15 flex items-center justify-center">
              <User size={30} strokeWidth={1.5} className="text-[#C19A4A]" />
            </div>
          )}
        </div>

        <h2 className="text-lg font-bold text-white mb-1">
          {profile?.display_name || 'Profile Not Set'}
        </h2>
        <p className="text-xs text-gray-400 mb-5 font-light">
          {profile?.bio || 'Complete your profile'}
        </p>

        {/* Info rows — match portfolio's email/wallet pill panels */}
        <div className="w-full space-y-2 mb-6">

          {/* Wallet row */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#0B0F1B]/60 rounded-xl border border-white/5">
            <Wallet size={12} className="text-[#C19A4A] shrink-0" />
            <span className="text-[11px] text-gray-500 font-medium">Wallet</span>
            <div className="flex-1" />
            {hasWallet ? (
              <button onClick={handleCopy} className="flex items-center gap-1.5 text-gray-200 font-mono text-[11px] hover:text-[#C19A4A] transition-colors">
                {copied ? 'Copied!' : truncatedAddress}
                <Copy size={11} className={copied ? 'text-green-400' : 'text-gray-500'} />
              </button>
            ) : (
              <button
                onClick={handleLinkWallet}
                disabled={isLinkingWallet}
                className="px-2.5 py-1 bg-[#C19A4A]/10 text-[#C19A4A] border border-[#C19A4A]/20 rounded-lg text-[11px] hover:bg-[#C19A4A] hover:text-[#0B0F1B] transition-all flex items-center gap-1.5"
              >
                {isLinkingWallet ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
                Connect
              </button>
            )}
          </div>

          {/* Email row */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#0B0F1B]/60 rounded-xl border border-white/5 min-w-0">
            <Mail size={12} className="text-[#C19A4A] shrink-0" />
            <span className="text-[11px] text-gray-500 font-medium shrink-0">Email</span>
            <div className="flex-1 min-w-0" />
            {user?.email || profile?.email ? (
              <span className="text-[11px] text-gray-200 font-mono truncate max-w-[150px]">
                {user?.email || profile?.email}
              </span>
            ) : isAddingEmail ? (
              <div className="flex flex-col items-end gap-2 w-full">
                <div className="flex items-center gap-1.5 w-full justify-end">
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    disabled={otpSent}
                    className="bg-[#0B0F1B] border border-[#C19A4A]/20 text-white px-2 py-0.5 rounded text-[11px] w-40 focus:outline-none focus:border-[#C19A4A] disabled:opacity-50"
                    autoFocus
                  />
                  <button onClick={handleSendOTP} disabled={isSavingEmail || otpSent} className="text-blue-400 hover:text-blue-300">
                    {isSavingEmail ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
                  </button>
                  <button onClick={() => { setIsAddingEmail(false); setOtpSent(false); setOtpCode(''); }} className="text-gray-500 hover:text-white">
                    <X size={13} />
                  </button>
                </div>
                {otpSent && (
                  <div className="flex items-center gap-1.5 w-full justify-end">
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="bg-[#0B0F1B] border border-[#C19A4A]/20 text-white px-2 py-0.5 rounded text-[11px] w-32 focus:outline-none focus:border-[#C19A4A]"
                      maxLength="6"
                    />
                    <button onClick={handleVerifyOTPAndSaveEmail} disabled={isVerifyingOTP} className="text-green-400 hover:text-green-300">
                      {isVerifyingOTP ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} />}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAddingEmail(true)}
                className="px-2.5 py-1 bg-[#C19A4A]/10 text-[#C19A4A] border border-[#C19A4A]/20 rounded-lg text-[11px] hover:bg-[#C19A4A] hover:text-[#0B0F1B] transition-all flex items-center gap-1.5"
              >
                <Plus size={11} /> Add Email
              </button>
            )}
          </div>

          {/* UID row */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#0B0F1B]/60 rounded-xl border border-white/5">
            <User size={12} className="text-[#C19A4A] shrink-0" />
            <span className="text-[11px] text-gray-500 font-medium">UID</span>
            <div className="flex-1" />
            <button onClick={handleUIDCopy} className="flex items-center gap-1.5 text-gray-200 font-mono text-[11px] hover:text-[#C19A4A] transition-colors">
              {uidCopied ? 'Copied!' : userUID}
              <Copy size={11} className={uidCopied ? 'text-green-400' : 'text-gray-500'} />
            </button>
          </div>

          {/* Status row */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#0B0F1B]/60 rounded-xl border border-white/5">
            <span className="text-[11px] text-gray-500 font-medium">Status</span>
            <div className="flex-1" />
            <span className="text-green-400 flex items-center gap-1.5 text-[11px] font-medium">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.7)]" />
              Active
            </span>
          </div>
        </div>

        {/* Gold divider */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#C19A4A]/30 to-transparent mb-5" />

        <button
          onClick={() => navigate('/createProfile')}
          className="w-full py-3 rounded-xl border border-[#C19A4A]/50 text-[#C19A4A] text-sm font-semibold hover:bg-gradient-to-r hover:from-[#C19A4A] hover:to-[#d9b563] hover:text-[#0B0F1B] hover:border-transparent hover:shadow-[0_0_24px_rgba(193,154,74,0.35)] transition-all duration-300 active:scale-[0.98]"
        >
          {profile?.display_name ? 'Edit Profile Details' : 'Create Profile'}
        </button>
      </div>
    </GradientCard>
  );
};

// ─── Stats Row ─────────────────────────────────────────────────────────────────
const StatsRow = ({ stats }) => (
  <div className="grid grid-cols-2 gap-4">
    {/* Total Proofs — faint gold gradient border (matches portfolio) */}
    <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A]/30 to-transparent">
      <div className="bg-[#1A1F2E] rounded-xl p-4 text-center h-full">
        <div className="text-2xl font-bold text-white mb-1">{stats?.total || 0}</div>
        <div className="text-xs text-gray-400">Total Proofs</div>
      </div>
    </div>

    {/* Verifiable — full gold gradient border + gold number (matches portfolio) */}
    <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-[#C19A4A] to-[#d9b563]">
      <div className="bg-[#1A1F2E] rounded-xl p-4 text-center h-full">
        <div className="text-2xl font-bold text-[#C19A4A] mb-1">{stats?.verified || 0}</div>
        <div className="text-xs text-white">Verifiable</div>
      </div>
    </div>
  </div>
);

// ─── Proof Item ────────�����───────────────────────────────────────────────────────
const ProofItem = ({ title, type, date, status }) => (
  // dim gradient border — same as portfolio proof cards
  <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-white/10 to-transparent group">
    <div className="bg-[#111625] rounded-xl border border-white/5 hover:border-[#C19A4A]/30 group-hover:shadow-[0_0_20px_rgba(193,154,74,0.1)] transition-all duration-300 p-4 flex flex-col gap-3 cursor-pointer">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="text-sm font-semibold text-white tracking-tight truncate">{title}</h3>
          <Badge status={status} />
        </div>
        <ExternalLink size={14} className="text-gray-500 group-hover:text-[#C19A4A] transition-colors shrink-0 ml-2" />
      </div>
      <div className="flex items-center gap-4 text-[10px] text-gray-400 font-medium">
        <div className="flex items-center gap-1.5">
          {type === 'Project'
            ? <FileText size={12} className="text-[#C19A4A]" />
            : <Award   size={12} className="text-[#C19A4A]" />}
          {type}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} />
          {date}
        </div>
      </div>
    </div>
  </div>
);

// ─── Recent Proofs ─────────────────────────────────────────────────────────────
const RecentProofs = ({ proofs }) => {
  const navigate = useNavigate();
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <SectionTitle>Recent Proofs ({proofs?.length || 0})</SectionTitle>
        <button
          onClick={() => navigate('/portfolio')}
          className="text-xs text-[#C19A4A]/70 hover:text-[#C19A4A] transition-colors"
        >
          View All
        </button>
      </div>
      <div className="space-y-2.5">
        {proofs && proofs.length > 0 ? (
          proofs.map((proof) => (
            <ProofItem
              key={proof.id}
              title={proof.proof_name || proof.title || 'Untitled'}
              type={proof.proof_type || proof.type || 'Document'}
              date={new Date(proof.created_at).toLocaleDateString()}
              status={proof.status === 'verified' ? 'Verified' : 'Pending'}
            />
          ))
        ) : (
          <div className="relative p-[2px] rounded-xl bg-gradient-to-br from-white/10 to-transparent">
            <div className="bg-[#111625] rounded-xl p-6 text-center">
              <p className="text-sm text-gray-400">No proofs yet. Upload your first proof!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Action Button ─────────────────────────────────────────────────────────────
const ActionButton = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#C19A4A] to-[#d9b563] text-[#0B0F1B] p-5 rounded-xl font-semibold text-xs hover:from-[#d9b563] hover:to-[#C19A4A] hover:shadow-[0_0_24px_rgba(193,154,74,0.4)] transition-all duration-200 active:scale-[0.97] touch-manipulation"
  >
    <Icon size={22} strokeWidth={1.5} />
    <span className="tracking-wide text-center leading-tight">{label}</span>
  </button>
);

// ─── Quick Actions ─────────────────────────────────────────────────────────────
const QuickActions = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-3">
      <div className="px-1">
        <SectionTitle>Quick Actions</SectionTitle>
      </div>
      {/* Hero gradient border — same technique as portfolio's floating action bar */}
      <div className="relative p-[2px] rounded-2xl bg-gradient-to-r from-[#C19A4A] via-[#d9b563] to-blue-500">
        <div className="bg-[#111625] rounded-2xl p-5">
          <div className="grid grid-cols-2 gap-3">
            <ActionButton icon={Plus}      label="Upload New Proof" onClick={() => navigate('/upload')} />
            <ActionButton icon={Briefcase} label="View Portfolio"   onClick={() => navigate('/portfolio')} />
            <ActionButton icon={Share2}    label="Share Profile"    onClick={() => navigate('/publicProfile')} />
            <ActionButton icon={Settings}  label="Edit Profile"     onClick={() => navigate('/settingsPage')} />
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [proofs, setProofs]   = useState([]);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      console.log('[v0] Dashboard - Current user:', currentUser);
      
      if (!currentUser) {
        console.log('[v0] No user found, redirecting to login');
        setLoading(false);
        navigate('/login');
        return;
      }
      
      setUser(currentUser);
      const userProfile = await getProfile(currentUser.id);
      setProfile(userProfile);
      const userProofs = await getUserProofs(currentUser.id);
      setProofs(userProofs || []);
      const proofStats = await getProofStats(currentUser.id);
      setStats(proofStats);
    } catch (error) {
      console.error('[v0] Error loading dashboard data:', error);
      setLoading(false);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { loadDashboardData(); }, [loadDashboardData]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#0B0F1B] flex items-center justify-center mt-[105px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C19A4A] mx-auto mb-4" />
            <p className="text-gray-400 text-sm">Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div
        className="min-h-screen bg-[#0B0F1B] font-sans text-white selection:bg-[#C19A4A]/30 mt-[105px] relative overflow-hidden"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {/* Ambient blobs — identical to portfolio page */}
        <div className="fixed inset-0 opacity-30 pointer-events-none">
          <div className="absolute top-0 -left-40 w-96 h-96 bg-[#C19A4A] rounded-full mix-blend-multiply filter blur-[128px] animate-blob" />
          <div className="absolute top-0 -right-40 w-96 h-96 bg-[#d9b563] rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000" />
          <div className="absolute -bottom-40 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-4000" />
        </div>

        {/* Gold grid overlay — identical to portfolio page */}
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

        {/* Content */}
        <div className="max-w-full mx-auto min-h-screen relative z-10 flex flex-col">
          <main className="flex-1 px-5 py-6 space-y-8">
            <ProfileSection user={user} profile={profile} onProfileUpdate={loadDashboardData} />
            <StatsRow stats={stats} />
            <RecentProofs proofs={proofs} />
            <QuickActions />
          </main>
        </div>

        {/* Blob keyframes — identical to portfolio */}
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

      <Footer />
    </>
  );
}

export default Dashboard;
