/** Levenshtein edit distance with a rolling row: O(n·m) time, O(min(n, m)) space. */
export function editDistance(a: string, b: string): number {
  if (a.length < b.length) [a, b] = [b, a];
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length]!;
}

/** Longest common subsequence, returning the subsequence itself. */
export function lcs(a: string, b: string): string {
  const t = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      t[i]![j] = a[i - 1] === b[j - 1] ? t[i - 1]![j - 1]! + 1 : Math.max(t[i - 1]![j]!, t[i]![j - 1]!);
    }
  }
  let out = "";
  for (let i = a.length, j = b.length; i && j;) {
    if (a[i - 1] === b[j - 1]) { out = a[i - 1] + out; i--; j--; }
    else if (t[i - 1]![j]! >= t[i]![j - 1]!) i--;
    else j--;
  }
  return out;
}

/** 0/1 knapsack: best value within capacity and which items to take. */
export function knapsack(items: { weight: number; value: number }[], capacity: number): { value: number; take: number[] } {
  const best = Array.from({ length: items.length + 1 }, () => new Array<number>(capacity + 1).fill(0));
  items.forEach(({ weight, value }, i) => {
    for (let c = 0; c <= capacity; c++) {
      best[i + 1]![c] = Math.max(best[i]![c]!, weight <= c ? best[i]![c - weight]! + value : 0);
    }
  });
  const take: number[] = [];
  for (let i = items.length, c = capacity; i > 0; i--) {
    if (best[i]![c] !== best[i - 1]![c]) { take.unshift(i - 1); c -= items[i - 1]!.weight; }
  }
  return { value: best[items.length]![capacity]!, take };
}

/** Fewest coins to make amount, or -1. Bottom-up DP. */
export function coinChange(coins: number[], amount: number): number {
  const dp = new Array<number>(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) for (const c of coins) if (c <= a) dp[a] = Math.min(dp[a]!, dp[a - c]! + 1);
  return dp[amount] === Infinity ? -1 : dp[amount]!;
}
