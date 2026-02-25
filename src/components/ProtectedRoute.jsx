import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { verifyWalletSession } from '../utils/supabaseAuth';

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, !!session);
      checkAuth();
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const checkAuth = async () => {
    try {
      // Check Supabase session first
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log('Auth check - Supabase session exists');
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      // Fall back to wallet session verification
      const walletSessionValid = await verifyWalletSession();
      
      if (walletSessionValid) {
        console.log('Auth check - Wallet session verified');
        setIsAuthenticated(true);
      } else {
        console.log('Auth check - No valid session found');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
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
