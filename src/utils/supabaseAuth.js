import { supabase } from '../config/supabaseClient';

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
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });

  if (error) throw error;
  return data;
};

// Sign in with wallet (Solana)
export const signInWithWallet = async (walletAddress) => {
  try {
    // Create a pseudo-email from wallet address for Supabase auth
    const walletEmail = `${walletAddress}@wallet.local`;

    // Try to sign in with existing wallet user
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: walletEmail,
        password: walletAddress // Use wallet address as password
      });

      if (!signInError) {
        // Successfully signed in existing user
        return { user: signInData.user, walletAddress, isNewUser: false };
      }
    } catch (signInError) {
      // User doesn't exist, create new one
    }

    // Create new user account for wallet
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: walletEmail,
      password: walletAddress,
      options: {
        data: {
          wallet_address: walletAddress,
          auth_method: 'wallet'
        }
      }
    });

    if (signUpError) throw signUpError;

    // Store wallet info
    localStorage.setItem('wallet_address', walletAddress);

    return { user: signUpData.user, walletAddress, isNewUser: true };
  } catch (error) {
    console.error('Wallet sign-in error:', error);
    throw error;
  }
};

// Sign out
export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  localStorage.removeItem('wallet_address');
  localStorage.removeItem('user_id');
  
  if (error) throw error;
};

// Get current session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

// Get current user
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  
  // Also check for wallet-based auth
  const walletAddress = localStorage.getItem('wallet_address');
  
  return {
    ...user,
    wallet_address: walletAddress
  };
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  const session = await getSession();
  const walletAddress = localStorage.getItem('wallet_address');
  
  return !!(session || walletAddress);
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
