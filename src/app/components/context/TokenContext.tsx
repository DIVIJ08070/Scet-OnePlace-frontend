// app/context/TokenContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';


type TokenContextType = {
  token: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  setToken: (token: string | null) => void;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
};

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const TokenProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem('google-token'));
    setAccessToken(localStorage.getItem('accessToken'));
    setRefreshToken(localStorage.getItem('refreshToken'));
  }, []);

  return (
    <TokenContext.Provider
      value={{ token, accessToken, refreshToken, setToken, setAccessToken, setRefreshToken }}
    >
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = () => {
  const context = useContext(TokenContext);
  if (!context) throw new Error('useToken must be used within a TokenProvider');
  return context;
};
