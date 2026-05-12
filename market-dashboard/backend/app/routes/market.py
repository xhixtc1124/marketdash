from fastapi import APIRouter, HTTPException, Query
from app.services.data import get_ohlcv, get_quote, get_indicators, search_symbols

router = APIRouter()


@router.get("/quote/{symbol}")
async def quote(symbol: str):
    data = get_quote(symbol.upper())
    if not data:
        raise HTTPException(status_code=404, detail=f"Symbol {symbol} not found")
    return data


@router.get("/history/{symbol}")
async def history(
    symbol: str,
    period: str = Query(default="3mo", enum=["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y"]),
    interval: str = Query(default="1d", enum=["5m", "15m", "1h", "1d", "1wk"]),
):
    data = get_ohlcv(symbol.upper(), period=period, interval=interval)
    if data is None:
        raise HTTPException(status_code=404, detail=f"No data for {symbol}")
    return data


@router.get("/indicators/{symbol}")
async def indicators(
    symbol: str,
    period: str = Query(default="6mo"),
):
    data = get_indicators(symbol.upper(), period=period)
    if data is None:
        raise HTTPException(status_code=404, detail=f"No data for {symbol}")
    return data


@router.get("/search")
async def search(q: str = Query(..., min_length=1)):
    return search_symbols(q)
