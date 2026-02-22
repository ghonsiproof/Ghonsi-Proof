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

  // Ensure users table row exists (synced with auth.uid())
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (!existingUser) {
    await supabase.from('users').insert({
      id: data.user.id,
      email: data.user.email,
      created_at: new Date().toISOString()
    });
    console.log('[auth] Created users row for new signup:', data.user.id);
  }

  return data;
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  // Ensure users table row exists (synced with auth.uid())
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (!existingUser) {
    await supabase.from('users').insert({
      id: data.user.id,
      email: data.user.email,
      created_at: new Date().toISOString()
    });
    console.log('[auth] Created users row for email sign-in:', data.user.id);
  }

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

// Sign in with wallet (Solana) - supports binding to existing accounts
export const signInWithWallet = async (walletAddress, signatureData = {}) => {
  try {
    console.log('[wallet v5] Connecting wallet:', walletAddress);

    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = session?.user?.id;

    // Check if this wallet is already used somewhere
    const { data: existing } = await supabase
      .from('users')
      .select('id, email')
      .eq('wallet_address', walletAddress)
      .single();

    let user;

    if (existing) {
      if (session && existing.id === currentUserId) {
        // Already linked to current logged-in user → good
        console.log('[wallet v5] Wallet already linked to this account');
        const { data: u } = await supabase.from('users').select('*').eq('id', currentUserId).single();
        user = u;
      } else if (!session) {
        // Pure wallet login → use existing
        console.log('[wallet v5] Pure wallet login – using existing user');
        const { data: u } = await supabase.from('users').select('*').eq('id', existing.id).single();
        user = u;
      } else {
        // Wallet belongs to someone else → allow override (you can make stricter later)
        console.log('[wallet v5] Overwriting wallet link to current user');
        const { data: updated } = await supabase
          .from('users')
          .update({ wallet_address: walletAddress })
          .eq('id', currentUserId)
          .select()
          .single();
        user = updated;
      }
    } else {
      // New wallet
      if (session && currentUserId) {
        // Bind to current email user
        console.log('[wallet v5] Binding new wallet to email account');
        const { data: updated } = await supabase
          .from('users')
          .update({ wallet_address: walletAddress })
          .eq('id', currentUserId)
          .select()
          .single();
        user = updated || { id: currentUserId };
      } else {
        // Create new wallet-only user
        console.log('[wallet v5] Creating new wallet user');
        const { data: newUser } = await supabase
          .from('users')
          .insert({ wallet_address: walletAddress, created_at: new Date().toISOString() })
          .select()
          .single();
        user = newUser;
      }
    }

    // Save to localStorage
    localStorage.setItem('wallet_address', walletAddress);
    localStorage.setItem('connected_wallet', signatureData?.walletName || 'Unknown');
    localStorage.setItem('user_id', user.id);

    console.log('[wallet v5] Success – user:', user.id);

    return { user, session: session || null, walletAddress };
  } catch (err) {
    console.error('[wallet v5] Failed:', err.message);
    throw err;
  }
};

// Sign out
export const logout = async () => {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('Supabase signout failed:', err);
  }
  localStorage.removeItem('wallet_address');
  localStorage.removeItem('connected_wallet');
  localStorage.removeItem('user_id');
};

// Get current session
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) console.error('getSession error:', error);
  return session;
};

// Get current user – reliable source for both auth & wallet
export const getCurrentUser = async () => {
  try {
    // Priority 1: Supabase auth session
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (authUser) {
      let { data: row } = await supabase.from('users').select('*').eq('id', authUser.id).single();

      if (!row) {
        await supabase.from('users').insert({
          id: authUser.id,
          email: authUser.email,
          created_at: new Date().toISOString()
        });
        row = { id: authUser.id, email: authUser.email };
      }

      return {
        ...authUser,
        ...row,
        wallet_address: row?.wallet_address || localStorage.getItem('wallet_address') || null,
        connected_wallet: localStorage.getItem('connected_wallet') || null
      };
    }

    // Priority 2: Wallet-only fallback
    const walletAddress = localStorage.getItem('wallet_address');
    const userId = localStorage.getItem('user_id');
    const connectedWallet = localStorage.getItem('connected_wallet');

    if (walletAddress && userId) {
      const { data: row } = await supabase.from('users').select('*').eq('id', userId).single();

      return {
        id: userId,
        wallet_address: walletAddress,
        connected_wallet: connectedWallet,
        email: row?.email || null
      };
    }

    return null;
  } catch (error) {
    console.error('getCurrentUser failed:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const session = await getSession();
    return !!(session || localStorage.getItem('wallet_address'));
  } catch (error) {
    console.error('isAuthenticated check failed:', error);
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

// Legacy compatibility
export const login = async (email, walletAddress) => {
  if (walletAddress) return signInWithWallet(walletAddress);
  if (email) return signInWithMagicLink(email);
  throw new Error('Email or wallet required');
};

export const updateUserEmail = async (email) => {
  const { data, error } = await supabase.auth.updateUser({ email });
  return { data, error };
};