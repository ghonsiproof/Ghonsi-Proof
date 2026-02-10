import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, FileText, Search, X, Shield, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '../../config/supabaseClient';
import logo from '../../assets/ghonsi-proof-logos/transparent-png-logo/4.png';

function DashboardA() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedProofData, setSelectedProofData] = useState(null);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, inactiveUsers: 0, totalProofs: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isAuth = localStorage.getItem('adminAuth');
    if (!isAuth) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const generateUID = (userId) => {
    if (!userId) return '000000000';
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString().padStart(9, '0').slice(0, 9);
  };

  const fetchUsers = useCallback(async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');

      if (profilesError) {
        console.error('Profiles error:', profilesError);
        throw profilesError;
      }
      
      const { data: proofsData, error: proofsError } = await supabase
        .from('proofs')
        .select('*');

      if (proofsError) console.error('Proofs error:', proofsError);

      console.log('Fetched profiles:', profilesData);
      console.log('Fetched proofs:', proofsData);

      const formattedUsers = profilesData?.map(profile => {
        const userProofs = proofsData?.filter(p => p.user_id === profile.user_id) || [];
        const verifiedProofs = userProofs.filter(p => p.status === 'verified').length;
        const pendingProofs = userProofs.filter(p => p.status === 'pending').length;
        const rejectedProofs = userProofs.filter(p => p.status === 'rejected').length;
        const uid = profile.uid || generateUID(profile.user_id);
        
        return {
          id: uid,
          userId: profile.user_id,
          email: profile.email || 'N/A',
          status: 'active',
          proofs: { verified: verifiedProofs, pending: pendingProofs, rejected: rejectedProofs },
          dateJoined: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A',
          lastActivity: 'N/A',
          fullName: profile.display_name || 'N/A',
          accountStatus: 'Active',
          joinDate: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A',
          proofHistory: userProofs.map(p => ({
            proofId: p.id,
            status: p.status,
            createdAt: p.created_at,
            proofType: p.proof_type || 'N/A'
          }))
        };
      }) || [];

      setUsers(formattedUsers);

      setStats({
        totalUsers: formattedUsers.length,
        activeUsers: formattedUsers.length,
        inactiveUsers: 0,
        totalProofs: proofsData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    
    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchUsers)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchUsers)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'proofs' }, fetchUsers)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchUsers]);

  const fetchProofDetails = async (proofId) => {
    try {
      const { data, error } = await supabase
        .from('proofs')
        .select('*')
        .eq('id', proofId)
        .single();

      if (error) throw error;

      const fields = [
        { proofId: data.id, eventType: 'Upload received', proofType: data.proof_type || 'N/A', timestamp: new Date(data.created_at).toLocaleString(), status: 'successful' },
        { proofId: data.id, eventType: 'Extraction started', proofType: data.proof_type || 'N/A', timestamp: new Date(data.created_at).toLocaleString(), status: data.status === 'verified' ? 'successful' : 'pending' },
        { proofId: data.id, eventType: 'Verification', proofType: data.proof_type || 'N/A', timestamp: data.updated_at ? new Date(data.updated_at).toLocaleString() : new Date(data.created_at).toLocaleString(), status: data.status === 'verified' ? 'successful' : data.status === 'pending' ? 'pending' : 'failed' }
      ];

      const successfulCount = fields.filter(f => f.status === 'successful').length;
      const totalCount = fields.length;

      setSelectedProofData({
        title: data.proof_type || 'Proof Details',
        verificationResult: `${successfulCount}/${totalCount}`,
        completedCount: `${successfulCount}/${totalCount}`,
        fields: fields
      });
      setSelectedMatch(true);
    } catch (error) {
      console.error('Error fetching proof details:', error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.id.includes(searchTerm);
    const matchesFilter = filterStatus === 'All' || 
                         (filterStatus === 'Active' && user.status === 'active') ||
                         (filterStatus === 'Inactive' && user.status === 'inactive');
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1121] text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1121] text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <img src={logo} alt="Ghonsi Proof" className="h-11" />
        <button 
          onClick={() => {
            localStorage.removeItem('adminAuth');
            navigate('/admin/login');
          }}
          className="text-sm text-gray-400 hover:text-white"
        >
          Logout
        </button>
      </div>

      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Admin Dashboard</h1>
        <p className="text-gray-400 text-sm">Manage users and view system overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1A2332] border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-gray-400" />
            <span className="text-2xl font-bold">{stats.totalUsers}</span>
          </div>
          <p className="text-sm text-gray-400">Total Users</p>
        </div>
        <div className="bg-[#1A2332] border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck size={18} className="text-gray-400" />
            <span className="text-2xl font-bold">{stats.activeUsers}</span>
          </div>
          <p className="text-sm text-gray-400">Active Users</p>
        </div>
        <div className="bg-[#1A2332] border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <UserX size={18} className="text-gray-400" />
            <span className="text-2xl font-bold">{stats.inactiveUsers}</span>
          </div>
          <p className="text-sm text-gray-400">Inactive Users</p>
        </div>
        <div className="bg-[#1A2332] border border-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={18} className="text-gray-400" />
            <span className="text-2xl font-bold">{stats.totalProofs}</span>
          </div>
          <p className="text-sm text-gray-400">Total Proofs</p>
        </div>
      </div>

      {/* User Management Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">User Management</h2>
        
        {/* Search and Filter */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#1A2332] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('All')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filterStatus === 'All' ? 'bg-[#C19A4A] text-black' : 'bg-[#1A2332] text-gray-400 border border-gray-700'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('Active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filterStatus === 'Active' ? 'bg-[#C19A4A] text-black' : 'bg-[#1A2332] text-gray-400 border border-gray-700'}`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('Inactive')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${filterStatus === 'Inactive' ? 'bg-[#C19A4A] text-black' : 'bg-[#1A2332] text-gray-400 border border-gray-700'}`}
            >
              Inactive
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[#0B1121] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">USER ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Proofs</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Date Joined</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Last Activity</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-[#1A2332]">
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium">{user.id}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-white">✓ {user.proofs.verified}</span>
                      <span className="text-yellow-500">⏱ {user.proofs.pending}</span>
                      <span className="text-red-500">✗ {user.proofs.rejected}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">{user.dateJoined}</td>
                  <td className="py-3 px-4 text-sm">{user.lastActivity}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="bg-[#C19A4A] text-black text-xs px-4 py-1.5 rounded font-medium hover:bg-[#D4A854] flex items-center gap-1"
                    >
                      <Eye size={14} /> View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#0B1121] rounded-lg w-[700px] max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedUser.fullName}</h2>
                  <p className="text-sm text-gray-400">{selectedUser.email}</p>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              {/* User Information */}
              <div className="bg-[#1A2332] rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users size={18} />
                  <h3 className="font-semibold">User Information</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">User ID</p>
                    <p className="text-sm">{selectedUser.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Last Activity</p>
                    <p className="text-sm">January 15, 2024</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Full Name</p>
                    <p className="text-sm">{selectedUser.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Join Date</p>
                    <p className="text-sm">{selectedUser.joinDate || 'August 15, 2023'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Email Address</p>
                    <p className="text-sm">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Account Status</p>
                    <p className="text-sm">{selectedUser.accountStatus}</p>
                  </div>
                </div>
              </div>

              {/* Proof History */}
              <div className="bg-[#1A2332] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={18} />
                  <h3 className="font-semibold">Proof History</h3>
                </div>
                {selectedUser.proofHistory && selectedUser.proofHistory.length > 0 ? (
                  selectedUser.proofHistory.map((proof, idx) => (
                    <div key={idx} className="bg-[#0B1121] rounded p-3 mb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium">{proof.proofId}</p>
                            {proof.status === 'verified' && (
                              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">Verified</span>
                            )}
                            {proof.status === 'pending' && (
                              <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full">Pending</span>
                            )}
                            {proof.status === 'rejected' && (
                              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">Rejected</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">{proof.proofType} • {new Date(proof.createdAt).toLocaleDateString()}</p>
                        </div>
                        <button
                          onClick={() => fetchProofDetails(proof.proofId)}
                          className="bg-[#C19A4A] text-black text-xs px-3 py-1.5 rounded font-medium hover:bg-[#D4A854] flex items-center gap-1"
                        >
                          <Eye size={14} /> View Proofs
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400">No proof history available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Match Details Modal */}
      {selectedMatch && selectedProofData && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#0B1121] rounded-lg w-[700px] max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">System Match Details</h2>
                  <p className="text-sm text-gray-400">{selectedProofData.title}</p>
                </div>
                <button onClick={() => { setSelectedMatch(null); setSelectedProofData(null); }} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              {/* Verification Result */}
              <div className="bg-[#1A2332] border border-gray-700 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold mb-1">Proof Upload - Verification Analysis</p>
                    <p className="text-xs text-gray-400">Event Timeline {selectedProofData.completedCount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-500">{selectedProofData.verificationResult}</p>
                    <p className="text-xs text-green-500">Fields Verified</p>
                  </div>
                </div>
              </div>

              {/* Field Analysis */}
              <div className="bg-[#1A2332] border border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-4">Field</h3>
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-400 w-[15%]">PROOF ID</th>
                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-400 w-[25%]">EVENT TYPE</th>
                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-400 w-[20%]">PROOF TYPE</th>
                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-400 w-[20%]">TIMESTAMP</th>
                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-400 w-[20%]">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProofData.fields.map((field, idx) => (
                      <tr key={idx} className="border-b border-gray-800">
                        <td className="py-3 px-2 text-sm truncate">{field.proofId}</td>
                        <td className="py-3 px-2 text-sm text-gray-300 truncate">{field.eventType}</td>
                        <td className="py-3 px-2 text-sm text-gray-300 truncate">{field.proofType}</td>
                        <td className="py-3 px-2 text-xs text-gray-400">{field.timestamp}</td>
                        <td className="py-3 px-2">
                          {field.status === 'successful' && (
                            <span className="text-green-500 text-sm flex items-center gap-1">
                              <CheckCircle size={16} />
                              Successful
                            </span>
                          )}
                          {field.status === 'pending' && (
                            <span className="text-yellow-500 text-sm flex items-center gap-1">
                              <Clock size={16} />
                              Pending
                            </span>
                          )}
                          {field.status === 'failed' && (
                            <span className="text-red-500 text-sm flex items-center gap-1">
                              <XCircle size={16} />
                              Failed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardA;