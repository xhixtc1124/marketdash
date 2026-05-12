import yfinance as yf
import pandas as pd
from typing import Optional

SYMBOL_LIST = [
    {"symbol": "AAPL", "name": "Apple Inc."},
    {"symbol": "MSFT", "name": "Microsoft Corp."},
    {"symbol": "GOOGL", "name": "Alphabet Inc."},
    {"symbol": "AMZN", "name": "Amazon.com Inc."},
    {"symbol": "META", "name": "Meta Platforms Inc."},
    {"symbol": "TSLA", "name": "Tesla Inc."},
    {"symbol": "NVDA", "name": "NVIDIA Corp."},
    {"symbol": "JPM", "name": "JPMorgan Chase & Co."},
    {"symbol": "GS", "name": "Goldman Sachs Group"},
    {"symbol": "SPY", "name": "SPDR S&P 500 ETF"},
    {"symbol": "QQQ", "name": "Invesco QQQ ETF"},
    {"symbol": "BTC-USD", "name": "Bitcoin USD"},
    {"symbol": "ETH-USD", "name": "Ethereum USD"},
    {"symbol": "GC=F", "name": "Gold Futures"},
    {"symbol": "CL=F", "name": "Crude Oil Futures"},
]


def _sma(series: pd.Series, n: int) -> pd.Series:
    return series.rolling(n).mean()


def _ema(series: pd.Series, n: int) -> pd.Series:
    return series.ewm(span=n, adjust=False).mean()


def _rsi(series: pd.Series, n: int = 14) -> pd.Series:
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(com=n - 1, min_periods=n).mean()
    avg_loss = loss.ewm(com=n - 1, min_periods=n).mean()
    rs = avg_gain / avg_loss.replace(0, float("inf"))
    return 100 - (100 / (1 + rs))


def _macd(series: pd.Series, fast=12, slow=26, signal=9):
    ema_fast = _ema(series, fast)
    ema_slow = _ema(series, slow)
    macd_line = ema_fast - ema_slow
    signal_line = _ema(macd_line, signal)
    histogram = macd_line - signal_line
    return macd_line, signal_line, histogram


def _bbands(series: pd.Series, n: int = 20, std: float = 2.0):
    mid = _sma(series, n)
    rolling_std = series.rolling(n).std(ddof=0)
    upper = mid + std * rolling_std
    lower = mid - std * rolling_std
    return upper, mid, lower


def _ts_to_unix(index: pd.DatetimeIndex) -> list[int]:
    return (index.astype("int64") // 10**9).tolist()


def _series_to_list(ts_list, series: pd.Series) -> list[dict]:
    result = []
    for t, v in zip(ts_list, series):
        if pd.notna(v):
            result.append({"time": int(t), "value": round(float(v), 4)})
    return result


def get_quote(symbol: str) -> Optional[dict]:
    try:
        hist = yf.Ticker(symbol).history(period="2d", interval="1d")
        if hist.empty:
            return None
        prev_close = float(hist["Close"].iloc[-2]) if len(hist) > 1 else float(hist["Close"].iloc[-1])
        current = float(hist["Close"].iloc[-1])
        change = current - prev_close
        return {
            "symbol": symbol,
            "price": round(current, 2),
            "change": round(change, 2),
            "change_pct": round((change / prev_close) * 100, 4),
            "volume": int(hist["Volume"].iloc[-1]),
            "high": round(float(hist["High"].iloc[-1]), 2),
            "low": round(float(hist["Low"].iloc[-1]), 2),
            "open": round(float(hist["Open"].iloc[-1]), 2),
            "prev_close": round(prev_close, 2),
        }
    except Exception:
        return None


def get_ohlcv(symbol: str, period: str = "3mo", interval: str = "1d") -> Optional[dict]:
    try:
        hist = yf.Ticker(symbol).history(period=period, interval=interval)
        if hist.empty:
            return None
        ts = _ts_to_unix(hist.index.tz_localize(None) if hist.index.tzinfo else hist.index)
        return {
            "symbol": symbol,
            "interval": interval,
            "candles": [
                {
                    "time": t,
                    "open": round(float(r["Open"]), 4),
                    "high": round(float(r["High"]), 4),
                    "low": round(float(r["Low"]), 4),
                    "close": round(float(r["Close"]), 4),
                    "volume": int(r["Volume"]),
                }
                for t, (_, r) in zip(ts, hist.iterrows())
            ],
        }
    except Exception:
        return None


def get_indicators(symbol: str, period: str = "6mo") -> Optional[dict]:
    try:
        hist = yf.Ticker(symbol).history(period=period, interval="1d")
        if hist.empty:
            return None

        close = hist["Close"]
        ts = _ts_to_unix(hist.index.tz_localize(None) if hist.index.tzinfo else hist.index)

        macd_line, signal_line, histogram = _macd(close)
        bb_upper, bb_mid, bb_lower = _bbands(close)

        return {
            "symbol": symbol,
            "sma20": _series_to_list(ts, _sma(close, 20)),
            "sma50": _series_to_list(ts, _sma(close, 50)),
            "ema12": _series_to_list(ts, _ema(close, 12)),
            "rsi": _series_to_list(ts, _rsi(close)),
            "macd": _series_to_list(ts, macd_line),
            "macd_signal": _series_to_list(ts, signal_line),
            "macd_hist": _series_to_list(ts, histogram),
            "bb_upper": _series_to_list(ts, bb_upper),
            "bb_mid": _series_to_list(ts, bb_mid),
            "bb_lower": _series_to_list(ts, bb_lower),
        }
    except Exception:
        return None


def search_symbols(query: str) -> list:
    q = query.upper()
    return [s for s in SYMBOL_LIST if q in s["symbol"] or q in s["name"].upper()][:8]
