import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get the Supabase URL and key from app.json extra
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || '';
const supabaseKey = Constants.expoConfig?.extra?.supabaseKey || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or key is missing. Please check your app.json configuration.');
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});
