import { useState } from 'react'

const DEFAULTS = [
  'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'TSLA',
  'SPY', 'QQQ', 'GS', 'BTC-USD', 'ETH-USD',
]

export function Watchlist({ active, onSelect }) {
  const [symbols, setSymbols] = useState(DEFAULTS)

  const add = (sym) => {
    if (sym && !symbols.includes(sym)) {
      setSymbols((prev) => [...prev, sym])
    }
  }

  const remove = (sym, e) => {
    e.stopPropagation()
    setSymbols((prev) => prev.filter((s) => s !== sym))
  }

  return (
    <aside className="watchlist">
      <div className="watchlist-title">Watchlist</div>
      {symbols.map((sym) => (
        <button
          key={sym}
          className={`watchlist-item ${active === sym ? 'active' : ''}`}
          onClick={() => onSelect(sym)}
        >
          {sym}
          <span className="watchlist-remove" onClick={(e) => remove(sym, e)}>×</span>
        </button>
      ))}
      {active && !symbols.includes(active) && (
        <button className="watchlist-add" onClick={() => add(active)}>
          + Add {active}
        </button>
      )}
    </aside>
  )
}
