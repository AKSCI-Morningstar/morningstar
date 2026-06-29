import json
import os
import sqlite3
import threading
from datetime import datetime, timedelta
from typing import Optional

DB_PATH = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'macro.db')

_local = threading.local()

def get_db():
    if not hasattr(_local, 'conn') or _local.conn is None:
        _local.conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        _local.conn.row_factory = sqlite3.Row
        _local.conn.execute("PRAGMA journal_mode=WAL")
        _local.conn.execute("PRAGMA synchronous=NORMAL")
    return _local.conn

def init_db():
    db = get_db()
    db.executescript("""
        CREATE TABLE IF NOT EXISTS commodity_prices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            time TEXT NOT NULL,
            symbol TEXT NOT NULL,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            unit TEXT DEFAULT 'USD',
            source TEXT DEFAULT 'fred',
            change_1d REAL DEFAULT 0,
            change_1w REAL DEFAULT 0,
            change_1m REAL DEFAULT 0
        );
        CREATE INDEX IF NOT EXISTS idx_commodity_time ON commodity_prices(time);
        CREATE INDEX IF NOT EXISTS idx_commodity_symbol ON commodity_prices(symbol);

        CREATE TABLE IF NOT EXISTS electricity_demand (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            time TEXT NOT NULL,
            region TEXT NOT NULL,
            demand_mw REAL NOT NULL,
            weather_temp REAL,
            normalized_demand REAL,
            manufacturing_pulse REAL DEFAULT 50
        );
        CREATE INDEX IF NOT EXISTS idx_electricity_region ON electricity_demand(region, time);

        CREATE TABLE IF NOT EXISTS border_times (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            time TEXT NOT NULL,
            port_name TEXT NOT NULL,
            port_type TEXT DEFAULT 'land',
            wait_minutes INTEGER NOT NULL,
            lane_type TEXT DEFAULT 'standard',
            direction TEXT DEFAULT 'northbound'
        );
        CREATE INDEX IF NOT EXISTS idx_border_port ON border_times(port_name, time);

        CREATE TABLE IF NOT EXISTS port_congestion (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            time TEXT NOT NULL,
            port_name TEXT NOT NULL,
            port_country TEXT DEFAULT 'US',
            vessel_count INTEGER DEFAULT 0,
            at_anchor INTEGER DEFAULT 0,
            avg_turnaround_hours REAL DEFAULT 0,
            congestion_score REAL DEFAULT 50
        );
        CREATE INDEX IF NOT EXISTS idx_port_congestion_port ON port_congestion(port_name, time);

        CREATE TABLE IF NOT EXISTS macro_composite (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            time TEXT NOT NULL,
            material_score REAL NOT NULL,
            logistics_score REAL NOT NULL,
            manufacturing_score REAL NOT NULL,
            geopolitical_score REAL NOT NULL,
            composite_score REAL NOT NULL,
            trend TEXT DEFAULT 'stable'
        );
        CREATE INDEX IF NOT EXISTS idx_composite_time ON macro_composite(time);

        CREATE TABLE IF NOT EXISTS cache_store (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            expires_at TEXT NOT NULL
        );
    """)
    db.commit()

def cache_get(key: str) -> Optional[str]:
    db = get_db()
    row = db.execute("SELECT value FROM cache_store WHERE key = ? AND expires_at > ?", (key, datetime.utcnow().isoformat())).fetchone()
    return row[0] if row else None

def cache_set(key: str, value: str, ttl_seconds: int = 3600):
    db = get_db()
    expires = (datetime.utcnow() + timedelta(seconds=ttl_seconds)).isoformat()
    db.execute("INSERT OR REPLACE INTO cache_store (key, value, expires_at) VALUES (?, ?, ?)", (key, value, expires))
    db.commit()

def insert_commodity_prices(prices: list):
    db = get_db()
    now = datetime.utcnow().isoformat()
    for p in prices:
        db.execute(
            "INSERT INTO commodity_prices (time, symbol, name, price, unit, source, change_1d, change_1w, change_1m) VALUES (?,?,?,?,?,?,?,?,?)",
            (now, p['symbol'], p['name'], p['price'], p.get('unit', 'USD'), p.get('source', 'fred'), p.get('change_1d', 0), p.get('change_1w', 0), p.get('change_1m', 0))
        )
    db.commit()

def insert_electricity_demand(records: list):
    db = get_db()
    now = datetime.utcnow().isoformat()
    for r in records:
        db.execute(
            "INSERT INTO electricity_demand (time, region, demand_mw, weather_temp, normalized_demand, manufacturing_pulse) VALUES (?,?,?,?,?,?)",
            (now, r['region'], r['demand_mw'], r.get('weather_temp'), r.get('normalized_demand'), r.get('manufacturing_pulse', 50))
        )
    db.commit()

def insert_border_times(records: list):
    db = get_db()
    now = datetime.utcnow().isoformat()
    for r in records:
        db.execute(
            "INSERT INTO border_times (time, port_name, port_type, wait_minutes, lane_type, direction) VALUES (?,?,?,?,?,?)",
            (now, r['port_name'], r.get('port_type', 'land'), r['wait_minutes'], r.get('lane_type', 'standard'), r.get('direction', 'northbound'))
        )
    db.commit()

def insert_port_congestion(records: list):
    db = get_db()
    now = datetime.utcnow().isoformat()
    for r in records:
        db.execute(
            "INSERT INTO port_congestion (time, port_name, port_country, vessel_count, at_anchor, avg_turnaround_hours, congestion_score) VALUES (?,?,?,?,?,?,?)",
            (now, r['port_name'], r.get('port_country', 'US'), r['vessel_count'], r.get('at_anchor', 0), r['avg_turnaround_hours'], r['congestion_score'])
        )
    db.commit()

def insert_composite_score(score: dict):
    db = get_db()
    now = datetime.utcnow().isoformat()
    db.execute(
        "INSERT INTO macro_composite (time, material_score, logistics_score, manufacturing_score, geopolitical_score, composite_score, trend) VALUES (?,?,?,?,?,?,?)",
        (now, score['material'], score['logistics'], score['manufacturing'], score['geopolitical'], score['composite'], score.get('trend', 'stable'))
    )
    db.commit()

def get_latest_commodities():
    db = get_db()
    rows = db.execute("""
        SELECT symbol, name, price, unit, source, change_1d, change_1w, change_1m, time
        FROM commodity_prices
        WHERE id IN (SELECT MAX(id) FROM commodity_prices GROUP BY symbol)
    """).fetchall()
    return [dict(r) for r in rows]

def get_latest_electricity():
    db = get_db()
    rows = db.execute("""
        SELECT region, demand_mw, weather_temp, normalized_demand, manufacturing_pulse, time
        FROM electricity_demand
        WHERE id IN (SELECT MAX(id) FROM electricity_demand GROUP BY region)
    """).fetchall()
    return [dict(r) for r in rows]

def get_latest_borders():
    db = get_db()
    rows = db.execute("""
        SELECT port_name, port_type, wait_minutes, lane_type, direction, time
        FROM border_times
        WHERE id IN (SELECT MAX(id) FROM border_times GROUP BY port_name)
    """).fetchall()
    return [dict(r) for r in rows]

def get_latest_ports():
    db = get_db()
    rows = db.execute("""
        SELECT port_name, port_country, vessel_count, at_anchor, avg_turnaround_hours, congestion_score, time
        FROM port_congestion
        WHERE id IN (SELECT MAX(id) FROM port_congestion GROUP BY port_name)
    """).fetchall()
    return [dict(r) for r in rows]

def get_latest_composite():
    db = get_db()
    row = db.execute("SELECT * FROM macro_composite ORDER BY id DESC LIMIT 1").fetchone()
    return dict(row) if row else None

def get_composite_history(days=30):
    db = get_db()
    cutoff = (datetime.utcnow() - timedelta(days=days)).isoformat()
    rows = db.execute("SELECT * FROM macro_composite WHERE time > ? ORDER BY time ASC", (cutoff,)).fetchall()
    return [dict(r) for r in rows]

init_db()