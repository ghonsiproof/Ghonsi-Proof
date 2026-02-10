import { supabase } from "../config/supabaseClient";

// Run this once to update all profiles with missing emails
export const updateAllProfileEmails = async () => {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, email')
    .is('email', null);

  for (const profile of profiles || []) {
    const { data: { user } } = await supabase.auth.admin.getUserById(profile.user_id);
    if (user?.email) {
      await supabase
        .from('profiles')
        .update({ email: user.email })
        .eq('user_id', profile.user_id);
    }
  }
};
