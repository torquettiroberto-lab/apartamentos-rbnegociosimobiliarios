import { useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { AuthContext } from "@/lib/auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [carregando, setCarregando] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCarregando(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_evento, nova) => setSession(nova));
    return () => data.subscription.unsubscribe();
  }, []);

  const entrar = async (email: string, senha: string) => {
    if (!supabase) throw new Error("Supabase não configurado.");
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) throw error;
  };

  const sair = async () => {
    await supabase?.auth.signOut();
  };

  return <AuthContext.Provider value={{ session, carregando, entrar, sair }}>{children}</AuthContext.Provider>;
}
