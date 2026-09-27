import React from 'react';
import { 
  GitCompare, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  Clock, 
  Activity, 
  TrendingUp, 
  Cpu, 
  Info,
  HelpCircle
} from 'lucide-react';

export default function ComparisonPanel({
  dvResult,
  lsResult,
  nodes,
  edges,
  sourceId,
  destId,
}) {
  // If either result is not calculated yet, run fallback or show placeholder
  const hasDV = Boolean(dvResult);
  const hasLS = Boolean(lsResult);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <GitCompare className="w-4 h-4" />
              <span>Comparative Performance Analysis</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Distance Vector vs Link State Routing
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Live algorithmic comparison computed directly from the current {nodes.length}-node, {edges.length}-link topology.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3 flex items-center space-x-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Selected Path</span>
              <div className="text-sm font-mono font-bold text-cyan-300">
                {sourceId} → {destId}
              </div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Path Cost Match</span>
              <div className="text-sm font-bold text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>{dvResult?.pathCost === lsResult?.pathCost ? 'Consistent' : 'Mismatch'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Side-by-Side Comparison Metrics Table */}
      <div className="bg-[#0f172a]/95 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>Measured Routing Metrics Table</span>
          </h3>
          <span className="text-xs text-slate-400">
            Topology: {nodes.length} Routers, {edges.length} Physical Links
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-xs uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-6 font-bold w-1/3">Evaluation Metric</th>
                <th className="py-3.5 px-6 font-bold text-cyan-400 bg-cyan-950/20 w-1/3">
                  <div className="flex items-center space-x-1.5">
                    <Zap className="w-4 h-4" />
                    <span>Distance Vector (Bellman-Ford)</span>
                  </div>
                </th>
                <th className="py-3.5 px-6 font-bold text-purple-400 bg-purple-950/20 w-1/3">
                  <div className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Link State (Dijkstra / OSPF)</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              
              {/* Shortest Path */}
              <tr className="hover:bg-slate-900/40 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-300">
                  Calculated Shortest Path ({sourceId} → {destId})
                </td>
                <td className="py-4 px-6 font-mono font-bold text-cyan-300 bg-cyan-950/10">
                  {dvResult?.pathFound ? dvResult.path.join(' → ') : 'No path found'}
                </td>
                <td className="py-4 px-6 font-mono font-bold text-purple-300 bg-purple-950/10">
                  {lsResult?.pathFound ? lsResult.path.join(' → ') : 'No path found'}
                </td>
              </tr>

              {/* Path Cost */}
              <tr className="hover:bg-slate-900/40 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-300">
                  Total Minimal Path Cost
                </td>
                <td className="py-4 px-6 font-mono font-extrabold text-emerald-400 bg-cyan-950/10 text-base">
                  {dvResult?.pathCost === Infinity ? '∞' : dvResult?.pathCost}
                </td>
                <td className="py-4 px-6 font-mono font-extrabold text-emerald-400 bg-purple-950/10 text-base">
                  {lsResult?.pathCost === Infinity ? '∞' : lsResult?.pathCost}
                </td>
              </tr>

              {/* Rounds / Iterations */}
              <tr className="hover:bg-slate-900/40 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-300">
                  Convergence Iterations / Rounds
                </td>
                <td className="py-4 px-6 font-mono text-slate-200 bg-cyan-950/10">
                  <strong className="text-cyan-400">{dvResult?.roundsCount}</strong> rounds
                </td>
                <td className="py-4 px-6 font-mono text-slate-400 bg-purple-950/10">
                  N/A (Global topology known upfront)
                </td>
              </tr>

              {/* Routing Updates */}
              <tr className="hover:bg-slate-900/40 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-300">
                  Route Table Updates / Relaxations
                </td>
                <td className="py-4 px-6 font-mono text-slate-200 bg-cyan-950/10">
                  <strong className="text-amber-400">{dvResult?.totalUpdates}</strong> table updates
                </td>
                <td className="py-4 px-6 font-mono text-slate-200 bg-purple-950/10">
                  <strong className="text-purple-400">{lsResult?.totalRelaxations}</strong> edge relaxations
                </td>
              </tr>

              {/* Message Overhead */}
              <tr className="hover:bg-slate-900/40 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-300">
                  Simulated Message Overhead
                </td>
                <td className="py-4 px-6 font-mono text-slate-200 bg-cyan-950/10">
                  <strong className="text-cyan-300">{dvResult?.totalMessages}</strong> vector exchanges (Neighbor only)
                </td>
                <td className="py-4 px-6 font-mono text-slate-200 bg-purple-950/10">
                  <strong className="text-purple-300">{lsResult?.floodingMessages}</strong> flooded LSP packets
                </td>
              </tr>

              {/* Dijkstra Steps */}
              <tr className="hover:bg-slate-900/40 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-300">
                  Dijkstra Settle Steps
                </td>
                <td className="py-4 px-6 font-mono text-slate-400 bg-cyan-950/10">
                  N/A (Decentralized Bellman-Ford)
                </td>
                <td className="py-4 px-6 font-mono text-slate-200 bg-purple-950/10">
                  <strong className="text-purple-400">{lsResult?.dijkstraSteps}</strong> settled nodes
                </td>
              </tr>

              {/* Convergence Guarantee */}
              <tr className="hover:bg-slate-900/40 transition-colors">
                <td className="py-4 px-6 font-semibold text-slate-300">
                  Convergence Status
                </td>
                <td className="py-4 px-6 font-bold text-emerald-400 bg-cyan-950/10">
                  YES (when stable, no loops)
                </td>
                <td className="py-4 px-6 font-bold text-emerald-400 bg-purple-950/10">
                  YES (Deterministic polynomial)
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Topology Analysis */}
      <div className="bg-[#0f172a] rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2.5 text-indigo-400 font-bold border-b border-slate-800 pb-3">
          <Info className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base text-slate-100 uppercase tracking-wide">
            Analysis
          </h3>
        </div>
        
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <p>
            For the active network topology ({nodes.length} routers, {edges.length} links), both algorithms independently computed the optimal shortest path <strong className="text-cyan-300 font-mono">({sourceId} → {destId})</strong> with a total minimal cost of <strong className="text-emerald-400 font-mono">{dvResult?.pathCost === Infinity ? '∞' : dvResult?.pathCost}</strong>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="bg-slate-950/70 rounded-2xl p-4 border border-cyan-500/20">
              <span className="text-xs uppercase font-bold text-cyan-400 block mb-1">
                Distance Vector Performance
              </span>
              <p className="text-xs text-slate-300">
                Reached convergence in <strong className="text-cyan-300">{dvResult?.roundsCount} rounds</strong> with <strong className="text-cyan-300">{dvResult?.totalMessages} vector message exchanges</strong> strictly between 1-hop physical neighbors and <strong className="text-amber-400">{dvResult?.totalUpdates} table updates</strong>.
              </p>
            </div>

            <div className="bg-slate-950/70 rounded-2xl p-4 border border-purple-500/20">
              <span className="text-xs uppercase font-bold text-purple-400 block mb-1">
                Link State Performance
              </span>
              <p className="text-xs text-slate-300">
                Constructed the synchronized LSDB via <strong className="text-purple-300">{lsResult?.floodingMessages} simulated LSP transmissions</strong> and finalized the Shortest Path Tree in <strong className="text-purple-300">{lsResult?.dijkstraSteps} Dijkstra steps</strong> with <strong className="text-purple-300">{lsResult?.totalRelaxations} edge relaxations</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

