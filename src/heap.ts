/** Binary min-heap ordered by a comparator. push/pop are O(log n), peek is O(1). */
export class MinHeap<T> {
  private items: T[] = [];
  constructor(private readonly less: (a: T, b: T) => boolean = (a, b) => a < b) {}

  get size(): number {
    return this.items.length;
  }

  peek(): T | undefined {
    return this.items[0];
  }

  push(value: T): void {
    const a = this.items;
    a.push(value);
    let i = a.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (!this.less(a[i]!, a[parent]!)) break;
      [a[i], a[parent]] = [a[parent]!, a[i]!];
      i = parent;
    }
  }

  pop(): T | undefined {
    const a = this.items;
    if (a.length <= 1) return a.pop();
    const top = a[0];
    a[0] = a.pop()!;
    let i = 0;
    for (;;) {
      const l = 2 * i + 1, r = l + 1;
      let smallest = i;
      if (l < a.length && this.less(a[l]!, a[smallest]!)) smallest = l;
      if (r < a.length && this.less(a[r]!, a[smallest]!)) smallest = r;
      if (smallest === i) return top;
      [a[i], a[smallest]] = [a[smallest]!, a[i]!];
      i = smallest;
    }
  }
}
