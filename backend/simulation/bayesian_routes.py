import re


def route_query(query_lower, ctx_str, results):
    node_types = {}
    node_risks = {}
    for r in results:
        meta = r.get("metadata", {})
        ntype = meta.get("type", meta.get("nodeType", ""))
        if ntype:
            node_types[r.get("id", "")] = ntype
        node_risks[r.get("id", "")] = r.get("score", 0)

    high_risk = [r for r in results if r.get("score", 0) > 30]
    medium_risk = [r for r in results if 15 < r.get("score", 0) <= 30]

    patterns = [
        (r"(critical|high.risk|danger|fail)", _respond_risk),
        (r"(stellar|titanium|ti.?6al)", _respond_ti6al),
        (r"(bridge.buy|ametek|alternate|second.source)", _respond_bridge),
        (r"(cert|as9100|itar|dfars|qualif|nadcap)", _respond_cert),
        (r"(inventory|stock|part|shortage)", _respond_inventory),
        (r"(program|f.?35|artemis|f35)", _respond_program),
        (r"(supplier|vendor|source)", _respond_supplier),
        (r"(port|logistics|ship|freight)", _respond_port),
        (r"(weather|earthquake|flood|hurricane|disrupt)", _respond_disruption),
        (r"(recommend|action|mitigate|fix)", _respond_recommend),
    ]

    for pat, handler in patterns:
        if re.search(pat, query_lower):
            return handler(query_lower, ctx_str, results, high_risk, medium_risk)

    return _respond_general(ctx_str, results, high_risk)


def _respond_risk(query, ctx, results, high_risk, medium_risk):
    total = len(results)
    critical = len(high_risk)
    warning = len(medium_risk)
    top = high_risk[:3]
    if top:
        top_info = "; ".join(f"{r.get('metadata', {}).get('name', r.get('id', ''))} ({r.get('score', 0)}%)" for r in top)
        return {
            "answer": f"Found {total} relevant supply chain nodes ({critical} high-risk, {warning} elevated). Top risks: {top_info}. Overall network resilience score: {max(0, 100 - critical * 5)}%. Recommendation: prioritize mitigation for {top[0].get('metadata', {}).get('name', '')}.",
            "confidence": min(95, 65 + critical * 3),
        }
    top_all = results[:3]
    top_info = "; ".join(f"{r.get('metadata', {}).get('name', r.get('id', ''))} ({r.get('score', 0)}%)" for r in top_all) if top_all else "All nodes stable"
    return {
        "answer": f"Supply chain risk analysis for '{query}': {total} relevant nodes found. Current risk posture: {critical} high-risk, {warning} elevated. Top matches: {top_info}. Network resilience: 78/100. Use 'suppliers', 'programs', or 'certifications' for targeted queries.",
        "confidence": 80,
    }


def _respond_ti6al(query, ctx, results, high_risk, medium_risk):
    return {
        "answer": "StellarMet (Ti-6Al-4V primary supplier): Risk score 68/100. Credit score 38/100 (High Risk). Baoji smelter output reduced 23%. F-35 Titanium Casting qualification closes in 12 days. Recommended: execute AMETEK bridge buy within 48h — $2.1M premium vs $47M CDRL penalty. Alternative: QualiMet (PMA parts, 82/100 credit, FAA certified).",
        "confidence": 94,
    }


def _respond_bridge(query, ctx, results, high_risk, medium_risk):
    return {
        "answer": "AMETEK bridge buy recommended for Ti-6Al-4V Casting: $2.1M premium vs $47M CDRL penalty exposure. AMETEK credit score: 82/100 (Low Risk), AS9100D certified. Delivery: 14 days. Qualification: F-35 Titanium Casting — Engineering eval in progress, 2 of 4 test articles passed. DMSMS case #2024-083-A opened with AFLCMC.",
        "confidence": 91,
    }


def _respond_cert(query, ctx, results, high_risk, medium_risk):
    certs = [r for r in results if "cert" in str(r.get("content", "")).lower()]
    info = "; ".join(f"{r.get('metadata', {}).get('name', r.get('id', ''))}: {r.get('content', '')[:120]}" for r in certs[:5]) if certs else "No cert-related nodes found."
    return {
        "answer": f"Certification status: {info}. CeramicTech Nadcap NDT certification expires in 14 days. Status: REAPPLICATION IN PROCESS (45-day lag). Risk: disruption to NDT capacity for F-35, Artemis engine components. Tracked across 3 programs.",
        "confidence": 88,
    }


def _respond_inventory(query, ctx, results, high_risk, medium_risk):
    return {
        "answer": "Inventory status: Titanium Casting — STOCKOUT (0 units). Valve Group — CRITICAL (4 units remaining, 7-day burn rate). Engine Subsystem — NORMAL (78 units). Fastener Kit — ADEQUATE (340 units). Risk: Ti-6Al-4V stockout will F-35 Line 3 within 19 days at current production rate.",
        "confidence": 90,
    }


def _respond_program(query, ctx, results, high_risk, medium_risk):
    return {
        "answer": "Program exposure analysis: F-35 ($67B portfolio) — 4 direct supplier risks (StellarMet, Aerocast, CeramicTech, NanoSense). Artemis ($93B portfolio) — 2 direct risks (FluidLogic, QualiMet). Orion — 1 direct risk (QualiMet PMA). Portfolio weighted risk score: 62/100. Recommended: diversify Titanium Casting for F-35, requalify PMA for Artemis.",
        "confidence": 91,
    }


def _respond_supplier(query, ctx, results, high_risk, medium_risk):
    total = len(results)
    suppliers = [r for r in results if r.get("metadata", {}).get("type") == "supplier"]
    info = "; ".join(f"{r.get('metadata', {}).get('name', r.get('id', ''))} ({r.get('score', 0)}%)" for r in suppliers[:8]) if suppliers else "See all"
    return {
        "answer": f"{total} supply chain nodes tracked. {len(suppliers)} suppliers of interest: {info}. Network summary: 28 nodes, 24 edges, 3 programs, 4 single points of failure. Overall resilience: 78/100.",
        "confidence": 87,
    }


def _respond_port(query, ctx, results, high_risk, medium_risk):
    return {
        "answer": "Port/Landscape analysis: Port of Long Beach — 14% of defense air cargo through LA/LB. Current dwell: 4.2 days (baseline: 3.1 days, +35%). Risk: Ti-6Al-4V Casting from Baoji routed through LA/LB. Mitigation: air freight option available ($0.42M premium, 3-day vs 21-day). Port of Savannah — backup routing available for alternate suppliers.",
        "confidence": 86,
    }


def _respond_disruption(query, ctx, results, high_risk, medium_risk):
    return {
        "answer": "Active disruption monitoring: Ti-6Al-4V supply shortage (83 days early warning, actual impact: 76 days). Port of Long Beach congestion (predicted: 22 days, actual: 28 days). CeramicTech Nadcap gap (predicted: 14 days, actual: 12 days). Model accuracy on historical disruptions: 93%. Current network resilience: 78/100.",
        "confidence": 92,
    }


def _respond_recommend(query, ctx, results, high_risk, medium_risk):
    critical = len(high_risk)
    return {
        "answer": f"Recommended actions based on current risk posture ({critical} high-risk items): 1) Execute AMETEK bridge buy for Ti-6Al-4V ($2.1M premium, 48h window). 2) Accelerate F-35 Titanium Casting requalification (12 days remaining). 3) CeramicTech Nadcap — engage backup NDT provider (Gulf Coast NDT, 7-day lead). 4) NanoSense quality audit — schedule within 30 days. 5) FluidLogic alternate pump qualification — initiate DMSMS case.",
        "confidence": 93,
    }


def _respond_general(ctx, results, high_risk):
    total = len(results)
    critical = len(high_risk)
    top = results[:3]
    top_info = "; ".join(f"{r.get('metadata', {}).get('name', r.get('id', ''))} ({r.get('score', 0)}%)" for r in top) if top else ""
    return {
        "answer": f"Morningstar supply chain intelligence: {total} relevant nodes analyzed, {critical} high-risk. Relevant items: {top_info}. I can answer about suppliers, programs, certifications, inventory, risks, logistics, disruptions, and recommendations. Current network: 28 nodes, 24 edges, 78/100 resilience." if top else "Morningstar supply chain intelligence active: 28 nodes, 24 edges, 4 programs, 78/100 resilience. Ask about suppliers, programs, certifications, inventory, risks, logistics, or recommendations.",
        "confidence": 70,
    }