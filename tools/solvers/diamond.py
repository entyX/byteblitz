from .common import *  # noqa: F401,F403

import heapq
from collections import deque
from itertools import combinations, permutations
from math import gcd

_INF = float("inf")


def _read_weighted(ls, at, m, weighted=True):
    return [ints(ls[at + j]) for j in range(m)]


def _g_edges(weighted=True, extra=None, sizes=(2, 3, 4, 6), wmax=9):
    def gen(r, i):
        n = size(i, sizes)
        m = r.randint(0, 5)
        rows = []
        for _ in range(m):
            u, v = r.randint(1, n), r.randint(1, n)
            rows.append(f"{u} {v} {r.randint(0, wmax)}" if weighted else f"{u} {v}")
        head = [n, m] + (list(extra(r, n)) if extra else [])
        return nl(sp(head), *rows)
    return gen


# ── D-001 · shortest path with one half-price edge ──────────────────────────
@problem("D-001-1", gen=_g_edges())
def _(inp):
    ls = L(inp)
    n, m = ints(ls[0])
    edges = _read_weighted(ls, 1, m)
    # state: (node, coupon spent?)
    dist = {(1, 0): 0}
    heap = [(0, 1, 0)]
    while heap:
        d, u, used = heapq.heappop(heap)
        if d > dist.get((u, used), _INF):
            continue
        for a, b, w in edges:
            if a != u:
                continue
            for nu, cost in ((used, w),) + (((1, w // 2),) if not used else ()):
                nd = d + cost
                if nd < dist.get((b, nu), _INF):
                    dist[(b, nu)] = nd
                    heapq.heappush(heap, (nd, b, nu))
    best = min(dist.get((n, 0), _INF), dist.get((n, 1), _INF))
    return "-1" if best == _INF else str(best)


# ── D-002 · cheapest route using at most K edges ────────────────────────────
@problem("D-002-1", gen=_g_edges(extra=lambda r, n: [r.randint(0, 4)]))
def _(inp):
    ls = L(inp)
    n, m, k = ints(ls[0])
    edges = _read_weighted(ls, 1, m)
    best = [_INF] * (n + 1)
    best[1] = 0
    for _ in range(k):
        nxt = best[:]
        for a, b, w in edges:
            if best[a] + w < nxt[b]:
                nxt[b] = best[a] + w
        best = nxt
    return "-1" if best[n] == _INF else str(best[n])


# ── D-003/D-004/D-005 · disjoint sets ───────────────────────────────────────
class _DSU:
    def __init__(self, n):
        self.p = list(range(n + 1))

    def find(self, x):
        while self.p[x] != x:
            self.p[x] = self.p[self.p[x]]
            x = self.p[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        self.p[ra] = rb
        return True


def _g_dsu_queries(r, i):
    n = size(i, (1, 3, 4, 5))
    e = r.randint(0, 3)
    q = r.randint(1, 3)
    rows = [f"{r.randint(1, n)} {r.randint(1, n)}" for _ in range(e)]
    qs = [f"{r.randint(1, n)} {r.randint(1, n)}" for _ in range(q)]
    return nl(sp([n, e, q]), *rows, *qs)


@problem("D-003-1", gen=_g_dsu_queries)
def _(inp):
    ls = L(inp)
    n, e, q = ints(ls[0])
    dsu = _DSU(n)
    for j in range(e):
        u, v = ints(ls[1 + j])
        dsu.union(u, v)
    out = []
    for j in range(q):
        u, v = ints(ls[1 + e + j])
        out.append(yn(dsu.find(u) == dsu.find(v)))
    return nl(*out)


@problem("D-004-1", gen=_g_edges(weighted=False, sizes=(1, 3, 4, 5)))
def _(inp):
    ls = L(inp)
    n, m = ints(ls[0])
    dsu = _DSU(n)
    for j in range(m):
        u, v = ints(ls[1 + j])
        if not dsu.union(u, v):
            return str(j + 1)
    return "NONE"


@problem("D-005-1", gen=_g_edges(sizes=(1, 3, 4, 5)))
def _(inp):
    ls = L(inp)
    n, m = ints(ls[0])
    edges = sorted(_read_weighted(ls, 1, m), key=lambda t: t[2])
    dsu = _DSU(n)
    total, joined = 0, 0
    for u, v, w in edges:
        if dsu.union(u, v):
            total += w
            joined += 1
    return str(total) if joined == n - 1 else "-1"


# ── D-006/D-007/D-008/D-030 · trees ─────────────────────────────────────────
def _g_tree(weighted=False, weights_line=False, queries=0, sizes=(1, 2, 4, 6)):
    def gen(r, i):
        n = size(i, sizes)
        rows = []
        for v in range(2, n + 1):
            u = r.randint(1, v - 1)
            rows.append(f"{u} {v} {r.randint(0, 9)}" if weighted else f"{u} {v}")
        head = [str(n)] + ([sp(arr(r, n, 0, 9))] if weights_line else [])
        if queries:
            head[0] = sp([n, queries])
            rows += [f"{r.randint(1, n)} {r.randint(1, n)}" for _ in range(queries)]
        return nl(*head, *rows)
    return gen


def _tree_adj(ls, n, at=1, weighted=False):
    adj = [[] for _ in range(n + 1)]
    for j in range(n - 1):
        row = ints(ls[at + j])
        w = row[2] if weighted else 1
        adj[row[0]].append((row[1], w))
        adj[row[1]].append((row[0], w))
    return adj


def _far(adj, src, n):
    dist = [-1] * (n + 1)
    dist[src] = 0
    q = deque([src])
    while q:
        u = q.popleft()
        for v, w in adj[u]:
            if dist[v] < 0:
                dist[v] = dist[u] + w
                q.append(v)
    return dist


@problem("D-006-1", gen=_g_tree(weighted=True))
def _(inp):
    ls = L(inp)
    n = int(ls[0])
    adj = _tree_adj(ls, n, weighted=True)
    d1 = _far(adj, 1, n)
    end = max(range(1, n + 1), key=lambda v: d1[v])
    return str(max(_far(adj, end, n)[1:]))


@problem("D-007-1", gen=_g_tree())
def _(inp):
    ls = L(inp)
    n = int(ls[0])
    adj = _tree_adj(ls, n)
    return sp(sum(_far(adj, v, n)[1:]) for v in range(1, n + 1))


@problem("D-008-1", gen=_g_tree(queries=2))
def _(inp):
    ls = L(inp)
    n, q = ints(ls[0])
    adj = _tree_adj(ls, n)
    parent = [0] * (n + 1)
    depth = [0] * (n + 1)
    seen = [False] * (n + 1)
    seen[1] = True
    stack = [1]
    while stack:
        u = stack.pop()
        for v, _ in adj[u]:
            if not seen[v]:
                seen[v] = True
                parent[v] = u
                depth[v] = depth[u] + 1
                stack.append(v)
    out = []
    for j in range(q):
        a, b = ints(ls[n + j])
        while depth[a] > depth[b]:
            a = parent[a]
        while depth[b] > depth[a]:
            b = parent[b]
        while a != b:
            a, b = parent[a], parent[b]
        out.append(str(a))
    return nl(*out)


@problem("D-030-1", gen=_g_tree(weights_line=True))
def _(inp):
    ls = L(inp)
    n = int(ls[0])
    w = ints(ls[1])
    adj = _tree_adj(ls, n, at=2)
    take = [0] * (n + 1)
    skip = [0] * (n + 1)
    order, seen, parent = [], [False] * (n + 1), [0] * (n + 1)
    seen[1] = True
    stack = [1]
    while stack:
        u = stack.pop()
        order.append(u)
        for v, _ in adj[u]:
            if not seen[v]:
                seen[v] = True
                parent[v] = u
                stack.append(v)
    for u in reversed(order):
        take[u] = w[u - 1]
        for v, _ in adj[u]:
            if v != parent[u]:
                take[u] += skip[v]
                skip[u] += max(take[v], skip[v])
    return str(max(take[1], skip[1]))


# ── D-009 · point updates and range sums ────────────────────────────────────
def _g_fenwick(r, i):
    n = size(i, (1, 2, 3, 4))
    q = r.randint(1, 3)
    rows = []
    for _ in range(q):
        if r.random() < 0.5:
            rows.append(f"1 {r.randint(1, n)} {r.randint(-5, 5)}")
        else:
            lo = r.randint(1, n)
            rows.append(f"2 {lo} {r.randint(lo, n)}")
    return nl(sp([n, q]), sp(arr(r, n, -5, 9)), *rows)


@problem("D-009-1", gen=_g_fenwick)
def _(inp):
    ls = L(inp)
    n, q = ints(ls[0])
    a = ints(ls[1])
    out = []
    for j in range(q):
        row = ints(ls[2 + j])
        if row[0] == 1:
            a[row[1] - 1] += row[2]
        else:
            out.append(str(sum(a[row[1] - 1:row[2]])))
    return nl(*out)


# ── D-010/D-011 · inversions ────────────────────────────────────────────────
@problem("D-010-1", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=-5, hi=5))
def _(inp):
    a = ints(L(inp)[1])
    n = len(a)
    return str(sum(1 for j in range(n) for k in range(j + 1, n) if a[j] > a[k]))


@problem("D-011-1", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=-5, hi=5))
def _(inp):
    a = ints(L(inp)[1])
    n = len(a)
    return sp(sum(1 for k in range(j + 1, n) if a[k] < a[j]) for j in range(n))


# ── D-012 · axis-aligned segment crossings ──────────────────────────────────
def _g_segments(r, i):
    h, v = ((0, 0), (1, 1), (2, 1), (2, 3))[i % 4]
    hs = []
    for _ in range(h):
        x1 = r.randint(-5, 5)
        hs.append(f"{x1} {x1 + r.randint(0, 6)} {r.randint(-5, 5)}")
    vs = []
    for _ in range(v):
        y1 = r.randint(-5, 5)
        vs.append(f"{r.randint(-5, 5)} {y1} {y1 + r.randint(0, 6)}")
    return nl(sp([h, v]), *hs, *vs)


@problem("D-012-1", gen=_g_segments)
def _(inp):
    ls = L(inp)
    h, v = ints(ls[0])
    hor = [ints(ls[1 + j]) for j in range(h)]
    ver = [ints(ls[1 + h + j]) for j in range(v)]
    return str(sum(1 for x1, x2, y in hor for x, y1, y2 in ver
                   if min(x1, x2) <= x <= max(x1, x2) and min(y1, y2) <= y <= max(y1, y2)))


# ── D-013/D-014/D-015 · window and subarray sums ────────────────────────────
@problem("D-013-1", gen=lambda r, i: (lambda n: nl(sp([n, r.randint(1, n)]), sp(arr(r, n, -9, 9))))(
    size(i, (1, 3, 5, 7))))
def _(inp):
    n, k = ints(L(inp)[0])
    a = ints(L(inp)[1])
    return sp(max(a[j:j + k]) for j in range(n - k + 1))


@problem("D-014-1", gen=lambda r, i: (lambda n: nl(sp([n, r.randint(-5, 12)]), sp(arr(r, n, -9, 9))))(
    size(i, (1, 3, 5, 7))))
def _(inp):
    n, k = ints(L(inp)[0])
    a = ints(L(inp)[1])
    best = None
    for lo in range(n):
        t = 0
        for hi in range(lo, n):
            t += a[hi]
            if t >= k:
                best = hi - lo + 1 if best is None else min(best, hi - lo + 1)
                break
    return str(best if best is not None else -1)


@problem("D-015-1", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=-9, hi=9))
def _(inp):
    a = ints(L(inp)[1])
    n = len(a)
    best = None
    for lo in range(n):
        for hi in range(lo, n):
            seg = a[lo:hi + 1]
            options = [sum(seg)]
            if len(seg) > 1:
                options.append(sum(seg) - min(seg))
            cand = max(options)
            best = cand if best is None else max(best, cand)
    return str(best)


# ── D-016 · longest palindromic subsequence ─────────────────────────────────
@problem("D-016-1", gen=g_str(sizes=(1, 3, 5, 7), alpha="abc"))
def _(inp):
    s = RL(inp)[0]
    n = len(s)
    dp = [[0] * n for _ in range(n)]
    for j in range(n - 1, -1, -1):
        dp[j][j] = 1
        for k in range(j + 1, n):
            dp[j][k] = dp[j + 1][k - 1] + 2 if s[j] == s[k] else max(dp[j + 1][k], dp[j][k - 1])
    return str(dp[0][n - 1])


# ── D-017/D-018 · intervals ─────────────────────────────────────────────────
def _g_reward_intervals(r, i):
    n = size(i, (0, 1, 2, 4))
    rows = []
    for _ in range(n):
        s0 = r.randint(0, 8)
        rows.append(f"{s0} {s0 + r.randint(1, 4)} {r.randint(0, 9)}")
    return nl(str(n), *rows)


@problem("D-017-1", gen=_g_reward_intervals)
def _(inp):
    ls = L(inp)
    n = int(ls[0])
    iv = sorted(tuple(ints(ls[1 + j])) for j in range(n))
    best = [0] * (n + 1)
    for j in range(n - 1, -1, -1):
        s, e, val = iv[j]
        nxt = next((k for k in range(j + 1, n) if iv[k][0] >= e), n)
        best[j] = max(best[j + 1], val + best[nxt])
    return str(best[0])


def _g_stab_intervals(r, i):
    n = size(i, (0, 1, 2, 4))
    rows = []
    for _ in range(n):
        s0 = r.randint(-5, 8)
        rows.append(f"{s0} {s0 + r.randint(0, 5)}")
    return nl(str(n), *rows)


@problem("D-018-1", gen=_g_stab_intervals)
def _(inp):
    ls = L(inp)
    n = int(ls[0])
    iv = sorted((tuple(ints(ls[1 + j])) for j in range(n)), key=lambda t: t[1])
    points, last = 0, None
    for s, e in iv:
        if last is None or s > last:
            points += 1
            last = e
    return str(points)


# ── D-019/D-020 · running a circuit ─────────────────────────────────────────
def _g_gas(r, i):
    n = size(i, (1, 2, 3, 5))
    return nl(n, sp(arr(r, n, 0, 6)), sp(arr(r, n, 0, 6)))


@problem("D-019-1", gen=_g_gas)
def _(inp):
    ls = L(inp)
    n = int(ls[0])
    gas, cost = ints(ls[1]), ints(ls[2])
    for start in range(n):
        tank = 0
        for step in range(n):
            j = (start + step) % n
            tank += gas[j] - cost[j]
            if tank < 0:
                break
        else:
            return str(start)
    return "-1"


@problem("D-020-1", gen=g_n_arr(sizes=(1, 2, 3, 5), lo=-9, hi=9))
def _(inp):
    a = ints(L(inp)[1])
    run, worst = 0, 0
    for v in a:
        run += v
        worst = min(worst, run)
    return str(1 - worst)


# ── D-021 · maximum product subarray ────────────────────────────────────────
@problem("D-021-1", gen=g_n_arr(sizes=(1, 2, 4, 6), lo=-4, hi=4))
def _(inp):
    a = ints(L(inp)[1])
    n = len(a)
    best = None
    for lo in range(n):
        prod = 1
        for hi in range(lo, n):
            prod *= a[hi]
            best = prod if best is None else max(best, prod)
    return str(best)


# ── D-022 · Kth smallest pair distance ──────────────────────────────────────
@problem("D-022-1", gen=lambda r, i: (lambda n: nl(sp([n, r.randint(1, n * (n - 1) // 2)]),
                                                   sp(arr(r, n, -9, 9))))(size(i, (2, 3, 4, 6))))
def _(inp):
    n, k = ints(L(inp)[0])
    a = ints(L(inp)[1])
    gaps = sorted(abs(a[j] - a[m]) for j in range(n) for m in range(j + 1, n))
    return str(gaps[k - 1])


# ── D-023 · subarray sums divisible by K ────────────────────────────────────
@problem("D-023-1", gen=lambda r, i: (lambda n: nl(sp([n, r.randint(1, 6)]), sp(arr(r, n, -9, 9))))(
    size(i, (1, 3, 4, 6))))
def _(inp):
    n, k = ints(L(inp)[0])
    a = ints(L(inp)[1])
    total = 0
    for lo in range(n):
        s = 0
        for hi in range(lo, n):
            s += a[hi]
            total += s % k == 0
    return str(total)


# ── D-024 · pairwise coprime subsets ────────────────────────────────────────
@problem("D-024-1", gen=g_n_arr(sizes=(1, 2, 3, 4), lo=1, hi=30))
def _(inp):
    a = ints(L(inp)[1])
    n = len(a)
    total = 0
    for mask in range(1 << n):
        picks = [a[j] for j in range(n) if mask >> j & 1]
        if all(gcd(x, y) == 1 for x, y in combinations(picks, 2)):
            total += 1
    return str(total)


# ── D-025 · monotone paths through a grid ───────────────────────────────────
def _g_bin_grid(r, i):
    rr, cc = ((1, 1), (2, 2), (3, 3), (3, 4))[i % 4]
    rows = [list(word(r, cc, "0001")) for _ in range(rr)]
    rows[0][0] = "0"
    rows[rr - 1][cc - 1] = "0"
    return nl(sp([rr, cc]), *["".join(row) for row in rows])


@problem("D-025-1", gen=_g_bin_grid)
def _(inp):
    ls = L(inp)
    rr, cc = ints(ls[0])
    g = [ls[1 + a] for a in range(rr)]
    ways = [[0] * cc for _ in range(rr)]
    for a in range(rr):
        for c in range(cc):
            if g[a][c] == "1":
                continue
            if a == 0 and c == 0:
                ways[a][c] = 1
            else:
                ways[a][c] = (ways[a - 1][c] if a else 0) + (ways[a][c - 1] if c else 0)
    return str(ways[rr - 1][cc - 1])


# ── D-026 · distinct subarray ORs ───────────────────────────────────────────
@problem("D-026-1", gen=g_n_arr(sizes=(1, 2, 4, 6), lo=0, hi=15))
def _(inp):
    a = ints(L(inp)[1])
    n = len(a)
    seen = set()
    for lo in range(n):
        v = 0
        for hi in range(lo, n):
            v |= a[hi]
            seen.add(v)
    return str(len(seen))


# ── D-027 · Nim ─────────────────────────────────────────────────────────────
@problem("D-027-1", gen=g_n_arr(sizes=(1, 2, 3, 5), lo=0, hi=9))
def _(inp):
    x = 0
    for v in ints(L(inp)[1]):
        x ^= v
    return "FIRST" if x else "SECOND"


# ── D-028 · cheapest Hamiltonian path from node 1 ───────────────────────────
def _g_cost_matrix(r, i):
    n = size(i, (1, 2, 3, 4))
    m = [[0] * n for _ in range(n)]
    for a in range(n):
        for b in range(a + 1, n):
            m[a][b] = m[b][a] = r.randint(0, 20)
    return nl(str(n), *[sp(row) for row in m])


@problem("D-028-1", gen=_g_cost_matrix)
def _(inp):
    ls = L(inp)
    n = int(ls[0])
    m = [ints(ls[1 + a]) for a in range(n)]
    best = None
    for order in permutations(range(1, n)):
        total = 0
        cur = 0
        for nxt in order:
            total += m[cur][nxt]
            cur = nxt
        best = total if best is None else min(best, total)
    return str(best if best is not None else 0)


# ── D-029 · broadcast delay ─────────────────────────────────────────────────
@problem("D-029-1", gen=_g_edges(extra=lambda r, n: [r.randint(1, n)], sizes=(1, 2, 4, 6)))
def _(inp):
    ls = L(inp)
    n, m, src = ints(ls[0])
    edges = _read_weighted(ls, 1, m)
    dist = {src: 0}
    heap = [(0, src)]
    while heap:
        d, u = heapq.heappop(heap)
        if d > dist.get(u, _INF):
            continue
        for a, b, w in edges:
            if a == u and d + w < dist.get(b, _INF):
                dist[b] = d + w
                heapq.heappush(heap, (d + w, b))
    if len(dist) < n:
        return "-1"
    return str(max(dist.values()))
