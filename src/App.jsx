import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import NetworkCanvas from './components/NetworkCanvas';
import RoutingTable from './components/RoutingTable';
import SimulationControls from './components/SimulationControls';
import EventLog from './components/EventLog';
import ComparisonPanel from './components/ComparisonPanel';
import TopologyChangeSimulator from './components/TopologyChangeSimulator';
import HelpPanel from './components/HelpPanel';

import { PRESET_TOPOLOGIES } from './presets/presetTopologies';
import { validateGraph } from './graph/validation';
import { runDistanceVector } from './algorithms/distanceVector';
import { runLinkState } from './algorithms/linkState';
import { generateEventLogs, createLogEntry } from './simulation/events';
import confetti from 'canvas-confetti';

import { 
  Zap, 
  ShieldCheck, 
  GitCompare, 
  RotateCcw, 
  Play, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Info
} from 'lucide-react';

export default function App() {
  // Navigation tab: 'simulator' | 'comparison' | 'topology-change' | 'help'
  const [activeTab, setActiveTab] = useState('simulator');

  // Topology State
  const initialPreset = PRESET_TOPOLOGIES[0]; // 4-Node Diamond Network
  const [nodes, setNodes] = useState(initialPreset.nodes);
  const [edges, setEdges] = useState(initialPreset.edges);
  const [sourceId, setSourceId] = useState(initialPreset.defaultSource);
  const [destId, setDestId] = useState(initialPreset.defaultDest);
  const [selectedInspectorRouter, setSelectedInspectorRouter] = useState(initialPreset.defaultSource);

  // Simulation execution state
  const [activeAlgorithm, setActiveAlgorithm] = useState(null); // 'dv' | 'ls'
  const [simulationEvents, setSimulationEvents] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 0.5, 1, 2, 4
  const timerRef = useRef(null);

  // Full calculation results for both algorithms
  const [dvResult, setDvResult] = useState(null);
  const [lsResult, setLsResult] = useState(null);

  // Event Log Feed
  const [logs, setLogs] = useState([]);

  // Validation state
  const validation = React.useMemo(() => {
    return validateGraph(nodes, edges, sourceId, destId);
  }, [nodes, edges, sourceId, destId]);

  // Ensure selected source & destination remain valid
  useEffect(() => {
    if (nodes.length > 0) {
      if (!nodes.some(n => n.id === sourceId)) {
        setSourceId(nodes[0].id);
      }
      if (!nodes.some(n => n.id === destId)) {
        setDestId(nodes[nodes.length - 1]?.id || nodes[0].id);
      }
      if (!nodes.some(n => n.id === selectedInspectorRouter)) {
        setSelectedInspectorRouter(nodes[0].id);
      }
    }
  }, [nodes, sourceId, destId, selectedInspectorRouter]);

  // Calculate results on topology or source/destination change
  useEffect(() => {
    if (validation.isValid && nodes.length > 0 && sourceId && destId) {
      const dv = runDistanceVector(nodes, edges, sourceId, destId);
      const ls = runLinkState(nodes, edges, sourceId, destId);
      setDvResult(dv);
      setLsResult(ls);
    }
  }, [nodes, edges, sourceId, destId, validation.isValid]);

  // Setup Initial Preset Log
  useEffect(() => {
    setLogs([
      createLogEntry(`Topology loaded: ${initialPreset.name} (${initialPreset.nodes.length} routers, ${initialPreset.edges.length} links).`, 'info'),
      createLogEntry(`Select Source & Destination and click "Run Distance Vector" or "Run Link State" to simulate.`, 'info'),
    ]);
  }, []);

  // --- Topology Editing Actions ---
  const handleAddNode = (newNode) => {
    setNodes(prev => [...prev, newNode]);
    setLogs(prev => [...prev, createLogEntry(`Added Router ${newNode.id} to topology.`, 'info')]);
    handleStopSimulation();
  };

  const handleDeleteNode = (nodeId) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
    setLogs(prev => [...prev, createLogEntry(`Deleted Router ${nodeId} and all incident links.`, 'info')]);
    handleStopSimulation();
  };

  const handleAddEdge = (source, target, cost = 1) => {
    const newEdge = {
      id: `${source}-${target}`,
      source,
      target,
      cost: Number(cost),
    };
    setEdges(prev => [...prev, newEdge]);
    setLogs(prev => [...prev, createLogEntry(`Connected Router ${source} ↔ Router ${target} with link cost ${cost}.`, 'info')]);
    handleStopSimulation();
  };

  const handleDeleteEdge = (edgeId) => {
    const edge = edges.find(e => e.id === edgeId);
    setEdges(prev => prev.filter(e => e.id !== edgeId));
    if (edge) {
      setLogs(prev => [...prev, createLogEntry(`Deleted link ${edge.source} ↔ ${edge.target}.`, 'info')]);
    }
    handleStopSimulation();
  };

  const handleUpdateEdgeCost = (edgeId, newCost) => {
    setEdges(prev => prev.map(e => e.id === edgeId ? { ...e, cost: Number(newCost) } : e));
    const edge = edges.find(e => e.id === edgeId);
    if (edge) {
      setLogs(prev => [...prev, createLogEntry(`Updated link ${edge.source} ↔ ${edge.target} cost to ${newCost}.`, 'info')]);
    }
    handleStopSimulation();
  };

  const handleUpdateNodePosition = (nodeId, x, y) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, x, y } : n));
  };

  const handleLoadPreset = (preset) => {
    setNodes(preset.nodes);
    setEdges(preset.edges);
    setSourceId(preset.defaultSource);
    setDestId(preset.defaultDest);
    setSelectedInspectorRouter(preset.defaultSource);
    handleStopSimulation();
    setLogs([
      createLogEntry(`Loaded preset topology: "${preset.name}".`, 'info'),
      createLogEntry(`Network ready for simulation (${preset.nodes.length} routers, ${preset.edges.length} links).`, 'info')
    ]);
  };

  const handleResetTopology = () => {
    handleLoadPreset(PRESET_TOPOLOGIES[0]);
  };

  // --- Simulation Actions ---
  const handleStopSimulation = () => {
    setIsPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleRunDistanceVector = () => {
    if (!validation.isValid) return;
    const res = runDistanceVector(nodes, edges, sourceId, destId);
    setDvResult(res);
    setActiveAlgorithm('dv');
    setSimulationEvents(res.events);
    setCurrentStepIndex(0);
    setIsPlaying(true);
    setLogs(prev => [...prev, ...generateEventLogs(res)]);
  };

  const handleRunLinkState = () => {
    if (!validation.isValid) return;
    const res = runLinkState(nodes, edges, sourceId, destId);
    setLsResult(res);
    setActiveAlgorithm('ls');
    setSimulationEvents(res.events);
    setCurrentStepIndex(0);
    setIsPlaying(true);
    setLogs(prev => [...prev, ...generateEventLogs(res)]);
  };

  const handleRunComparison = () => {
    if (!validation.isValid) return;
    const dv = runDistanceVector(nodes, edges, sourceId, destId);
    const ls = runLinkState(nodes, edges, sourceId, destId);
    setDvResult(dv);
    setLsResult(ls);
    setActiveTab('comparison');
    setLogs(prev => [
      ...prev,
      createLogEntry(`Generated comparative analysis for Distance Vector vs Link State.`, 'info')
    ]);
  };

  // Step ticker
  useEffect(() => {
    if (isPlaying && simulationEvents.length > 0) {
      const intervalMs = Math.round(1800 / speed);
      timerRef.current = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev < simulationEvents.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            clearInterval(timerRef.current);
            // Trigger celebration confetti upon complete convergence
            try {
              confetti({ particleCount: 35, spread: 60, origin: { y: 0.85 } });
            } catch (e) { }
            return prev;
          }
        });
      }, intervalMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, simulationEvents, speed]);

  const currentStepData = simulationEvents[currentStepIndex] || null;
  const isFinalStep = simulationEvents.length > 0 && currentStepIndex === simulationEvents.length - 1;

  // Derive highlighted path for canvas
  const highlightedPath = React.useMemo(() => {
    if (activeAlgorithm === 'dv' && dvResult?.pathFound && isFinalStep) {
      return dvResult.path;
    }
    if (activeAlgorithm === 'ls' && lsResult?.pathFound && isFinalStep) {
      return lsResult.path;
    }
    if (activeTab === 'simulator' && dvResult?.pathFound) {
      return dvResult.path;
    }
    return [];
  }, [activeAlgorithm, dvResult, lsResult, isFinalStep, activeTab]);

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLoadPreset={handleLoadPreset}
        onResetTopology={handleResetTopology}
        nodeCount={nodes.length}
        edgeCount={edges.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* Validation Errors & Warnings Alert */}
        {(!validation.isValid || validation.warnings.length > 0) && (
          <div className="space-y-2">
            {validation.errors.map((err, i) => (
              <div key={`err-${i}`} className="bg-rose-950/60 border border-rose-500/50 rounded-2xl p-3.5 flex items-center space-x-3 text-rose-200 text-xs shadow-lg">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span className="font-medium">{err}</span>
              </div>
            ))}
            {validation.warnings.map((warn, i) => (
              <div key={`warn-${i}`} className="bg-amber-950/60 border border-amber-500/50 rounded-2xl p-3.5 flex items-center space-x-3 text-amber-200 text-xs shadow-lg">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                <span className="font-medium">{warn}</span>
              </div>
            ))}
          </div>
        )}

        {/* TAB 1: MAIN SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">

            {/* TOP SECTION: Left Route Parameters & Actions (Col 4) | Right Expansive Canvas (Col 8) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT SIDEBAR: Route Parameters & Algorithm Launcher (Col 4) */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* Source & Destination Card */}
                <div className="bg-[#0f172a]/95 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-4">
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Route Parameters</span>
                  </div>

                  {/* Source Selector */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Source Router:
                    </label>
                    <select
                      value={sourceId}
                      onChange={(e) => setSourceId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold font-mono text-purple-300 focus:outline-none focus:border-purple-500"
                    >
                      {nodes.map(n => (
                        <option key={`src-${n.id}`} value={n.id}>
                          Router {n.id} ({n.label})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Destination Selector */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                      Destination Router:
                    </label>
                    <select
                      value={destId}
                      onChange={(e) => setDestId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                    >
                      {nodes.map(n => (
                        <option key={`dst-${n.id}`} value={n.id}>
                          Router {n.id} ({n.label})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Active Path Summary Pill */}
                  <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 text-xs">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Shortest Path Result
                    </div>
                    <div className="font-mono font-bold text-cyan-300 truncate">
                      {dvResult?.pathFound ? dvResult.path.join(' → ') : 'Calculating...'}
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Total Cost:</span>
                      <strong className="text-emerald-400 font-mono text-xs">
                        {dvResult?.pathCost === Infinity ? '∞' : dvResult?.pathCost}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Simulation Launcher Actions */}
                <div className="bg-[#0f172a]/95 rounded-2xl border border-slate-800 p-4 shadow-xl space-y-2.5">
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                    Run Algorithms
                  </div>

                  <button
                    onClick={handleRunDistanceVector}
                    disabled={!validation.isValid}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center space-x-2 transition-all"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Run Distance Vector</span>
                  </button>

                  <button
                    onClick={handleRunLinkState}
                    disabled={!validation.isValid}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-500/20 flex items-center justify-center space-x-2 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Run Link State</span>
                  </button>

                  <button
                    onClick={handleRunComparison}
                    disabled={!validation.isValid}
                    className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-white border border-indigo-500/30 font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all"
                  >
                    <GitCompare className="w-4 h-4 text-indigo-400" />
                    <span>Compare Both</span>
                  </button>
                </div>

              </div>

              {/* MAIN: Interactive Topology Canvas (Col 8) */}
              <div className="lg:col-span-8 space-y-4">
                <NetworkCanvas
                  nodes={nodes}
                  edges={edges}
                  sourceId={sourceId}
                  destId={destId}
                  onAddNode={handleAddNode}
                  onDeleteNode={handleDeleteNode}
                  onAddEdge={handleAddEdge}
                  onDeleteEdge={handleDeleteEdge}
                  onUpdateEdgeCost={handleUpdateEdgeCost}
                  onUpdateNodePosition={handleUpdateNodePosition}
                  onSelectSource={setSourceId}
                  onSelectDest={setDestId}
                  highlightedPath={highlightedPath}
                  activeStepData={currentStepData}
                  activeAlgorithm={activeAlgorithm}
                  isSimulating={isPlaying}
                />
              </div>

            </div>

            {/* FULL WIDTH: Live Routing Table Inspector (Shifted down with generous space) */}
            <div className="w-full">
              <RoutingTable
                nodes={nodes}
                dvResult={dvResult}
                lsResult={lsResult}
                selectedRouter={selectedInspectorRouter}
                onSelectRouter={setSelectedInspectorRouter}
                activeAlgorithm={activeAlgorithm}
                currentRoundTables={currentStepData?.tables}
                activeUpdates={currentStepData?.updates || []}
              />
            </div>

            {/* Bottom Controls & Timeline Bar */}
            <SimulationControls
              activeAlgorithm={activeAlgorithm}
              onRunDistanceVector={handleRunDistanceVector}
              onRunLinkState={handleRunLinkState}
              onRunComparison={handleRunComparison}
              isPlaying={isPlaying}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              currentStepIndex={currentStepIndex}
              totalSteps={simulationEvents.length}
              onNextStep={() => setCurrentStepIndex(prev => Math.min(simulationEvents.length - 1, prev + 1))}
              onPrevStep={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
              onResetSimulation={() => { setCurrentStepIndex(0); setIsPlaying(false); }}
              onJumpToEnd={() => { setCurrentStepIndex(simulationEvents.length - 1); setIsPlaying(false); }}
              speed={speed}
              onChangeSpeed={setSpeed}
              currentStepData={currentStepData}
              hasConverged={isFinalStep}
            />

            {/* Event Log Section */}
            <EventLog
              logs={logs}
              onClearLogs={() => setLogs([])}
            />

          </div>
        )}

        {/* TAB 2: COMPARISON DASHBOARD */}
        {activeTab === 'comparison' && (
          <ComparisonPanel
            dvResult={dvResult}
            lsResult={lsResult}
            nodes={nodes}
            edges={edges}
            sourceId={sourceId}
            destId={destId}
          />
        )}

        {/* TAB 3: TOPOLOGY CHANGE LAB */}
        {activeTab === 'topology-change' && (
          <TopologyChangeSimulator
            nodes={nodes}
            edges={edges}
            sourceId={sourceId}
            destId={destId}
            onApplyTopologyToCanvas={(updatedNodes, updatedEdges) => {
              setNodes(updatedNodes);
              setEdges(updatedEdges);
              setActiveTab('simulator');
              setLogs(prev => [
                ...prev,
                createLogEntry(`Applied modified topology to main simulator canvas.`, 'info')
              ]);
            }}
          />
        )}

        {/* TAB 4: THEORY */}
        {activeTab === 'help' && (
          <HelpPanel />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#090d16] py-4 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-200">HopScape</span>
            <span>•</span>
            <span>See how networks find their way</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Real Distance Vector (Bellman-Ford) & Link State (Dijkstra) Algorithms
          </div>
        </div>
      </footer>

    </div>
  );
}
