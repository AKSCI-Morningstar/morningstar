"""
Aerospace Macro Risk Score — Original 4-pillar scoring algorithm.
Distinct from SupplyMaven's GDI/SMI methodology.
Weights and components are unique to aerospace/defense supply chains.
"""
import json
import logging
import math
from datetime import datetime
from typing import Optional

from .database import (
    cache_get, cache_set,
    get_latest_commodities, get_latest_electricity,
    get_latest_borders, get_latest_ports,
    get_latest_composite, get_composite_history,
    insert_composite_score,
)
from .fred_service import get_latest_commodities_json
from .eia_service import get_latest_electricity_json, get_manufacturing_pulse
from .cbp_service import get_latest_borders_json
from .maritime_service import get_latest_ports_json

logger = logging.getLogger(__name__)

# ============================================================
# PILLAR WEIGHTS (Aerospace-specific, original IP)
# ============================================================
# Our weights differ from SupplyMaven's (30% Transport, 25% Energy, 25% Materials, 20% Macro).
# We use: 40% Material Availability (aerospace-critical alloys),
#         30% Logistics Fluidity (port + border),
#         20% Manufacturing Momentum (weather-normalized electricity),
#         10% Geopolitical/Macro (external indices).
PILLAR_WEIGHTS = {
    "material": 0.40,
    "logistics": 0.30,
    "manufacturing": 0.20,
    "geopolitical": 0.10,
}

# Aerospace-critical materials for the Material Availability pillar
AEROSPACE_MATERIALS = [
    "TITANIUM_SPONGE", "ALUMINUM", "COPPER", "NICKEL", "COBALT",
    "RARE_EARTH", "LITHIUM", "TUNGSTEN", "CHROMIUM", "MANGANESE",
    "ALUMINA", "MAGNESIUM", "STEEL",
]

# Ports critical for aerospace logistics
CRITICAL_PORTS = [
    "Port of Long Beach", "Port of Los Angeles", "Port of Houston",
    "Port of Savannah", "Port of Norfolk",
    "Port of Rotterdam", "Port of Hamburg",
    "Port of Singapore", "Port of Shanghai", "Port of Tokyo",
]


def _calculate_material_score(commodities: list) -> float:
    """Pillar 1: Material Availability (0-100, lower = better availability).
    Based on price volatility of aerospace-critical materials.
    """
    if not commodities:
        return 50.0

    prices = {c["symbol"]: c for c in commodities}

    scores = []
    for sym in AEROSPACE_MATERIALS:
        c = prices.get(sym)
        if not c:
            continue
        # Volatility contribution: higher volatility = worse (higher score)
        vol = abs(c.get("change_1d", 0)) * 0.3 + abs(c.get("change_1w", 0)) * 0.4 + abs(c.get("change_1m", 0)) * 0.3
        vol_score = min(100, vol * 2)

        # Price level contribution: elevated prices increase risk
        price = c["price"]
        # Normalize relative to typical baseline
        base_price = _get_baseline_price(sym)
        if base_price > 0:
            price_ratio = price / base_price
            price_score = max(0, min(100, (price_ratio - 0.5) / 1.5 * 100))
        else:
            price_score = 50

        combined = vol_score * 0.6 + price_score * 0.4
        scores.append(combined)

    if not scores:
        return 50.0

    # Weight by material criticality to aerospace
    criticality = {
        "TITANIUM_SPONGE": 3.0, "ALUMINUM": 2.5, "NICKEL": 2.0, "COBALT": 2.0,
        "RARE_EARTH": 3.0, "LITHIUM": 1.5, "TUNGSTEN": 2.0, "CHROMIUM": 1.5,
        "MANGANESE": 1.5, "COPPER": 2.0, "ALUMINA": 1.5, "MAGNESIUM": 1.0, "STEEL": 2.0,
    }

    # Weighted average by material criticality to aerospace
    matched_syms = [c["symbol"] for c in commodities if c.get("symbol") in AEROSPACE_MATERIALS]
    total_weight = 0.0
    weighted_sum = 0.0
    for i, sym in enumerate(matched_syms):
        if i < len(scores):
            w = criticality.get(sym, 1.0)
            weighted_sum += scores[i] * w
            total_weight += w
    material_score = (weighted_sum / total_weight) if total_weight > 0 else (sum(scores) / len(scores))

    return round(material_score, 1)


def _get_baseline_price(symbol: str) -> float:
    """Get baseline price for normalization."""
    BASELINES = {
        "TITANIUM_SPONGE": 38.0, "ALUMINUM": 2300, "COPPER": 3.90,
        "NICKEL": 7.50, "COBALT": 16.0, "RARE_EARTH": 80.0, "LITHIUM": 14000,
        "TUNGSTEN": 300, "CHROMIUM": 1.0, "MANGANESE": 4.0,
        "ALUMINA": 400, "MAGNESIUM": 2500, "STEEL": 700,
        "WTI_OIL": 75, "BRENT_OIL": 80, "NATGAS": 2.80,
        "GOLD": 2000, "SILVER": 24, "PLATINUM": 900,
        "PALLADIUM": 1000, "IRON_ORE": 110, "WHEAT": 5.50,
        "CORN": 4.50, "SOYBEAN": 12.0, "RUBBER": 1.50, "COTTON": 0.80,
        "ZINC": 1.20, "LEAD": 0.90, "TIN": 4.20, "URANIUM": 40,
        "RHODIUM": 4500, "ALUMINA": 420, "MAGNESIUM": 2600,
    }
    return BASELINES.get(symbol, 100)


def _calculate_logistics_score(ports: list, borders: list) -> float:
    """Pillar 2: Logistics Fluidity (0-100, lower = better).
    Weighted combination of port congestion + border wait times.
    """
    port_score = 50.0
    border_score = 50.0

    if ports:
        critical_port_scores = []
        for p in ports:
            if p["port_name"] in CRITICAL_PORTS:
                critical_port_scores.append(p.get("congestion_score", 50))
        if critical_port_scores:
            port_score = sum(critical_port_scores) / len(critical_port_scores)

    if borders:
        waits = [b["wait_minutes"] for b in borders if b.get("wait_minutes") is not None]
        if waits:
            avg_wait = sum(waits) / len(waits)
            # Normalize: 0 min = 0, 120+ min = 100
            border_score = min(100, avg_wait / 120 * 100)

    logistics_score = port_score * 0.6 + border_score * 0.4
    return round(logistics_score, 1)


def _calculate_manufacturing_score() -> float:
    """Pillar 3: Manufacturing Momentum (0-100, higher = better momentum).
    Inverted: the Pulse is 0-100 where higher = more activity.
    We invert so higher score = higher risk (worse).
    """
    pulse = get_manufacturing_pulse()
    # Invert: low manufacturing = high risk
    # 100 pulse = 10 risk, 0 pulse = 90 risk
    manufacturing_score = 100 - pulse * 0.8
    return round(manufacturing_score, 1)


def _calculate_geopolitical_score() -> float:
    """Pillar 4: Geopolitical/Macro (0-100, higher = more risk).
    Uses FRED Global Supply Chain Pressure Index (GSCPI) or VIX as proxy.
    Falls back to commodity volatility composite.
    """
    # Try to get VIX from cache (would be fetched by FRED service)
    # For now, derive from WTI/Brent volatility as geopolitical proxy
    commodities = get_latest_commodities_json()
    score = 40.0  # default moderate

    if commodities:
        prices = {c["symbol"]: c for c in commodities}
        # Energy volatility as geopolitical proxy
        energy_vol = 0
        for sym in ["WTI_OIL", "BRENT_OIL", "NATGAS"]:
            c = prices.get(sym)
            if c and "change_1w" in c:
                energy_vol += abs(c["change_1w"])
        energy_vol /= 3
        score = min(100, max(0, energy_vol * 1.5 + 30))

    return round(score, 1)


def _determine_trend(history: list, current_composite: float) -> str:
    """Determine trend direction based on recent history."""
    if not history or len(history) < 2:
        return "stable"
    recent = history[-5:] if len(history) >= 5 else history
    values = [h["composite_score"] for h in recent]
    if len(values) < 2:
        return "stable"
    slope = (values[-1] - values[0]) / len(values)
    if slope > 1:
        return "deteriorating"
    elif slope < -1:
        return "improving"
    return "stable"


def compute_composite_score(force_refresh: bool = False) -> dict:
    """Compute full Aerospace Macro Risk Score from all pillars."""
    cached = cache_get("macro:composite_latest")
    if cached and not force_refresh:
        return json.loads(cached)

    commodities = get_latest_commodities_json()
    ports = get_latest_ports_json()
    borders = get_latest_borders_json()

    material = _calculate_material_score(commodities)
    logistics = _calculate_logistics_score(ports, borders)
    manufacturing = _calculate_manufacturing_score()
    geopolitical = _calculate_geopolitical_score()

    composite = (
        material * PILLAR_WEIGHTS["material"] +
        logistics * PILLAR_WEIGHTS["logistics"] +
        manufacturing * PILLAR_WEIGHTS["manufacturing"] +
        geopolitical * PILLAR_WEIGHTS["geopolitical"]
    )
    composite = round(composite, 1)

    # Determine trend from history
    history = get_composite_history(days=30)
    trend = _determine_trend(history, composite)

    result = {
        "composite": composite,
        "material": material,
        "logistics": logistics,
        "manufacturing": manufacturing,
        "geopolitical": geopolitical,
        "trend": trend,
        "timestamp": datetime.utcnow().isoformat(),
        "pillar_weights": PILLAR_WEIGHTS,
    }

    insert_composite_score(result)
    cache_set("macro:composite_latest", json.dumps(result), ttl_seconds=900)
    return result


def get_score_history(days: int = 30) -> list:
    return get_composite_history(days)


def get_threshold_recommendations(score: Optional[dict] = None) -> list:
    """Generate hedge recommendations based on score thresholds."""
    if score is None:
        score = cache_get("macro:composite_latest")
        if score:
            score = json.loads(score)
        else:
            score = compute_composite_score()

    composite = score["composite"]
    recommendations = []

    if composite >= 75:
        recommendations.extend([
            {"action": "ACCELERATE_PROCUREMENT", "priority": "critical",
             "message": "Accelerate titanium & aluminum procurement — material risk elevated"},
            {"action": "DIVERSIFY_ROUTES", "priority": "high",
             "message": "Diversify shipping routes — logistics stress detected"},
            {"action": "INCREASE_BUFFER_STOCK", "priority": "high",
             "message": "Increase safety stock to 90 days — macro risk critical"},
        ])
    elif composite >= 55:
        recommendations.extend([
            {"action": "MONITOR_MATERIALS", "priority": "medium",
             "message": "Monitor aerospace material prices — volatility increasing"},
            {"action": "REVIEW_LOGISTICS", "priority": "medium",
             "message": "Review logistics alternatives — port congestion rising"},
        ])
    elif composite >= 35:
        recommendations.append(
            {"action": "ROUTINE_MONITORING", "priority": "low",
             "message": "Standard monitoring — macro conditions stable"}
        )
    else:
        recommendations.append(
            {"action": "OPPORTUNISTIC_BUY", "priority": "low",
             "message": "Favorable conditions — consider opportunistic procurement"}
        )

    # Pillar-specific recommendations
    if score["material"] >= 70:
        recommendations.insert(0, {"action": "HEDGE_MATERIALS", "priority": "high",
            "message": f"Material risk at {score['material']}/100 — consider fixed-price contracts"})
    if score["logistics"] >= 65:
        recommendations.insert(0, {"action": "HEDGE_LOGISTICS", "priority": "high",
            "message": f"Logistics risk at {score['logistics']}/100 — explore air freight alternatives"})
    if score["manufacturing"] >= 60:
        recommendations.insert(0, {"action": "MONITOR_PRODUCTION", "priority": "medium",
            "message": f"Manufacturing momentum declining (pulse {score['manufacturing']}/100) — audit supplier production lines"})

    return recommendations