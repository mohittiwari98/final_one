import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('quizflow_user');
    return raw ? JSON.parse(raw) : null;
  });

  const login = useCallback((token, userData) => {
    localStorage.setItem('quizflow_token', token);
    localStorage.setItem('quizflow_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('quizflow_token');
    localStorage.removeItem('quizflow_user');
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
