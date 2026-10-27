import { MinHeap } from "./heap";

export type Graph = Map<string, Map<string, number>>;

export function graph(edges: [string, string, number?][], directed = false): Graph {
  const g: Graph = new Map();
  const add = (a: string) => g.get(a) ?? g.set(a, new Map()).get(a)!;
  for (const [a, b, w = 1] of edges) {
    add(a).set(b, w);
    if (directed) add(b); else add(b).set(a, w);
  }
  return g;
}

/** Breadth-first search: fewest-edges path, or null. */
export function bfs(g: Graph, start: string, goal: string): string[] | null {
  const prev = new Map<string, string | null>([[start, null]]);
  const queue = [start];
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head]!;
    if (node === goal) return path(prev, goal);
    for (const next of g.get(node)?.keys() ?? []) {
      if (!prev.has(next)) { prev.set(next, node); queue.push(next); }
    }
  }
  return null;
}

/** Dijkstra's shortest path for non-negative weights, O((V + E) log V). */
export function dijkstra(g: Graph, start: string, goal: string): { path: string[]; cost: number } | null {
  const dist = new Map<string, number>([[start, 0]]);
  const prev = new Map<string, string | null>([[start, null]]);
  const pq = new MinHeap<[number, string]>((a, b) => a[0] < b[0]);
  pq.push([0, start]);
  while (pq.size) {
    const [d, node] = pq.pop()!;
    if (d > (dist.get(node) ?? Infinity)) continue; // stale queue entry
    if (node === goal) return { path: path(prev, goal), cost: d };
    for (const [next, w] of g.get(node) ?? []) {
      if (w < 0) throw new RangeError("Dijkstra needs non-negative weights");
      const nd = d + w;
      if (nd < (dist.get(next) ?? Infinity)) {
        dist.set(next, nd);
        prev.set(next, node);
        pq.push([nd, next]);
      }
    }
  }
  return null;
}

/** Kahn's algorithm. Throws if the graph has a cycle. */
export function topoSort(g: Graph): string[] {
  const indeg = new Map([...g.keys()].map((k) => [k, 0]));
  for (const edges of g.values()) for (const n of edges.keys()) indeg.set(n, (indeg.get(n) ?? 0) + 1);
  const ready = [...indeg].filter(([, d]) => d === 0).map(([k]) => k).sort();
  const out: string[] = [];
  while (ready.length) {
    const n = ready.shift()!;
    out.push(n);
    for (const m of g.get(n)?.keys() ?? []) {
      indeg.set(m, indeg.get(m)! - 1);
      if (indeg.get(m) === 0) ready.push(m);
    }
  }
  if (out.length !== indeg.size) throw new Error("graph has a cycle");
  return out;
}

function path(prev: Map<string, string | null>, goal: string): string[] {
  const out: string[] = [];
  for (let n: string | null | undefined = goal; n != null; n = prev.get(n)) out.unshift(n);
  return out;
}

/** Grid pathfinding (4-directional) that also reports visit order for visualisation. */
export function gridSearch(
  walls: boolean[][], start: [number, number], goal: [number, number], algo: "bfs" | "dijkstra" | "astar",
): { visited: [number, number][]; path: [number, number][] } {
  const rows = walls.length, cols = walls[0]?.length ?? 0;
  const key = (r: number, c: number) => r * cols + c;
  const h = (r: number, c: number) => (algo === "astar" ? Math.abs(r - goal[0]) + Math.abs(c - goal[1]) : 0);
  const g = new Map<number, number>([[key(...start), 0]]);
  const prev = new Map<number, number>();
  const visited: [number, number][] = [];
  const seen = new Set<number>();
  let order = 0; // FIFO tie-break makes BFS and Dijkstra behave like a queue on unit weights
  const pq = new MinHeap<[number, number, number, number]>((a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]));
  pq.push([h(...start), order++, ...start]);
  while (pq.size) {
    const [, , r, c] = pq.pop()!;
    const k = key(r, c);
    if (seen.has(k)) continue;
    seen.add(k);
    visited.push([r, c]);
    if (r === goal[0] && c === goal[1]) {
      const p: [number, number][] = [];
      for (let n: number | undefined = k; n !== undefined; n = prev.get(n)) p.unshift([Math.floor(n / cols), n % cols]);
      return { visited, path: p };
    }
    for (const [dr, dc] of [[0, 1], [1, 0], [0, -1], [-1, 0]] as const) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || walls[nr]![nc]) continue;
      const nk = key(nr, nc), ng = g.get(k)! + 1;
      if (ng < (g.get(nk) ?? Infinity)) {
        g.set(nk, ng);
        prev.set(nk, k);
        pq.push([ng + h(nr, nc), order++, nr, nc]);
      }
    }
  }
  return { visited, path: [] };
}
