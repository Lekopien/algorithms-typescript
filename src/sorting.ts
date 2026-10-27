export type Compare<T> = (a: T, b: T) => number;
const natural = <T>(a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0);

/** Stable O(n log n) merge sort. Returns a new array. */
export function mergeSort<T>(xs: readonly T[], cmp: Compare<T> = natural): T[] {
  if (xs.length <= 1) return [...xs];
  const mid = xs.length >> 1;
  const left = mergeSort(xs.slice(0, mid), cmp);
  const right = mergeSort(xs.slice(mid), cmp);
  const out: T[] = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) out.push(cmp(right[j]!, left[i]!) < 0 ? right[j++]! : left[i++]!);
  return out.concat(left.slice(i), right.slice(j));
}

/** In-place quicksort with median-of-three pivots and insertion sort for small ranges. */
export function quickSort<T>(xs: T[], cmp: Compare<T> = natural): T[] {
  const swap = (i: number, j: number) => { [xs[i], xs[j]] = [xs[j]!, xs[i]!]; };
  const sort = (lo: number, hi: number): void => {
    while (hi - lo > 16) {
      const mid = (lo + hi) >> 1;
      if (cmp(xs[mid]!, xs[lo]!) < 0) swap(mid, lo);
      if (cmp(xs[hi]!, xs[lo]!) < 0) swap(hi, lo);
      if (cmp(xs[hi]!, xs[mid]!) < 0) swap(hi, mid);
      const pivot = xs[mid]!;
      let i = lo, j = hi;
      while (i <= j) {
        while (cmp(xs[i]!, pivot) < 0) i++;
        while (cmp(xs[j]!, pivot) > 0) j--;
        if (i <= j) swap(i++, j--);
      }
      // Recurse into the smaller half, loop on the larger: O(log n) stack depth.
      if (j - lo < hi - i) { sort(lo, j); lo = i; } else { sort(i, hi); hi = j; }
    }
    for (let i = lo + 1; i <= hi; i++) {
      for (let j = i; j > lo && cmp(xs[j]!, xs[j - 1]!) < 0; j--) swap(j, j - 1);
    }
  };
  sort(0, xs.length - 1);
  return xs;
}

/** Index of target in a sorted array, or -1. O(log n). */
export function binarySearch<T>(sorted: readonly T[], target: T, cmp: Compare<T> = natural): number {
  let lo = 0, hi = sorted.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    const c = cmp(sorted[mid]!, target);
    if (c === 0) return mid;
    if (c < 0) lo = mid + 1; else hi = mid - 1;
  }
  return -1;
}

/** Records every compare/swap of bubble, insertion, selection or quick sort for visualising. */
export type Step = { type: "compare" | "swap" | "set"; i: number; j: number; value?: number };

export function sortSteps(input: readonly number[], algo: "bubble" | "insertion" | "selection" | "quick"): Step[] {
  const a = [...input];
  const steps: Step[] = [];
  const swap = (i: number, j: number) => { steps.push({ type: "swap", i, j }); [a[i], a[j]] = [a[j]!, a[i]!]; };
  const less = (i: number, j: number) => { steps.push({ type: "compare", i, j }); return a[i]! < a[j]!; };
  if (algo === "bubble") {
    for (let end = a.length - 1; end > 0; end--) {
      let swapped = false;
      for (let i = 0; i < end; i++) if (less(i + 1, i)) { swap(i, i + 1); swapped = true; }
      if (!swapped) break;
    }
  } else if (algo === "insertion") {
    for (let i = 1; i < a.length; i++) for (let j = i; j > 0 && less(j, j - 1); j--) swap(j, j - 1);
  } else if (algo === "selection") {
    for (let i = 0; i < a.length - 1; i++) {
      let min = i;
      for (let j = i + 1; j < a.length; j++) if (less(j, min)) min = j;
      if (min !== i) swap(i, min);
    }
  } else {
    const qs = (lo: number, hi: number): void => {
      if (lo >= hi) return;
      let p = lo;
      for (let i = lo; i < hi; i++) if (less(i, hi)) swap(i, p++);
      swap(p, hi);
      qs(lo, p - 1);
      qs(p + 1, hi);
    };
    qs(0, a.length - 1);
  }
  return steps;
}
