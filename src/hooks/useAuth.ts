import { useState, useCallback, useEffect } from 'react';

const ADMIN_EMAIL = 'admin@medifranco.pt';
const ADMIN_PASSWORD = 'medifranco2025';
const AUTH_KEY = 'medifranco_admin_auth';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authData = sessionStorage.getItem(AUTH_KEY);
    if (authData) {
      try {
        const { timestamp } = JSON.parse(authData);
        // Session expires after 24 hours
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem(AUTH_KEY);
        }
      } catch {
        sessionStorage.removeItem(AUTH_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, password: string): boolean => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, JSON.stringify({ timestamp: Date.now() }));
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, isLoading, login, logout };
}
