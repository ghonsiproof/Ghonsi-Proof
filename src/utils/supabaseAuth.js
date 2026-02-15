import { supabase } from '../config/supabaseClient';
import { disconnectWallet } from './walletAdapter';

/**
 * Authentication Utilities using Supabase Auth
 */

// Sign up with email and password
export const signUp = async (email, password, metadata = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata // Additional user metadata
    }
  });

  if (error) throw error;
  return data;
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;
  return data;
};

// Sign in with magic link (passwordless)
export const signInWithMagicLink = async (email) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`
    }
  });

  if (error) throw error;
  return data;
};

// Sign in with OTP (sends 6-digit code to email)
export const sendOTPToEmail = async (email) => {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true, // Creates user if doesn't exist
      emailRedirectTo: undefined, // Explicitly no redirect = OTP code instead of link
    }
  });

  if (error) throw error;
  return data;
};

// Verify OTP code
export const verifyOTP = async (email, token) => {
  // First check if user exists
  const { data: existingSession } = await supabase.auth.getSession();
  const wasNewUser = !existingSession?.session;

  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });

  if (error) throw error;

  return {
    ...data,
    isNewUser: wasNewUser
  };
};

// Sign in with wallet (Solana) - Simplified version without database operations
export const signInWithWallet = async (walletAddress) => {
  try {
    // Just store wallet info locally - no database operations
    localStorage.setItem('wallet_address', walletAddress);
    localStorage.setItem('connected_wallet', localStorage.getItem('connected_wallet') || 'Phantom');

    // Create a mock user object for compatibility with existing code
    const mockUser = {
      id: walletAddress, // Use wallet address as user ID
      wallet_address: walletAddress,
      email: null,
      created_at: new Date().toISOString()
    };

    // Return mock data that matches expected structure
    return {
      user: mockUser,
      session: null,
      walletAddress,
      isNewUser: true // Always treat as new for now
    };
  } catch (error) {
    console.error('Wallet sign-in error:', error);
    throw error;
  }
};

// Sign out
export const logout = async () => {
  try {
    // Disconnect wallet if connected
    await disconnectWallet();

    // Only sign out from Supabase if there's an actual Supabase session
    try {
      const session = await getSession();
      if (session) {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Supabase signout error:', error);
      }
    } catch (error) {
      // Ignore Supabase errors for wallet-only users
      console.log('No Supabase session to sign out from');
    }

    // Clean up localStorage
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('connected_wallet');
    localStorage.removeItem('user_id');
  } catch (error) {
    console.error('Logout error:', error);
    // Still clean up localStorage even if disconnect fails
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('connected_wallet');
    localStorage.removeItem('user_id');
  }
};

// Get current session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

// Get current user
export const getCurrentUser = async () => {
  // Check for wallet-based auth first
  const walletAddress = localStorage.getItem('wallet_address');
  const connectedWallet = localStorage.getItem('connected_wallet');

  if (walletAddress) {
    // Return wallet user (no database lookup)
    return {
      id: walletAddress,
      wallet_address: walletAddress,
      connected_wallet: connectedWallet,
      email: null
    };
  }

  // Fall back to Supabase auth for email users
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;

    return {
      ...user,
      wallet_address: walletAddress,
      connected_wallet: connectedWallet
    };
  } catch (error) {
    // If no Supabase user and no wallet, return null
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const session = await getSession();
    const walletAddress = localStorage.getItem('wallet_address');

    return !!(session || walletAddress);
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Password reset
export const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });

  if (error) throw error;
  return data;
};

// Update user password
export const updatePassword = async (newPassword) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) throw error;
  return data;
};

// Update user metadata
export const updateUserMetadata = async (metadata) => {
  const { data, error } = await supabase.auth.updateUser({
    data: metadata
  });

  if (error) throw error;
  return data;
};

// Legacy compatibility functions (for existing code)
export const login = async (email, walletAddress) => {
  if (walletAddress) {
    // Wallet-based login
    return signInWithWallet(walletAddress);
  } else if (email) {
    // Email-based login (use magic link for now)
    return signInWithMagicLink(email);
  }
  throw new Error('Either email or wallet address is required');
};

export const updateUserEmail = async (email) => {
  // We assume 'supabase' is defined in this file (since you have login/logout working)
  const { data, error } = await supabase.auth.updateUser({ email });
  return { data, error };
};