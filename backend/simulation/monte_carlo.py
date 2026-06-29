"""
Monte Carlo Supply Chain Disruption Engine.
Runs N iterations of cascading failure simulation with Bayesian risk sampling.
"""

import numpy as np
import networkx as nx
import random
from typing import Optional
from bayesian import compute_failure_probability


def _compute_impact(
    node: dict,
    depth: int,
    severity: float,
    duration: int,
    failed: bool,
) -> dict:
    """
    Compute impact metrics for a single node given disruption parameters.
    """
    if not failed:
        return {
            'impactScore': 0,
            'financialImpact': 0,
            'recoveryDays': 0,
            'riskDelta': 0,
            'status': 'unaffected',
        }

    dampening = max(0.05, 1.0 - depth * 0.15)
    impact = severity * dampening

    revenue = node.get('revenue', 0)
    qty = node.get('qty', 0)
    reorder = node.get('reorder', 100)

    financial = revenue * impact * (duration / 365.0)
    if node.get('type') == 'component' and qty > 0:
        financial += reorder * 4200 * impact * (duration / 30.0)

    recovery = round(duration * dampening + random.randint(0, 4))
    risk_delta = round(impact * 100)

    impact_score = round(impact * 100)
    if impact_score > 50:
        status = 'critical'
    elif impact_score > 25:
        status = 'warning'
    else:
        status = 'monitor'

    return {
        'impactScore': impact_score,
        'financialImpact': round(financial),
        'recoveryDays': recovery,
        'riskDelta': risk_delta,
        'status': status,
    }


def run_monte_carlo(
    graph: nx.DiGraph,
    trigger_node: str,
    severity: float = 0.8,
    duration: int = 30,
    n_iterations: int = 10000,
    seed: Optional[int] = None,
) -> dict:
    """
    Run Monte Carlo simulation of cascading supply chain failure.

    Each iteration:
    1. Compute P(failure) for the trigger node using Bayesian model
    2. Sample whether trigger actually fails
    3. If trigger fails, probabilistically propagate downstream
    4. Compute financial and recovery impacts
    5. Record iteration-level metrics

    Returns aggregated statistics across all iterations.
    """
    if seed is not None:
        np.random.seed(seed)
        random.seed(seed)

    if trigger_node not in graph:
        return {'error': f"Node '{trigger_node}' not found in graph"}

    # Get trigger node data
    trigger_data = graph.nodes[trigger_node]
    trigger_type = trigger_data.get('type', 'supplier')
    trigger_attrs = {k: v for k, v in trigger_data.items() if k != 'id'}

    # Precompute Bayesian failure probabilities for all nodes
    node_probs = {}
    for nid in graph.nodes:
        nd = graph.nodes[nid]
        ntype = nd.get('type', 'supplier')
        # Use trigger severity as a multiplier on base probability
        _, p50, _, _, _, _ = compute_failure_probability(
            {'attributes': {k: v for k, v in nd.items() if k != 'id'}},
            ntype,
            n_samples=1000,
        )
        # Scale by severity — higher severity increases failure prob
        base_p = p50
        scaled_p = min(0.99, base_p * (1.0 + severity * (1.0 - base_p)))
        node_probs[nid] = scaled_p

    # Storage for iteration results
    iteration_affected_counts = []
    iteration_critical_counts = []
    iteration_warning_counts = []
    iteration_financial_impacts = []
    iteration_recovery_days = []
    iteration_resilience_scores = []

    # Storage for per-node statistics
    node_impact_sums = {}
    node_financial_sums = {}
    node_recovery_sums = {}
    node_failure_counts = {}

    for nid in graph.nodes:
        node_impact_sums[nid] = 0.0
        node_financial_sums[nid] = 0.0
        node_recovery_sums[nid] = 0.0
        node_failure_counts[nid] = 0

    for iteration in range(n_iterations):
        # 1. Sample which nodes fail this iteration
        failed_nodes = set()
        for nid in graph.nodes:
            if np.random.random() < node_probs[nid]:
                failed_nodes.add(nid)

        # 2. Determine downstream propagation from trigger
        # A node is affected if it's downstream of trigger AND either
        #   (a) the trigger itself failed, or
        #   (b) it independently failed
        try:
            descendants = nx.descendants(graph, trigger_node)
        except nx.NetworkXError:
            descendants = set()

        affected = set()
        for nid in descendants:
            if nid in failed_nodes:
                affected.add(nid)
            elif trigger_node in failed_nodes:
                # Propagate: if trigger failed, downstream has increased risk
                # For this iteration, sample again with higher probability
                path_length = nx.shortest_path_length(graph, trigger_node, nid)
                propagation_factor = max(0.1, 1.0 - path_length * 0.2)
                adjusted_prob = node_probs[nid] * (1.0 + propagation_factor)
                if np.random.random() < min(0.99, adjusted_prob):
                    affected.add(nid)

        if trigger_node in failed_nodes:
            affected.add(trigger_node)

        # 3. Compute impacts for all affected nodes
        iter_results = []
        total_financial = 0
        total_recovery = 0
        critical_count = 0
        warning_count = 0
        impact_scores = []

        for nid in affected:
            depth = 0
            try:
                if nid == trigger_node:
                    depth = 0
                else:
                    depth = nx.shortest_path_length(graph, trigger_node, nid)
            except (nx.NetworkXError, nx.NodeNotFound):
                depth = 1

            nd = graph.nodes[nid]
            impact = _compute_impact(
                {k: v for k, v in nd.items()}, depth, severity, duration,
                failed=True,
            )

            iter_results.append({
                'nodeId': nid,
                'depth': depth,
                **impact,
            })

            total_financial += impact['financialImpact']
            total_recovery += impact['recoveryDays']
            impact_scores.append(impact['impactScore'])
            if impact['status'] == 'critical':
                critical_count += 1
            elif impact['status'] == 'warning':
                warning_count += 1

            # Accumulate for per-node stats
            node_impact_sums[nid] += impact['impactScore']
            node_financial_sums[nid] += impact['financialImpact']
            node_recovery_sums[nid] += impact['recoveryDays']
            node_failure_counts[nid] += 1

        n_affected = len(iter_results)
        avg_impact = np.mean(impact_scores) if impact_scores else 0
        total_financial = round(total_financial)
        avg_recovery = round(total_recovery / max(1, n_affected))

        resilience = max(0, round(100 - (avg_impact * 0.7 + (critical_count / max(1, n_affected)) * 30)))

        iteration_affected_counts.append(n_affected)
        iteration_critical_counts.append(critical_count)
        iteration_warning_counts.append(warning_count)
        iteration_financial_impacts.append(total_financial)
        iteration_recovery_days.append(avg_recovery)
        iteration_resilience_scores.append(resilience)

    # ── Aggregate across all iterations ─────────────────────────────
    aff = np.array(iteration_affected_counts)
    crit = np.array(iteration_critical_counts)
    warn = np.array(iteration_warning_counts)
    fin = np.array(iteration_financial_impacts)
    rec = np.array(iteration_recovery_days)
    res = np.array(iteration_resilience_scores)

    # Build affected node list with aggregated stats
    affected_node_list = []
    for nid in graph.nodes:
        if node_failure_counts[nid] == 0:
            continue
        nd = graph.nodes[nid]
        avg_impact = node_impact_sums[nid] / max(1, node_failure_counts[nid])
        avg_financial = round(node_financial_sums[nid] / max(1, node_failure_counts[nid]))
        avg_recovery = round(node_recovery_sums[nid] / max(1, node_failure_counts[nid]))
        failure_rate = node_failure_counts[nid] / n_iterations

        status = 'critical' if avg_impact > 50 else ('warning' if avg_impact > 25 else 'monitor')

        affected_node_list.append({
            'nodeId': nid,
            'nodeName': nid.replace('_t', ''),
            'type': nd.get('type', 'unknown'),
            'depth': 0,
            'impactScore': round(avg_impact),
            'riskBefore': nd.get('risk', 0),
            'riskAfter': min(100, round(nd.get('risk', 0) + avg_impact)),
            'recoveryDays': avg_recovery,
            'financialImpact': avg_financial,
            'failureRate': round(failure_rate * 100),
            'status': status,
        })

    affected_node_list.sort(key=lambda x: x['impactScore'], reverse=True)

    # Count distinct nodes that were affected in at least one iteration
    distinct_affected = len(affected_node_list)
    distinct_critical = sum(1 for n in affected_node_list if n['status'] == 'critical')
    distinct_warning = sum(1 for n in affected_node_list if n['status'] == 'warning')

    return {
        'triggerNode': trigger_node,
        'severity': severity,
        'duration': duration,
        'nIterations': n_iterations,
        'totalAffectedNodes': distinct_affected,
        'criticalCount': distinct_critical,
        'warningCount': distinct_warning,
        'totalFinancialImpact': {
            'p10': round(float(np.percentile(fin, 10))),
            'p50': round(float(np.percentile(fin, 50))),
            'p90': round(float(np.percentile(fin, 90))),
            'mean': round(float(np.mean(fin))),
            'std': round(float(np.std(fin))),
        },
        'averageRecoveryDays': {
            'p10': round(float(np.percentile(rec, 10))),
            'p50': round(float(np.percentile(rec, 50))),
            'p90': round(float(np.percentile(rec, 90))),
            'mean': round(float(np.mean(rec))),
            'std': round(float(np.std(rec))),
        },
        'resilienceScore': int(np.median(res)),
        'resilienceDistribution': {
            'p10': round(float(np.percentile(res, 10))),
            'p50': round(float(np.percentile(res, 50))),
            'p90': round(float(np.percentile(res, 90))),
            'mean': round(float(np.mean(res))),
            'std': round(float(np.std(res))),
        },
        'affectedNodes': affected_node_list[:30],
        'engine': 'python-bayesian-monte-carlo',
        'timestamp': __import__('time').time(),
    }
