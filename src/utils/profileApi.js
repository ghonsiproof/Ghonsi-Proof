import { supabase } from "../config/supabaseClient";

/**
 * Profile Management API
 */

// Create a new profile
export const createProfile = async (profileData) => {
  const user = await supabase.auth.getUser();

  if (!user.data.user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      user_id: user.data.user.id,
      ...profileData,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Get profile by user ID
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error; // Ignore "not found" error
  return data;
};
//
export const fetchProfiles = async () => {
  const { data: profiles, error: proErr } = await supabase
    .from("profile")
    .select("*");
  console.log(profiles);

  // const { data: proofs, error: proofErr } = await supabase
  //   .from("proof")
  //   .select(`*, files(*)`);

  // const combined = profiles.map((profile) => ({
  //   ...profile,
  //   proofs: proofs.filter((p) => p.user_id === profile.user_id),
  // }));

  if (proErr) {
    throw new Error(proErr.message);
  }

  return [];
};

// Get profile by wallet address (for public profiles)
export const getProfileByWallet = async (walletAddress) => {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      *,
      users!inner(wallet_address, email)
    `
    )
    .eq("users.wallet_address", walletAddress)
    .eq("is_public", true)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
};

// Update profile
export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete profile
export const deleteProfile = async (userId) => {
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("user_id", userId);

  if (error) throw error;
  return true;
};

// Check if profile exists
export const profileExists = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return !!data;
};
