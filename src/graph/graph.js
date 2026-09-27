/**
 * Graph Data Structures & Helper Utilities for RouteLab
 */

export function createNode(id, label, x, y) {
  return {
    id: String(id),
    label: label || String(id),
    x: Math.round(x),
    y: Math.round(y),
  };
}

export function createEdge(source, target, cost) {
  // Normalize source and target order for undirected graphs
  const [s, t] = source < target ? [source, target] : [target, source];
  return {
    id: `${s}-${t}`,
    source: s,
    target: t,
    cost: Number(cost),
  };
}

/**
 * Builds an adjacency map: { [nodeId]: { [neighborId]: cost } }
 */
export function buildAdjacencyMap(nodes, edges) {
  const adj = {};
  for (const node of nodes) {
    adj[node.id] = {};
  }

  for (const edge of edges) {
    if (adj[edge.source] && adj[edge.target]) {
      const cost = Number(edge.cost);
      adj[edge.source][edge.target] = cost;
      adj[edge.target][edge.source] = cost;
    }
  }

  return adj;
}

/**
 * Get all neighbors of a given node
 */
export function getNeighbors(adj, nodeId) {
  return adj[nodeId] ? Object.keys(adj[nodeId]) : [];
}

/**
 * Deep clone graph state
 */
export function cloneGraph(graph) {
  return {
    nodes: graph.nodes.map(n => ({ ...n })),
    edges: graph.edges.map(e => ({ ...e })),
  };
}
