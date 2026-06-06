import { createContext, useContext, useState, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout } from '../api/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('martflow_user')); }
    catch { return null; }
  });

  const signIn = useCallback(async (username, password) => {
    const data = await apiLogin(username, password);
    localStorage.setItem('martflow_token', data.access_token);
    localStorage.setItem('martflow_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const signOut = useCallback(async () => {
    await apiLogout();
    localStorage.removeItem('martflow_token');
    localStorage.removeItem('martflow_user');
    setUser(null);
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
