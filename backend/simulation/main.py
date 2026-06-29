"""
FastAPI Microservice — Morningstar Causal Risk Engine v2.0
Bayesian structural models, Monte Carlo simulation (10K+ iterations),
Bellman-Ford risk propagation, and historical back-testing.
Runs on port 8000, called by Node.js server via HTTP proxy.
"""

import json
import os
import time
from typing import Optional
from contextlib import asynccontextmanager

import httpx
import networkx as nx
import numpy as np
import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from engine import (
    build_graph_from_json,
    simulate_cascading_failure,
    simulate_cascading_failure_deterministic,
    optimize_sourcing,
    bellman_ford_risk_propagation,
)
from bayesian import (
    compute_failure_probability,
    compute_node_risk_profile,
    compute_network_risk_profile,
)
from models import (
    SimulationRequest,
    SimulationResult,
    RiskProfileRequest,
    BacktestRequest,
    GraphData,
)
from embeddings import ingest_documents, search_documents, load_from_graph

_graph_cache: Optional[nx.DiGraph] = None
_MAIN_API_URL = os.environ.get("MAIN_API_URL", "http://host.docker.internal:3456")

_HISTORICAL_EVENTS = []


async def _load_graph() -> nx.DiGraph:
    global _graph_cache
    if _graph_cache is not None:
        return _graph_cache

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{_MAIN_API_URL}/api/graph/state")
            resp.raise_for_status()
            data = resp.json()
            _graph_cache = build_graph_from_json(data)
            return _graph_cache
    except Exception as e:
        local_path = os.path.join(os.path.dirname(__file__), "..", "data-store.json")
        if os.path.exists(local_path):
            with open(local_path) as f:
                data = json.load(f)
                _graph_cache = build_graph_from_json(data.get("graph", {}))
                return _graph_cache
        raise HTTPException(status_code=503, detail=f"Cannot load graph data: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _graph_cache, _macro_scheduler_started
    await _load_graph()
    print(f"  + Risk engine loaded ({_graph_cache.number_of_nodes()} nodes, {_graph_cache.number_of_edges()} edges)")
    print(f"  + Bayesian models initialized with NumPy backend")
    print(f"  + Monte Carlo engine ready (10K iterations default)")
    print(f"  + Bellman-Ford risk propagation ready")
    # Start macro scheduler
    try:
        from macro.scheduler import start_scheduler
        ok = start_scheduler()
        _macro_scheduler_started = ok
        if ok:
            print(f"  + Macro Intelligence scheduler started (commodities/1h, energy/15m, borders/1h, ports/30m)")
        else:
            print(f"  + Macro Intelligence: APScheduler not available, data will load on demand")
    except Exception as e:
        print(f"  + Macro Intelligence scheduler init skipped: {e}")
    yield


app = FastAPI(title="Morningstar Causal Risk Engine", version="2.0.0", lifespan=lifespan)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "engine": "python-bayesian-monte-carlo-v2",
        "graph": {
            "nodes": _graph_cache.number_of_nodes() if _graph_cache else 0,
            "edges": _graph_cache.number_of_edges() if _graph_cache else 0,
        },
        "capabilities": [
            "bayesian-logistic-risk",
            "monte-carlo-10k",
            "bellman-ford-propagation",
            "historical-backtest",
            "network-risk-profile",
            "sourcing-optimization",
        ],
    }


# ═══════════════════════════════════════════════════════════════════════════
# Core Simulation
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/simulate", response_model=dict)
async def simulate(req: SimulationRequest):
    """Run Monte Carlo cascading failure simulation (10K+ iterations)."""
    graph = await _load_graph()
    result = simulate_cascading_failure(
        graph,
        trigger_node=req.triggerNodeId,
        severity=req.severity,
        duration=req.duration,
    )
    return result


@app.post("/simulate/fast", response_model=dict)
async def simulate_fast(req: SimulationRequest):
    """Fast deterministic simulation (single pass, no Monte Carlo)."""
    graph = await _load_graph()
    result = simulate_cascading_failure_deterministic(
        graph,
        trigger_node=req.triggerNodeId,
        severity=req.severity,
        duration=req.duration,
    )
    return result


# ═══════════════════════════════════════════════════════════════════════════
# Risk Profiles
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/risk-profile/node", response_model=dict)
async def risk_profile_node(req: RiskProfileRequest):
    """Compute Bayesian risk profile for a single node."""
    graph = await _load_graph()
    if req.nodeId not in graph:
        raise HTTPException(status_code=404, detail=f"Node '{req.nodeId}' not found")

    node_data = graph.nodes[req.nodeId]
    profile = compute_node_risk_profile(
        {k: v for k, v in node_data.items()},
        node_type=req.nodeType,
        n_samples=req.nSamples,
    )
    return {"nodeId": req.nodeId, "nodeType": req.nodeType, **profile}


@app.post("/risk-profile/network", response_model=dict)
async def risk_profile_network():
    """Compute Bayesian risk profiles for all nodes in the graph."""
    graph = await _load_graph()
    profiles = compute_network_risk_profile(
        [{"id": nid, **graph.nodes[nid]} for nid in graph.nodes],
        n_samples=5000,
    )

    # Sort by failure probability (highest first)
    profiles.sort(key=lambda p: p.get("failureProbability", {}).get("p50", 0), reverse=True)

    return {
        "totalNodes": len(profiles),
        "highRiskNodes": sum(
            1 for p in profiles
            if p.get("failureProbability", {}).get("p50", 0) > 0.5
        ),
        "profiles": profiles,
    }


# ═══════════════════════════════════════════════════════════════════════════
# Risk Propagation (Bellman-Ford)
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/propagation", response_model=dict)
async def risk_propagation(req: SimulationRequest):
    """Compute blast radius using Bellman-Ford risk propagation."""
    graph = await _load_graph()
    risk_scores = bellman_ford_risk_propagation(graph, req.triggerNodeId)

    affected = [
        {"nodeId": nid, "cumulativeRisk": score,
         "nodeName": nid.replace("_t", ""),
         "type": graph.nodes[nid].get("type", "unknown")}
        for nid, score in sorted(risk_scores.items(), key=lambda x: x[1], reverse=True)
        if score > 0
    ]

    return {
        "source": req.triggerNodeId,
        "totalReachable": len(affected),
        "riskScores": affected[:30],
        "engine": "bellman-ford",
    }


# ═══════════════════════════════════════════════════════════════════════════
# Historical Back-Testing
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/backtest", response_model=dict)
async def historical_backtest(req: BacktestRequest):
    """Run historical back-test: replay a past disruption through the model
    and compare predicted vs actual impact."""
    graph = await _load_graph()

    predicted = simulate_cascading_failure_deterministic(
        graph,
        trigger_node=req.triggerNodeId,
        severity=req.severity,
        duration=req.duration,
    )

    actual = req.actualImpact
    metrics = [
        ("totalAffectedNodes", "Affected Nodes", 0.15),
        ("criticalCount", "Critical Count", 0.20),
        ("warningCount", "Warning Count", 0.10),
        ("totalFinancialImpact", "Financial Impact", 0.25),
        ("averageRecoveryDays", "Recovery Days", 0.15),
        ("resilienceScore", "Resilience Score", 0.15),
    ]

    breakdown = []
    for key, label, weight in metrics:
        p_val = predicted.get(key, 0)
        a_val = actual.get(key, 0)
        denom = max(1, abs(a_val))
        mape = abs(p_val - a_val) / denom
        accuracy = max(0, round((1 - min(1, mape)) * 100))
        breakdown.append({
            "metric": label, "key": key,
            "predicted": p_val, "actual": a_val,
            "mape": round(mape, 3), "accuracy": accuracy, "weight": weight,
        })

    aggregate = round(sum(b["accuracy"] * b["weight"] for b in breakdown))

    return {
        "triggerNodeId": req.triggerNodeId,
        "predictedImpact": predicted,
        "actualImpact": actual,
        "accuracyBreakdown": breakdown,
        "aggregateAccuracy": aggregate,
    }


# ═══════════════════════════════════════════════════════════════════════════
# RAG — Local Vector Store (pure numpy/scipy, no external deps)
# ═══════════════════════════════════════════════════════════════════════════

class IngestRequest(BaseModel):
    documents: list[dict]


class SearchRequest(BaseModel):
    query: str
    k: int = 10


@app.post("/embeddings/ingest")
async def embeddings_ingest(req: IngestRequest):
    count = ingest_documents(req.documents)
    return {"status": "ok", "ingested": count}


@app.post("/embeddings/search")
async def embeddings_search(req: SearchRequest):
    results = search_documents(req.query, req.k)
    return {"query": req.query, "results": results, "count": len(results)}


@app.post("/embeddings/load-graph")
async def embeddings_load_graph():
    graph = await _load_graph()
    data = {
        "nodes": [{"id": nid, **graph.nodes[nid]} for nid in graph.nodes],
        "edges": [{"source": u, "target": v, **graph.edges[u, v]} for u, v in graph.edges],
    }
    from embeddings import store
    count = store.ingest(store, data, store)
    return {"status": "ok", "documents": count}


@app.post("/rag/query")
async def rag_query(req: SearchRequest):
    query = req.query
    results = search_documents(query, req.k)
    result_texts = [r["content"] for r in results[:5]]
    response = _generate_rag_response(query, result_texts, results)
    return {
        "query": query,
        "answer": response["answer"],
        "confidence": response["confidence"],
        "sources": results[:5],
        "totalSources": len(results),
    }


# ═══════════════════════════════════════════════════════════════════════════
# Macro Intelligence — Aerospace Macro Risk Score
# ═══════════════════════════════════════════════════════════════════════════

_macro_scheduler_started = False

@app.get("/macro/commodities")
async def macro_commodities():
    from macro.fred_service import get_latest_commodities_json
    try:
        data = get_latest_commodities_json()
        return {"status": "ok", "commodities": data, "count": len(data)}
    except Exception as e:
        return {"status": "error", "error": str(e), "commodities": [], "count": 0}


@app.get("/macro/energy")
async def macro_energy():
    from macro.eia_service import get_latest_electricity_json
    try:
        data = get_latest_electricity_json()
        return {"status": "ok", "energy": data, "count": len(data)}
    except Exception as e:
        return {"status": "error", "error": str(e), "energy": [], "count": 0}


@app.get("/macro/borders")
async def macro_borders():
    from macro.cbp_service import get_latest_borders_json
    try:
        data = get_latest_borders_json()
        return {"status": "ok", "borders": data, "count": len(data)}
    except Exception as e:
        return {"status": "error", "error": str(e), "borders": [], "count": 0}


@app.get("/macro/ports")
async def macro_ports():
    from macro.maritime_service import get_latest_ports_json
    try:
        data = get_latest_ports_json()
        return {"status": "ok", "ports": data, "count": len(data)}
    except Exception as e:
        return {"status": "error", "error": str(e), "ports": [], "count": 0}


@app.get("/macro/composite")
async def macro_composite():
    from macro.scoring import compute_composite_score, get_score_history
    try:
        score = compute_composite_score()
        history = get_score_history(days=30)
        return {"status": "ok", "score": score, "history": history}
    except Exception as e:
        return {"status": "error", "error": str(e)}


@app.post("/macro/refresh")
async def macro_refresh():
    from macro.fred_service import fetch_commodity_prices
    from macro.eia_service import fetch_electricity_demand
    from macro.cbp_service import fetch_border_times
    from macro.maritime_service import fetch_port_congestion
    from macro.scoring import compute_composite_score
    try:
        fetch_commodity_prices(force_refresh=True)
        fetch_electricity_demand(force_refresh=True)
        fetch_border_times(force_refresh=True)
        fetch_port_congestion(force_refresh=True)
        score = compute_composite_score(force_refresh=True)
        return {"status": "ok", "refreshed": True, "score": score}
    except Exception as e:
        return {"status": "error", "error": str(e)}


@app.post("/macro/scheduler/start")
async def macro_scheduler_start():
    global _macro_scheduler_started
    from macro.scheduler import start_scheduler
    if not _macro_scheduler_started:
        ok = start_scheduler()
        _macro_scheduler_started = ok
        return {"status": "ok", "scheduler": "started" if ok else "unavailable"}
    return {"status": "ok", "scheduler": "already_running"}


@app.get("/macro/recommendations")
async def macro_recommendations():
    from macro.scoring import compute_composite_score, get_threshold_recommendations
    try:
        score = compute_composite_score()
        recs = get_threshold_recommendations(score)
        return {"status": "ok", "score": score, "recommendations": recs}
    except Exception as e:
        return {"status": "error", "error": str(e)}


def _generate_rag_response(query, contexts, results):
    query_lower = query.lower()
    ctx_str = "\n".join(contexts)
    from bayesian_routes import route_query
    return route_query(query_lower, ctx_str, results)


# ═══════════════════════════════════════════════════════════════════════════
# Sourcing Optimization
# ═══════════════════════════════════════════════════════════════════════════

class OptimizeRequest(BaseModel):
    demands: list[dict]
    suppliers: list[str]


@app.post("/optimize", response_model=dict)
async def optimize(req: OptimizeRequest):
    """Allocate demand across suppliers optimally."""
    graph = await _load_graph()
    result = optimize_sourcing(graph, req.demands, req.suppliers)
    return {"allocations": result}


# ═══════════════════════════════════════════════════════════════════════════
# Reload
# ═══════════════════════════════════════════════════════════════════════════

@app.post("/reload")
async def reload_graph():
    """Force reload graph data from main API."""
    global _graph_cache
    _graph_cache = None
    await _load_graph()
    return {"status": "ok", "nodes": _graph_cache.number_of_nodes(), "edges": _graph_cache.number_of_edges()}


if __name__ == "__main__":
    port = int(os.environ.get("SIMULATION_PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
