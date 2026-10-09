// Soma dos pesos dos critérios (arredondada) — válida quando igual a 1.
export const somaPesos = (criterios) =>
  Math.round(criterios.reduce((s, c) => s + (Number(c.peso) || 0), 0) * 10000) / 10000;

export const somaValida = (criterios) => somaPesos(criterios) === 1;
