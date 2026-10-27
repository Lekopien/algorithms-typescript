import { gridSearch, sortSteps, Trie } from "../src";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------- Sorting ----------
let values: number[] = [];
let sorting = false;
const bars = $("bars");

function shuffle() {
  values = Array.from({ length: 48 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
  bars.replaceChildren(...values.map((v) => Object.assign(document.createElement("div"), { style: `height:${(v / 48) * 100}%` })));
  $("sortStats").textContent = "";
}

async function runSort() {
  if (sorting) return;
  sorting = true;
  const steps = sortSteps(values, $<HTMLSelectElement>("sortAlgo").value as "bubble");
  const els = [...bars.children] as HTMLElement[];
  let compares = 0, swaps = 0;
  for (const s of steps) {
    const delay = 61 - Number($<HTMLInputElement>("speed").value);
    const a = els[s.i]!, b = els[s.j]!;
    if (s.type === "compare") compares++;
    else {
      swaps++;
      [values[s.i], values[s.j]] = [values[s.j]!, values[s.i]!];
      [a.style.height, b.style.height] = [b.style.height, a.style.height];
    }
    const cls = s.type === "compare" ? "cmp" : "swp";
    a.classList.add(cls); b.classList.add(cls);
    $("sortStats").textContent = `${compares} compares · ${swaps} swaps`;
    await sleep(delay);
    a.classList.remove(cls); b.classList.remove(cls);
  }
  for (const el of els) { el.classList.add("done"); await sleep(8); }
  sorting = false;
}

$("shuffle").onclick = () => !sorting && shuffle();
$("sortRun").onclick = runSort;
shuffle();

// ---------- Pathfinding ----------
const ROWS = 18, COLS = 36;
const START: [number, number] = [9, 4], GOAL: [number, number] = [9, 31];
let walls = Array.from({ length: ROWS }, () => new Array<boolean>(COLS).fill(false));
let running = false;
const gridEl = $("grid");
gridEl.style.gridTemplateColumns = `repeat(${COLS}, auto)`;
const cells: HTMLDivElement[][] = [];

for (let r = 0; r < ROWS; r++) {
  cells.push([]);
  for (let c = 0; c < COLS; c++) {
    const d = document.createElement("div");
    if (r === START[0] && c === START[1]) d.className = "start";
    if (r === GOAL[0] && c === GOAL[1]) d.className = "goal";
    d.dataset.r = String(r);
    d.dataset.c = String(c);
    cells[r]!.push(d);
    gridEl.append(d);
  }
}

const isEnd = (r: number, c: number) => (r === START[0] && c === START[1]) || (r === GOAL[0] && c === GOAL[1]);
function paintWalls() {
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (!isEnd(r, c)) cells[r]![c]!.className = walls[r]![c] ? "wall" : "";
  }
  $("pathStats").textContent = "";
}

let drawing: boolean | null = null;
gridEl.addEventListener("pointerdown", (e) => {
  const t = e.target as HTMLElement;
  if (running || !t.dataset.r) return;
  const r = Number(t.dataset.r), c = Number(t.dataset.c);
  if (isEnd(r, c)) return;
  drawing = !walls[r]![c];
  walls[r]![c] = drawing;
  paintWalls();
});
gridEl.addEventListener("pointerover", (e) => {
  const t = e.target as HTMLElement;
  if (drawing === null || !t.dataset.r) return;
  const r = Number(t.dataset.r), c = Number(t.dataset.c);
  if (!isEnd(r, c)) { walls[r]![c] = drawing; t.className = drawing ? "wall" : ""; }
});
addEventListener("pointerup", () => (drawing = null));

$("maze").onclick = () => {
  if (running) return;
  walls = walls.map((row, r) => row.map((_, c) => !isEnd(r, c) && Math.random() < 0.28));
  paintWalls();
};
$("clear").onclick = () => {
  if (running) return;
  walls = walls.map((row) => row.map(() => false));
  paintWalls();
};
$("pathRun").onclick = async () => {
  if (running) return;
  running = true;
  paintWalls();
  const { visited, path } = gridSearch(walls, START, GOAL, $<HTMLSelectElement>("pathAlgo").value as "astar");
  for (const [i, [r, c]] of visited.entries()) {
    if (!isEnd(r, c)) cells[r]![c]!.className = "seen";
    if (i % 4 === 0) await sleep(6);
  }
  for (const [r, c] of path) {
    if (!isEnd(r, c)) cells[r]![c]!.className = "path";
    await sleep(18);
  }
  $("pathStats").textContent = path.length ? `visited ${visited.length} cells · path length ${path.length - 1}` : `no path · visited ${visited.length} cells`;
  running = false;
};
walls = walls.map((row, r) => row.map((_, c) => c === 18 && r > 2 && r < 16));
paintWalls();

// ---------- Trie ----------
const trie = new Trie();
"algorithm array a-star adjacency amortized backtracking binary-search bfs big-o bit-manipulation bubble-sort cache complexity dfs dijkstra divide-and-conquer dynamic-programming edit-distance graph greedy hash-map heap heapsort insertion-sort knapsack linked-list lru-cache memoization merge-sort minimum-spanning-tree priority-queue queue quicksort recursion red-black-tree selection-sort sliding-window stack topological-sort tree trie two-pointers union-find"
  .split(" ").forEach((w) => trie.insert(w));
$<HTMLInputElement>("q").addEventListener("input", (e) => {
  const q = (e.target as HTMLInputElement).value.trim().toLowerCase();
  $("suggest").replaceChildren(...(q ? trie.complete(q, 8) : []).map((w) => Object.assign(document.createElement("li"), { className: "chip", textContent: w })));
});
