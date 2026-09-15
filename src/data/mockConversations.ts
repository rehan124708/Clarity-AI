import { Conversation, Project } from '../types';

export const initialProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Academic ML Research',
    description: 'B.Tech CSE Project on Transformer Attention & Efficiency',
    customInstructions: 'Focus on mathematical rigor, asymptotic analysis, and empirical benchmarks.',
    color: '#C96442',
    createdAt: Date.now() - 3600000 * 48,
  },
  {
    id: 'proj-2',
    name: 'Frontend Systems & UX',
    description: 'Interactive component architecture and state management prototypes',
    customInstructions: 'Prioritize clean componentization, accessibility, and high contrast warm styling.',
    color: '#7A9A76',
    createdAt: Date.now() - 3600000 * 96,
  },
];

export const initialConversations: Conversation[] = [
  {
    id: 'conv-counter',
    title: 'Interactive Activity Counter Widget',
    createdAt: Date.now() - 1000 * 60 * 35,
    updatedAt: Date.now() - 1000 * 60 * 35,
    isPinned: true,
    projectId: 'proj-2',
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        text: 'Can you build an interactive counter widget with milestone animations and a warm neutral palette?',
        timestamp: Date.now() - 1000 * 60 * 36,
      },
      {
        id: 'msg-2',
        role: 'assistant',
        text: `Here is a self-contained interactive counter and analytics widget crafted with clean state management and responsive styling. You can test the live interactive preview directly in the side panel:

<artifact identifier="interactive-counter-widget" type="html" title="Interactive Metric Tracker">
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #F5F4EF; font-family: system-ui, sans-serif; }
  </style>
</head>
<body class="p-6 flex flex-col items-center justify-center min-h-[400px]">
  <div class="w-full max-w-sm bg-white rounded-2xl p-6 shadow-sm border border-[#E3E0D8] text-center">
    <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F0EAE2] text-[#C96442] mb-3">Interactive Artifact</span>
    <h3 class="text-xl font-semibold text-[#2D2A26] mb-1">Activity Counter</h3>
    <p class="text-sm text-[#6B6660] mb-6">Real-time state tracking with milestone alerts.</p>
    
    <div id="countDisplay" class="text-5xl font-bold text-[#C96442] my-4 transition-all">0</div>
    
    <div class="flex items-center justify-center gap-3 mt-6">
      <button onclick="updateCount(-1)" class="w-12 h-12 rounded-xl border border-[#E3E0D8] bg-[#F5F4EF] hover:bg-[#EEECE3] text-xl font-bold text-[#2D2A26] transition-colors">-</button>
      <button onclick="resetCount()" class="px-4 h-12 rounded-xl border border-[#E3E0D8] text-xs font-semibold text-[#6B6660] hover:bg-[#F5F4EF] transition-colors">Reset</button>
      <button onclick="updateCount(1)" class="w-12 h-12 rounded-xl bg-[#C96442] hover:bg-[#B55838] text-xl font-bold text-white transition-colors">+</button>
    </div>
    <div id="status" class="text-xs text-[#7A9A76] mt-4 font-medium h-4"></div>
  </div>

  <script>
    let count = 0;
    function updateCount(diff) {
      count = Math.max(0, count + diff);
      const display = document.getElementById('countDisplay');
      display.innerText = count;
      display.style.transform = 'scale(1.15)';
      setTimeout(() => display.style.transform = 'scale(1)', 150);
      
      const status = document.getElementById('status');
      if (count > 0 && count % 5 === 0) {
        status.innerText = '🎉 Milestone reached: ' + count + ' units!';
      } else {
        status.innerText = '';
      }
    }
    function resetCount() {
      count = 0;
      document.getElementById('countDisplay').innerText = 0;
      document.getElementById('status').innerText = 'Counter reset';
      setTimeout(() => document.getElementById('status').innerText = '', 1500);
    }
  </script>
</body>
</html>
</artifact>

### Key Architectural Highlights
- **State Encapsulation**: Single source of truth for counter mutations with non-negative bounds validation.
- **Micro-interactions**: Elastic scaling pulse feedback on increment/decrement actions.
- **Visual Harmony**: Built using the warm neutral palette and terracotta accent tones.`,
        timestamp: Date.now() - 1000 * 60 * 35,
        thinking: `1. User wants an interactive counter component matching Claude's warm neutral aesthetic.
2. I'll bundle this into an HTML Artifact so the side-canvas panel can render both live preview and source code.
3. Incorporate milestone notification logic and subtle physics micro-animations.`,
        thinkingDuration: 3.2,
      },
    ],
  },
  {
    id: 'conv-dijkstra',
    title: 'Dijkstra Algorithm with Priority Queue',
    createdAt: Date.now() - 1000 * 60 * 60 * 22,
    updatedAt: Date.now() - 1000 * 60 * 60 * 22,
    projectId: 'proj-1',
    messages: [
      {
        id: 'msg-d1',
        role: 'user',
        text: 'How do I implement Dijkstra with heapq in Python? Please include time complexity breakdown.',
        timestamp: Date.now() - 1000 * 60 * 60 * 22,
      },
      {
        id: 'msg-d2',
        role: 'assistant',
        text: `Here is an optimized Python implementation of **Dijkstra's Shortest Path Algorithm** using a priority queue (\`heapq\`), accompanied by complete asymptotic analysis.

<artifact identifier="dijkstra-python-impl" type="code" title="dijkstra_shortest_path.py">
import heapq
from typing import Dict, List, Tuple

def dijkstra(graph: Dict[str, List[Tuple[str, int]]], start: str) -> Tuple[Dict[str, float], Dict[str, str]]:
    """
    Computes shortest path distances from start node to all reachable nodes.
    """
    distances: Dict[str, float] = {vertex: float('infinity') for vertex in graph}
    distances[start] = 0
    predecessors: Dict[str, str] = {vertex: None for vertex in graph}
    
    # Priority queue stores tuples of (current_distance, vertex)
    priority_queue: List[Tuple[int, str]] = [(0, start)]
    
    while priority_queue:
        current_distance, current_vertex = heapq.heappop(priority_queue)
        
        if current_distance > distances[current_vertex]:
            continue
            
        for neighbor, weight in graph.get(current_vertex, []):
            distance = current_distance + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                predecessors[neighbor] = current_vertex
                heapq.heappush(priority_queue, (distance, neighbor))
                
    return distances, predecessors
</artifact>

### Complexity Analysis
| Metric | Worst Case | Space Complexity |
| :--- | :--- | :--- |
| **Min-Heap Implementation** | $\\mathcal{O}((V + E) \\log V)$ | $\\mathcal{O}(V + E)$ |
| **Unoptimized Array** | $\\mathcal{O}(V^2)$ | $\\mathcal{O}(V)$ |`,
        timestamp: Date.now() - 1000 * 60 * 60 * 22,
        thinking: `Evaluating graph algorithm requirements.
Start vertex distance initialized to 0, all others to infinity.
Priority queue pops minimum distance node greedily.
Relaxing incident edges takes O(log V) per edge push.`,
        thinkingDuration: 4.1,
      },
    ],
  },
  {
    id: 'conv-paper',
    title: 'Transformer Attention Literature Review',
    createdAt: Date.now() - 1000 * 60 * 60 * 80,
    updatedAt: Date.now() - 1000 * 60 * 60 * 80,
    projectId: 'proj-1',
    messages: [
      {
        id: 'msg-p1',
        role: 'user',
        text: 'Can you draft a literature review framework comparing standard multi-head attention with linear and state-space architectures?',
        timestamp: Date.now() - 1000 * 60 * 60 * 80,
      },
      {
        id: 'msg-p2',
        role: 'assistant',
        text: `Here is a structured literature review framework tailored for academic research in Machine Learning:

<artifact identifier="ml-literature-review" type="markdown" title="Literature Review: Attention Mechanisms & Efficient Transformers">
# Literature Review: Evolutionary Dynamics of Attention Architectures

## 1. Executive Taxonomy
Recent advancements in transformer architectures can be categorized into three primary lineages:
1. **Low-Rank Kernel Approximations**: Performer, Linformer (linear sequence scaling).
2. **Sparse Matrix Factorization**: Longformer, BigBird (block and strided local attention).
3. **Recurrent & State-Space Models**: S4, Mamba (continuous-time state transitions).

## 2. Comparative Matrix
| Model Architecture | Computational Complexity | Memory Footprint | Long-Context Fidelity |
| :--- | :--- | :--- | :--- |
| Vanilla Attention | $\\mathcal{O}(N^2)$ | High ($KV$ cache) | Baseline |
| FlashAttention-2 | $\\mathcal{O}(N^2)$ IO-aware | Minimal SRAM spill | Exact baseline match |
| Mamba / SSM | $\\mathcal{O}(N)$ | Ultra-low constant | High on sequential tasks |
</artifact>

This outline balances mathematical precision with scannable presentation. Let me know if you would like to flesh out specific empirical citations or experimental methodology.`,
        timestamp: Date.now() - 1000 * 60 * 60 * 80,
        thinking: `Reviewing Transformer literature taxonomy.
Key benchmarks: Vaswani et al. (2017), Dao et al. (FlashAttention), Gu & Dao (Mamba).
Synthesizing comparative tradeoffs between time complexity and empirical accuracy.`,
        thinkingDuration: 2.8,
      },
    ],
  },
];
