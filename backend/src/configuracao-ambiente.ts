export function validarAmbiente(env: Record<string, unknown>) {
  if (env.NODE_ENV === 'production') {
    for (const chave of ['DATABASE_URL', 'FRONTEND_URL', 'JWT_SECRET', 'ADMIN_REGISTRATION_CODE', 'TEACHER_REGISTRATION_CODE']) {
      if (typeof env[chave] !== 'string' || !(env[chave] as string).trim()) {
        throw new Error(`Variável obrigatória em produção: ${chave}`);
      }
    }
    if ((env.JWT_SECRET as string).length < 32) {
      throw new Error('JWT_SECRET deve ter pelo menos 32 caracteres em produção.');
    }
    if (!(env.FRONTEND_URL as string).startsWith('https://')) {
      throw new Error('FRONTEND_URL deve usar HTTPS em produção.');
    }
  }
  return env;
}
