import { useState, useEffect, useCallback } from 'react'
import { getQuote, getHistory, getIndicators } from '../api/market'

export function useMarketData(symbol, period) {
  const [quote, setQuote] = useState(null)
  const [candles, setCandles] = useState([])
  const [indicators, setIndicators] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const intervalFor = (p) => {
    if (p === '1d') return '5m'
    if (p === '5d') return '15m'
    if (p === '1mo') return '1h'
    return '1d'
  }

  const load = useCallback(async () => {
    if (!symbol) return
    setLoading(true)
    setError(null)
    try {
      const [q, h, ind] = await Promise.all([
        getQuote(symbol),
        getHistory(symbol, period, intervalFor(period)),
        getIndicators(symbol, period === '1d' || period === '5d' ? '3mo' : period),
      ])
      setQuote(q)
      setCandles(h.candles)
      setIndicators(ind)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [symbol, period])

  useEffect(() => {
    load()
    const timer = setInterval(load, 60_000)
    return () => clearInterval(timer)
  }, [load])

  return { quote, candles, indicators, loading, error, reload: load }
}
