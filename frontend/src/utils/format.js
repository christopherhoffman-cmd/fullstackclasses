const nf = (min, max) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: min, maximumFractionDigits: max });

export function formatarNumero(valor, casas = 2, { fixo = false } = {}) {
  if (valor === null || valor === undefined || valor === '' || Number.isNaN(Number(valor))) return '—';
  return nf(fixo ? casas : 0, casas).format(Number(valor));
}

export function formatarInteiro(valor) {
  return formatarNumero(valor, 0);
}

export function formatarCi(valor) {
  return formatarNumero(valor, 4, { fixo: true });
}

export function formatarData(valor) {
  if (!valor) return '—';
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function paraNumero(texto) {
  if (texto === null || texto === undefined) return null;
  const s = String(texto).trim().replace(',', '.');
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}
