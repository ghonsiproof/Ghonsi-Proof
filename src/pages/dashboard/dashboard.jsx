import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/header/header.jsx';
import Footer from '../../components/footer/footer.jsx';
import { CheckCircle2, ExternalLink, FileText, Award, Plus, Briefcase, Share2, Settings, Copy, User, Trash2, Clock } from 'lucide-react';

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

const ProfileSection = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const walletAddress = "7xKXtgrD2cFA8e2U1dY2gAsU";
  const truncatedAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [walletAddress]);

  return (
    <Card className="flex flex-col items-center text-center relative overflow-hidden !bg-[#151925] !border-white/5 shadow-lg ">
      <div className="w-16 h-16 rounded-full bg-[#C19A4A] flex items-center justify-center mb-3 text-[#0B0F1B] shadow-lg shadow-[#C19A4A]/20">
        <User size={30} strokeWidth={1.5} />
      </div>
      
      <h2 className="text-lg font-medium text-white mb-1">Profile Not Set</h2>
      <p className="text-xs text-gray-400 mb-6 font-light">Complete your profile</p>

      <div className="w-full space-y-3 mb-7 px-2">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 font-medium">Wallet</span>
          <button onClick={handleCopy} className="flex items-center gap-2 text-gray-200 font-mono tracking-tight hover:text-white transition-colors">
            {copied ? 'Copied!' : truncatedAddress}
            <Copy size={12} className={copied ? 'text-green-500' : 'text-gray-500'} />
          </button>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 font-medium">Email</span>
          <span className="text-gray-200 font-mono">use***@example.com</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500 font-medium">Status</span>
          <span className="text-green-500 flex items-center gap-1.5 font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            Active
          </span>
        </div>
      </div>

      <button className="w-full py-3 rounded-xl border border-[#C19A4A] text-[#C19A4A] text-sm font-medium hover:bg-[#C19A4A] hover:text-[#0B0F1B] transition-all duration-300 active:scale-[0.98]" onClick={() => navigate('/createProfile')} >
        Create Profile
      </button>
    </Card>
  );
};

const StatsRow = () => (
  <div className="grid grid-cols-2 gap-4">
    <Card className="flex flex-col items-center justify-center py-5 !bg-[#151925] !border-white/5">
      <span className="text-3xl font-bold text-white mb-1 tracking-tight">12</span>
      <span className="text-xs text-gray-400 font-medium">Total Proofs</span>
    </Card>
    <Card className="flex flex-col items-center justify-center py-5 !bg-[#151925] !border-white/5">
      <span className="text-3xl font-bold text-white mb-1 tracking-tight">4</span>
      <span className="text-xs text-gray-400 font-medium">Achievements</span>
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

const RecentProofs = () => (
  <div className="space-y-3">
    <div className="flex justify-between items-center px-1">
      <h3 className="text-sm font-medium text-white">Recent Proofs</h3>
      <button className="text-xs text-gray-400 hover:text-white transition-colors">All</button>
    </div>
    <div className="space-y-2.5">
      <ProofItem 
        title="DeFi Protocol Development" 
        type="Project" 
        date="2023-11-10" 
        status="Verified" 
      />
      <ProofItem 
        title="Solana Developer Certification" 
        type="Certificate" 
        date="2024-01-10" 
        status="Verified" 
      />
      <ProofItem 
        title="Smart Contract Audit" 
        type="Achievement" 
        date="2024-01-08" 
        status="Pending" 
      />
    </div>
  </div>
);

const ActionButton = ({ icon: Icon, label, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center gap-2 bg-[#C19A4A] text-[#ffffff] p-5 rounded-xl font-medium text-xs hover:bg-[#D4AB58] transition-all active:scale-[0.98] shadow-lg shadow-[#C19A4A]/5">
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

const DeleteSection = () => (
  <div className="mt-12 pt-8 border-t border-white/10">
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5">
      <h3 className="text-red-500 text-sm font-bold mb-2 flex items-center gap-2">
        <Trash2 size={16} /> Danger Zone
      </h3>
      <p className="text-[11px] text-white/60 mb-4 leading-relaxed">
        Deleting your profile will permanently remove all your verification data and proofs from our platform. This action cannot be undone.
      </p>
      <button className="w-full py-3 rounded-lg border border-red-500/50 text-red-500 text-xs font-bold hover:bg-red-500 hover:text-white transition-all duration-300 uppercase tracking-wide">
        Delete Account
      </button>
    </div>
  </div>
);

function Dashboard() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#0B0F1B] font-sans text-white selection:bg-[#C19A4A] selection:text-[#0B0F1B] mt-[105px]">
        <div className="max-w-md mx-auto min-h-screen bg-[#0B0F1B] relative flex flex-col border-x border-white/5 shadow-2xl">
          <main className="flex-1 px-5 py-6 space-y-8">
            <ProfileSection />
            <StatsRow />
            <RecentProofs />
            <QuickActions />
            <DeleteSection />
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Dashboard;
