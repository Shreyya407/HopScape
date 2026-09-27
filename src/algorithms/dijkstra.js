/**
 * Dijkstra's Shortest Path Algorithm with Step-by-Step Recording
 */

import { buildAdjacencyMap } from '../graph/graph.js';

export function runDijkstra(nodes, edges, sourceId, destId) {
  const adj = buildAdjacencyMap(nodes, edges);
  const nodeIds = nodes.map(n => n.id).sort();

  if (!sourceId || !nodeIds.includes(sourceId)) {
    return { error: 'Invalid source node' };
  }

  // Structures for Dijkstra
  // dist: minimum known distance from source to node
  // prev: predecessor node on shortest path
  // permanent: Set of nodes whose shortest path is finalized (N')
  const dist = {};
  const prev = {};
  const permanent = new Set();
  const steps = [];
  const events = [];
  let totalRelaxations = 0;

  // Initialization (Step 0)
  for (const u of nodeIds) {
    if (u === sourceId) {
      dist[u] = 0;
      prev[u] = null;
    } else if (adj[sourceId] && adj[sourceId][u] !== undefined) {
      dist[u] = adj[sourceId][u];
      prev[u] = sourceId;
    } else {
      dist[u] = Infinity;
      prev[u] = null;
    }
  }

  // Clone state helper
  const snapshot = (selectedNode = null, relaxedNeighbors = []) => ({
    dist: { ...dist },
    prev: { ...prev },
    permanent: Array.from(permanent),
    tentative: nodeIds.filter(n => !permanent.has(n)),
    selectedNode,
    relaxedNeighbors: [...relaxedNeighbors],
  });

  // Step 0 Event: Source initialization
  permanent.add(sourceId);
  
  steps.push({
    stepIndex: 0,
    type: 'initialization',
    description: `Initialize Dijkstra from source "${sourceId}". Distance to self is 0, direct neighbors loaded, non-neighbors ∞.`,
    state: snapshot(sourceId, Object.keys(adj[sourceId] || {})),
  });

  events.push({
    step: 0,
    type: 'init',
    title: `Dijkstra Init: Source "${sourceId}" Settled`,
    description: `Source node ${sourceId} is marked as permanent (dist = 0). Direct neighbors inspected.`,
    selectedNode: sourceId,
    permanentNodes: [sourceId],
    tentativeNodes: nodeIds.filter(n => n !== sourceId),
    distances: { ...dist },
    predecessors: { ...prev },
    activeNodes: [sourceId],
    activeEdges: Object.keys(adj[sourceId] || {}).map(nbr => [sourceId, nbr].sort().join('-')),
  });

  let stepCount = 1;

  // Main Dijkstra Loop
  while (permanent.size < nodeIds.length) {
    // Find unvisited node with minimum tentative distance
    let minNode = null;
    let minDist = Infinity;

    for (const u of nodeIds) {
      if (!permanent.has(u)) {
        if (dist[u] < minDist) {
          minDist = dist[u];
          minNode = u;
        }
      }
    }

    // If remaining nodes are unreachable (dist = Infinity)
    if (!minNode || minDist === Infinity) {
      break;
    }

    // Add minNode to permanent set
    permanent.add(minNode);

    const relaxedThisStep = [];
    const neighbors = Object.keys(adj[minNode] || {}).filter(v => !permanent.has(v));

    // Relax all unvisited neighbors of minNode
    for (const v of neighbors) {
      const edgeCost = adj[minNode][v];
      const newDist = dist[minNode] + edgeCost;

      if (newDist < dist[v]) {
        const oldDist = dist[v];
        dist[v] = newDist;
        prev[v] = minNode;
        totalRelaxations++;

        relaxedThisStep.push({
          neighbor: v,
          via: minNode,
          oldDist,
          newDist,
          edgeCost,
          explanation: `Updated distance to ${v}: dist(${minNode}) [${dist[minNode]}] + cost(${minNode}, ${v}) [${edgeCost}] = ${newDist} (was ${oldDist === Infinity ? '∞' : oldDist})`
        });
      }
    }

    steps.push({
      stepIndex: stepCount,
      type: 'step',
      selectedNode: minNode,
      selectedDist: minDist,
      relaxed: relaxedThisStep,
      description: `Step ${stepCount}: Router "${minNode}" selected (min dist = ${minDist}). ${relaxedThisStep.length} neighbor distance(s) relaxed.`,
      state: snapshot(minNode, relaxedThisStep.map(r => r.neighbor)),
    });

    events.push({
      step: stepCount,
      type: 'step',
      title: `Step ${stepCount}: Router "${minNode}" Settled (Cost: ${minDist})`,
      description: relaxedThisStep.length > 0
        ? `Router ${minNode} permanently settled. Relaxed neighbors: ${relaxedThisStep.map(r => `${r.neighbor} (new dist ${r.newDist})`).join(', ')}.`
        : `Router ${minNode} permanently settled. No shorter neighbor paths discovered.`,
      selectedNode: minNode,
      permanentNodes: Array.from(permanent),
      tentativeNodes: nodeIds.filter(n => !permanent.has(n)),
      distances: { ...dist },
      predecessors: { ...prev },
      activeNodes: [minNode, ...relaxedThisStep.map(r => r.neighbor)],
      activeEdges: relaxedThisStep.map(r => [minNode, r.neighbor].sort().join('-')),
      relaxedDetails: relaxedThisStep,
    });

    stepCount++;
  }

  // Construct shortest path to destination
  let path = [];
  let pathCost = Infinity;
  let pathFound = false;

  if (destId && dist[destId] !== undefined && dist[destId] !== Infinity) {
    pathCost = dist[destId];
    let curr = destId;
    while (curr !== null) {
      path.unshift(curr);
      curr = prev[curr];
    }
    if (path.length > 0 && path[0] === sourceId) {
      pathFound = true;
    }
  }

  // Generate source routing table from Dijkstra results
  // For each destination, find next hop (the first step from source on the shortest path)
  const routingTable = {};
  for (const dest of nodeIds) {
    if (dest === sourceId) {
      routingTable[dest] = { cost: 0, nextHop: '-' };
    } else if (dist[dest] === Infinity || dist[dest] === undefined) {
      routingTable[dest] = { cost: Infinity, nextHop: null };
    } else {
      // Trace path back to find next hop after source
      let curr = dest;
      let p = prev[curr];
      while (p !== null && p !== sourceId) {
        curr = p;
        p = prev[curr];
      }
      routingTable[dest] = {
        cost: dist[dest],
        nextHop: curr
      };
    }
  }

  return {
    sourceId,
    destId,
    dist,
    prev,
    steps,
    events,
    permanentNodes: Array.from(permanent),
    totalSteps: steps.length,
    totalRelaxations,
    path,
    pathCost,
    pathFound,
    routingTable
  };
}
