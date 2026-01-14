export function describeSupabaseError(err: any): string {
  if (!err) return "Erro desconhecido";
  if (typeof err === "string") return err;
  const code = (err?.code ?? err?.status ?? err?.statusCode ?? "").toString();
  const message = (err?.message ?? err?.error ?? "").toString();
  const details = (err?.details ?? err?.data ?? err?.reason ?? "").toString();
  const hint = (err?.hint ?? "").toString();
  const parts: string[] = [];
  if (message) parts.push(message);
  if (code) parts.push(`Código: ${code}`);
  if (details) parts.push(`Detalhes: ${details}`);
  if (hint) parts.push(`Hint: ${hint}`);
  const text = parts.join(" | ");
  return text || "Erro desconhecido";
}

