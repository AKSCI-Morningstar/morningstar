"""FRED API commodity price service — 31 aerospace-relevant commodities."""
import os
import json
import logging
import random
from datetime import datetime, timedelta
from typing import Optional

import requests

from .database import cache_get, cache_set, insert_commodity_prices, get_latest_commodities

logger = logging.getLogger(__name__)

FRED_API_KEY = os.environ.get("FRED_API_KEY", "")
FRED_BASE = "https://api.stlouisfed.org/fred/series/observations"

# 31 aerospace-relevant FRED series IDs
COMMODITY_SERIES = {
    "WTI_OIL":       {"series": "DCOILWTICO", "name": "WTI Crude Oil", "unit": "USD/bbl"},
    "BRENT_OIL":     {"series": "DCOILBRENTEU", "name": "Brent Crude Oil", "unit": "USD/bbl"},
    "NATGAS":        {"series": "DHHNGSP", "name": "Natural Gas", "unit": "USD/MMBtu"},
    "COPPER":        {"series": "PCOPPUSDM", "name": "Copper", "unit": "USD/lb"},
    "ALUMINUM":      {"series": "PALUMUSDM", "name": "Aluminum", "unit": "USD/mt"},
    "STEEL":         {"series": "PSTEEUSDM", "name": "Steel", "unit": "USD/mt"},
    "GOLD":          {"series": "GOLDPMGBD228NLBM", "name": "Gold", "unit": "USD/troy_oz"},
    "SILVER":        {"series": "SLVPRUSD", "name": "Silver", "unit": "USD/troy_oz"},
    "PLATINUM":      {"series": "PLATINUM_USD", "name": "Platinum", "unit": "USD/troy_oz"},
    "TITANIUM_SPONGE": {"series": None, "name": "Titanium Sponge", "unit": "USD/kg", "fallback": True},
    "NICKEL":        {"series": "PNICKUSDM", "name": "Nickel", "unit": "USD/lb"},
    "ZINC":          {"series": "PZINCUSDM", "name": "Zinc", "unit": "USD/lb"},
    "LEAD":          {"series": "PLEADUSDM", "name": "Lead", "unit": "USD/lb"},
    "TIN":           {"series": "PTINUSDM", "name": "Tin", "unit": "USD/lb"},
    "URANIUM":       {"series": "PURANUSDM", "name": "Uranium", "unit": "USD/lb"},
    "COBALT":        {"series": "PCOBAUSDM", "name": "Cobalt", "unit": "USD/lb"},
    "LITHIUM":       {"series": None, "name": "Lithium Carbonate", "unit": "USD/mt", "fallback": True},
    "RARE_EARTH":    {"series": None, "name": "Rare Earth Oxides", "unit": "USD/kg", "fallback": True},
    "TUNGSTEN":      {"series": None, "name": "Tungsten", "unit": "USD/mt", "fallback": True},
    "CHROMIUM":      {"series": None, "name": "Chromium", "unit": "USD/lb", "fallback": True},
    "MANGANESE":     {"series": None, "name": "Manganese", "unit": "USD/mt", "fallback": True},
    "PALLADIUM":     {"series": "PALLFNFINDEXQ", "name": "Palladium", "unit": "USD/troy_oz"},
    "RHODIUM":       {"series": None, "name": "Rhodium", "unit": "USD/troy_oz", "fallback": True},
    "IRON_ORE":      {"series": "PIORECRUSDM", "name": "Iron Ore", "unit": "USD/mt"},
    "WHEAT":         {"series": "PWHEAMTUSDM", "name": "Wheat", "unit": "USD/bushel"},
    "CORN":          {"series": "PCORNUSDM", "name": "Corn", "unit": "USD/bushel"},
    "SOYBEAN":       {"series": "PSOYBUSDM", "name": "Soybeans", "unit": "USD/bushel"},
    "RUBBER":        {"series": "PRUBBUSDM", "name": "Rubber", "unit": "USD/lb"},
    "COTTON":        {"series": "PCOTTINDEXUSDM", "name": "Cotton", "unit": "USD/lb"},
    "ALUMINA":       {"series": None, "name": "Alumina", "unit": "USD/mt", "fallback": True},
    "MAGNESIUM":     {"series": None, "name": "Magnesium", "unit": "USD/mt", "fallback": True},
}

# Baseline mock prices (used when FRED unavailable or series missing)
MOCK_PRICES = {
    "WTI_OIL": 78.50, "BRENT_OIL": 82.30, "NATGAS": 2.85, "COPPER": 3.95,
    "ALUMINUM": 2350, "STEEL": 720, "GOLD": 2040, "SILVER": 24.50,
    "PLATINUM": 920, "TITANIUM_SPONGE": 38.50, "NICKEL": 7.80,
    "ZINC": 1.25, "LEAD": 0.95, "TIN": 4.50, "URANIUM": 42.00,
    "COBALT": 16.80, "LITHIUM": 14500, "RARE_EARTH": 85.00,
    "TUNGSTEN": 320, "CHROMIUM": 1.10, "MANGANESE": 4.50,
    "PALLADIUM": 1050, "RHODIUM": 4600, "IRON_ORE": 115,
    "WHEAT": 5.90, "CORN": 4.60, "SOYBEAN": 12.30,
    "RUBBER": 1.60, "COTTON": 0.82, "ALUMINA": 430, "MAGNESIUM": 2650,
}

# Volatility per commodity for generating realistic "change" values
VOLATILITY = {sym: random.uniform(0.005, 0.05) for sym in MOCK_PRICES}


def _fetch_fred_series(series_id: str) -> Optional[float]:
    """Fetch latest observation from FRED API."""
    if not FRED_API_KEY:
        return None
    try:
        resp = requests.get(FRED_BASE, params={
            "series_id": series_id,
            "api_key": FRED_API_KEY,
            "file_type": "json",
            "sort_order": "desc",
            "limit": 1,
        }, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            obs = data.get("observations", [])
            if obs and obs[0]["value"] != ".":
                return float(obs[0]["value"])
    except Exception as e:
        logger.warning(f"FRED fetch failed for {series_id}: {e}")
    return None


def _fetch_all_fred() -> dict:
    """Fetch all commodities that have FRED series IDs."""
    results = {}
    for sym, meta in COMMODITY_SERIES.items():
        sid = meta.get("series")
        if sid:
            val = _fetch_fred_series(sid)
            if val is not None:
                results[sym] = val
    return results


def _generate_mock_prices(use_cached_baseline: bool = True) -> dict:
    """Generate realistic mock commodity prices with random walk."""
    results = {}
    base_prices = MOCK_PRICES.copy()
    # Add small random walk relative to previous cached values for continuity
    cached = cache_get("macro:commodity_baseline")
    if use_cached_baseline and cached:
        try:
            base_prices = json.loads(cached)
        except Exception:
            pass

    for sym, base in base_prices.items():
        vol = VOLATILITY.get(sym, 0.02)
        noise = base * random.uniform(-vol, vol)
        price = max(base + noise, base * 0.5)  # don't go below 50%
        results[sym] = round(price, 2)
    # Cache as new baseline
    cache_set("macro:commodity_baseline", json.dumps(results), ttl_seconds=7200)
    return results


def _compute_changes(previous_prices: dict, current_prices: dict) -> dict:
    """Compute 1d, 1w, 1m percentage changes."""
    changes = {}
    for sym, cur in current_prices.items():
        prev = previous_prices.get(sym, cur)
        change_1d = round((cur - prev) / prev * 100, 2) if prev else 0
        # mock weekly/monthly from history if available
        history = cache_get(f"macro:commodity_history:{sym}")
        if history:
            try:
                h = json.loads(history)
                change_1w = round((cur - h.get("week", cur)) / h.get("week", cur) * 100, 2) if h.get("week") else change_1d
                change_1m = round((cur - h.get("month", cur)) / h.get("month", cur) * 100, 2) if h.get("month") else change_1d
            except Exception:
                change_1w = change_1d
                change_1m = change_1d
        else:
            change_1w = change_1d
            change_1m = change_1d
        changes[sym] = {"change_1d": change_1d, "change_1w": change_1w, "change_1m": change_1m}
    return changes


def _update_history(current_prices: dict):
    """Roll commodity price history (keep week and month ago values)."""
    for sym, cur in current_prices.items():
        history = cache_get(f"macro:commodity_history:{sym}")
        if history:
            try:
                h = json.loads(history)
                h["today"] = cur
                # if 7 days since last update, roll week
                h["week"] = h.get("today", cur)
                # if 30 days, roll month
                h["month"] = h.get("week", cur)
            except Exception:
                h = {"today": cur, "week": cur, "month": cur}
        else:
            h = {"today": cur, "week": cur, "month": cur}
        cache_set(f"macro:commodity_history:{sym}", json.dumps(h), ttl_seconds=86400 * 60)


def fetch_commodity_prices(force_refresh: bool = False) -> list:
    """Fetch all 31 commodities, store in DB, return list."""
    cached = cache_get("macro:commodities_latest")
    if cached and not force_refresh:
        return json.loads(cached)

    # Try FRED live
    fred_prices = _fetch_all_fred()
    mock_prices = _generate_mock_prices()

    # Merge: FRED takes priority when available, mock fills gaps
    combined = {}
    for sym in COMMODITY_SERIES:
        if sym in fred_prices and fred_prices[sym] is not None:
            combined[sym] = fred_prices[sym]
        elif sym in mock_prices:
            combined[sym] = mock_prices[sym]
        else:
            combined[sym] = MOCK_PRICES.get(sym, 100.0)

    # Compute changes
    previous = {}
    prev_cache = cache_get("macro:commodities_latest")
    if prev_cache:
        try:
            for item in json.loads(prev_cache):
                previous[item["symbol"]] = item["price"]
        except Exception:
            pass

    changes = _compute_changes(previous, combined)
    _update_history(combined)

    # Build records
    records = []
    for sym, price in combined.items():
        meta = COMMODITY_SERIES.get(sym, {})
        ch = changes.get(sym, {"change_1d": 0, "change_1w": 0, "change_1m": 0})
        records.append({
            "symbol": sym,
            "name": meta.get("name", sym),
            "price": price,
            "unit": meta.get("unit", "USD"),
            "source": "fred" if sym in fred_prices and fred_prices.get(sym) else "mock",
            "change_1d": ch["change_1d"],
            "change_1w": ch["change_1w"],
            "change_1m": ch["change_1m"],
        })

    insert_commodity_prices(records)
    cache_set("macro:commodities_latest", json.dumps(records), ttl_seconds=3600)
    return records


def get_latest_commodities_json() -> list:
    cached = cache_get("macro:commodities_latest")
    if cached:
        return json.loads(cached)
    return fetch_commodity_prices()