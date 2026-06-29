"""Maritime & Port Congestion service — VesselFinder + synthetic mock data."""
import json
import logging
import math
import os
import random
from datetime import datetime, timedelta
from typing import Optional

import requests

from .database import cache_get, cache_set, insert_port_congestion, get_latest_ports

logger = logging.getLogger(__name__)

VESSELFINDER_API_KEY = os.environ.get("VESSELFINDER_API_KEY", "")
VF_BASE = "https://api.vesselfinder.com/v2"

# Key aerospace/defense ports
PORTS = [
    {"port_name": "Port of Long Beach", "port_country": "US", "lat": 33.7543, "lon": -118.2137, "baseline_vessels": 45, "baseline_turnaround": 48},
    {"port_name": "Port of Los Angeles", "port_country": "US", "lat": 33.7396, "lon": -118.2613, "baseline_vessels": 52, "baseline_turnaround": 52},
    {"port_name": "Port of Houston", "port_country": "US", "lat": 29.7386, "lon": -95.2734, "baseline_vessels": 30, "baseline_turnaround": 36},
    {"port_name": "Port of Savannah", "port_country": "US", "lat": 32.0146, "lon": -80.8481, "baseline_vessels": 25, "baseline_turnaround": 40},
    {"port_name": "Port of Norfolk", "port_country": "US", "lat": 36.8634, "lon": -76.3003, "baseline_vessels": 20, "baseline_turnaround": 38},
    {"port_name": "Port of Rotterdam", "port_country": "Netherlands", "lat": 51.8985, "lon": 4.4436, "baseline_vessels": 55, "baseline_turnaround": 36},
    {"port_name": "Port of Hamburg", "port_country": "Germany", "lat": 53.5425, "lon": 9.9830, "baseline_vessels": 40, "baseline_turnaround": 32},
    {"port_name": "Port of Singapore", "port_country": "Singapore", "lat": 1.2809, "lon": 103.8580, "baseline_vessels": 80, "baseline_turnaround": 24},
    {"port_name": "Port of Shanghai", "port_country": "China", "lat": 31.2291, "lon": 121.4821, "baseline_vessels": 90, "baseline_turnaround": 20},
    {"port_name": "Port of Tokyo", "port_country": "Japan", "lat": 35.6625, "lon": 139.7605, "baseline_vessels": 35, "baseline_turnaround": 28},
    {"port_name": "Port of Pusan", "port_country": "South Korea", "lat": 35.1030, "lon": 129.0405, "baseline_vessels": 50, "baseline_turnaround": 22},
    {"port_name": "Port of Dubai", "port_country": "UAE", "lat": 25.3020, "lon": 55.0500, "baseline_vessels": 40, "baseline_turnaround": 30},
]


def _fetch_vesselfinder(port_lat: float, port_lon: float, radius_nm: float = 10) -> dict:
    """Fetch vessel positions near a port via VesselFinder API."""
    if not VESSELFINDER_API_KEY:
        return None
    try:
        resp = requests.get(f"{VF_BASE}/vessels", params={
            "key": VESSELFINDER_API_KEY,
            "lat": port_lat,
            "lon": port_lon,
            "radius": radius_nm,
            "limit": 100,
        }, timeout=10)
        if resp.status_code == 200:
            data = resp.json()
            vessels = data if isinstance(data, list) else data.get("vessels", [])
            at_anchor = sum(1 for v in vessels if v.get("status", "").lower() in ("at anchor", "moored", "anchored"))
            return {"total": len(vessels), "at_anchor": at_anchor}
    except Exception as e:
        logger.warning(f"VesselFinder fetch failed: {e}")
    return None


def _generate_mock_port_data(port: dict, hour: int) -> dict:
    """Generate realistic mock port congestion data."""
    baseline_vessels = port["baseline_vessels"]
    baseline_turnaround = port["baseline_turnaround"]

    # Seasonal patterns
    is_busy_season = 3 <= hour <= 9 or 14 <= hour <= 22
    busy_factor = random.uniform(1.1, 1.4) if is_busy_season else random.uniform(0.7, 0.95)

    vessel_count = int(baseline_vessels * busy_factor * random.uniform(0.9, 1.1))
    at_anchor = int(vessel_count * random.uniform(0.15, 0.40))

    # Turnaround increases with congestion
    congestion_ratio = vessel_count / baseline_vessels
    turnaround = baseline_turnaround * (0.8 + 0.4 * congestion_ratio) * random.uniform(0.9, 1.1)
    turnaround = round(turnaround, 1)

    # Congestion score 0-100
    congestion_score = min(100, max(0, round(
        (vessel_count / baseline_vessels - 0.7) / 0.6 * 100 +
        (turnaround / baseline_turnaround - 0.8) / 0.4 * 30
    )))

    return {
        "port_name": port["port_name"],
        "port_country": port["port_country"],
        "vessel_count": vessel_count,
        "at_anchor": at_anchor,
        "avg_turnaround_hours": turnaround,
        "congestion_score": congestion_score,
    }


def fetch_port_congestion(force_refresh: bool = False) -> list:
    """Fetch port congestion data, store in DB, return list."""
    cached = cache_get("macro:ports_latest")
    if cached and not force_refresh:
        return json.loads(cached)

    records = []
    hour = datetime.utcnow().hour

    for port in PORTS:
        vf_data = _fetch_vesselfinder(port["lat"], port["lon"])
        if vf_data:
            vessel_count = vf_data["total"]
            at_anchor = vf_data["at_anchor"]
            avg_turnaround = port["baseline_turnaround"] * (1 + (vessel_count / port["baseline_vessels"] - 1) * 0.5)
            avg_turnaround = round(avg_turnaround, 1)
            congestion_ratio = vessel_count / port["baseline_vessels"]
            congestion_score = min(100, max(0, round(
                (congestion_ratio - 0.7) / 0.6 * 100 +
                (avg_turnaround / port["baseline_turnaround"] - 0.8) / 0.4 * 30
            )))
            records.append({
                "port_name": port["port_name"],
                "port_country": port["port_country"],
                "vessel_count": vessel_count,
                "at_anchor": at_anchor,
                "avg_turnaround_hours": avg_turnaround,
                "congestion_score": congestion_score,
            })
        else:
            mock = _generate_mock_port_data(port, hour)
            records.append(mock)

    insert_port_congestion(records)
    cache_set("macro:ports_latest", json.dumps(records), ttl_seconds=1800)
    return records


def get_latest_ports_json() -> list:
    cached = cache_get("macro:ports_latest")
    if cached:
        return json.loads(cached)
    return fetch_port_congestion()