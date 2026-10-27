interface Node {
  children: Map<string, Node>;
  end: boolean;
}

const node = (): Node => ({ children: new Map(), end: false });

/** Prefix tree for autocomplete: insert O(k), prefix lookup O(k + results). */
export class Trie {
  private root = node();
  private count = 0;

  get size(): number {
    return this.count;
  }

  insert(word: string): void {
    let n = this.root;
    for (const ch of word) {
      if (!n.children.has(ch)) n.children.set(ch, node());
      n = n.children.get(ch)!;
    }
    if (!n.end) this.count++;
    n.end = true;
  }

  has(word: string): boolean {
    return this.find(word)?.end ?? false;
  }

  /** Words starting with prefix, alphabetically, up to limit. */
  complete(prefix: string, limit = 10): string[] {
    const start = this.find(prefix);
    const out: string[] = [];
    const walk = (n: Node, acc: string) => {
      if (out.length >= limit) return;
      if (n.end) out.push(acc);
      for (const ch of [...n.children.keys()].sort()) walk(n.children.get(ch)!, acc + ch);
    };
    if (start) walk(start, prefix);
    return out;
  }

  private find(s: string): Node | undefined {
    let n: Node | undefined = this.root;
    for (const ch of s) n = n?.children.get(ch);
    return n;
  }
}
