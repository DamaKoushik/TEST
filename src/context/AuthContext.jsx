import React, { createContext, useContext, useState, useEffect } from 'react';
import { GithubService } from '../services/githubService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { token, owner, repo, branch }
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [githubService, setGithubService] = useState(null);

  useEffect(() => {
    // Load from local storage
    const storedAuth = localStorage.getItem('media_app_auth');
    if (storedAuth) {
      const parsed = JSON.parse(storedAuth);
      // Validate or just initialize? For now, initialize.
      // Ideally we should validate token validity
      initializeSession(parsed);
    }
    setLoading(false);
  }, []);

  const initializeSession = (authData) => {
      setUser(authData);
      const service = new GithubService(authData.token);
      setGithubService(service);
      setIsAuthenticated(true);
  };

  const login = async (token, owner, repo, branch = 'main') => {
    try {
        // Validate connection
        const service = new GithubService(token);
        await service.testConnection(owner, repo);
        
        const authData = { token, owner, repo, branch };
        localStorage.setItem('media_app_auth', JSON.stringify(authData));
        initializeSession(authData);
        return true;
    } catch (error) {
        console.error("Login failed:", error);
        throw new Error("Invalid credentials or repository not found.");
    }
  };

  const logout = () => {
    localStorage.removeItem('media_app_auth');
    setUser(null);
    setGithubService(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, githubService }}>
      {children}
    </AuthContext.Provider>
  );
};
