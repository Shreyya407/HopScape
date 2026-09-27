import React, { useState } from 'react';
import { 
  Repeat, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Sliders, 
  AlertTriangle, 
  CheckCircle, 
  PlusCircle, 
  XCircle,
  Play
} from 'lucide-react';
import { runDistanceVector } from '../algorithms/distanceVector';
import { runLinkState } from '../algorithms/linkState';
import { cloneGraph } from '../graph/graph';

export default function TopologyChangeSimulator({
  nodes,
  edges,
  sourceId,
  destId,
  onApplyTopologyToCanvas
}) {
  // Snapshot initial graph state as "BEFORE"
  const [beforeResultDV, setBeforeResultDV] = useState(() => runDistanceVector(nodes, edges, sourceId, destId));
  const [beforeResultLS, setBeforeResultLS] = useState(() => runLinkState(nodes, edges, sourceId, destId));
  const [beforeEdges, setBeforeEdges] = useState(edges);
  
  // Working modified edges
  const [workingEdges, setWorkingEdges] = useState(() => edges.map(e => ({ ...e })));
  const [changeDescription, setChangeDescription] = useState('Default initial state');
  const [afterResultDV, setAfterResultDV] = useState(null);
  const [afterResultLS, setAfterResultLS] = useState(null);
  const [hasRun, setHasRun] = useState(false);

  // Re-snapshot "BEFORE" state from current main canvas
  const handleSnapshotCurrent = () => {
    setBeforeEdges(edges.map(e => ({ ...e })));
    setWorkingEdges(edges.map(e => ({ ...e })));
    setBeforeResultDV(runDistanceVector(nodes, edges, sourceId, destId));
    setBeforeResultLS(runLinkState(nodes, edges, sourceId, destId));
    setAfterResultDV(null);
    setAfterResultLS(null);
    setHasRun(false);
    setChangeDescription('Captured latest canvas state as BEFORE baseline.');
  };

  // Modify link cost
  const handleChangeCost = (edgeId, newCost) => {
    const cost = Math.max(1, parseInt(newCost, 10) || 1);
    const updated = workingEdges.map(e => e.id === edgeId ? { ...e, cost } : e);
    setWorkingEdges(updated);
    const edge = workingEdges.find(e => e.id === edgeId);
    setChangeDescription(`Modified link ${edge?.source} ↔ ${edge?.target} cost to ${cost}.`);
  };

  // Simulate link failure (remove edge)
  const handleSimulateFailure = (edgeId) => {
    const edge = workingEdges.find(e => e.id === edgeId);
    const updated = workingEdges.filter(e => e.id !== edgeId);
    setWorkingEdges(updated);
    setChangeDescription(`Simulated link failure (severed link ${edge?.source} ↔ ${edge?.target}).`);
  };

  // Run dynamic recalculation
  const handleRunRecalculation = () => {
    const newDV = runDistanceVector(nodes, workingEdges, sourceId, destId);
    const newLS = runLinkState(nodes, workingEdges, sourceId, destId);
    setAfterResultDV(newDV);
    setAfterResultLS(newLS);
    setHasRun(true);
  };

  // Apply changes to main canvas
  const handleApplyToCanvas = () => {
    if (onApplyTopologyToCanvas) {
      onApplyTopologyToCanvas(nodes, workingEdges);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Repeat className="w-4 h-4" />
              <span>Dynamic Topology Change & Re-convergence Lab</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Before vs After Route Comparison
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Simulate real-world network perturbations (link failures, congestion cost surges, or new shortcuts) and dynamically observe how both Distance Vector and Link State recalculate the optimal path.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSnapshotCurrent}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
            >
              Reset to Current Canvas
            </button>
          </div>
        </div>
      </div>

      {/* Change Controller / Modifier Panel */}
      <div className="bg-[#0f172a] rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-100">
              Interactive Link Modifier (Simulate What-If Changes)
            </h3>
          </div>
          <span className="text-xs text-amber-400 font-medium">
            Path Tested: {sourceId} → {destId}
          </span>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {workingEdges.map((edge) => (
            <div
              key={edge.id}
              className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-lg bg-slate-800 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center">
                  {edge.source}
                </span>
                <span className="text-xs text-slate-400">↔</span>
                <span className="w-6 h-6 rounded-lg bg-slate-800 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center">
                  {edge.target}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <span className="text-[11px] text-slate-400">Cost:</span>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={edge.cost}
                    onChange={(e) => handleChangeCost(edge.id, e.target.value)}
                    className="w-12 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-center font-mono font-bold text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  onClick={() => handleSimulateFailure(edge.id)}
                  className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                  title="Simulate Link Failure (Sever Link)"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Change Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="text-xs text-slate-400 flex items-center space-x-1.5">
            <span className="font-semibold text-slate-200">Current Change:</span>
            <span className="text-amber-300 font-mono">{changeDescription}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRunRecalculation}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center space-x-1.5 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Rerun Routing Recalculation</span>
            </button>

            {hasRun && (
              <button
                onClick={handleApplyToCanvas}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition-all"
              >
                Apply to Main Simulator
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BEFORE vs AFTER Dynamic Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* BEFORE CARD */}
        <div className="bg-[#0f172a] rounded-3xl border border-slate-800 p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                Baseline (Before Change)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {beforeEdges.length} Active Links
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80">
                <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">
                  Optimal Shortest Path
                </span>
                <div className="text-lg font-mono font-extrabold text-cyan-300">
                  {beforeResultDV?.pathFound ? beforeResultDV.path.join(' → ') : 'No path'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Path Cost</span>
                  <div className="text-xl font-mono font-bold text-emerald-400 mt-0.5">
                    {beforeResultDV?.pathCost}
                  </div>
                </div>

                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">DV Rounds</span>
                  <div className="text-xl font-mono font-bold text-cyan-400 mt-0.5">
                    {beforeResultDV?.roundsCount}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            Initial graph topology results prior to disturbance.
          </div>
        </div>

        {/* AFTER CARD */}
        <div className={`bg-[#0f172a] rounded-3xl border p-6 shadow-xl flex flex-col justify-between transition-all ${
          hasRun ? 'border-amber-500/40 shadow-amber-500/10' : 'border-slate-800 opacity-70'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                hasRun ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400'
              }`}>
                Dynamic Recalculation (After Change)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {workingEdges.length} Active Links
              </span>
            </div>

            {hasRun ? (
              <div className="space-y-4">
                <div className="bg-slate-950/80 rounded-2xl p-4 border border-amber-500/30">
                  <span className="text-[11px] uppercase font-bold text-amber-400 block mb-1">
                    New Optimal Shortest Path
                  </span>
                  <div className="text-lg font-mono font-extrabold text-amber-300">
                    {afterResultDV?.pathFound ? afterResultDV.path.join(' → ') : 'No path available'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">New Path Cost</span>
                    <div className="text-xl font-mono font-bold text-emerald-400 mt-0.5 flex items-center space-x-2">
                      <span>{afterResultDV?.pathCost}</span>
                      {afterResultDV?.pathCost !== beforeResultDV?.pathCost && (
                        <span className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                          (afterResultDV?.pathCost || 0) > (beforeResultDV?.pathCost || 0)
                            ? 'bg-rose-950 text-rose-400'
                            : 'bg-emerald-950 text-emerald-400'
                        }`}>
                          {(afterResultDV?.pathCost || 0) > (beforeResultDV?.pathCost || 0) ? '+' : ''}
                          {(afterResultDV?.pathCost || 0) - (beforeResultDV?.pathCost || 0)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">New DV Rounds</span>
                    <div className="text-xl font-mono font-bold text-cyan-400 mt-0.5">
                      {afterResultDV?.roundsCount}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-2">
                <Sliders className="w-8 h-8 text-slate-400" />
                <p>Modify link costs or sever links above, then click <strong>"Rerun Routing Recalculation"</strong>.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
            {hasRun 
              ? `Path change: ${beforeResultDV?.path.join(' → ')} (Cost ${beforeResultDV?.pathCost}) ➔ ${afterResultDV?.path.join(' → ')} (Cost ${afterResultDV?.pathCost})`
              : 'Awaiting topology rerun.'}
          </div>
        </div>

      </div>

    </div>
  );
}
