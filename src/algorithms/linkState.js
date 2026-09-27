/**
 * Link State Routing Protocol Implementation
 * 
 * Features:
 * - Topology Discovery & Link State Database (LSDB) synchronized view
 * - Dijkstra Shortest Path Tree (SPT) computation
 * - Link State Packet (LSP) Flooding message estimation
 * - Complete routing table generation for all routers
 */

import { buildAdjacencyMap } from '../graph/graph.js';
import { runDijkstra } from './dijkstra.js';

export function runLinkState(nodes, edges, sourceId, destId) {
  const nodeIds = nodes.map(n => n.id).sort();
  const adj = buildAdjacencyMap(nodes, edges);

  // Phase 1: LSP Generation & Reliable Flooding simulation
  // In Link State routing (OSPF / IS-IS style):
  // Each of the N routers creates an LSP listing its direct neighbors and edge costs.
  // Each LSP is flooded out through all incident links.
  // In a connected network with E edges, each LSP crosses roughly 2*E links.
  // Total LSP messages exchanged during flooding = |V| * (2 * |E| / degree) or ~ 2 * |E| * |V| / |V|
  const lspPackets = nodes.map(node => {
    const neighbors = adj[node.id] || {};
    return {
      originRouter: node.id,
      sequenceNumber: 1,
      links: Object.entries(neighbors).map(([target, cost]) => ({ target, cost })),
    };
  });

  // Simplified Link State messaging overhead metric:
  // Each router floods its LSP to all its direct neighbors, who forward to other neighbors.
  // In a graph with |E| undirected edges, reliable flooding of |V| LSPs generates approximately
  // 2 * |E| transmissions per router LSP, minus non-duplicate acknowledgments.
  const totalFloodingMessages = nodes.length * Math.max(1, edges.length * 2);

  // Link State Database (LSDB) is the complete synchronized graph representation
  const lsdb = {
    records: lspPackets,
    completeTopology: adj,
  };

  // Run Dijkstra from source router for single-source SPT
  const dijkstraResult = runDijkstra(nodes, edges, sourceId, destId);

  // Compute full routing tables for ALL routers in the network
  const allRoutingTables = {};
  for (const router of nodeIds) {
    const res = runDijkstra(nodes, edges, router, destId);
    allRoutingTables[router] = res.routingTable;
  }

  // Generate Link State protocol timeline events
  const events = [];

  // 1. LSP Flooding Event
  events.push({
    step: 0,
    type: 'lsp_flooding',
    title: 'Link State: LSP Generation & Global Flooding',
    description: `All ${nodes.length} routers generated Link State Packets (LSPs) and flooded them across the network (${totalFloodingMessages} total simulated LSA messages). Every router now possesses an identical Link State Database (LSDB).`,
    lsdb,
    activeNodes: nodeIds,
    activeEdges: edges.map(e => `${e.source}-${e.target}`),
    messagesInFlight: edges.map(e => ({ from: e.source, to: e.target, label: 'LSP' })),
  });

  // 2. Dijkstra Execution Steps for the chosen Source
  if (dijkstraResult.events) {
    for (const dEvent of dijkstraResult.events) {
      events.push({
        ...dEvent,
        type: 'dijkstra_step',
        title: `Link State: ${dEvent.title}`,
      });
    }
  }

  // 3. Shortest Path Tree Finalized Event
  events.push({
    step: dijkstraResult.totalSteps + 1,
    type: 'converged',
    title: 'Link State Computation Completed ✓',
    description: `Dijkstra completed in ${dijkstraResult.totalSteps} steps with ${dijkstraResult.totalRelaxations} distance relaxations. Shortest path tree computed.`,
    activeNodes: dijkstraResult.path || [],
    activeEdges: [],
    messagesInFlight: [],
  });

  return {
    algorithm: 'Link State (OSPF / Dijkstra)',
    converged: true,
    lsdb,
    floodingMessages: totalFloodingMessages,
    dijkstraSteps: dijkstraResult.totalSteps,
    totalRelaxations: dijkstraResult.totalRelaxations,
    events,
    steps: dijkstraResult.steps,
    finalTables: allRoutingTables,
    sourceTable: allRoutingTables[sourceId] || null,
    path: dijkstraResult.path,
    pathCost: dijkstraResult.pathCost,
    pathFound: dijkstraResult.pathFound,
    sourceId,
    destId,
    dijkstraResult,
  };
}
