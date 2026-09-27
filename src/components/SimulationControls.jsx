import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  FastForward, 
  Zap, 
  ShieldCheck, 
  GitCompare,
  Activity,
  CheckCircle2
} from 'lucide-react';

export default function SimulationControls({
  activeAlgorithm,
  onRunDistanceVector,
  onRunLinkState,
  onRunComparison,
  isPlaying,
  onTogglePlay,
  currentStepIndex,
  totalSteps,
  onNextStep,
  onPrevStep,
  onResetSimulation,
  onJumpToEnd,
  speed,
  onChangeSpeed,
  currentStepData,
  hasConverged,
}) {
  return (
    <div className="bg-[#0f172a]/95 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col space-y-3">
      
      {/* Algorithm Launch Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          
          <button
            onClick={onRunDistanceVector}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              activeAlgorithm === 'dv'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-cyan-500/25 ring-2 ring-cyan-400'
                : 'bg-slate-900 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/10'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Run Distance Vector</span>
          </button>

          <button
            onClick={onRunLinkState}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              activeAlgorithm === 'ls'
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-purple-500/25 ring-2 ring-purple-400'
                : 'bg-slate-900 text-purple-300 border border-purple-500/30 hover:bg-purple-500/10'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Run Link State</span>
          </button>

          <button
            onClick={onRunComparison}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/10 hover:text-white transition-all shadow-md"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare Both</span>
          </button>
        </div>

        {/* Status Pill */}
        <div className="flex items-center space-x-2">
          {hasConverged ? (
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-full text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Network Converged</span>
            </div>
          ) : isPlaying ? (
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 rounded-full text-xs font-semibold animate-pulse">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>Simulating...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-slate-800 border border-slate-700 text-slate-400 rounded-full text-xs font-medium">
              <span>Ready</span>
            </div>
          )}
        </div>
      </div>

      {/* Playback Controls & Timeline */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Play / Step Buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={onResetSimulation}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset to initial step"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={onPrevStep}
            disabled={currentStepIndex <= 0}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition-colors"
            title="Previous Step"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={onTogglePlay}
            disabled={totalSteps === 0 || hasConverged && currentStepIndex >= totalSteps - 1}
            className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 rounded-lg font-bold text-xs flex items-center space-x-1 shadow-lg shadow-cyan-500/20 transition-all"
            title={isPlaying ? 'Pause simulation' : 'Play simulation'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{currentStepIndex >= totalSteps - 1 ? 'Replay' : 'Play'}</span>
              </>
            )}
          </button>

          <button
            onClick={onNextStep}
            disabled={currentStepIndex >= totalSteps - 1}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition-colors"
            title="Next Step"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={onJumpToEnd}
            disabled={currentStepIndex >= totalSteps - 1}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:hover:bg-transparent rounded-lg transition-colors"
            title="Jump to final convergence state"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator & Timeline */}
        <div className="flex-1 min-w-[200px] flex items-center space-x-3 px-2">
          <div className="flex-1">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1">
              <span>{currentStepData?.title || 'Initial State'}</span>
              <span>Step {totalSteps > 0 ? currentStepIndex + 1 : 0} of {totalSteps}</span>
            </div>
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full transition-all duration-300"
                style={{ width: `${totalSteps > 0 ? ((currentStepIndex + 1) / totalSteps) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <span className="text-[11px] text-slate-400 px-1.5">Speed:</span>
          {[0.5, 1, 2, 4].map((s) => (
            <button
              key={s}
              onClick={() => onChangeSpeed(s)}
              className={`px-2 py-0.5 rounded font-mono font-bold transition-all ${
                speed === s
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

      </div>

    </div>
  );
}
