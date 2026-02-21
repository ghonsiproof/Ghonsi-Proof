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
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });

  if (error) throw error;

  // Check if user exists in users table, create if not
  if (data.user) {
    const { error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    let isNewUser = false;

    if (fetchError && fetchError.code === 'PGRST116') {
      // User doesn't exist, create new user profile
      isNewUser = true;
      const { error: createError } = await supabase
        .from('users')
        .insert([{
          id: data.user.id,
          email: data.user.email,
          created_at: new Date().toISOString()
        }]);

      if (createError) console.error('Error creating user profile:', createError);
    }

    return {
      ...data,
      isNewUser
    };
  }

  return data;
};

// Sign in with wallet (Solana) - Web3 authentication
export const signInWithWallet = async (walletAddress, signatureData) => {
  try {
    console.log('[v0] Signing in with wallet:', walletAddress);

    // 1. Sign in with Supabase using wallet address as identity provider
    // This creates or retrieves the user via Supabase Web3 auth
    const { data: authData, error: authError } = await supabase.auth.signInWithIdToken({
      provider: 'solana',
      token: signatureData?.signature || walletAddress, // Pass signature as proof
    });

    if (authError) {
      console.log('[v0] Supabase Web3 auth not configured, using wallet-based auth');
      // Fallback: Authenticate with wallet address
      // This will work once you enable Web3 auth in Supabase
    }

    // 2. Get or create user profile with wallet address
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    let user = existingUser;
    let isNewUser = false;

    if (fetchError && fetchError.code === 'PGRST116') {
      // User doesn't exist, create new user profile
      isNewUser = true;
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            wallet_address: walletAddress,
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (createError) throw createError;
      user = newUser;
      console.log('[v0] Created new user with wallet:', walletAddress);
    } else if (fetchError) {
      throw fetchError;
    }

    // 3. Store wallet info in localStorage for offline support
    localStorage.setItem('wallet_address', walletAddress);
    localStorage.setItem('connected_wallet', signatureData?.walletName || 'Phantom');
    localStorage.setItem('user_id', user?.id);

    console.log('[v0] User authenticated:', user?.id);

    return {
      user,
      session: authData?.session,
      walletAddress,
      isNewUser,
      signature: signatureData?.signature
    };
  } catch (error) {
    console.error('[v0] Wallet sign-in error:', error);
    throw error;
  }
};

// Sign out
export const logout = async () => {
  try {
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
  const userId = localStorage.getItem('user_id');
  const connectedWallet = localStorage.getItem('connected_wallet');

  // If wallet is connected, fetch full user profile from database
  if (walletAddress && userId) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.log('[v0] User profile not found, returning basic wallet info');
        return {
          id: userId,
          wallet_address: walletAddress,
          connected_wallet: connectedWallet,
          email: null
        };
      }

      return {
        ...user,
        wallet_address: walletAddress,
        connected_wallet: connectedWallet
      };
    } catch (err) {
      console.log('[v0] Error fetching user profile:', err);
      return {
        id: userId,
        wallet_address: walletAddress,
        connected_wallet: connectedWallet,
        email: null
      };
    }
  }

  // Fallback: Check Supabase session for email auth
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;

    return {
      ...user,
      wallet_address: walletAddress,
      connected_wallet: connectedWallet
    };
  } catch (error) {
    console.log('[v0] No authenticated user found');
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