/**
 * Graph Validation for RouteLab
 */

import { buildAdjacencyMap } from './graph.js';

export function validateGraph(nodes, edges, sourceId, destId) {
  const errors = [];
  const warnings = [];

  if (!nodes || nodes.length === 0) {
    errors.push("Network topology must contain at least 1 router.");
    return { isValid: false, errors, warnings };
  }

  // Node ID uniqueness
  const nodeIds = new Set();
  for (const n of nodes) {
    if (nodeIds.has(n.id)) {
      errors.push(`Duplicate router identifier found: "${n.id}".`);
    }
    nodeIds.add(n.id);
  }

  // Source & Destination validation
  if (sourceId && !nodeIds.has(sourceId)) {
    errors.push(`Selected source router "${sourceId}" does not exist in topology.`);
  }

  if (destId && !nodeIds.has(destId)) {
    errors.push(`Selected destination router "${destId}" does not exist in topology.`);
  }

  // Link validation
  const seenEdges = new Set();
  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
      errors.push(`Link connects non-existent routers (${edge.source} - ${edge.target}).`);
    }

    if (edge.source === edge.target) {
      errors.push(`Self-loops are not allowed in router links (${edge.source} - ${edge.target}).`);
    }

    const pairKey = [edge.source, edge.target].sort().join('-');
    if (seenEdges.has(pairKey)) {
      errors.push(`Duplicate link found between ${edge.source} and ${edge.target}.`);
    }
    seenEdges.add(pairKey);

    if (isNaN(edge.cost) || edge.cost <= 0) {
      errors.push(`Link cost must be a strictly positive number (> 0) for link ${edge.source} - ${edge.target}. Found: ${edge.cost}`);
    }
  }

  // Connectivity check using BFS
  if (nodes.length > 1) {
    const adj = buildAdjacencyMap(nodes, edges);
    const startNode = nodes[0].id;
    const visited = new Set([startNode]);
    const queue = [startNode];

    while (queue.length > 0) {
      const curr = queue.shift();
      const neighbors = Object.keys(adj[curr] || {});
      for (const nbr of neighbors) {
        if (!visited.has(nbr)) {
          visited.add(nbr);
          queue.push(nbr);
        }
      }
    }

    if (visited.size < nodes.length) {
      const disconnected = nodes.filter(n => !visited.has(n.id)).map(n => n.id);
      warnings.push(`Network is disconnected! Unreachable routers: [${disconnected.join(', ')}]. Routing will only resolve paths within connected components.`);
    }

    // Check if source and destination are connected
    if (sourceId && destId && sourceId !== destId) {
      const visitedFromSource = new Set([sourceId]);
      const queueSrc = [sourceId];
      while (queueSrc.length > 0) {
        const curr = queueSrc.shift();
        const neighbors = Object.keys(adj[curr] || {});
        for (const nbr of neighbors) {
          if (!visitedFromSource.has(nbr)) {
            visitedFromSource.add(nbr);
            queueSrc.push(nbr);
          }
        }
      }

      if (!visitedFromSource.has(destId)) {
        errors.push(`No physical path exists between Source "${sourceId}" and Destination "${destId}".`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
