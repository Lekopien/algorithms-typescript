/**
 * Least-recently-used cache with O(1) get and set.
 * A Map keeps insertion order, so re-inserting a key moves it to the "most recent" end.
 */
export class LRUCache<K, V> {
  private map = new Map<K, V>();
  constructor(readonly capacity: number) {
    if (capacity < 1) throw new RangeError("capacity must be at least 1");
  }

  get size(): number {
    return this.map.size;
  }

  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key)!;
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) this.map.delete(this.map.keys().next().value as K);
  }

  keys(): K[] {
    return [...this.map.keys()];
  }
}
