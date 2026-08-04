import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '/utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

// Sentinel thrown by signUp when Supabase requires email confirmation before login
export const EMAIL_CONFIRMATION_REQUIRED = 'EMAIL_CONFIRMATION_REQUIRED';

// Create a singleton Supabase client for the frontend
export const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'mealoptimiza-auth',
  },
});

// Helper function to get the current user's access token
export async function getAccessToken() {
  try {
    console.log('=== GET ACCESS TOKEN START ===');
    // Always get fresh session from Supabase (it handles caching internally)
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Error getting session:', error);
      return null;
    }
    
    if (!session) {
      console.log('❌ No active session found');
      return null;
    }
    
    console.log('✅ Session found for user:', session.user?.email);
    console.log('Token expires at:', new Date((session.expires_at || 0) * 1000).toISOString());
    
    // Check if token is expired (with 60 second buffer)
    const expiresAt = session.expires_at || 0;
    const now = Math.floor(Date.now() / 1000);
    const isExpired = expiresAt < (now + 60);
    
    console.log('Token status:', {
      expiresAt: new Date(expiresAt * 1000).toISOString(),
      now: new Date(now * 1000).toISOString(),
      isExpired,
      timeUntilExpiry: expiresAt - now,
    });
    
    if (isExpired) {
      console.log('⚠️ Token is expired or expiring soon, refreshing...');
      // Try to refresh the session
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError) {
        console.error('❌ Failed to refresh session:', refreshError);
        // Clear the invalid session
        await supabase.auth.signOut();
        return null;
      }
      
      if (!refreshedSession) {
        console.log('❌ No session after refresh');
        return null;
      }
      
      console.log('✅ Session refreshed successfully');
      console.log('New token length:', refreshedSession.access_token.length);
      console.log('=== GET ACCESS TOKEN END ===');
      return refreshedSession.access_token;
    }
    
    console.log('✅ Token is valid, length:', session.access_token.length);
    console.log('Token preview:', `${session.access_token.substring(0, 20)}...${session.access_token.substring(session.access_token.length - 20)}`);
    console.log('=== GET ACCESS TOKEN END ===');
    return session.access_token;
  } catch (error) {
    console.error('❌ Failed to get access token:', error);
    console.log('=== GET ACCESS TOKEN END ===');
    return null;
  }
}

// Helper function to get the current user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}