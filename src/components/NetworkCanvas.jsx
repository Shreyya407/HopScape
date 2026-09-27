import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Link as LinkIcon, 
  MousePointer, 
  Edit3, 
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Move
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NetworkCanvas({
  nodes,
  edges,
  sourceId,
  destId,
  onAddNode,
  onDeleteNode,
  onAddEdge,
  onDeleteEdge,
  onUpdateEdgeCost,
  onUpdateNodePosition,
  onSelectSource,
  onSelectDest,
  highlightedPath = [],
  activeStepData = null,
  activeAlgorithm = null,
  isSimulating = false,
}) {
  const canvasRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const [mode, setMode] = useState('select'); // 'select' | 'add-node' | 'connect' | 'delete'
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [connectSource, setConnectSource] = useState(null);
  const [costModalOpen, setCostModalOpen] = useState(false);
  const [selectedEdgeForCost, setSelectedEdgeForCost] = useState(null);
  const [newCostInput, setNewCostInput] = useState('1');
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Map of nodes for fast coordinate lookup
  const nodeMap = React.useMemo(() => {
    const map = {};
    for (const n of nodes) {
      map[n.id] = n;
    }
    return map;
  }, [nodes]);

  // Determine which edges belong to the highlighted path
  const pathEdgeSet = React.useMemo(() => {
    const set = new Set();
    if (highlightedPath && highlightedPath.length > 1) {
      for (let i = 0; i < highlightedPath.length - 1; i++) {
        const u = highlightedPath[i];
        const v = highlightedPath[i + 1];
        set.add([u, v].sort().join('-'));
      }
    }
    return set;
  }, [highlightedPath]);

  // Handle canvas click to add node
  const handleCanvasClick = (e) => {
    if (mode === 'add-node' && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const rawX = (e.clientX - rect.left) / zoom;
      const rawY = (e.clientY - rect.top) / zoom;
      const x = Math.max(40, Math.min(1100, rawX));
      const y = Math.max(40, Math.min(800, rawY));

      // Generate next letter ID
      const usedIds = new Set(nodes.map(n => n.id));
      let nextChar = 'A';
      for (let i = 65; i <= 90; i++) {
        const char = String.fromCharCode(i);
        if (!usedIds.has(char)) {
          nextChar = char;
          break;
        }
      }
      onAddNode({
        id: nextChar,
        label: `Router ${nextChar}`,
        x: Math.round(x),
        y: Math.round(y),
      });
    } else if (mode === 'connect' && connectSource) {
      // Clicked empty space while connecting, cancel
      setConnectSource(null);
    }
  };

  // Node Dragging handlers
  const handleMouseDownNode = (e, node) => {
    e.stopPropagation();
    if (mode === 'delete') {
      onDeleteNode(node.id);
      return;
    }

    if (mode === 'connect') {
      if (!connectSource) {
        setConnectSource(node.id);
      } else if (connectSource !== node.id) {
        // Connect connectSource to node.id
        const existing = edges.find(
          edge => (edge.source === connectSource && edge.target === node.id) ||
                  (edge.source === node.id && edge.target === connectSource)
        );
        if (!existing) {
          onAddEdge(connectSource, node.id, 1);
        }
        setConnectSource(null);
      }
      return;
    }

    // Select/Drag Mode
    if (mode === 'select' && canvasRef.current) {
      setDraggingNodeId(node.id);
      const rect = canvasRef.current.getBoundingClientRect();
      setDragOffset({
        x: (e.clientX - rect.left) / zoom - node.x,
        y: (e.clientY - rect.top) / zoom - node.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (draggingNodeId && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const rawX = (e.clientX - rect.left) / zoom - dragOffset.x;
      const rawY = (e.clientY - rect.top) / zoom - dragOffset.y;
      const newX = Math.max(40, Math.min(1100, rawX));
      const newY = Math.max(40, Math.min(800, rawY));
      onUpdateNodePosition(draggingNodeId, Math.round(newX), Math.round(newY));
    }
  };

  const handleMouseUp = () => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
    }
  };

  // Quick link cost edit
  const openEditCost = (edge, e) => {
    e.stopPropagation();
    if (mode === 'delete') {
      onDeleteEdge(edge.id);
      return;
    }
    setSelectedEdgeForCost(edge);
    setNewCostInput(String(edge.cost));
    setCostModalOpen(true);
  };

  const handleSaveCost = (e) => {
    e?.preventDefault();
    const cost = parseInt(newCostInput, 10);
    if (selectedEdgeForCost && !isNaN(cost) && cost > 0) {
      onUpdateEdgeCost(selectedEdgeForCost.id, cost);
    }
    setCostModalOpen(false);
    setSelectedEdgeForCost(null);
  };

  // Calculate virtual canvas width & height needed based on farthest node
  const canvasWidth = React.useMemo(() => {
    let maxX = 700;
    for (const n of nodes) {
      if (n.x + 140 > maxX) maxX = n.x + 140;
    }
    return Math.max(isFullscreen ? 1100 : 750, maxX);
  }, [nodes, isFullscreen]);

  const canvasHeight = React.useMemo(() => {
    let maxY = 500;
    for (const n of nodes) {
      if (n.y + 120 > maxY) maxY = n.y + 120;
    }
    return Math.max(isFullscreen ? 750 : 560, maxY);
  }, [nodes, isFullscreen]);

  return (
    <div className={`select-none transition-all ${
      isFullscreen
        ? 'fixed inset-0 z-50 w-screen h-screen bg-[#070b14] p-3 flex flex-col shadow-2xl'
        : 'relative w-full h-[540px] bg-[#070b14] rounded-2xl border border-slate-800/90 shadow-2xl overflow-hidden flex flex-col'
    }`}>
      
      {/* Top Canvas Header Controls Bar (Non-overlapping Flex Layout) */}
      <div className="bg-[#0b101d] border-b border-slate-800/90 px-3 py-2 flex flex-wrap items-center justify-between gap-2 z-30 shrink-0">
        
        {/* Left: Mode Switcher */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => { setMode('select'); setConnectSource(null); }}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              mode === 'select'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Select & Move Routers"
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Select</span>
          </button>

          <button
            onClick={() => { setMode('add-node'); setConnectSource(null); }}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              mode === 'add-node'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Click on canvas to place a router"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Router</span>
          </button>

          <button
            onClick={() => { setMode('connect'); setConnectSource(null); }}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              mode === 'connect'
                ? 'bg-blue-500 text-white font-bold shadow-md shadow-blue-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Click two routers to connect them with a link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Connect</span>
          </button>

          <button
            onClick={() => { setMode('delete'); setConnectSource(null); }}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
              mode === 'delete'
                ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title="Click any router or link to delete it"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>

        {/* Center: Active Helper Banner if in connect or add mode */}
        {mode === 'connect' && (
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded-lg text-[11px] font-semibold animate-pulse">
            <LinkIcon className="w-3 h-3" />
            <span>{connectSource ? `Select 2nd router to connect from "${connectSource}"` : 'Click 1st router to connect'}</span>
          </div>
        )}

        {/* Right: Zoom & Fullscreen Controls */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setZoom(z => Math.max(0.5, Math.round((z - 0.1) * 10) / 10))}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <span className="text-[11px] font-mono font-bold text-slate-300 px-1 min-w-[32px] text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={() => setZoom(z => Math.min(1.8, Math.round((z + 0.1) * 10) / 10))}
            className="p-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setZoom(1)}
            className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Reset Zoom"
          >
            100%
          </button>

          <div className="h-3.5 w-px bg-slate-800" />

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(f => !f)}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
              isFullscreen 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                : 'bg-slate-850 text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
            title={isFullscreen ? 'Exit Full Screen (ESC)' : 'View Full Screen'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Full Screen</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Scrollable Canvas Viewport Container with Visible Scrollbars */}
      <div
        ref={scrollContainerRef}
        className="canvas-scroll-container flex-1 w-full h-full overflow-x-auto overflow-y-auto bg-[#070b14] bg-grid-pattern relative cursor-default"
      >
        {/* Scaled Virtual Canvas Plane */}
        <div 
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          style={{ 
            width: `${canvasWidth}px`, 
            height: `${canvasHeight}px`,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left'
          }}
          className={`relative select-none ${
            mode === 'add-node' ? 'cursor-crosshair' : mode === 'delete' ? 'cursor-pointer' : 'cursor-default'
          }`}
        >
          <svg className="w-full h-full pointer-events-none absolute inset-0">
            <defs>
              {/* Glow filters */}
              <filter id="glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="glow-emerald" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter id="glow-purple" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <linearGradient id="packet-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>

            {/* Render Physical Links / Edges */}
            {edges.map((edge) => {
              const u = nodeMap[edge.source];
              const v = nodeMap[edge.target];
              if (!u || !v) return null;

              const isPathEdge = pathEdgeSet.has([edge.source, edge.target].sort().join('-'));

              return (
                <g key={edge.id} className="pointer-events-auto">
                  {/* Base Link Line */}
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke={isPathEdge ? '#10b981' : '#334155'}
                    strokeWidth={isPathEdge ? 4.5 : 2.5}
                    strokeLinecap="round"
                    filter={isPathEdge ? 'url(#glow-emerald)' : undefined}
                    className="transition-colors duration-300"
                  />

                  {/* Animated Path Flow Overlay */}
                  {isPathEdge && (
                    <line
                      x1={u.x}
                      y1={u.y}
                      x2={v.x}
                      y2={v.y}
                      stroke="#a7f3d0"
                      strokeWidth={2}
                      className="animated-path-dash"
                    />
                  )}
                </g>
              );
            })}

            {/* Render In-Flight Simulation Packet Animations */}
            {isSimulating && activeStepData?.messagesInFlight && activeStepData.messagesInFlight.map((msg, idx) => {
              const u = nodeMap[msg.from];
              const v = nodeMap[msg.to];
              if (!u || !v) return null;

              return (
                <motion.g
                  key={`anim-msg-${msg.id || idx}`}
                  initial={{ x: u.x, y: u.y, opacity: 0.2, scale: 0.8 }}
                  animate={{ x: v.x, y: v.y, opacity: 1, scale: 1 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <circle r={7} fill="#06b6d4" filter="url(#glow-cyan)" />
                  <circle r={3.5} fill="#ffffff" />
                </motion.g>
              );
            })}
          </svg>

          {/* Render Edge Cost Badges (HTML Overlay) */}
          {edges.map((edge) => {
            const u = nodeMap[edge.source];
            const v = nodeMap[edge.target];
            if (!u || !v) return null;

            const midX = (u.x + v.x) / 2;
            const midY = (u.y + v.y) / 2;
            const isPathEdge = pathEdgeSet.has([edge.source, edge.target].sort().join('-'));

            return (
              <div
                key={`badge-${edge.id}`}
                style={{ left: `${midX}px`, top: `${midY}px` }}
                onClick={(e) => openEditCost(edge, e)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-10 px-2 py-0.5 rounded-full text-xs font-mono font-bold transition-all transform hover:scale-110 shadow-lg ${
                  isPathEdge
                    ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300 shadow-emerald-500/40'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700 hover:border-cyan-400 hover:text-cyan-300'
                }`}
                title={`Cost: ${edge.cost} (Click to edit cost / delete)`}
              >
                <div className="flex items-center space-x-1">
                  <span>{edge.cost}</span>
                  <Edit3 className="w-2.5 h-2.5 opacity-60 hover:opacity-100" />
                </div>
              </div>
            );
          })}

          {/* Render Router Nodes */}
          {nodes.map((node) => {
            const isSource = node.id === sourceId;
            const isDest = node.id === destId;
            const isConnectingSource = connectSource === node.id;
            const isSettled = activeStepData?.permanentNodes?.includes(node.id);
            const isCurrentSelected = activeStepData?.selectedNode === node.id;

            return (
              <div
                key={node.id}
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
                onMouseDown={(e) => handleMouseDownNode(e, node)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-move group select-none`}
              >
                {/* Outer Glow Ring */}
                <div className={`relative w-14 h-14 rounded-2xl flex flex-col items-center justify-center transition-all transform duration-200 shadow-xl ${
                  isSource
                    ? 'bg-gradient-to-br from-purple-600 to-indigo-700 ring-4 ring-purple-400/50 shadow-purple-500/40 scale-105'
                    : isDest
                    ? 'bg-gradient-to-br from-emerald-600 to-teal-700 ring-4 ring-emerald-400/50 shadow-emerald-500/40 scale-105'
                    : isCurrentSelected
                    ? 'bg-gradient-to-br from-cyan-600 to-blue-700 ring-4 ring-cyan-400 shadow-cyan-500/50 scale-110 animate-bounce'
                    : isConnectingSource
                    ? 'bg-gradient-to-br from-blue-600 to-cyan-700 ring-4 ring-blue-400 animate-pulse'
                    : isSettled
                    ? 'bg-slate-800 border-2 border-emerald-500/70 shadow-emerald-500/20'
                    : 'bg-slate-900 border-2 border-slate-700 hover:border-cyan-400 hover:shadow-cyan-500/30'
                }`}>
                  
                  {/* Router Symbol / Node ID */}
                  <div className="font-extrabold text-base font-mono tracking-tight text-white">
                    {node.id}
                  </div>

                  {/* Role Badges */}
                  {isSource && (
                    <span className="absolute -top-2.5 px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider bg-purple-500 text-white rounded-md shadow">
                      SRC
                    </span>
                  )}
                  {isDest && (
                    <span className="absolute -top-2.5 px-1.5 py-0.2 text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 rounded-md shadow font-bold">
                      DST
                    </span>
                  )}

                  {/* Subtitle / Distance Badge during Dijkstra / DV */}
                  {activeStepData?.distances?.[node.id] !== undefined && (
                    <span className="absolute -bottom-2.5 px-1.5 py-0.2 text-[9px] font-mono font-bold bg-slate-950 text-cyan-300 border border-slate-800 rounded">
                      d: {activeStepData.distances[node.id] === Infinity ? '∞' : activeStepData.distances[node.id]}
                    </span>
                  )}
                </div>

                {/* Node Label Tooltip below */}
                <div className="text-center mt-1">
                  <span className="text-[11px] font-medium text-slate-400 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800/80 pointer-events-none">
                    {node.label || `Router ${node.id}`}
                  </span>
                </div>

                {/* Quick Node Context Actions (Source / Destination Select) on Hover */}
                <div className="absolute top-0 right-0 -translate-y-full mb-1 hidden group-hover:flex items-center space-x-1 bg-slate-900/95 border border-slate-700 rounded-lg p-1 shadow-2xl z-30">
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelectSource(node.id); }}
                    className="px-1.5 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 hover:bg-purple-500 hover:text-white rounded transition-colors"
                    title="Set as Source Router"
                  >
                    Src
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelectDest(node.id); }}
                    className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 rounded transition-colors"
                    title="Set as Destination Router"
                  >
                    Dst
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteNode(node.id); }}
                    className="p-0.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors"
                    title="Delete Router"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* Link Cost Editing Modal */}
      <AnimatePresence>
        {costModalOpen && selectedEdgeForCost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl p-5 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Edit3 className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-sm text-slate-100">
                    Edit Link Cost ({selectedEdgeForCost.source} ↔ {selectedEdgeForCost.target})
                  </h3>
                </div>
                <button
                  onClick={() => setCostModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveCost} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Metric / Weight (Positive Integer):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={newCostInput}
                    onChange={(e) => setNewCostInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                    autoFocus
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteEdge(selectedEdgeForCost.id);
                      setCostModalOpen(false);
                    }}
                    className="px-3 py-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500 hover:text-white rounded-lg text-xs font-semibold transition-colors flex items-center space-x-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Link</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setCostModalOpen(false)}
                      className="px-3 py-1.5 text-xs text-slate-400 hover:text-white font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-cyan-500 text-slate-950 hover:bg-cyan-400 rounded-lg text-xs font-bold shadow-lg shadow-cyan-500/20"
                    >
                      Apply Cost
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
