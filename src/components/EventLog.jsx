import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, 
  Search, 
  Trash2, 
  ArrowUpDown, 
  Radio, 
  RefreshCw, 
  CheckCircle,
  Clock
} from 'lucide-react';

export default function EventLog({ logs = [], onClearLogs }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'exchange' | 'update' | 'dijkstra' | 'converged'
  const [searchTerm, setSearchTerm] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const logContainerRef = useRef(null);

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((item) => {
    const matchesFilter = filter === 'all' || item.type === filter;
    const matchesSearch = searchTerm === '' || item.text.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-[#0f172a]/90 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col h-full">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              Simulation Event Log
            </h3>
            <p className="text-[11px] text-slate-400">
              Live chronological packet exchanges and route updates
            </p>
          </div>
        </div>

        {/* Controls: Search, Clear */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg pl-6 pr-2 py-1 text-xs text-slate-200 placeholder-slate-400 w-28 focus:w-36 transition-all focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={onClearLogs}
            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
            title="Clear Event Log"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-2 mb-2 text-[11px]">
        {[
          { id: 'all', label: 'All Events' },
          { id: 'exchange', label: 'Vector/LSP' },
          { id: 'update', label: 'Route Updates' },
          { id: 'dijkstra', label: 'Dijkstra' },
          { id: 'converged', label: 'Convergence' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-2 py-0.5 rounded-md font-medium transition-colors shrink-0 ${
              filter === f.id
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Log Feed */}
      <div
        ref={logContainerRef}
        className="flex-1 bg-slate-950/80 rounded-xl border border-slate-800/80 p-3 overflow-y-auto space-y-2 font-mono text-xs max-h-[220px]"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs italic">
            No events logged yet. Run Distance Vector or Link State to begin.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isUpdate = log.type === 'update';
            const isExchange = log.type === 'exchange';
            const isDijkstra = log.type === 'dijkstra';
            const isConverged = log.type === 'converged';

            return (
              <div
                key={log.id}
                className={`p-2 rounded-lg border text-[11px] leading-relaxed transition-all ${
                  isConverged
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                    : isUpdate
                    ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                    : isExchange
                    ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-200'
                    : isDijkstra
                    ? 'bg-purple-950/30 border-purple-500/30 text-purple-200'
                    : 'bg-slate-900/50 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-2.5 h-2.5" />
                    <span>[{log.time}]</span>
                  </div>
                  <span className="uppercase text-[9px] font-bold tracking-wider">
                    {log.type}
                  </span>
                </div>
                <div className="text-slate-200 font-sans">
                  {log.text}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
