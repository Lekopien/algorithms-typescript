import { describe, expect, it } from "vitest";
import { LRUCache, MinHeap, Trie, UnionFind } from "../src";

describe("MinHeap", () => {
  it("pops in sorted order (property check on random input)", () => {
    for (let round = 0; round < 50; round++) {
      const xs = Array.from({ length: 200 }, () => Math.floor(Math.random() * 1000));
      const h = new MinHeap<number>();
      xs.forEach((x) => h.push(x));
      const out: number[] = [];
      while (h.size) out.push(h.pop()!);
      expect(out).toEqual([...xs].sort((a, b) => a - b));
    }
  });
  it("supports custom ordering and empty pops", () => {
    const h = new MinHeap<string>((a, b) => a.length > b.length);
    ["a", "ccc", "bb"].forEach((s) => h.push(s));
    expect(h.peek()).toBe("ccc");
    expect(new MinHeap().pop()).toBeUndefined();
  });
});

describe("LRUCache", () => {
  it("evicts the least recently used key", () => {
    const c = new LRUCache<string, number>(2);
    c.set("a", 1); c.set("b", 2);
    c.get("a");
    c.set("c", 3);
    expect(c.keys()).toEqual(["a", "c"]);
    expect(c.get("b")).toBeUndefined();
    expect(() => new LRUCache(0)).toThrow(RangeError);
  });
});

describe("Trie", () => {
  it("autocompletes alphabetically", () => {
    const t = new Trie();
    ["car", "card", "care", "cat", "dog", "car"].forEach((w) => t.insert(w));
    expect(t.size).toBe(5);
    expect(t.complete("car")).toEqual(["car", "card", "care"]);
    expect(t.complete("ca", 2)).toEqual(["car", "card"]);
    expect(t.has("ca")).toBe(false);
    expect(t.complete("x")).toEqual([]);
  });
});

describe("UnionFind", () => {
  it("tracks connected components", () => {
    const u = new UnionFind(5);
    expect(u.union(0, 1)).toBe(true);
    u.union(3, 4);
    expect(u.union(1, 0)).toBe(false);
    expect(u.connected(0, 1)).toBe(true);
    expect(u.connected(1, 3)).toBe(false);
    expect(u.components).toBe(3);
  });
});
