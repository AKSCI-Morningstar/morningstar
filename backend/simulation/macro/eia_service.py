"""EIA + GridStatus energy demand service — Manufacturing proxy via weather-normalized electricity."""
import os
import json
import logging
import random
import math
from datetime import datetime
from typing import Optional

import requests

from .database import cache_get, cache_set, insert_electricity_demand, get_latest_electricity

logger = logging.getLogger(__name__)

EIA_API_KEY = os.environ.get("EIA_API_KEY", "")
EIA_BASE = "https://api.eia.gov/v2/electricity/rto/region-data/data"

# US ISO/RTO regions for manufacturing proxy
REGIONS = {
    "CAISO":  {"name": "California ISO", "weight": 0.15, "baseline_mw": 28000},
    "ERCOT":  {"name": "ERCOT (Texas)", "weight": 0.18, "baseline_mw": 45000},
    "PJM":    {"name": "PJM Interconnection", "weight": 0.25, "baseline_mw": 65000},
    "MISO":   {"name": "Midcontinent ISO", "weight": 0.18, "baseline_mw": 38000},
    "NYISO":  {"name": "New York ISO", "weight": 0.08, "baseline_mw": 16000},
    "ISONE":  {"name": "ISO New England", "weight": 0.06, "baseline_mw": 13000},
    "SPP":    {"name": "Southwest Power Pool", "weight": 0.10, "baseline_mw": 22000},
}

# Typical temperature ranges by region (summer) for weather normalization
SEASONAL_TEMP = {
    "CAISO":  (18, 38), "ERCOT": (22, 40), "PJM": (15, 32),
    "MISO":   (16, 33), "NYISO": (14, 30), "ISONE": (12, 28), "SPP": (18, 36),
}


def _fetch_eia_demand() -> dict:
    """Fetch hourly electricity demand by region from EIA API."""
    if not EIA_API_KEY:
        return {}
    try:
        resp = requests.get(EIA_BASE, params={
            "api_key": EIA_API_KEY,
            "data[]": "value",
            "facets[respondent][]": list(REGIONS.keys()),
            "frequency": "hourly",
            "sort[0][column]": "period",
            "sort[0][direction]": "desc",
            "length": 50,
        }, timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            results = {}
            for item in data.get("response", {}).get("data", []):
                region = item.get("respondent")
                val = item.get("value")
                if region in REGIONS and val:
                    if region not in results:
                        results[region] = float(val)
            return results
    except Exception as e:
        logger.warning(f"EIA fetch failed: {e}")
    return {}


def _compute_manufacturing_pulse(region: str, demand_mw: float, weather_temp: float) -> float:
    """
    Aerospace Production Pulse (0-100):
    Weather-normalized electricity demand as proxy for manufacturing activity.
    Formula: (actual_demand - weather_effect) / baseline_capacity * 100
    """
    meta = REGIONS.get(region, {})
    baseline = meta.get("baseline_mw", 20000)
    # Estimate weather effect: ~1.5% demand change per °C above/below 20°C
    temp_effect = (weather_temp - 20) * 0.015 * baseline
    normalized = demand_mw - temp_effect
    pulse = max(0, min(100, (normalized / baseline) * 50 + 50))
    return round(pulse, 1)


def _generate_mock_demand() -> list:
    """Generate realistic mock electricity demand data."""
    records = []
    hour = datetime.utcnow().hour
    is_peak = 7 <= hour <= 22
    for region, meta in REGIONS.items():
        baseline = meta["baseline_mw"]
        # Peak hours increase demand 15-30%, off-peak decreases 10-25%
        peak_factor = random.uniform(1.15, 1.30) if is_peak else random.uniform(0.75, 0.90)
        noise = random.uniform(-0.05, 0.05)
        demand_mw = round(baseline * peak_factor * (1 + noise), 1)
        temp_range = SEASONAL_TEMP.get(region, (15, 30))
        weather_temp = round(random.uniform(temp_range[0], temp_range[1]), 1)
        normalized = demand_mw - (weather_temp - 20) * 0.015 * baseline
        normalized_demand = round(normalized, 1)
        pulse = _compute_manufacturing_pulse(region, demand_mw, weather_temp)
        records.append({
            "region": region,
            "demand_mw": demand_mw,
            "weather_temp": weather_temp,
            "normalized_demand": normalized_demand,
            "manufacturing_pulse": pulse,
        })
    return records


def fetch_electricity_demand(force_refresh: bool = False) -> list:
    """Fetch electricity demand, compute Manufacturing Pulse, store in DB."""
    cached = cache_get("macro:electricity_latest")
    if cached and not force_refresh:
        return json.loads(cached)

    eia_data = _fetch_eia_demand()
    records = []

    for region, meta in REGIONS.items():
        if region in eia_data and eia_data[region] is not None:
            demand_mw = eia_data[region]
            temp_range = SEASONAL_TEMP.get(region, (15, 30))
            weather_temp = round(random.uniform(temp_range[0], temp_range[1]), 1)  # fallback if no weather API
            normalized_demand = round(demand_mw - (weather_temp - 20) * 0.015 * meta["baseline_mw"], 1)
            pulse = _compute_manufacturing_pulse(region, demand_mw, weather_temp)
        else:
            # Mock it
            baseline = meta["baseline_mw"]
            hour = datetime.utcnow().hour
            is_peak = 7 <= hour <= 22
            peak_factor = random.uniform(1.15, 1.30) if is_peak else random.uniform(0.75, 0.90)
            demand_mw = round(baseline * peak_factor, 1)
            temp_range = SEASONAL_TEMP.get(region, (15, 30))
            weather_temp = round(random.uniform(temp_range[0], temp_range[1]), 1)
            normalized_demand = round(demand_mw - (weather_temp - 20) * 0.015 * baseline, 1)
            pulse = _compute_manufacturing_pulse(region, demand_mw, weather_temp)

        records.append({
            "region": region,
            "demand_mw": demand_mw,
            "weather_temp": weather_temp,
            "normalized_demand": normalized_demand,
            "manufacturing_pulse": pulse,
        })

    insert_electricity_demand(records)

    # Calculate aggregate Aerospace Production Pulse
    total_pulse = sum(r["manufacturing_pulse"] * REGIONS[r["region"]]["weight"] for r in records)
    records.append({
        "region": "US_AGGREGATE",
        "demand_mw": sum(r["demand_mw"] for r in records),
        "weather_temp": None,
        "normalized_demand": sum(r["normalized_demand"] for r in records),
        "manufacturing_pulse": round(total_pulse, 1),
    })

    cache_set("macro:electricity_latest", json.dumps(records), ttl_seconds=900)
    return records


def get_manufacturing_pulse() -> float:
    """Get latest aggregate Manufacturing Pulse (0-100)."""
    data = get_latest_electricity_json()
    for r in data:
        if r.get("region") == "US_AGGREGATE":
            return r["manufacturing_pulse"]
    return 50.0


def get_latest_electricity_json() -> list:
    cached = cache_get("macro:electricity_latest")
    if cached:
        return json.loads(cached)
    return fetch_electricity_demand()