import { runDistanceVector } from './distanceVector.js';
import { runLinkState } from './linkState.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

console.log("=== RUNNING ALGORITHM VERIFICATION SUITE ===");

// TEST 1: A --1-- B --2-- C
{
  const nodes = [{ id: 'A' }, { id: 'B' }, { id: 'C' }];
  const edges = [
    { source: 'A', target: 'B', cost: 1 },
    { source: 'B', target: 'C', cost: 2 }
  ];

  const dv = runDistanceVector(nodes, edges, 'A', 'C');
  const ls = runLinkState(nodes, edges, 'A', 'C');

  assert(dv.pathCost === 3, `Test 1 DV cost should be 3, got ${dv.pathCost}`);
  assert(ls.pathCost === 3, `Test 1 LS cost should be 3, got ${ls.pathCost}`);
  assert(dv.path.join('-') === 'A-B-C', `Test 1 DV path should be A-B-C, got ${dv.path.join('-')}`);
  assert(ls.path.join('-') === 'A-B-C', `Test 1 LS path should be A-B-C, got ${ls.path.join('-')}`);
  assert(dv.converged === true, 'Test 1 DV converged');
}

// TEST 2: A --2-- B, A --5-- C, B --1-- C
{
  const nodes = [{ id: 'A' }, { id: 'B' }, { id: 'C' }];
  const edges = [
    { source: 'A', target: 'B', cost: 2 },
    { source: 'A', target: 'C', cost: 5 },
    { source: 'B', target: 'C', cost: 1 }
  ];

  const dv = runDistanceVector(nodes, edges, 'A', 'C');
  const ls = runLinkState(nodes, edges, 'A', 'C');

  assert(dv.pathCost === 3, `Test 2 DV cost should be 3, got ${dv.pathCost}`);
  assert(ls.pathCost === 3, `Test 2 LS cost should be 3, got ${ls.pathCost}`);
  assert(dv.path.join('-') === 'A-B-C', `Test 2 DV path should be A-B-C, got ${dv.path.join('-')}`);
  assert(ls.path.join('-') === 'A-B-C', `Test 2 LS path should be A-B-C, got ${ls.path.join('-')}`);
}

// TEST 3: A --2-- B, B --2-- C, A --10-- C
{
  const nodes = [{ id: 'A' }, { id: 'B' }, { id: 'C' }];
  const edges = [
    { source: 'A', target: 'B', cost: 2 },
    { source: 'B', target: 'C', cost: 2 },
    { source: 'A', target: 'C', cost: 10 }
  ];

  const dv = runDistanceVector(nodes, edges, 'A', 'C');
  const ls = runLinkState(nodes, edges, 'A', 'C');

  assert(dv.pathCost === 4, `Test 3 DV cost should be 4, got ${dv.pathCost}`);
  assert(ls.pathCost === 4, `Test 3 LS cost should be 4, got ${ls.pathCost}`);
  assert(dv.path.join('-') === 'A-B-C', `Test 3 DV path should be A-B-C, got ${dv.path.join('-')}`);
  assert(ls.path.join('-') === 'A-B-C', `Test 3 LS path should be A-B-C, got ${ls.path.join('-')}`);
}

// TEST 4: Diamond topology A-B:2, A-C:5, B-D:3, C-D:1
{
  const nodes = [{ id: 'A' }, { id: 'B' }, { id: 'C' }, { id: 'D' }];
  const edges = [
    { source: 'A', target: 'B', cost: 2 },
    { source: 'A', target: 'C', cost: 5 },
    { source: 'B', target: 'D', cost: 3 },
    { source: 'C', target: 'D', cost: 1 }
  ];

  const dv = runDistanceVector(nodes, edges, 'A', 'D');
  const ls = runLinkState(nodes, edges, 'A', 'D');

  assert(dv.pathCost === 5, `Test 4 DV cost should be 5, got ${dv.pathCost}`);
  assert(ls.pathCost === 5, `Test 4 LS cost should be 5, got ${ls.pathCost}`);
  assert(dv.path.join('-') === 'A-B-D', `Test 4 DV path should be A-B-D, got ${dv.path.join('-')}`);
  assert(ls.path.join('-') === 'A-B-D', `Test 4 LS path should be A-B-D, got ${ls.path.join('-')}`);

  // Test dynamic topology change: change B-D cost to 8
  const modifiedEdges = [
    { source: 'A', target: 'B', cost: 2 },
    { source: 'A', target: 'C', cost: 5 },
    { source: 'B', target: 'D', cost: 8 }, // increased cost
    { source: 'C', target: 'D', cost: 1 }
  ];

  const dvMod = runDistanceVector(nodes, modifiedEdges, 'A', 'D');
  const lsMod = runLinkState(nodes, modifiedEdges, 'A', 'D');

  assert(dvMod.pathCost === 6, `Test 4 modified DV cost should be 6, got ${dvMod.pathCost}`);
  assert(lsMod.pathCost === 6, `Test 4 modified LS cost should be 6, got ${lsMod.pathCost}`);
  assert(dvMod.path.join('-') === 'A-C-D', `Test 4 modified DV path should be A-C-D, got ${dvMod.path.join('-')}`);
  assert(lsMod.path.join('-') === 'A-C-D', `Test 4 modified LS path should be A-C-D, got ${lsMod.path.join('-')}`);
}

console.log("🎉 ALL ALGORITHM UNIT TESTS PASSED SUCCESSFULLY!");
