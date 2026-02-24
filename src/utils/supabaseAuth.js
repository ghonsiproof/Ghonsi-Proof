import { supabase } from '../config/supabaseClient';

/**
 * Authentication Utilities using Supabase Auth
 */

// Generate a UUID (compatible with Supabase's uuid_generate_v4)
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
};

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

// Verify OTP code - Enhanced to check for wallet linking
export const verifyOTP = async (email, token) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email'
  });

  if (error) throw error;

  // Check if user exists in users table, create if not
  if (data.user) {
    // First check if there's a user with this email
    const { data: existingByEmail, error: emailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    let user = existingByEmail;
    let isNewUser = false;

    if (emailError && emailError.code === 'PGRST116') {
      // User doesn't exist with this email - create new user
      isNewUser = true;
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{
          id: data.user.id,
          email: email,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) {
        console.error('Error creating user profile:', createError);
      } else {
        user = newUser;
      }
    } else if (existingByEmail) {
      // User exists with email - sync the ID with Supabase Auth
      if (!existingByEmail.id || existingByEmail.id !== data.user.id) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ id: data.user.id })
          .eq('email', email);
        
        if (!updateError && user) {
          user.id = data.user.id;
        }
      }
    }

    return {
      ...data,
      user: user,
      isNewUser
    };
  }

  return data;
};

// Check if email exists in users table (for linking validation)
export const checkEmailExists = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, wallet_address, email')
    .eq('email', email)
    .single();
  
  if (error && error.code === 'PGRST116') {
    return null;
  }
  if (error) throw error;
  return data;
};

// Check if wallet exists in users table (for linking validation)
export const checkWalletExists = async (walletAddress) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, wallet_address, email')
    .eq('wallet_address', walletAddress)
    .single();
  
  if (error && error.code === 'PGRST116') {
    return null;
  }
  if (error) throw error;
  return data;
};

// Merge wallet user with email user
export const mergeWalletToEmail = async (walletUserId, emailUserId) => {
  try {
    const { data: walletUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', walletUserId)
      .single();

    if (!walletUser) {
      throw new Error('Wallet user not found');
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ wallet_address: walletUser.wallet_address })
      .eq('id', emailUserId);

    if (updateError) throw updateError;

    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', walletUserId);

    if (deleteError) {
      console.error('Error deleting old wallet user:', deleteError);
    }

    await supabase
      .from('profiles')
      .update({ user_id: emailUserId })
      .eq('user_id', walletUserId);

    await supabase
      .from('proofs')
      .update({ user_id: emailUserId })
      .eq('user_id', walletUserId);

    return { success: true };
  } catch (error) {
    console.error('Error merging accounts:', error);
    throw error;
  }
};

// Merge email user with wallet user
export const mergeEmailToWallet = async (emailUserId, walletUserId) => {
  try {
    const { data: emailUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', emailUserId)
      .single();

    if (!emailUser) {
      throw new Error('Email user not found');
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ email: emailUser.email })
      .eq('id', walletUserId);

    if (updateError) throw updateError;

    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', emailUserId);

    if (deleteError) {
      console.error('Error deleting old email user:', deleteError);
    }

    await supabase
      .from('profiles')
      .update({ user_id: walletUserId })
      .eq('user_id', emailUserId);

    await supabase
      .from('proofs')
      .update({ user_id: walletUserId })
      .eq('user_id', emailUserId);

    return { success: true };
  } catch (error) {
    console.error('Error merging accounts:', error);
    throw error;
  }
};

// Link wallet to existing email user
export const linkWalletToUser = async (userId, walletAddress) => {
  try {
    const { data: existingWallet } = await supabase
      .from('users')
      .select('id, email')
      .eq('wallet_address', walletAddress)
      .single();

    if (existingWallet && existingWallet.id !== userId) {
      if (existingWallet.email) {
        throw new Error('This wallet is already linked to another account. Please use a different wallet.');
      }
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', existingWallet.id);
      
      if (deleteError) throw deleteError;
    }

    const { data: currentUser } = await supabase
      .from('users')
      .select('wallet_address')
      .eq('id', userId)
      .single();

    if (currentUser?.wallet_address) {
      throw new Error('You already have a wallet linked. Please disconnect your current wallet first.');
    }

    const { data, error } = await supabase
      .from('users')
      .update({ wallet_address: walletAddress })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, user: data };
  } catch (error) {
    console.error('Error linking wallet:', error);
    throw error;
  }
};

// Link email to existing wallet user
export const linkEmailToUser = async (userId, email) => {
  try {
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id, wallet_address')
      .eq('email', email)
      .single();

    if (existingEmail && existingEmail.id !== userId) {
      throw new Error('This email is already in use. Please use a different email.');
    }

    const { data: currentUser } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    if (currentUser?.email) {
      throw new Error('You already have an email linked. Please contact support to change your email.');
    }

    const { data, error } = await supabase
      .from('users')
      .update({ email: email })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, user: data };
  } catch (error) {
    console.error('Error linking email:', error);
    throw error;
  }
};

// Sign in with wallet (Solana) - Web3 authentication
export const signInWithWallet = async (walletAddress, signatureData) => {
  try {
    console.log('[v0] Signing in with wallet:', walletAddress);

    // Check if user exists with this wallet
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    let user = existingUser;
    let isNewUser = false;
    let userId = null;

    if (fetchError && fetchError.code === 'PGRST116') {
      // User doesn't exist with this wallet - create new user with UUID
      isNewUser = true;
      userId = generateUUID();
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            wallet_address: walletAddress,
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (createError) throw createError;
      user = newUser;
      console.log('[v0] Created new user with wallet:', walletAddress, 'ID:', userId);
    } else if (fetchError) {
      throw fetchError;
    } else if (existingUser) {
      userId = existingUser.id;
      console.log('[v0] Existing user found:', userId);
    }

    // Store wallet connection info in localStorage for reference
    localStorage.setItem('wallet_address', walletAddress);
    localStorage.setItem('connected_wallet', signatureData?.walletName || 'Phantom');
    localStorage.setItem('user_id', userId);
    localStorage.setItem('wallet_signature', signatureData?.signature || '');
    localStorage.setItem('wallet_public_key', signatureData?.publicKey || '');

    // Create a JWT-like token for session persistence
    const sessionToken = generateUUID();
    localStorage.setItem('session_token', sessionToken);
    localStorage.setItem('session_created', new Date().toISOString());

    console.log('[v0] User authenticated with session:', userId);

    return {
      user,
      walletAddress,
      isNewUser,
      userId,
      signature: signatureData?.signature,
      sessionToken
    };
  } catch (error) {
    console.error('[v0] Wallet sign-in error:', error);
    throw error;
  }
};

// Sign out - clears all session data
export const logout = async () => {
  try {
    try {
      const session = await getSession();
      if (session) {
        const { error } = await supabase.auth.signOut();
        if (error) console.log('Supabase signout error:', error);
      }
    } catch (error) {
      console.log('[v0] No Supabase session to sign out from');
    }

    // Clear all wallet and session data
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('connected_wallet');
    localStorage.removeItem('user_id');
    localStorage.removeItem('wallet_signature');
    localStorage.removeItem('wallet_public_key');
    localStorage.removeItem('session_token');
    localStorage.removeItem('session_created');
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userEmail');

    console.log('[v0] User logged out, session cleared');
  } catch (error) {
    console.error('[v0] Logout error:', error);
    // Force clear all data anyway
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('connected_wallet');
    localStorage.removeItem('user_id');
    localStorage.removeItem('wallet_signature');
    localStorage.removeItem('wallet_public_key');
    localStorage.removeItem('session_token');
    localStorage.removeItem('session_created');
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userEmail');
  }
};

// Get current session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
};

// Get current user - Supports both Supabase session and wallet session
export const getCurrentUser = async () => {
  try {
    // First check Supabase session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('[v0] Error getting session:', sessionError);
    }

    if (session?.user) {
      // Get user profile from users table
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log('[v0] Error fetching user profile:', error);
      }

      // Return the user data with session info
      return {
        ...user,
        id: session.user.id,
        email: session.user.email || user?.email || null,
        wallet_address: user?.wallet_address || null,
      };
    }

    // Fall back to wallet session if no Supabase session
    console.log('[v0] No Supabase session, checking wallet session');
    const walletAddress = localStorage.getItem('wallet_address');
    const userId = localStorage.getItem('user_id');

    if (!walletAddress || !userId) {
      console.log('[v0] No wallet session found either');
      return null;
    }

    // Get user profile from users table using wallet address
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('wallet_address', walletAddress)
      .single();

    if (error) {
      console.log('[v0] Error fetching wallet user profile:', error);
      return null;
    }

    console.log('[v0] Wallet user found:', userId);
    return {
      ...user,
      id: userId,
      email: user?.email || null,
      wallet_address: walletAddress,
    };
  } catch (error) {
    console.log('[v0] No authenticated user found:', error);
    return null;
  }
};

// Check if user is authenticated - supports both Supabase session and wallet session
export const isAuthenticated = async () => {
  try {
    // Check Supabase session first
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      return true;
    }

    // Fall back to wallet session check
    const walletAddress = localStorage.getItem('wallet_address');
    const sessionToken = localStorage.getItem('session_token');
    const userId = localStorage.getItem('user_id');

    if (walletAddress && sessionToken && userId) {
      // Verify user still exists in database
      const { data: user, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (!error && user) {
        console.log('[v0] Valid wallet session found');
        return true;
      }
    }

    return false;
  } catch (error) {
    console.log('[v0] Error checking authentication:', error);
    return false;
  }
};

// Get wallet session info
export const getWalletSession = () => {
  return {
    walletAddress: localStorage.getItem('wallet_address'),
    userId: localStorage.getItem('user_id'),
    sessionToken: localStorage.getItem('session_token'),
    connectedWallet: localStorage.getItem('connected_wallet'),
  };
};

// Verify wallet session is valid
export const verifyWalletSession = async () => {
  const session = getWalletSession();
  
  if (!session.walletAddress || !session.userId) {
    return false;
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, wallet_address')
      .eq('id', session.userId)
      .eq('wallet_address', session.walletAddress)
      .single();

    if (error || !user) {
      console.log('[v0] Wallet session verification failed');
      return false;
    }

    console.log('[v0] Wallet session verified');
    return true;
  } catch (error) {
    console.error('[v0] Error verifying wallet session:', error);
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

// Update user email in both Supabase Auth and users table
export const updateUserEmailWithSync = async (userId, email) => {
  try {
    // First update Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.updateUser({ email });
    if (authError) throw authError;

    // Then update users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .update({ email: email })
      .eq('id', userId)
      .select()
      .single();

    if (userError) throw userError;

    return { success: true, authData, userData };
  } catch (error) {
    console.error('Error updating email with sync:', error);
    throw error;
  }
};
