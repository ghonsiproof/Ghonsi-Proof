import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Log the values for debugging
console.log('SUPABASE_URL:', supabaseUrl);
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');

// Ensure variables exist before initialization
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Key are required. Check your .env file.');
}

// Custom fetch with timeout to prevent hanging on network issues
const fetchWithTimeout = (url, options = {}, timeout = 30000) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Request timeout after ${timeout}ms`));
    }, timeout);
    
    fetch(url, {
      ...options,
      // Ensure we don't use cached results for auth requests
      cache: 'no-store',
    })
      .then((response) => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
};

// Create Supabase client with lock-safe configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Add flow type to reduce lock conflicts
    flowType: 'pkce',
  },
  // Use global fetch with timeout for all Supabase requests
  global: {
    fetch: (url, options) => fetchWithTimeout(url, options, 30000),
  },
});

console.log(supabase);
// Storage bucket name for proof files
export const PROOF_FILES_BUCKET = "proof-files";

// Helper to get public URL for uploaded files
export const getPublicUrl = (bucket, filePath) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
};

// Helper to check if user is authenticated
export const isAuthenticated = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return !!session;
};

// Helper to get current user
export const getCurrentUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
};
