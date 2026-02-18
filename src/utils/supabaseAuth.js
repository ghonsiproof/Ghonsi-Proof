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
      data: metadata
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
      shouldCreateUser: true,
      emailRedirectTo: undefined,
    }
  });

  if (error) throw error;
  return data;
};

// Verify OTP code
export const verifyOTP = async (email, token) => {
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

// Sign in with wallet (Solana)
export const signInWithWallet = async (walletAddress) => {
  try {
    localStorage.setItem('wallet_address', walletAddress);
    localStorage.setItem('connected_wallet', localStorage.getItem('connected_wallet') || 'Phantom');

    const mockUser = {
      id: walletAddress,
      wallet_address: walletAddress,
      email: null,
      created_at: new Date().toISOString()
    };

    return {
      user: mockUser,
      session: null,
      walletAddress,
      isNewUser: true
    };
  } catch (error) {
    console.error('Wallet sign-in error:', error);
    throw error;
  }
};

// Sign out
export const logout = async () => {
  try {
    await disconnectWallet();

    try {
      const session = await getSession();
      if (session) {
        const { error } = await supabase.auth.signOut();
        if (error) console.error('Supabase signout error:', error);
      }
    } catch (error) {
      console.log('No Supabase session to sign out from');
    }

    localStorage.removeItem('wallet_address');
    localStorage.removeItem('connected_wallet');
    localStorage.removeItem('user_id');
  } catch (error) {
    console.error('Logout error:', error);
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
  const walletAddress = localStorage.getItem('wallet_address');
  const connectedWallet = localStorage.getItem('connected_wallet');

  if (walletAddress) {
    return {
      id: walletAddress,
      wallet_address: walletAddress,
      connected_wallet: connectedWallet,
      email: null
    };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;

    return {
      ...user,
      wallet_address: walletAddress,
      connected_wallet: connectedWallet
    };
  } catch (error) {
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

// Legacy compatibility functions
export const login = async (email, walletAddress) => {
  if (walletAddress) {
    return signInWithWallet(walletAddress);
  } else if (email) {
    return signInWithMagicLink(email);
  }
  throw new Error('Either email or wallet address is required');
};

export const updateUserEmail = async (email) => {
  const { data, error } = await supabase.auth.updateUser({ email });
  return { data, error };
};
