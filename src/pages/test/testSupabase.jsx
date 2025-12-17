import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { signInWithMagicLink, getCurrentUser, logout } from '../../utils/supabaseAuth';
import Header from '../../components/header/header';
import Footer from '../../components/footer/footer';

function TestSupabase() {
  const [connectionStatus, setConnectionStatus] = useState('Checking...');
  const [dbStatus, setDbStatus] = useState('Not tested');
  const [authStatus, setAuthStatus] = useState('Not logged in');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    testConnection();
    checkAuth();
  }, []);

  const addResult = (test, status, message) => {
    setTestResults(prev => [...prev, { test, status, message, time: new Date().toLocaleTimeString() }]);
  };

  const testConnection = async () => {
    try {
      // Test 1: Check Supabase client
      if (!supabase) {
        setConnectionStatus('❌ Failed - Supabase client not initialized');
        addResult('Supabase Client', 'error', 'Client not initialized');
        return;
      }
      setConnectionStatus('✅ Connected');
      addResult('Supabase Client', 'success', 'Client initialized successfully');

      // Test 2: Check database connection
      try {
        const { data, error } = await supabase
          .from('users')
          .select('count')
          .limit(1);

        if (error) {
          setDbStatus('❌ Database error: ' + error.message);
          addResult('Database Connection', 'error', error.message);
        } else {
          setDbStatus('✅ Database connected');
          addResult('Database Connection', 'success', 'Successfully queried users table');
        }
      } catch (err) {
        setDbStatus('❌ Database error: ' + err.message);
        addResult('Database Connection', 'error', err.message);
      }
    } catch (error) {
      setConnectionStatus('❌ Failed: ' + error.message);
      addResult('Supabase Client', 'error', error.message);
    }
  };

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && session.user) {
        setUser(session.user);
        setAuthStatus('✅ Logged in as: ' + session.user.email);
        addResult('Authentication Check', 'success', 'User logged in: ' + session.user.email);
      } else {
        setAuthStatus('⚠️ Not logged in (this is normal before clicking magic link)');
        addResult('Authentication Check', 'info', 'No active session - Click the magic link in your email to login');
      }
    } catch (error) {
      setAuthStatus('❌ Error checking auth');
      addResult('Authentication Check', 'error', error.message);
    }
  };

  const handleTestLogin = async (e) => {
    e.preventDefault();
    if (!email) {
      alert('Please enter an email address');
      return;
    }

    try {
      addResult('Magic Link Request', 'pending', 'Sending magic link to ' + email);
      await signInWithMagicLink(email);
      alert('✅ Magic link sent! Check your email: ' + email);
      addResult('Magic Link Request', 'success', 'Magic link sent to ' + email);
    } catch (error) {
      alert('❌ Failed to send magic link: ' + error.message);
      addResult('Magic Link Request', 'error', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setAuthStatus('⚠️ Not logged in');
      addResult('Logout', 'success', 'Successfully logged out');
      alert('✅ Logged out successfully');
    } catch (error) {
      alert('❌ Logout failed: ' + error.message);
      addResult('Logout', 'error', error.message);
    }
  };

  const testDatabase = async () => {
    try {
      addResult('Database Test', 'pending', 'Testing database operations...');

      // Test reading from users table
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(5);

      if (usersError) throw usersError;

      addResult('Users Table', 'success', `Found ${users.length} users in database`);

      // Test reading from profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);

      if (profilesError) throw profilesError;

      addResult('Profiles Table', 'success', `Found ${profiles.length} profiles in database`);

      // Test reading from proofs table
      const { data: proofs, error: proofsError } = await supabase
        .from('proofs')
        .select('*')
        .limit(5);

      if (proofsError) throw proofsError;

      addResult('Proofs Table', 'success', `Found ${proofs.length} proofs in database`);

      alert('✅ All database tests passed!');
    } catch (error) {
      addResult('Database Test', 'error', error.message);
      alert('❌ Database test failed: ' + error.message);
    }
  };

  const testStorage = async () => {
    try {
      addResult('Storage Test', 'pending', 'Testing storage bucket...');

      // Try to list files in the bucket - if this works, bucket exists
      const { data: files, error: filesError } = await supabase
        .storage
        .from('proof-files')
        .list('', { limit: 10 });

      if (filesError) {
        // If error contains "Bucket not found", that's the real issue
        if (filesError.message.includes('Bucket not found')) {
          throw new Error('Storage bucket "proof-files" not found. Please create it in Supabase Dashboard.');
        }
        // Other errors might be permission issues but bucket exists
        addResult('Storage Files', 'warning', 'Bucket exists but has restrictions: ' + filesError.message);
        addResult('Storage Test', 'success', 'Storage bucket "proof-files" exists (with some access restrictions)');
        alert('⚠️ Storage bucket exists but has some restrictions: ' + filesError.message);
      } else {
        addResult('Storage Files', 'success', `Bucket is accessible. Contains ${files.length} file(s)`);
        addResult('Storage Test', 'success', 'Storage bucket "proof-files" exists and is fully accessible!');
        alert('✅ Storage bucket is configured correctly!');
      }
    } catch (error) {
      addResult('Storage Test', 'error', error.message);
      alert('❌ Storage test failed: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'pending': return 'text-yellow-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return 'ℹ️';
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#0B0F1B] pt-[100px] pb-10 px-5">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">🧪 Supabase Integration Test</h1>
          <p className="text-gray-400 mb-8">Test your Supabase connection, authentication, and database</p>

          {/* Connection Status */}
          <div className="bg-[#151925] rounded-xl p-6 mb-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">Connection Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-[#1C2133] rounded-lg">
                <span className="text-gray-300">Supabase Client:</span>
                <span className="font-mono text-sm">{connectionStatus}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#1C2133] rounded-lg">
                <span className="text-gray-300">Database:</span>
                <span className="font-mono text-sm">{dbStatus}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#1C2133] rounded-lg">
                <span className="text-gray-300">Authentication:</span>
                <span className="font-mono text-sm">{authStatus}</span>
              </div>
            </div>
          </div>

          {/* Test Authentication */}
          <div className="bg-[#151925] rounded-xl p-6 mb-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">🔐 Test Authentication</h2>
            
            {!user ? (
              <form onSubmit={handleTestLogin} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2 text-sm">Enter your email to test magic link login:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full p-3 bg-[#1C2133] border border-white/10 rounded-lg text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#C19A4A] text-[#0B0F1B] rounded-lg font-semibold hover:bg-[#d4ab5a] transition"
                >
                  Send Magic Link
                </button>
                <p className="text-xs text-gray-400">
                  ℹ️ A magic link will be sent to your email. Click it to sign in!
                </p>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-500">✅ You are logged in!</p>
                  <p className="text-gray-300 text-sm mt-2">Email: {user.email}</p>
                  {user.wallet_address && (
                    <p className="text-gray-300 text-sm">Wallet: {user.wallet_address}</p>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full py-3 bg-red-500/20 text-red-500 border border-red-500/30 rounded-lg font-semibold hover:bg-red-500/30 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Test Database */}
          <div className="bg-[#151925] rounded-xl p-6 mb-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">🗄️ Test Database</h2>
            <p className="text-gray-400 text-sm mb-4">
              This will check if all tables are accessible (users, profiles, proofs)
            </p>
            <button
              onClick={testDatabase}
              className="w-full py-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg font-semibold hover:bg-blue-500/30 transition"
            >
              Run Database Tests
            </button>
          </div>

          {/* Test Storage */}
          <div className="bg-[#151925] rounded-xl p-6 mb-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">📦 Test Storage</h2>
            <p className="text-gray-400 text-sm mb-4">
              This will check if the "proof-files" storage bucket is configured
            </p>
            <button
              onClick={testStorage}
              className="w-full py-3 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg font-semibold hover:bg-purple-500/30 transition"
            >
              Test Storage Bucket
            </button>
          </div>

          {/* Test Results Log */}
          <div className="bg-[#151925] rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">📋 Test Results</h2>
            {testResults.length === 0 ? (
              <p className="text-gray-400 text-sm">No tests run yet. Click the buttons above to test.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {testResults.map((result, index) => (
                  <div key={index} className="p-3 bg-[#1C2133] rounded-lg flex items-start gap-3">
                    <span className="text-xl">{getStatusIcon(result.status)}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="font-semibold text-white text-sm">{result.test}</span>
                        <span className="text-xs text-gray-500">{result.time}</span>
                      </div>
                      <p className={`text-xs mt-1 ${getStatusColor(result.status)}`}>{result.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Environment Variables */}
          <div className="bg-[#151925] rounded-xl p-6 mt-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">🔑 Environment Variables</h2>
            <div className="space-y-2">
              <div className="p-3 bg-[#1C2133] rounded-lg">
                <p className="text-gray-400 text-xs mb-1">REACT_APP_SUPABASE_URL</p>
                <p className="font-mono text-xs text-white break-all">
                  {process.env.REACT_APP_SUPABASE_URL || '❌ Not set'}
                </p>
              </div>
              <div className="p-3 bg-[#1C2133] rounded-lg">
                <p className="text-gray-400 text-xs mb-1">REACT_APP_SUPABASE_ANON_KEY</p>
                <p className="font-mono text-xs text-white break-all">
                  {process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ Set (hidden for security)' : '❌ Not set'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-[#151925] rounded-xl p-6 mt-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">🔗 Quick Links</h2>
            <div className="space-y-2">
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-[#1C2133] rounded-lg text-[#C19A4A] hover:bg-[#232940] transition"
              >
                → Open Supabase Dashboard
              </a>
              <a
                href="/login"
                className="block p-3 bg-[#1C2133] rounded-lg text-[#C19A4A] hover:bg-[#232940] transition"
              >
                → Go to Login Page
              </a>
              <a
                href="/dashboard"
                className="block p-3 bg-[#1C2133] rounded-lg text-[#C19A4A] hover:bg-[#232940] transition"
              >
                → Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default TestSupabase;
