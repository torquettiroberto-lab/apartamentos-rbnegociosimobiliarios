import { createContext, useContext } from "react";
import type { Session } from "@supabase/supabase-js";

export interface AuthState {
  session: Session | null;
  carregando: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>.");
  return ctx;
}
