'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useWallets, useCurrentAccount, useDAppKit } from '@mysten/dapp-kit-react';
import type { UiWallet } from '@mysten/dapp-kit-core';

export type AuthMode = 'onchain' | 'gasless';
export type WalletStatus = 'disconnected' | 'connecting' | 'connected';

interface AccountInfo {
  address: string;
}

interface LoginOption {
  id: 'wallet' | 'api-key';
  title: string;
  description: string;
  icon?: ReactNode;
}

interface AuthContextType {
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  
  walletStatus: WalletStatus;
  account: AccountInfo | null;
  availableWallets: UiWallet[];
  loginWithWallet: () => Promise<void>;
  logout: () => void;
  
  apiKeyConfigured: boolean;
  setApiKeyConfigured: (configured: boolean) => void;
  
  showLoginDialog: boolean;
  setShowLoginDialog: (show: boolean) => void;
  
  loginOptions: LoginOption[];
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const wallets = useWallets();
  const account = useCurrentAccount();
  const dAppKit = useDAppKit();
  
  const [authMode, setAuthModeState] = useState<AuthMode>('onchain');
  const [walletStatus, setWalletStatus] = useState<WalletStatus>('disconnected');
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage AFTER mount (avoids SSR mismatch)
  useEffect(() => {
    const storedMode = localStorage.getItem('throwit_auth_mode');
    // Legacy: 'rpc' is now 'onchain' (backward compat)
    if (storedMode === 'onchain' || storedMode === 'gasless') {
      setAuthModeState(storedMode);
    } else if (storedMode === 'rpc') {
      setAuthModeState('onchain');
    }
    setApiKeyConfigured(!!localStorage.getItem('throwit_tatum_api_key'));
    setHydrated(true);
  }, []);

  // Sync authMode → localStorage
  useEffect(() => {
    if (hydrated && typeof window !== 'undefined') {
      localStorage.setItem('throwit_auth_mode', authMode);
    }
  }, [authMode, hydrated]);

  // Sync wallet status with account state
  useEffect(() => {
    if (account) {
      setWalletStatus('connected');
    } else {
      setWalletStatus('disconnected');
    }
  }, [account]);

  const setAuthMode = useCallback((mode: AuthMode) => {
    setAuthModeState(mode);
  }, []);

  const loginWithWallet = useCallback(async () => {
    setWalletStatus('connecting');
    try {
      await dAppKit.connectWallet({ wallet: wallets[0] });
      setWalletStatus('connected');
      setShowLoginDialog(false);
    } catch (error) {
      console.error('[Auth] Wallet login failed:', error);
      setWalletStatus('disconnected');
    }
  }, [dAppKit, wallets]);

  const logout = useCallback(() => {
    dAppKit.disconnectWallet();
    setWalletStatus('disconnected');
  }, [dAppKit]);

  const loginOptions: LoginOption[] = [
    {
      id: 'wallet',
      title: 'Login with Wallet',
      description: 'Connect your Sui wallet for on-chain operations',
    },
    {
      id: 'api-key',
      title: 'Use API Key',
      description: authMode === 'gasless' 
        ? 'Enter your Tatum API key for gasless storage uploads' 
        : 'Alternative authentication method',
    },
  ];

  const value: AuthContextType = {
    authMode,
    setAuthMode,
    walletStatus,
    account: account ? { address: account.address } : null,
    availableWallets: wallets,
    loginWithWallet,
    logout,
    apiKeyConfigured,
    setApiKeyConfigured,
    showLoginDialog,
    setShowLoginDialog,
    loginOptions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      authMode: 'onchain',
      setAuthMode: () => {},
      walletStatus: 'disconnected',
      account: null,
      availableWallets: [],
      loginWithWallet: async () => {},
      logout: () => {},
      apiKeyConfigured: false,
      setApiKeyConfigured: () => {},
      showLoginDialog: false,
      setShowLoginDialog: () => {},
      loginOptions: [],
    } as AuthContextType;
  }
  return context;
}
