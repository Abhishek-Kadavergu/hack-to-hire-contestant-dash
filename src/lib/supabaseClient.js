import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'dummy_key';

let client;

// Mock fallback client to prevent UI crashes if URL is missing/invalid
const mockClient = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
    signUp: async () => { throw new Error("Supabase is not configured properly. Check .env") },
    signInWithPassword: async () => { throw new Error("Supabase is not configured properly. Check .env") },
    signOut: async () => {}
  },
  from: () => ({
    insert: async () => { throw new Error("Supabase is not configured properly. Check .env") },
    select: () => ({ error: null, data: [] })
  }),
  storage: {
    from: () => ({
      upload: async () => { throw new Error("Supabase is not configured properly. Check .env") },
      getPublicUrl: () => ({ data: { publicUrl: '' } })
    })
  },
  functions: {
    invoke: async () => { throw new Error("Supabase is not configured properly. Check .env") }
  }
};

try {
  // Validate that it's actually a URL to prevent hard crashes
  new URL(supabaseUrl);
  client = createClient(supabaseUrl, supabaseKey);
} catch (error) {
  console.warn("Supabase initialization failed. Falling back to mock client. Please check your VITE_SUPABASE_URL in .env it must be a valid https URL.", error.message);
  client = mockClient;
}

export const supabase = client;
