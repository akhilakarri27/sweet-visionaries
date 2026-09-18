import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, UserRole } from '../types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>('customer');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync profile and record login log in Supabase database
  const recordLoginAndSyncProfile = async (
    activeUser: User,
    metaOverrides?: { fullName?: string; phone?: string }
  ): Promise<Profile> => {
    const meta = activeUser.user_metadata || {};
    const fullName = metaOverrides?.fullName || meta.full_name || activeUser.email?.split('@')[0] || 'Valued Customer';
    const phone = metaOverrides?.phone || meta.phone || null;
    const email = activeUser.email || null;
    const now = new Date().toISOString();

    const profileData: Profile = {
      id: activeUser.id,
      role: (meta.role as UserRole) || 'customer',
      full_name: fullName,
      email: email,
      phone: phone,
      last_login_at: now,
      created_at: activeUser.created_at || now,
      updated_at: now,
    };

    try {
      // 1. Upsert Profile into public.profiles
      const { data: savedProfile, error: upsertErr } = await supabase
        .from('profiles')
        .upsert(
          {
            id: activeUser.id,
            full_name: fullName,
            email: email,
            phone: phone,
            role: profileData.role,
            last_login_at: now,
            updated_at: now,
          },
          { onConflict: 'id' }
        )
        .select()
        .maybeSingle();

      if (!upsertErr && savedProfile) {
        setProfile(savedProfile as Profile);
        setRole((savedProfile.role as UserRole) || 'customer');
      } else {
        setProfile(profileData);
        setRole(profileData.role);
      }
    } catch (err) {
      console.warn('Profile sync note:', err);
      setProfile(profileData);
      setRole(profileData.role);
    }

    try {
      // 2. Record login activity in public.login_logs
      await supabase.from('login_logs').insert({
        user_id: activeUser.id,
        email: email || 'unknown',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'web-browser',
        logged_in_at: now,
      });
    } catch (logErr) {
      console.warn('Login log recording note:', logErr);
    }

    return profileData;
  };

  const fetchProfile = async (userId: string, currentUser?: User | null) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data as Profile);
        setRole((data.role as UserRole) || 'customer');
      } else if (currentUser) {
        // Fallback and sync profile to database
        await recordLoginAndSyncProfile(currentUser);
      }
    } catch (err) {
      console.warn('Profile fetch note:', err);
      if (currentUser) {
        await recordLoginAndSyncProfile(currentUser);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    // 1. Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id, session.user);
      }
      if (isMounted) setIsLoading(false);
    }).catch((err) => {
      console.error('Error fetching Supabase session:', err);
      if (isMounted) setIsLoading(false);
    });

    // 2. Listen for auth state changes (Sign In, Sign Out, Token Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          await recordLoginAndSyncProfile(newSession.user);
        } else {
          await fetchProfile(newSession.user.id, newSession.user);
        }
      } else {
        setProfile(null);
        setRole('customer');
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error('Supabase Auth signIn error:', error.message);
        return { data: null, error };
      }

      if (data.session && data.user) {
        setSession(data.session);
        setUser(data.user);
        await recordLoginAndSyncProfile(data.user);
      }

      return { data, error: null };
    } catch (err: any) {
      console.error('signIn exception:', err);
      return { data: null, error: err };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone ? phone.trim() : null,
          },
        },
      });

      if (error) {
        console.error('Supabase Auth signUp error:', error.message);
        return { data: null, error };
      }

      // If user session is returned immediately (e.g. auto-confirm enabled)
      if (data.session && data.user) {
        setSession(data.session);
        setUser(data.user);
        await recordLoginAndSyncProfile(data.user, { fullName, phone });
      }

      return { data, error: null };
    } catch (err: any) {
      console.error('signUp exception:', err);
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('signOut error note:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setRole('customer');
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
