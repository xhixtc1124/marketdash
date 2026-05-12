import { useEffect, useRef } from 'react'
import {
  createChart,
  CandlestickSeries,
  LineSeries,
  HistogramSeries,
} from 'lightweight-charts'

const CHART_OPTS = {
  layout: {
    background: { color: '#0f1117' },
    textColor: '#9ca3af',
  },
  grid: {
    vertLines: { color: '#1f2937' },
    horzLines: { color: '#1f2937' },
  },
  crosshair: { mode: 1 },
  rightPriceScale: { borderColor: '#374151' },
  timeScale: { borderColor: '#374151', timeVisible: true },
}

export function CandlestickChart({ candles, indicators, showBB, showMA }) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef({})

  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      ...CHART_OPTS,
      width: containerRef.current.clientWidth,
      height: 380,
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
    })

    const sma20 = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1, priceLineVisible: false })
    const sma50 = chart.addSeries(LineSeries, { color: '#8b5cf6', lineWidth: 1, priceLineVisible: false })
    const bbUpper = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 1, lineStyle: 2, priceLineVisible: false })
    const bbLower = chart.addSeries(LineSeries, { color: '#3b82f6', lineWidth: 1, lineStyle: 2, priceLineVisible: false })

    seriesRef.current = { candleSeries, sma20, sma50, bbUpper, bbLower }
    chartRef.current = chart

    const ro = new ResizeObserver(() => {
      chart.applyOptions({ width: containerRef.current.clientWidth })
    })
    ro.observe(containerRef.current)

    return () => { ro.disconnect(); chart.remove() }
  }, [])

  useEffect(() => {
    const { candleSeries } = seriesRef.current
    if (candleSeries && candles.length) {
      candleSeries.setData(candles)
      chartRef.current?.timeScale().fitContent()
    }
  }, [candles])

  useEffect(() => {
    if (!indicators) return
    const { sma20, sma50, bbUpper, bbLower } = seriesRef.current
    sma20?.setData(showMA ? indicators.sma20 : [])
    sma50?.setData(showMA ? indicators.sma50 : [])
    bbUpper?.setData(showBB ? indicators.bb_upper : [])
    bbLower?.setData(showBB ? indicators.bb_lower : [])
  }, [indicators, showMA, showBB])

  return (
    <div style={{ position: 'relative' }}>
      <div ref={containerRef} className="chart-container" />
      <div style={{ position: 'absolute', top: 8, left: 10, display: 'flex', gap: 12, zIndex: 10, pointerEvents: 'none' }}>
        {showMA && (
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9ca3af' }}>
              <span style={{ display: 'inline-block', width: 16, height: 2, background: '#f59e0b', borderRadius: 2 }} />
              SMA 20
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9ca3af' }}>
              <span style={{ display: 'inline-block', width: 16, height: 2, background: '#8b5cf6', borderRadius: 2 }} />
              SMA 50
            </span>
          </>
        )}
        {showBB && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9ca3af' }}>
            <span style={{ display: 'inline-block', width: 16, height: 2, background: '#3b82f6', borderRadius: 2, borderTop: '2px dashed #3b82f6' }} />
            Bollinger Bands (20)
          </span>
        )}
      </div>
    </div>
  )
}

export function RsiChart({ indicators }) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      ...CHART_OPTS,
      width: containerRef.current.clientWidth,
      height: 120,
      rightPriceScale: { ...CHART_OPTS.rightPriceScale, autoScale: false, scaleMargins: { top: 0.1, bottom: 0.1 } },
    })
    const rsiSeries = chart.addSeries(LineSeries, { color: '#06b6d4', lineWidth: 1.5, priceLineVisible: false })
    // Overbought / oversold reference lines via price lines
    rsiSeries.createPriceLine({ price: 70, color: '#ef5350', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: '70' })
    rsiSeries.createPriceLine({ price: 30, color: '#26a69a', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: '30' })
    seriesRef.current = rsiSeries
    chartRef.current = chart

    const ro = new ResizeObserver(() => chart.applyOptions({ width: containerRef.current.clientWidth }))
    ro.observe(containerRef.current)
    return () => { ro.disconnect(); chart.remove() }
  }, [])

  useEffect(() => {
    if (seriesRef.current && indicators?.rsi?.length) {
      seriesRef.current.setData(indicators.rsi)
      chartRef.current?.timeScale().fitContent()
    }
  }, [indicators])

  return (
    <div className="subchart">
      <span className="subchart-label">RSI (14)</span>
      <div ref={containerRef} />
    </div>
  )
}

export function MacdChart({ indicators }) {
  const containerRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef({})

  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      ...CHART_OPTS,
      width: containerRef.current.clientWidth,
      height: 120,
    })
    const macdLine = chart.addSeries(LineSeries, { color: '#f59e0b', lineWidth: 1.5, priceLineVisible: false })
    const signalLine = chart.addSeries(LineSeries, { color: '#ef5350', lineWidth: 1, priceLineVisible: false })
    const histSeries = chart.addSeries(HistogramSeries, {
      priceLineVisible: false,
      color: '#26a69a',
    })
    seriesRef.current = { macdLine, signalLine, histSeries }
    chartRef.current = chart

    const ro = new ResizeObserver(() => chart.applyOptions({ width: containerRef.current.clientWidth }))
    ro.observe(containerRef.current)
    return () => { ro.disconnect(); chart.remove() }
  }, [])

  useEffect(() => {
    if (!indicators?.macd?.length) return
    const { macdLine, signalLine, histSeries } = seriesRef.current
    macdLine?.setData(indicators.macd)
    signalLine?.setData(indicators.macd_signal)
    histSeries?.setData(
      indicators.macd_hist.map((d) => ({ ...d, color: d.value >= 0 ? '#26a69a' : '#ef5350' }))
    )
    chartRef.current?.timeScale().fitContent()
  }, [indicators])

  return (
    <div className="subchart">
      <div style={{ position: 'absolute', top: 6, left: 10, display: 'flex', gap: 12, zIndex: 10, pointerEvents: 'none' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', letterSpacing: '0.4px' }}>MACD (12, 26, 9)</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9ca3af' }}>
          <span style={{ display: 'inline-block', width: 16, height: 2, background: '#f59e0b', borderRadius: 2 }} />
          MACD
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9ca3af' }}>
          <span style={{ display: 'inline-block', width: 16, height: 2, background: '#ef5350', borderRadius: 2 }} />
          Signal
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9ca3af' }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, background: '#26a69a', borderRadius: 2 }} />
          Histogram
        </span>
      </div>
      <div ref={containerRef} />
    </div>
  )
}
