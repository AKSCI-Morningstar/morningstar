"""
Multi-Echelon Supply Chain Simulation Engine.
Bellman-Ford risk propagation + cascading failure + sourcing optimization.
"""

import math
import networkx as nx
import numpy as np
from typing import Optional

from bayesian import compute_failure_probability, compute_node_risk_profile
from monte_carlo import run_monte_carlo


# ═══════════════════════════════════════════════════════════════════════════
# Bellman-Ford Risk Propagation
# ═══════════════════════════════════════════════════════════════════════════

def compute_risk_weight(edge_data: dict) -> float:
    """
    Compute edge weight for risk propagation.
    Higher weight = higher risk/cost amplification.
    """
    # Base weight from lead time (normalized to ~1-10 range)
    lead_time = edge_data.get('leadTime', edge_data.get('lead_time', 1))
    base_weight = math.log(max(1, lead_time)) / math.log(10) * 3

    # Edge type multiplier
    type_mult = {
        'supplies': 1.2,      # Critical supply flow
        'manufactures': 1.0,  # Manufacturing dependency
        'depends_on': 0.8,    # Assembly dependency
        'ships_to': 0.5,      # Logistics (less critical)
    }
    edge_type = edge_data.get('type', 'depends_on')
    multiplier = type_mult.get(edge_type, 1.0)

    return base_weight * multiplier


def bellman_ford_risk_propagation(
    graph: nx.DiGraph,
    source: str,
) -> dict[str, float]:
    """
    Bellman-Ford algorithm customized for risk propagation.
    Finds the highest-cumulative-risk path from source to each node.

    Returns dict of {node_id: cumulative_risk_score}.
    Handles negative weights (risk amplification) correctly.
    """
    if source not in graph:
        return {}

    distances = {node: float('inf') for node in graph.nodes}
    distances[source] = 0.0

    # Bellman-Ford: relax all edges |V|-1 times
    for _ in range(len(graph.nodes) - 1):
        updated = False
        for u, v, data in graph.edges(data=True):
            if distances[u] != float('inf'):
                weight = compute_risk_weight(data)
                factor = distances[u] * (1.0 + weight / 10.0)
                if factor < distances[v]:
                    distances[v] = factor
                    updated = True
        if not updated:
            break

    # Normalize: lower distance = higher risk
    # Nodes with infinite distance are unreachable
    max_dist = max(d for d in distances.values() if d != float('inf')) or 1
    risk_scores = {}
    for node, dist in distances.items():
        if dist == float('inf'):
            risk_scores[node] = 0.0
        else:
            # Normalize to 0-100 scale (higher = at higher risk)
            risk_scores[node] = round((1.0 - dist / max_dist) * 100, 1)

    return risk_scores


# ═══════════════════════════════════════════════════════════════════════════
# Cascading Failure Simulation
# ═══════════════════════════════════════════════════════════════════════════

def simulate_cascading_failure(
    graph: nx.DiGraph,
    trigger_node: str,
    severity: float = 0.8,
    duration: int = 30,
) -> dict:
    """Run multi-echelon cascading failure with Monte Carlo sampling."""
    return run_monte_carlo(graph, trigger_node, severity, duration, n_iterations=10000)


def simulate_cascading_failure_deterministic(
    graph: nx.DiGraph,
    trigger_node: str,
    severity: float = 0.8,
    duration: int = 30,
) -> dict:
    """
    Deterministic cascading failure (single pass, no Monte Carlo).
    Used for fast previews or when Monte Carlo isn't needed.
    """
    if trigger_node not in graph:
        return {'error': f"Node '{trigger_node}' not found in graph"}

    # Compute risk propagation scores
    risk_scores = bellman_ford_risk_propagation(graph, trigger_node)

    # Get trigger node data
    trigger_data = graph.nodes[trigger_node]

    # Find affected nodes (those reachable from trigger)
    try:
        descendants = nx.descendants(graph, trigger_node)
        affected_ids = [trigger_node] + list(descendants)
    except nx.NetworkXError:
        affected_ids = [trigger_node]

    results = []
    for node_id in affected_ids:
        node = graph.nodes[node_id]
        depth = 0
        try:
            if node_id != trigger_node:
                depth = nx.shortest_path_length(graph, trigger_node, node_id)
        except (nx.NetworkXError, nx.NodeNotFound):
            depth = 999

        dampening = max(0.05, 1.0 - depth * 0.15)
        impact = severity * dampening

        revenue = node.get('revenue', 0)
        qty = node.get('qty', 0)
        reorder = node.get('reorder', 100)

        financial = revenue * impact * (duration / 365.0)
        if node.get('type') == 'component' and qty > 0:
            financial += reorder * 4200 * impact * (duration / 30.0)

        recovery = round(duration * dampening + len(list(graph.successors(node_id))) * 2)
        risk_before = node.get('risk', 0)
        risk_after = min(100, risk_before + round(impact * 100))

        impact_score = round(impact * 100)
        status = 'critical' if impact_score > 50 else ('warning' if impact_score > 25 else 'monitor')

        results.append({
            'nodeId': node_id,
            'nodeName': node_id.replace('_t', ''),
            'type': node.get('type', 'unknown'),
            'depth': depth,
            'impactScore': impact_score,
            'riskBefore': risk_before,
            'riskAfter': risk_after,
            'recoveryDays': recovery,
            'financialImpact': round(financial),
            'propagationRisk': risk_scores.get(node_id, 0),
            'status': status,
        })

    results.sort(key=lambda r: r['impactScore'], reverse=True)

    total_financial = sum(r['financialImpact'] for r in results)
    critical_count = sum(1 for r in results if r['status'] == 'critical')
    warning_count = sum(1 for r in results if r['status'] == 'warning')
    avg_recovery = round(sum(r['recoveryDays'] for r in results) / max(1, len(results)))

    avg_impact = sum(r['impactScore'] for r in results) / max(1, len(results))
    critical_ratio = critical_count / max(1, len(results))
    resilience = max(0, round(100 - (avg_impact * 0.7 + critical_ratio * 30)))

    return {
        'triggerNode': trigger_node,
        'severity': severity,
        'duration': duration,
        'totalAffectedNodes': len(results),
        'criticalCount': critical_count,
        'warningCount': warning_count,
        'totalFinancialImpact': total_financial,
        'averageRecoveryDays': avg_recovery,
        'resilienceScore': resilience,
        'affectedNodes': results[:20],
        'engine': 'python-bellman-ford',
        'timestamp': __import__('time').time(),
    }


# ═══════════════════════════════════════════════════════════════════════════
# Sourcing Optimization
# ═══════════════════════════════════════════════════════════════════════════

def optimize_sourcing(
    graph: nx.DiGraph,
    demands: list[dict],
    suppliers: list[str],
) -> list[dict]:
    """Allocate demand across suppliers optimally using risk-weighted scoring."""
    allocations = []
    for demand in demands:
        available = [
            s for s in suppliers
            if s in graph and graph.nodes[s].get('type') == 'supplier'
            and graph.nodes[s].get('risk', 100) < 50
        ]

        allocation = {}
        remaining = demand.get('quantity', 100)

        for s in available:
            node = graph.nodes[s]
            risk = node.get('risk', 0)
            credit = node.get('creditScore', 50)
            # Score: higher is better
            score = (100 - risk) * 0.6 + credit * 0.4
            total_score = sum(
                (100 - graph.nodes[av].get('risk', 0)) * 0.6
                + graph.nodes[av].get('creditScore', 50) * 0.4
                for av in available
            ) or 1

            share = min(remaining, max(1, round(demand.get('quantity', 100) * score / total_score)))
            if share > 0:
                allocation[s] = {
                    'quantity': share,
                    'cost': share * 4200,
                    'risk': node.get('risk', 0),
                    'leadTime': 14,
                    'score': round(score, 1),
                }
                remaining -= share

        allocations.append({
            'partId': demand.get('partId', 'unknown'),
            'totalQuantity': demand.get('quantity', 100),
            'allocated': allocation,
            'unallocated': remaining,
            'totalCost': sum(a['cost'] for a in allocation.values()),
            'averageRisk': round(
                sum(a['risk'] for a in allocation.values()) / max(1, len(allocation))
            ),
        })

    return allocations


# ═══════════════════════════════════════════════════════════════════════════
# Graph Builders
# ═══════════════════════════════════════════════════════════════════════════

def build_graph_from_json(data: dict) -> nx.DiGraph:
    """Build a NetworkX DiGraph from the stored JSON format."""
    G = nx.DiGraph()
    for node in data.get('nodes', []):
        attrs = {k: v for k, v in node.items() if k != 'id'}
        G.add_node(node['id'], **attrs)
    for edge in data.get('edges', []):
        edge_attrs = {k: v for k, v in edge.items() if k not in ('source', 'target')}
        G.add_edge(edge['source'], edge['target'], **edge_attrs)
    return G
