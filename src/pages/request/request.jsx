import React, { useState, useEffect } from 'react';
import { X, Share2, Mail, Wallet, ExternalLink, ShieldCheck, Info, Check } from 'lucide-react';
import logo from '../../assets/ghonsi-proof-logos/transparent-png-logo/4.png';

// Mock Auth function to replace missing import
const getCurrentUser = async () => {
  // Simulate an authenticated user or return null
  return { email: 'visitor@example.com' };
};

// Mock Data
const mockDatabase = {
  "alex_chen": {
    profilePhotoUrl: "https://i.pravatar.cc/150?u=alexchen",
    name: "Alex Chen",
    role: "Senior Web3 Developer",
    email: "alex.c***@gmail.com",
    wallet: "7x9kAbCw5sDfGhJkLmN2pQrStUvWxYzAbCdEfGhIjK",
    bio: "Passionate Web3 developer with 5+ years of experience building decentralized applications on Solana. Specialized in DeFi protocols, smart contract security, and full-stack dApp development...",
    stats: { proofs: 12, achievements: 4 },
    skills: ['Solana Development', 'React', 'Security Auditing', 'Smart Contracts', '+10 more...'],
    proofs: [
      {
        id: "GH-C-012",
        title: "Senior Frontend Developer Certification",
        status: "Verified",
        type: "Certificate",
        icon: "award",
        date: "2024-01-15",
        desc: "Advanced React and TypeScript certification from a leading Web3 Academy.",
        hash: "2z3g...K9hL"
      },
      {
        id: "GH-M-018",
        title: "Blockchain Security Audit",
        status: "Verified",
        type: "Milestone",
        icon: "file-text",
        date: "2023-12-20",
        desc: "Completed comprehensive security audit for a major DeFi protocol, identifying and resolving critical vulnerabilities.",
        hash: "5y6z...P2qR"
      },
      {
        id: "GH-P-022",
        title: "Contributor to Open-Source SPL Library",
        status: "Pending",
        type: "Contribution",
        icon: "git-pull-request",
        date: "2023-10-01",
        desc: "Contributed performance improvements to the Solana Program Library.",
        hash: "8a9b...T5uV"
      }
    ]
  }
};

function Request() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [showMore, setShowMore] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const username = urlParams.get('user') || 'alex_chen';
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      if (mockDatabase[username]) {
        setProfileData(mockDatabase[username]);
      }
      setLoading(false);
    };
    
    const loadUserEmail = async () => {
      try {
        const user = await getCurrentUser();
        if (user?.email) {
          setFormData(prev => ({ ...prev, email: user.email }));
        }
      } catch (error) {
        // User not logged in, ignore error
      }
    };
    
    fetchProfile();
    loadUserEmail();
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowRequestModal(false);
    setShowSuccessModal(true);
    setFormData({ name: '', email: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1B] flex justify-center items-center">
        <div className="w-8 h-8 border-2 border-t-[#C19A4A] border-gray-700 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-[#0B0F1B] text-white flex items-center justify-center p-4">
        <div className="bg-[#131825] border border-red-500/30 rounded-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-full border-2 border-red-500 text-red-500 flex items-center justify-center mx-auto mb-6">
            <X className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold mb-2">An Error Occurred</h2>
          <p className="text-gray-400">User not found. Try another user or go <a href="/" className="text-[#C19A4A] underline">home</a>.</p>
        </div>
      </div>
    );
  }

  const shortWallet = `${profileData.wallet.substring(0, 4)}...${profileData.wallet.substring(profileData.wallet.length - 4)}`;
  const proofsToShow = showMore ? profileData.proofs : profileData.proofs.slice(0, 2);

  return (
    <div className="max-w-full mx-auto bg-[#0B0F1B] text-white font-sans selection:bg-[#C19A4A] selection:text-[#0B0F1B] mt-[105px]">
      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
      
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#0B0F1B]/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <a href="/home" className="logo">
            <img src={logo} alt="Logo" style={{width: 'auto', height: '75px'}} />
          </a>
        </div>
        <div className="flex items-center gap-4">
          <a href="/home" className="text-sm text-gray-300 hover:text-white transition-colors">Home</a>
          <button onClick={handleShare} className="flex items-center gap-2 bg-[#C19A4A] text-[#0B0F1B] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#d4a852] transition-colors">
            <Share2 className="w-4 h-4" />
            {copied ? 'Copied!' : 'Share Profile'}
          </button>
        </div>
      </header>

      {/* CHANGED: Removed max-w-md, md:max-w-2xl, lg:max-w-4xl constraints to make it full width */}
      <main className="px-4 pb-20 w-full space-y-6 mt-4">
        <div className="relative bg-[#131825] border border-gray-800 rounded-2xl p-6 shadow-xl">
          <button className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-[#C19A4A] flex items-center justify-center flex-shrink-0 text-[#0B0F1B] overflow-hidden">
                {profileData.profilePhotoUrl ? (
                  <img src={profileData.profilePhotoUrl} alt={profileData.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold">{profileData.name.charAt(0)}</span>
                )}
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-bold">{profileData.name}</h1>
                <p className="text-sm text-gray-400">{profileData.role}</p>
              </div>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed">{profileData.bio}</p>

            <div className="flex flex-wrap gap-4 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-[#C19A4A]" />
                <span>{profileData.email}</span>
              </div>
              <a href={`https://solscan.io/account/${profileData.wallet}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#C19A4A] transition-colors">
                <Wallet className="w-3 h-3 text-[#C19A4A]" />
                <span className="font-mono">{shortWallet}</span>
                <ExternalLink className="w-2.5 h-2.5 text-gray-500" />
              </a>
            </div>

            <div className="pt-2">
              <button onClick={() => setShowRequestModal(true)} className="bg-[#C19A4A] text-[#0B0F1B] px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-[#d4a852] transition-colors w-full sm:w-auto">
                Request Portfolio
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#131825] border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{profileData.stats.proofs}</div>
            <div className="text-xs text-gray-400 mt-1">Total Proofs</div>
          </div>
          <div className="bg-[#131825] border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{profileData.stats.achievements}</div>
            <div className="text-xs text-gray-400 mt-1">Achievements</div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-lg">Skills & Expertise</h3>
          <div className="flex flex-wrap gap-2">
            {profileData.skills.map((skill, idx) => (
              <span key={idx} className={`text-xs px-3 py-1.5 rounded-full border ${idx === profileData.skills.length - 1 ? 'bg-[#1A1F2E] border-gray-700 text-gray-400' : 'bg-[#1A1F2E] border-gray-800 text-[#C19A4A]'}`}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-[#131825] border border-gray-800 rounded-2xl p-1 overflow-hidden">
          <div className="flex items-center justify-between p-4 pb-2">
            <h3 className="font-semibold">Verified Proofs</h3>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-300">
              <ShieldCheck className="w-3 h-3" />
              <span>All proofs are verified on-chain</span>
            </div>
          </div>

          <div className="space-y-1 p-2">
            {proofsToShow.map((proof, idx) => (
              <div key={idx} className="bg-[#1A1F2E] rounded-xl p-4 mb-2 hover:bg-[#23293a] transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-sm text-gray-200 group-hover:text-[#C19A4A] transition-colors">{proof.title}</h4>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${proof.status === 'Verified' ? 'text-green-500 bg-green-500/10' : 'text-yellow-500 bg-yellow-500/10'}`}>
                      {proof.status}
                    </span>
                    <Share2 className="w-3.5 h-3.5 text-gray-500 cursor-pointer hover:text-white" />
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-[10px] text-gray-400 mb-3">
                  <div className="flex items-center gap-1">
                    <span>{proof.type}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📅</span>
                    <span>{proof.date}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{proof.desc}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-[10px] bg-[#0B0F1B] border border-white/10 text-white px-2 py-1 rounded-md font-mono">
                    {proof.id}
                  </span>
                </div>

                <a href={`https://solscan.io/tx/${proof.hash}`} target="_blank" rel="noopener noreferrer" className="group/link inline-flex">
                  <div className="flex items-center gap-2 bg-[#0B0F1B] rounded p-1.5 w-fit">
                    <div className="text-[10px] text-gray-500 flex items-center gap-1">
                      <span>🔗</span>
                      <span>On-chain verification:</span>
                    </div>
                    <code className="text-[10px] text-[#C19A4A] font-mono bg-[#C19A4A]/10 px-1 rounded">{proof.hash}</code>
                    <ExternalLink className="w-2.5 h-2.5 text-gray-500 group-hover/link:text-[#C19A4A]" />
                  </div>
                </a>
              </div>
            ))}
          </div>

          {profileData.proofs.length > 2 && !showMore && (
            <div className="p-2">
              <button onClick={() => setShowMore(true)} className="w-full text-center text-sm text-[#C19A4A] font-semibold py-2 rounded-lg hover:bg-[#1A1F2E] transition-colors">
                Show {profileData.proofs.length - 2} More
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-2 left-3 right-3 z-40">
        <div className="max-w-xl mx-auto bg-[#1C1C1C]/95 backdrop-blur-md border border-white/10 p-2 rounded-xl shadow-2xl flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-white">
              To view {profileData.name} full credentials and experience{' '}
            </p>
          </div>
          <div className="shrink-0">
            <button 
              onClick={() => setShowRequestModal(true)} 
              className="px-4 py-2 rounded-lg bg-[#C19A4A] text-black text-xs font-semibold hover:bg-[#a8853b] transition-colors whitespace-nowrap"
            >
              Request Portfolio
            </button>
          </div>
        </div>
      </div>

      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-[#0B0F1B]/80 backdrop-blur-sm" onClick={() => setShowRequestModal(false)}></div>
          
          <div className="relative bg-[#0B0F1B] border border-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-[scaleIn_0.2s_ease-out]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Request Portfolio</h2>
                <p className="text-sm text-gray-400 mt-1">Request access to {profileData.name}'s verified portfolio</p>
              </div>
              <button onClick={() => setShowRequestModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm text-gray-300">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter your full name"
                  className="w-full bg-[#131825] border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#C19A4A] transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-gray-300">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter your email"
                  className="w-full bg-[#131825] border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#C19A4A] transition-colors"
                />
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-1">
                  <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                  Your email will never be shared with the portfolio owner
                </div>
              </div>

              <div className="border border-[#C19A4A] rounded-lg p-4 bg-[#C19A4A]/5">
                <div className="flex items-center gap-2 text-[#C19A4A] mb-2">
                  <Info className="w-4 h-4" />
                  <span className="font-semibold text-sm">How it works:</span>
                </div>
                <ol className="text-xs text-gray-300 space-y-1.5 list-decimal pl-4">
                  <li>We'll notify the portfolio owner of your request</li>
                  <li>They can approve and export their portfolio</li>
                  <li>You'll receive it directly via email</li>
                </ol>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-600 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-lg bg-[#C19A4A] text-[#0B0F1B] text-sm font-bold hover:bg-[#d4a852] transition-colors"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-[#0B0F1B]/80 backdrop-blur-sm" onClick={() => setShowSuccessModal(false)}></div>
          
          <div className="relative bg-[#0B0F1B] border border-gray-800 rounded-2xl w-full max-w-sm shadow-2xl p-8 text-center animate-[scaleIn_0.2s_ease-out]">
            <button onClick={() => setShowSuccessModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>

            <div className="w-16 h-16 rounded-full border-2 border-[#C19A4A] text-[#C19A4A] flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-4">Request Sent</h2>
            
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              We've notified {profileData.name}. You'll receive their portfolio via email once they approve
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Request;
