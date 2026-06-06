import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

function buildUser(sbUser) {
  if (!sbUser) return null;
  return {
    id:       sbUser.id,
    username: sbUser.email?.split('@')[0] ?? sbUser.id,
    email:    sbUser.email,
    role:     sbUser.user_metadata?.role ?? 'staff',
    full_name: sbUser.user_metadata?.full_name ?? null,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('martflow_user')); }
    catch { return null; }
  });

  // ── Sync Supabase session on mount and on auth state changes ─────────────
  useEffect(() => {
    if (!supabase) return;

    // Get the current session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = buildUser(session.user);
        setUser(u);
        localStorage.setItem('martflow_user', JSON.stringify(u));
        localStorage.setItem('martflow_token', session.access_token);
      }
    });

    // Listen for future auth events (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const u = buildUser(session.user);
          setUser(u);
          localStorage.setItem('martflow_user', JSON.stringify(u));
          localStorage.setItem('martflow_token', session.access_token);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('martflow_user');
          localStorage.removeItem('martflow_token');
        } else if (event === 'TOKEN_REFRESHED' && session) {
          localStorage.setItem('martflow_token', session.access_token);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── signIn: used by Login page after successful Supabase auth ────────────
  const signIn = useCallback(async (email, password) => {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      const u = buildUser(data.user);
      setUser(u);
      localStorage.setItem('martflow_user', JSON.stringify(u));
      localStorage.setItem('martflow_token', data.session.access_token);
      return u;
    }
    // Mock fallback (no Supabase configured)
    if (password !== 'password123') throw new Error('Invalid credentials');
    const mockUsers = [
      { id: '1', username: 'admin',   email: 'admin@martflow.com',   role: 'admin'   },
      { id: '2', username: 'manager', email: 'manager@martflow.com', role: 'manager' },
      { id: '3', username: 'staff',   email: 'staff@martflow.com',   role: 'staff'   },
    ];
    const u = mockUsers.find(m => m.email === email || m.username === email.split('@')[0]) ?? mockUsers[0];
    setUser(u);
    localStorage.setItem('martflow_user', JSON.stringify(u));
    localStorage.setItem('martflow_token', 'mock-token');
    return u;
  }, []);

  // ── signOut ───────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('martflow_user');
    localStorage.removeItem('martflow_token');
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
