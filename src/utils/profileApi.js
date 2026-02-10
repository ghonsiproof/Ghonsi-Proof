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
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        updates.email = user.email;
        data.email = updates.email;
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
  const user = await supabase.auth.getUser();

  if (!user.data.user) {
    throw new Error("User not authenticated");
  }

  const uid = generateUID(user.data.user.id);
  const email = user.data.user.email;

  const { data, error } = await supabase
    .from("profiles")
    .insert([{
      user_id: user.data.user.id,
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