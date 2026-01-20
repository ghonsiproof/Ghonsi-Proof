import { supabase } from '../config/supabaseClient';

export const getMessages = async (userId) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getUnreadCount = async (userId) => {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  
  if (error) throw error;
  return count || 0;
};

export const markAsRead = async (messageId) => {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('id', messageId);
  
  if (error) throw error;
};

export const createWelcomeMessage = async (userId, firstName) => {
  const message = {
    user_id: userId,
    title: 'Welcome to Ghonsi Proof',
    content: `Welcome, ${firstName}, to Ghonsi Proof. You've taken the first step toward giving your work the visibility it deserves. Begin by uploading your past work records on the Upload Proof page, securely, transparently, and permanently. Remember the world is your stage, make your work impossible to ignore`,
    is_read: false,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('messages')
    .insert([message])
    .select();
  
  if (error) throw error;
  return data[0];
};

export const createPortfolioRequestMessage = async (profileOwnerId, requesterName) => {
  const message = {
    user_id: profileOwnerId,
    title: 'Portfolio Request',
    content: `${requesterName} has requested for your profile`,
    is_read: false,
    created_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('messages')
    .insert([message])
    .select();
  
  if (error) throw error;
  return data[0];
};
