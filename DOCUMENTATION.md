# HopScape: Interactive Distance Vector & Link State Routing Simulator
**Computer Networks Minor Project Documentation & Technical Report**

---

## 📑 Table of Contents
1. [Executive Summary & Abstract](#1-executive-summary--abstract)
2. [Problem Statement & Objectives](#2-problem-statement--objectives)
3. [Theoretical Foundations](#3-theoretical-foundations)
   - 3.1 Distance Vector Routing (Bellman-Ford Algorithm)
   - 3.2 Link State Routing (Dijkstra's Algorithm & LSDB Flooding)
   - 3.3 Comparative Theoretical Analysis
4. [System Architecture & Design](#4-system-architecture--design)
   - 4.1 Technology Stack
   - 4.2 Architecture Diagram
   - 4.3 Directory Structure & Core Modules
5. [Implementation Details](#5-implementation-details)
   - 5.1 Graph Representation & Dynamic Validation
   - 5.2 Distance Vector Engine (`distanceVector.js`)
   - 5.3 Link State & Dijkstra Engine (`dijkstra.js`, `linkState.js`)
   - 5.4 Interactive Canvas & Rendering Pipeline (`NetworkCanvas.jsx`)
   - 5.5 Routing Table Inspector (`RoutingTable.jsx`)
   - 5.6 Topology Perturbation Simulator (`TopologyChangeSimulator.jsx`)
6. [Key Features & Modules](#6-key-features--modules)
7. [Complexity & Metrics Analysis](#7-complexity--metrics-analysis)
8. [Setup, Execution & Verification](#8-setup-execution--verification)
9. [Viva & Examination Reference Guide](#9-viva--examination-reference-guide)
10. [Conclusion & Future Enhancements](#10-conclusion--future-enhancements)

---

## 1. Executive Summary & Abstract

In modern internet protocol suites, dynamic routing protocols are responsible for determining the optimal paths along which data packets traverse intermediate routers to reach their destination networks. The two primary algorithmic paradigms governing intra-domain routing (Interior Gateway Protocols) are **Distance Vector (DV)** routing (exemplified by the Routing Information Protocol, RIP) and **Link State (LS)** routing (exemplified by Open Shortest Path First, OSPF).

Traditional educational tools often represent these algorithms through static graphs, pre-recorded animations, or simplified mathematical traces that fail to provide real-time user interactivity.

**HopScape** is an interactive, browser-based network simulation and comparative analysis platform. It allows students, educators, and network engineers to build arbitrary, weighted network topologies, execute bona fide Distance Vector and Link State algorithm simulations step-by-step, inspect forwarding tables at each router dynamically, test failure scenarios in a dedicated "What-If" Change Lab, and analyze comparative performance metrics such as message overhead, convergence speed, and memory footprint.

---

## 2. Problem Statement & Objectives

### 2.1 Problem Statement
Computer Science students often struggle to understand the nuances separating Distance Vector and Link State routing algorithms—specifically:
- How decentralized information exchange (DV) differs from global topological database synchronization (LS).
- The exact step-by-step relaxation and vector transmission process.
- The behavior of routing protocols under link failures, weight perturbations, and convergence delays.

### 2.2 Project Objectives
1. **Dynamic Topology Construction**: Provide an intuitive canvas to add routers, draw bidirectional weighted links, adjust edge costs inline, and reposition nodes.
2. **Real Algorithm Execution**: Compute genuine mathematical shortest path algorithms dynamically from the graph structure without any hardcoded shortcuts.
3. **Step-by-Step Visualization**: Visualize packet flooding, vector message transmissions, routing table relaxations, and final shortest path tree (SPT) construction.
4. **Synchronous Forwarding Table Inspection**: Allow users to inspect any node's live routing table with side-by-side Distance Vector and Link State comparisons.
5. **Dynamic Failure & Perturbation Lab**: Enable "What-If" simulations (link drop, weight increase/decrease) to observe re-convergence in real-time.
6. **Academic & Viva Readiness**: Provide an integrated theory and reference module covering essential concepts and exam questions.

---

## 3. Theoretical Foundations

### 3.1 Distance Vector Routing (Bellman-Ford Algorithm)
Distance Vector routing is an **iterative, asynchronous, and distributed** algorithm. Each node maintains a vector of estimated minimum costs to all possible destination nodes in the network.

#### Mathematical Formulation:
Let $D_x(y)$ denote the cost of the least-cost path from node $x$ to node $y$. The Bellman-Ford equation governing table updates is:

$$D_x(y) = \min_v \{ c(x,v) + D_v(y) \}$$

Where:
- $v$ is a direct neighbor of node $x$.
- $c(x, v)$ is the cost of the direct link connecting node $x$ to node $v$.
- $D_v(y)$ is neighbor $v$'s current estimated shortest path cost to destination $y$.

#### Operational Phases:
1. **Initialization**: Each router initializes $D_x(x) = 0$, $D_x(y) = c(x, y)$ if $y$ is an immediate neighbor, and $D_x(y) = \infty$ otherwise.
2. **Periodic / Triggered Vector Sharing**: Each router transmits its complete distance vector copy to its immediate adjacent neighbors.
3. **Table Update & Relaxation**: Upon receiving a vector from neighbor $v$, node $x$ computes $c(x,v) + D_v(y)$ for all destinations $y$. If a strictly smaller cost is found, node $x$ updates its table and sets its next hop to $v$.
4. **Convergence**: Exchanges repeat until no router updates its vector during an entire round.

---

### 3.2 Link State Routing (Dijkstra's Algorithm & LSDB Flooding)
Link State routing uses a **global knowledge** paradigm. Every router discovers its immediate neighbors, measures the cost to those neighbors, encapsulates this information into a **Link-State Packet (LSP)**, and floods the packet across the entire network.

#### Operational Phases:
1. **Neighbor Discovery**: Routers identify adjacent active interfaces.
2. **LSP Flooding & LSDB Synchronization**: Every node receives LSPs from all other nodes via reliable flooding, generating an identical **Link State Database (LSDB)** representing the complete network topology graph $G=(V, E)$.
3. **Dijkstra's Algorithm Execution**: Each router $s$ treats itself as the root and computes the Shortest Path Tree (SPT) to all destinations $v \in V$.

#### Dijkstra's Greedy Relaxation Formula:
Let $N'$ be the set of nodes whose least-cost path is definitively determined:
- **Initialization**:
  $N' = \{s\}$; for all $v \notin N'$, $D(v) = c(s, v)$ (or $\infty$ if not adjacent).
- **Loop**:
  1. Find $u \notin N'$ such that $D(u) = \min_{w \notin N'} D(w)$.
  2. Add $u$ to $N'$: $N' \leftarrow N' \cup \{u\}$.
  3. For each neighbor $v$ of $u$ with $v \notin N'$:
     $$D(v) = \min(D(v), D(u) + c(u, v))$$
- **Termination**: Repeats until all nodes $v \in V$ are in $N'$.

---

### 3.3 Comparative Theoretical Analysis

| Feature / Metric | Distance Vector (Bellman-Ford / RIP) | Link State (Dijkstra / OSPF) |
| :--- | :--- | :--- |
| **Topology Knowledge** | Local only (Knows direct neighbors & their vectors) | Global (Every router possesses full network graph) |
| **Information Shared** | Entire routing table / distance vector | State of local links only (LSPs) |
| **Destination of Messages**| Immediate physical neighbors only | Flooded to all routers across the network |
| **Convergence Speed** | Slower; dependent on iterative network rounds | Fast; computed locally once LSDB is synchronized |
| **Looping / Pathology** | Vulnerable to routing loops and **Count-to-Infinity** | Free from routing loops during steady state |
| **Memory Overhead** | Low: $O(V)$ per router | Moderate: $O(V + E)$ full LSDB per router |
| **CPU / Computation** | Low: Local additions & comparisons | Higher: $O(V^2)$ or $O(E + V \log V)$ Dijkstra run |
| **Standard Protocols** | RIP (Routing Information Protocol), IGRP | OSPF (Open Shortest Path First), IS-IS |

---

## 4. System Architecture & Design

### 4.1 Technology Stack
- **UI Framework**: React 19 (Hooks, Functional Components, Contexts)
- **Bundler & Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4 + Custom Modern Cyberpunk Theme
- **Motion & Animations**: Framer Motion
- **Icons**: Lucide React

### 4.2 Architecture Diagram

```
+-----------------------------------------------------------------------+
|                              HopScape App                             |
|                                                                       |
|  +---------------------+  +--------------------+  +----------------+  |
|  |  NetworkCanvas      |  |  SimulationControls|  | EventLog       |  |
|  |  (Graph Rendering)  |  |  (Play, Step, Rate)|  | (Trace Logger) |  |
|  +----------+----------+  +---------+----------+  +-------+--------+  |
|             |                       |                     |           |
|  +----------v-----------------------v---------------------v--------+  |
|  |                   Central Graph & Simulator State               |  |
|  |       (Nodes, Links, Selected Source/Dest, Active Algorithm)     |  |
|  +----------------------------------+------------------------------+  |
|                                     |                                 |
|             +-----------------------+-----------------------+         |
|             |                                               |         |
|  +----------v-------------+                   +-------------v------+  |
|  |  Distance Vector Engine|                   |  Link State Engine |  |
|  |  - Bellman-Ford Rounds |                   |  - LSP Flooding    |  |
|  |  - Vector Exchanges    |                   |  - LSDB Builder    |  |
|  |  - Step Highlights     |                   |  - Dijkstra Solver |  |
|  +----------+-------------+                   +-------------+------+  |
|             |                                               |         |
|  +----------v-----------------------------------------------v------+  |
|  |                     Routing Table Inspector                     |  |
|  |       (Side-by-side Forwarding Tables: Dest | Cost | NextHop)   |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
```

### 4.3 Directory Structure
```
c:\Users\gunja\OneDrive\Desktop\NWPA\
├── index.html                   # HTML Entry Point
├── package.json                 # Dependencies & Build Scripts
├── vite.config.js               # Vite Configuration
├── src/
│   ├── main.jsx                 # React Mount
│   ├── App.jsx                  # Main Shell, State Coordination & Routing Tabs
│   ├── index.css                # Tailwind CSS v4 & Cyber Design Tokens
│   ├── algorithms/
│   │   ├── distanceVector.js    # Bellman-Ford step-by-step engine
│   │   ├── dijkstra.js          # Dijkstra SPT step-by-step solver
│   │   ├── linkState.js         # LSP Flooding + LSDB synchronizer
│   │   └── test_algorithms.js   # Algorithmic unit test suite
│   ├── components/
│   │   ├── NetworkCanvas.jsx    # Draggable SVG canvas, toolbar, node/link renderer
│   │   ├── RoutingTable.jsx     # Side-by-side forwarding table inspector
│   │   ├── SimulationControls.jsx # Play/pause, step backward/forward, speed slider
│   │   ├── EventLog.jsx         # Chronological simulation event ledger
│   │   ├── ComparisonPanel.jsx  # Algorithmic metrics comparison & analysis
│   │   ├── TopologyChangeSimulator.jsx # "What-If" failure perturbation lab
│   │   └── HelpPanel.jsx        # Theory notes & BASICS TO KNOW viva questions
│   ├── graph/
│   │   ├── graph.js             # Graph data structure & adjacency map builders
│   │   └── validation.js        # Topology connectivity (BFS) & cost validator
│   └── presets/
│       └── presetTopologies.js  # Pre-built standard networking topologies
```

---

## 5. Implementation Details

### 5.1 Graph Data Model & Dynamic Validation
- **Nodes**: `{ id: "A", label: "Router A", x: 160, y: 310 }`
- **Links**: `{ id: "l1", source: "A", target: "B", cost: 2 }`
- **Validation Rules (`validation.js`)**:
  - Checks positive edge weights ($cost \ge 1$).
  - Prevents self-loops ($source \neq target$) and duplicate edges.
  - Verifies full network connectivity using Breadth-First Search (BFS) reachability.

### 5.2 Distance Vector Engine (`distanceVector.js`)
1. Generates an initial routing table for each router with direct neighbor costs.
2. Simulates discrete **rounds**. In each round:
   - Every router packages its distance vector: $\{ y: \text{cost} \}$.
   - Transmits the vector along all adjacent links.
   - Neighbor routers execute the Bellman-Ford relaxation formula.
3. Steps are emitted with detailed packet flight coordinates, highlighted updated table cells, and textual audit logs.
4. Completes when a full round produces zero updates across all nodes.

### 5.3 Link State Engine (`dijkstra.js` & `linkState.js`)
1. **LSP Generation & Flooding**:
   - Each router creates an LSP containing its local link costs.
   - Simulates flooding packets over all edges to guarantee synchronized LSDBs across the network.
2. **Dijkstra Shortest Path Tree (SPT)**:
   - Selects the unvisited node with the lowest known distance from the source.
   - Evaluates all outgoing edges, performing edge relaxations:
     $$\text{if } D(u) + c(u, v) < D(v) \implies D(v) \leftarrow D(u) + c(u, v), \, \text{prev}(v) \leftarrow u$$
   - Emits step metadata showing the frontier, evaluated edges, shortest path tree additions, and forwarding table outputs.

### 5.4 Network Canvas (`NetworkCanvas.jsx`)
- Built with standard SVG and HTML5 elements.
- **Unified Toolbar**: Features non-overlapping controls for `Select`, `Add Router`, `Connect Link`, `Delete`, `Zoom In/Out/100%`, and `Full Screen`.
- **Custom Viewport Container**: Equipped with horizontal and vertical smooth cyber scrollbars to ensure topologies of any size can be inspected seamlessly.
- **Dynamic Cost Input**: Double-clicking or selecting a link weight badge allows instant inline weight adjustments.

### 5.5 Routing Table Inspector (`RoutingTable.jsx`)
- Positioned across the full bottom width below the canvas for maximum readability.
- Displays both Distance Vector (Bellman-Ford) and Link State (Dijkstra) forwarding tables side-by-side:
  - `Destination Node` | `Cost` | `Next Hop Router`
- Includes dynamic pill-selectors for nodes (`Router A`, `Router B`, etc.) and filter toggles (`Both`, `DV`, `LS`).
- Displays live mathematical update formulas and dynamically highlights recently changed cells.

---

## 6. Key Features & Modules

### 1. Interactive Simulator Tab
- Real-time animated packet travel along paths.
- Step controls: Play, Pause, Step Next, Step Previous, Reset, and Speed Slider ($0.5\times$ to $4\times$).
- Searchable, filterable event logger with round, step type, and timestamp filters.

### 2. Comparison Tab
- **Side-by-Side Metrics Table**: Displays calculated values for Rounds to Converge, Total Messages Exchanged, Computational Complexity, Memory Footprint, and Message Type.
- **Topology Analysis Section**: Evaluates the specific properties of the active network topology (e.g., node count, edge density, network diameter, and optimal protocol recommendation).

### 3. Change Lab (Topology Perturbation Simulator)
- Lets users experiment with dynamic failure scenarios:
  - **Drop Link**: Simulate physical fiber cut or router interface failure.
  - **Perturb Link Weight**: Simulate link congestion or QoS weight changes.
- Shows side-by-side **Before vs. After** routing tables and path adaptations.

### 4. Theory & "BASICS TO KNOW"
- Integrated educational reference covering core routing definitions, Bellman-Ford vs. Dijkstra comparisons, RIP vs. OSPF architectural differences, and model viva answers.

---

## 7. Complexity & Metrics Analysis

### 7.1 Algorithmic Time & Space Complexities

| Algorithm | Step | Time Complexity | Space Complexity (per router) |
| :--- | :--- | :--- | :--- |
| **Distance Vector** | Initialization | $O(V)$ | $O(V)$ (Routing Table) |
| | Per-Round Relaxation | $O(d \cdot V)$ where $d = \text{degree}$ | $O(V)$ |
| | Convergence Bound | $O(V \cdot E)$ worst-case | $O(V)$ |
| **Link State** | LSP Flooding | $O(E)$ message broadcasts | $O(V + E)$ (Full LSDB) |
| | Dijkstra Computation | $O(V^2)$ (Array) / $O(E + V \log V)$ (Min-Heap) | $O(V)$ (Tree & Table) |

---

## 8. Setup, Execution & Verification

### 8.1 Prerequisites
- **Node.js**: Version 18.0 or higher
- **Package Manager**: npm (or yarn / pnpm)

### 8.2 Installation & Launch
```bash
# 1. Clone repository
git clone https://github.com/Shreyya407/HopScape.git
cd HopScape

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```
The application will be live at `http://localhost:5173/`.

### 8.3 Production Build
```bash
# Build optimized static distribution
npm run build

# Preview production build locally
npm run preview
```

---

## 9. Viva & Examination Reference Guide

### Q1: What is the main difference between Distance Vector and Link State routing?
> **Answer**: Distance Vector routers know only the distance and next hop to destinations as reported by their immediate neighbors (decentralized / "routing by rumor"). Link State routers flood link states so every node constructs the exact same full network graph (global database) and runs Dijkstra's algorithm independently.

### Q2: What is the Count-to-Infinity problem and how is it mitigated?
> **Answer**: Count-to-Infinity occurs in Distance Vector routing when a link breaks, but adjacent routers continue passing outdated path information back and forth in a loop, incrementing the metric indefinitely until it reaches infinity (e.g., 16 in RIP). Mitigations include **Split Horizon**, **Poison Reverse**, and **Holddown Timers**.

### Q3: Why does OSPF converge faster than RIP?
> **Answer**: OSPF floods Link State Packets (LSPs) immediately upon topology changes, allowing every router to update its LSDB and recalculate shortest paths locally in milliseconds. RIP relies on periodic rounds of vector exchanges among adjacent neighbors, taking multiple rounds to propagate changes across network diameter.

### Q4: Which algorithm is used in the Internet's core backbone?
> **Answer**: Within an Autonomous System (Intra-domain), Link State protocols like OSPF and IS-IS are predominantly used due to fast convergence and loop-free operation. Between Autonomous Systems (Inter-domain), **BGP (Border Gateway Protocol)**, a Path Vector protocol, is used.

---

## 10. Conclusion & Future Enhancements

### 10.1 Conclusion
**HopScape** successfully provides a comprehensive, interactive, and academically rigorous platform for learning and analyzing computer network routing. By computing genuine algorithmic paths from user-defined topologies and pairing visual packet flows with side-by-side forwarding table inspections and failure simulations, it bridges the gap between theoretical textbook formulas and practical network dynamics.

### 10.2 Future Scope & Enhancements
1. **Hierarchical Routing & OSPF Areas**: Implement multi-area OSPF partitions (Backbone Area 0 and stub areas).
2. **Path Vector & BGP Simulation**: Extend the engine to simulate Autonomous System (AS) path vector routing with custom routing policies.
3. **Export & Report Generator**: Provide PDF/JSON exports of simulation traces and routing table convergence histories for lab assignments.

---
*HopScape — See How Networks Find Their Way.*
