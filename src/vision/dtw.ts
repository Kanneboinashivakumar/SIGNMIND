export interface DtwResult {
  cost: number;
  path: Array<[number, number]>;
}

export function dtw<T>(a: T[], b: T[], distFn: (x: T, y: T) => number): DtwResult {
  const n = a.length;
  const m = b.length;
  if (n === 0 || m === 0) return { cost: Infinity, path: [] };

  const inf = 1e12;
  const cost: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(inf));
  cost[0][0] = 0;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const d = distFn(a[i - 1], b[j - 1]);
      const diag = cost[i - 1][j - 1];
      const up = cost[i - 1][j] + 0.02;
      const left = cost[i][j - 1] + 0.02;
      cost[i][j] = d + Math.min(diag, up, left);
    }
  }

  const path: Array<[number, number]> = [];
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    path.push([i - 1, j - 1]);
    const diag = cost[i - 1][j - 1];
    const up = cost[i - 1][j];
    const left = cost[i][j - 1];
    if (diag <= up && diag <= left) {
      i -= 1;
      j -= 1;
    } else if (up < left) {
      i -= 1;
    } else {
      j -= 1;
    }
  }
  path.reverse();
  return { cost: cost[n][m], path };
}
