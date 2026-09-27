import React, { useState } from 'react';
import { Table, ShieldCheck, Zap, Info } from 'lucide-react';

export default function RoutingTable({
  nodes,
  dvResult,
  lsResult,
  selectedRouter,
  onSelectRouter,
  activeAlgorithm,
  currentRoundTables,
  activeUpdates = [],
}) {
  const [activeViewMode, setActiveViewMode] = useState('both'); // 'dv' | 'ls' | 'both'

  const activeRouterId = selectedRouter || (nodes.length > 0 ? nodes[0].id : null);

  // Extract table for active router
  const dvTable = currentRoundTables?.[activeRouterId] || dvResult?.finalTables?.[activeRouterId] || {};
  const lsTable = lsResult?.finalTables?.[activeRouterId] || {};

  // Check which destinations were updated in this step
  const updatedDests = new Set(
    activeUpdates
      .filter((u) => u.router === activeRouterId)
      .map((u) => u.destination)
  );

  return (
    <div className="bg-[#0f172a]/95 backdrop-blur-md rounded-3xl border border-slate-800 p-5 shadow-2xl flex flex-col space-y-4">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-md">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Routing Table Inspector
            </h3>
            <p className="text-xs text-slate-400">
              Live forwarding tables calculated dynamically for each router
            </p>
          </div>
        </div>

        {/* Router Selector Pills */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 px-2">Inspect Router:</span>
          {nodes.map((node) => (
            <button
              key={node.id}
              onClick={() => onSelectRouter(node.id)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                activeRouterId === node.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              Router {node.id}
            </button>
          ))}
        </div>

        {/* View Filter Mode (Both / DV / LS) */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveViewMode('both')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeViewMode === 'both' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Both Tables
          </button>
          <button
            onClick={() => setActiveViewMode('dv')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeViewMode === 'dv' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Distance Vector
          </button>
          <button
            onClick={() => setActiveViewMode('ls')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              activeViewMode === 'ls' ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Link State
          </button>
        </div>
      </div>

      {/* Tables Display Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Distance Vector Table Card */}
        {(activeViewMode === 'both' || activeViewMode === 'dv') && (
          <div className="bg-slate-950/70 rounded-2xl border border-cyan-500/20 p-4 flex flex-col shadow-lg">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2.5">
              <span className="text-xs font-bold text-cyan-400 flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Distance Vector Forwarding Table ({activeRouterId})</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Bellman-Ford
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider">
                    <th className="py-2.5 px-3 font-semibold w-1/3">Destination</th>
                    <th className="py-2.5 px-3 font-semibold w-1/3">Cost (D)</th>
                    <th className="py-2.5 px-3 font-semibold w-1/3">Next Hop</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {nodes.map((n) => {
                    const entry = dvTable[n.id] || { cost: Infinity, nextHop: null };
                    const isUpdated = updatedDests.has(n.id);
                    const isSelf = n.id === activeRouterId;

                    return (
                      <tr
                        key={`dv-${n.id}`}
                        className={`transition-colors ${
                          isUpdated
                            ? 'bg-cyan-500/20 text-cyan-200 font-bold animate-pulse'
                            : isSelf
                            ? 'text-slate-400 bg-slate-900/30'
                            : 'text-slate-200 hover:bg-slate-900/50'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-bold flex items-center space-x-2">
                          <span>Router {n.id}</span>
                          {isSelf && (
                            <span className="text-[10px] text-slate-400 font-sans px-1.5 py-0.2 bg-slate-800 rounded">
                              local
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-semibold">
                          {entry.cost === Infinity ? (
                            <span className="text-rose-400 font-bold">∞</span>
                          ) : (
                            <span className="text-emerald-400 font-bold">{entry.cost}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-cyan-300 font-semibold">
                          {entry.nextHop ? `Router ${entry.nextHop}` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Link State Table Card */}
        {(activeViewMode === 'both' || activeViewMode === 'ls') && (
          <div className="bg-slate-950/70 rounded-2xl border border-purple-500/20 p-4 flex flex-col shadow-lg">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2.5">
              <span className="text-xs font-bold text-purple-400 flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Link State Forwarding Table ({activeRouterId})</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Dijkstra / LSDB
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px] tracking-wider">
                    <th className="py-2.5 px-3 font-semibold w-1/3">Destination</th>
                    <th className="py-2.5 px-3 font-semibold w-1/3">Cost (D)</th>
                    <th className="py-2.5 px-3 font-semibold w-1/3">Next Hop</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {nodes.map((n) => {
                    const entry = lsTable[n.id] || { cost: Infinity, nextHop: null };
                    const isSelf = n.id === activeRouterId;

                    return (
                      <tr
                        key={`ls-${n.id}`}
                        className={`transition-colors ${
                          isSelf ? 'text-slate-400 bg-slate-900/30' : 'text-slate-200 hover:bg-slate-900/50'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-bold flex items-center space-x-2">
                          <span>Router {n.id}</span>
                          {isSelf && (
                            <span className="text-[10px] text-slate-400 font-sans px-1.5 py-0.2 bg-slate-800 rounded">
                              local
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-semibold">
                          {entry.cost === Infinity ? (
                            <span className="text-rose-400 font-bold">∞</span>
                          ) : (
                            <span className="text-emerald-400 font-bold">{entry.cost}</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-purple-300 font-semibold">
                          {entry.nextHop ? `Router ${entry.nextHop}` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Formula Note Banner */}
      <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Distance Vector Update: <code className="text-cyan-300 font-mono font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">D_x(y) = min_v [ c(x,v) + D_v(y) ]</code></span>
        </div>
        <div className="text-slate-400">
          Link State Relaxation: <code className="text-purple-300 font-mono font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">D(v) = min( D(v), D(u) + c(u,v) )</code>
        </div>
      </div>

    </div>
  );
}
