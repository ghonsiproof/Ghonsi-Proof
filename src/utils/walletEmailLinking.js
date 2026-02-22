import { supabase } from '../config/supabaseClient';

// Link a wallet to an existing email account
export const linkWalletToEmail = async (userId, walletAddress, walletType = 'solana') => {
  try {
    console.log('[v0] Linking wallet to email user:', userId);
    
    const { data, error } = await supabase
      .from('users')
      .update({
        wallet_address: walletAddress,
        wallet_type: walletType,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    console.log('[v0] Wallet linked successfully:', walletAddress);
    return { success: true, user: data };
  } catch (error) {
    console.error('[v0] Error linking wallet to email:', error);
    throw error;
  }
};

// Link email to an existing wallet user
export const linkEmailToWallet = async (userId, email) => {
  try {
    console.log('[v0] Linking email to wallet user:', userId);
    
    const { data, error } = await supabase
      .from('users')
      .update({
        email,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    console.log('[v0] Email linked successfully:', email);
    return { success: true, user: data };
  } catch (error) {
    console.error('[v0] Error linking email to wallet:', error);
    throw error;
  }
};

// Create new wallet user with onboarding data
export const createWalletOnboardingUser = async (walletAddress, walletType, onboardingData) => {
  try {
    console.log('[v0] Creating new wallet user:', walletAddress);
    
    const { name, email } = onboardingData;
    
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([
        {
          wallet_address: walletAddress,
          wallet_type: walletType,
          name: name || null,
          email: email || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (createError) throw createError;
    console.log('[v0] Wallet user created:', newUser.id);
    return { success: true, user: newUser };
  } catch (error) {
    console.error('[v0] Error creating wallet user:', error);
    throw error;
  }
};

// Update user profile with onboarding data
export const updateUserProfile = async (userId, profileData) => {
  try {
    console.log('[v0] Updating user profile:', userId);
    
    const { data, error } = await supabase
      .from('users')
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    console.log('[v0] Profile updated successfully');
    return { success: true, user: data };
  } catch (error) {
    console.error('[v0] Error updating profile:', error);
    throw error;
  }
};

// Get user by wallet address
export const getUserByWalletAddress = async (walletAddress) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single();

    if (error && error.code === 'PGRST116') {
      return null; // User doesn't exist
    }
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[v0] Error fetching user by wallet:', error);
    return null;
  }
};

// Get user by email
export const getUserByEmail = async (email) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code === 'PGRST116') {
      return null; // User doesn't exist
    }
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('[v0] Error fetching user by email:', error);
    return null;
  }
};
