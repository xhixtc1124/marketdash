const DEFAULTS = [
  'AAPL', 'MSFT', 'NVDA', 'GOOGL', 'TSLA',
  'SPY', 'QQQ', 'GS', 'BTC-USD', 'ETH-USD',
]

export function Watchlist({ active, onSelect }) {
  return (
    <aside className="watchlist">
      <div className="watchlist-title">Watchlist</div>
      {DEFAULTS.map((sym) => (
        <button
          key={sym}
          className={`watchlist-item ${active === sym ? 'active' : ''}`}
          onClick={() => onSelect(sym)}
        >
          {sym}
        </button>
      ))}
    </aside>
  )
}
