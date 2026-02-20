import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[v0] Auth state changed:', event, !!session);
      checkAuth();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      // Check Supabase session (email auth)
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check wallet session (localStorage)
      const walletAddress = localStorage.getItem('wallet_address');
      const userId = localStorage.getItem('user_id');
      
      console.log('[v0] Auth check - Session:', !!session, 'Wallet:', !!walletAddress);
      
      // User is authenticated if they have either Supabase session or wallet + user_id
      const hasSession = !!session || (!!walletAddress && !!userId);
      setIsAuthenticated(hasSession);
    } catch (error) {
      console.error('[v0] Error checking auth:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F1B] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C19A4A] mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
