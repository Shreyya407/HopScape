# HopScape: See How Networks Find Their Way 🌐

An interactive, real-time Computer Networks routing simulator and comparative analysis platform for **Distance Vector (Bellman-Ford)** and **Link State (Dijkstra)** routing algorithms.

---

## 🚀 Key Highlights

- **Dynamic Topology Builder**: Build any custom weighted graph with routers, bidirectional links, inline cost editing, and drag-and-drop node placement.
- **Genuine Algorithm Engine**: Step-by-step mathematical computation of Bellman-Ford vector exchanges and Dijkstra Shortest Path Tree (SPT) relaxations directly from the live graph.
- **Routing Table Inspector**: Synchronous side-by-side forwarding tables (`Destination`, `Cost`, `Next Hop`) for any selected router.
- **Comparison & Analysis**: Real-time evaluation of convergence speed, message count, computational complexity, and memory footprints.
- **"What-If" Change Lab**: Test real-time failure scenarios (link teardown, weight increases) and observe dynamic path re-convergence.
- **Theory & BASICS TO KNOW**: Quick-reference guide with explanations and model viva answers.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite 6
- **Styling**: Tailwind CSS v4 (Cyberpunk / Modern Dark UI)
- **Animations**: Framer Motion
- **Icons**: Lucide React

---

## ⚡ Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Shreyya407/HopScape.git
cd HopScape

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📚 Complete Project Documentation

For full project details including theoretical formulations, system architecture, complexity analysis, module breakdowns, and viva questions, please read the [Complete Project Documentation](DOCUMENTATION.md).

---

## 📄 License
MIT License. Built for educational and academic project demonstrations.
