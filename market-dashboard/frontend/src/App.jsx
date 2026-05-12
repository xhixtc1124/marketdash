import { useState } from 'react'
import { SearchBar } from './components/SearchBar'
import { QuotePanel } from './components/QuotePanel'
import { Watchlist } from './components/Watchlist'
import { CandlestickChart, RsiChart, MacdChart } from './components/CandlestickChart'
import { useMarketData } from './hooks/useMarketData'
import './App.css'

const PERIODS = ['1d', '5d', '1mo', '3mo', '6mo', '1y', '2y']

export default function App() {
  const [symbol, setSymbol] = useState('AAPL')
  const [period, setPeriod] = useState('3mo')
  const [showMA, setShowMA] = useState(true)
  const [showBB, setShowBB] = useState(false)

  const { quote, candles, indicators, loading, error } = useMarketData(symbol, period)

  return (
    <div className="app">
      <header className="header">
        <div className="header-brand">
          <span className="brand-name">MarketDash</span>
        </div>
        <SearchBar onSelect={setSymbol} />
      </header>

      <div className="layout">
        <Watchlist active={symbol} onSelect={setSymbol} />

        <main className="main">
          {error && <div className="error-banner">Failed to load data: {error}</div>}

          <QuotePanel quote={quote} loading={loading} />

          <div className="chart-toolbar">
            <div className="period-tabs">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  className={`period-btn ${period === p ? 'active' : ''}`}
                  onClick={() => setPeriod(p)}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="overlay-toggles">
              <button
                className={`toggle-btn ${showMA ? 'active' : ''}`}
                onClick={() => setShowMA((v) => !v)}
              >
                MA
              </button>
              <button
                className={`toggle-btn ${showBB ? 'active' : ''}`}
                onClick={() => setShowBB((v) => !v)}
              >
                BB
              </button>
            </div>
          </div>

          {loading && !candles.length ? (
            <div className="chart-placeholder">Loading chart data…</div>
          ) : (
            <>
              <CandlestickChart
                candles={candles}
                indicators={indicators}
                showMA={showMA}
                showBB={showBB}
              />
              <RsiChart indicators={indicators} />
              <MacdChart indicators={indicators} />
            </>
          )}

          <div className="legend">
            {showMA && (
              <>
                <span className="legend-item">
                  <span className="legend-dot" style={{ background: '#f59e0b' }} /> SMA 20
                </span>
                <span className="legend-item">
                  <span className="legend-dot" style={{ background: '#8b5cf6' }} /> SMA 50
                </span>
              </>
            )}
            {showBB && (
              <span className="legend-item">
                <span className="legend-dot" style={{ background: '#3b82f6' }} /> Bollinger Bands (20)
              </span>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
