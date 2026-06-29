"""Pydantic models for the Morningstar Causal Risk Engine."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NodeData(BaseModel):
    id: str
    type: str = "unknown"
    risk: float = 0.0
    creditScore: Optional[float] = None
    revenue: Optional[float] = None
    qty: Optional[int] = None
    reorder: Optional[int] = None
    riskFlags: list[str] = []


class EdgeData(BaseModel):
    source: str
    target: str
    type: str = "depends_on"
    leadTime: float = 0.0


class GraphData(BaseModel):
    nodes: list[NodeData] = []
    edges: list[EdgeData] = []


class SimulationRequest(BaseModel):
    triggerNodeId: str = "StellarMet_t"
    severity: float = 0.8
    duration: int = 30
    nIterations: int = 10000


class RiskProfileRequest(BaseModel):
    nodeId: str
    nodeType: str = "supplier"
    nSamples: int = 10000


class BacktestRequest(BaseModel):
    triggerNodeId: str
    severity: float
    duration: int
    actualImpact: dict


class AffectedNode(BaseModel):
    nodeId: str
    nodeName: str
    type: str
    depth: int
    impactScore: float
    riskBefore: float
    riskAfter: float
    recoveryDays: int
    financialImpact: float
    status: str = "monitor"


class Distribution(BaseModel):
    p10: float
    p50: float
    p90: float
    mean: float
    std: float


class SimulationResult(BaseModel):
    triggerNode: str
    severity: float
    duration: int
    nIterations: int
    totalAffectedNodes: int
    criticalCount: int
    warningCount: int
    totalFinancialImpact: Distribution
    averageRecoveryDays: Distribution
    resilienceScore: float
    resilienceDistribution: Distribution
    affectedNodes: list[AffectedNode]
    engine: str = "python-bayesian-monte-carlo"
    timestamp: float


class RiskProfile(BaseModel):
    nodeId: str
    nodeType: str
    failureProbability: Distribution
    primaryFactors: list[dict]
    factorContribution: dict[str, float]
    recommendedActions: list[str]


class BacktestResult(BaseModel):
    eventId: str
    predictedImpact: dict
    actualImpact: dict
    accuracyBreakdown: list[dict]
    aggregateAccuracy: float
