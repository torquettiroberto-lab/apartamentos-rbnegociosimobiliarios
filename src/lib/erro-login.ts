/** Traduz o erro do Supabase Auth em uma mensagem útil, sem expor segredos. */
export function mensagemErroLogin(erro: unknown): string {
  const e = (erro ?? {}) as { code?: string; status?: number; name?: string; message?: string };
  switch (e.code) {
    case "invalid_credentials":
      return "E-mail ou senha não conferem com o cadastro no Supabase (invalid_credentials).";
    case "email_not_confirmed":
      return "O e-mail deste usuário ainda não foi confirmado no Supabase (email_not_confirmed).";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo (limite de requisições).";
    case "user_banned":
      return "Este usuário está bloqueado no Supabase (user_banned).";
    case "invalid_api_key":
    case "no_authorization":
      return "A chave pública do Supabase configurada neste ambiente foi recusada. Confira o .env.local e reinicie o servidor.";
  }
  if (e.status === 401 || e.status === 403) {
    return "O Supabase recusou a chave configurada neste ambiente. Confira o .env.local e reinicie o servidor.";
  }
  if (e.status === 429) return "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.";
  if (e.name === "AuthRetryableFetchError" || e.status === 0 || e.status === undefined) {
    return "Não foi possível falar com o Supabase. Verifique a conexão e a URL configurada.";
  }
  return `Não foi possível entrar (erro ${e.code ?? e.status}).`;
}
