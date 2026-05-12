import { useState, useEffect, useRef } from 'react'
import { searchSymbols } from '../api/market'

export function SearchBar({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    const timer = setTimeout(async () => {
      try {
        const data = await searchSymbols(query)
        setResults(data)
        setOpen(true)
      } catch { setResults([]) }
    }, 250)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const select = (symbol) => {
    setQuery('')
    setOpen(false)
    onSelect(symbol)
  }

  return (
    <div className="search-wrapper" ref={ref}>
      <input
        className="search-input"
        placeholder="Search symbol… (AAPL, BTC-USD, SPY)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query && setOpen(true)}
      />
      {open && results.length > 0 && (
        <ul className="search-dropdown">
          {results.map((r) => (
            <li key={r.symbol} onClick={() => select(r.symbol)}>
              <span className="search-symbol">{r.symbol}</span>
              <span className="search-name">{r.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
