const BASE = '/api'

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export const getQuote = (symbol) => fetchJSON(`${BASE}/quote/${symbol}`)

export const getHistory = (symbol, period = '3mo', interval = '1d') =>
  fetchJSON(`${BASE}/history/${symbol}?period=${period}&interval=${interval}`)

export const getIndicators = (symbol, period = '6mo') =>
  fetchJSON(`${BASE}/indicators/${symbol}?period=${period}`)

export const searchSymbols = (q) => fetchJSON(`${BASE}/search?q=${encodeURIComponent(q)}`)
