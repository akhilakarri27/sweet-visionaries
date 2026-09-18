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

  // Record login activity log only on explicit user sign-in/sign-up
  const recordLoginLog = async (activeUser: User, email?: string | null) => {
    try {
      const now = new Date().toISOString();
      await supabase.from('login_logs').insert({
        user_id: activeUser.id,
        email: email || activeUser.email || 'unknown',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'web-browser',
        logged_in_at: now,
      });
    } catch (logErr) {
      console.warn('Login log recording note:', logErr);
    }
  };

  // Sync or construct profile object safely without duplicate loop triggers
  const syncProfileData = async (
    activeUser: User,
    metaOverrides?: { fullName?: string; phone?: string }
  ): Promise<Profile> => {
    const meta = activeUser.user_metadata || {};
    const fullName = metaOverrides?.fullName || meta.full_name || activeUser.email?.split('@')[0] || 'Valued Customer';
    const phone = metaOverrides?.phone || meta.phone || null;
    const email = activeUser.email || null;
    const now = new Date().toISOString();

    const fallbackProfile: Profile = {
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
      const { data: savedProfile, error: upsertErr } = await supabase
        .from('profiles')
        .upsert(
          {
            id: activeUser.id,
            full_name: fullName,
            email: email,
            phone: phone,
            role: fallbackProfile.role,
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
        return savedProfile as Profile;
      } else {
        setProfile(fallbackProfile);
        setRole(fallbackProfile.role);
        return fallbackProfile;
      }
    } catch (err) {
      console.warn('Profile sync note:', err);
      setProfile(fallbackProfile);
      setRole(fallbackProfile.role);
      return fallbackProfile;
    }
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
        const meta = currentUser.user_metadata || {};
        const fallback: Profile = {
          id: currentUser.id,
          role: (meta.role as UserRole) || 'customer',
          full_name: meta.full_name || currentUser.email?.split('@')[0] || 'Valued Customer',
          email: currentUser.email || null,
          phone: meta.phone || null,
          created_at: currentUser.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setProfile(fallback);
        setRole(fallback.role);
      }
    } catch (err) {
      console.warn('Profile fetch note:', err);
      if (currentUser) {
        const meta = currentUser.user_metadata || {};
        setProfile({
          id: currentUser.id,
          role: (meta.role as UserRole) || 'customer',
          full_name: meta.full_name || currentUser.email?.split('@')[0] || 'Valued Customer',
          email: currentUser.email || null,
          phone: meta.phone || null,
          created_at: currentUser.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Single unified auth state listener (handles INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        await fetchProfile(newSession.user.id, newSession.user);
      } else {
        setProfile(null);
        setRole('customer');
      }
      if (isMounted) setIsLoading(false);
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
        await syncProfileData(data.user);
        await recordLoginLog(data.user, email);
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
        await syncProfileData(data.user, { fullName, phone });
        await recordLoginLog(data.user, email);
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
