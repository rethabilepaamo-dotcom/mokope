import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { api } from '../api.js';

const AuthContext = createContext(null);
const KEY = 'lch_staff_token';

const readToken = () => {
  try {
    return localStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken);

  const login = useCallback(async (password) => {
    const { token: t } = await api.login(password);
    try {
      localStorage.setItem(KEY, t);
    } catch {
      /* ignore */
    }
    setToken(t);
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setToken('');
  }, []);

  const value = useMemo(() => ({ token, isStaff: Boolean(token), login, logout }), [token, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
