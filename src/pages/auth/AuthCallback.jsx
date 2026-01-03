import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';

function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Processing authentication...');

  const handleAuthCallback = useCallback(async () => {
    try {
      // Get the current session after magic link click
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth callback error:', error);
        setStatus('❌ Authentication failed: ' + error.message);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (session) {
        setStatus('✅ Authentication successful! Redirecting...');
        console.log('User authenticated:', session.user.email);
        
        // Redirect to dashboard after 1 second
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setStatus('⚠️ No session found. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      setStatus('❌ An error occurred. Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [navigate]);

  useEffect(() => {
    handleAuthCallback();
  }, [handleAuthCallback]);

  return (
    <div className="min-h-screen bg-[#0B0F1B] flex items-center justify-center px-4">
      <div className="bg-[#151925] rounded-2xl p-8 max-w-md w-full border border-white/10 text-center">
        <div className="mb-6">
          {status.includes('✅') ? (
            <div className="text-6xl mb-4">✅</div>
          ) : status.includes('❌') ? (
            <div className="text-6xl mb-4">❌</div>
          ) : (
            <div className="w-16 h-16 border-4 border-[#C19A4A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          )}
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Authentication</h1>
        <p className="text-gray-400">{status}</p>
      </div>
    </div>
  );
}

export default AuthCallback;
