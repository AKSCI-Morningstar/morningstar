"""APScheduler integration for macro data refresh cycles."""
import json
import logging
import os
import threading

logger = logging.getLogger(__name__)

# Lazy import for APScheduler to avoid breaking if not installed
_scheduler = None
_last_scores = {}

def get_scheduler():
    global _scheduler
    if _scheduler is not None:
        return _scheduler
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        _scheduler = BackgroundScheduler(daemon=True)
    except ImportError:
        logger.warning("APScheduler not installed; data will only refresh on-demand")
        _scheduler = None
    return _scheduler


def _refresh_commodities():
    from .fred_service import fetch_commodity_prices
    logger.info("Macro: Refreshing commodity prices")
    try:
        fetch_commodity_prices(force_refresh=True)
    except Exception as e:
        logger.error(f"Commodity refresh failed: {e}")


def _refresh_energy():
    from .eia_service import fetch_electricity_demand
    logger.info("Macro: Refreshing energy demand")
    try:
        fetch_electricity_demand(force_refresh=True)
    except Exception as e:
        logger.error(f"Energy refresh failed: {e}")


def _refresh_borders():
    from .cbp_service import fetch_border_times
    logger.info("Macro: Refreshing border wait times")
    try:
        fetch_border_times(force_refresh=True)
    except Exception as e:
        logger.error(f"Border refresh failed: {e}")


def _refresh_ports():
    from .maritime_service import fetch_port_congestion
    logger.info("Macro: Refreshing port congestion")
    try:
        fetch_port_congestion(force_refresh=True)
    except Exception as e:
        logger.error(f"Port refresh failed: {e}")


def _refresh_composite():
    from .scoring import compute_composite_score
    global _last_scores
    logger.info("Macro: Computing composite score")
    try:
        scores = compute_composite_score(force_refresh=True)
        _last_scores = scores
    except Exception as e:
        logger.error(f"Composite refresh failed: {e}")


def start_scheduler():
    """Start all scheduled data refresh jobs."""
    sched = get_scheduler()
    if sched is None:
        logger.info("Macro scheduler not available (APScheduler missing)")
        return False

    if sched.running:
        return True

    # Run once immediately
    for fn in [_refresh_commodities, _refresh_energy, _refresh_borders, _refresh_ports]:
        try:
            fn()
        except Exception:
            pass
    _refresh_composite()

    # Schedule recurring jobs
    sched.add_job(_refresh_commodities, 'interval', hours=1, id='macro_commodities', replace_existing=True)
    sched.add_job(_refresh_energy, 'interval', minutes=15, id='macro_energy', replace_existing=True)
    sched.add_job(_refresh_borders, 'interval', hours=1, id='macro_borders', replace_existing=True)
    sched.add_job(_refresh_ports, 'interval', minutes=30, id='macro_ports', replace_existing=True)
    sched.add_job(_refresh_composite, 'interval', minutes=15, id='macro_composite', replace_existing=True)

    sched.start()
    logger.info("Macro scheduler started — commodities/1h, energy/15m, borders/1h, ports/30m, composite/15m")
    return True


def stop_scheduler():
    sched = get_scheduler()
    if sched and sched.running:
        sched.shutdown(wait=False)
        logger.info("Macro scheduler stopped")


def get_latest_composite_snapshot() -> dict:
    global _last_scores
    if _last_scores:
        return _last_scores
    from .scoring import compute_composite_score
    try:
        _last_scores = compute_composite_score()
    except Exception:
        _last_scores = {
            "composite": 50.0, "material": 50.0, "logistics": 50.0,
            "manufacturing": 50.0, "geopolitical": 50.0, "trend": "stable",
            "pillar_weights": {}, "timestamp": None,
        }
    return _last_scores