/**
 * Distance Vector Routing Algorithm Implementation (Bellman-Ford based)
 * 
 * Features:
 * - Real iterative neighbor vector exchange
 * - Full tracking of rounds, vector transmissions, routing updates, and convergence
 * - Detailed event generation for step-by-step educational visualization
 */

import { buildAdjacencyMap } from '../graph/graph.js';

export function runDistanceVector(nodes, edges, sourceId, destId) {
  const adj = buildAdjacencyMap(nodes, edges);
  const nodeIds = nodes.map(n => n.id).sort();
  
  // Simulation tracking structures
  const rounds = [];
  const events = [];
  let totalVectorMessages = 0;
  let totalTableUpdates = 0;

  // Initialize Routing Tables for each router
  // routingTables[routerId] = { [destId]: { cost: number, nextHop: string | null } }
  let currentTables = {};

  for (const u of nodeIds) {
    currentTables[u] = {};
    for (const v of nodeIds) {
      if (u === v) {
        currentTables[u][v] = { cost: 0, nextHop: '-' };
      } else if (adj[u] && adj[u][v] !== undefined) {
        currentTables[u][v] = { cost: adj[u][v], nextHop: v };
      } else {
        currentTables[u][v] = { cost: Infinity, nextHop: null };
      }
    }
  }

  // Deep clone helper for routing tables
  const cloneTables = (tables) => {
    const copy = {};
    for (const u of Object.keys(tables)) {
      copy[u] = {};
      for (const v of Object.keys(tables[u])) {
        copy[u][v] = { ...tables[u][v] };
      }
    }
    return copy;
  };

  // Helper to extract distance vector of a router: { [dest]: cost }
  const getVector = (tables, routerId) => {
    const vec = {};
    for (const d of nodeIds) {
      vec[d] = tables[routerId][d].cost;
    }
    return vec;
  };

  // Record Initial State (Round 0)
  rounds.push({
    round: 0,
    type: 'initialization',
    description: 'Initial state: Direct neighbors discovered via local interfaces; non-neighbors initialized to ∞.',
    tables: cloneTables(currentTables),
    messages: [],
    updates: [],
  });

  events.push({
    round: 0,
    type: 'init',
    title: 'Distance Vector Initialization',
    description: 'Each router initializes its routing table with direct link costs and distance 0 to itself.',
    tables: cloneTables(currentTables),
    activeNodes: nodeIds,
    activeEdges: [],
    messagesInFlight: [],
  });

  let roundNum = 1;
  let hasConverged = false;
  const MAX_ROUNDS = 25; // Prevents infinite loops if disconnected or negative cycle

  while (!hasConverged && roundNum <= MAX_ROUNDS) {
    const nextTables = cloneTables(currentTables);
    const roundMessages = [];
    const roundUpdates = [];
    let roundChanged = false;

    // Step A: Each router sends its current distance vector to all direct physical neighbors
    for (const sender of nodeIds) {
      const neighbors = Object.keys(adj[sender] || {}).sort();
      const senderVector = getVector(currentTables, sender);

      for (const receiver of neighbors) {
        totalVectorMessages++;
        const msg = {
          from: sender,
          to: receiver,
          vector: { ...senderVector },
          costToNeighbor: adj[sender][receiver],
          id: `msg-${roundNum}-${sender}-${receiver}`
        };
        roundMessages.push(msg);
      }
    }

    // Step B: Each receiver updates its distance vector based on Bellman-Ford equation:
    // D_x(y) = min_v { c(x,v) + D_v(y) }
    for (const receiver of nodeIds) {
      const neighbors = Object.keys(adj[receiver] || {}).sort();

      for (const dest of nodeIds) {
        if (dest === receiver) continue;

        let minCost = currentTables[receiver][dest].cost;
        let bestNextHop = currentTables[receiver][dest].nextHop;
        let updated = false;

        // Check path via each direct neighbor v
        for (const neighbor of neighbors) {
          const linkCost = adj[receiver][neighbor];
          const neighborDistToDest = currentTables[neighbor][dest].cost;

          if (neighborDistToDest !== Infinity) {
            const candidateCost = linkCost + neighborDistToDest;
            if (candidateCost < minCost) {
              const oldCost = minCost;
              const oldHop = bestNextHop;
              minCost = candidateCost;
              bestNextHop = neighbor;
              updated = true;

              roundUpdates.push({
                router: receiver,
                destination: dest,
                oldCost,
                oldNextHop: oldHop,
                newCost: candidateCost,
                newNextHop: neighbor,
                viaNeighbor: neighbor,
                explanation: `Router ${receiver} updated route to ${dest}: via neighbor ${neighbor} (link cost ${linkCost} + ${neighbor}'s dist ${neighborDistToDest} = ${candidateCost} < previous ${oldCost === Infinity ? '∞' : oldCost})`
              });
            }
          }
        }

        if (updated) {
          nextTables[receiver][dest] = {
            cost: minCost,
            nextHop: bestNextHop
          };
          roundChanged = true;
          totalTableUpdates++;
        }
      }
    }

    // Create detailed simulation events for this round
    // 1. Vector exchange animation event
    events.push({
      round: roundNum,
      type: 'exchange',
      title: `Round ${roundNum}: Vector Transmission`,
      description: `Routers exchange current distance vectors with their immediate physical neighbors (${roundMessages.length} vector messages transmitted).`,
      tables: cloneTables(currentTables),
      activeNodes: nodeIds,
      activeEdges: edges.map(e => `${e.source}-${e.target}`),
      messagesInFlight: roundMessages,
    });

    // 2. Routing table computation & update event
    events.push({
      round: roundNum,
      type: 'update',
      title: `Round ${roundNum}: Routing Table Updates`,
      description: roundUpdates.length > 0 
        ? `${roundUpdates.length} routing table updates occurred as routers found cheaper paths via neighbors.` 
        : `No routing table updates in Round ${roundNum}. All routers have consistent minimal distance vectors.`,
      tables: cloneTables(nextTables),
      updates: roundUpdates,
      activeNodes: roundUpdates.map(u => u.router),
      activeEdges: [],
      messagesInFlight: [],
    });

    currentTables = nextTables;

    rounds.push({
      round: roundNum,
      type: 'round',
      description: roundChanged ? `Round ${roundNum}: Table updates occurred.` : `Round ${roundNum}: No updates (stable).`,
      tables: cloneTables(currentTables),
      messages: roundMessages,
      updates: roundUpdates,
      changed: roundChanged,
    });

    if (!roundChanged) {
      hasConverged = true;
    } else {
      roundNum++;
    }
  }

  const finalRoundCount = rounds.length - 1; // excluding round 0

  // Final Convergence Event
  events.push({
    round: finalRoundCount,
    type: 'converged',
    title: 'Distance Vector Network Converged ✓',
    description: `Distance Vector converged in ${finalRoundCount} rounds with ${totalVectorMessages} total vector transmissions and ${totalTableUpdates} route updates.`,
    tables: cloneTables(currentTables),
    activeNodes: [],
    activeEdges: [],
    messagesInFlight: [],
  });

  // Extract shortest path from source to destination
  let path = [];
  let pathCost = Infinity;
  let pathFound = false;

  if (sourceId && destId && currentTables[sourceId]) {
    if (sourceId === destId) {
      path = [sourceId];
      pathCost = 0;
      pathFound = true;
    } else if (currentTables[sourceId][destId].cost !== Infinity) {
      path = [sourceId];
      let curr = sourceId;
      const visitedHops = new Set([curr]);
      let stuck = false;

      while (curr !== destId && !stuck) {
        const hop = currentTables[curr][destId]?.nextHop;
        if (!hop || visitedHops.has(hop)) {
          stuck = true;
          break;
        }
        path.push(hop);
        visitedHops.add(hop);
        curr = hop;
      }

      if (!stuck && curr === destId) {
        pathFound = true;
        pathCost = currentTables[sourceId][destId].cost;
      }
    }
  }

  return {
    algorithm: 'Distance Vector (Bellman-Ford)',
    converged: hasConverged,
    roundsCount: finalRoundCount,
    totalMessages: totalVectorMessages,
    totalUpdates: totalTableUpdates,
    rounds,
    events,
    finalTables: currentTables,
    sourceTable: sourceId ? currentTables[sourceId] : null,
    path,
    pathCost,
    pathFound,
    sourceId,
    destId
  };
}
