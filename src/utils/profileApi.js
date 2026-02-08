// Corrected import: Go up one level, then into 'config'
import { supabase } from '../config/supabaseClient'; 

/**
 * Fetches a user profile by their UUID (user_id)
 * and joins with the users table for email/wallet info.
 */
export const getProfileById = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      users (
        email,
        wallet_address
      )
    `)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile by ID:', error);
    return null;
  }
  return data;
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
  if (error) return null;
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

/**
 * Required for createProfile.jsx
 */
export const createProfile = async (profileData) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([profileData])
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