"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  organizationId: string;
}

interface Organization {
  id: string;
  name: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  login: (token: string, user: User, org: Organization) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage on mount
    const token = localStorage.getItem('vaidyaos_token');
    const storedUser = localStorage.getItem('vaidyaos_user');
    const storedOrg = localStorage.getItem('vaidyaos_org');

    if (token && storedUser && storedOrg) {
      setUser(JSON.parse(storedUser));
      setOrganization(JSON.parse(storedOrg));
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, userData: User, orgData: Organization) => {
    localStorage.setItem('vaidyaos_token', token);
    localStorage.setItem('vaidyaos_user', JSON.stringify(userData));
    localStorage.setItem('vaidyaos_org', JSON.stringify(orgData));
    
    setUser(userData);
    setOrganization(orgData);
  };

  const logout = () => {
    localStorage.removeItem('vaidyaos_token');
    localStorage.removeItem('vaidyaos_user');
    localStorage.removeItem('vaidyaos_org');
    
    setUser(null);
    setOrganization(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      organization,
      login,
      logout,
      isAuthenticated: !!user,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
