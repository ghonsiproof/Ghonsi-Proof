import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// FIX: Removed 'supabase' and added 'updateUserEmail'
import { getCurrentUser, updateUserEmail } from '../../utils/supabaseAuth'; 
import { getUserProofs, getProofStats } from '../../utils/proofsApi';
import { getProfile, updateProfile } from '../../utils/profileApi';
import { useWallet } from '../../hooks/useWallet';
import Header from '../../components/header/header.jsx';
import Footer from '../../components/footer/footer.jsx';
import { 
  CheckCircle2, ExternalLink, FileText, Award, Plus, Briefcase, 
  Share2, Settings, Copy, User, Clock, Wallet, Mail, Save, X, Loader2 
} from 'lucide-react';

const Card = ({ children, className = "" }) => (
  <div className={`bg-[#151925] rounded-2xl p-5 border border-white/5 ${className}`}>
    {children}
  </div>
);

const Badge = ({ status }) => {
  if (status === 'Verified') {
    return (
      <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
        Verified <CheckCircle2 size={10} strokeWidth={3} />
      </span>
    );
  }
  if (status === 'Pending') {
    return (
      <span className="text-[10px] font-bold text-[#C19A4A] bg-[#C19A4A]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
        Pending
      </span>
    );
  }
  return null;
};

// --- Updated Profile Section ---
const ProfileSection = ({ user, profile, onProfileUpdate }) => {
  const navigate = useNavigate();
  const { connectWallet: connectSolanaWallet, getWalletAddress } = useWallet();
  const [copied, setCopied] = useState(false);
  const [uidCopied, setUidCopied] = useState(false);
  
  // Edit States
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);

  const walletAddress = profile?.wallet_address || getWalletAddress();
  const hasWallet = walletAddress && walletAddress !== "Not connected";
  
  const truncatedAddress = hasWallet
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "Not connected";

  // UID Generator
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

  // --- Handlers ---

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

  // Handle Wallet Connection
  const connectWallet = async () => {
    setIsConnectingWallet(true);
    try {
      // Use Solana wallet adapter to connect
      const success = await connectSolanaWallet();
      
      if (success) {
        const address = getWalletAddress();
        
        // Save to profile
        if (user && address) {
          const { error } = await updateProfile(user.id, { wallet_address: address });
          if (error) throw error;
          
          // Trigger refresh in parent
          onProfileUpdate(); 
        }
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
      alert("Failed to connect wallet. Please try again.");
    } finally {
      setIsConnectingWallet(false);
    }
  };

  // Handle Email Update
  const handleSaveEmail = async () => {
    if (!emailInput || !emailInput.includes('@')) {
      alert("Please enter a valid email.");
      return;
    }
    setIsSavingEmail(true);
    try {
      // 1. Update Supabase Auth via our new helper
      const { error: authError } = await updateUserEmail(emailInput);
      
      if (authError) throw authError;

      // 2. Update Public Profile (so it shows immediately)
       await updateProfile(user.id, { email: emailInput });

      // Refresh data
      onProfileUpdate();
      setIsAddingEmail(false);
      alert("Email updated! Please check your inbox to confirm.");
    } catch (error) {
      console.error("Email update failed:", error);
      alert("Error updating email: " + error.message);
    } finally {
      setIsSavingEmail(false);
    }
  };

  return (
    <Card className="flex flex-col items-center text-center relative overflow-hidden !bg-[#151925] !border-white/5 shadow-lg ">
      {/* Avatar Section */}
      {profile?.avatar_url ? (
        <img 
          src={profile.avatar_url} 
          alt={profile.display_name || 'Profile'} 
          className="w-16 h-16 rounded-full object-cover mb-3 shadow-lg shadow-[#C19A4A]/20 border-2 border-[#C19A4A]"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-[#C19A4A] flex items-center justify-center mb-3 text-[#0B0F1B] shadow-lg shadow-[#C19A4A]/20">
          <User size={30} strokeWidth={1.5} />
        </div>
      )}
      
      <h2 className="text-lg font-medium text-white mb-1">{profile?.display_name || 'Profile Not Set'}</h2>
      <p className="text-xs text-gray-400 mb-6 font-light">{profile?.bio || 'Complete your profile'}</p>

      {/* Info List */}
      <div className="w-full space-y-4 mb-7 px-2">
        
        {/* Wallet Row */}
        <div className="flex justify-between items-center text-xs h-8">
          <span className="text-gray-500 font-medium flex items-center gap-2">
            <Wallet size={14} /> Wallet
          </span>
          {hasWallet ? (
            <button onClick={handleCopy} className="flex items-center gap-2 text-gray-200 font-mono tracking-tight hover:text-white transition-colors">
              {copied ? 'Copied!' : truncatedAddress}
              <Copy size={12} className={copied ? 'text-green-500' : 'text-gray-500'} />
            </button>
          ) : (
            <button 
              onClick={connectWallet}
              disabled={isConnectingWallet}
              className="px-3 py-1 bg-[#C19A4A]/10 text-[#C19A4A] rounded-lg hover:bg-[#C19A4A] hover:text-black transition-all flex items-center gap-2"
            >
              {isConnectingWallet ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
              Connect Wallet
            </button>
          )}
        </div>

        {/* Email Row */}
        <div className="flex justify-between items-center text-xs h-8">
          <span className="text-gray-500 font-medium flex items-center gap-2">
            <Mail size={14} /> Email
          </span>
          
          {user?.email || profile?.email ? (
             <span className="text-gray-200 font-mono">{user?.email || profile?.email}</span>
          ) : isAddingEmail ? (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
              <input 
                type="email" 
                placeholder="name@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="bg-[#0B0F1B] border border-white/10 text-white px-2 py-1 rounded text-xs w-32 focus:outline-none focus:border-[#C19A4A]"
                autoFocus
              />
              <button 
                onClick={handleSaveEmail} 
                disabled={isSavingEmail}
                className="text-green-500 hover:text-green-400 p-1"
              >
                {isSavingEmail ? <Loader2 size={14} className="animate-spin"/> : <Save size={14} />}
              </button>
              <button 
                onClick={() => setIsAddingEmail(false)}
                className="text-gray-500 hover:text-white p-1"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsAddingEmail(true)}
              className="px-3 py-1 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 hover:text-white transition-all flex items-center gap-2"
            >
              <Plus size={12} /> Add Email
            </button>
          )}
        </div>

        {/* UID Row */}
        <div className="flex justify-between items-center text-xs h-8">
          <span className="text-gray-500 font-medium flex items-center gap-2">
            <User size={14} /> UID
          </span>
          <button onClick={handleUIDCopy} className="flex items-center gap-2 text-gray-200 font-mono tracking-tight hover:text-white transition-colors">
            {uidCopied ? 'Copied!' : userUID}
            <Copy size={12} className={uidCopied ? 'text-green-500' : 'text-gray-500'} />
          </button>
        </div>

        {/* Status Row */}
        <div className="flex justify-between items-center text-xs h-8">
          <span className="text-gray-500 font-medium">Status</span>
          <span className="text-green-500 flex items-center gap-1.5 font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            Active
          </span>
        </div>
      </div>

      <button className="w-full py-3 rounded-xl border border-[#C19A4A] text-[#C19A4A] text-sm font-medium hover:bg-[#C19A4A] hover:text-[#0B0F1B] transition-all duration-300 active:scale-[0.98]" onClick={() => navigate('/createProfile')} >
        {profile?.display_name ? 'Edit Profile Details' : 'Create Profile'}
      </button>
    </Card>
  );
};

const StatsRow = ({ stats }) => (
  <div className="grid grid-cols-2 gap-4">
    <Card className="flex flex-col items-center justify-center py-5 !bg-[#151925] !border-white/5">
      <span className="text-3xl font-bold text-white mb-1 tracking-tight">{stats?.total || 0}</span>
      <span className="text-xs text-gray-400 font-medium">Total Proofs</span>
    </Card>
    <Card className="flex flex-col items-center justify-center py-5 !bg-[#151925] !border-white/5">
      <span className="text-3xl font-bold text-white mb-1 tracking-tight">{stats?.verified || 0}</span>
      <span className="text-xs text-gray-400 font-medium">Verified</span>
    </Card>
  </div>
);

const ProofItem = ({ title, type, date, status }) => (
  <div className="bg-[#1C2133] p-4 rounded-xl flex flex-col gap-3 hover:bg-[#232940] transition-colors cursor-pointer group border border-transparent hover:border-white/5">
    <div className="flex justify-between items-start">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-white tracking-tight">{title}</h3>
        <Badge status={status} />
      </div>
      <ExternalLink size={14} className="text-gray-500 group-hover:text-[#C19A4A] transition-colors" />
    </div>
    <div className="flex items-center gap-4 text-[10px] text-gray-400 font-medium">
      <div className="flex items-center gap-1.5">
        {type === 'Project' ? <FileText size={12} /> : <Award size={12} />}
        {type}
      </div>
      <div className="flex items-center gap-1.5">
        <Clock size={12} />
        {date}
      </div>
    </div>
  </div>
);

const RecentProofs = ({ proofs }) => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center px-1">
        <h3 className="text-sm font-medium text-white">Recent Proofs</h3>
        <button 
          onClick={() => navigate('/portfolio')}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          All
        </button>
      </div>
      <div className="space-y-2.5">
        {proofs && proofs.length > 0 ? (
          proofs.slice(0, 3).map((proof) => (
            <ProofItem 
              key={proof.id}
              title={proof.title} 
              type={proof.type || 'Project'} 
              date={new Date(proof.created_at).toLocaleDateString()} 
              status={proof.verification_status === 'verified' ? 'Verified' : 'Pending'} 
            />
          ))
        ) : (
          <div className="bg-[#1C2133] p-6 rounded-xl text-center">
            <p className="text-sm text-gray-400">No proofs yet. Upload your first proof!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center gap-2 bg-[#C19A4A] text-[#ffffff] p-5 rounded-xl font-medium text-xs hover:bg-[#D4AB58] transition-all active:scale-[0.98] shadow-lg shadow-[#C19A4A]/5 touch-manipulation">
    <Icon size={22} strokeWidth={1.5} />
    <span className="tracking-wide">{label}</span>
  </button>
);

const QuickActions = () => { 
  const navigate = useNavigate();
  
  return (
  <div className="space-y-3">
    <h3 className="text-sm font-medium text-white px-1">Quick Actions</h3>
    <div className="p-5 rounded-2xl bg-[#151925] border border-white/5">
      <div className="grid grid-cols-2 gap-3">
        <ActionButton 
        icon={Plus} 
        label="Upload New Proof"
        onClick={() => navigate('/upload')} 
        />
        <ActionButton 
        icon={Briefcase} 
        label="View Portfolio"
        onClick={() => navigate('/portfolio')} 
        />
        <ActionButton 
        icon={Share2} 
        label="Share Profile"
        onClick={() => navigate('/publicProfile')} 
        />
        <ActionButton 
        icon={Settings} 
        label="Edit Profile"
        onClick={() => navigate('/settingsPage')} 
        />
      </div>
    </div>
  </div>
);
};

function Dashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [proofs, setProofs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Moved loadData to be accessible by children for refreshing
  const loadDashboardData = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        // Load profile
        const userProfile = await getProfile(currentUser.id);
        setProfile(userProfile);

        // Load proofs
        const userProofs = await getUserProofs(currentUser.id);
        setProofs(userProofs || []);

        // Load stats
        const proofStats = await getProofStats(currentUser.id);
        setStats(proofStats);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-[#0B0F1B] flex items-center justify-center mt-[105px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C19A4A] mx-auto mb-4"></div>
            <p className="text-white">Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#0B0F1B] font-sans text-white selection:bg-[#C19A4A] selection:text-[#0B0F1B] mt-[105px]">
        <div className="max-w-full mx-auto min-h-screen bg-[#0B0F1B] relative flex flex-col border-x border-white/5 shadow-2xl">
          <main className="flex-1 px-5 py-6 space-y-8">
            <ProfileSection 
              user={user} 
              profile={profile} 
              onProfileUpdate={loadDashboardData} 
            />
            <StatsRow stats={stats} />
            <RecentProofs proofs={proofs} />
            <QuickActions />
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Dashboard;
