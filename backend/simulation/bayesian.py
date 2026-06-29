"""
Bayesian Structural Risk Models for Supply Chain Nodes.
Computes P(failure) for each node type using multi-factor Bayesian inference.
No PyMC dependency — uses NumPy logistic regression + Monte Carlo sampling.
"""

import numpy as np
from typing import Optional


def _sigmoid(x):
    return 1.0 / (1.0 + np.exp(-np.clip(x, -20, 20)))


def _logit(p):
    return np.log(np.clip(p, 1e-10, 1 - 1e-10) / np.clip(1 - p, 1e-10, 1 - 1e-10))


# ── Prior factor weights per node type ────────────────────────────────────
# These act as Bayesian priors — they will be updated as historical
# back-testing accumulates more data points.
FACTOR_PRIORS = {
    'supplier': {
        'credit_score': {'weight': 0.30, 'scale': -0.035, 'intercept': 1.5},
        'geo_exposure':  {'weight': 0.25, 'scale': 2.0,   'intercept': -1.0},
        'single_point':  {'weight': 0.20, 'scale': 1.5,   'intercept': -0.5},
        'oee_deficit':   {'weight': 0.15, 'scale': 2.5,   'intercept': -1.0},
        'port_risk':     {'weight': 0.10, 'scale': 1.8,   'intercept': -0.8},
    },
    'port': {
        'congestion': {'weight': 0.50, 'scale': 2.0, 'intercept': -1.0},
        'geo_risk':   {'weight': 0.30, 'scale': 1.5, 'intercept': -0.5},
        'volume':     {'weight': 0.20, 'scale': 0.5, 'intercept': -1.0},
    },
    'component': {
        'sole_source':  {'weight': 0.40, 'scale': 2.0, 'intercept': -0.5},
        'lead_time':    {'weight': 0.30, 'scale': 0.1, 'intercept': -1.0},
        'complexity':   {'weight': 0.30, 'scale': 1.5, 'intercept': -0.8},
    },
    'assembly': {
        'criticality':  {'weight': 0.40, 'scale': 1.5, 'intercept': -0.5},
        'supplier_dep': {'weight': 0.35, 'scale': 2.0, 'intercept': -1.0},
        'complexity':   {'weight': 0.25, 'scale': 1.0, 'intercept': -0.3},
    },
    'program': {
        'budget_overrun': {'weight': 0.40, 'scale': 1.0, 'intercept': -1.5},
        'schedule_slip':  {'weight': 0.35, 'scale': 1.5, 'intercept': -1.0},
        'supplier_risk':  {'weight': 0.25, 'scale': 2.0, 'intercept': -0.5},
    },
}

DEFAULT_PRIOR = {
    'base': {'weight': 1.0, 'scale': 0.5, 'intercept': -1.0},
}


def _extract_factors(node_data: dict, node_type: str) -> dict:
    """Extract numerical factor values from node data dictionary."""
    attrs = node_data.get('attributes', node_data)
    flags = attrs.get('riskFlags', [])

    factors = {}

    if node_type == 'supplier':
        cs = attrs.get('creditScore', 50)
        factors['credit_score'] = max(0, min(100, cs))
        factors['geo_exposure'] = 1.0 if any('geopolitical' in (f or '') for f in flags) else 0.3
        factors['single_point'] = 1.0 if any('single-point' in (f or '') or 'sole source' in (f or '') for f in flags) else 0.2
        factors['oee_deficit'] = 0.0
        factors['port_risk'] = 0.3

    elif node_type == 'port':
        factors['congestion'] = attrs.get('congestion_index', 0.3)
        factors['geo_risk'] = 0.5 if any('geopolitical' in (f or '') for f in flags) else 0.2
        factors['volume'] = attrs.get('volume', 0.5)

    elif node_type == 'component':
        factors['sole_source'] = 1.0 if any('sole source' in (f or '') or 'single-point' in (f or '') for f in flags) else 0.0
        factors['lead_time'] = attrs.get('leadTime', 14)
        factors['complexity'] = 0.7 if attrs.get('requiredCertifications') else 0.3

    elif node_type == 'assembly':
        factors['criticality'] = 0.7
        factors['supplier_dep'] = len(attrs.get('supplierDeps', [])) / 5
        factors['complexity'] = 0.5

    elif node_type == 'program':
        factors['budget_overrun'] = attrs.get('budgetOverrun', 0.0)
        factors['schedule_slip'] = attrs.get('scheduleSlip', 0.0)
        factors['supplier_risk'] = attrs.get('risk', 50) / 100.0

    return factors


def compute_failure_probability(
    node_data: dict,
    node_type: str = 'supplier',
    n_samples: int = 10000,
) -> tuple[float, float, float, float, float, np.ndarray]:
    """
    Compute P(failure) using Bayesian logistic model with Monte Carlo sampling.

    Returns:
        (p10, p50, p90, mean, std, samples)
    """
    factors = _extract_factors(node_data, node_type)
    priors = FACTOR_PRIORS.get(node_type, DEFAULT_PRIOR)

    samples = np.ones(n_samples) * _logit(0.3)  # base log-odds

    for factor_name, factor_value in factors.items():
        if factor_name in priors:
            p = priors[factor_name]
            # Sample from prior distribution with noise
            weight_noise = np.random.normal(p['weight'], p['weight'] * 0.15, n_samples)
            contribution = weight_noise * p['scale'] * factor_value + p['intercept']
            samples += contribution

    probabilities = _sigmoid(samples)
    p10 = float(np.percentile(probabilities, 10))
    p50 = float(np.percentile(probabilities, 50))
    p90 = float(np.percentile(probabilities, 90))
    mean = float(np.mean(probabilities))
    std = float(np.std(probabilities))

    return p10, p50, p90, mean, std, probabilities


def compute_node_risk_profile(
    node_data: dict,
    node_type: str = 'supplier',
    n_samples: int = 10000,
) -> dict:
    """
    Full risk profile for a single node including factor contribution breakdown.
    """
    _, p50, _, _, _, samples = compute_failure_probability(node_data, node_type, n_samples)
    factors = _extract_factors(node_data, node_type)
    priors = FACTOR_PRIORS.get(node_type, DEFAULT_PRIOR)

    contrib = {}
    for factor_name, factor_value in factors.items():
        if factor_name in priors:
            p = priors[factor_name]
            contrib[factor_name] = round(p['weight'] * p['scale'] * factor_value, 4)

    total = sum(contrib.values()) or 1
    contrib_pct = {k: round(v / total * 100, 1) for k, v in contrib.items()}

    flags = node_data.get('attributes', node_data).get('riskFlags', [])
    recommended = []
    if p50 > 0.5:
        recommended.append('Initiate bridge buy alternative sourcing')
    if any('single-point' in (f or '') for f in flags):
        recommended.append('Qualify alternate supplier — single-point failure risk')
    if any('geopolitical' in (f or '') for f in flags):
        recommended.append('Evaluate nearshoring options for geopolitical exposure')
    if factors.get('credit_score', 100) < 50:
        recommended.append('Request D&B credit review — score below threshold')
    if not recommended:
        recommended.append('Continue monitoring — within acceptable risk band')

    return {
        'failureProbability': {'p10': _, 'p50': p50, 'p90': _, 'mean': _, 'std': _},
        'factorContributions': contrib_pct,
        'rawFactors': factors,
        'recommendedActions': recommended,
    }


def compute_network_risk_profile(
    nodes: list[dict],
    n_samples: int = 5000,
) -> list[dict]:
    """
    Compute risk profiles for an entire network of nodes.
    """
    profiles = []
    for node in nodes:
        nid = node.get('id', node.get('nodeId', 'unknown'))
        ntype = node.get('type', 'supplier')
        profile = compute_node_risk_profile(node, ntype, n_samples)
        profiles.append({
            'nodeId': nid,
            'nodeType': ntype,
            **profile,
        })
    return profiles
