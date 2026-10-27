# Algorithms in TypeScript

[![ci](https://github.com/Lekopien/algorithms-typescript/actions/workflows/ci.yml/badge.svg)](https://github.com/Lekopien/algorithms-typescript/actions/workflows/ci.yml)

**Interactive visualizer: https://algo.lekopien.com**

Classic data structures and algorithms implemented from scratch in **strict TypeScript** (`strict` + `noUncheckedIndexedAccess`), each with its complexity documented and tested, plus a browser visualizer that runs on the same code.

## Contents

| Area | Implementation | Complexity |
| --- | --- | --- |
| Heap | `MinHeap<T>` with custom comparator | push/pop O(log n) |
| Cache | `LRUCache<K, V>` | get/set O(1) |
| Strings | `Trie` with sorted autocomplete | insert O(k) |
| Sets | `UnionFind` with path halving and union by rank | ~O(α(n)) |
| Sorting | `mergeSort` (stable), `quickSort` (median-of-3, insertion cutoff, O(log n) stack) | O(n log n) |
| Searching | `binarySearch` | O(log n) |
| Graphs | `bfs`, `dijkstra` (heap-based), `topoSort` (Kahn, cycle detection) | O((V+E) log V) |
| Grids | `gridSearch`: BFS, Dijkstra, A* with visit order for animation | |
| Dynamic programming | `editDistance` (O(min) space), `lcs`, `knapsack` (with chosen items), `coinChange` | O(n·m) |

```ts
import { dijkstra, graph, LRUCache, Trie } from "./src";

const roads = graph([["Nairobi", "Nakuru", 160], ["Nakuru", "Kisumu", 190], ["Nairobi", "Kisumu", 400]]);
dijkstra(roads, "Nairobi", "Kisumu"); // { path: ["Nairobi", "Nakuru", "Kisumu"], cost: 350 }
```

## Tests

`npm test` runs 16 Vitest suites, including property-style checks: the heap and both sorts are compared with `Array.prototype.sort` on many random inputs, recorded sort steps are replayed to prove they sort, and the grid test checks that BFS, Dijkstra and A* agree on path length while A* explores fewer cells.

## Visualizer

- **Sorting**: bubble, insertion, selection and quicksort, with live compare and swap counts.
- **Pathfinding**: draw walls with mouse or touch, then compare BFS, Dijkstra and A*.
- **Autocomplete**: a trie of CS terms.

```bash
npm install
npm run dev      # visualizer at http://localhost:5173
npm test
npm run build    # type-check + build the visualizer into dist/
```

Deployed free on Cloudflare Workers (`wrangler.jsonc`, build command `npm run build`) at `algo.lekopien.com`.

## License

MIT
