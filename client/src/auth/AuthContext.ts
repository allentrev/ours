import { createContext } from 'react';

export interface AuthContextType {
  isAuthenticated: boolean;
  adminName: string;
  login: (name: string, password: string) => boolean;
  logout: () => void;
  skipAuth: (adminName: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);