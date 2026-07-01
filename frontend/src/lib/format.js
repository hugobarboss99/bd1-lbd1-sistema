export function formatBRL(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatKm(km) {
  return `${km.toLocaleString('pt-BR')} km`
}

export function formatData(isoOuDatetime) {
  // Backend pode mandar "2025-01-15" (date) ou "2025-01-15T00:00:00" (datetime,
  // usado deliberadamente em alguns campos para evitar bugs de date puro com
  // oracledb). Pegamos so a parte da data antes de qualquer "T".
  const dataPura = isoOuDatetime.split('T')[0]
  const [ano, mes, dia] = dataPura.split('-')
  return `${dia}/${mes}/${ano}`
}