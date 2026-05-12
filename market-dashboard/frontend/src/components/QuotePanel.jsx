export function QuotePanel({ quote, loading }) {
  if (loading) return <div className="quote-panel skeleton" />
  if (!quote) return null

  const up = quote.change >= 0
  return (
    <div className="quote-panel">
      <div className="quote-left">
        <span className="quote-symbol">{quote.symbol}</span>
        <span className="quote-price">${quote.price.toLocaleString()}</span>
        <span className={`quote-change ${up ? 'up' : 'down'}`}>
          {up ? '▲' : '▼'} {Math.abs(quote.change).toFixed(2)} ({Math.abs(quote.change_pct).toFixed(2)}%)
        </span>
      </div>
      <div className="quote-right">
        <Stat label="Open" value={`$${quote.open}`} />
        <Stat label="High" value={`$${quote.high}`} />
        <Stat label="Low" value={`$${quote.low}`} />
        <Stat label="Prev Close" value={`$${quote.prev_close}`} />
        <Stat label="Volume" value={quote.volume?.toLocaleString() ?? '—'} />
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="quote-stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  )
}
