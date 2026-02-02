import React, { useState } from 'react';
import { Users, UserCheck, UserX, FileText, Search, X, Shield, Eye } from 'lucide-react';
import logo from '../../assets/ghonsi-proof-logos/transparent-png-logo/4.png';

function DashboardA() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Mock data
  const stats = {
    totalUsers: 4,
    activeUsers: 2,
    inactiveUsers: 1,
    totalProofs: 1
  };

  const users = [
    {
      id: '008754021',
      email: 'sarahchen@gmail.com',
      status: 'active',
      proofs: { verified: 12, pending: 2 },
      dateJoined: 'Jan 15, 2024',
      lastActivity: 'Jan 18, 2024',
      fullName: 'Sarah Chen',
      accountStatus: 'Active',
      joinDate: 'August 15, 2023',
      proofHistory: [
        {
          title: 'Web3 Hackathon Winner',
          achievement: '1st 2023-06-15',
          submitted: 'November 15, 2023'
        }
      ]
    },
    {
      id: '008754021',
      email: 'sarahchen@gmail.com',
      status: 'active',
      proofs: { verified: 12, pending: 2 },
      dateJoined: 'Jan 15, 2024',
      lastActivity: 'Jan 18, 2024',
      fullName: 'Sarah Chen',
      accountStatus: 'Active'
    },
    {
      id: '008754021',
      email: 'sarahchen@gmail.com',
      status: 'active',
      proofs: { verified: 12, pending: 2 },
      dateJoined: 'Jan 15, 2024',
      lastActivity: 'Jan 18, 2024',
      fullName: 'Sarah Chen',
      accountStatus: 'Active'
    },
    {
      id: '008754021',
      email: 'sarahchen@gmail.com',
      status: 'active',
      proofs: { verified: 12, pending: 2 },
      dateJoined: 'Jan 15, 2024',
      lastActivity: 'Jan 18, 2024',
      fullName: 'Sarah Chen',
      accountStatus: 'Active'
    },
    {
      id: '008754021',
      email: 'sarahchen@gmail.com',
      status: 'active',
      proofs: { verified: 12, pending: 2 },
      dateJoined: 'Jan 15, 2024',
      lastActivity: 'Jan 18, 2024',
      fullName: 'Sarah Chen',
      accountStatus: 'Active'
    },
    {
      id: '008754021',
      email: 'sarahchen@gmail.com',
      status: 'active',
      proofs: { verified: 12, pending: 2 },
      dateJoined: 'Jan 15, 2024',
      lastActivity: 'Jan 18, 2024',
      fullName: 'Sarah Chen',
      accountStatus: 'Active'
    },
    {
      id: '008754021',
      email: 'sarahchen@gmail.com',
      status: 'active',
      proofs: { verified: 12, pending: 2 },
      dateJoined: 'Jan 15, 2024',
      lastActivity: 'Jan 18, 2024',
      fullName: 'Sarah Chen',
      accountStatus: 'Active'
    },
    {
      id: '008754021',
      email: 'sarahchen@gmail.com',
      status: 'active',
      proofs: { verified: 12, pending: 2 },
      dateJoined: 'Jan 15, 2024',
      lastActivity: 'Jan 18, 2024',
      fullName: 'Sarah Chen',
      accountStatus: 'Active'
    },
    {
      id: '008754021',
      email: 'sarahchen@gmail.com',
      status: 'active',
      proofs: { verified: 12, pending: 2 },
      dateJoined: 'Jan 15, 2024',
      lastActivity: 'Jan 18, 2024',
      fullName: 'Sarah Chen',
      accountStatus: 'Active'
    },
    {
      id: '008754021',
      email: 'sarahchen@gmail.com',
      status: 'active',
      proofs: { verified: 12, pending: 2 },
      dateJoined: 'Jan 15, 2024',
      lastActivity: 'Jan 18, 2024',
      fullName: 'Sarah Chen',
      accountStatus: 'Active'
    }
  ];

  const matchDetails = {
    title: 'Web3 Hackathon Winner',
    verificationResult: '98%',
    completedCount: '1/3x',
    fields: [
      { field: 'Full Name', submitted: 'Sarah Johnson', system: 'Sarah Johnson', match: true, confidence: 100 },
      { field: 'Email Address', submitted: 'sarahjohnson@gmail.com', system: 'sarahjohnson@gmail.com', match: true, confidence: 100 },
      { field: 'Certificate Title', submitted: 'Web3 Hackathon Winner', system: 'Web3 Hackathon Winner Certification', match: true, confidence: 95 },
      { field: 'Issuer', submitted: 'Blockchain Academy', system: 'Blockchain Academy', match: true, confidence: 100 }
    ]
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.id.includes(searchTerm);
    const matchesFilter = filterStatus === 'All' || 
                         (filterStatus === 'Active' && user.status === 'active') ||
                         (filterStatus === 'Inactive' && user.status === 'inactive');
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-[#0B1121] text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <img src={logo} alt="Ghonsi Proof" className="h-11" />
        <button className="text-sm text-gray-400 hover:text-white">Home</button>
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
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-300">USER</th>
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
                  <h3 className="font-semibold">Proof History & System Matches</h3>
                </div>
                {selectedUser.proofHistory && selectedUser.proofHistory.map((proof, idx) => (
                  <div key={idx} className="bg-[#0B1121] rounded p-3 mb-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm font-medium">{proof.title}</p>
                        <p className="text-xs text-gray-400">🏆 Achievement: {proof.achievement}</p>
                        <p className="text-xs text-gray-400">Submitted: {proof.submitted}</p>
                      </div>
                      <button
                        onClick={() => setSelectedMatch(matchDetails)}
                        className="bg-[#C19A4A] text-black text-xs px-3 py-1.5 rounded font-medium hover:bg-[#D4A854] flex items-center gap-1"
                      >
                        <Eye size={14} /> View Matches
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Match Details Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#0B1121] rounded-lg w-[700px] max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">System Match Details</h2>
                  <p className="text-sm text-gray-400">{selectedMatch.title}</p>
                </div>
                <button onClick={() => setSelectedMatch(null)} className="text-gray-400 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              {/* Verification Result */}
              <div className="bg-[#1A2332] border border-gray-700 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-semibold mb-1">Verification Result</p>
                    <p className="text-xs text-gray-400">Automated system matching completed {selectedMatch.completedCount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-500">{selectedMatch.verificationResult}</p>
                    <p className="text-xs text-green-500">Verified</p>
                  </div>
                </div>
              </div>

              {/* Field by Field Match Analysis */}
              <div className="bg-[#1A2332] border border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold mb-4">Field by Field Match Analysis</h3>
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-400 w-[15%]">FIELD</th>
                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-400 w-[25%]">SUBMITTED DATA</th>
                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-400 w-[25%]">SYSTEM DATA</th>
                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-400 w-[15%]">MATCH</th>
                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-400 w-[20%]">CONFIDENCE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMatch.fields.map((field, idx) => (
                      <tr key={idx} className="border-b border-gray-800">
                        <td className="py-3 px-2 text-sm truncate">{field.field}</td>
                        <td className="py-3 px-2 text-sm text-gray-300 truncate" title={field.submitted}>{field.submitted}</td>
                        <td className="py-3 px-2 text-sm text-gray-300 truncate" title={field.system}>{field.system}</td>
                        <td className="py-3 px-2">
                          <span className="text-green-500 text-sm flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Match
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <span className="text-green-500 text-sm font-medium">{field.confidence}%</span>
                            <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500" style={{ width: `${field.confidence}%` }}></div>
                            </div>
                          </div>
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
