import React from 'react';
import { 
  Network, 
  GitCompare, 
  Repeat, 
  BookOpen, 
  RotateCcw, 
  Sparkles,
  Layers,
  ChevronDown
} from 'lucide-react';
import { PRESET_TOPOLOGIES } from '../presets/presetTopologies';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onLoadPreset, 
  onResetTopology, 
  nodeCount,
  edgeCount
}) {
  return (
    <header className="sticky top-0 z-50 bg-[#0b101d]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Network className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-blue-300 to-purple-400 bg-clip-text text-transparent">
                HopScape
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              See how networks find their way
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'simulator'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'comparison'
                ? 'bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5 text-purple-400" />
            <span>Comparison</span>
          </button>

          <button
            onClick={() => setActiveTab('topology-change')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'topology-change'
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Repeat className="w-3.5 h-3.5 text-amber-400" />
            <span>Change Lab</span>
          </button>

          <button
            onClick={() => setActiveTab('help')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'help'
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Theory</span>
          </button>
        </nav>

        {/* Action Controls & Presets */}
        <div className="flex items-center space-x-2">
          
          {/* Preset Selector */}
          <div className="relative group">
            <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-700/80 hover:border-slate-600 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 cursor-pointer">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Presets</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
            
            <div className="absolute right-0 top-full mt-1.5 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-2 hidden group-hover:block z-50">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Load Network Topology
              </div>
              {PRESET_TOPOLOGIES.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onLoadPreset(preset)}
                  className="w-full text-left px-3 py-2 hover:bg-slate-800/80 transition-colors flex flex-col gap-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">{preset.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded">
                      {preset.category}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 line-clamp-1">
                    {preset.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Reset Topology */}
          <button
            onClick={onResetTopology}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-slate-800 hover:border-rose-800/50 transition-all"
            title="Reset to default topology"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Reset</span>
          </button>

          {/* Quick Node & Edge counts */}
          <div className="hidden xl:flex items-center space-x-2 text-[11px] text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800/80">
            <span>Routers: <strong className="text-slate-200">{nodeCount}</strong></span>
            <span>•</span>
            <span>Links: <strong className="text-slate-200">{edgeCount}</strong></span>
          </div>

        </div>

      </div>
    </header>
  );
}

