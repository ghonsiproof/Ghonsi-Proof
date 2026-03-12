import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { verifyWalletSession } from '../utils/supabaseAuth';

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Create a flag to prevent state updates on unmounted components
    let isMounted = true;

    const checkAuth = async () => {
      try {
        // Check Supabase session first
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // Handle Navigator Lock timeout errors gracefully
        if (error) {
          console.log('Supabase session check error (possibly lock timeout):', error.message);
          // Don't treat lock timeout as auth failure - fall through to wallet check
        }
        
        if (session && isMounted) {
          console.log('Auth check - Supabase session exists');
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }

        // Fall back to wallet session verification
        try {
          const walletSessionValid = await verifyWalletSession();
          
          if (walletSessionValid && isMounted) {
            console.log('Auth check - Wallet session verified');
            setIsAuthenticated(true);
          } else if (isMounted) {
            console.log('Auth check - No valid session found');
            setIsAuthenticated(false);
          }
        } catch (walletError) {
          console.log('Wallet session check error:', walletError.message);
          if (isMounted) {
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        // Check if this is a Navigator Lock error
        const isLockError = error?.message?.includes('lock') || 
                          error?.message?.includes('Navigator') ||
                          error?.message?.includes('timeout');
        
        if (isLockError) {
          console.log('Navigator Lock timeout detected, retrying once...');
          // Wait a moment and retry once
          setTimeout(async () => {
            if (!isMounted) return;
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                setIsAuthenticated(true);
              }
            } catch (retryError) {
              console.log('Retry also failed:', retryError.message);
              setIsAuthenticated(false);
            }
            setLoading(false);
          }, 1000);
          return;
        }
        
        if (isMounted) {
          setIsAuthenticated(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, !!session);
      if (isMounted) {
        checkAuth();
      }
    });

    return () => {
      isMounted = false;
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

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
