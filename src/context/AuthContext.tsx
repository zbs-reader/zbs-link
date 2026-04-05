import { createContext, useContext, useMemo, type ReactNode } from 'react';

interface AuthContextValue {
  user: null;
  session: null;
  loading: boolean;
  isConfigured: boolean;
  signInWithPassword: (_email: string, _password: string) => Promise<{ error: string | null }>;
  signUpWithPassword: (_email: string, _password: string) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const value = useMemo<AuthContextValue>(
    () => ({
      user: null,
      session: null,
      loading: false,
      isConfigured: false,
      signInWithPassword: async () => ({ error: 'Cloud auth has been removed.' }),
      signUpWithPassword: async () => ({ error: 'Cloud auth has been removed.', needsEmailConfirmation: false }),
      signOut: async () => undefined
    }),
    []
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      session: null,
      loading: false,
      isConfigured: false,
      signInWithPassword: async () => ({ error: 'Cloud auth has been removed.' }),
      signUpWithPassword: async () => ({ error: 'Cloud auth has been removed.', needsEmailConfirmation: false }),
      signOut: async () => undefined
    };
  }

  return context;
}
