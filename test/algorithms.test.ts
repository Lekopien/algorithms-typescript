import { describe, expect, it } from "vitest";
import { bfs, binarySearch, coinChange, dijkstra, editDistance, graph, gridSearch, knapsack, lcs, mergeSort, quickSort, sortSteps, topoSort } from "../src";

const random = (n: number) => Array.from({ length: n }, () => Math.floor(Math.random() * 500) - 250);

describe("sorting", () => {
  it("merge and quick sort match the built-in sort", () => {
    for (const n of [0, 1, 2, 17, 100, 1000]) {
      const xs = random(n);
      const want = [...xs].sort((a, b) => a - b);
      expect(mergeSort(xs)).toEqual(want);
      expect(quickSort([...xs])).toEqual(want);
    }
  });
  it("merge sort is stable", () => {
    const people = [{ n: "a", age: 30 }, { n: "b", age: 25 }, { n: "c", age: 30 }, { n: "d", age: 25 }];
    expect(mergeSort(people, (x, y) => x.age - y.age).map((p) => p.n)).toEqual(["b", "d", "a", "c"]);
  });
  it("binary search finds every element and rejects misses", () => {
    const xs = [...new Set(random(300))].sort((a, b) => a - b);
    xs.forEach((x, i) => expect(binarySearch(xs, x)).toBe(i));
    expect(binarySearch(xs, 10_000)).toBe(-1);
  });
  it("recorded steps replay to a sorted array", () => {
    for (const algo of ["bubble", "insertion", "selection", "quick"] as const) {
      const xs = random(40);
      const a = [...xs];
      for (const s of sortSteps(xs, algo)) if (s.type === "swap") [a[s.i], a[s.j]] = [a[s.j]!, a[s.i]!];
      expect(a).toEqual([...xs].sort((x, y) => x - y));
    }
  });
});

describe("graphs", () => {
  const roads = graph([["Nairobi", "Nakuru", 160], ["Nakuru", "Eldoret", 150], ["Nairobi", "Eldoret", 400], ["Eldoret", "Kisumu", 120], ["Nakuru", "Kisumu", 190]]);
  it("Dijkstra finds the cheapest route", () => {
    expect(dijkstra(roads, "Nairobi", "Kisumu")).toEqual({ path: ["Nairobi", "Nakuru", "Kisumu"], cost: 350 });
    expect(dijkstra(roads, "Nairobi", "Mars")).toBeNull();
  });
  it("BFS finds the fewest hops", () => {
    expect(bfs(roads, "Nairobi", "Eldoret")).toEqual(["Nairobi", "Eldoret"]);
  });
  it("topological sort orders dependencies and detects cycles", () => {
    const build = graph([["design", "build"], ["build", "test"], ["content", "build"], ["test", "launch"]], true);
    expect(topoSort(build)).toEqual(["content", "design", "build", "test", "launch"]);
    expect(() => topoSort(graph([["a", "b"], ["b", "a"]], true))).toThrow(/cycle/);
  });
  it("grid search: all three find equally short paths, A* explores less", () => {
    const walls = Array.from({ length: 20 }, (_, r) => Array.from({ length: 30 }, (_, c) => c === 15 && r < 17));
    const res = (["bfs", "dijkstra", "astar"] as const).map((a) => gridSearch(walls, [0, 0], [0, 29], a));
    expect(new Set(res.map((r) => r.path.length)).size).toBe(1);
    expect(res[0]!.path.length).toBe(64);
    expect(res[2]!.visited.length).toBeLessThan(res[0]!.visited.length);
    const blocked = walls.map((row) => row.map((_, c) => c === 15));
    expect(gridSearch(blocked, [0, 0], [0, 29], "astar").path).toEqual([]);
  });
});

describe("dynamic programming", () => {
  it("edit distance", () => {
    expect(editDistance("kitten", "sitting")).toBe(3);
    expect(editDistance("", "abc")).toBe(3);
    expect(editDistance("same", "same")).toBe(0);
  });
  it("longest common subsequence", () => {
    expect(lcs("ABCBDAB", "BDCABA")).toHaveLength(4);
    const isSubseq = (sub: string, s: string) => { let i = 0; for (const ch of s) if (ch === sub[i]) i++; return i === sub.length; };
    const common = lcs("lekopien", "pipeline");
    expect(common).toHaveLength(4);
    expect(isSubseq(common, "lekopien") && isSubseq(common, "pipeline")).toBe(true);
  });
  it("knapsack and coin change", () => {
    const items = [{ weight: 1, value: 1 }, { weight: 3, value: 4 }, { weight: 4, value: 5 }, { weight: 5, value: 7 }];
    expect(knapsack(items, 7)).toEqual({ value: 9, take: [1, 2] });
    expect(coinChange([1, 5, 10, 20, 50], 68)).toBe(6);
    expect(coinChange([4], 3)).toBe(-1);
  });
});
