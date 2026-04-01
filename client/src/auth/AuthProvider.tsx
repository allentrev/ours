import React, { useEffect, useState } from 'react';
import { getAllRefData } from 'utilities';
import type { RefDataRecord } from '../types/refDataTypes';
import { AuthContext } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [refData, setRefData] = useState<RefDataRecord[]>([]);

  useEffect(() => {
    const loadRefData = async () => {
      try {
        const stored = localStorage.getItem('refData');

        if (stored) {
          setRefData(JSON.parse(stored));
        } else {
          const data = await getAllRefData();
          localStorage.setItem('refData', JSON.stringify(data));
          setRefData(data);
        }
      } catch (error) {
        console.error('Failed to load refData:', error);
      }
    };

    loadRefData();

    try {
      const storedAuth = localStorage.getItem('auth');
      if (storedAuth) {
        const { name, authenticated } = JSON.parse(storedAuth);
        setAdminName(name);
        setIsAuthenticated(authenticated);
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
    }
  }, []);

  const login = (name: string, password: string): boolean => {
    if (refData.length === 0) return false;

    const refItem = refData.find((item) => item.refKey === 'SD035');
    const valid = refItem?.value === password;

    if (valid) {
      setAdminName(name);
      setIsAuthenticated(true);
      localStorage.setItem('auth', JSON.stringify({ name, authenticated: true }));
    }

    return valid;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAdminName('');
    localStorage.removeItem('auth');
  };

  const skipAuth = (adminName: string) => {
    setAdminName(adminName);
    setIsAuthenticated(true);
    localStorage.setItem('auth', JSON.stringify({ name: adminName, authenticated: true }));
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, adminName, login, logout, skipAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};