import { createContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, if a token exists, verify it against /auth/me so a
  // stale/expired token doesn't silently leave someone "logged in" to a
  // broken state.
  useEffect(() => {
    const token = localStorage.getItem('cms_token');
    const storedUser = localStorage.getItem('cms_user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      authService
        .getMe()
        .catch(() => {
          localStorage.removeItem('cms_token');
          localStorage.removeItem('cms_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    const { token, user: loggedInUser } = res.data.data;
    localStorage.setItem('cms_token', token);
    localStorage.setItem('cms_user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = () => {
    localStorage.removeItem('cms_token');
    localStorage.removeItem('cms_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}
