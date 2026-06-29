(function(){
              ' use strict';
    // ===== DATA =====    const NODE_COLORS = {
                  program: ' #00B8D9',        assembly: ' #48BB78',        component: ' #ED8936',        supplier: ' #9F7AEA',        port: ' #4299E1',        facility: ' #A0AEC0',        warehouse: ' #F6E05E',        region: ' #F687B3'    
        };
    const LINK_COLORS = {
                  manufactures: ' #00B8D9',        supplies: ' #48BB78',        depends_on: ' #ED8936',        ships_to: ' #4299E1',        located_in: ' #A0AEC0'    
        };
    const NODE_SIZES = {
           program: 14, assembly: 11, component: 8, supplier: 8, port: 8, facility: 8, warehouse: 8, region: 8 
        };
    const TIER_COLORS = [' #00B8D9', ' #00D4E6', ' #48BB78', ' #ED8936', ' #E53E3E', ' #A0AEC0'];
    const TIER_NAMES = [' Program', ' Tier 1', ' Tier 2', ' Tier 3', ' Tier 4+', ' Unknown'];
    const nodes = [        {
           id: ' Artemis Program_t', type: ' program', revenue: 500000 
        },        {
           id: ' Orion Capsule_t', type: ' program', revenue: 320000 
        },        {
           id: ' Engine Subsystem_t', type: ' assembly' 
        },        {
           id: ' Fuel Tank_t', type: ' assembly' 
        },        {
           id: ' Heat Shield_t', type: ' assembly' 
        },        {
           id: ' Avionics Bay_t', type: ' assembly' 
        },        {
           id: ' Titanium Casting_t', type: ' component', qty: 120, reorder: 200, requiredCertifications: [' as9100', ' itar', ' dfars'] 
        },        {
           id: ' Valve Group_t', type: ' component', qty: 450, reorder: 100, requiredCertifications: [' as9100', ' itar', ' dfars', ' iso9001'] 
        },        {
           id: ' Ceramic Tiles_t', type: ' component', qty: 80, reorder: 150, requiredCertifications: [' itar', ' dfars'] 
        },        {
           id: ' Wiring Harness_t', type: ' component', qty: 600, reorder: 200, requiredCertifications: [' as9100', ' itar'] 
        },        {
           id: ' Carbon Fiber Panel_t', type: ' component', qty: 30, reorder: 100, requiredCertifications: [' as9100', ' dfars'] 
        },        {
           id: ' Sensor Array_t', type: ' component', qty: 200, reorder: 150, requiredCertifications: [' as9100', ' itar', ' cmmc'] 
        },        {
           id: ' Aerocast Inc_t', type: ' supplier', risk: 85, email: ' procurement@aerocast.com', certifications: {
           as9100: true, itar: true, dfars: true, cmmc: false, iso9001: false, nadcap: false, expiryDates: {
           as9100: ' 2026-09-15' 
        } 
        }, profile: {
           badges: [' DFARS Ready', ' ITAR Compliant'], creditScore: 62, creditLabel: ' Payment Risk: High', lastAudit: ' 2024-08-20', lastAuditResult: ' Passed', nextAuditDue: ' 2025-02-20', riskFlags: [' No alternate source', ' Single-point failure', ' Geopolitical exposure: Asia-Pacific'], preVetted: false 
        } 
        },        {
           id: ' FluidLogic_t', type: ' supplier', risk: 15, email: ' orders@fluidlogic.com', certifications: {
           as9100: true, itar: true, dfars: true, cmmc: true, cmmcLevel: 2, iso9001: true, nadcap: false, expiryDates: {
           as9100: ' 2027-12-20' 
        } 
        }, profile: {
           badges: [' DFARS Ready', ' ITAR Compliant', ' CMMC Level 2', ' ISO 9001', ' AS9100'], creditScore: 91, creditLabel: ' Low Risk', lastAudit: ' 2024-11-15', lastAuditResult: ' Passed', nextAuditDue: ' 2025-05-15', riskFlags: [], preVetted: true 
        } 
        },        {
           id: ' CeramicTech_t', type: ' supplier', risk: 50, email: ' info@ceramictech.com', certifications: {
           as9100: false, itar: false, dfars: false, cmmc: false, iso9001: true, nadcap: false, expiryDates: {
           iso9001: ' 2026-07-15' 
        } 
        }, profile: {
           badges: [' ISO 9001'], creditScore: 74, creditLabel: ' Payment Risk: Moderate', lastAudit: ' 2024-06-10', lastAuditResult: ' Passed', nextAuditDue: ' 2024-12-10', riskFlags: [' Raw material shortage risk'], preVetted: false 
        } 
        },        {
           id: ' WiredIn Solutions_t', type: ' supplier', subcontractor: true, risk: 25, email: ' supply@wiredin.com', certifications: {
           as9100: true, itar: true, dfars: false, cmmc: true, cmmcLevel: 1, iso9001: false, nadcap: false, expiryDates: {
           itar: ' 2026-12-15' 
        } 
        }, profile: {
           badges: [' AS9100', ' CMMC Level 2'], creditScore: 88, creditLabel: ' Low Risk', lastAudit: ' 2024-09-22', lastAuditResult: ' Passed', nextAuditDue: ' 2025-03-22', riskFlags: [], preVetted: true 
        } 
        },        {
           id: ' NanoSense Inc_t', type: ' supplier', risk: 40, email: ' contact@nanosense.com', certifications: {
           as9100: false, itar: false, dfars: false, cmmc: false, iso9001: false, nadcap: false, expiryDates: {
          
        } 
        }, profile: {
           badges: [], creditScore: 55, creditLabel: ' Payment Risk: Elevated', lastAudit: ' 2024-04-05', lastAuditResult: ' Failed — Remediation in progress', nextAuditDue: ' 2024-10-05', riskFlags: [' Single-point failure', ' Geopolitical exposure: Asia-Pacific'], preVetted: false 
        } 
        },        {
           id: ' Port of Long Beach_t', type: ' port', risk: 10 
        },        {
           id: ' Port of Rotterdam_t', type: ' port', risk: 8 
        },        {
           id: ' Dayton Facility_t', type: ' facility' 
        },        {
           id: ' Houston Assembly Plant_t', type: ' facility' 
        },        {
           id: ' Singapore Buffer Stock_t', type: ' warehouse', warehouse: ' Singapore', qty: 500, reorder: 200, weeklyDemand: 80 
        },        {
           id: ' Asia-Pacific_t', type: ' region', risk: 20 
        }    ];
    const links = [        {
           source: ' Aerocast Inc_t', target: ' Titanium Casting_t', type: ' manufactures', leadTime: 7 
        },        {
           source: ' FluidLogic_t', target: ' Valve Group_t', type: ' manufactures', leadTime: 3 
        },        {
           source: ' CeramicTech_t', target: ' Ceramic Tiles_t', type: ' manufactures', leadTime: 5 
        },        {
           source: ' WiredIn Solutions_t', target: ' Wiring Harness_t', type: ' manufactures', leadTime: 2 
        },        {
           source: ' NanoSense Inc_t', target: ' Sensor Array_t', type: ' manufactures', leadTime: 4 
        },        {
           source: ' Titanium Casting_t', target: ' Engine Subsystem_t', type: ' supplies', leadTime: 2 
        },        {
           source: ' Valve Group_t', target: ' Engine Subsystem_t', type: ' supplies', leadTime: 1 
        },        {
           source: ' Ceramic Tiles_t', target: ' Heat Shield_t', type: ' supplies', leadTime: 3 
        },        {
           source: ' Wiring Harness_t', target: ' Avionics Bay_t', type: ' supplies', leadTime: 1 
        },        {
           source: ' Carbon Fiber Panel_t', target: ' Heat Shield_t', type: ' supplies', leadTime: 2 
        },        {
           source: ' Sensor Array_t', target: ' Avionics Bay_t', type: ' supplies', leadTime: 2 
        },        {
           source: ' Engine Subsystem_t', target: ' Artemis Program_t', type: ' depends_on', leadTime: 1 
        },        {
           source: ' Fuel Tank_t', target: ' Artemis Program_t', type: ' depends_on', leadTime: 1 
        },        {
           source: ' Heat Shield_t', target: ' Orion Capsule_t', type: ' depends_on', leadTime: 1 
        },        {
           source: ' Avionics Bay_t', target: ' Orion Capsule_t', type: ' depends_on', leadTime: 1 
        },        {
           source: ' Engine Subsystem_t', target: ' Orion Capsule_t', type: ' depends_on', leadTime: 1 
        },        {
           source: ' Fuel Tank_t', target: ' Orion Capsule_t', type: ' depends_on', leadTime: 1 
        },        {
           source: ' Heat Shield_t', target: ' Artemis Program_t', type: ' depends_on', leadTime: 1 
        },        {
           source: ' Avionics Bay_t', target: ' Artemis Program_t', type: ' depends_on', leadTime: 1 
        },        {
           source: ' Port of Long Beach_t', target: ' Aerocast Inc_t', type: ' ships_to', leadTime: 10 
        },        {
           source: ' Port of Rotterdam_t', target: ' FluidLogic_t', type: ' ships_to', leadTime: 14 
        },        {
           source: ' Port of Long Beach_t', target: ' WiredIn Solutions_t', type: ' ships_to', leadTime: 8 
        },        {
           source: ' Dayton Facility_t', target: ' Asia-Pacific_t', type: ' located_in', leadTime: 1 
        },        {
           source: ' Houston Assembly Plant_t', target: ' Asia-Pacific_t', type: ' located_in', leadTime: 1 
        },        {
           source: ' Singapore Buffer Stock_t', target: ' Engine Subsystem_t', type: ' ships_to', leadTime: 5 
        },        {
           source: ' Singapore Buffer Stock_t', target: ' Avionics Bay_t', type: ' ships_to', leadTime: 5 
        }    ];
    // Build lookup    const nodeMap = {
          
        };
    window.nodeMap = nodeMap;
 // Expose for inline onclick    nodes.forEach(function(n) {
           nodeMap[n.id] = n;
 
        });
    const resolvedLinks = links.map(function(l) {
                  return {
                      source: nodeMap[l.source],            target: nodeMap[l.target],            type: l.type,            leadTime: l.leadTime        
        };
    
        });
    // ===== STATE =====    var selectedNode = null;
    var simAffected = new Set();
    var simLinksSet = new Set();
    var labelsVisible = true;
    var currentZoom = null;
    var prevResilienceScore = null;
    var destructionClickCount = 0;
    var destructionTimer = null;
    var isDestroying = false;
    var is3D = false;
    var floorGridGroup = null;
    var shadowGroup = null;
    var boostedRisks = {
          
        };
    var originalPositions = {
          
        };
    var dominoRecoveryTimer = null;
    var tickerInterval = null;
    var currentTickerItems = [];
    var timeMachineOffset = 0;
    var tierMode = false;
    var heatmapMode = false;
    var tierDepth = {
          
        };
    var heatmapGroup = null;
    var certificationMode = false;
    var whatIfOverrides = {
          
        };
    var certHealthCollapsed = false;
    var layerView = ' executive';
    // ===== RISK HISTORY (Time Machine) =====    var supplierRiskHistory = {
                  ' Aerocast Inc_t': [60,62,65,68,72,75,78,80,82,83,84,85],        ' FluidLogic_t': [12,11,10,10,11,12,13,14,14,15,15,15],        ' CeramicTech_t': [45,46,47,48,48,49,50,50,50,50,50,50],        ' WiredIn Solutions_t': [20,21,22,23,24,24,25,25,25,25,25,25],        ' NanoSense Inc_t': [30,32,35,38,42,48,55,60,65,55,45,40]    
        };
    // ===== GEO COORDINATES =====    var supplierGeoCoords = {
                  ' Aerocast Inc_t': {
           lat: 33.78, lng: -118.24, city: ' Long Beach' 
        },        ' FluidLogic_t': {
           lat: 51.92, lng: 4.47, city: ' Rotterdam' 
        },        ' CeramicTech_t': {
           lat: 35.68, lng: 139.76, city: ' Tokyo' 
        },        ' WiredIn Solutions_t': {
           lat: 29.76, lng: -95.37, city: ' Houston' 
        },        ' NanoSense Inc_t': {
           lat: 1.35, lng: 103.82, city: ' Singapore' 
        },        ' Port of Long Beach_t': {
           lat: 33.75, lng: -118.21, city: ' Long Beach' 
        },        ' Port of Rotterdam_t': {
           lat: 51.90, lng: 4.50, city: ' Rotterdam' 
        },        ' Dayton Facility_t': {
           lat: 39.76, lng: -84.19, city: ' Dayton' 
        },        ' Houston Assembly Plant_t': {
           lat: 29.76, lng: -95.37, city: ' Houston' 
        },        ' Singapore Buffer Stock_t': {
           lat: 1.35, lng: 103.82, city: ' Singapore' 
        }    
        };
    // ===== WATCHLIST =====    var watchlist = JSON.parse(localStorage.getItem(' aksci_watchlist') || '[]');
    // ===== DOM REFS =====    var container = document.getElementById('graph-panel');
    var svg = d3.select(' #graph-svg');
    var minimapSvg = d3.select(' #minimap-svg');
    var tooltip = document.getElementById('graph-tooltip');
    var flashOverlay = document.getElementById('sim-flash');
    // ===== DIMENSIONS =====    function getDimensions() {
                  var rect = container.getBoundingClientRect();
        return {
           w: rect.width, h: rect.height 
        };
    
        }    // ===== PARTICLE SYSTEM =====    var particles = [];
    var particleCanvas, particleCtx;
    var particleAnimId = null;
    function initParticles() {
                  particleCanvas = document.getElementById('particle-canvas');
        particleCtx = particleCanvas.getContext('2d');
        resizeParticleCanvas();
        particles = [];
        for (var i = 0;
 i < 60;
 i++) {
                      particles.push({
                          x: Math.random() * particleCanvas.width,                y: Math.random() * particleCanvas.height,                r: 0.5 + Math.random() * 2,                vx: (Math.random() - 0.5) * 0.15,                vy: (Math.random() - 0.5) * 0.15,                a: 0.08 + Math.random() * 0.2            
        });
        
        }        if (particleAnimId) cancelAnimationFrame(particleAnimId);
        animateParticles();
    
        }    function resizeParticleCanvas() {
                  var rect = container.getBoundingClientRect();
        particleCanvas.width = rect.width;
        particleCanvas.height = rect.height;
    
        }    function animateParticles() {
                  if (!particleCtx) return;
        particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
        particles.forEach(function(p) {
                      p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = particleCanvas.width;
            if (p.x > particleCanvas.width) p.x = 0;
            if (p.y < 0) p.y = particleCanvas.height;
            if (p.y > particleCanvas.height) p.y = 0;
            particleCtx.beginPath();
            particleCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            particleCtx.fillStyle = ' rgba(255, 255, 255, ' + p.a + ')';
            particleCtx.fill();
        
        });
        particleAnimId = requestAnimationFrame(animateParticles);
    
        }    // ===== MARKERS =====    function setupMarkers(defs) {
                  Object.keys(LINK_COLORS).forEach(function(type) {
                      defs.append(' marker')                .attr('id', 'arrow-sm-' + type)                .attr('viewBox', ' 0 -5 10 10')                .attr('refX', 8)                .attr('markerWidth', 6)                .attr('markerHeight', 6)                .attr('orient', 'auto')                .append(' path')                .attr('d', ' M0, -4L8, 0L0, 4')                .attr('fill', LINK_COLORS[type])                .attr('opacity', 0.5);
            defs.append(' marker')                .attr('id', 'arrow-md-' + type)                .attr('viewBox', ' 0 -5 10 10')                .attr('refX', 10)                .attr('markerWidth', 8)                .attr('markerHeight', 8)                .attr('orient', 'auto')                .append(' path')                .attr('d', ' M0, -5L10, 0L0, 5')                .attr('fill', LINK_COLORS[type]);
            defs.append(' marker')                .attr('id', 'arrow-lg-' + type)                .attr('viewBox', ' 0 -5 10 10')                .attr('refX', 12)                .attr('markerWidth', 10)                .attr('markerHeight', 10)                .attr('orient', 'auto')                .append(' path')                .attr('d', ' M0, -6L12, 0L0, 6')                .attr('fill', LINK_COLORS[type]);
        
        });
    
        }    // ===== BUILD GRAPH =====    var zoomG, linkG, nodeG, labelG, simulation, link, node, label;
    var NODE_DEPTH = {
           program: 5, assembly: 4, component: 3, supplier: 2, port: 1, facility: 2, warehouse: 3, region: 0 
        };
    function buildGraph() {
                  var dim = getDimensions();
        svg.selectAll(' *').remove();
        minimapSvg.selectAll(' *').remove();
        var defs = svg.append(' defs');
        setupMarkers(defs);
        var filter = defs.append(' filter').attr('id', 'glow-red');
        filter.append(' feGaussianBlur').attr('stdDeviation', ' 3').attr('result', ' blur');
        var merge = filter.append(' feMerge');
        merge.append(' feMergeNode').attr('in', ' blur');
        merge.append(' feMergeNode').attr('in', ' SourceGraphic');
        zoomG = svg.append(' g').attr('class', ' zoom-g');
        linkG = zoomG.append(' g').attr('class', ' links');
        nodeG = zoomG.append(' g').attr('class', ' nodes');
        labelG = zoomG.append(' g').attr('class', ' labels');
        // Simulation        simulation = d3.forceSimulation(nodes)            .force(' link', d3.forceLink(resolvedLinks).id(function(d) {
           return d.id;
 
        }).distance(110))            .force(' charge', d3.forceManyBody().strength(-350))            .force(' center', d3.forceCenter(dim.w / 2, dim.h / 2))            .force(' collision', d3.forceCollide(32))            .force(' x', d3.forceX(dim.w / 2).strength(0.02))            .force(' y', d3.forceY(dim.h / 2).strength(0.02));
        // Gentle brownian motion        setInterval(function() {
           simulation.alpha(0.05).restart();
 
        }, 5000);
        // Store original node positions for domino physics        // (call storeOriginalPositions before each domino burst)        // Links        link = linkG.selectAll(' line')            .data(resolvedLinks)            .join(' line')            .attr('class', ' link-base')            .attr('stroke', function(d) {
           return LINK_COLORS[d.type] || ' #666';
 
        })            .attr('stroke-opacity', 0.35)            .attr('stroke-width', 1.5)            .attr('marker-end', function(d) {
                          var size = getMarkerSize(d.target.type);
                return ' url(#arrow-' + size + '-' + d.type + ')';
            
        })            .attr('opacity', 0)            .on(' mouseenter', function(event, d) {
                          if (!certificationMode || d.type !== ' manufactures') return;
                var srcId = typeof d.source === ' object' ? d.source.id : d.source;
                var tgtId = typeof d.target === ' object' ? d.target.id : d.target;
                var certHtml = getCertLinkTooltipHtml(srcId, tgtId);
                if (!certHtml) return;
                tooltip.innerHTML = certHtml;
                tooltip.classList.remove('visible');
                void tooltip.offsetWidth;
                tooltip.classList.add('visible');
                tooltip.style.pointerEvents = 'none';
                positionTooltip(event);
            
        })            .on(' mousemove', function(event) {
                          if (tooltip.classList.contains('visible')) positionTooltip(event);
            
        })            .on(' mouseleave', function() {
                          hideTooltip();
            
        });
        // Nodes        node = nodeG.selectAll(' circle')            .data(nodes)            .join(' circle')            .attr('class', ' node-base')            .attr('r', function(d) {
           return NODE_SIZES[d.type] || 8;
 
        })            .attr('fill', function(d) {
           return NODE_COLORS[d.type] || ' #666';
 
        })            .attr('stroke', ' rgba(255, 255, 255, 0.1)')            .attr('stroke-width', 1)            .attr('opacity', 0)            .attr('transform', ' scale(0)')            .on(' click', function(event, d) {
                          event.stopPropagation();
                selectNode(d);
                playNodeClick();
            
        })            .on(' mouseenter', function(event, d) {
                          focusLock(d);
                showTooltip(event, d);
            
        })            .on(' mousemove', function(event) {
                          moveTooltip(event);
            
        })            .on(' mouseleave', function() {
                          releaseFocusLock();
                setTimeout(function() {
           if (!tooltip._stayOpen) hideTooltip();
 
        }, 300);
            
        });
        // Labels        label = labelG.selectAll(' text')            .data(nodes)            .join(' text')            .attr('class', ' label-base')            .attr('text-anchor', ' middle')            .attr('dy', function(d) {
           return (NODE_SIZES[d.type] || 8) + 14;
 
        })            .text(function(d) {
           return d.id.replace(' _t', ' ');
 
        })            .attr('opacity', 0);
        // === ANIMATED LOAD: staggered burst ===        // Links draw in first        link.transition()            .delay(function(_, i) {
           return i * 20;
 
        })            .duration(350)            .attr('opacity', 1);
        // Nodes pop in with scale bounce        node.transition()            .delay(function(_, i) {
           return i * 25 + 300;
 
        })            .duration(400)            .attr('opacity', 1)            .attrTween(' transform', function() {
                          var that = d3.select(this);
                return function(t) {
                              var s = t < 0.6 ? 1.3 * t * t : -0.5 * ((t - 0.6) / 0.4 - 2) * ((t - 0.6) / 0.4 - 2) + 1;
                    return ' scale(' + s + ')';
                
        };
            
        })            .on(' end', function() {
           d3.select(this).attr('transform', null);
 
        });
        // Labels fade in        label.transition()            .delay(function(_, i) {
           return i * 25 + 500;
 
        })            .duration(300)            .attr('opacity', labelsVisible ? 0.7 : 0);
        // Zoom        var zoom = d3.zoom()            .scaleExtent([0.08, 6])            .on(' zoom', function(event) {
                          zoomG.attr('transform', event.transform);
                currentZoom = event.transform;
                updateMinimap();
            
        });
        svg.call(zoom);
        svg.on(' click', function() {
                      deselectNode();
        
        });
        // Tick        simulation.on(' tick', function() {
                      link                .attr('x1', function(d) {
           return d.source.x;
 
        })                .attr('y1', function(d) {
           return d.source.y;
 
        })                .attr('x2', function(d) {
           return d.target.x;
 
        })                .attr('y2', function(d) {
           return d.target.y;
 
        });
            node                .attr('cx', function(d) {
           return d.x;
 
        })                .attr('cy', function(d) {
           return d.y;
 
        });
            label                .attr('x', function(d) {
           return d.x;
 
        })                .attr('y', function(d) {
           return d.y;
 
        });
            // Update pulse ring position            var ring = d3.select(' .pulse-ring');
            if (!ring.empty() && selectedNode) {
                          ring.attr('cx', selectedNode.x).attr('cy', selectedNode.y);
            
        }            updateMinimap();
            // Update 3D shadows if active            if (is3D) updateShadows();
            // Update heatmap if active            if (heatmapMode) updateHeatmap();
        
        });
        // Store refs        window.__sim = simulation;
        window.__zoom = zoom;
        window.__zoomG = zoomG;
        window.__link = link;
        window.__node = node;
        window.__label = label;
        updateInfoBar();
        setTimeout(function() {
                      updateMinimap();
            buildMinimapInteraction(zoom);
        
        }, 1000);
    
        }    function getMarkerSize(type) {
           return type === 'program' ? ' lg' : type === 'assembly' ? ' md' : ' sm';
 
        }    // ===== FOCUS LOCK =====    function focusLock(d) {
                  var neighborIds = new Set();
        neighborIds.add(d.id);
        resolvedLinks.forEach(function(l) {
                      var s = typeof l.source === ' object' ? l.source.id : l.source;
            var t = typeof l.target === ' object' ? l.target.id : l.target;
            if (s === d.id) neighborIds.add(t);
            if (t === d.id) neighborIds.add(s);
        
        });
        d3.selectAll(' .node-base')            .filter(function(n) {
           return !neighborIds.has(n.id);
 
        })            .classed(' node-dim', true);
    
        }    function releaseFocusLock() {
                  d3.selectAll(' .node-base').classed(' node-dim', false);
    
        }    // ===== TOOLTIP =====    function showTooltip(event, d) {
                  var statusLabel = ' Nominal';
        var statusClass = ' nominal';
        var keyStats = [];
        if (d.type === 'supplier') {
                      if (d.risk > 70) {
           statusLabel = ' Critical';
 statusClass = ' critical';
 
        }            else if (d.risk > 30) {
           statusLabel = ' Warning';
 statusClass = ' warning';
 
        }            keyStats.push({
           label: ' Risk', value: d.risk !== undefined ? d.risk : ' —', cls: d.risk > 70 ? ' high-risk' : ' ' 
        });
            keyStats.push({
           label: ' Revenue Exposure', value: d.revenue !== undefined ? '$' + d.revenue.toLocaleString() : ' —' 
        });
        
        } else if (d.type === 'component') {
                      var stockStatus = d.qty >= d.reorder ? ' Healthy' : ' Low Stock';
            if (d.qty === 0) {
           statusLabel = ' Critical';
 statusClass = ' critical';
 stockStatus = ' Zero Stock';
 
        }            else if (d.qty < d.reorder) {
           statusLabel = ' Warning';
 statusClass = ' warning';
 
        }            keyStats.push({
           label: ' Stock Level', value: d.qty + (d.qty < d.reorder ? ' / ' + d.reorder : ' '), cls: d.qty < d.reorder ? ' high-risk' : ' ' 
        });
            keyStats.push({
           label: ' Risk', value: d.risk !== undefined ? d.risk : ' —', cls: d.risk > 70 ? ' high-risk' : ' ' 
        });
            if (d.revenue) keyStats.push({
           label: ' Revenue', value: '$' + d.revenue.toLocaleString() 
        });
        
        } else if (d.type === 'program') {
                      statusLabel = ' Nominal';
 statusClass = ' nominal';
            keyStats.push({
           label: ' Revenue', value: d.revenue !== undefined ? '$' + d.revenue.toLocaleString() : ' —' 
        });
            keyStats.push({
           label: ' Risk', value: d.risk !== undefined ? d.risk : ' —' 
        });
        
        } else if (d.type === 'warehouse') {
                      if (d.qty === 0) {
           statusLabel = ' Critical';
 statusClass = ' critical';
 
        }            else if (d.qty < d.reorder) {
           statusLabel = ' Warning';
 statusClass = ' warning';
 
        }            keyStats.push({
           label: ' Stock', value: d.qty || 0, cls: d.qty < d.reorder ? ' high-risk' : ' ' 
        });
            keyStats.push({
           label: ' Buffer Days', value: d.weeklyDemand && d.qty ? Math.round(d.qty / (d.weeklyDemand / 7)) : ' —' 
        });
        
        } else {
                      keyStats.push({
           label: ' Type', value: d.type 
        });
            if (d.risk !== undefined) keyStats.push({
           label: ' Risk', value: d.risk, cls: d.risk > 70 ? ' high-risk' : ' ' 
        });
            if (d.revenue !== undefined) keyStats.push({
           label: ' Revenue', value: '$' + d.revenue.toLocaleString() 
        });
        
        }        var lines = [];
        var watchClass = watchlist.indexOf(d.id) >= 0 ? 'active' : ' ';
        var starHtml = d.type === 'supplier' ? ' <span class="watchlist-star ' + watchClass + '" data-star-id="' + d.id + '" style="float:right;
" onclick="event.stopPropagation();
toggleWatchlist(\'' + d.id + '\')">' + (watchlist.indexOf(d.id) >= 0 ? ' ★' : ' ☆') + ' </span>' : ' ';
        lines.push(' <div class="tt-name">' + d.id + starHtml + ' </div>');
        lines.push(' <span class="tt-status ' + statusClass + '">' + statusLabel + ' </span>');
        if (d.type === 'supplier') {
                      lines.push(' <div style="font-size:0.55rem;
color:var(--cyan);
margin-bottom:4px;
">Click for Supplier Profile →</div>');
        
        }        // Certification info in tooltip when cert mode is active        if (certificationMode && (d.type === 'supplier' || d.type === 'component')) {
                      var certStatus = d.type === 'supplier' ? getSupplierCertStatus(d) : getComponentCertStatus(d);
            lines.push(' <div class="tt-stat-label">Certification</div>');
            if (d.type === 'supplier') {
                          var allCerts = [' as9100', ' itar', ' dfars', ' cmmc', ' iso9001', ' nadcap'];
                allCerts.forEach(function(c) {
                              var hasIt = d.certifications && (d.certifications[c] === true || (c === ' cmmc' && d.certifications.cmmc && d.certifications.cmmcLevel > 0));
                    var name = CERT_NAMES[c] || c.toUpperCase();
                    var expInfo = ' ';
                    if (hasIt && d.certifications && d.certifications.expiryDates && d.certifications.expiryDates[c]) {
                                  var days = getDaysUntilExpiry(d.certifications.expiryDates[c]);
                        if (days <= 90) expInfo = ' <span style="color:var(--amber);
">(exp ' + days + ' d)</span>';
                    
        }                    var valColor = hasIt ? ' #48BB78' : ' #666';
                    lines.push(' <div class="tt-row"><span>' + (hasIt ? ' ✔' : ' —') + ' ' + name + ' </span><span class="tt-val" style="color:' + valColor + '">' + (hasIt ? ' ✓' : ' ✗') + expInfo + ' </span></div>');
                
        });
            
        } else if (d.type === 'component' && d.requiredCertifications) {
                          d.requiredCertifications.forEach(function(c) {
                              var hasIt = certStatus.supplierHas && certStatus.supplierHas[c];
                    var name = CERT_NAMES[c] || c.toUpperCase();
                    var valColor = hasIt ? ' #48BB78' : ' #E53E3E';
                    lines.push(' <div class="tt-row"><span>' + (hasIt ? ' ✔' : ' ✘') + ' ' + name + ' </span><span class="tt-val" style="color:' + valColor + '">' + (hasIt ? ' ✓' : ' ✗') + ' </span></div>');
                
        });
                if (certStatus.expiring && certStatus.expiring.length > 0) {
                              lines.push(' <div style="color:var(--amber);
font-size:0.6rem;
margin-top:4px;
">⚠ ' + certStatus.expiring.length + ' cert(s) expiring within 90 days</div>');
                
        }            
        }        
        }        lines.push(' <div class="tt-stat-label">Key Metrics</div>');
        keyStats.forEach(function(s) {
                      lines.push(' <div class="tt-row"><span>' + s.label + ' </span><span class="tt-val' + (s.cls ? ' ' + s.cls : '') + '">' + s.value + ' </span></div>');
        
        });
        tooltip.innerHTML = lines.join(' ');
        // Add RESTRICTED watermark for non-supplier nodes        if (d.type === 'supplier') {
                      tooltip.classList.remove('tt-restricted');
        
        } else {
                      tooltip.classList.add('tt-restricted');
        
        }        tooltip.classList.remove('visible');
        void tooltip.offsetWidth;
        tooltip.classList.add('visible');
        positionTooltip(event);
        // Make tooltip clickable for supplier profile        if (d.type === 'supplier') {
                      tooltip.style.pointerEvents = 'auto';
            tooltip.style.cursor = 'pointer';
            tooltip.onclick = function() {
           openSupplierProfile(d);
 
        };
        
        } else {
                      tooltip.style.pointerEvents = 'none';
            tooltip.style.cursor = 'default';
            tooltip.onclick = null;
        
        }    
        }    function moveTooltip(event) {
           positionTooltip(event);
 
        }    function hideTooltip() {
                  tooltip.classList.remove('visible');
        tooltip.style.pointerEvents = 'none';
        tooltip.style.cursor = 'default';
        tooltip.onclick = null;
    
        }    // Prevent tooltip from hiding when hovering over it    tooltip.addEventListener(' mouseenter', function() {
                  tooltip._stayOpen = true;
    
        });
    tooltip.addEventListener(' mouseleave', function() {
                  tooltip._stayOpen = false;
        setTimeout(function() {
           if (!tooltip._stayOpen) hideTooltip();
 
        }, 100);
    
        });
    function positionTooltip(event) {
                  var t = container.getBoundingClientRect();
        var x = event.clientX - t.left + 14;
        var y = event.clientY - t.top - 10;
        if (x + 220 > t.width) x = event.clientX - t.left - 230;
        if (y + 140 > t.height) y = t.height - 150;
        if (x < 4) x = 4;
        if (y < 4) y = 4;
        tooltip.style.left = x + ' px';
        tooltip.style.top = y + ' px';
    
        }    // ===== MINIMAP =====    var mmXMin = Infinity, mmXMax = -Infinity, mmYMin = Infinity, mmYMax = -Infinity;
    function updateMinimapBounds() {
                  mmXMin = Infinity;
 mmXMax = -Infinity;
 mmYMin = Infinity;
 mmYMax = -Infinity;
        nodes.forEach(function(n) {
                      if (n.x < mmXMin) mmXMin = n.x;
            if (n.x > mmXMax) mmXMax = n.x;
            if (n.y < mmYMin) mmYMin = n.y;
            if (n.y > mmYMax) mmYMax = n.y;
        
        });
    
        }    function updateMinimap() {
                  updateMinimapBounds();
        var mmW = mmXMax - mmXMin || 1;
        var mmH = mmYMax - mmYMin || 1;
        var scaleX = 140 / mmW;
        var scaleY = 100 / mmH;
        var dots = minimapSvg.selectAll(' .minimap-dot').data(nodes);
        dots.join(' circle')            .attr('class', function(d) {
           return ' minimap-dot type-' + d.type;
 
        })            .attr('cx', function(d) {
           return 10 + (d.x - mmXMin) * scaleX;
 
        })            .attr('cy', function(d) {
           return 10 + (d.y - mmYMin) * scaleY;
 
        })            .attr('r', 2.5);
    
        }    function buildMinimapInteraction(zoom) {
                  var mm = document.getElementById('minimap');
        mm.addEventListener(' click', function(event) {
                      var rect = mm.getBoundingClientRect();
            var px = (event.clientX - rect.left) / rect.width;
            var py = (event.clientY - rect.top) / rect.height;
            updateMinimapBounds();
            var mmW = mmXMax - mmXMin || 1;
            var mmH = mmYMax - mmYMin || 1;
            var targetX = mmXMin + px * mmW;
            var targetY = mmYMin + py * mmH;
            var dim = getDimensions();
            svg.transition().duration(500).call(zoom.transform,                d3.zoomIdentity.translate(dim.w / 2 - targetX, dim.h / 2 - targetY).scale(1)            );
        
        });
    
        }    // ===== INFO BAR =====    function updateInfoBar() {
                  var types = {
          
        };
        nodes.forEach(function(n) {
                      types[n.type] = (types[n.type] || 0) + 1;
        
        });
        document.getElementById('gi-nodes').textContent = ' Nodes: ' + nodes.length;
        document.getElementById('gi-links').textContent = ' Links: ' + resolvedLinks.length;
        document.getElementById('ns-nodes').textContent = nodes.length;
        document.getElementById('ns-links').textContent = resolvedLinks.length;
        document.getElementById('ns-programs').textContent = types.program || 0;
        document.getElementById('ns-suppliers').textContent = types.supplier || 0;
        document.getElementById('ns-components').textContent = types.component || 0;
        document.getElementById('ns-warehouses').textContent = types.warehouse || 0;
    
        }    // ===== TIER DEPTH CALCULATION =====    function calculateTierDepths() {
                  var depths = {
          
        };
        nodes.forEach(function(n) {
           depths[n.id] = -1;
 
        });
        var queue = [];
        nodes.forEach(function(n) {
                      if (n.type === 'program') {
           depths[n.id] = 0;
 queue.push(n.id);
 
        }        
        });
        while (queue.length > 0) {
                      var cur = queue.shift();
            resolvedLinks.forEach(function(l) {
                          var srcId = typeof l.source === ' object' ? l.source.id : l.source;
                var tgtId = typeof l.target === ' object' ? l.target.id : l.target;
                if (tgtId === cur && depths[srcId] === -1) {
                              depths[srcId] = depths[cur] + 1;
                    queue.push(srcId);
                
        }                if (srcId === cur && depths[tgtId] === -1) {
                              depths[tgtId] = depths[cur] + 1;
                    queue.push(tgtId);
                
        }            
        });
        
        }        return depths;
    
        }    function getTierColor(depth) {
                  if (depth === 0) return null;
        if (depth >= 1 && depth <= 4) return TIER_COLORS[depth];
        if (depth > 4) return TIER_COLORS[4];
        return TIER_COLORS[5];
    
        }    function applyTierColors() {
                  tierDepth = calculateTierDepths();
        d3.selectAll(' .node-base')            .transition().duration(400)            .attr('r', function(d) {
                          var depth = tierDepth[d.id];
                var base = NODE_SIZES[d.type] || 8;
                if (depth === 0) return base;
                if (depth === 1) return base + 2;
                if (depth === 2) return base + 4;
                if (depth === 3) return base + 6;
                if (depth >= 4) return base + 8;
                return base;
            
        })            .attr('fill', function(d) {
                          var tc = getTierColor(tierDepth[d.id]);
                return tc || (NODE_COLORS[d.type] || ' #666');
            
        });
        // Update tier legend        var legend = document.getElementById('tier-legend');
        var html = ' ';
        for (var i = 0;
 i <= 4;
 i++) {
                      html += ' <div class="tl-item"><span class="tl-swatch" style="background:' + TIER_COLORS[i] + '"></span>' + TIER_NAMES[i] + ' </div>';
        
        }        html += ' <div class="tl-item"><span class="tl-swatch" style="background:' + TIER_COLORS[5] + '"></span>' + TIER_NAMES[5] + ' </div>';
        legend.innerHTML = html;
        legend.classList.add('visible');
    
        }    function applyDefaultColors() {
                  d3.selectAll(' .node-base')            .transition().duration(400)            .attr('r', function(d) {
           return NODE_SIZES[d.type] || 8;
 
        })            .attr('fill', function(d) {
           return NODE_COLORS[d.type] || ' #666';
 
        });
        var legend = document.getElementById('tier-legend');
        legend.classList.remove('visible');
        legend.innerHTML = ' ';
    
        }    function toggleTierMode() {
                  tierMode = !tierMode;
        document.getElementById('tb-tiers').classList.toggle('active', tierMode);
        if (tierMode) {
                      if (heatmapMode) {
           heatmapMode = false;
 document.getElementById('tb-heatmap').classList.remove('active');
 if (heatmapGroup) {
           heatmapGroup.selectAll(' *').remove();
 heatmapGroup.attr('opacity', 0);
 
        } 
        }            if (certificationMode) {
           certificationMode = false;
 document.getElementById('tb-cert').classList.remove('active');
 document.getElementById('cert-legend').classList.remove('visible');
 
        }            applyTierColors();
        
        } else {
                      applyDefaultColors();
        
        }    
        }    // ===== HEATMAP =====    function toggleHeatmap() {
                  heatmapMode = !heatmapMode;
        document.getElementById('tb-heatmap').classList.toggle('active', heatmapMode);
        if (heatmapMode) {
                      if (tierMode) {
           tierMode = false;
 document.getElementById('tb-tiers').classList.remove('active');
 applyDefaultColors();
 
        }            if (certificationMode) {
           certificationMode = false;
 document.getElementById('tb-cert').classList.remove('active');
 document.getElementById('cert-legend').classList.remove('visible');
 
        }            updateHeatmap();
        
        } else {
                      if (heatmapGroup) {
                          heatmapGroup.selectAll(' *').remove();
                heatmapGroup.attr('opacity', 0);
            
        }        
        }    
        }    function updateHeatmap() {
                  if (!heatmapMode) return;
        if (!heatmapGroup) {
                      heatmapGroup = zoomG.insert(' g', ':first-child').attr('class', ' heatmap-group');
        
        }        heatmapGroup.selectAll(' *').remove();
        heatmapGroup.attr('opacity', 1);
        nodes.forEach(function(n) {
                      var risk = n.risk || 0;
            if (risk > 30) {
                          var radius = 10 + (risk / 100) * 40;
                var opacity = Math.min(0.15, (risk - 30) / 70 * 0.15);
                heatmapGroup.append(' circle')                    .attr('cx', n.x)                    .attr('cy', n.y)                    .attr('r', radius)                    .attr('fill', ' rgba(229, 62, 62, ' + opacity + ')')                    .attr('class', ' heatmap-ring visible');
                // Contagion to neighbors                resolvedLinks.forEach(function(l) {
                              var srcId = typeof l.source === ' object' ? l.source.id : l.source;
                    var tgtId = typeof l.target === ' object' ? l.target.id : l.target;
                    if (srcId === n.id) {
                                  var neighbor = nodeMap[tgtId];
                        if (neighbor) {
                                      var midX = (n.x + neighbor.x) / 2;
                            var midY = (n.y + neighbor.y) / 2;
                            var spread = radius * 0.6;
                            heatmapGroup.append(' circle')                                .attr('cx', midX).attr('cy', midY)                                .attr('r', spread)                                .attr('fill', ' rgba(229, 62, 62, ' + (opacity * 0.4) + ')')                                .attr('class', ' heatmap-ring visible');
                        
        }                    
        }                
        });
            
        }        
        });
    
        }    // ===== CERTIFICATION FUNCTIONS =====    var CERT_NAMES = {
           as9100: ' AS9100', itar: ' ITAR', dfars: ' DFARS', cmmc: ' CMMC', iso9001: ' ISO9001', nadcap: ' NADCAP' 
        };
    function getDaysUntilExpiry(dateStr) {
                  if (!dateStr) return Infinity;
        var parts = dateStr.split(' -');
        var d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        var now = new Date();
        return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    
        }    function getSupplierCertStatus(supplier) {
                  if (!supplier || !supplier.certifications) return {
           fullyCertified: false, missing: [], expiring: [], expiryDates: {
          
        } 
        };
        var certs = supplier.certifications;
        var missing = [], expiring = [];
        var certKeys = [' as9100', ' itar', ' dfars', ' cmmc', ' iso9001', ' nadcap'];
        certKeys.forEach(function(key) {
                      var val = certs[key];
            var hasCert = val === true || (key === ' cmmc' && val && certs.cmmcLevel > 0);
            if (!hasCert) {
                          missing.push(key);
            
        } else {
                          var expDate = certs.expiryDates && certs.expiryDates[key];
                if (expDate) {
                              var days = getDaysUntilExpiry(expDate);
                    if (days <= 90) expiring.push({
           cert: key, days: days, date: expDate 
        });
                
        }            
        }        
        });
        return {
           fullyCertified: missing.length === 0, missing: missing, expiring: expiring, expiryDates: certs.expiryDates || {
          
        } 
        };
    
        }    function getComponentCertStatus(component) {
                  if (!component || !component.requiredCertifications || component.requiredCertifications.length === 0) {
                      return {
           status: ' grey', missing: [], expiring: [], supplierHas: {
          
        } 
        };
        
        }        var reqCerts = component.requiredCertifications;
        // Find supplier(s) that manufacture this component        var supplierIds = [];
        resolvedLinks.forEach(function(l) {
                      var srcId = typeof l.source === ' object' ? l.source.id : l.source;
            var tgtId = typeof l.target === ' object' ? l.target.id : l.target;
            if (l.type === 'manufactures' && tgtId === component.id) {
                          supplierIds.push(srcId);
            
        }        
        });
        if (supplierIds.length === 0) return {
           status: ' grey', missing: reqCerts, expiring: [], supplierHas: {
          
        } 
        };
        // Dual-source: pass if at least one supplier meets all        var anyFullyMet = false;
        var allMissing = {
          
        };
        var allExpiring = [];
        var bestSupplierHas = {
          
        };
        reqCerts.forEach(function(c) {
           allMissing[c] = true;
 
        });
        supplierIds.forEach(function(sid) {
                      var sup = nodeMap[sid];
            if (!sup) return;
            var supCerts = whatIfOverrides[sup.id] || sup.certifications;
            if (!supCerts) return;
            var thisMissing = [];
            reqCerts.forEach(function(c) {
                          var hasIt = supCerts[c] === true || (c === ' cmmc' && supCerts.cmmc && supCerts.cmmcLevel > 0);
                if (!hasIt) thisMissing.push(c);
            
        });
            if (thisMissing.length === 0) {
                          anyFullyMet = true;
                reqCerts.forEach(function(c) {
           delete allMissing[c];
 
        });
            
        } else {
                          thisMissing.forEach(function(c) {
           if (allMissing[c] !== undefined) allMissing[c] = true;
 
        });
            
        }            // Check expiring            if (supCerts.expiryDates) {
                          Object.keys(supCerts.expiryDates).forEach(function(c) {
                              if (reqCerts.indexOf(c) >= 0) {
                                  var days = getDaysUntilExpiry(supCerts.expiryDates[c]);
                        if (days <= 90) allExpiring.push({
           cert: c, days: days, date: supCerts.expiryDates[c], supplier: sid 
        });
                    
        }                
        });
            
        }            // Track what the first supplier has            if (Object.keys(bestSupplierHas).length === 0 && supCerts) {
                          reqCerts.forEach(function(c) {
           bestSupplierHas[c] = supCerts[c] === true || (c === ' cmmc' && supCerts.cmmc && supCerts.cmmcLevel > 0);
 
        });
            
        }        
        });
        var missingArr = Object.keys(allMissing).filter(function(k) {
           return allMissing[k];
 
        });
        if (anyFullyMet) {
                      return {
           status: ' green', missing: [], expiring: allExpiring, supplierHas: bestSupplierHas 
        };
        
        } else if (missingArr.length > 0) {
                      // Check if missing is critical (ITAR/DFARS/AS9100)            var hasCriticalMissing = missingArr.some(function(c) {
           return c === ' itar' || c === ' dfars' || c === ' as9100';
 
        });
            if (hasCriticalMissing) {
                          return {
           status: ' red', missing: missingArr, expiring: allExpiring, supplierHas: bestSupplierHas 
        };
            
        } else {
                          return {
           status: ' amber', missing: missingArr, expiring: allExpiring, supplierHas: bestSupplierHas 
        };
            
        }        
        } else if (allExpiring.length > 0) {
                      return {
           status: ' amber', missing: [], expiring: allExpiring, supplierHas: bestSupplierHas 
        };
        
        }        return {
           status: ' green', missing: [], expiring: [], supplierHas: bestSupplierHas 
        };
    
        }    function getNodeCertStatus(node) {
                  if (!node) return ' grey';
        // Apply what-if overrides        if (node.type === 'supplier' && whatIfOverrides[node.id]) {
                      node = Object.assign({
          
        }, node, {
           certifications: whatIfOverrides[node.id] 
        });
        
        }        if (node.type === 'program') {
                      // Check all downstream            var downstream = getDownstreamNodes(node.id);
            var allGreen = true, anyRed = false, anyAmber = false;
            downstream.forEach(function(id) {
                          var n = nodeMap[id];
                if (!n) return;
                if (n.type === 'component') {
                              var cs = getComponentCertStatus(n);
                    if (cs.status === ' red') anyRed = true;
                    else if (cs.status === ' amber') anyAmber = true;
                    else if (cs.status !== ' green') allGreen = false;
                
        }                if (n.type === 'supplier') {
                              var effectiveCerts = whatIfOverrides[n.id] || n.certifications;
                    var ss = getSupplierCertStatus(Object.assign({
          
        }, n, {
           certifications: effectiveCerts 
        }));
                    if (!ss.fullyCertified) {
                                  var missingCritical = ss.missing.some(function(c) {
           return c === ' itar' || c === ' dfars' || c === ' as9100';
 
        });
                        if (missingCritical) anyRed = true;
                        else anyAmber = true;
                    
        }                
        }            
        });
            if (anyRed) return ' red';
            if (anyAmber) return ' amber';
            if (allGreen && downstream.size > 0) return ' green';
            return ' grey';
        
        }        if (node.type === 'assembly') {
                      // Check all components that supply this assembly            var comps = [];
            resolvedLinks.forEach(function(l) {
                          var srcId = typeof l.source === ' object' ? l.source.id : l.source;
                var tgtId = typeof l.target === ' object' ? l.target.id : l.target;
                if (l.type === 'supplies' && tgtId === node.id) comps.push(srcId);
            
        });
            if (comps.length === 0) return ' grey';
            var anyRed = false, anyAmber = false;
            comps.forEach(function(cid) {
                          var c = nodeMap[cid];
                if (c && c.type === 'component') {
                              var cs = getComponentCertStatus(c);
                    if (cs.status === ' red') anyRed = true;
                    else if (cs.status === ' amber') anyAmber = true;
                
        }            
        });
            if (anyRed) return ' red';
            if (anyAmber) return ' amber';
            return ' green';
        
        }        if (node.type === 'component') {
                      var cs = getComponentCertStatus(node);
            return cs.status;
        
        }        if (node.type === 'supplier') {
                      var ss = getSupplierCertStatus(node);
            if (!ss.fullyCertified) {
                          var missingCritical = ss.missing.some(function(c) {
           return c === ' itar' || c === ' dfars' || c === ' as9100';
 
        });
                if (missingCritical) return ' red';
                if (ss.expiring.length > 0) return ' amber';
                return ' amber';
 // non-critical missing            
        }            if (ss.expiring.length > 0) return ' amber';
            return ' green';
        
        }        return ' grey';
    
        }    function getCertColor(node) {
                  var status = getNodeCertStatus(node);
        switch (status) {
                      case ' green': return ' #48BB78';
            case ' amber': return ' #ECC94B';
            case ' red': return ' #E53E3E';
            default: return ' #666';
        
        }    
        }    function getDownstreamNodes(startId) {
                  var visited = new Set();
        var queue = [startId];
        while (queue.length > 0) {
                      var cur = queue.shift();
            if (visited.has(cur)) continue;
            visited.add(cur);
            resolvedLinks.forEach(function(l) {
                          var srcId = typeof l.source === ' object' ? l.source.id : l.source;
                var tgtId = typeof l.target === ' object' ? l.target.id : l.target;
                // Go downstream (target depends on source)                if (tgtId === cur && !visited.has(srcId)) queue.push(srcId);
            
        });
        
        }        return visited;
    
        }    function applyCertColors() {
                  d3.selectAll(' .node-base')            .transition().duration(400)            .attr('fill', function(d) {
           return getCertColor(d);
 
        });
    
        }    function applyDefaultCertColors() {
                  d3.selectAll(' .node-base')            .transition().duration(400)            .attr('fill', function(d) {
           return NODE_COLORS[d.type] || ' #666';
 
        });
        document.getElementById('cert-legend').classList.remove('visible');
    
        }    function toggleCertMode() {
                  certificationMode = !certificationMode;
        document.getElementById('tb-cert').classList.toggle('active', certificationMode);
        if (certificationMode) {
                      if (tierMode) {
           tierMode = false;
 document.getElementById('tb-tiers').classList.remove('active');
 
        }            if (heatmapMode) {
           heatmapMode = false;
 document.getElementById('tb-heatmap').classList.remove('active');
 if (heatmapGroup) {
           heatmapGroup.selectAll(' *').remove();
 heatmapGroup.attr('opacity', 0);
 
        } 
        }            applyCertColors();
            document.getElementById('cert-legend').classList.add('visible');
            document.getElementById('cert-health-panel').style.display = certHealthCollapsed ? 'none' : 'block';
            updateCertHealthPanel();
        
        } else {
                      applyDefaultCertColors();
            document.getElementById('cert-legend').classList.remove('visible');
            document.getElementById('cert-health-panel').style.display = 'none';
        
        }    
        }    function getCertLinkTooltipHtml(sourceId, targetId) {
                  var sup = nodeMap[sourceId];
        var comp = nodeMap[targetId];
        if (!sup || !comp || !comp.requiredCertifications) return ' ';
        var reqCerts = comp.requiredCertifications;
        var supCerts = whatIfOverrides[sup.id] || sup.certifications || {
          
        };
        var lines = [' <div class="cert-link-tooltip">'];
        lines.push(' <div style="font-weight:600;
margin-bottom:4px;
">Certification Match</div>');
        reqCerts.forEach(function(c) {
                      var hasIt = supCerts[c] === true || (c === ' cmmc' && supCerts.cmmc && supCerts.cmmcLevel > 0);
            var icon = hasIt ? ' ✔' : ' ✘';
            var cls = hasIt ? ' clt-pass' : ' clt-fail';
            var name = CERT_NAMES[c] || c.toUpperCase();
            lines.push(' <div class="clt-item"><span>' + name + ' </span><span class="' + cls + '">' + icon + ' </span></div>');
        
        });
        // Expiry info        if (supCerts.expiryDates) {
                      Object.keys(supCerts.expiryDates).forEach(function(c) {
                          if (reqCerts.indexOf(c) >= 0) {
                              var days = getDaysUntilExpiry(supCerts.expiryDates[c]);
                    if (days <= 90) {
                                  lines.push(' <div style="color:var(--amber);
font-size:0.6rem;
">⚠ Expires ' + supCerts.expiryDates[c] + '(' + days + ' d)</div>');
                    
        }                
        }            
        });
        
        }        lines.push(' </div>');
        return lines.join(' ');
    
        }    // ===== CERTIFICATION HEALTH PANEL =====    function updateCertHealthPanel() {
                  if (!certificationMode) {
                      document.getElementById('cert-health-panel').style.display = 'none';
            return;
        
        }        document.getElementById('cert-health-panel').style.display = certHealthCollapsed ? 'none' : 'block';
        var supplierNodes = nodes.filter(function(n) {
           return n.type === 'supplier';
 
        });
        var totalSuppliers = supplierNodes.length;
        var fullyCertified = 0;
        var allExpiring = [];
        var allMissing = 0;
        supplierNodes.forEach(function(s) {
                      var effectiveCerts = whatIfOverrides[s.id] || s.certifications;
            var ss = getSupplierCertStatus(Object.assign({
          
        }, s, {
           certifications: effectiveCerts 
        }));
            if (ss.fullyCertified && ss.expiring.length === 0) fullyCertified++;
            if (ss.expiring.length > 0) {
                          ss.expiring.forEach(function(e) {
                              allExpiring.push({
           supplier: s.id.replace(' _t', ' '), cert: e.cert, days: e.days, date: e.date 
        });
                
        });
            
        }        
        });
        // Count missing across components        nodes.forEach(function(n) {
                      if (n.type === 'component' && n.requiredCertifications) {
                          var cs = getComponentCertStatus(n);
                allMissing += cs.missing.length;
            
        }        
        });
        var pct = totalSuppliers > 0 ? Math.round(fullyCertified / totalSuppliers * 100) : 0;
        document.getElementById('cert-health-bar').style.width = pct + ' %';
        document.getElementById('cert-health-bar').className = ' cert-health-bar-fill ' + (pct >= 80 ? ' green' : pct >= 50 ? ' amber' : ' red');
        document.getElementById('ch-fully-cert').textContent = fullyCertified + ' /' + totalSuppliers + '(' + pct + ' %)';
        document.getElementById('ch-expiring').textContent = allExpiring.length;
        document.getElementById('ch-missing').textContent = allMissing;
        // Top 3 expirations        allExpiring.sort(function(a, b) {
           return a.days - b.days;
 
        });
        var expiryList = document.getElementById('ch-expiry-list');
        var top3 = allExpiring.slice(0, 3);
        if (top3.length > 0) {
                      expiryList.innerHTML = top3.map(function(e) {
                          return ' <li><span class="cert-exp-name">' + e.supplier + ' </span>— <span class="cert-exp-date">' + (CERT_NAMES[e.cert] || e.cert.toUpperCase()) + ' expires in ' + e.days + ' d</span></li>';
            
        }).join(' ');
        
        } else {
                      expiryList.innerHTML = ' <li style="color:var(--green);
">No upcoming expirations</li>';
        
        }    
        }    // ===== BUILD READINESS CHECK =====    function runBuildReadiness(programNode) {
                  if (!programNode || programNode.type !== ' program') {
                      notify(' Select a program node first.', ' error');
            return;
        
        }        var downstream = getDownstreamNodes(programNode.id);
        var components = [];
        var suppliers = [];
        downstream.forEach(function(id) {
                      var n = nodeMap[id];
            if (!n) return;
            if (n.type === 'component') components.push(n);
            if (n.type === 'supplier') suppliers.push(n);
        
        });
        var totalChecks = 0;
        var passedChecks = 0;
        var blockingIssues = [];
        var expiringIssues = [];
        var certCheckMap = {
          
        };
        components.forEach(function(comp) {
                      if (!comp.requiredCertifications || comp.requiredCertifications.length === 0) return;
            var reqCerts = comp.requiredCertifications;
            // Find suppliers            var supIds = [];
            resolvedLinks.forEach(function(l) {
                          var srcId = typeof l.source === ' object' ? l.source.id : l.source;
                var tgtId = typeof l.target === ' object' ? l.target.id : l.target;
                if (l.type === 'manufactures' && tgtId === comp.id) supIds.push(srcId);
            
        });
            if (supIds.length === 0) {
                          totalChecks++;
                blockingIssues.push({
           component: comp.id, supplier: ' No supplier', missing: reqCerts, critical: true 
        });
                return;
            
        }            // Dual-source: pass if any supplier meets all            var anyPass = false;
            supIds.forEach(function(sid) {
                          var sup = nodeMap[sid];
                if (!sup) return;
                var supCerts = whatIfOverrides[sup.id] || sup.certifications || {
          
        };
                var missingList = [];
                var hasExpiring = false;
                reqCerts.forEach(function(c) {
                              var hasIt = supCerts[c] === true || (c === ' cmmc' && supCerts.cmmc && supCerts.cmmcLevel > 0);
                    if (!hasIt) missingList.push(c);
                    if (hasIt && supCerts.expiryDates && supCerts.expiryDates[c]) {
                                  var days = getDaysUntilExpiry(supCerts.expiryDates[c]);
                        if (days <= 90) {
                                      hasExpiring = true;
                            expiringIssues.push({
           supplier: sup.id.replace(' _t', ' '), cert: c, days: days, date: supCerts.expiryDates[c], component: comp.id.replace(' _t', ' ') 
        });
                        
        }                    
        }                
        });
                if (missingList.length === 0) anyPass = true;
                else {
                              var isCritical = missingList.some(function(c) {
           return c === ' itar' || c === ' dfars' || c === ' as9100';
 
        });
                    if (!certCheckMap[comp.id + ' _' + sid]) {
                                  certCheckMap[comp.id + ' _' + sid] = {
           component: comp.id, supplier: sup.id, missing: missingList, critical: isCritical 
        };
                    
        }                
        }            
        });
            totalChecks++;
            if (anyPass) passedChecks++;
            else {
                          // Add the first supplier' s missing var key=comp.id+'_'+supIds[0];
    var issue=certCheckMap[key];
    if (issue) blockingIssues.push(issue);
    else blockingIssues.push({
                component: comp.id, supplier: supIds[0] ? supIds[0] : 'Unknown', missing: reqCerts, critical: true    
        });
    
        }    
        });
    var score=totalChecks>0 ? Math.round(passedChecks / totalChecks * 100) : 100;
    var hasCriticalBlockers=blockingIssues.some(function(b) {
                  return b.critical;
      
        });
    var hasExpiring=expiringIssues.length>0;
    var verdict='';
    var verdictClass='';
    if (hasCriticalBlockers) {
                verdict='NO — Missing critical certifications';
      verdictClass='red';
    
        }    else if (hasExpiring) {
                verdict='CONDITIONAL — Certifications expiring soon, requires action';
      verdictClass='amber';
    
        }    else if (score >=100) {
                verdict='YES — Build legal and qualified';
      verdictClass='green';
    
        }    else {
                verdict='YES — Build legal and qualified (minor issues)';
      verdictClass='green';
    
        }    // Show report        showBuildReport(programNode, score, verdict, verdictClass, blockingIssues, expiringIssues, totalChecks, passedChecks, components, suppliers);
    
        }    function showBuildReport(program, score, verdict, verdictClass, blocking, expiring, total, passed, components, suppliers) {
                  var title = document.getElementById('br-title');
        title.textContent = 'Build Readiness Report: ' + program.id.replace('_t', '');
        document.getElementById('br-subtitle').textContent = 'Certification compliance trace through ' + components.length + ' components and ' + suppliers.length + ' suppliers.';
        var verdictEl = document.getElementById('br-verdict');
        verdictEl.textContent = verdict;
        verdictEl.className = 'cert-report-verdict ' + verdictClass;
        document.getElementById('br-score').textContent = score + '%';
        document.getElementById('br-score').style.color = score >= 80 ? '#48BB78' : score >= 50 ? '#ECC94B' : '#E53E3E';
        // Blocking issues        var blockingEl = document.getElementById('br-blocking');
        if (blocking.length === 0) {
                      blockingEl.innerHTML = '<p style="color:var(--green);
font-size:0.78rem;
">No blocking certification issues found.</p>';
        
        } else {
                      blockingEl.innerHTML = blocking.map(function(b, idx) {
                          var missingNames = b.missing.map(function(c) {
           return CERT_NAMES[c] || c.toUpperCase();
 
        }).join(', ');
                var supName = typeof b.supplier === 'string' ? b.supplier.replace('_t', '') : (b.supplier.id || '').replace('_t', '');
                var actionHtml = '<div class="cbi-action">💡 Click to simulate fixing → Assume ' + supName + ' obtains ' + missingNames + '</div>';
                return '<div class="cert-block-item" data-idx="' + idx + '" data-supplier="' + (b.supplier.id || b.supplier) + '" data-certs="' + b.missing.join(',') + '">' +                    '<div class="cbi-name">' + b.component.replace('_t', '') + '</div>' +                    '<div class="cbi-missing">Supplier: ' + supName + ' — Missing: ' + missingNames + '</div>' +                    actionHtml +                    '</div>';
            
        }).join('');
            // What-if click handler            blockingEl.onclick = function(e) {
                          var item = e.target.closest('.cert-block-item');
                if (!item) return;
                var supplierId = item.dataset.supplier;
                var certs = item.dataset.certs.split(',');
                var sup = nodeMap[supplierId];
                if (!sup) return;
                var overKey = sup.id;
                var override = JSON.parse(JSON.stringify(whatIfOverrides[overKey] || sup.certifications || {
          
        }));
                certs.forEach(function(c) {
                              override[c] = true;
                
        });
                whatIfOverrides[overKey] = override;
                // Re-run build readiness with same program                runBuildReadiness(program);
                // Also re-apply cert colors if mode active                if (certificationMode) applyCertColors();
                // Update health panel                updateCertHealthPanel();
                // Update resilience score                updateResilience();
                notify('What-if applied: ' + supplierId.replace('_t', '') + ' now has ' + certs.map(function(c) {
           return CERT_NAMES[c] || c.toUpperCase();
 
        }).join(', '), 'success');
            
        };
        
        }        // Expiring issues        var expiringEl = document.getElementById('br-expiring');
        if (expiring.length === 0) {
                      expiringEl.innerHTML = '<p style="color:var(--green);
font-size:0.78rem;
">No certifications expiring within 90 days.</p>';
        
        } else {
                      var seen = {
          
        };
            expiringEl.innerHTML = expiring.filter(function(e) {
                          var key = e.supplier + '_' + e.cert;
                if (seen[key]) return false;
                seen[key] = true;
                return true;
            
        }).map(function(e) {
                          return '<div class="cert-expiring-item"><span class="cei-name">' + e.supplier + '</span> — <span class="cei-date">' + (CERT_NAMES[e.cert] || e.cert.toUpperCase()) + ' expires ' + e.date + ' (' + e.days + ' days)</span></div>';
            
        }).join('');
        
        }        // Summary        var summaryEl = document.getElementById('br-summary');
        summaryEl.innerHTML =            '<div class="modal-item"><span class="mi-label">Components Checked</span><span class="mi-val">' + components.length + '</span></div>' +            '<div class="modal-item"><span class="mi-label">Suppliers Traced</span><span class="mi-val">' + suppliers.length + '</span></div>' +            '<div class="modal-item"><span class="mi-label">Certification Checks</span><span class="mi-val">' + total + '</span></div>' +            '<div class="modal-item"><span class="mi-label">Checks Passed</span><span class="mi-val positive">' + passed + '</span></div>' +            '<div class="modal-item"><span class="mi-label">Blocking Issues</span><span class="mi-val negative">' + blocking.length + '</span></div>' +            '<div class="modal-item"><span class="mi-label">Expiring Certs</span><span class="mi-val" style="color:var(--amber)">' + expiring.length + '</span></div>';
        document.getElementById('modal-build-report').classList.add('visible');
    
        }    // ===== CERTIFICATION INTEGRATION INTO RESILIENCE =====    function getCertificationPenalties() {
                  var penalties = [];
        var penaltyScore = 0;
        nodes.forEach(function(n) {
                      if (n.type === 'supplier') {
                          var effectiveCerts = whatIfOverrides[n.id] || n.certifications;
                var ss = getSupplierCertStatus(Object.assign({
          
        }, n, {
           certifications: effectiveCerts 
        }));
                if (!ss.fullyCertified) {
                              var missingCritical = ss.missing.filter(function(c) {
           return c === 'itar' || c === 'dfars';
 
        });
                    if (missingCritical.length > 0) {
                                  var p = missingCritical.length * 3;
                        penaltyScore += p;
                        penalties.push({
           label: n.id.replace('_t', '') + ' missing ' + missingCritical.map(function(c) {
           return CERT_NAMES[c];
 
        }).join('/'), value: '-' + p 
        });
                    
        }                
        }            
        }        
        });
        return {
           penalties: penalties, penaltyScore: penaltyScore 
        };
    
        }    // ===== NODE SELECTION =====    function selectNode(d) {
                  deselectNode(false);
        selectedNode = d;
        d3.selectAll('.node-base')            .filter(function(n) {
           return n === d;
 
        })            .classed('selected', true);
        // Add pulsing ring        d3.selectAll('.pulse-ring').remove();
        if (zoomG) {
                      zoomG.append('circle')                .attr('class', 'pulse-ring')                .attr('cx', d.x)                .attr('cy', d.y)                .attr('r', NODE_SIZES[d.type] + 6);
        
        }        var simStatus = document.getElementById('sim-status');
        var extraBtns = '';
        if (d.type === 'program') {
                      extraBtns = '<br><button class="btn-secondary" onclick="runBuildReadiness(window.__selectedNode)" style="font-size:0.65rem;
padding:6px 12px;
margin-bottom:0;
">Verify Build Readiness</button>';
        
        } else if (d.type === 'supplier') {
                      extraBtns = '<br><button class="btn-secondary" onclick="openSupplierProfile(window.__selectedNode)" style="font-size:0.65rem;
padding:6px 12px;
margin-bottom:0;
">View Supplier Profile</button>';
        
        }        simStatus.innerHTML =            'Selected node: <span class="node-selected">' + d.id + '</span><br><span style="font-size:0.72rem;
color:var(--text-2);
margin-top:6px;
display:block;
">Ready to destroy. Click "DESTROY THIS NODE" to ignite cascade.</span>' +            extraBtns;
        document.getElementById('btn-simulate').disabled = false;
        document.getElementById('btn-compare').disabled = false;
        window.__selectedNode = d;
    
        }    function deselectNode(clearStatus) {
                  if (clearStatus !== false) {
                      selectedNode = null;
            document.getElementById('sim-status').textContent = 'Click a node to simulate failure.';
            document.getElementById('btn-simulate').disabled = true;
        
        }        d3.selectAll('.node-base').classed('selected', false);
        d3.selectAll('.pulse-ring').remove();
    
        }    // ===== SIMULATION (Wave-Based Cascade) =====    function runSimulation() {
                  if (!selectedNode) {
                      notify('Select a node first.', 'error');
            return;
        
        }        playDestroySound();
        clearSimulation(false);
        var startId = selectedNode.id;
        // 1. Compute tiers via BFS        var tiers = [];
        var visited = new Set();
        var queue = [{
           id: startId, depth: 0 
        }];
        while (queue.length > 0) {
                      var cur = queue.shift();
            if (visited.has(cur.id)) continue;
            visited.add(cur.id);
            if (!tiers[cur.depth]) tiers[cur.depth] = [];
            tiers[cur.depth].push(cur.id);
            resolvedLinks.forEach(function(l) {
                          var srcId = typeof l.source === 'object' ? l.source.id : l.source;
                var tgtId = typeof l.target === 'object' ? l.target.id : l.target;
                if (srcId === cur.id && !visited.has(tgtId)) {
                              queue.push({
           id: tgtId, depth: cur.depth + 1 
        });
                
        }            
        });
        
        }        // Collect all edges by depth        var tierEdges = [];
        tiers.forEach(function(tierNodes, depth) {
                      tierEdges[depth] = [];
            resolvedLinks.forEach(function(l) {
                          var srcId = typeof l.source === 'object' ? l.source.id : l.source;
                var tgtId = typeof l.target === 'object' ? l.target.id : l.target;
                if (tierNodes.indexOf(srcId) >= 0 && visited.has(tgtId)) {
                              if (tierEdges[depth].indexOf(l) < 0) tierEdges[depth].push(l);
                
        }            
        });
        
        });
        simAffected = visited;
        // Apply disruption severity: proportionally reduce affected nodes based on severity        var severity = getDisruptionIntensity();
        if (severity < 1.0) {
                      var keepCount = Math.max(1, Math.round(Array.from(visited).length * severity));
            var kept = new Set();
            var nodeArr = Array.from(visited);
            // Keep the source and closest nodes            kept.add(startId);
            var sorted = nodeArr.filter(function(id) {
           return id !== startId;
 
        });
            sorted.sort(function(a, b) {
                          var distA = Math.floor(Math.random() * 100);
                var distB = Math.floor(Math.random() * 100);
                // Keep closer nodes first using BFS distance approach                return distA - distB;
            
        });
            for (var si = 0;
 si < Math.min(keepCount - 1, sorted.length);
 si++) {
                          kept.add(sorted[si]);
            
        }            visited = kept;
            simAffected = kept;
        
        }        simLinksSet = new Set();
        tiers.forEach(function(t) {
           t.forEach(function(nid) {
           resolvedLinks.forEach(function(l) {
                      var srcId = typeof l.source === 'object' ? l.source.id : l.source;
            var tgtId = typeof l.target === 'object' ? l.target.id : l.target;
            if (srcId === nid && visited.has(tgtId)) simLinksSet.add(l);
            if (tgtId === nid && visited.has(srcId)) simLinksSet.add(l);
        
        });
 
        });
 
        });
        var btn = document.getElementById('btn-simulate');
        btn.classList.add('shake');
        setTimeout(function() {
           btn.classList.remove('shake');
 
        }, 400);
        // Flash overlay        flashOverlay.classList.add('visible');
        setTimeout(function() {
           flashOverlay.classList.remove('visible');
 
        }, 600);
        // Show cascade counter        var counterEl = document.getElementById('cascade-counter');
        counterEl.classList.add('visible');
        updateCascadeCounter(visited);
        // Wave-based propagation        var totalDelay = 0;
        var cumulativeAffected = new Set();
        tiers.forEach(function(tierNodes, depth) {
                      var delay = depth === 0 ? 200 : depth * 600;
            totalDelay = delay + 600;
            setTimeout(function() {
                          // Flash edges for this tier first                if (tierEdges[depth]) {
                              tierEdges[depth].forEach(function(e) {
                                  d3.selectAll('.link-base').filter(function(d) {
                                      var srcId = typeof d.source === 'object' ? d.source.id : d.source;
                            var tgtId = typeof d.target === 'object' ? d.target.id : d.target;
                            var es = typeof e.source === 'object' ? e.source.id : e.source;
                            var et = typeof e.target === 'object' ? e.target.id : e.target;
                            return srcId === es && tgtId === et;
                        
        }).classed('sim-affected', true);
                    
        });
                
        }                // Then mark nodes                setTimeout(function() {
                              tierNodes.forEach(function(nid) {
                                  cumulativeAffected.add(nid);
                        d3.selectAll('.node-base').filter(function(d) {
           return d.id === nid;
 
        })                            .classed('sim-affected', true);
                    
        });
                    updateCascadeCounter(cumulativeAffected);
                
        }, 200);
            
        }, delay);
        
        });
        // Show report after all waves        setTimeout(function() {
                      showSimulationReport(startId, visited, Array.from(simLinksSet));
            counterEl.classList.remove('visible');
        
        }, totalDelay + 1000);
    
        }    function updateCascadeCounter(affectedSet) {
                  var rev = 0;
        affectedSet.forEach(function(id) {
                      var n = nodeMap[id];
            if (n && n.revenue) rev += n.revenue;
        
        });
        document.getElementById('cc-nodes').textContent = affectedSet.size;
        document.getElementById('cc-revenue').textContent = '$' + rev.toLocaleString();
    
        }    function showSimulationReport(startId, visited, affectedEdges) {
                  // Compute revenue exposure from program nodes        var revenueExposed = 0;
        visited.forEach(function(id) {
                      var n = nodeMap[id];
            if (n && n.type === 'program' && n.revenue) revenueExposed += n.revenue;
        
        });
        // Also include any nodes that have revenue field        visited.forEach(function(id) {
                      var n = nodeMap[id];
            if (n && n.revenue && n.type !== 'program') revenueExposed += n.revenue;
        
        });
        var supplierCount = 0;
        visited.forEach(function(id) {
                      if (nodeMap[id] && nodeMap[id].type === 'supplier') supplierCount++;
        
        });
        var compCount = 0;
        visited.forEach(function(id) {
                      if (nodeMap[id] && nodeMap[id].type === 'component') compCount++;
        
        });
        var affectedArr = Array.from(visited);
        var reportHtml = '<div class="modal-item"><span class="mi-label">Failure Source</span><span class="mi-val negative">' + startId + '</span></div>';
        reportHtml += '<div class="modal-item"><span class="mi-label">Total Affected Nodes</span><span class="mi-val negative">' + affectedArr.length + '</span></div>';
        reportHtml += '<div class="modal-item"><span class="mi-label">Affected Suppliers</span><span class="mi-val">' + supplierCount + '</span></div>';
        reportHtml += '<div class="modal-item"><span class="mi-label">Affected Components</span><span class="mi-val">' + compCount + '</span></div>';
        reportHtml += '<div class="modal-item"><span class="mi-label">Revenue Exposure</span><span class="mi-val negative">$' + revenueExposed.toLocaleString() + '</span></div>';
        reportHtml += '<div class="modal-item"><span class="mi-label">Cascade Depth</span><span class="mi-val">' + (affectedArr.length > 1 ? Math.ceil(Math.log2(affectedArr.length)) : 0) + ' levels</span></div>';
        document.getElementById('sim-report-desc').textContent = 'This is what happens when "' + startId.replace('_t', '') + '" fails.';
        document.getElementById('sim-report-details').innerHTML = reportHtml;
        var modal = document.getElementById('modal-simulation');
        modal.classList.add('visible');
        var modalContent = document.getElementById('modal-sim-content');
        modalContent.classList.remove('shake');
        void modalContent.offsetWidth;
        modalContent.classList.add('shake');
        // Show inline result        var simResult = document.getElementById('sim-result');
        simResult.innerHTML = '<div class="sr-title">⚠ Cascade Complete</div>';
        simResult.innerHTML += '<div class="sr-stat"><span>Affected Nodes</span><span class="val">' + affectedArr.length + '</span></div>';
        simResult.innerHTML += '<div class="sr-stat"><span>Revenue Exposed</span><span class="val">$' + revenueExposed.toLocaleString() + '</span></div>';
        simResult.classList.add('visible');
        notify('Cascade complete: ' + affectedArr.length + ' nodes affected. Total exposed: $' + revenueExposed.toLocaleString(), affectedArr.length > 3 ? 'error' : 'success');
        // Add Dual-Program Impact Heatmap        var heatContent = enhanceSimulationReport(startId, visited);
        document.getElementById('sim-report-details').innerHTML += heatContent;
                // Also show recovery gantt in the right panel        var ganttEl = document.getElementById('gantt-overlay');
        if (ganttEl) {
                      var maxDays = 30;
            var ganttItems = [                {
           label: 'Re-tooling', days: 14, cls: 'retool' 
        },                {
           label: 'Re-certification', days: 30, cls: 'recert' 
        },                {
           label: 'Design Validation', days: 21, cls: 'design' 
        },                {
           label: 'Logistics Setup', days: 10, cls: 'logistics' 
        }            ];
            var gHtml = '<div class="gantt-title">Estimated Recovery Timeline</div>';
            ganttItems.forEach(function(g) {
                          var pct = (g.days / maxDays) * 100;
                gHtml += '<div class="gantt-row"><span class="gantt-label">' + g.label + '</span><div class="gantt-track"><div class="gantt-bar ' + g.cls + '" style="width:' + pct + '%;
animation-delay:0.2s;
"></div></div><span class="gantt-days">' + g.days + 'd</span></div>';
            
        });
            gHtml += '<div style="font-size:0.6rem;
color:var(--text-3);
margin-top:6px;
text-align:center;
">⏱ Estimated recovery: ~' + maxDays + ' days to full operation</div>';
            ganttEl.innerHTML = gHtml;
            ganttEl.style.display = 'block';
        
        }        // Apply domino physics        applyDominoPhysics(startId);
        // Generate action plan        generateActionPlan(startId, visited, affectedEdges);
        updateHeaderStatus();
    
        }    function clearSimulation(showNotification) {
                  simAffected = new Set();
        simLinksSet = new Set();
        // Cool-down: remove class and let CSS transition handle the fade        d3.selectAll('.node-base').classed('sim-affected', false);
        d3.selectAll('.link-base').classed('sim-affected', false);
        document.getElementById('sim-result').classList.remove('visible');
        document.getElementById('sim-result').innerHTML = '';
        document.getElementById('sim-result').style.border = null;
        document.getElementById('sim-result').style.background = null;
        // Hide gantt and sourcing popup        var ganttEl = document.getElementById('gantt-overlay');
        if (ganttEl) ganttEl.style.display = 'none';
        var sourcingEl = document.getElementById('sourcing-popup');
        if (sourcingEl) sourcingEl.style.display = 'none';
        // Clear action plan        var apc = document.getElementById('action-plan-container');
        if (apc) apc.innerHTML = '';
        // Clear domino physics timer and restore        if (dominoRecoveryTimer) {
           clearTimeout(dominoRecoveryTimer);
 dominoRecoveryTimer = null;
 
        }        restoreOriginalPositions();
        d3.selectAll('.link-base').style('stroke-opacity', null);
        if (window.__sim) window.__sim.alpha(0.2).restart();
        if (showNotification !== false) {
                      notify('Scenario reset. Network recovering...', 'success');
        
        }        updateHeaderStatus();
    
        }    // ===== RESILIENCE SCORE =====    function calculateResilience() {
                  var score = 100;
        var penalties = [];
        var bonuses = [];
        var suggestions = [];
        var compSuppliers = {
          
        };
        resolvedLinks.forEach(function(l) {
                      if (l.type === 'manufactures') {
                          var tgtId = typeof l.target === 'object' ? l.target.id : l.target;
                compSuppliers[tgtId] = (compSuppliers[tgtId] || 0) + 1;
            
        }        
        });
        var singleSource = 0;
        nodes.forEach(function(n) {
                      if (n.type === 'component' && compSuppliers[n.id] && compSuppliers[n.id] < 2) {
                          singleSource++;
            
        }        
        });
        if (singleSource > 0) {
                      var p = Math.min(singleSource * 6, 30);
            score -= p;
            penalties.push({
           label: 'Single-source components (' + singleSource + ')', value: '-' + p 
        });
        
        }        var hasOutgoing = {
          
        };
        resolvedLinks.forEach(function(l) {
                      var srcId = typeof l.source === 'object' ? l.source.id : l.source;
            hasOutgoing[srcId] = true;
        
        });
        var isolated = nodes.filter(function(n) {
           return !hasOutgoing[n.id] && n.type !== 'region';
 
        });
        if (isolated.length > 0) {
                      var p = Math.min(isolated.length * 4, 16);
            score -= p;
            penalties.push({
           label: 'Isolated nodes (' + isolated.length + ')', value: '-' + p 
        });
        
        }        var highRiskSuppliers = nodes.filter(function(n) {
           return n.type === 'supplier' && (n.risk + (boostedRisks[n.id] || 0) * 10) > 70;
 
        });
        if (highRiskSuppliers.length > 0) {
                      var p = highRiskSuppliers.length * 8;
            score -= p;
            penalties.push({
           label: 'High-risk suppliers (' + highRiskSuppliers.length + ')', value: '-' + p 
        });
        
        }        var zeroStock = nodes.filter(function(n) {
           return n.type === 'component' && n.qty === 0;
 
        });
        if (zeroStock.length > 0) {
                      var p = zeroStock.length * 5;
            score -= p;
            penalties.push({
           label: 'Zero-stock components (' + zeroStock.length + ')', value: '-' + p 
        });
        
        }        var facilityRegions = {
          
        };
        resolvedLinks.forEach(function(l) {
                      if (l.type === 'located_in') {
                          var srcId = typeof l.source === 'object' ? l.source.id : l.source;
                var tgtId = typeof l.target === 'object' ? l.target.id : l.target;
                if (!facilityRegions[tgtId]) facilityRegions[tgtId] = [];
                facilityRegions[tgtId].push(srcId);
            
        }        
        });
        Object.keys(facilityRegions).forEach(function(region) {
                      if (facilityRegions[region].length > 1) {
                          var p = 5;
                score -= p;
                penalties.push({
           label: 'Geographic concentration (' + region.replace('_t', '') + ': ' + facilityRegions[region].length + ' facilities)', value: '-' + p 
        });
            
        }        
        });
        var downstream = {
          
        };
        resolvedLinks.forEach(function(l) {
                      var srcId = typeof l.source === 'object' ? l.source.id : l.source;
            var tgtId = typeof l.target === 'object' ? l.target.id : l.target;
            if (!downstream[srcId]) downstream[srcId] = [];
            downstream[srcId].push(tgtId);
        
        });
        var highRiskSupplierIds = new Set(highRiskSuppliers.map(function(n) {
           return n.id;
 
        }));
        var highRiskPrograms = 0;
        nodes.forEach(function(n) {
                      if (n.type === 'program') {
                          var visited = new Set();
                var q = [n.id];
                var found = false;
                while (q.length > 0 && !found) {
                              var cur = q.shift();
                    if (visited.has(cur)) continue;
                    visited.add(cur);
                    if (highRiskSupplierIds.has(cur)) {
           found = true;
 break;
 
        }                    resolvedLinks.forEach(function(l) {
                                  var srcId = typeof l.source === 'object' ? l.source.id : l.source;
                        var tgtId = typeof l.target === 'object' ? l.target.id : l.target;
                        if (tgtId === cur && !visited.has(srcId)) q.push(srcId);
                    
        });
                
        }                if (found) highRiskPrograms++;
            
        }        
        });
        if (highRiskPrograms > 0) {
                      var p = highRiskPrograms * 10;
            score -= p;
            penalties.push({
           label: 'High-risk programs (' + highRiskPrograms + ')', value: '-' + p 
        });
        
        }        // Certification penalties        var certPenalties = getCertificationPenalties();
        score -= certPenalties.penaltyScore;
        certPenalties.penalties.forEach(function(cp) {
                      penalties.push({
           label: 'Cert: ' + cp.label, value: cp.value 
        });
        
        });
        // BONUSES        var multiSource = 0;
        Object.keys(compSuppliers).forEach(function(k) {
                      if (compSuppliers[k] > 1) multiSource++;
        
        });
        if (multiSource > 0) {
                      var b = multiSource * 4;
            score += b;
            bonuses.push({
           label: 'Alternate suppliers (' + multiSource + ' components)', value: '+' + b 
        });
        
        }        var warehouseNodes = nodes.filter(function(n) {
           return n.type === 'warehouse' && n.weeklyDemand && n.qty;
 
        });
        var buffered = 0;
        warehouseNodes.forEach(function(w) {
                      var days = w.qty / (w.weeklyDemand / 7);
            if (days > 30) buffered++;
        
        });
        if (buffered > 0) {
                      var b = buffered * 5;
            score += b;
            bonuses.push({
           label: 'Buffer stock >30 days (' + buffered + ' warehouses)', value: '+' + b 
        });
        
        }        var healthy = nodes.filter(function(n) {
           return n.type === 'component' && n.qty >= n.reorder;
 
        }).length;
        if (healthy > 0) {
                      var b = healthy * 3;
            score += b;
            bonuses.push({
           label: 'Healthy stock components (' + healthy + ')', value: '+' + b 
        });
        
        }        var progCount = nodes.filter(function(n) {
           return n.type === 'program';
 
        }).length;
        if (progCount > 1) {
                      var b = 5;
            score += b;
            bonuses.push({
           label: 'Multiple programs (' + progCount + ')', value: '+' + b 
        });
        
        }        score = Math.max(0, Math.min(100, Math.round(score)));
        if (singleSource > 0) suggestions.push('Qualify alternate suppliers for ' + singleSource + ' single-source components to reduce vulnerability.');
        if (highRiskSuppliers.length > 0) suggestions.push('Review relationships with ' + highRiskSuppliers.length + ' high-risk supplier(s) (risk > 70). Consider diversification.');
        if (isolated.length > 0) suggestions.push('Connect ' + isolated.length + ' isolated node(s) to the broader network for better visibility.');
        if (zeroStock.length > 0) suggestions.push('Restock ' + zeroStock.length + ' component(s) with zero inventory immediately.');
        if (buffered === 0 && warehouseNodes.length > 0) suggestions.push('Increase warehouse buffer stock to >30 days coverage.');
        if (multiSource === 0) suggestions.push('Consider dual-sourcing key components to reduce single-point-of-failure risk.');
        if (healthy < 3) suggestions.push('Review reorder points for components with stock below threshold.');
        return {
           score: score, penalties: penalties, bonuses: bonuses, suggestions: suggestions 
        };
    
        }    function updateResilience() {
                  var result = calculateResilience();
        var score = result.score;
        var ring = document.getElementById('score-ring');
        var numEl = document.getElementById('score-number');
        var circumference = 2 * Math.PI * 52;
        var offset = circumference - (score / 100) * circumference;
        // Overshoot: briefly advance past the target then snap back        ring.style.transition = 'none';
        ring.style.strokeDashoffset = Math.max(0, offset - 8);
        void ring.offsetWidth;
        ring.style.transition = 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        ring.style.strokeDashoffset = offset;
        // Animate count-up        var displayScore = 0;
        var interval = setInterval(function() {
                      displayScore++;
            numEl.textContent = displayScore;
            if (displayScore >= score) {
                          clearInterval(interval);
                // Bounce on completion                numEl.classList.add('bounce-update');
                setTimeout(function() {
           numEl.classList.remove('bounce-update');
 
        }, 500);
            
        }        
        }, 15);
        // Subtext        var sub = document.getElementById('score-sub');
        if (score >= 80) sub.textContent = 'Strong resilience';
        else if (score >= 60) sub.textContent = 'Moderate resilience';
        else if (score >= 40) sub.textContent = 'Fragile — needs attention';
        else sub.textContent = 'Critical — immediate action needed';
        // Trend indicator        var trendEl = document.getElementById('trend-indicator');
        if (prevResilienceScore !== null) {
                      if (score < prevResilienceScore) {
                          trendEl.className = 'trend-indicator declining';
                trendEl.innerHTML = '▼ Declining';
            
        } else if (score > prevResilienceScore) {
                          trendEl.className = 'trend-indicator stable';
                trendEl.innerHTML = '▲ Improving';
            
        } else {
                          trendEl.className = 'trend-indicator stable';
                trendEl.innerHTML = '▲ Stable';
            
        }        
        }        prevResilienceScore = score;
        // Factors list        var list = document.getElementById('score-factors-list');
        var html = '';
        result.penalties.forEach(function(p) {
                      html += '<li><span class="s-negative">' + p.label + '</span><span class="s-negative">' + p.value + '</span></li>';
        
        });
        result.bonuses.forEach(function(b) {
                      html += '<li><span class="s-positive">' + b.label + '</span><span class="s-positive">' + b.value + '</span></li>';
        
        });
        if (html === '') {
                      html = '<li><span class="s-neutral">No significant factors</span><span></span></li>';
        
        }        html += '<li style="border-top:1px solid rgba(255,255,255,0.06);
padding-top:6px;
margin-top:4px;
"><span style="font-weight:600;
color:var(--text-1);
">Final Score</span><span style="font-weight:700;
color:' + (score >= 60 ? 'var(--green)' : 'var(--red)') + '">' + score + '</span></li>';
        list.innerHTML = html;
        updateHeaderStatus();
    
        }    // ===== RESILIENCE MODAL =====    function openResilienceModal() {
                  var result = calculateResilience();
        var penaltiesHtml = result.penalties.length > 0 ? '' : '<p style="color:var(--green);
font-size:0.8rem;
">No penalties applied.</p>';
        result.penalties.forEach(function(p) {
                      penaltiesHtml += '<div class="modal-item"><span class="mi-label">' + p.label + '</span><span class="mi-val negative">' + p.value + '</span></div>';
        
        });
        var bonusesHtml = result.bonuses.length > 0 ? '' : '<p style="color:var(--text-2);
font-size:0.8rem;
">No bonuses applied.</p>';
        result.bonuses.forEach(function(b) {
                      bonusesHtml += '<div class="modal-item"><span class="mi-label">' + b.label + '</span><span class="mi-val positive">' + b.value + '</span></div>';
        
        });
        var suggestionsHtml = result.suggestions.length > 0 ? '' : '<p style="color:var(--text-2);
font-size:0.8rem;
">No specific suggestions.</p>';
        result.suggestions.forEach(function(s) {
                      suggestionsHtml += '<div class="mi-suggestion">' + s + '</div>';
        
        });
        penaltiesHtml += '<div class="modal-item" style="border-top:1px solid rgba(255,255,255,0.06);
padding-top:8px;
margin-top:4px;
"><span class="mi-label" style="font-weight:600;
color:var(--text-1);
">Final Resilience Score</span><span class="mi-val" style="font-weight:700;
color:' + (result.score >= 60 ? 'var(--green)' : 'var(--red)') + '">' + result.score + '/100</span></div>';
        document.getElementById('modal-penalties').innerHTML = penaltiesHtml;
        document.getElementById('modal-bonuses').innerHTML = bonusesHtml;
        document.getElementById('modal-suggestions').innerHTML = suggestionsHtml;
        document.getElementById('modal-resilience').classList.add('visible');
    
        }    // ===== SUPPLIER PROFILE =====    function openSupplierProfile(node) {
                  if (!node || node.type !== 'supplier') return;
        var p = node.profile || {
           badges: [], creditScore: 50, creditLabel: 'Unknown', lastAudit: '—', lastAuditResult: '—', nextAuditDue: '—', riskFlags: [], preVetted: false 
        };
        document.getElementById('sp-name').textContent = node.id.replace('_t', '');
        // Watchlist star        var starEl = document.getElementById('sp-star');
        var inWatchlist = watchlist.indexOf(node.id) >= 0;
        starEl.textContent = inWatchlist ? '★' : '☆';
        starEl.className = 'watchlist-star' + (inWatchlist ? 'active' : '');
        starEl.onclick = function(e) {
           e.stopPropagation();
 toggleWatchlist(node.id);
 var nw = watchlist.indexOf(node.id) >= 0;
 starEl.textContent = nw ? '★' : '☆';
 starEl.className = 'watchlist-star' + (nw ? 'active' : '');
 
        };
        // Sparkline        var sparkWrap = document.getElementById('sp-sparkline-wrap');
        if (supplierRiskHistory[node.id]) {
                      sparkWrap.style.display = 'block';
            renderSparkline('sp-sparkline', supplierRiskHistory[node.id]);
        
        } else {
                      sparkWrap.style.display = 'none';
        
        }        var riskBadge = document.getElementById('sp-risk-badge');
        if (node.risk > 70) {
           riskBadge.textContent = 'Risk: ' + node.risk + '/100';
 riskBadge.style.background = 'rgba(229,62,62,0.15)';
 riskBadge.style.color = 'var(--red)';
 riskBadge.style.border = '1px solid rgba(229,62,62,0.2)';
 
        }        else if (node.risk > 30) {
           riskBadge.textContent = 'Risk: ' + node.risk + '/100';
 riskBadge.style.background = 'rgba(192,86,33,0.15)';
 riskBadge.style.color = 'var(--amber)';
 riskBadge.style.border = '1px solid rgba(192,86,33,0.2)';
 
        }        else {
           riskBadge.textContent = 'Risk: ' + node.risk + '/100';
 riskBadge.style.background = 'rgba(72,187,120,0.12)';
 riskBadge.style.color = '#48BB78';
 riskBadge.style.border = '1px solid rgba(72,187,120,0.2)';
 
        }        document.getElementById('sp-subtitle').textContent = 'Supplier qualification profile. ' + (p.preVetted ? 'This supplier is pre‑vetted by AKSCI.' : 'Manual verification recommended.');
        // Badges        var badgesEl = document.getElementById('sp-badges');
        var badgeMap = {
           'DFARS Ready': 'dfars', 'ITAR Compliant': 'itar', 'CMMC Level 2': 'cmmc', 'ISO 9001': 'iso', 'AS9100': 'as9100' 
        };
        badgesEl.innerHTML = p.badges.length > 0 ? p.badges.map(function(b) {
           return '<span class="profile-badge ' + (badgeMap[b] || 'dfars') + '">' + b + '</span>';
 
        }).join('') : '<span style="font-size:0.7rem;
color:var(--text-2);
">No compliance certifications on file</span>';
        // Financial health        var finEl = document.getElementById('sp-financial');
        var finColor = p.creditScore >= 80 ? 'green' : p.creditScore >= 60 ? 'yellow' : 'red';
        finEl.innerHTML = '<span style="min-width:70px;
">Score: ' + p.creditScore + '/100</span><div class="fhb-track"><div class="fhb-fill ' + finColor + '" style="width:' + p.creditScore + '%"></div></div><span>' + p.creditLabel + '</span>';
        // Audit history        var auditEl = document.getElementById('sp-audit');
        var passClass = p.lastAuditResult.indexOf('Pass') >= 0 ? 'pass' : '';
        auditEl.innerHTML = '<div class="profile-audit-row"><span class="par-label">Last Audit</span><span class="par-val ' + passClass + '">' + p.lastAudit + ' — ' + p.lastAuditResult + '</span></div><div class="profile-audit-row"><span class="par-label">Next Audit Due</span><span class="par-val due">' + p.nextAuditDue + '</span></div>';
        // Risk flags        var flagsEl = document.getElementById('sp-risk-flags');
        flagsEl.innerHTML = p.riskFlags.length > 0 ? p.riskFlags.map(function(f) {
                      var cls = f.indexOf('Single') >= 0 ? 'critical' : 'warning';
            return '<span class="profile-risk-flag ' + cls + '"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' + f + '</span>';
        
        }).join('') : '<span style="font-size:0.7rem;
color:var(--green);
">No active risk flags</span>';
        // Pre-vetted badge        var pvEl = document.getElementById('sp-prevetted');
        if (p.preVetted) {
                      pvEl.style.display = 'block';
            pvEl.innerHTML = '<span class="profile-badge preview">✓ Pre‑Vetted by AKSCI</span><p style="font-size:0.72rem;
color:var(--text-2);
margin-top:6px;
line-height:1.5;
">This supplier has passed AKSCI\'s independent compliance audit. Certification documents are on file and verified quarterly.</p>';
        
        } else {
                      pvEl.style.display = 'none';
        
        }        document.getElementById('modal-supplier-profile').classList.add('visible');
    
        }    window.openSupplierProfile = openSupplierProfile;
    // ===== INVENTORY =====    function buildInventory(warehouseFilter) {
                  var tbody = document.getElementById('inv-table-body');
        var html = '';
        var compSupplierMap = {
          
        };
        resolvedLinks.forEach(function(l) {
                      if (l.type === 'manufactures') {
                          var srcId = typeof l.source === 'object' ? l.source.id : l.source;
                var tgtId = typeof l.target === 'object' ? l.target.id : l.target;
                compSupplierMap[tgtId] = srcId;
            
        }        
        });
        var compWarehouseMap = {
          
        };
        resolvedLinks.forEach(function(l) {
                      if (l.type === 'ships_to' && l.source.type === 'warehouse') {
                          var srcId = typeof l.source === 'object' ? l.source.id : l.source;
                var tgtId = typeof l.target === 'object' ? l.target.id : l.target;
                compWarehouseMap[tgtId] = srcId;
            
        }        
        });
        var items = [];
        nodes.forEach(function(n) {
                      if (n.type === 'component') {
                          var supplier = compSupplierMap[n.id] || '—';
                var wh = compWarehouseMap[n.id] || '—';
                items.push({
           id: n.id, type: 'Component', qty: n.qty || 0, reorder: n.reorder || 0, risk: null, bufferDays: null, supplier: supplier, warehouse: wh 
        });
            
        }        
        });
        nodes.forEach(function(n) {
                      if (n.type === 'warehouse') {
                          var bufDays = n.weeklyDemand ? Math.round(n.qty / (n.weeklyDemand / 7)) : null;
                items.push({
           id: n.id, type: 'Warehouse', qty: n.qty || 0, reorder: n.reorder || 0, risk: null, bufferDays: bufDays, supplier: '—', warehouse: n.warehouse || n.id 
        });
            
        }        
        });
        nodes.forEach(function(n) {
                      if (n.type === 'assembly') {
                          items.push({
           id: n.id, type: 'Assembly', qty: '—', reorder: '—', risk: null, bufferDays: null, supplier: '—', warehouse: '—' 
        });
            
        }        
        });
        var filtered = warehouseFilter === 'all' ? items : items.filter(function(item) {
           return item.warehouse === warehouseFilter || item.warehouse.indexOf(warehouseFilter) >= 0;
 
        });
        var lowStock = 0, zeroStock = 0, totalQty = 0, totalBuffer = 0, bufferCount = 0;
        filtered.forEach(function(item, idx) {
                      var riskHtml = '—';
            var node = nodeMap[item.id];
            var nodeRisk = null;
            if (node && node.risk !== undefined) nodeRisk = node.risk;
            if (nodeRisk !== null) {
                          var rClass = nodeRisk > 70 ? 'risk-high' : nodeRisk > 30 ? 'risk-med' : 'risk-low';
                riskHtml = '<span class="' + rClass + '">' + nodeRisk + '</span>';
            
        }            var supplierHtml = '—';
            if (item.supplier !== '—') {
                          supplierHtml = '<a href="#" class="inv-supplier-link" data-supplier-id="' + item.supplier + '" style="color:var(--cyan);
cursor:pointer;
">' + item.supplier + '</a>';
            
        } else if (item.type === 'Assembly') {
                          var comps = [];
                resolvedLinks.forEach(function(l) {
                              var tgtId = typeof l.target === 'object' ? l.target.id : l.target;
                    if (tgtId === item.id && l.type === 'supplies') {
                                  var srcId = typeof l.source === 'object' ? l.source.id : l.source;
                        comps.push(compSupplierMap[srcId] || srcId);
                    
        }                
        });
                if (comps.length > 0) supplierHtml = comps.join(', ');
            
        }            var qtyStr = typeof item.qty === 'number' ? item.qty.toString() : item.qty;
            if (item.type === 'Component' && typeof item.qty === 'number') {
                          if (item.qty === 0) zeroStock++;
                else if (item.qty < item.reorder) lowStock++;
                if (typeof item.qty === 'number') totalQty += item.qty;
            
        }            if (item.bufferDays !== null) {
                          totalBuffer += item.bufferDays;
                bufferCount++;
            
        }            var bufHtml = '—';
            if (item.bufferDays !== null) bufHtml = item.bufferDays + ' days';
            else if (item.type === 'Component' && typeof item.qty === 'number' && item.reorder !== '—') {
                          bufHtml = '~' + Math.round(item.qty / 10) + ' days';
            
        }            var reorderStr = typeof item.reorder === 'number' ? item.reorder.toString() : item.reorder;
            var qtyClass = '';
            if (item.type === 'Component' && typeof item.qty === 'number') {
                          if (item.qty === 0) qtyClass = 'stock-low';
                else if (item.qty < item.reorder) qtyClass = 'stock-low';
                else qtyClass = 'stock-ok';
            
        }            var delay = idx * 0.04;
            html += '<tr style="animation-delay:' + delay + 's">' +                '<td class="cell-editable">' + item.id + '</td>' +                '<td class="cell-editable">' + item.type + '</td>' +                '<td class="cell-editable ' + qtyClass + '">' + qtyStr + '</td>' +                '<td class="cell-editable">' + reorderStr + '</td>' +                '<td>' + riskHtml + '</td>' +                '<td class="cell-editable">' + bufHtml + '</td>' +                '<td class="cell-editable">' + supplierHtml + '</td>' +                '<td class="cell-editable">' + item.warehouse + '</td>' +                '</tr>';
        
        });
        tbody.innerHTML = html;
        document.getElementById('if-total').textContent = filtered.length;
        document.getElementById('if-low').textContent = lowStock;
        document.getElementById('if-zero').textContent = zeroStock;
        document.getElementById('if-buffer').textContent = bufferCount > 0 ? Math.round(totalBuffer / bufferCount) : '—';
        // Critical alerts banner        var banner = document.getElementById('inv-critical-banner');
        var totalAlerts = zeroStock + lowStock;
        if (totalAlerts > 0) {
                      var parts = [];
            if (zeroStock > 0) parts.push(zeroStock + ' Zero Stock');
            if (lowStock > 0) parts.push(lowStock + ' Low Stock');
            banner.innerHTML = '⚠ ' + totalAlerts + ' CRITICAL ALERTS: ' + parts.join(' · ') + ' — Immediate action required';
            banner.classList.add('visible');
        
        } else {
                      banner.classList.remove('visible');
        
        }    
        }    // ===== NOTIFICATIONS =====    function notify(msg, type) {
                  var container = document.getElementById('notification-container');
        var el = document.createElement('div');
        el.className = 'notification' + (type ? ' ' + type : '');
        el.textContent = msg;
        container.appendChild(el);
        setTimeout(function() {
                      if (el.parentNode) el.parentNode.removeChild(el);
        
        }, 3500);
    
        }    // ===== EASTER EGG: DESTRUCTION MODE =====    function handleDestructionClick() {
                  if (isDestroying) return;
        destructionClickCount++;
        if (destructionTimer) clearTimeout(destructionTimer);
        destructionTimer = setTimeout(function() {
                      destructionClickCount = 0;
        
        }, 3000);
        if (destructionClickCount >= 5) {
                      triggerDestructionMode();
        
        }    
        }    function triggerDestructionMode() {
                  isDestroying = true;
        destructionClickCount = 0;
        // Flash overlay        flashOverlay.classList.add('destroy');
        // Scatter nodes        var dim = getDimensions();
        nodes.forEach(function(n) {
                      n.x = Math.random() * dim.w;
            n.y = Math.random() * dim.h;
        
        });
        simulation.alpha(1).restart();
        // Score drops to 0        var numEl = document.getElementById('score-number');
        var ring = document.getElementById('score-ring');
        var circumference = 2 * Math.PI * 52;
        var countdown = 0;
        var dropInterval = setInterval(function() {
                      countdown++;
            numEl.textContent = Math.max(0, 100 - countdown * 5);
            var offset = circumference - (Math.max(0, 100 - countdown * 5) / 100) * circumference;
            ring.style.strokeDashoffset = offset;
            if (countdown >= 20) {
                          clearInterval(dropInterval);
                numEl.textContent = '0';
            
        }        
        }, 30);
        setTimeout(function() {
                      // Reset everything            flashOverlay.classList.remove('destroy');
            isDestroying = false;
            // Rebuild graph            var dim2 = getDimensions();
            simulation.force('center', d3.forceCenter(dim2.w / 2, dim2.h / 2));
            simulation.alpha(0.5).restart();
            // Recalculate resilience            prevResilienceScore = null;
            updateResilience();
            notify('Just kidding — but this is what a real cascade looks like. Deploy to prevent it.', 'error');
        
        }, 2500);
    
        }    // ===== KEYBOARD SHORTCUTS =====    document.addEventListener('keydown', function(e) {
                  if (e.key === '?') {
                      e.preventDefault();
            toggleModal('modal-shortcuts');
        
        }        if (e.key === 'Escape') {
                      var sb = document.getElementById('search-bar');
            if (sb && document.activeElement === sb) {
                          sb.value = '';
                sb.dispatchEvent(new Event('input'));
                sb.blur();
                return;
            
        }            closeAllOverlays();
        
        }        if ((e.key === 'i' || e.key === 'I') && document.activeElement.tagName !== 'INPUT') {
                      if (!document.getElementById('inventory-overlay').classList.contains('visible')) {
                          openInventory();
            
        }        
        }        if (e.key === 'r' || e.key === 'R') {
                      if (window.__zoom) {
                          svg.transition().duration(500).call(window.__zoom.transform, d3.zoomIdentity);
            
        }        
        }        if (e.key === 'f' || e.key === 'F') {
                      fitGraph();
        
        }        if (e.key === 'l' || e.key === 'L') {
                      toggleLabels();
        
        }        if (e.key === 'd' || e.key === 'D') {
                      e.preventDefault();
            toggle3D();
        
        }        if (e.key === 't' || e.key === 'T') {
                      e.preventDefault();
            toggleTierMode();
        
        }        if (e.key === 'h' || e.key === 'H') {
                      e.preventDefault();
            toggleHeatmap();
        
        }        if (e.key === 'c' || e.key === 'C') {
                      e.preventDefault();
            toggleCertMode();
        
        }        if (e.key === '+' || e.key === '=') {
                      if (window.__zoom) svg.transition().duration(200).call(window.__zoom.scaleBy, 1.3);
        
        }        if (e.key === '-') {
                      if (window.__zoom) svg.transition().duration(200).call(window.__zoom.scaleBy, 0.7);
        
        }    
        });
    // ===== MODAL UTILS =====    function toggleModal(id) {
                  var el = document.getElementById(id);
        el.classList.toggle('visible');
    
        }    function closeAllOverlays() {
                  document.querySelectorAll('.modal-overlay.visible').forEach(function(el) {
                      el.classList.remove('visible');
        
        });
        document.getElementById('inventory-overlay').classList.remove('visible');
    
        }    // ===== INVENTORY OPEN/CLOSE =====    function openInventory() {
                  document.getElementById('inventory-overlay').classList.add('visible');
        buildInventory('all');
        // Supplier profile links in inventory table        document.getElementById('inv-table-body').onclick = function(e) {
                      var link = e.target.closest('.inv-supplier-link');
            if (link && link.dataset.supplierId) {
                          e.preventDefault();
                var sn = nodeMap[link.dataset.supplierId];
                if (sn) openSupplierProfile(sn);
            
        }        
        };
    
        }    // ===== GRAPH TOOLBAR =====    function zoomIn() {
                  if (window.__zoom) svg.transition().duration(200).call(window.__zoom.scaleBy, 1.3);
    
        }    function zoomOut() {
                  if (window.__zoom) svg.transition().duration(200).call(window.__zoom.scaleBy, 0.7);
    
        }    function resetView() {
                  if (window.__zoom) svg.transition().duration(500).call(window.__zoom.transform, d3.zoomIdentity);
    
        }    function fitGraph() {
                  if (!window.__zoom) return;
        var dim = getDimensions();
        var xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
        nodes.forEach(function(n) {
                      if (n.x < xMin) xMin = n.x;
            if (n.x > xMax) xMax = n.x;
            if (n.y < yMin) yMin = n.y;
            if (n.y > yMax) yMax = n.y;
        
        });
        var pad = 60;
        var bw = xMax - xMin + pad * 2;
        var bh = yMax - yMin + pad * 2;
        var scale = Math.min(dim.w / bw, dim.h / bh, 2);
        var tx = dim.w / 2 - (xMin + xMax) / 2 * scale;
        var ty = dim.h / 2 - (yMin + yMax) / 2 * scale;
        svg.transition().duration(500).call(window.__zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
    
        }    function toggleLabels() {
                  labelsVisible = !labelsVisible;
        d3.selectAll('.label-base').transition().duration(200).attr('opacity', labelsVisible ? 0.7 : 0);
        document.getElementById('tb-labels').classList.toggle('active');
    
        }    // ===== RESILIENCE AUTO-RECALC =====    function startResilienceAutoRecalc() {
                  setInterval(function() {
                      var result = calculateResilience();
            var score = result.score;
            var numEl = document.getElementById('score-number');
            var ring = document.getElementById('score-ring');
            var circumference = 2 * Math.PI * 52;
            // Update ring            var offset = circumference - (score / 100) * circumference;
            ring.style.strokeDashoffset = offset;
            numEl.textContent = score;
            // Trend            var trendEl = document.getElementById('trend-indicator');
            if (prevResilienceScore !== null && score !== prevResilienceScore) {
                          if (score < prevResilienceScore) {
                              trendEl.className = 'trend-indicator declining';
                    trendEl.innerHTML = '▼ Declining';
                
        } else {
                              trendEl.className = 'trend-indicator stable';
                    trendEl.innerHTML = '▲ Improving';
                
        }                // Bounce on change                numEl.classList.add('bounce-update');
                setTimeout(function() {
           numEl.classList.remove('bounce-update');
 
        }, 500);
            
        }            prevResilienceScore = score;
            if (certificationMode) updateCertHealthPanel();
        
        }, 60000);
    
        }    // ===== 3D VIEW =====    function apply3DTransform(g) {
                  var angle = Math.PI / 4;
        var skew = Math.sin(Math.PI / 6);
        var cosA = Math.cos(angle), sinA = Math.sin(angle);
        var dim = getDimensions();
        g.attr('transform', 'matrix(' + cosA + ',' + sinA * skew + ',' + (-sinA) + ',' + cosA * skew + ',' + dim.w / 2 + ',' + dim.h / 3 + ')');
    
        }    function buildFloorGrid() {
                  if (floorGridGroup) {
           floorGridGroup.remove();
 floorGridGroup = null;
 
        }        floorGridGroup = zoomG.insert('g', ':first-child').attr('class', 'floor-grid');
        var dim = getDimensions(), spacing = 60, size = Math.max(dim.w, dim.h) * 2;
        for (var x = -size;
 x <= size;
 x += spacing) floorGridGroup.append('line').attr('x1', x).attr('y1', -size).attr('x2', x).attr('y2', size);
        for (var y = -size;
 y <= size;
 y += spacing) floorGridGroup.append('line').attr('x1', -size).attr('y1', y).attr('x2', size).attr('y2', y);
        floorGridGroup.attr('opacity', 0);
    
        }    function add3DShadows() {
                  if (shadowGroup) {
           shadowGroup.remove();
 shadowGroup = null;
 
        }        shadowGroup = zoomG.insert('g', ':first-child').attr('class', 'shadows');
        nodes.forEach(function(n) {
                      shadowGroup.append('ellipse').attr('class', 'shadow-ellipse')                .attr('cx', n.x).attr('cy', n.y)                .attr('rx', (NODE_SIZES[n.type] || 8) * 1.5)                .attr('ry', (NODE_SIZES[n.type] || 8) * 0.6).attr('opacity', 0);
        
        });
    
        }    function updateShadows() {
                  if (!shadowGroup) return;
        var shadowEls = shadowGroup.selectAll('ellipse');
        nodes.forEach(function(n, i) {
                      var el = shadowEls.nodes()[i];
            if (el) {
           var depth = NODE_DEPTH[n.type] || 2;
 d3.select(el).attr('cx', n.x + depth * 4).attr('cy', n.y + depth * 6);
 
        }        
        });
    
        }    function toggle3D() {
                  is3D = !is3D;
        document.getElementById('tb-3d').classList.toggle('active');
        if (is3D) {
                      buildFloorGrid();
 add3DShadows();
 apply3DTransform(zoomG);
            floorGridGroup.transition().duration(400).attr('opacity', 1);
            shadowGroup.selectAll('ellipse').transition().duration(400).attr('opacity', 1);
            d3.selectAll('.label-base').transition().duration(300).attr('opacity', 0.25);
        
        } else {
                      zoomG.attr('transform', null);
            if (floorGridGroup) {
           floorGridGroup.transition().duration(400).attr('opacity', 0).remove();
 floorGridGroup = null;
 
        }            if (shadowGroup) {
           shadowGroup.selectAll('ellipse').transition().duration(400).attr('opacity', 0).remove();
 shadowGroup = null;
 
        }            d3.selectAll('.label-base').transition().duration(300).attr('opacity', labelsVisible ? 0.7 : 0);
        
        }    
        }    // Update shadows on tick handled in simulation.on('tick')    // ===== DOMINO PHYSICS =====    function storeOriginalPositions() {
           nodes.forEach(function(n) {
           originalPositions[n.id] = {
           x: n.x, y: n.y, fx: n.fx, fy: n.fy 
        };
 
        });
 
        }    function restoreOriginalPositions() {
                  nodes.forEach(function(n) {
                      if (originalPositions[n.id]) {
           n.fx = originalPositions[n.id].fx;
 n.fy = originalPositions[n.id].fy;
 n.x = originalPositions[n.id].x;
 n.y = originalPositions[n.id].y;
 
        }        
        });
        if (window.__sim) window.__sim.alpha(0.3).restart();
    
        }    function applyDominoPhysics(sourceId) {
                  if (dominoRecoveryTimer) clearTimeout(dominoRecoveryTimer);
        storeOriginalPositions();
        var dist = {
          
        }, queue = [sourceId], visited = new Set();
        dist[sourceId] = 0;
        while (queue.length > 0) {
                      var cur = queue.shift();
            if (visited.has(cur)) continue;
            visited.add(cur);
            resolvedLinks.forEach(function(l) {
                          var srcId = typeof l.source === 'object' ? l.source.id : l.source;
                var tgtId = typeof l.target === 'object' ? l.target.id : l.target;
                if (srcId === cur && dist[tgtId] === undefined) {
           dist[tgtId] = dist[cur] + 1;
 queue.push(tgtId);
 
        }            
        });
        
        }        var sourceNode = nodeMap[sourceId];
        if (!sourceNode) return;
        nodes.forEach(function(n) {
                      if (n.id === sourceId) return;
            var d = dist[n.id] || 10;
            var angle = Math.atan2(n.y - sourceNode.y, n.x - sourceNode.x);
            n.fx = n.x + Math.cos(angle) * 8 / (d || 1);
            n.fy = n.y + Math.sin(angle) * 8 / (d || 1);
        
        });
        resolvedLinks.forEach(function(l) {
                      var srcId = typeof l.source === 'object' ? l.source.id : l.source;
            var tgtId = typeof l.target === 'object' ? l.target.id : l.target;
            if (dist[tgtId] !== undefined || dist[srcId] !== undefined) {
                          d3.selectAll('.link-base').filter(function(d) {
                              var s = typeof d.source === 'object' ? d.source.id : d.source;
                    var t = typeof d.target === 'object' ? d.target.id : d.target;
                    return (s === srcId && t === tgtId) || (s === tgtId && t === srcId);
                
        }).style('stroke-opacity', 0.08);
            
        }        
        });
        if (window.__sim) window.__sim.alpha(0.4).restart();
        dominoRecoveryTimer = setTimeout(function() {
                      restoreOriginalPositions();
            d3.selectAll('.link-base').style('stroke-opacity', null);
            if (window.__sim) window.__sim.alpha(0.2).restart();
        
        }, 2000);
    
        }    // ===== TICKER =====    var tickerEvents = [        {
           msg: 'Aerocast Inc_t: credit downgrade — risk now 90', type: 'critical', nodeId: 'Aerocast Inc_t' 
        },        {
           msg: 'Port of Long Beach_t: labor strike probability 65%', type: 'critical', nodeId: 'Port of Long Beach_t' 
        },        {
           msg: 'CeramicTech_t: raw material shortage — delivery delay expected', type: 'warning', nodeId: 'CeramicTech_t' 
        },        {
           msg: 'Asia-Pacific_t: typhoon warning — logistics at risk', type: 'critical', nodeId: 'Asia-Pacific_t' 
        },        {
           msg: 'FluidLogic_t: payment delay reported — monitor cash flow', type: 'warning', nodeId: 'FluidLogic_t' 
        },        {
           msg: 'WiredIn Solutions_t: tariff impact — cost exposure +12%', type: 'warning', nodeId: 'WiredIn Solutions_t' 
        },        {
           msg: 'NanoSense Inc_t: IP dispute — supply chain disruption possible', type: 'critical', nodeId: 'NanoSense Inc_t' 
        },        {
           msg: 'Singapore Buffer Stock_t: geopolitical risk — reroute advised', type: 'warning', nodeId: 'Singapore Buffer Stock_t' 
        },        {
           msg: 'Aerocast Inc_t: labor contract expiry — production at risk', type: 'warning', nodeId: 'Aerocast Inc_t' 
        },        {
           msg: 'Port of Rotterdam_t: customs delay — lead time +14 days', type: 'warning', nodeId: 'Port of Rotterdam_t' 
        },        {
           msg: 'CeramicTech_t: energy cost spike — price increase pending', type: 'warning', nodeId: 'CeramicTech_t' 
        },        {
           msg: 'FluidLogic_t: DFARS compliance re‑certification due', type: 'info', nodeId: 'FluidLogic_t' 
        },        {
           msg: 'Artemis Program_t: fiscal review — budget reallocation risk', type: 'warning', nodeId: 'Artemis Program_t' 
        },        {
           msg: 'Houston Assembly Plant_t: weather advisory — contingency plan', type: 'warning', nodeId: 'Houston Assembly Plant_t' 
        }    ];
    function spawnTickerEvent() {
                  var event = tickerEvents[Math.floor(Math.random() * tickerEvents.length)];
        var container = document.getElementById('ticker-container');
        if (!container) return;
        var el = document.createElement('div');
        el.className = 'ticker-item';
        el.innerHTML = '<span class="ticker-dot ' + event.type + '"></span> ' + event.msg.replace('_t', '');
        container.appendChild(el);
        currentTickerItems.push(el);
        var duration = 8000, startTime = Date.now();
        (function animateTicker() {
                      var elapsed = Date.now() - startTime, progress = elapsed / duration;
            if (progress >= 1) {
                          if (el.parentNode) el.parentNode.removeChild(el);
                var idx = currentTickerItems.indexOf(el);
 if (idx >= 0) currentTickerItems.splice(idx, 1);
                return;
            
        }            var containerW = container.offsetWidth || 400;
            el.style.left = (containerW + (-containerW - el.offsetWidth) * progress) + 'px';
            requestAnimationFrame(animateTicker);
        
        })();
        el.addEventListener('click', function() {
                      if (event.nodeId && nodeMap[event.nodeId]) {
                          selectNode(nodeMap[event.nodeId]);
                boostedRisks[event.nodeId] = (boostedRisks[event.nodeId] || 0) + 1;
                updateResilience();
                if (heatmapMode) updateHeatmap();
                notify('INTELLIGENCE: Risk boosted for ' + event.nodeId.replace('_t', ''), 'error');
                setTimeout(function() {
                              if (boostedRisks[event.nodeId]) {
           boostedRisks[event.nodeId]--;
 if (boostedRisks[event.nodeId] <= 0) delete boostedRisks[event.nodeId];
 updateResilience();
 if (heatmapMode) updateHeatmap();
 
        }                
        }, 30000);
            
        }        
        });
    
        }    function startTicker() {
                  if (tickerInterval) return;
        setTimeout(spawnTickerEvent, 3000);
        tickerInterval = setInterval(function() {
           spawnTickerEvent();
 
        }, 10000 + Math.random() * 10000);
    
        }    function stopTicker() {
                  if (tickerInterval) {
           clearInterval(tickerInterval);
 tickerInterval = null;
 
        }        currentTickerItems.forEach(function(el) {
           if (el.parentNode) el.parentNode.removeChild(el);
 
        });
        currentTickerItems = [];
    
        }    // ===== TIME MACHINE (Risk History) =====    function updateTimeMachine() {
                  var slider = document.getElementById('time-slider');
        if (!slider) return;
        var offset = parseInt(slider.value);
        timeMachineOffset = offset;
        var label = document.getElementById('time-label');
        var monthIdx;
        if (offset <= 0) {
                      monthIdx = 11 + offset;
 // 0..11            if (offset === 0) label.textContent = 'Now';
            else label.textContent = Math.abs(offset) + 'mo past';
        
        } else {
                      monthIdx = 11;
            label.textContent = '+' + offset + 'mo future';
        
        }        monthIdx = Math.max(0, Math.min(11, monthIdx));
        // Apply historical risk scores        Object.keys(supplierRiskHistory).forEach(function(sid) {
                      var n = nodeMap[sid];
            if (n) {
                          var hist = supplierRiskHistory[sid];
                n._tmRisk = hist[monthIdx] !== undefined ? hist[monthIdx] : n.risk;
            
        }        
        });
        // Stock projection        var stockDelta = 0;
        nodes.forEach(function(n) {
                      if (n.weeklyDemand && n.qty !== undefined) {
                          var projected = Math.round(n.qty + (n.weeklyDemand / 7) * offset * 30);
                if (projected < 0) projected = 0;
                stockDelta += projected - n.qty;
                n._projectedQty = projected;
            
        } else {
           n._projectedQty = n.qty;
 
        }        
        });
        document.getElementById('ts-stock').textContent = (stockDelta >= 0 ? '+' : '') + stockDelta;
        document.getElementById('ts-stock').className = 'tps-val' + (stockDelta < 0 ? ' proj-down' : stockDelta > 0 ? ' proj-up' : '');
        // Update node visuals        d3.selectAll('.node-base').each(function(d) {
                      var el = d3.select(this);
            if (d.type === 'supplier' && d._tmRisk !== undefined) {
                          var r = d._tmRisk;
                var color = r > 70 ? '#E53E3E' : r > 30 ? '#C05621' : '#48BB78';
                el.attr('fill', color);
            
        } else if (d.type === 'component' && d._projectedQty !== undefined) {
                          var origR = NODE_SIZES[d.type] || 8, ratio = d.qty > 0 ? d._projectedQty / d.qty : 1;
                el.attr('r', Math.max(3, Math.min(14, origR * Math.sqrt(ratio))));
                if (d._projectedQty <= 0) el.attr('fill', '#E53E3E');
                else if (d._projectedQty < (d.reorder || 0)) el.attr('fill', '#C05621');
                else el.attr('fill', NODE_COLORS[d.type] || '#666');
            
        } else if (d.type === 'supplier' && !tierMode && !heatmapMode && !certificationMode) {
                          el.attr('fill', NODE_COLORS[d.type] || '#666');
            
        }        
        });
        // Recalculate score        var result = (function() {
                      var score = 100;
            var compSuppliers = {
          
        };
            resolvedLinks.forEach(function(l) {
           if (l.type === 'manufactures') {
           var t = typeof l.target === 'object' ? l.target.id : l.target;
 compSuppliers[t] = (compSuppliers[t] || 0) + 1;
 
        } 
        });
            var singleSource = 0;
            nodes.forEach(function(n) {
           if (n.type === 'component' && compSuppliers[n.id] && compSuppliers[n.id] < 2) singleSource++;
 
        });
            if (singleSource > 0) {
           var p = Math.min(singleSource * 6, 30);
 score -= p;
 
        }            var hasOutgoing = {
          
        };
            resolvedLinks.forEach(function(l) {
           var s2 = typeof l.source === 'object' ? l.source.id : l.source;
 hasOutgoing[s2] = true;
 
        });
            var isolated = nodes.filter(function(n) {
           return !hasOutgoing[n.id] && n.type !== 'region';
 
        });
            if (isolated.length > 0) {
           var p = Math.min(isolated.length * 4, 16);
 score -= p;
 
        }            var highRiskSuppliers = nodes.filter(function(n) {
                          var r = n._tmRisk !== undefined ? n._tmRisk : (n.risk + (boostedRisks[n.id] || 0) * 10);
                return n.type === 'supplier' && r > 70;
            
        });
            if (highRiskSuppliers.length > 0) {
           var p = highRiskSuppliers.length * 8;
 score -= p;
 
        }            var zeroStock = nodes.filter(function(n) {
           return n.type === 'component' && n._projectedQty <= 0;
 
        });
            if (zeroStock.length > 0) {
           var p = zeroStock.length * 5;
 score -= p;
 
        }            var lowStock = nodes.filter(function(n) {
           return n.type === 'component' && n._projectedQty > 0 && n._projectedQty < (n.reorder || 0);
 
        });
            if (lowStock.length > 0) {
           var p = lowStock.length * 3;
 score -= p;
 
        }            var multiSource = 0;
            Object.keys(compSuppliers).forEach(function(k) {
           if (compSuppliers[k] > 1) multiSource++;
 
        });
            if (multiSource > 0) {
           var b = multiSource * 4;
 score += b;
 
        }            var warehouseNodes = nodes.filter(function(n) {
           return n.type === 'warehouse' && n.weeklyDemand && n.qty;
 
        });
            var buffered = 0;
            warehouseNodes.forEach(function(w) {
           var days = w.qty / (w.weeklyDemand / 7);
 if (days > 30) buffered++;
 
        });
            if (buffered > 0) {
           var b = buffered * 5;
 score += b;
 
        }            var healthy = nodes.filter(function(n) {
           return n.type === 'component' && n._projectedQty >= (n.reorder || 0);
 
        }).length;
            if (healthy > 0) {
           var b = healthy * 3;
 score += b;
 
        }            var progCount = nodes.filter(function(n) {
           return n.type === 'program';
 
        }).length;
            if (progCount > 1) {
           var b = 5;
 score += b;
 
        }            score = Math.max(0, Math.min(100, Math.round(score)));
            return {
           score: score 
        };
        
        })();
        document.getElementById('ts-score').textContent = result.score;
        document.getElementById('ts-score').className = 'tps-val' + (result.score < 50 ? ' proj-down' : '');
        updateBenchmark(result.score);
        if (is3D) updateShadows();
    
        }    function resetTimeMachine() {
                  timeMachineOffset = 0;
        var slider = document.getElementById('time-slider');
        if (slider) slider.value = 0;
        document.getElementById('time-label').textContent = 'Now';
        d3.selectAll('.node-base').attr('r', function(d) {
           return NODE_SIZES[d.type] || 8;
 
        }).attr('fill', function(d) {
           return NODE_COLORS[d.type] || '#666';
 
        });
        nodes.forEach(function(n) {
           delete n._projectedQty;
 delete n._tmRisk;
 
        });
        updateBenchmark();
    
        }    // ===== SPARKLINE =====    function renderSparkline(containerId, data) {
                  var svg = d3.select('#' + containerId);
        svg.selectAll('*').remove();
        if (!data || data.length < 2) return;
        var w = svg.node().getBoundingClientRect().width || 200;
        var h = 30, pad = 2;
        var xScale = d3.scaleLinear().domain([0, data.length - 1]).range([pad, w - pad]);
        var yScale = d3.scaleLinear().domain([d3.min(data), d3.max(data)]).range([h - pad, pad]);
        var line = d3.line().x(function(d, i) {
           return xScale(i);
 
        }).y(function(d) {
           return yScale(d);
 
        });
        var area = d3.area().x(function(d, i) {
           return xScale(i);
 
        }).y0(h - pad).y1(function(d) {
           return yScale(d);
 
        });
        // Gradient        var defs = svg.append('defs');
        var grad = defs.append('linearGradient').attr('id', 'sparkGradient_' + containerId).attr('x1', '0%').attr('y1', '0%').attr('x2', '0%').attr('y2', '100%');
        grad.append('stop').attr('offset', '0%').attr('stop-color', 'var(--cyan)').attr('stop-opacity', 0.25);
        grad.append('stop').attr('offset', '100%').attr('stop-color', 'var(--cyan)').attr('stop-opacity', 0);
        svg.append('path').datum(data).attr('d', area).attr('fill', 'url(#sparkGradient_' + containerId + ')');
        svg.append('path').datum(data).attr('d', line).attr('class', 'sparkline-line');
    
        }    // ===== ACTION PLAN =====    function generateActionPlan(startId, visited, affectedEdges) {
                  var container = document.getElementById('action-plan-container');
        if (!container) return;
        var highestRiskSupplier = null, highestRisk = 0;
        visited.forEach(function(id) {
           var n = nodeMap[id];
 if (n && n.type === 'supplier' && n.risk > highestRisk) {
           highestRisk = n.risk;
 highestRiskSupplier = n;
 
        } 
        });
        var bestWarehouse = null, bestDays = 0;
        nodes.forEach(function(n) {
           if (n.type === 'warehouse' && n.weeklyDemand && n.qty) {
           var days = n.qty / (n.weeklyDemand / 7);
 if (days > bestDays) {
           bestDays = Math.round(days);
 bestWarehouse = n;
 
        } 
        } 
        });
        var portInCascade = false, altPort = null;
        visited.forEach(function(id) {
           var n = nodeMap[id];
 if (n && n.type === 'port') portInCascade = true;
 
        });
        nodes.forEach(function(n) {
           if (n.type === 'port' && !visited.has(n.id)) altPort = n;
 
        });
        var altSupplier = null;
        if (highestRiskSupplier) {
                      resolvedLinks.forEach(function(l) {
                          var srcId = typeof l.source === 'object' ? l.source.id : l.source, tgtId = typeof l.target === 'object' ? l.target.id : l.target;
                if (l.type === 'manufactures' && srcId === highestRiskSupplier.id) {
                              resolvedLinks.forEach(function(l2) {
                                  var s2 = typeof l2.source === 'object' ? l2.source.id : l2.source, t2 = typeof l2.target === 'object' ? l2.target.id : l2.target;
                        if (l2.type === 'manufactures' && t2 === tgtId && s2 !== highestRiskSupplier.id) altSupplier = nodeMap[s2];
                    
        });
                
        }            
        });
        
        }        var revenueExposed = 0;
        visited.forEach(function(id) {
           var n = nodeMap[id];
 if (n && n.revenue) revenueExposed += n.revenue;
 
        });
        var html = '<h3 style="margin-top:16px;
border-top:1px solid rgba(255,255,255,0.04);
padding-top:14px;
">Emergency Action Plan</h3>';
        html += '<div class="action-plan-section">';
        if (highestRiskSupplier) {
                      html += '<div class="action-plan-item"><div class="api-label">1. Supplier Intervention</div><div class="api-detail">Contact <strong>' + highestRiskSupplier.id.replace('_t', '') + '</strong> immediately<br>';
            if (highestRiskSupplier.email) html += 'Email: <strong>' + highestRiskSupplier.email + '</strong><br>';
            html += 'Risk score: <strong style="color:var(--red)">' + highestRiskSupplier.risk + '/100</strong></div></div>';
        
        }        if (bestWarehouse) {
                      html += '<div class="action-plan-item"><div class="api-label">2. Buffer Stock</div><div class="api-detail">Draw from <strong>' + bestWarehouse.id.replace('_t', '') + '</strong><br>Buffer: <strong>' + bestDays + ' days</strong> coverage</div></div>';
        
        }        if (altPort) {
                      html += '<div class="action-plan-item"><div class="api-label">3. Alternate Route</div><div class="api-detail">Reroute via <strong>' + altPort.id.replace('_t', '') + '</strong><br>Not affected by this cascade</div></div>';
        
        }        if (altSupplier) {
                      html += '<div class="action-plan-item"><div class="api-label">4. Alternate Supplier</div><div class="api-detail">Engage <strong>' + altSupplier.id.replace('_t', '') + '</strong> as fallback<br>';
            if (altSupplier.email) html += 'Contact: <strong>' + altSupplier.email + '</strong>';
 html += '</div></div>';
        
        }        html += '<div class="action-plan-item" style="border-left-color:var(--red);
"><div class="api-label" style="color:var(--red);
">Revenue at Risk</div><div class="api-detail">Program revenue exposure: <strong style="color:var(--red)">$' + revenueExposed.toLocaleString() + '</strong></div></div>';
        html += '</div>';
        container.innerHTML = html;
    
        }    // ===== BENCHMARK =====    function updateBenchmark(score) {
                  var barsEl = document.getElementById('benchmark-bars'), msgEl = document.getElementById('benchmark-msg');
        if (!barsEl || !msgEl) return;
        var currentScore = score !== undefined ? score : (calculateResilience ? calculateResilience().score : 58);
        var industryAvg = 58, topQuartile = 84, maxVal = Math.max(currentScore, topQuartile, 100);
        barsEl.innerHTML =            '<div class="benchmark-row"><span class="br-label">Your Score</span><div class="br-bar-wrap"><div class="br-bar self" style="width:' + (currentScore / maxVal * 100) + '%"></div></div><span class="br-val">' + currentScore + '</span></div>' +            '<div class="benchmark-row"><span class="br-label">Industry Avg</span><div class="br-bar-wrap"><div class="br-bar avg" style="width:' + (industryAvg / maxVal * 100) + '%"></div></div><span class="br-val">' + industryAvg + '</span></div>' +            '<div class="benchmark-row"><span class="br-label">Top Quartile</span><div class="br-bar-wrap"><div class="br-bar top" style="width:' + (topQuartile / maxVal * 100) + '%"></div></div><span class="br-val">' + topQuartile + '</span></div>';
        var msg = '', msgClass = '';
        if (currentScore >= topQuartile) {
           msg = 'Your resilience score exceeds the top quartile. Industry-leading position.';
 msgClass = 'good';
 
        }        else if (currentScore >= industryAvg) {
           msg = 'Your score is above industry average but below top quartile. ' + (topQuartile - currentScore) + ' points to reach top-tier.';
 msgClass = 'average';
 
        }        else {
           msg = 'Your score is below industry average. ' + (industryAvg - currentScore) + ' points needed to match the benchmark.';
 msgClass = 'poor';
 
        }        msgEl.textContent = msg;
 msgEl.className = 'benchmark-msg ' + msgClass;
    
        }    // ===== COOPERATIVE PROCUREMENT =====    function updateCooperativeProcurement() {
                  var coopData = {
                      'Aerocast Inc_t': 4,            'FluidLogic_t': 7,            'CeramicTech_t': 2,            'WiredIn Solutions_t': 5,            'NanoSense Inc_t': 3        
        };
        var listEl = document.getElementById('coop-list');
        if (!listEl) return;
        var html = '';
        var supplierNodes = nodes.filter(function(n) {
           return n.type === 'supplier';
 
        });
        supplierNodes.forEach(function(n) {
                      var count = coopData[n.id] || 0;
            html += '<li data-supplier-id="' + n.id + '"><span>' + n.id.replace('_t', '') + '</span><span class="coop-count">' + count + ' other' + (count !== 1 ? 's' : '') + '</span></li>';
        
        });
        listEl.innerHTML = html;
        // Click handler via delegation        listEl.onclick = function(e) {
                      var li = e.target.closest('li');
            if (li && li.dataset.supplierId) {
                          var sn = nodeMap[li.dataset.supplierId];
                if (sn) openSupplierProfile(sn);
            
        }        
        };
        var msgEl = document.getElementById('coop-message');
        if (msgEl) {
                      msgEl.innerHTML = 'Pooled purchasing power: <strong>$12.4M</strong>. Eligible for volume discounts and shared audits.';
        
        }    
        }    // ===== SEARCH BAR =====    function setupSearchBar() {
                  var searchBar = document.getElementById('search-bar');
        var escHint = document.getElementById('search-esc-hint');
        var currentHighlight = null;
        searchBar.addEventListener('input', function() {
                      var q = searchBar.value.trim().toLowerCase();
            if (currentHighlight) {
           currentHighlight.className = 'watchlist-star';
 currentHighlight = null;
 
        }            if (!q) {
                          d3.selectAll('.node-base').classed('node-dim', false).classed('node-highlight', false);
                d3.selectAll('.label-base').attr('opacity', labelsVisible ? 0.7 : 0);
                escHint.classList.remove('visible');
                if (window.__zoom) svg.transition().duration(300).call(window.__zoom.transform, d3.zoomIdentity);
                return;
            
        }            escHint.classList.add('visible');
            var match = null;
            d3.selectAll('.node-base').each(function(d) {
                          var name = d.id.replace('_t', '').toLowerCase();
                var matches = name.indexOf(q) >= 0;
                d3.select(this).classed('node-dim', !matches);
                if (matches) match = d;
            
        });
            d3.selectAll('.label-base').attr('opacity', function(d) {
                          return d.id.replace('_t', '').toLowerCase().indexOf(q) >= 0 ? 1 : 0.05;
            
        });
            if (match) {
                          d3.selectAll('.node-base').filter(function(d) {
           return d === match;
 
        }).classed('node-highlight', true);
                var dim = getDimensions();
                if (window.__zoom) {
                              var scale = 2;
                    svg.transition().duration(400).call(window.__zoom.transform,                        d3.zoomIdentity.translate(dim.w / 2 - match.x * scale, dim.h / 2 - match.y * scale).scale(scale)                    );
                
        }            
        }        
        });
        searchBar.addEventListener('keydown', function(e) {
                      if (e.key === 'Escape') {
                          searchBar.value = '';
                searchBar.dispatchEvent(new Event('input'));
                searchBar.blur();
            
        }        
        });
    
        }    // ===== ENHANCED COOPERATIVE PROCUREMENT =====    function updateCooperativeProcurementEnhanced() {
                  var coopData = {
                      'Aerocast Inc_t': {
           count: 4, buyingPower: 2800000, savings: 8.2 
        },            'FluidLogic_t': {
           count: 7, buyingPower: 5200000, savings: 11.5 
        },            'CeramicTech_t': {
           count: 2, buyingPower: 950000, savings: 5.0 
        },            'WiredIn Solutions_t': {
           count: 5, buyingPower: 3400000, savings: 9.8 
        },            'NanoSense Inc_t': {
           count: 3, buyingPower: 1500000, savings: 6.7 
        }        
        };
        var listEl = document.getElementById('coop-list');
        if (!listEl) return;
        var html = '';
        var supplierNodes = nodes.filter(function(n) {
           return n.type === 'supplier';
 
        });
        supplierNodes.forEach(function(n) {
                      var info = coopData[n.id] || {
           count: 0, buyingPower: 0, savings: 0 
        };
            html += '<li style="flex-direction:column;
align-items:stretch;
padding:8px 0;
cursor:default;
">';
            html += '<div style="display:flex;
justify-content:space-between;
align-items:center;
">';
            html += '<span style="cursor:pointer;
" onclick="openSupplierProfile(window.nodeMap[\'' + n.id + '\'])">' + n.id.replace('_t', '') + '</span>';
            html += '<span class="coop-count">' + info.count + ' other' + (info.count !== 1 ? 's' : '') + '</span>';
            html += '</div>';
            html += '<div style="display:flex;
justify-content:space-between;
font-size:0.65rem;
color:var(--text-2);
margin-top:4px;
">';
            html += '<span>Pool: <strong style="color:var(--cyan);
">$' + info.buyingPower.toLocaleString() + '</strong></span>';
            html += '<span style="color:var(--green);
">~' + info.savings + '% savings</span>';
            html += '</div>';
            html += '<button class="btn-secondary coop-request-btn" data-supplier="' + n.id + '" style="font-size:0.6rem;
padding:4px 10px;
margin-top:4px;
margin-bottom:0;
width:auto;
">Request Grouping</button>';
            html += '</li>';
        
        });
        listEl.innerHTML = html;
        listEl.onclick = function(e) {
                      var btn = e.target.closest('.coop-request-btn');
            if (btn) {
                          notify('Request sent to ' + btn.dataset.supplier.replace('_t', '') + ' — pooled with ' + (coopData[btn.dataset.supplier].count || 0) + ' other buyers.', 'success');
            
        }        
        };
        var msgEl = document.getElementById('coop-message');
        if (msgEl) {
                      var totalPool = 0;
            Object.keys(coopData).forEach(function(k) {
           totalPool += coopData[k].buyingPower;
 
        });
            msgEl.innerHTML = 'Pooled purchasing power: <strong>$' + totalPool.toLocaleString() + '</strong>. Eligible for volume discounts and shared audits.';
        
        }    
        }    // ===== EXPORT RISK REPORT =====    function exportRiskReport() {
                  var res = calculateResilience();
        var topRisks = [];
        nodes.forEach(function(n) {
                      if (n.type === 'supplier' && n.risk) topRisks.push({
           name: n.id.replace('_t', ''), risk: n.risk 
        });
        
        });
        topRisks.sort(function(a, b) {
           return b.risk - a.risk;
 
        });
        var affectedPrograms = [];
        nodes.forEach(function(n) {
           if (n.type === 'program' && n.revenue) affectedPrograms.push(n.id.replace('_t', '') + ' ($' + n.revenue.toLocaleString() + ')');
 
        });
        var certRows = '';
        nodes.forEach(function(n) {
                      if (n.type === 'supplier') {
                          var cs = getSupplierCertStatus(n);
                var status = cs.fullyCertified ? '✅ Pass' : '❌ ' + cs.missing.map(function(c) {
           return CERT_NAMES[c] || c;
 
        }).join(', ');
                certRows += '<tr><td>' + n.id.replace('_t', '') + '</td><td>' + n.risk + '</td><td>' + status + '</td></tr>';
            
        }        
        });
        var reportHtml = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>AKSCI Risk Report</title><style>body{
          font-family:-apple-system,sans-serif;
padding:40px;
color:#1a1a2e;
max-width:800px;
margin:0 auto;

        }h1{
          font-size:1.5rem;
border-bottom:2px solid #00B8D9;
padding-bottom:8px;

        }h2{
          font-size:1.1rem;
margin-top:24px;

        }.score{
          font-size:2.5rem;
font-weight:bold;
color:#00B8D9;

        }.meta{
          color:#666;
font-size:0.85rem;
margin:4px 0;

        }table{
          width:100%;
border-collapse:collapse;
margin:12px 0;

        }th,td{
          text-align:left;
padding:8px 10px;
border-bottom:1px solid #eee;

        }th{
          font-size:0.75rem;
text-transform:uppercase;
color:#666;

        }.risk-high{
          color:#E53E3E;
font-weight:600;

        }.actions{
          padding:12px 16px;
background:#f0f8ff;
border-left:3px solid #00B8D9;
margin:8px 0;
border-radius:4px;
font-size:0.9rem;
line-height:1.6;

        }.footer{
          margin-top:40px;
padding-top:16px;
border-top:1px solid #ddd;
font-size:0.75rem;
color:#999;
text-align:center;

        }      
        </style><
        /head>
        <body>
          <h1>
            AKSCI Morningstar — Risk Report<
            /h1>
            <p class="meta">
              Generated ' + new Date().toLocaleString() + ' | Sample Demo Data<
              /p>
              <h2>
                Overall Resilience Score<
                /h2>
                <div class="score">
                  ' + res.score + '/100<
                  /div>
                  <p class="meta">
                    ' + (res.score >= 80 ? 'Strong' : res.score >= 60 ? 'Moderate' : res.score >= 40 ? 'Fragile' : 'Critical') + '<
                    /p>
                    <h2>
                      Top 3 Risks<
                      /h2>'; topRisks.slice(0, 3).forEach(function(r) { reportHtml += '
                      <div class="actions">
                        <strong class="risk-high">
                          ⚠ ' + r.name + '<
                          /strong> — Risk Score: ' + r.risk + '/100<
                          /div>'; }); reportHtml += '
                          <h2>
                            Affected Programs<
                            /h2>
                            <ul>
                              ' + affectedPrograms.map(function(p) { return '
                              <li>
                                ' + p + '<
                                /li>'; }).join('') + '<
                                /ul>'; reportHtml += '
                                <h2>
                                  Supplier Certification Status<
                                  /h2>
                                  <table>
                                    <thead>
                                      <tr>
                                        <th>
                                          Supplier<
                                          /th>
                                          <th>
                                            Risk<
                                            /th>
                                            <th>
                                              Cert Status<
                                              /th><
                                              /tr><
                                              /thead>
                                              <tbody>
                                                ' + certRows + '<
                                                /tbody><
                                                /table>'; reportHtml += '
                                                <h2>
                                                  Recommended Actions<
                                                  /h2>' + res.suggestions.map(function(s) { return '
                                                  <div class="actions">
                                                    ' + s + '<
                                                    /div>'; }).join(''); reportHtml += '
                                                    <div class="footer">
                                                      AKSCI Morningstar — Aerospace Supply Chain Risk Platform<
                                                      /div><
                                                      /body><
                                                      /html>'; var blob = new Blob([reportHtml], { type: 'text/html' }); var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href = url; a.download = 'AKSCI_Risk_Report_' + new Date().toISOString().slice(0,10) + '.html'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); notify('Risk report downloaded.', 'success'); } // ===== AI NARRATIVE ===== function generateAiNarrative() { var btn = document.getElementById('btn-ai-summary'); btn.disabled = true; btn.textContent = 'Analyzing...'; var modal = document.getElementById('modal-ai-narrative'); modal.classList.add('visible'); document.getElementById('ai-narrative-body').style.display = 'block'; document.getElementById('ai-narrative-result').style.display = 'none'; var supplierInfo = []; nodes.forEach(function(n) { if (n.type === 'supplier') { var cs = getSupplierCertStatus(n); supplierInfo.push(n.id.replace('_t', '') + ' (risk:' + n.risk + ', certs:' + (cs.fullyCertified ? 'OK' : 'missing ' + cs.missing.join(',')) + ')'); } }); var programInfo = []; nodes.forEach(function(n) { if (n.type === 'program' && n.revenue) programInfo.push(n.id.replace('_t', '') + ' ($' + n.revenue.toLocaleString() + ')'); }); var res = calculateResilience(); var promptText = 'Supply Chain State:\nResilience Score: ' + res.score + '/100\nSuppliers: ' + supplierInfo.join('; ') + '\nPrograms: ' + programInfo.join(', '); // Try to call Anthropic API. Use injected key if available, else fallback to simulated response. var apiKey = window.__ANTHROPIC_API_KEY || ''; if (apiKey) { var payload = { model: 'claude-sonnet-4-6', max_tokens: 300, messages: [ { role: 'user', content: 'You are an aerospace supply chain risk analyst. Given the following supply chain data, write a concise 3-4 sentence risk briefing for an executive audience. Be specific about supplier names, risk factors, and dollar exposure. Be direct and avoid generic language.\n\n' + promptText } ] }; fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' }, body: JSON.stringify(payload) }).then(function(r) { return r.json(); }).then(function(data) { btn.disabled = false; btn.textContent = '✦ AI Summary'; var text = data.content && data.content[0] && data.content[0].text ? data.content[0].text : 'Unable to generate narrative.'; showAiNarrative(text); }).catch(function() { btn.disabled = false; btn.textContent = '✦ AI Summary'; showAiNarrativeFallback(res, supplierInfo); notify('Could not reach AI service. Try again.', 'error'); }); } else { // Simulated response for demo setTimeout(function() { btn.disabled = false; btn.textContent = '✦ AI Summary'; showAiNarrativeFallback(res, supplierInfo); }, 2000); } } function showAiNarrative(text) { document.getElementById('ai-narrative-body').style.display = 'none'; var resultEl = document.getElementById('ai-narrative-result'); resultEl.style.display = 'block'; resultEl.innerHTML = '
                                                      <div class="ai-narrative-content">
                                                        ' + text.replace(/\n/g, '
                                                        <br>
                                                        ') + '<
                                                        /div>'; } function showAiNarrativeFallback(res, supplierInfo) { var highRisk = []; supplierInfo.forEach(function(s) { var match = s.match(/^(.+?) \(risk:(\d+)/); if (match && parseInt(match[2]) > 50) highRisk.push(match[1] + ' (risk ' + match[2] + ')'); }); var text = 'The supply chain network currently holds a resilience score of ' + res.score + '/100. '; if (highRisk.length > 0) { text += 'Critical attention is needed for ' + highRisk.join(', ') + '. '; } else { text += 'Supplier risk levels are within acceptable thresholds. '; } text += 'Revenue exposure across active programs remains significant, with potential cascade impacts requiring proactive monitoring. '; text += 'Recommended focus areas include improving supplier certification coverage and reducing single-source dependencies to strengthen overall network resilience.'; showAiNarrative(text); } // ===== SCENARIO COMPARISON ===== function openScenarioComparison() { if (!selectedNode) { notify('Select a node first.', 'error'); return; } var modal = document.getElementById('modal-scenario-compare'); modal.classList.add('visible'); var leftLabel = document.getElementById('comp-left-label'); leftLabel.textContent = selectedNode.id.replace('_t', ''); // Populate right dropdown with all nodes except selected var select = document.getElementById('comp-right-select'); select.innerHTML = ''; nodes.forEach(function(n) { if (n.id !== selectedNode.id) { var opt = document.createElement('option'); opt.value = n.id; opt.textContent = n.id.replace('_t', '') + ' (' + n.type + ')'; select.appendChild(opt); } }); if (select.options.length > 0) runScenarioCompare(); select.onchange = runScenarioCompare; } function runScenarioCompare() { var leftId = selectedNode.id; var rightId = document.getElementById('comp-right-select').value; if (!leftId || !rightId) return; var leftResult = computeCascade(leftId); var rightResult = computeCascade(rightId); document.getElementById('comp-left-stats').innerHTML = formatCompareStats(leftResult); document.getElementById('comp-right-stats').innerHTML = formatCompareStats(rightResult); var winnerEl = document.getElementById('comp-winner'); if (leftResult.affectedCount > rightResult.affectedCount) { winnerEl.textContent = '⚠ Scenario A is more damaging (' + leftId.replace('_t', '') + ')'; winnerEl.className = 'comp-winner left-win'; } else if (rightResult.affectedCount > leftResult.affectedCount) { winnerEl.textContent = '⚠ Scenario B is more damaging (' + rightId.replace('_t', '') + ')'; winnerEl.className = 'comp-winner right-win'; } else { winnerEl.textContent = 'Both scenarios have equal impact'; winnerEl.className = 'comp-winner tie'; } } function computeCascade(startId) { var visited = new Set(), queue = [startId]; while (queue.length > 0) { var cur = queue.shift(); if (visited.has(cur)) continue; visited.add(cur); resolvedLinks.forEach(function(l) { var srcId = typeof l.source === 'object' ? l.source.id : l.source; var tgtId = typeof l.target === 'object' ? l.target.id : l.target; if (srcId === cur && !visited.has(tgtId)) queue.push(tgtId); }); } var revenue = 0, supCount = 0, compCount = 0; visited.forEach(function(id) { var n = nodeMap[id]; if (n && n.revenue) revenue += n.revenue; if (n && n.type === 'supplier') supCount++; if (n && n.type === 'component') compCount++; }); var res = calculateResilience(); return { affectedCount: visited.size, revenueExposed: revenue, supplierCount: supCount, componentCount: compCount, scoreDelta: res.score }; } function formatCompareStats(result) { return '
                                                        <div class="comp-stat">
                                                          <span class="comp-label">
                                                            Affected Nodes<
                                                            /span>
                                                            <span class="comp-val worse">
                                                              ' + result.affectedCount + '<
                                                              /span><
                                                              /div>' + '
                                                              <div class="comp-stat">
                                                                <span class="comp-label">
                                                                  Revenue at Risk<
                                                                  /span>
                                                                  <span class="comp-val worse">
                                                                    $' + result.revenueExposed.toLocaleString() + '<
                                                                    /span><
                                                                    /div>' + '
                                                                    <div class="comp-stat">
                                                                      <span class="comp-label">
                                                                        Suppliers Affected<
                                                                        /span>
                                                                        <span class="comp-val">
                                                                          ' + result.supplierCount + '<
                                                                          /span><
                                                                          /div>' + '
                                                                          <div class="comp-stat">
                                                                            <span class="comp-label">
                                                                              Components Affected<
                                                                              /span>
                                                                              <span class="comp-val">
                                                                                ' + result.componentCount + '<
                                                                                /span><
                                                                                /div>' + '
                                                                                <div class="comp-stat">
                                                                                  <span class="comp-label">
                                                                                    Resilience Delta<
                                                                                    /span>
                                                                                    <span class="comp-val worse">
                                                                                      ' + result.scoreDelta + '/100<
                                                                                      /span><
                                                                                      /div>'; } // ===== REVENUE IMPACT CALCULATOR ===== function setupRevenueImpactCalculator() { var progSelect = document.getElementById('ric-program'); var slider = document.getElementById('ric-slider'); var daysDisplay = document.getElementById('ric-days-display'); var valueEl = document.getElementById('ric-value'); var barEl = document.getElementById('ric-bar'); function update() { var progId = progSelect.value; var days = parseInt(slider.value); daysDisplay.textContent = days; var prog = nodeMap[progId]; var revenue = prog && prog.revenue ? prog.revenue : 0; var res = calculateResilience(); var disruptionMult = 1 + (100 - res.score) / 100; // higher multiplier for lower resilience var atRisk = Math.round(revenue / 365 * days * disruptionMult); valueEl.textContent = '$' + atRisk.toLocaleString(); var pct = (days / 90) * 100; barEl.style.width = pct + '%'; } progSelect.addEventListener('change', update); slider.addEventListener('input', update); update(); } // ===== WATCHLIST ===== function toggleWatchlist(supplierId) { var idx = watchlist.indexOf(supplierId); if (idx >= 0) watchlist.splice(idx, 1); else watchlist.push(supplierId); localStorage.setItem('aksci_watchlist', JSON.stringify(watchlist)); renderWatchlist(); updateWatchlistStars(); } function renderWatchlist() { var container = document.getElementById('watchlist-container'); document.getElementById('wl-count').textContent = '(' + watchlist.length + ')'; if (watchlist.length === 0) { container.innerHTML = '
                                                                                      <div class="watchlist-empty">
                                                                                        No suppliers watched. Click ☆ on a supplier node to add them.<
                                                                                        /div>'; return; } var html = ''; watchlist.forEach(function(sid) { var n = nodeMap[sid]; if (!n) return; var r = n.risk || 0; var riskClass = r > 70 ? 'critical' : r > 30 ? 'warning' : 'nominal'; var trend = '→'; var trendClass = ''; if (supplierRiskHistory[sid]) { var h = supplierRiskHistory[sid]; var recent = h[h.length - 1] || 0; var prev = h.length > 1 ? h[h.length - 2] : recent; if (recent > prev) { trend = '↑'; trendClass = 'up'; } else if (recent
                                                                                        < prev) { trend='↓' ; trendClass='down' ; } } var alertHtml='' ; if (r>
                                                                                          50) { var certAlerts = []; if (n.certifications && n.certifications.expiryDates) { Object.keys(n.certifications.expiryDates).forEach(function(c) { var days = getDaysUntilExpiry(n.certifications.expiryDates[c]); if (days
                                                                                          <= 90) certAlerts.push(CERT_NAMES[c] + ' exp ' + days + 'd' ); }); } if (certAlerts.length>
                                                                                            0) alertHtml = '
                                                                                            <span class="wl-alert">
                                                                                              ⚠ ' + certAlerts.slice(0, 2).join(', ') + '<
                                                                                              /span>'; else alertHtml = '
                                                                                              <span class="wl-alert">
                                                                                                ⚠ Risk > 50<
                                                                                                /span>'; } html += '
                                                                                                <div class="watchlist-item" onclick="openSupplierProfile(window.nodeMap[\'' + sid + '\'])">
                                                                                                  ' + '
                                                                                                  <span class="watchlist-star active" onclick="event.stopPropagation();toggleWatchlist(\'' + sid + '\')">
                                                                                                    ★<
                                                                                                    /span>' + '
                                                                                                    <span class="wl-name">
                                                                                                      ' + sid.replace('_t', '') + '<
                                                                                                      /span>' + '
                                                                                                      <span class="wl-risk ' + riskClass + '">
                                                                                                        ' + r + '<
                                                                                                        /span>' + '
                                                                                                        <span class="wl-trend ' + trendClass + '">
                                                                                                          ' + trend + '<
                                                                                                          /span>' + alertHtml + '<
                                                                                                          /div>'; }); container.innerHTML = html; } function updateWatchlistStars() { d3.selectAll('.node-base').each(function(d) { d3.select(this).attr('data-watched', watchlist.indexOf(d.id) >= 0 ? 'true' : 'false'); }); } // ===== GEO MAP ===== var geoModeActive = false; var worldPorts = [ { name: 'Port of Long Beach_t', lat: 33.75, lng: -118.21 }, { name: 'Port of Rotterdam_t', lat: 51.90, lng: 4.50 } ]; function toggleGeoMode() { geoModeActive = !geoModeActive; document.getElementById('tb-geo').classList.toggle('active', geoModeActive); document.getElementById('geo-map-wrap').classList.toggle('visible', geoModeActive); document.getElementById('graph-svg').style.display = geoModeActive ? 'none' : 'block'; document.getElementById('search-bar-wrap').style.display = geoModeActive ? 'none' : 'flex'; if (geoModeActive) renderGeoMap(); } function renderGeoMap() { var svgEl = d3.select('#geo-svg'); svgEl.selectAll('*').remove(); var dim = getDimensions(); var w = dim.w, h = dim.h; // Simple equirectangular projection function project(lat, lng) { var x = (lng + 180) / 360 * w; var y = (90 - lat) / 180 * h; return [x, y]; } // Ocean bg svgEl.append('rect').attr('width', w).attr('height', h).attr('class', 'geo-ocean'); // Simplified continents (rough polygons) var continents = [ // North America [[-130,50],[-125,48],[-122,37],[-118,34],[-115,33],[-110,32],[-105,30],[-100,28],[-97,26],[-90,30],[-85,35],[-80,40],[-75,45],[-70,47],[-68,44],[-65,40],[-60,35],[-55,30],[-50,25],[-45,20],[-40,15],[-45,10],[-50,5],[-55,10],[-60,15],[-65,20],[-70,25],[-75,30],[-80,35],[-85,40],[-90,45],[-95,48],[-100,50],[-105,55],[-110,60],[-115,65],[-120,68],[-125,60],[-130,55],[-130,50]], // South America [[-80,10],[-75,5],[-70,0],[-65,-5],[-60,-10],[-55,-15],[-50,-20],[-55,-25],[-60,-30],[-65,-35],[-70,-40],[-75,-45],[-80,-50],[-75,-55],[-70,-55],[-65,-50],[-60,-45],[-55,-40],[-50,-35],[-45,-30],[-40,-25],[-45,-20],[-50,-15],[-55,-10],[-60,-5],[-65,0],[-70,5],[-75,10],[-80,10]], // Europe [[-10,36],[0,38],[5,40],[10,42],[15,40],[20,42],[25,40],[30,42],[35,40],[30,45],[25,48],[20,50],[15,52],[10,55],[5,58],[0,60],[-5,58],[-10,55],[-10,50],[-8,45],[-10,40],[-10,36]], // Africa [[-15,35],[-5,35],[0,35],[5,35],[10,35],[15,35],[20,35],[25,35],[30,35],[35,35],[40,35],[45,35],[50,35],[50,30],[45,25],[40,20],[35,15],[40,10],[45,5],[50,0],[50,-5],[45,-10],[40,-15],[35,-20],[30,-25],[25,-30],[20,-35],[15,-35],[10,-30],[5,-25],[0,-20],[-5,-15],[-10,-10],[-15,-5],[-15,0],[-10,5],[-5,10],[0,15],[5,20],[0,25],[-5,30],[-10,35],[-15,35]], // Asia [[30,45],[35,40],[40,35],[45,30],[50,25],[55,20],[60,15],[65,10],[70,5],[75,0],[80,5],[85,10],[90,15],[95,20],[100,25],[105,30],[110,35],[115,40],[120,45],[125,50],[130,55],[135,60],[140,65],[145,68],[150,70],[140,70],[130,65],[120,60],[110,55],[100,50],[90,45],[80,40],[70,35],[60,30],[50,25],[40,20],[30,25],[30,35],[30,45]], // Australia [[115,-15],[120,-20],[125,-25],[130,-30],[135,-35],[140,-38],[145,-40],[150,-38],[155,-35],[153,-30],[150,-25],[148,-20],[145,-15],[140,-12],[135,-10],[130,-12],[125,-15],[120,-15],[115,-15]], // Greenland [[-55,60],[-50,65],[-45,70],[-40,75],[-35,80],[-30,82],[-25,80],[-20,75],[-25,70],[-30,65],[-35,60],[-40,58],[-45,55],[-50,58],[-55,60]] ]; continents.forEach(function(poly) { svgEl.append('polygon') .attr('points', poly.map(function(p) { return project(p[0], p[1]).join(','); }).join(' ')) .attr('class', 'geo-land'); }); // Flow lines between suppliers and ports var supplierNodes = nodes.filter(function(n) { return n.type === 'supplier'; }); supplierNodes.forEach(function(sup) { var sc = supplierGeoCoords[sup.id]; if (!sc) return; worldPorts.forEach(function(port) { var pc = supplierGeoCoords[port.name]; if (!pc) return; var p1 = project(sc.lat, sc.lng); var p2 = project(pc.lat, pc.lng); svgEl.append('line') .attr('x1', p1[0]).attr('y1', p1[1]) .attr('x2', p2[0]).attr('y2', p2[1]) .attr('class', 'geo-supplier-line'); }); }); // Supplier dots supplierNodes.forEach(function(sup) { var sc = supplierGeoCoords[sup.id]; if (!sc) return; var p = project(sc.lat, sc.lng); var risk = sup.risk || 50; var riskClass = risk > 70 ? 'risk-high' : risk > 30 ? 'risk-med' : 'risk-low'; svgEl.append('circle') .attr('cx', p[0]).attr('cy', p[1]) .attr('r', 6).attr('class', 'geo-supplier-dot ' + riskClass) .attr('data-supplier-id', sup.id) .on('click', function() { var sn = nodeMap[sup.id]; if (sn) openSupplierProfile(sn); }); // Label svgEl.append('text') .attr('x', p[0] + 8).attr('y', p[1] + 2) .attr('class', 'geo-supplier-label') .text(sup.id.replace('_t', '')); }); // Port dots worldPorts.forEach(function(port) { var p = project(port.lat, port.lng); svgEl.append('circle') .attr('cx', p[0]).attr('cy', p[1]) .attr('r', 4).attr('class', 'geo-port'); svgEl.append('text') .attr('x', p[0] + 6).attr('y', p[1] + 2) .attr('class', 'geo-supplier-label') .text(port.name.replace('_t', '')); }); // Title svgEl.append('text').attr('x', 12).attr('y', 20).attr('class', 'geo-title').text('Supply Chain Geo View'); } // ===== RESPONSIVE DRAWER ===== function setupDrawers() { var toggle = document.getElementById('drawer-toggle-left'); var overlay = document.getElementById('drawer-overlay'); if (!toggle) return; function checkWidth() { if (window.innerWidth
                                                                                                          < 1100) { toggle.classList.add('visible'); } else { toggle.classList.remove('visible'); overlay.classList.remove('visible'); document.querySelectorAll('.drawer-panel').forEach(function(p) { p.classList.remove('open'); }); } } function openDrawer() { var panel=document.querySelector('.left-drawer'); if (!panel) { panel=document.createElement('div'); panel.className='drawer-panel left-drawer' ; var closeBtn=document.createElement('button'); closeBtn.className='drawer-close' ; closeBtn.textContent='✕' ; closeBtn.onclick=closeDrawer; panel.appendChild(closeBtn); var clone=document.querySelector('.left-panel').cloneNode(true); clone.style.display='block' ; clone.style.background='none' ; clone.style.border='none' ; clone.style.padding='40px 16px 20px' ; clone.style.overflow='visible' ; panel.appendChild(clone); document.body.appendChild(panel); } overlay.classList.add('visible'); panel.classList.add('open'); } function closeDrawer() { overlay.classList.remove('visible'); document.querySelectorAll('.drawer-panel').forEach(function(p) { p.classList.remove('open'); }); } toggle.onclick=openDrawer; overlay.onclick=closeDrawer; checkWidth(); window.addEventListener('resize', checkWidth); } //=====DYNAMIC REVENUE AT RISK (Action Plan)=====var origGenerateActionPlan=generateActionPlan; generateActionPlan=function(startId, visited, affectedEdges) { var container=document.getElementById('action-plan-container'); if (!container) return; var highestRiskSupplier=null, highestRisk=0; visited.forEach(function(id) { var n=nodeMap[id]; if (n && n.type==='supplier' && n.risk>
                                                                                                            highestRisk) { highestRisk = n.risk; highestRiskSupplier = n; } }); var bestWarehouse = null, bestDays = 0; nodes.forEach(function(n) { if (n.type === 'warehouse' && n.weeklyDemand && n.qty) { var days = n.qty / (n.weeklyDemand / 7); if (days > bestDays) { bestDays = Math.round(days); bestWarehouse = n; } } }); var altPort = null; var portInCascade = false; visited.forEach(function(id) { var n = nodeMap[id]; if (n && n.type === 'port') portInCascade = true; }); nodes.forEach(function(n) { if (n.type === 'port' && !visited.has(n.id)) altPort = n; }); var altSupplier = null; if (highestRiskSupplier) { resolvedLinks.forEach(function(l) { var srcId = typeof l.source === 'object' ? l.source.id : l.source, tgtId = typeof l.target === 'object' ? l.target.id : l.target; if (l.type === 'manufactures' && srcId === highestRiskSupplier.id) { resolvedLinks.forEach(function(l2) { var s2 = typeof l2.source === 'object' ? l2.source.id : l2.source, t2 = typeof l2.target === 'object' ? l2.target.id : l2.target; if (l2.type === 'manufactures' && t2 === tgtId && s2 !== highestRiskSupplier.id) altSupplier = nodeMap[s2]; }); } }); } // Dynamic revenue: sum of program nodes in affected set var revenueExposed = 0; visited.forEach(function(id) { var n = nodeMap[id]; if (n && n.revenue) revenueExposed += n.revenue; }); var html = '
                                                                                                            <h3 style="margin-top:16px;border-top:1px solid rgba(255,255,255,0.04);padding-top:14px;">
                                                                                                              Emergency Action Plan<
                                                                                                              /h3>'; html += '
                                                                                                              <div class="action-plan-section">
                                                                                                                '; if (highestRiskSupplier) { html += '
                                                                                                                <div class="action-plan-item">
                                                                                                                  <div class="api-label">
                                                                                                                    1. Supplier Intervention<
                                                                                                                    /div>
                                                                                                                    <div class="api-detail">
                                                                                                                      Contact
                                                                                                                      <strong>
                                                                                                                        ' + highestRiskSupplier.id.replace('_t', '') + '<
                                                                                                                        /strong> immediately
                                                                                                                        <br>
                                                                                                                        '; if (highestRiskSupplier.email) html += 'Email:
                                                                                                                        <strong>
                                                                                                                          ' + highestRiskSupplier.email + '<
                                                                                                                          /strong>
                                                                                                                          <br>
                                                                                                                          '; html += 'Risk score:
                                                                                                                          <strong style="color:var(--red)">
                                                                                                                            ' + highestRiskSupplier.risk + '/100<
                                                                                                                            /strong><
                                                                                                                            /div><
                                                                                                                            /div>'; } if (bestWarehouse) { html += '
                                                                                                                            <div class="action-plan-item">
                                                                                                                              <div class="api-label">
                                                                                                                                2. Buffer Stock<
                                                                                                                                /div>
                                                                                                                                <div class="api-detail">
                                                                                                                                  Draw from
                                                                                                                                  <strong>
                                                                                                                                    ' + bestWarehouse.id.replace('_t', '') + '<
                                                                                                                                    /strong>
                                                                                                                                    <br>
                                                                                                                                    Buffer:
                                                                                                                                    <strong>
                                                                                                                                      ' + bestDays + ' days<
                                                                                                                                      /strong> coverage<
                                                                                                                                      /div><
                                                                                                                                      /div>'; } if (altPort) { html += '
                                                                                                                                      <div class="action-plan-item">
                                                                                                                                        <div class="api-label">
                                                                                                                                          3. Alternate Route<
                                                                                                                                          /div>
                                                                                                                                          <div class="api-detail">
                                                                                                                                            Reroute via
                                                                                                                                            <strong>
                                                                                                                                              ' + altPort.id.replace('_t', '') + '<
                                                                                                                                              /strong>
                                                                                                                                              <br>
                                                                                                                                              Not affected by this cascade<
                                                                                                                                              /div><
                                                                                                                                              /div>'; } if (altSupplier) { html += '
                                                                                                                                              <div class="action-plan-item">
                                                                                                                                                <div class="api-label">
                                                                                                                                                  4. Alternate Supplier<
                                                                                                                                                  /div>
                                                                                                                                                  <div class="api-detail">
                                                                                                                                                    Engage
                                                                                                                                                    <strong>
                                                                                                                                                      ' + altSupplier.id.replace('_t', '') + '<
                                                                                                                                                      /strong> as fallback
                                                                                                                                                      <br>
                                                                                                                                                      '; if (altSupplier.email) html += 'Contact:
                                                                                                                                                      <strong>
                                                                                                                                                        ' + altSupplier.email + '<
                                                                                                                                                        /strong>'; html += '<
                                                                                                                                                        /div><
                                                                                                                                                        /div>'; } html += '
                                                                                                                                                        <div class="action-plan-item" style="border-left-color:var(--red);">
                                                                                                                                                          <div class="api-label" style="color:var(--red);">
                                                                                                                                                            Revenue at Risk<
                                                                                                                                                            /div>
                                                                                                                                                            <div class="api-detail">
                                                                                                                                                              Program revenue exposure:
                                                                                                                                                              <strong style="color:var(--red)">
                                                                                                                                                                $' + revenueExposed.toLocaleString() + '<
                                                                                                                                                                /strong><
                                                                                                                                                                /div><
                                                                                                                                                                /div>'; html += '<
                                                                                                                                                                /div>'; container.innerHTML = html; }; // ===== AUDIO ===== function playNodeClick() { try { var ctx = new (window.AudioContext || window.webkitAudioContext)(); var osc = ctx.createOscillator(); var gain = ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); osc.frequency.setValueAtTime(880, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1); gain.gain.setValueAtTime(0.08, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2); osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2); } catch(e) {} } function playDestroySound() { try { var ctx = new (window.AudioContext || window.webkitAudioContext)(); var osc = ctx.createOscillator(); var gain = ctx.createGain(); var shaper = ctx.createWaveShaper(); shaper.curve = new Float32Array([-1, -0.3, 0, 0.3, 1]); osc.connect(shaper); shaper.connect(gain); gain.connect(ctx.destination); osc.frequency.setValueAtTime(220, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.6); gain.gain.setValueAtTime(0.12, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8); osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.8); } catch(e) {} } function startLiveClock() { var el = document.getElementById('header-clock'); if (!el) return; function tick() { var now = new Date(); var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']; var dd = String(now.getUTCDate()).padStart(2,'0'); var hh = String(now.getUTCHours()).padStart(2,'0'); var mm = String(now.getUTCMinutes()).padStart(2,'0'); var ss = String(now.getUTCSeconds()).padStart(2,'0'); el.textContent = dd + ' ' + months[now.getUTCMonth()] + ' ' + now.getUTCFullYear() + ' \u00B7 ' + hh + ':' + mm + ':' + ss + ' UTC'; } tick(); setInterval(tick, 1000); } function updateHeaderStatus() { var statusEl = document.getElementById('header-status'); var textEl = document.getElementById('header-status-text'); if (!statusEl || !textEl) return; var scoreEl = document.getElementById('score-number'); var score = parseInt(scoreEl ? scoreEl.textContent : '100'); var simResult = document.getElementById('sim-result'); var isSimActive = simResult && simResult.classList.contains('visible'); if (isSimActive) { statusEl.className = 'header-status status-critical'; textEl.textContent = 'CASCADE ACTIVE'; } else if (score
                                                                                                                                                                < 60) { statusEl.className='header-status status-warning' ; textEl.textContent='RESILIENCE WARNING' ; } else { statusEl.className='header-status status-nominal' ; textEl.textContent='SYSTEM NOMINAL' ; } } function updateAlertsCount() { var el=document.getElementById('alerts-count'); if (!el) return; var count=0; if (typeof supplierData !=='undefined' ) { Object.keys(supplierData).forEach(function(id) { var s=supplierData[id]; if (s.risk>
                                                                                                                                                                  70) count++; if (s.certifications && s.certifications.expiryDates) { Object.keys(s.certifications.expiryDates).forEach(function(c) { var days = getDaysUntilExpiry(s.certifications.expiryDates[c]); if (days
                                                                                                                                                                  <= 90 && days>
                                                                                                                                                                    = 0) count++; }); } if (s.auditHistory) { s.auditHistory.forEach(function(a) { if (a.result === 'fail' || a.result === 'Failed') count++; }); } }); } count = Math.max(1, Math.min(99, count)); el.textContent = count; } // ===== PERSISTENT STATE ===== function saveState() { var state = { selectedNodeId: selectedNode ? selectedNode.id : null, watchlist: watchlist, layerView: document.getElementById('layer-select') ? document.getElementById('layer-select').value : 'executive', timeOffset: timeMachineOffset }; try { localStorage.setItem('aksci_state', JSON.stringify(state)); } catch(e) {} } setInterval(saveState, 5000); function restoreState() { try { var raw = localStorage.getItem('aksci_state'); if (!raw) return; var state = JSON.parse(raw); if (state.watchlist) { watchlist = state.watchlist; renderWatchlist(); updateWatchlistStars(); } if (state.layerView) { var sel = document.getElementById('layer-select'); if (sel) { sel.value = state.layerView; applyLayerView(state.layerView); } } if (state.timeOffset) { var slider = document.getElementById('time-slider'); if (slider) { slider.value = state.timeOffset; updateTimeMachine(); } } if (state.selectedNodeId && nodeMap[state.selectedNodeId]) { setTimeout(function() { selectNode(nodeMap[state.selectedNodeId]); }, 1500); } } catch(e) {} } // ===== DISRUPTION SEVERITY SLIDER ===== var disruptionSeverity = 1.0; function setupDisruptionSlider() { var slider = document.getElementById('disruption-slider'); if (!slider) return; slider.addEventListener('input', function() { disruptionSeverity = parseFloat(slider.value); document.getElementById('disruption-label').textContent = Math.round(disruptionSeverity * 100) + '%'; }); } function getDisruptionIntensity() { return disruptionSeverity; } // ===== RESILIENCE BOOSTER (Fix It) ===== function runResilienceBooster() { if (!selectedNode) { notify('Select a node first.', 'error'); return; } var d = selectedNode; var suggestions = []; if (d.type === 'supplier' || d.type === 'component') { // Find supplier or component's component var compId = null, supplierId = null; resolvedLinks.forEach(function(l) { var src = typeof l.source === 'object' ? l.source.id : l.source; var tgt = typeof l.target === 'object' ? l.target.id : l.target; if (d.type === 'supplier' && l.type === 'manufactures' && src === d.id) compId = tgt; if (d.type === 'component' && l.type === 'manufactures' && tgt === d.id) supplierId = src; }); // Suggest dual-source if (d.type === 'supplier') { var altCandidates = nodes.filter(function(n) { return n.type === 'supplier' && n.id !== d.id; }); if (altCandidates.length > 0) { var alt = altCandidates[Math.floor(Math.random() * altCandidates.length)]; suggestions.push('Qualify
                                                                                                                                                                    <strong>
                                                                                                                                                                      ' + alt.id.replace('_t', '') + '<
                                                                                                                                                                      /strong> as alternate supplier for ' + (compId ? compId.replace('_t', '') : 'components')); } else { suggestions.push('No immediate alternate supplier found — consider internal re-sourcing'); } } // Adjust inventory buffer var relatedComps = []; resolvedLinks.forEach(function(l) { var src = typeof l.source === 'object' ? l.source.id : l.source; var tgt = typeof l.target === 'object' ? l.target.id : l.target; if (d.type === 'supplier' && l.type === 'manufactures' && src === d.id) relatedComps.push(nodeMap[tgt]); if (d.type === 'component' && (l.type === 'manufactures' && tgt === d.id)) relatedComps.push(d); }); relatedComps.forEach(function(c) { if (c && c.qty !== undefined) { var boost = Math.round((c.reorder || 100) * 0.5); suggestions.push('Increase buffer stock for
                                                                                                                                                                      <strong>
                                                                                                                                                                        ' + c.id.replace('_t', '') + '<
                                                                                                                                                                        /strong> by ' + boost + ' units (from ' + c.qty + ' to ' + (c.qty + boost) + ')'); } }); } if (suggestions.length === 0) suggestions.push('Review risk mitigation strategies for
                                                                                                                                                                        <strong>
                                                                                                                                                                          ' + d.id.replace('_t', '') + '<
                                                                                                                                                                          /strong>'); var html = '
                                                                                                                                                                          <div style="padding:10px;background:rgba(52,211,153,0.06);border:1px solid rgba(52,211,153,0.15);border-radius:var(--r-sm);margin-top:8px;">
                                                                                                                                                                            '; html += '
                                                                                                                                                                            <div style="font-family:var(--font-heading);font-weight:600;font-size:0.78rem;color:var(--green);margin-bottom:8px;">
                                                                                                                                                                              ✦ Resilience Recommendations<
                                                                                                                                                                              /div>'; suggestions.forEach(function(s) { html += '
                                                                                                                                                                              <div style="font-size:0.72rem;color:var(--text-2);padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.03);">
                                                                                                                                                                                ' + s + '<
                                                                                                                                                                                /div>'; }); // Recalculate score impact var beforeScore = calculateResilience().score; // Simulate improvement var newScore = Math.min(100, beforeScore + Math.floor(suggestions.length * 4 + Math.random() * 5)); html += '
                                                                                                                                                                                <div style="margin-top:8px;padding-top:8px;border-top:1px solid rgba(255,255,255,0.06);display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:0.65rem;">
                                                                                                                                                                                  '; html += '
                                                                                                                                                                                  <span style="color:var(--text-2);">
                                                                                                                                                                                    Before:
                                                                                                                                                                                    <strong style="color:var(--red);">
                                                                                                                                                                                      ' + beforeScore + '<
                                                                                                                                                                                      /strong><
                                                                                                                                                                                      /span>'; html += '
                                                                                                                                                                                      <span style="color:var(--text-2);">
                                                                                                                                                                                        After:
                                                                                                                                                                                        <strong style="color:var(--green);">
                                                                                                                                                                                          ' + newScore + '<
                                                                                                                                                                                          /strong><
                                                                                                                                                                                          /span>'; html += '
                                                                                                                                                                                          <span style="color:var(--green);">
                                                                                                                                                                                            ▲ +' + (newScore - beforeScore) + '<
                                                                                                                                                                                            /span><
                                                                                                                                                                                            /div><
                                                                                                                                                                                            /div>'; notify('Resilience Booster applied — score projected to improve by ' + (newScore - beforeScore) + ' points', 'success'); var simResult = document.getElementById('sim-result'); simResult.innerHTML = html; simResult.classList.add('visible'); simResult.style.border = '1px solid rgba(52,211,153,0.2)'; simResult.style.background = 'rgba(52,211,153,0.04)'; // Update the score display with projected improvement var numEl = document.getElementById('score-number'); var ring = document.getElementById('score-ring'); var circumference = 2 * Math.PI * 52; var offset = circumference - (newScore / 100) * circumference; ring.style.transition = 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)'; ring.style.strokeDashoffset = offset; var displayScore = 0; var interval = setInterval(function() { displayScore++; numEl.textContent = displayScore; if (displayScore >= newScore) { clearInterval(interval); numEl.classList.add('bounce-update'); setTimeout(function() { numEl.classList.remove('bounce-update'); }, 500); } }, 15); prevResilienceScore = newScore; // Add rollback option simResult.innerHTML += '
                                                                                                                                                                                            <button class="btn-secondary" onclick="rollbackBooster()" style="margin-top:8px;font-size:0.6rem;padding:6px 12px;">
                                                                                                                                                                                              ↩ Rollback<
                                                                                                                                                                                              /button>'; window.__boosterRollback = function() { ring.style.transition = 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)'; var origOffset = circumference - (beforeScore / 100) * circumference; ring.style.strokeDashoffset = origOffset; numEl.textContent = beforeScore; prevResilienceScore = beforeScore; simResult.classList.remove('visible'); notify('Booster rollback applied.', 'info'); }; } window.rollbackBooster = function() { if (window.__boosterRollback) window.__boosterRollback(); }; // ===== DUAL-PROGRAM IMPACT HEATMAP & RECOVERY GANTT ===== function enhanceSimulationReport(startId, visited) { // Heatmap table: which suppliers affect which programs var supplierProgramMap = {}; visited.forEach(function(id) { var n = nodeMap[id]; if (n && n.type === 'supplier') { var programs = findProgramsForSupplier(n.id); programs.forEach(function(p) { if (!supplierProgramMap[p]) supplierProgramMap[p] = []; if (supplierProgramMap[p].indexOf(n.id.replace('_t', ''))
                                                                                                                                                                                              < 0) supplierProgramMap[p].push(n.id.replace('_t', '' )); }); } }); var heatHtml='<div style="margin-top:12px;">
                                                                                                                                                                                                <div class="gantt-title" style="margin-bottom:6px;">
                                                                                                                                                                                                  Program Impact Heatmap<
                                                                                                                                                                                                  /div>' ; heatHtml +='
                                                                                                                                                                                                  <table class="heatmap-table">
                                                                                                                                                                                                    <thead>
                                                                                                                                                                                                      <tr>
                                                                                                                                                                                                        <th>
                                                                                                                                                                                                          Supplier<
                                                                                                                                                                                                          /th>' ; var programs=Object.keys(supplierProgramMap); if (programs.length===0) { programs=['Artemis Program', 'Orion Capsule' ]; } programs.forEach(function(p) { heatHtml +='
                                                                                                                                                                                                          <th>
                                                                                                                                                                                                            ' + p.replace('_t', '' ) + '<
                                                                                                                                                                                                            /th>' ; }); heatHtml +='<
                                                                                                                                                                                                            /tr><
                                                                                                                                                                                                            /thead>
                                                                                                                                                                                                            <tbody>
                                                                                                                                                                                                              ' ; var supplierNames=new Set(); Object.keys(supplierProgramMap).forEach(function(p) { supplierProgramMap[p].forEach(function(s) { supplierNames.add(s); }); }); if (supplierNames.size===0) { // Fallback: find all suppliers in cascade visited.forEach(function(id) { var n=nodeMap[id]; if (n && n.type==='supplier' ) supplierNames.add(n.id.replace('_t', '' )); }); } supplierNames.forEach(function(sname) { heatHtml +='
                                                                                                                                                                                                              <tr>
                                                                                                                                                                                                                <td style="font-weight:500;">
                                                                                                                                                                                                                  ' + sname + '<
                                                                                                                                                                                                                  /td>' ; programs.forEach(function(p) { var affects=supplierProgramMap[p] && supplierProgramMap[p].indexOf(sname)>= 0; var cls = affects ? 'hm-high' : 'hm-none'; var icon = affects ? '●' : '○'; var label = affects ? 'Affected' : '—'; heatHtml += '
                                                                                                                                                                                                                  <td class="' + cls + '">
                                                                                                                                                                                                                    ' + icon + ' ' + label + '<
                                                                                                                                                                                                                    /td>'; }); heatHtml += '<
                                                                                                                                                                                                                    /tr>'; }); heatHtml += '<
                                                                                                                                                                                                                    /tbody><
                                                                                                                                                                                                                    /table><
                                                                                                                                                                                                                    /div>'; // Recovery Gantt var recovHtml = '
                                                                                                                                                                                                                    <div class="gantt-overlay" style="margin-top:12px;">
                                                                                                                                                                                                                      <div class="gantt-title">
                                                                                                                                                                                                                        Estimated Recovery Timeline<
                                                                                                                                                                                                                        /div>'; var ganttItems = [ { label: 'Re-tooling', days: 14, cls: 'retool' }, { label: 'Re-certification', days: 30, cls: 'recert' }, { label: 'Design Validation', days: 21, cls: 'design' }, { label: 'Logistics Setup', days: 10, cls: 'logistics' } ]; var maxDays = Math.max.apply(null, ganttItems.map(function(g) { return g.days; })); ganttItems.forEach(function(g) { var pct = (g.days / maxDays) * 100; recovHtml += '
                                                                                                                                                                                                                        <div class="gantt-row">
                                                                                                                                                                                                                          <span class="gantt-label">
                                                                                                                                                                                                                            ' + g.label + '<
                                                                                                                                                                                                                            /span>
                                                                                                                                                                                                                            <div class="gantt-track">
                                                                                                                                                                                                                              <div class="gantt-bar ' + g.cls + '" style="width:' + pct + '%;animation-delay:0.2s;"><
                                                                                                                                                                                                                                /div><
                                                                                                                                                                                                                                /div>
                                                                                                                                                                                                                                <span class="gantt-days">
                                                                                                                                                                                                                                  ' + g.days + 'd<
                                                                                                                                                                                                                                  /span><
                                                                                                                                                                                                                                  /div>'; }); recovHtml += '
                                                                                                                                                                                                                                  <div style="font-size:0.6rem;color:var(--text-3);margin-top:6px;text-align:center;">
                                                                                                                                                                                                                                    ⏱ Estimated recovery: ~' + maxDays + ' days to full operation<
                                                                                                                                                                                                                                    /div><
                                                                                                                                                                                                                                    /div>'; return heatHtml + recovHtml; } function findProgramsForSupplier(supplierId) { var result = new Set(); var queue = [supplierId]; var visited = new Set(); while (queue.length > 0) { var cur = queue.shift(); if (visited.has(cur)) continue; visited.add(cur); resolvedLinks.forEach(function(l) { var src = typeof l.source === 'object' ? l.source.id : l.source; var tgt = typeof l.target === 'object' ? l.target.id : l.target; if (src === cur) { if (nodeMap[tgt] && nodeMap[tgt].type === 'program') result.add(tgt); queue.push(tgt); } }); } return Array.from(result); } // ===== GEO RISK HEATMAP OVERLAY ===== var geoHotspots = [ { name: 'South China Sea', coords: [[105,-5],[115,-5],[120,5],[115,15],[110,20],[105,15],[100,10],[105,0]], risk: 85 }, { name: 'Ukraine', coords: [[30,46],[32,47],[34,48],[36,49],[38,50],[40,52],[38,52],[36,51],[34,50],[32,49],[30,48],[28,47],[30,46]], risk: 92 }, { name: 'Taiwan Strait', coords: [[118,22],[120,22],[122,24],[122,26],[120,28],[118,27],[117,25],[118,22]], risk: 88 }, { name: 'Middle East', coords: [[45,25],[50,25],[55,27],[55,30],[52,33],[48,33],[45,30],[44,28],[45,25]], risk: 75 } ]; function renderGeoRiskHeatmap() { var container = document.getElementById('geo-risk-heat'); if (!container) return; var html = ''; geoHotspots.forEach(function(hs) { html += '
                                                                                                                                                                                                                                    <div class="geo-hotspot active" style="position:absolute;pointer-events:auto;cursor:help;" title="' + hs.name + ' — Risk: ' + hs.risk + '/100"';            // Approximate positioning based on geo map projection            var minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;            hs.coords.forEach(function(c) { if (c[0] < minLng) minLng = c[0]; if (c[0] >
                                                                                                                                                                                                                                      maxLng) maxLng = c[0]; if (c[1]
                                                                                                                                                                                                                                      < minLat) minLat = c[1]; if (c[1] >
                                                                                                                                                                                                                                        maxLat) maxLat = c[1]; });            var dim = getDimensions();            var x1 = (minLng + 180) / 360 * dim.w;            var x2 = (maxLng + 180) / 360 * dim.w;            var y1 = (90 - maxLat) / 180 * dim.h;            var y2 = (90 - minLat) / 180 * dim.h;            html += ' style="left:' + x1 + 'px;top:' + y1 + 'px;width:' + (x2 - x1) + 'px;height:' + (y2 - y1) + 'px;background:rgba(240,82,82,0.12);border:1px solid rgba(240,82,82,0.2);border-radius:4px;"';            html += '>' + hs.name + '
                                                                                                                                                                                                                                        <span style="font-family:var(--font-mono);font-size:0.55rem;">
                                                                                                                                                                                                                                          ' + hs.risk + '<
                                                                                                                                                                                                                                          /span><
                                                                                                                                                                                                                                          /div>'; }); container.innerHTML = html; // Auto-increase risk for suppliers in hotspots nodes.forEach(function(n) { if (n.type === 'supplier') { var geo = supplierGeoCoords[n.id]; if (geo) { geoHotspots.forEach(function(hs) { var inX = geo.lng >= Math.min.apply(null, hs.coords.map(function(c) { return c[0]; })) && geo.lng
                                                                                                                                                                                                                                          <= Math.max.apply(null, hs.coords.map(function(c) { return c[0]; })); var inY=geo.lat>
                                                                                                                                                                                                                                            = Math.min.apply(null, hs.coords.map(function(c) { return c[1]; })) && geo.lat
                                                                                                                                                                                                                                            <= Math.max.apply(null, hs.coords.map(function(c) { return c[1]; })); if (inX && inY) { var boost=Math.round(hs.risk / 10); n._geoRiskBoost=boost; } }); } } }); } //=====SOURCING OPTIONS POPUP=====function showSourcingOptions(node) { var popup=document.getElementById('sourcing-popup'); if (!popup) return; if (!node || node.type !=='supplier' ) { popup.style.display='none' ; return; } var alternatives=nodes.filter(function(n) { return n.type==='supplier' && n.id !==node.id; }); var html='<div class="sp-title">
                                                                                                                                                                                                                                              🔍 Automated Sourcing Options<
                                                                                                                                                                                                                                              /div>' ; if (alternatives.length> 0) { alternatives.forEach(function(alt) { var dist = '—'; var sc = supplierGeoCoords[alt.id]; var nc = supplierGeoCoords[node.id]; if (sc && nc) { var d = Math.round(Math.sqrt(Math.pow(sc.lat - nc.lat, 2) + Math.pow(sc.lng - nc.lng, 2)) * 111); dist = d + ' km away'; } var certStatus = getSupplierCertStatus(alt); html += '
                                                                                                                                                                                                                                              <div class="sp-option">
                                                                                                                                                                                                                                                '; html += '
                                                                                                                                                                                                                                                <strong>
                                                                                                                                                                                                                                                  ' + alt.id.replace('_t', '') + '<
                                                                                                                                                                                                                                                  /strong> — Risk: ' + alt.risk + '/100 — ' + dist; html += '
                                                                                                                                                                                                                                                  <br>
                                                                                                                                                                                                                                                  <span style="font-size:0.65rem;color:var(--text-3);">
                                                                                                                                                                                                                                                    Certs: ' + (certStatus.fullyCertified ? '✅ All met' : '⚠ ' + certStatus.missing.length + ' missing') + '<
                                                                                                                                                                                                                                                    /span>'; html += '<
                                                                                                                                                                                                                                                    /div>'; }); } else { html += '
                                                                                                                                                                                                                                                    <div class="sp-critical">
                                                                                                                                                                                                                                                      ⚠ Critical Single-Point Failure. No alternative suppliers found. We recommend qualifying a new supplier based on geo-proximity and certifications.<
                                                                                                                                                                                                                                                      /div>'; } popup.innerHTML = html; popup.style.display = 'block'; } // ===== TASK WORKFLOW (Assign Buttons) ===== function enhanceActionPlanWithAssign() { var container = document.getElementById('action-plan-container'); if (!container) return; var items = container.querySelectorAll('.action-plan-item'); items.forEach(function(item, idx) { var dept = 'Procurement'; var person = 'John Doe'; if (idx === 1) { dept = 'Logistics'; person = 'Jane Smith'; } else if (idx === 2) { dept = 'Compliance'; person = 'Bob Chen'; } else if (idx === 3) { dept = 'Procurement'; person = 'Alice Kim'; } var assignBtn = document.createElement('span'); assignBtn.className = 'api-assign-btn'; assignBtn.textContent = 'Assign to ' + dept + ': ' + person; assignBtn.onclick = function(e) { e.stopPropagation(); showTaskAssignedModal(dept, person, item); }; var detailDiv = item.querySelector('.api-detail'); if (detailDiv) detailDiv.appendChild(document.createElement('br')); if (detailDiv) detailDiv.appendChild(assignBtn); }); } window.__originalGenerateActionPlan = generateActionPlan; generateActionPlan = function(startId, visited, affectedEdges) { window.__originalGenerateActionPlan(startId, visited, affectedEdges); setTimeout(enhanceActionPlanWithAssign, 100); }; function showTaskAssignedModal(dept, person, item) { var taskName = item ? item.textContent.trim().replace(/\s+/g, ' ').substring(0, 80) : 'Action item'; var overlay = document.createElement('div'); overlay.className = 'modal-overlay'; overlay.style.display = 'flex'; overlay.innerHTML = '
                                                                                                                                                                                                                                                      <div class="modal" style="max-width:400px;">
                                                                                                                                                                                                                                                        <div class="modal-header-section">
                                                                                                                                                                                                                                                          <h2>
                                                                                                                                                                                                                                                            ✅ Task Assigned<
                                                                                                                                                                                                                                                            /h2><
                                                                                                                                                                                                                                                            /div>
                                                                                                                                                                                                                                                            <div class="modal-body-section">
                                                                                                                                                                                                                                                              <p style="font-size:0.85rem;color:var(--text-1);margin-bottom:8px;">
                                                                                                                                                                                                                                                                "
                                                                                                                                                                                                                                                                <strong>
                                                                                                                                                                                                                                                                  ' + taskName + '<
                                                                                                                                                                                                                                                                  /strong>"<
                                                                                                                                                                                                                                                                  /p>
                                                                                                                                                                                                                                                                  <p style="font-size:0.78rem;color:var(--text-2);">
                                                                                                                                                                                                                                                                    Assigned to
                                                                                                                                                                                                                                                                    <strong style="color:var(--cyan);">
                                                                                                                                                                                                                                                                      ' + person + '<
                                                                                                                                                                                                                                                                      /strong> (' + dept + ')<
                                                                                                                                                                                                                                                                      /p>
                                                                                                                                                                                                                                                                      <p style="font-size:0.72rem;color:var(--text-3);margin-top:8px;">
                                                                                                                                                                                                                                                                        📅 Due: ' + new Date(Date.now() + 7 * 86400000).toLocaleDateString() + '<
                                                                                                                                                                                                                                                                        /p><
                                                                                                                                                                                                                                                                        /div>
                                                                                                                                                                                                                                                                        <div class="modal-footer-section">
                                                                                                                                                                                                                                                                          <button class="modal-close" onclick="this.closest(\'.modal-overlay\').remove()" style="width:100%;padding:10px;background:transparent;border:1px solid var(--border-2);color:var(--text-2);border-radius:var(--r-sm);cursor:pointer;">
                                                                                                                                                                                                                                                                            Close<
                                                                                                                                                                                                                                                                            /button><
                                                                                                                                                                                                                                                                            /div><
                                                                                                                                                                                                                                                                            /div>'; document.body.appendChild(overlay); overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); }; notify('Task assigned to ' + person + ' (' + dept + ')', 'success'); setTimeout(function() { overlay.remove(); }, 5000); } // ===== LAYER TOGGLING ===== function applyLayerView(view) { layerView = view; // Show/hide based on role if (view === 'executive') { document.getElementById('tb-tiers').style.display = 'none'; document.getElementById('tb-heatmap').style.display = 'none'; document.getElementById('tb-cert').style.display = 'none'; // Show only programs and high-level nodes d3.selectAll('.node-base').each(function(d) { var show = d.type === 'program' || d.type === 'assembly'; d3.select(this).style('display', show ? null : 'none'); }); d3.selectAll('.label-base').each(function(d) { var show = d.type === 'program' || d.type === 'assembly'; d3.select(this).style('display', show ? null : 'none'); }); notify('Executive View: Programs & Revenue at Risk shown', 'info'); } else if (view === 'procurement') { document.getElementById('tb-tiers').style.display = ''; document.getElementById('tb-heatmap').style.display = ''; document.getElementById('tb-cert').style.display = ''; d3.selectAll('.node-base').style('display', null); d3.selectAll('.label-base').style('display', null); // Highlight suppliers with expiring contracts, logistics routes if (!certificationMode) { document.getElementById('tb-cert').click(); document.getElementById('tb-cert').click(); } notify('Procurement View: Suppliers & logistics highlighted', 'info'); } else if (view === 'compliance') { document.getElementById('tb-tiers').style.display = 'none'; document.getElementById('tb-heatmap').style.display = 'none'; document.getElementById('tb-cert').style.display = ''; // Enable cert overlay if (!certificationMode) document.getElementById('tb-cert').click(); d3.selectAll('.node-base').style('display', null); d3.selectAll('.label-base').style('display', null); notify('Compliance View: Certification overlay active', 'info'); } if (window.__zoom) { svg.transition().duration(300).call(window.__zoom.transform, d3.zoomIdentity); } } // ===== BOARD DECK EXPORT ===== function exportBoardDeck() { var res = calculateResilience(); var topRisks = nodes.filter(function(n) { return n.type === 'supplier' && n.risk; }).sort(function(a,b) { return b.risk - a.risk; }).slice(0, 3); var affectedPrograms = nodes.filter(function(n) { return n.type === 'program' && n.revenue; }); var certStatus = nodes.filter(function(n) { return n.type === 'supplier'; }).map(function(n) { var cs = getSupplierCertStatus(n); return n.id.replace('_t', '') + ': ' + (cs.fullyCertified ? '✅Pass' : '❌' + cs.missing.join(',')); }).join('
                                                                                                                                                                                                                                                                            <br>
                                                                                                                                                                                                                                                                            '); var slides = [ { title: 'Resilience Score', content: '
                                                                                                                                                                                                                                                                            <div style="font-size:4rem;text-align:center;color:#00B8D9;padding:40px 0;">
                                                                                                                                                                                                                                                                              ' + res.score + '/100<
                                                                                                                                                                                                                                                                              /div>
                                                                                                                                                                                                                                                                              <div style="text-align:center;font-size:1.2rem;">
                                                                                                                                                                                                                                                                                ' + (res.score >= 80 ? 'Strong' : res.score >= 60 ? 'Moderate' : res.score >= 40 ? 'Fragile' : 'Critical') + '<
                                                                                                                                                                                                                                                                                /div>
                                                                                                                                                                                                                                                                                <div style="font-size:0.8rem;color:#666;text-align:center;margin-top:20px;">
                                                                                                                                                                                                                                                                                  Overall Supply Chain Resilience Score<
                                                                                                                                                                                                                                                                                  /div>' }, { title: 'Top 3 Risks', content: topRisks.map(function(r, i) { return '
                                                                                                                                                                                                                                                                                  <div style="margin:12px 0;padding:12px;background:#fef2f2;border-left:3px solid #E53E3E;font-size:1rem;">
                                                                                                                                                                                                                                                                                    <strong>
                                                                                                                                                                                                                                                                                      ' + (i+1) + '. ' + r.id.replace('_t', '') + '<
                                                                                                                                                                                                                                                                                      /strong> — Risk Score: ' + r.risk + '/100<
                                                                                                                                                                                                                                                                                      /div>'; }).join('') + '
                                                                                                                                                                                                                                                                                      <div style="font-size:0.85rem;color:#666;margin-top:12px;">
                                                                                                                                                                                                                                                                                        ' + res.suggestions.slice(0, 2).join('
                                                                                                                                                                                                                                                                                        <br>
                                                                                                                                                                                                                                                                                        ') + '<
                                                                                                                                                                                                                                                                                        /div>' }, { title: 'Cascade Impact Analysis', content: affectedPrograms.map(function(p) { return '
                                                                                                                                                                                                                                                                                        <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee;font-size:0.95rem;">
                                                                                                                                                                                                                                                                                          <span>
                                                                                                                                                                                                                                                                                            ' + p.id.replace('_t', '') + '<
                                                                                                                                                                                                                                                                                            /span>
                                                                                                                                                                                                                                                                                            <span style="font-weight:600;">
                                                                                                                                                                                                                                                                                              $' + (p.revenue || 0).toLocaleString() + '<
                                                                                                                                                                                                                                                                                              /span><
                                                                                                                                                                                                                                                                                              /div>'; }).join('') + '
                                                                                                                                                                                                                                                                                              <div style="margin-top:16px;font-size:0.85rem;color:#666;">
                                                                                                                                                                                                                                                                                                Potential cascade exposure across ' + affectedPrograms.length + ' active programs<
                                                                                                                                                                                                                                                                                                /div>' }, { title: 'Build Readiness Report', content: '
                                                                                                                                                                                                                                                                                                <div style="font-size:1.1rem;margin-bottom:12px;">
                                                                                                                                                                                                                                                                                                  Certification Compliance<
                                                                                                                                                                                                                                                                                                  /div>' + certStatus + '
                                                                                                                                                                                                                                                                                                  <div style="margin-top:16px;padding:12px;background:#f0f8ff;border-left:3px solid #00B8D9;font-size:0.85rem;">
                                                                                                                                                                                                                                                                                                    ' + (res.suggestions.length > 0 ? res.suggestions[0] : 'No critical issues') + '<
                                                                                                                                                                                                                                                                                                    /div>' }, { title: 'Strategic Recommendations', content: res.suggestions.map(function(s) { return '
                                                                                                                                                                                                                                                                                                    <div style="padding:10px 14px;margin:6px 0;background:#f9fafb;border-left:3px solid #00B8D9;font-size:0.9rem;line-height:1.5;">
                                                                                                                                                                                                                                                                                                      ✦ ' + s + '<
                                                                                                                                                                                                                                                                                                      /div>'; }).join('') } ]; var deckHtml = '
                                                                                                                                                                                                                                                                                                      <!DOCTYPE html>
                                                                                                                                                                                                                                                                                                        <html>
                                                                                                                                                                                                                                                                                                          <head>
                                                                                                                                                                                                                                                                                                            <meta charset="UTF-8">
                                                                                                                                                                                                                                                                                                            <title>
                                                                                                                                                                                                                                                                                                              Morningstar Board Deck<
                                                                                                                                                                                                                                                                                                              /title>
                                                                                                                                                                                                                                                                                                              <style>                    body {
                                                                                                                                                                                                                                                                                                                                      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                      padding: 0;
                      margin: 0;
                      background: #f3f4f6;
                    
                                                                                                                                                                                                                                                                                                              }                    slide {
                                                                                                                                                                                                                                                                                                                                      display: block;
                      width: 1000px;
                      height: 562px;
                      background: white;
                      margin: 20px auto;
                      padding: 48px 56px;
                      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
                      border-radius: 8px;
                      page-break-after: always;
                      position: relative;
                      overflow: hidden;
                    
                                                                                                                                                                                                                                                                                                              }                    slide h1 {
                                                                                                                                                                                                                                                                                                                                      font-size: 1.5rem;
                      color: #1a1a2e;
                      border-bottom: 3px solid #00B8D9;
                      padding-bottom: 12px;
                      margin-bottom: 24px;
                    
                                                                                                                                                                                                                                                                                                              }                    .footer {
                                                                                                                                                                                                                                                                                                                                      position: absolute;
                      bottom: 24px;
                      left: 56px;
                      right: 56px;
                      font-size: 0.65rem;
                      color: #999;
                      border-top: 1px solid #eee;
                      padding-top: 12px;
                      text-align: center;
                    
                                                                                                                                                                                                                                                                                                              }                  
                                                                                                                                                                                                                                                                                                              </style><
                                                                                                                                                                                                                                                                                                              /head>
                                                                                                                                                                                                                                                                                                              <body>
                                                                                                                                                                                                                                                                                                                '; slides.forEach(function(slide, idx) { deckHtml += '
                                                                                                                                                                                                                                                                                                                <slide>
                                                                                                                                                                                                                                                                                                                  <h1>
                                                                                                                                                                                                                                                                                                                    ' + slide.title + '<
                                                                                                                                                                                                                                                                                                                    /h1>' + slide.content + '
                                                                                                                                                                                                                                                                                                                    <div class="footer">
                                                                                                                                                                                                                                                                                                                      Morningstar · Aerospace Supply Chain Intelligence · Slide ' + (idx+1) + '/5<
                                                                                                                                                                                                                                                                                                                      /div><
                                                                                                                                                                                                                                                                                                                      /slide>'; }); deckHtml += '<
                                                                                                                                                                                                                                                                                                                      /body><
                                                                                                                                                                                                                                                                                                                      /html>'; var blob = new Blob([deckHtml], { type: 'text/html' }); var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href = url; a.download = 'Morningstar_Board_Deck_' + new Date().toISOString().slice(0,10) + '.html'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); notify('Board deck (5 slides) downloaded.', 'success'); } // ===== WHAT-IF CONSOLIDATION ===== function analyzeConsolidation() { // Find similar components (same name prefix) var groups = {}; nodes.forEach(function(n) { if (n.type === 'component') { var baseName = n.id.replace('_t', '').replace(/\s\d+$/, ''); if (!groups[baseName]) groups[baseName] = []; groups[baseName].push(n.id); } }); var consolidated = []; Object.keys(groups).forEach(function(g) { if (groups[g].length > 1) { var comps = groups[g]; var suppliers = []; comps.forEach(function(cid) { resolvedLinks.forEach(function(l) { var src = typeof l.source === 'object' ? l.source.id : l.source; var tgt = typeof l.target === 'object' ? l.target.id : l.target; if (l.type === 'manufactures' && tgt === cid) suppliers.push(src); }); }); var uniqueSupps = suppliers.filter(function(v,i,a) { return a.indexOf(v) === i; }); if (uniqueSupps.length > 1) { consolidated.push({ group: g, components: comps, suppliers: uniqueSupps }); } } }); var card = document.getElementById('consolidation-card'); if (!card) return; if (consolidated.length > 0) { var html = '
                                                                                                                                                                                                                                                                                                                      <div class="cc-title">
                                                                                                                                                                                                                                                                                                                        💡 Sourcing Consolidation Opportunity<
                                                                                                                                                                                                                                                                                                                        /div>'; consolidated.forEach(function(c) { var names = c.suppliers.map(function(s) { return s.replace('_t', ''); }); html += '
                                                                                                                                                                                                                                                                                                                        <div class="cc-detail" style="margin-bottom:6px;">
                                                                                                                                                                                                                                                                                                                          '; html += '
                                                                                                                                                                                                                                                                                                                          <strong>
                                                                                                                                                                                                                                                                                                                            ' + c.group + '<
                                                                                                                                                                                                                                                                                                                            /strong> sourced from ' + names.join(' & ') + '
                                                                                                                                                                                                                                                                                                                            <br>
                                                                                                                                                                                                                                                                                                                            '; html += '
                                                                                                                                                                                                                                                                                                                            <span style="color:var(--green);">
                                                                                                                                                                                                                                                                                                                              Consolidate to ' + names[0] + ': save ~15% on logistics<
                                                                                                                                                                                                                                                                                                                              /span>
                                                                                                                                                                                                                                                                                                                              <br>
                                                                                                                                                                                                                                                                                                                              '; html += '
                                                                                                                                                                                                                                                                                                                              <span style="color:var(--amber);">
                                                                                                                                                                                                                                                                                                                                Risk increases by ~10% — recommend hybrid approach (80/20 split)<
                                                                                                                                                                                                                                                                                                                                /span>'; html += '<
                                                                                                                                                                                                                                                                                                                                /div>'; }); card.innerHTML = html; card.style.display = 'block'; } else { card.style.display = 'none'; } } // ===== AI CHAT UNLOCK ===== function setupAiChat() { var input = document.querySelector('.ai-chat-input input'); var sendBtn = document.querySelector('.chat-send'); var lockEl = document.querySelector('.ai-chat-lock'); var messagesEl = document.querySelector('.ai-chat-messages'); if (!input || !sendBtn || !lockEl) return; // Unlock the chat input.disabled = false; input.placeholder = 'Ask about your supply chain...'; lockEl.innerHTML = '
                                                                                                                                                                                                                                                                                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                                                                                                                                                                                                                                                                                                  <rect x="3" y="11" width="18" height="11" rx="2" />
                                                                                                                                                                                                                                                                                                                                  <path d="M7 11V7a5 5 0 0 1 10 0v4" /><
                                                                                                                                                                                                                                                                                                                                  /svg> Chat unlocked — AI Analyst ready'; lockEl.style.cursor = 'default'; function processChatQuery(query) { var lower = query.toLowerCase(); // Handle "show me all suppliers with ITAR expiring in Q3" var expireMatch = lower.match(/itar.*expir|expir.*itar/i); if (expireMatch || (lower.indexOf('itar') >= 0 && lower.indexOf('expir') >= 0)) { var expiring = []; nodes.forEach(function(n) { if (n.type === 'supplier' && n.certifications && n.certifications.expiryDates && n.certifications.expiryDates.itar) { var days = getDaysUntilExpiry(n.certifications.expiryDates.itar); if (days
                                                                                                                                                                                                                                                                                                                                  <= 120) expiring.push(n); } }); if (expiring.length>
                                                                                                                                                                                                                                                                                                                                    0) { // Zoom to them var extents = { xMin: Infinity, xMax: -Infinity, yMin: Infinity, yMax: -Infinity }; expiring.forEach(function(n) { if (n.x
                                                                                                                                                                                                                                                                                                                                    < extents.xMin) extents.xMin=n.x; if (n.x>
                                                                                                                                                                                                                                                                                                                                      extents.xMax) extents.xMax = n.x; if (n.y
                                                                                                                                                                                                                                                                                                                                      < extents.yMin) extents.yMin=n.y; if (n.y>
                                                                                                                                                                                                                                                                                                                                        extents.yMax) extents.yMax = n.y; }); if (window.__zoom && extents.xMin !== Infinity) { var dim = getDimensions(); var scale = Math.min(dim.w / (extents.xMax - extents.xMin + 100), dim.h / (extents.yMax - extents.yMin + 100), 3); var tx = dim.w / 2 - (extents.xMin + extents.xMax) / 2 * scale; var ty = dim.h / 2 - (extents.yMin + extents.yMax) / 2 * scale; svg.transition().duration(600).call(window.__zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale)); } return 'Found
                                                                                                                                                                                                                                                                                                                                        <span class="hl">
                                                                                                                                                                                                                                                                                                                                          ' + expiring.length + ' suppliers<
                                                                                                                                                                                                                                                                                                                                          /span> with ITAR expiring in Q3: ' + expiring.map(function(n) { return '
                                                                                                                                                                                                                                                                                                                                          <span class="warn">
                                                                                                                                                                                                                                                                                                                                            ' + n.id.replace('_t', '') + '<
                                                                                                                                                                                                                                                                                                                                            /span>'; }).join(', ') + '.'; } return 'No suppliers with ITAR certifications expiring in Q3 found.'; } // Handle "protect Artemis Program" if (lower.indexOf('protect') >= 0 || lower.indexOf('lock') >= 0) { var progMatch = lower.match(/(artemis|orion)/i); if (progMatch) { var progName = progMatch[0].charAt(0).toUpperCase() + progMatch[0].slice(1); var progNode = null; nodes.forEach(function(n) { if (n.type === 'program' && n.id.toLowerCase().indexOf(progMatch[0]) >= 0) progNode = n; }); if (progNode) { // Highlight and zoom selectNode(progNode); if (window.__zoom) { var dim = getDimensions(); svg.transition().duration(600).call(window.__zoom.transform, d3.zoomIdentity.translate(dim.w / 2 - progNode.x * 1.5, dim.h / 2 - progNode.y * 1.5).scale(1.5)); } // Add bounding box d3.selectAll('.protect-box').remove(); var box = zoomG.append('rect').attr('class', 'protect-box') .attr('x', progNode.x - 60).attr('y', progNode.y - 60) .attr('width', 120).attr('height', 120) .attr('fill', 'none').attr('stroke', 'var(--red)') .attr('stroke-width', 2).attr('stroke-dasharray', '8,4') .attr('rx', 8).attr('opacity', 0); box.transition().duration(400).attr('opacity', 0.8).attr('stroke-dasharray', '0,0'); return '✅
                                                                                                                                                                                                                                                                                                                                            <span class="good">
                                                                                                                                                                                                                                                                                                                                              ' + progName + ' Program protected.<
                                                                                                                                                                                                                                                                                                                                              /span> Critical asset locked with bounding box. Monitoring all downstream dependencies.'; } } } // Handle filtering suppliers by risk var riskMatch = lower.match(/risk\s*([
                                                                                                                                                                                                                                                                                                                                              <>
                                                                                                                                                                                                                                                                                                                                                ])\s*(\d+)/); if (riskMatch) { var op = riskMatch[1]; var val = parseInt(riskMatch[2]); var filtered = nodes.filter(function(n) { return n.type === 'supplier' && (op === '>' ? (n.risk > val) : (n.risk
                                                                                                                                                                                                                                                                                                                                                < val)); }); if (filtered.length>
                                                                                                                                                                                                                                                                                                                                                  0) { // Zoom to them var extents = { xMin: Infinity, xMax: -Infinity, yMin: Infinity, yMax: -Infinity }; filtered.forEach(function(n) { if (n.x
                                                                                                                                                                                                                                                                                                                                                  < extents.xMin) extents.xMin=n.x; if (n.x>
                                                                                                                                                                                                                                                                                                                                                    extents.xMax) extents.xMax = n.x; if (n.y
                                                                                                                                                                                                                                                                                                                                                    < extents.yMin) extents.yMin=n.y; if (n.y>
                                                                                                                                                                                                                                                                                                                                                      extents.yMax) extents.yMax = n.y; }); if (window.__zoom) { var dim = getDimensions(); var scale = Math.min(dim.w / (extents.xMax - extents.xMin + 100), dim.h / (extents.yMax - extents.yMin + 100), 2.5); svg.transition().duration(600).call(window.__zoom.transform, d3.zoomIdentity.translate(dim.w / 2 - (extents.xMin + extents.xMax) / 2 * scale, dim.h / 2 - (extents.yMin + extents.yMax) / 2 * scale).scale(scale)); } return 'Found
                                                                                                                                                                                                                                                                                                                                                      <span class="hl">
                                                                                                                                                                                                                                                                                                                                                        ' + filtered.length + ' suppliers<
                                                                                                                                                                                                                                                                                                                                                        /span> with risk ' + op + ' ' + val + ': ' + filtered.map(function(n) { return '
                                                                                                                                                                                                                                                                                                                                                        <span class="warn">
                                                                                                                                                                                                                                                                                                                                                          ' + n.id.replace('_t', '') + '<
                                                                                                                                                                                                                                                                                                                                                          /span>'; }).join(', ') + '.'; } return 'No suppliers match risk ' + op + ' ' + val + '.'; } // Handle "Show me suppliers in [region]" var regionMatch = lower.match(/supplier.*(asia|apac|europe|north america|singapore|japan)/i); if (regionMatch) { var region = regionMatch[1].toLowerCase(); var filtered = []; Object.keys(supplierGeoCoords).forEach(function(sid) { var geo = supplierGeoCoords[sid]; if (!geo) return; if ((region === 'asia' || region === 'apac') && geo.lng > 60 && geo.lat > 0) filtered.push(nodeMap[sid]); else if (region === 'europe' && geo.lng > -10 && geo.lng
                                                                                                                                                                                                                                                                                                                                                          < 40 && geo.lat>
                                                                                                                                                                                                                                                                                                                                                            35) filtered.push(nodeMap[sid]); else if (region === 'north america' && geo.lng
                                                                                                                                                                                                                                                                                                                                                            < -60) filtered.push(nodeMap[sid]); else if (region==='singapore' && geo.city==='Singapore' ) filtered.push(nodeMap[sid]); else if (region==='japan' && geo.city==='Tokyo' ) filtered.push(nodeMap[sid]); }); if (filtered.length>
                                                                                                                                                                                                                                                                                                                                                              0) { return 'Found
                                                                                                                                                                                                                                                                                                                                                              <span class="hl">
                                                                                                                                                                                                                                                                                                                                                                ' + filtered.length + ' suppliers<
                                                                                                                                                                                                                                                                                                                                                                /span> in ' + regionMatch[1] + ': ' + filtered.map(function(n) { return '
                                                                                                                                                                                                                                                                                                                                                                <span class="warn">
                                                                                                                                                                                                                                                                                                                                                                  ' + n.id.replace('_t', '') + '<
                                                                                                                                                                                                                                                                                                                                                                  /span>'; }).join(', ') + '.'; } } return 'I understand you asked: "' + query + '" — try asking about supplier risks, certifications, or program protection.'; } function sendChatMessage() { var text = input.value.trim(); if (!text) return; input.value = ''; // Add user message var userMsg = document.createElement('div'); userMsg.className = 'ai-chat-msg user'; userMsg.innerHTML = '
                                                                                                                                                                                                                                                                                                                                                                  <div class="msg-avatar">
                                                                                                                                                                                                                                                                                                                                                                    U<
                                                                                                                                                                                                                                                                                                                                                                    /div>
                                                                                                                                                                                                                                                                                                                                                                    <div class="msg-bubble">
                                                                                                                                                                                                                                                                                                                                                                      ' + text + '<
                                                                                                                                                                                                                                                                                                                                                                      /div>'; messagesEl.appendChild(userMsg); messagesEl.scrollTop = messagesEl.scrollHeight; // Show typing indicator var typing = document.createElement('div'); typing.className = 'ai-chat-typing'; typing.innerHTML = '
                                                                                                                                                                                                                                                                                                                                                                      <span><
                                                                                                                                                                                                                                                                                                                                                                        /span>
                                                                                                                                                                                                                                                                                                                                                                        <span><
                                                                                                                                                                                                                                                                                                                                                                          /span>
                                                                                                                                                                                                                                                                                                                                                                          <span><
                                                                                                                                                                                                                                                                                                                                                                            /span>'; messagesEl.appendChild(typing); messagesEl.scrollTop = messagesEl.scrollHeight; // Process after delay setTimeout(function() { if (typing.parentNode) typing.parentNode.removeChild(typing); var response = processChatQuery(text); var botMsg = document.createElement('div'); botMsg.className = 'ai-chat-msg bot'; botMsg.innerHTML = '
                                                                                                                                                                                                                                                                                                                                                                            <div class="msg-avatar">
                                                                                                                                                                                                                                                                                                                                                                              AI<
                                                                                                                                                                                                                                                                                                                                                                              /div>
                                                                                                                                                                                                                                                                                                                                                                              <div class="msg-bubble">
                                                                                                                                                                                                                                                                                                                                                                                ' + response + '<
                                                                                                                                                                                                                                                                                                                                                                                /div>'; messagesEl.appendChild(botMsg); messagesEl.scrollTop = messagesEl.scrollHeight; }, 1000 + Math.random() * 1000); } sendBtn.onclick = sendChatMessage; input.addEventListener('keydown', function(e) { if (e.key === 'Enter') sendChatMessage(); }); } // ===== ENHANCED TICKER INTERACTIVITY ===== function enhanceTicker() { // Patch ticker spawn to auto-highlight dependent nodes and recalc revenue window.__origSpawnTicker = spawnTickerEvent; spawnTickerEvent = function() { var event = tickerEvents[Math.floor(Math.random() * tickerEvents.length)]; var container = document.getElementById('ticker-container'); if (!container) return; var el = document.createElement('div'); el.className = 'ticker-item'; el.innerHTML = event.msg.replace('_t', ''); container.appendChild(el); currentTickerItems.push(el); var duration = 8000, startTime = Date.now(); (function animateTicker() { var elapsed = Date.now() - startTime, progress = elapsed / duration; if (progress >= 1) { if (el.parentNode) el.parentNode.removeChild(el); var idx = currentTickerItems.indexOf(el); if (idx >= 0) currentTickerItems.splice(idx, 1); return; } var containerW = container.offsetWidth || 400; el.style.left = (containerW + (-containerW - el.offsetWidth) * progress) + 'px'; requestAnimationFrame(animateTicker); })(); el.addEventListener('click', function() { if (event.nodeId && nodeMap[event.nodeId]) { var clickedNode = nodeMap[event.nodeId]; selectNode(clickedNode); // Instead of just boosting risk, highlight all dependent nodes var downstream = getDownstreamNodes(event.nodeId); d3.selectAll('.node-base').classed('node-dim', true); downstream.forEach(function(id) { d3.selectAll('.node-base').filter(function(d) { return d.id === id; }).classed('node-dim', false).classed('node-highlight', true); }); d3.selectAll('.node-base').filter(function(d) { return d.id === event.nodeId; }).classed('node-highlight', true).classed('node-dim', false); // Auto-recalculate revenue at risk var revAtRisk = 0; downstream.forEach(function(id) { var n = nodeMap[id]; if (n && n.revenue) revAtRisk += n.revenue; }); // Update cascade counter var counterEl = document.getElementById('cascade-counter'); counterEl.classList.add('visible'); document.getElementById('cc-nodes').textContent = downstream.size; document.getElementById('cc-revenue').textContent = '$' + revAtRisk.toLocaleString(); // Boost risk boostedRisks[event.nodeId] = (boostedRisks[event.nodeId] || 0) + 1; updateResilience(); if (heatmapMode) updateHeatmap(); notify('🔴 TICKER: ' + event.msg.replace('_t', '') + ' — ' + downstream.size + ' nodes affected, $' + revAtRisk.toLocaleString() + ' at risk', 'error'); setTimeout(function() { if (boostedRisks[event.nodeId]) { boostedRisks[event.nodeId]--; if (boostedRisks[event.nodeId]
                                                                                                                                                                                                                                                                                                                                                                                <= 0) delete boostedRisks[event.nodeId]; updateResilience(); if (heatmapMode) updateHeatmap(); } d3.selectAll('.node-base').classed('node-dim', false).classed('node-highlight', false); counterEl.classList.remove('visible'); }, 30000); } }); }; } //=====NORMALIZE DATA=====function normalizeData(){nodes.forEach(function(n){if(typeof n.id==='string')n.id=n.id.trim();if(typeof n.type==='string')n.type=n.type.trim();if(n.certifications){Object.keys(n.certifications).forEach(function(k){if(typeof n.certifications[k]==='string')n.certifications[k]=n.certifications[k].trim()})}if(n.profile&&n.profile.badges)n.profile.badges=n.profile.badges.map(function(b){return typeof b==='string'?b.trim():b})});links.forEach(function(l){if(typeof l.source==='string')l.source=l.source.trim();if(typeof l.target==='string')l.target=l.target.trim();if(typeof l.type==='string')l.type=l.type.trim()});TIER_NAMES=TIER_NAMES.map(function(t){return t.trim()});} //=====INIT=====function init() { normalizeData(); initParticles(); buildGraph(); updateResilience(); startResilienceAutoRecalc(); startLiveClock(); updateHeaderStatus(); // Toolbar document.getElementById('tb-zoomin').addEventListener('click', zoomIn); document.getElementById('tb-zoomout').addEventListener('click', zoomOut); document.getElementById('tb-reset').addEventListener('click', resetView); document.getElementById('tb-fit').addEventListener('click', fitGraph); document.getElementById('tb-labels').addEventListener('click', toggleLabels); document.getElementById('tb-tiers').addEventListener('click', toggleTierMode); document.getElementById('tb-heatmap').addEventListener('click', toggleHeatmap); document.getElementById('tb-cert').addEventListener('click', toggleCertMode); document.getElementById('tb-3d').addEventListener('click', toggle3D); document.getElementById('tb-geo').addEventListener('click', toggleGeoMode); // Resilience card document.getElementById('resilience-card').addEventListener('click', openResilienceModal); document.getElementById('header-view-score').addEventListener('click', function() { document.getElementById('resilience-card').click(); }); // Simulation document.getElementById('btn-simulate').addEventListener('click', runSimulation); document.getElementById('btn-clear-sim').addEventListener('click', function() { clearSimulation(); }); document.getElementById('btn-compare').addEventListener('click', function() { if (selectedNode) { openScenarioComparison(); } else { notify('Select a node first.', 'error' ); } }); // Inventory document.getElementById('btn-inventory').addEventListener('click', openInventory); document.getElementById('inv-close').addEventListener('click', function() { document.getElementById('inventory-overlay').classList.remove('visible'); }); // Inventory pills document.querySelectorAll('.inv-pill').forEach(function(pill) { pill.addEventListener('click', function() { // Processing bar animation var bar=document.getElementById('inv-processing-bar'); bar.classList.add('active'); setTimeout(function() { bar.classList.remove('active'); }, 400); document.querySelectorAll('.inv-pill').forEach(function(p) { p.classList.remove('active'); }); pill.classList.add('active'); buildInventory(pill.dataset.whs); }); }); // Shortcuts document.getElementById('btn-shortcuts').addEventListener('click', function() { toggleModal('modal-shortcuts'); }); // Modal close buttons document.querySelectorAll('.modal-close').forEach(function(btn) { btn.addEventListener('click', function() { var modalId=btn.dataset.modal; if (modalId) document.getElementById(modalId).classList.remove('visible'); }); }); // Click overlay to close document.querySelectorAll('.modal-overlay').forEach(function(overlay) { overlay.addEventListener('click', function(e) { if (e.target===overlay) overlay.classList.remove('visible'); }); }); // Time machine var timeSlider=document.getElementById('time-slider'); if (timeSlider) { timeSlider.addEventListener('input', updateTimeMachine); } // Benchmark initial updateBenchmark(); // Start ticker startTicker(); // Cooperative procurement (enhanced) updateCooperativeProcurementEnhanced(); // AI Summary document.getElementById('btn-ai-summary').addEventListener('click', generateAiNarrative); // Export Report document.getElementById('btn-export-report').addEventListener('click', exportRiskReport); // Search bar setupSearchBar(); // Revenue Impact Calculator setupRevenueImpactCalculator(); // Persistent State restoreState(); // Disruption Slider setupDisruptionSlider(); // Resilience Booster document.getElementById('btn-booster').addEventListener('click', runResilienceBooster); // Layer Toggling document.getElementById('layer-select').addEventListener('change', function() { applyLayerView(this.value); }); // Board Deck Export document.getElementById('btn-board-deck').addEventListener('click', exportBoardDeck); // Sourcing Options - show when supplier selected var origSelect2=selectNode; selectNode=function(d) { origSelect2(d); if (d.type==='supplier' ) { showSourcingOptions(d); } else { var popup=document.getElementById('sourcing-popup'); if (popup) popup.style.display='none' ; } }; // Geo Risk Heatmap renderGeoRiskHeatmap(); // What-If Consolidation analyzeConsolidation(); // AI Chat Unlock setupAiChat(); // Enhanced Ticker enhanceTicker(); // Tab switching document.querySelectorAll('.tab-btn').forEach(function(btn) { btn.addEventListener('click', function() { document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); }); document.querySelectorAll('.tab-content').forEach(function(tc) { tc.classList.remove('active'); }); btn.classList.add('active'); var tabId='tab-' + btn.dataset.tab; var tabEl=document.getElementById(tabId); if (tabEl) tabEl.classList.add('active'); if (btn.dataset.tab==='watchlist' ) renderWatchlist(); }); }); // Watchlist stars on node click - add star toggle to supplier profile too updateWatchlistStars(); // Initial watchlist render renderWatchlist(); // Collapsible left panel cards document.querySelectorAll('.lp-card-header[data-toggle]').forEach(function(header) { header.addEventListener('click', function() { var card=header.closest('.lp-card'); card.classList.toggle('collapsed'); card.classList.toggle('open'); }); }); // Right panel tab switching document.querySelectorAll('.tab-btn[data-tab]').forEach(function(btn) { btn.addEventListener('click', function() { document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); }); btn.classList.add('active'); document.querySelectorAll('.tab-content').forEach(function(tc) { tc.classList.remove('active'); }); var target=document.getElementById('tab-' + btn.getAttribute('data-tab')); if (target) target.classList.add('active'); }); }); setupDrawers(); // Platform brief dismissal var brief=document.getElementById('platform-brief'); var briefSeen=sessionStorage.getItem('aksci_brief_seen'); if (briefSeen) { brief.classList.add('hidden'); } else { document.getElementById('pb-dismiss').addEventListener('click', function() { brief.classList.add('hidden'); sessionStorage.setItem('aksci_brief_seen', '1' ); }); } // Print dossier button document.getElementById('btn-print-dossier').addEventListener('click', function() { window.print(); }); // Alerts chip cycles: cert overlay ->
                                                                                                                                                                                                                                                                                                                                                                                  supplier profiles var alertsCycleStep = 0; document.getElementById('header-alerts-chip').addEventListener('click', function() { alertsCycleStep = (alertsCycleStep + 1) % 3; if (alertsCycleStep === 0) { document.getElementById('tb-cert').click(); document.getElementById('tb-cert').click(); } else if (alertsCycleStep === 1) { document.getElementById('tb-cert').click(); } else { var criticalNodes = nodes.filter(function(n) { return n.type === 'supplier' && n.risk > 70; }); if (criticalNodes.length > 0) { openSupplierProfile(criticalNodes[Math.floor(Math.random() * criticalNodes.length)]); } } }); // Expose build readiness to global scope window.runBuildReadiness = function(node) { runBuildReadiness(node); }; // Easter egg document.getElementById('score-number').addEventListener('click', handleDestructionClick); // Handle window resize var resizeTimer; window.addEventListener('resize', function() { clearTimeout(resizeTimer); resizeTimer = setTimeout(function() { var dim = getDimensions(); resizeParticleCanvas(); if (window.__sim) { window.__sim.force('center', d3.forceCenter(dim.w / 2, dim.h / 2)); window.__sim.alpha(0.1).restart(); } }, 300); }); // Auto-clear sim on new node selection var origSelect = selectNode; selectNode = function(d) { clearSimulation(false); origSelect(d); }; notify('Capabilities demo loaded. Click nodes to explore. Score recalculates every 60s. Click the score 5 times fast for a surprise.', 'success'); } document.addEventListener('DOMContentLoaded', init);})();
