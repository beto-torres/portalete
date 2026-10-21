export function obterPrimeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? "";
}
