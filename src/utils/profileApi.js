// Corrected import: Go up one level, then into 'config'
import { supabase } from '../config/supabaseClient';

/**
 * Profile Management API
 */

// Generate 9-digit UID from user_id
const generateUID = (userId) => {
  if (!userId) return '000000000';
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash).toString().padStart(9, '0').slice(0, 9);
};



/**
 * Fetches profile for the logged-in user
 */
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, users(email, wallet_address)')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== "PGRST116") throw error; // Ignore "not found" error

  // If profile exists but has no UID or email, update it
  if (data) {
    const updates = {};
    if (!data.uid) {
      updates.uid = generateUID(userId);
      data.uid = updates.uid;
    }
    if (!data.email) {
      // First try to get from Supabase Auth
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          updates.email = user.email;
          data.email = updates.email;
        }
      } catch (error) {
        // If no Supabase auth session, email may be null for wallet-only users
        console.log('No Supabase auth session, email may be null for wallet user');
      }
    }
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", userId);
      if (updateError) console.error('Profile update error:', updateError);
    }
  }

  // Map wallet_address from nested users table to top-level profile object
  // This ensures the dashboard can access profile.wallet_address correctly
  if (data?.users?.wallet_address) {
    data.wallet_address = data.users.wallet_address;
  }

  return data;
};

/**
 * Required for publicProfile.jsx logic
 */
export const getProfileByWallet = async (walletAddress) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, users!inner(*)')
    .eq('users.wallet_address', walletAddress)
    .single();
  if (error) return null;
  return data;
};

export const getProfileById = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, users(*)')
    .eq('user_id', userId)
    .single();
  if (error) return null;
  return data;
};

/**
 * Required for createProfile.jsx
 */
export const createProfile = async (profileData) => {
  // Try to get Supabase auth user first
  let userId = null;
  let email = null;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      userId = user.id;
      email = user.email;
    }
  } catch (error) {
    console.log('No Supabase auth session');
  }

  // If no Supabase session, use wallet session data from profileData
  if (!userId) {
    userId = profileData.user_id;
    if (!userId) {
      throw new Error("User not authenticated - no user ID found");
    }
    email = profileData.email || null;
  }

  // Use email from profileData if provided, otherwise use auth email
  if (profileData.email) {
    email = profileData.email;
  }

  const uid = generateUID(userId);

  const { data, error } = await supabase
    .from("profiles")
    .insert([{
      user_id: userId,
      uid,
      email,
      ...profileData,
      created_at: new Date().toISOString(),
    }])
    .select();

  if (error) throw error;
  return data[0];
};

/**
 * Required for createProfile.jsx
 */
export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select();
  if (error) throw error;
  return data[0];
};

/**
 * Required for home.jsx logic
 */
export const fetchProfiles = async () => {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) return [];
  return data;
};

export const profileExists = async (userId) => {
  const { data } = await supabase.from('profiles').select('id').eq('user_id', userId).single();
  return !!data;
};
