from .common import *  # noqa: F401,F403

from collections import deque


# ── P-001/P-004 · split a sequence into contiguous groups ───────────────────
def _groups_needed(a, cap):
    """Fewest contiguous groups with every group sum <= cap, or None."""
    if any(v > cap for v in a):
        return None
    groups, cur = 1, 0
    for v in a:
        if cur + v > cap:
            groups += 1
            cur = v
        else:
            cur += v
    return groups


def _min_largest(a, k):
    """Smallest achievable largest group sum using at most k groups."""
    lo, hi = max(a), sum(a)
    while lo < hi:
        mid = (lo + hi) // 2
        need = _groups_needed(a, mid)
        if need is not None and need <= k:
            hi = mid
        else:
            lo = mid + 1
    return lo


def _g_split(sizes=(1, 3, 5, 7), lo=0, hi=12):
    def gen(r, i):
        n = size(i, sizes)
        return nl(sp([n, r.randint(1, n)]), sp(arr(r, n, lo, hi)))
    return gen


@problem("P-001-1", "P-001-2", "P-001-3", "P-001-4", "P-001-5",
         gen=_g_split(lo=1, hi=12))
def _(inp):
    n, k = ints(L(inp)[0])
    return str(_min_largest(ints(L(inp)[1]), k))


def _g_split_maybe_short(r, i):
    n = size(i, (1, 3, 5, 7))
    return nl(sp([n, r.randint(1, n + 2)]), sp(arr(r, n, 0, 12)))


@problem("P-004-1", gen=_g_split_maybe_short)
def _(inp):
    n, k = ints(L(inp)[0])
    if k > n:
        return "-1"
    return str(_min_largest(ints(L(inp)[1]), k))


@problem("P-004-2", gen=_g_split_maybe_short)
def _(inp):
    n, k = ints(L(inp)[0])
    a = ints(L(inp)[1])
    best = _min_largest(a, min(k, n))
    return f"{best} {_groups_needed(a, best)}"


@problem("P-004-5", gen=_g_split_maybe_short)
def _(inp):
    n, k = ints(L(inp)[0])
    a = ints(L(inp)[1])
    return str(_min_largest(a, min(k, n)))


def _feasible_sized(a, k, cap, lo_size, hi_size, exact):
    """Can the array be cut into groups of size in [lo_size, hi_size] with every
    sum <= cap, using exactly (or at most) k groups?"""
    n = len(a)
    reach = {0}
    for _ in range(k):
        nxt = set()
        for start in reach:
            total = 0
            for end in range(start, n):
                total += a[end]
                if total > cap:
                    break
                if end - start + 1 > hi_size:
                    break
                if end - start + 1 >= lo_size:
                    nxt.add(end + 1)
        reach = reach | nxt if not exact else nxt
        if n in reach and not exact:
            return True
    return n in reach


def _min_largest_sized(a, k, lo_size, hi_size, exact):
    lo, hi = 0, sum(a)
    if not _feasible_sized(a, k, hi, lo_size, hi_size, exact):
        return None
    while lo < hi:
        mid = (lo + hi) // 2
        if _feasible_sized(a, k, mid, lo_size, hi_size, exact):
            hi = mid
        else:
            lo = mid + 1
    return lo


def _g_split_sized(r, i):
    n = size(i, (1, 3, 5, 7))
    return nl(sp([n, r.randint(1, n), r.randint(1, n)]), sp(arr(r, n, 0, 12)))


@problem("P-004-3", gen=_g_split_sized)
def _(inp):
    n, k, lo_size = ints(L(inp)[0])
    got = _min_largest_sized(ints(L(inp)[1]), k, lo_size, n, True)
    return "-1" if got is None else str(got)


@problem("P-004-4", gen=_g_split_sized)
def _(inp):
    n, k, hi_size = ints(L(inp)[0])
    got = _min_largest_sized(ints(L(inp)[1]), k, 1, hi_size, False)
    return "-1" if got is None else str(got)


# ── P-002 · pick k positions, maximise the smallest gap ─────────────────────
def _greedy_pick(xs, d, k):
    """Left-most greedy selection with minimum separation d; None if short."""
    out = [xs[0]]
    for v in xs[1:]:
        if len(out) == k:
            break
        if v - out[-1] >= d:
            out.append(v)
    return out if len(out) == k else None


def _max_min_gap(xs, k):
    if k <= 1:
        return 0
    lo, hi = 0, xs[-1] - xs[0]
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if _greedy_pick(xs, mid, k):
            lo = mid
        else:
            hi = mid - 1
    return lo


def _g_positions(with_d=False, sizes=(1, 3, 5, 7)):
    def gen(r, i):
        n = size(i, sizes)
        head = [n, r.randint(1, n + 1)] + ([r.randint(0, 8)] if with_d else [])
        return nl(sp(head), sp(arr(r, n, -10, 20)))
    return gen


def _sorted_with_index(ls):
    xs = ints(ls[1])
    order = sorted(range(len(xs)), key=lambda j: (xs[j], j))
    return xs, order


@problem("P-002-1", gen=_g_positions())
def _(inp):
    n, k = ints(L(inp)[0])
    if k > n:
        return "-1"
    return str(_max_min_gap(sorted(ints(L(inp)[1])), k))


@problem("P-002-2", gen=_g_positions())
def _(inp):
    n, k = ints(L(inp)[0])
    if k > n:
        return "-1"
    xs = sorted(ints(L(inp)[1]))
    d = _max_min_gap(xs, k)
    return nl(d, sp(_greedy_pick(xs, d, k)))


@problem("P-002-3", gen=_g_positions(with_d=True))
def _(inp):
    n, k, d = ints(L(inp)[0])
    if k > n:
        return "NO"
    return yn(_greedy_pick(sorted(ints(L(inp)[1])), d, k) is not None)


@problem("P-002-4", gen=_g_positions())
def _(inp):
    ls = L(inp)
    n, k = ints(ls[0])
    if k > n:
        return "-1"
    xs, order = _sorted_with_index(ls)
    vals = [xs[j] for j in order]
    d = _max_min_gap(vals, k)
    picked, last = [order[0]], vals[0]
    for pos, j in list(zip(vals, order))[1:]:
        if len(picked) == k:
            break
        if pos - last >= d:
            picked.append(j)
            last = pos
    return nl(d, sp(sorted(j + 1 for j in picked)))


@problem("P-002-5", gen=_g_positions())
def _(inp):
    n, k = ints(L(inp)[0])
    if k > n:
        return "-1"
    xs = sorted(ints(L(inp)[1]))
    return nl(_max_min_gap(xs, k), xs[0])


# ── P-003 · slowest rate that still finishes in time ────────────────────────
def _min_rate(a, budget):
    lo, hi = 1, max(a)
    while lo < hi:
        mid = (lo + hi) // 2
        if sum(-(-v // mid) for v in a) <= budget:
            hi = mid
        else:
            lo = mid + 1
    return lo


def _g_rate(r, i):
    n = size(i, (1, 3, 4, 6))
    a = arr(r, n, 1, 40)
    return nl(sp([n, r.randint(n, n + 12)]), sp(a))


@problem("P-003-1", "P-003-2", "P-003-3", "P-003-4", "P-003-5", gen=_g_rate)
def _(inp):
    n, budget = ints(L(inp)[0])
    return str(_min_rate(ints(L(inp)[1]), budget))


# ── P-005 · shortest path allowing one wall break ───────────────────────────
def _g_bin_grid(r, i):
    rr, cc = ((1, 1), (2, 2), (3, 3), (4, 4))[i % 4]
    rows = [list(word(r, cc, "0011")) for _ in range(rr)]
    rows[0][0] = "0"
    rows[rr - 1][cc - 1] = "0"
    return nl(sp([rr, cc]), *["".join(row) for row in rows])


@problem("P-005-1", gen=_g_bin_grid)
def _(inp):
    ls = L(inp)
    rr, cc = ints(ls[0])
    g = [ls[1 + a] for a in range(rr)]
    start = (0, 0, 0)
    dist = {start: 0}
    q = deque([start])
    while q:
        a, c, broke = q.popleft()
        if (a, c) == (rr - 1, cc - 1):
            return str(dist[(a, c, broke)])
        for da, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            na, nc = a + da, c + dc
            if not (0 <= na < rr and 0 <= nc < cc):
                continue
            nb = broke + (g[na][nc] == "1")
            if nb > 1 or (na, nc, nb) in dist:
                continue
            dist[(na, nc, nb)] = dist[(a, c, broke)] + 1
            q.append((na, nc, nb))
    return "-1"


# ── P-006 · distance to the nearest source cell ─────────────────────────────
def _g_char_grid(chars, sizes=((1, 1), (2, 2), (3, 3), (3, 4))):
    def gen(r, i):
        rr, cc = sizes[i % len(sizes)]
        return nl(sp([rr, cc]), *["".join(r.choice(chars) for _ in range(cc)) for _ in range(rr)])
    return gen


def _multi_bfs(g, rr, cc, source, wall):
    dist = [[-1] * cc for _ in range(rr)]
    q = deque()
    for a in range(rr):
        for c in range(cc):
            if g[a][c] == source:
                dist[a][c] = 0
                q.append((a, c))
    while q:
        a, c = q.popleft()
        for da, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            na, nc = a + da, c + dc
            if 0 <= na < rr and 0 <= nc < cc and dist[na][nc] < 0 and g[na][nc] != wall:
                dist[na][nc] = dist[a][c] + 1
                q.append((na, nc))
    return dist


@problem("P-006-1", gen=_g_char_grid(".#C"))
def _(inp):
    ls = L(inp)
    rr, cc = ints(ls[0])
    g = [ls[1 + a] for a in range(rr)]
    dist = _multi_bfs(g, rr, cc, "C", "#")
    return nl(*[sp(row) for row in dist])


import heapq


# ── P-006 · spreading through a grid or a graph ─────────────────────────────
def _g_num_grid(vals, sizes=((1, 1), (2, 2), (3, 3), (2, 4))):
    def gen(r, i):
        rr, cc = sizes[i % len(sizes)]
        return nl(sp([rr, cc]), *[sp(r.choice(vals) for _ in range(cc)) for _ in range(rr)])
    return gen


@problem("P-006-2", gen=_g_num_grid([0, 1, 1, 2]))
def _(inp):
    ls = L(inp)
    rr, cc = ints(ls[0])
    g = [ints(ls[1 + a]) for a in range(rr)]
    dist = _multi_bfs([["C" if v == 2 else "#" if v == 0 else "." for v in row] for row in g],
                      rr, cc, "C", "#")
    worst = 0
    for a in range(rr):
        for c in range(cc):
            if g[a][c] == 1:
                if dist[a][c] < 0:
                    return "-1"
                worst = max(worst, dist[a][c])
    return str(worst)


def _read_graph(ls, at, n, m):
    adj = [[] for _ in range(n + 1)]
    for j in range(m):
        u, v = ints(ls[at + j])
        adj[u].append(v)
        adj[v].append(u)
    return adj


def _graph_bfs(adj, sources, n):
    dist = [-1] * (n + 1)
    q = deque()
    for s in sources:
        if dist[s] < 0:
            dist[s] = 0
            q.append(s)
    while q:
        u = q.popleft()
        for v in adj[u]:
            if dist[v] < 0:
                dist[v] = dist[u] + 1
                q.append(v)
    return dist


def _g_graph(extra=None, sizes=(1, 3, 4, 6)):
    def gen(r, i):
        n = size(i, sizes)
        m = r.randint(0, min(5, n))
        edges = [f"{r.randint(1, n)} {r.randint(1, n)}" for _ in range(m)]
        tail = extra(r, n) if extra else []
        return nl(sp([n, m]), *edges, *tail)
    return gen


def _nonblank(inp):
    """Data lines only. With M = 0 these questions still ship the blank line
    where the edge block would be, so the blanks carry no information."""
    return [line for line in RL(inp) if line.strip()]


@problem("P-006-3", gen=_g_graph(lambda r, n: (lambda s: [str(s)] + ([sp(r.randint(1, n) for _ in range(s))] if s else []))(r.randint(0, 2))))
def _(inp):
    ls = _nonblank(inp)
    n, m = ints(ls[0])
    adj = _read_graph(ls, 1, n, m)
    at = 1 + m
    s = int(ls[at])
    srcs = ints(ls[at + 1]) if s else []
    dist = _graph_bfs(adj, srcs, n)
    return nl(*["SAFE" if dist[v] < 0 else str(dist[v]) for v in range(1, n + 1)])


@problem("P-006-5", gen=_g_graph(lambda r, n: (lambda h, q: [str(h)] + ([sp(r.randint(1, n) for _ in range(h))] if h else [])
                                               + [str(q), sp(r.randint(1, n) for _ in range(q))])(
    r.randint(0, 2), r.randint(1, 3))))
def _(inp):
    ls = _nonblank(inp)
    n, m = ints(ls[0])
    adj = _read_graph(ls, 1, n, m)
    at = 1 + m
    h = int(ls[at])
    at += 1
    srcs = []
    if h:
        srcs = ints(ls[at])
        at += 1
    at += 1  # the query count line
    dist = _graph_bfs(adj, srcs, n)
    return nl(*[str(dist[v]) for v in ints(ls[at])])


@problem("P-006-4", gen=_g_char_grid(".XW"))
def _(inp):
    ls = L(inp)
    rr, cc = ints(ls[0])
    g = [ls[1 + a].replace(" ", "") for a in range(rr)]
    dist = _multi_bfs(g, rr, cc, "W", "X")
    open_cells = [(a, c) for a in range(rr) for c in range(cc) if g[a][c] == "."]
    if not open_cells:
        return "0 0"
    if any(dist[a][c] < 0 for a, c in open_cells):
        return "IMPOSSIBLE"
    worst = max(dist[a][c] for a, c in open_cells)
    hits = sorted((a, c) for a, c in open_cells if dist[a][c] == worst)
    return nl(f"{worst} {len(hits)}", *[f"{a + 1} {c + 1}" for a, c in hits])


# ── P-007 · shortest path that alternates edge types ────────────────────────
def _g_coloured_graph(r, i):
    n = size(i, (1, 2, 4, 6))
    m = r.randint(0, 5)
    edges = [f"{r.randint(1, n)} {r.randint(1, n)} {r.randint(0, 1)}" for _ in range(m)]
    return nl(sp([n, m]), *edges)


@problem("P-007-1", "P-007-2", "P-007-3", "P-007-4", "P-007-5", gen=_g_coloured_graph)
def _(inp):
    ls = L(inp)
    n, m = ints(ls[0])
    adj = [[] for _ in range(n + 1)]
    for j in range(m):
        u, v, c = ints(ls[1 + j])
        adj[u].append((v, c))
        adj[v].append((u, c))
    if n == 1:
        return "0"
    # state: (node, colour of the edge just used); -1 means nothing used yet
    dist = {(1, -1): 0}
    q = deque([(1, -1)])
    while q:
        u, last = q.popleft()
        for v, c in adj[u]:
            if c == last or (v, c) in dist:
                continue
            dist[(v, c)] = dist[(u, last)] + 1
            if v == n:
                return str(dist[(v, c)])
            q.append((v, c))
    return "-1"


# ── P-008 · island area and perimeter ───────────────────────────────────────
def _components(g, rr, cc):
    """[(cells, perimeter)] for every 4-connected block of '1' cells."""
    seen = [[False] * cc for _ in range(rr)]
    out = []
    for a0 in range(rr):
        for c0 in range(cc):
            if g[a0][c0] != "1" or seen[a0][c0]:
                continue
            cells, per = [], 0
            stack = [(a0, c0)]
            seen[a0][c0] = True
            while stack:
                a, c = stack.pop()
                cells.append((a, c))
                for da, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    na, nc = a + da, c + dc
                    if not (0 <= na < rr and 0 <= nc < cc) or g[na][nc] != "1":
                        per += 1
                    elif not seen[na][nc]:
                        seen[na][nc] = True
                        stack.append((na, nc))
            out.append((cells, per))
    return out


def _g_bits_grid(tail=None, sizes=((1, 1), (2, 2), (3, 3), (3, 4))):
    def gen(r, i):
        rr, cc = sizes[i % len(sizes)]
        rows = [word(r, cc, "0011") for _ in range(rr)]
        extra = [str(tail(r, rr, cc))] if tail else []
        return nl(sp([rr, cc]), *rows, *extra)
    return gen


def _read_bits(inp):
    ls = L(inp)
    rr, cc = ints(ls[0])
    return rr, cc, [ls[1 + a] for a in range(rr)], ls[1 + rr:]


@problem("P-008-1", gen=_g_bits_grid())
def _(inp):
    rr, cc, g, _rest = _read_bits(inp)
    comps = _components(g, rr, cc)
    if not comps:
        return "0"
    return str(max(comps, key=lambda t: (len(t[0]), t[1]))[1])


@problem("P-008-2", gen=_g_bits_grid(tail=lambda r, rr, cc: f"{r.randint(1, rr)} {r.randint(1, cc)}"))
def _(inp):
    rr, cc, g, rest = _read_bits(inp)
    a, c = ints(rest[0])
    for cells, per in _components(g, rr, cc):
        if (a - 1, c - 1) in cells:
            return str(per)
    return "-1"


@problem("P-008-3", gen=_g_bits_grid(tail=lambda r, rr, cc: r.randint(-2, 14)))
def _(inp):
    rr, cc, g, rest = _read_bits(inp)
    k = int(rest[0])
    if k < 0:
        return "0"
    return str(sum(1 for _, per in _components(g, rr, cc) if per <= k))


@problem("P-008-4", gen=_g_bits_grid())
def _(inp):
    rr, cc, g, _rest = _read_bits(inp)
    touching = [per for cells, per in _components(g, rr, cc)
                if any(a in (0, rr - 1) or c in (0, cc - 1) for a, c in cells)]
    return str(min(touching)) if touching else "-1"


@problem("P-008-5", gen=_g_bits_grid(tail=lambda r, rr, cc: r.randint(-2, 4)))
def _(inp):
    rr, cc, g, rest = _read_bits(inp)
    m = int(rest[0])
    if m <= 0:
        return "0"
    comps = sorted(_components(g, rr, cc), key=lambda t: (-len(t[0]), t[1]))
    return str(sum(per for _, per in comps[:m]))


# ── P-009 · topological order, smallest index first ─────────────────────────
def _topo(n, edges):
    adj = {}
    indeg = [0] * (n + 1)
    for a, b in edges:
        if (a, b) in adj:
            continue
        adj[(a, b)] = True
        indeg[b] += 1
    out_edges = [[] for _ in range(n + 1)]
    for a, b in adj:
        out_edges[a].append(b)
    heap = [v for v in range(1, n + 1) if indeg[v] == 0]
    heapq.heapify(heap)
    order = []
    while heap:
        u = heapq.heappop(heap)
        order.append(u)
        for v in out_edges[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                heapq.heappush(heap, v)
    return order if len(order) == n else None


def _g_dag(r, i):
    n = size(i, (1, 3, 4, 6))
    m = r.randint(0, 5)
    edges = [f"{r.randint(1, n)} {r.randint(1, n)}" for _ in range(m)]
    return nl(sp([n, m]), *edges)


def _read_edges(inp):
    ls = RL(inp)
    n, m = ints(ls[0])
    return n, [tuple(ints(ls[1 + j])) for j in range(m)]


@problem("P-009-1", gen=_g_dag)
def _(inp):
    n, edges = _read_edges(inp)
    return yn(_topo(n, edges) is not None)


@problem("P-009-2", "P-009-5", gen=_g_dag)
def _(inp):
    order = _topo(*_read_edges(inp))
    return sp(order) if order else "IMPOSSIBLE"


@problem("P-009-3", gen=_g_dag)
def _(inp):
    order = _topo(*_read_edges(inp))
    return nl(*order) if order else "IMPOSSIBLE"


@problem("P-009-4", gen=_g_dag)
def _(inp):
    order = _topo(*_read_edges(inp))
    return ",".join(str(v) for v in order) if order else "CYCLE"


# ── P-010 · two-colouring ───────────────────────────────────────────────────
@problem("P-010-1", gen=_g_graph())
def _(inp):
    ls = RL(inp)
    n, m = ints(ls[0])
    adj = _read_graph(ls, 1, n, m)
    for v in range(1, n + 1):
        adj[v].sort()
    team = [None] * (n + 1)
    for start in range(1, n + 1):
        if team[start] is not None:
            continue
        team[start] = "A"
        q = deque([start])
        while q:
            u = q.popleft()
            for v in adj[u]:
                flip = "B" if team[u] == "A" else "A"
                if team[v] is None:
                    team[v] = flip
                    q.append(v)
                elif team[v] != flip:
                    return "NO"
    return nl("YES", sp(team[1:]))


# ── P-010 · two-colouring, reported five ways ───────────────────────────────
def _two_colour(n, constraints):
    """label[v] in {0,1} honouring (u, v, differ) constraints, or None."""
    adj = [[] for _ in range(n + 1)]
    for u, v, differ in constraints:
        adj[u].append((v, differ))
        adj[v].append((u, differ))
    for v in range(1, n + 1):
        adj[v].sort()
    label = [None] * (n + 1)
    comps = []
    for start in range(1, n + 1):
        if label[start] is not None:
            continue
        label[start] = 0
        members = [start]
        q = deque([start])
        while q:
            u = q.popleft()
            for v, differ in adj[u]:
                want = label[u] ^ differ
                if label[v] is None:
                    label[v] = want
                    members.append(v)
                    q.append(v)
                elif label[v] != want:
                    return None, None
        comps.append(members)
    return label, comps


def _g_constraint_graph(typed=True, queries=0):
    def gen(r, i):
        n = size(i, (1, 3, 4, 6))
        m = r.randint(0, 4)
        rows = []
        for _ in range(m):
            u, v = r.randint(1, n), r.randint(1, n)
            rows.append(f"{u} {v} {r.randint(0, 1)}" if typed else f"{u} {v}")
        head = [n, m] + ([queries] if queries else [])
        qs = [f"{r.randint(1, n)} {r.randint(1, n)}" for _ in range(queries)]
        return nl(sp(head), *rows, *qs)
    return gen


def _read_constraints(inp, typed=True):
    ls = _nonblank(inp)
    head = ints(ls[0])
    n, m = head[0], head[1]
    cons = []
    for j in range(m):
        row = ints(ls[1 + j])
        cons.append((row[0], row[1], row[2] if typed else 1))
    return head, cons, ls[1 + m:]


@problem("P-010-2", gen=_g_constraint_graph())
def _(inp):
    head, cons, _rest = _read_constraints(inp)
    label, _ = _two_colour(head[0], cons)
    return "CONTRADICTION" if label is None else sp(label[1:])


@problem("P-010-3", gen=_g_constraint_graph(typed=False))
def _(inp):
    head, cons, _rest = _read_constraints(inp, typed=False)
    label, _ = _two_colour(head[0], cons)
    if label is None:
        return "NO"
    day = [v for v in range(1, head[0] + 1) if label[v] == 0]
    return nl(len(day), sp(day))


@problem("P-010-4", gen=_g_constraint_graph(typed=False))
def _(inp):
    head, cons, _rest = _read_constraints(inp, typed=False)
    label, comps = _two_colour(head[0], cons)
    if label is None:
        return "Not bipartite"
    rows = [f"{sum(1 for v in c if label[v] == 0)} {sum(1 for v in c if label[v] == 1)}"
            for c in comps]
    return nl(len(comps), *rows)


@problem("P-010-5", gen=_g_constraint_graph(queries=2))
def _(inp):
    head, cons, rest = _read_constraints(inp)
    label, _ = _two_colour(head[0], cons)
    if label is None:
        return "INCONSISTENT"
    out = []
    for j in range(head[2]):
        u, v = ints(rest[j])
        out.append("SAME" if label[u] == label[v] else "DIFFERENT")
    return nl(*out)


# ── P-011 · BFS over integers ───────────────────────────────────────────────
_LIMIT = 300000


def _num_bfs(start, moves):
    dist = {start: 0}
    q = deque([start])
    while q:
        x = q.popleft()
        for y in moves(x):
            if 0 <= y <= _LIMIT and y not in dist:
                dist[y] = dist[x] + 1
                q.append(y)
    return dist


def _g_two_small(hi=60):
    def gen(r, i):
        return sp([r.randint(0, hi), r.randint(0, hi)])
    return gen


@problem("P-011-1", gen=_g_two_small())
def _(inp):
    n, k = ints(RL(inp)[0])
    return str(_num_bfs(n, lambda x: (x - 1, x + 1, x * 2))[k])


@problem("P-011-2", gen=_g_two_small(hi=400))
def _(inp):
    n, k = ints(RL(inp)[0])
    return str(_num_bfs(n, lambda x: (x - 1, x + 1, int(str(x)[::-1])))[k])


@problem("P-011-3", gen=lambda r, i: sp([r.randint(0, 30), r.randint(0, 30), r.randint(0, 6), r.randint(0, 6)]))
def _(inp):
    n, k, a, b = ints(RL(inp)[0])
    dist = _num_bfs(n, lambda x: (x + a, x - b, x * 2))
    return str(dist.get(k, -1))


@problem("P-011-4", gen=_g_two_small(hi=40))
def _(inp):
    n, k = ints(RL(inp)[0])
    # Distance to K over the reversed move set, so a forward walk can always
    # pick the smallest next state that stays on a shortest path.
    back = _num_bfs(k, lambda x: (x - 1, x + 1, x // 3 if x % 3 == 0 else -1))
    steps = back[n]
    path = [n]
    cur = n
    while cur != k:
        nxt = min(y for y in (cur - 1, cur + 1, cur * 3)
                  if 0 <= y <= _LIMIT and back.get(y, -1) == back[cur] - 1)
        path.append(nxt)
        cur = nxt
    return nl(steps, sp(path))


@problem("P-011-5", gen=_g_two_small(hi=40))
def _(inp):
    n, k = ints(RL(inp)[0])
    seen = set()
    x, steps = n, 0
    while True:
        if x == k:
            return str(steps)
        if x in seen:
            return "-1"
        seen.add(x)
        x = x // 2 if x % 2 == 0 else x + 5
        if not 0 <= x <= _LIMIT:
            return "-1"
        steps += 1


# ── P-012 · maximum-weight non-adjacent subset ──────────────────────────────
def _best_nonadjacent(a, allow_empty, only_nonneg=False):
    """(best sum, chosen indices) for a maximum-weight non-adjacent subset.

    `allow_empty` only constrains the whole selection: once one element is
    taken the rest of the array is free to contribute nothing. Ties go to the
    lexicographically smallest index list.
    """
    n = len(a)
    ok = {j for j in range(n) if not only_nonneg or a[j] >= 0}
    memo = {}

    def go(j, must):
        if j >= n:
            return (None, None) if must else (0, [])
        if (j, must) in memo:
            return memo[(j, must)]
        take = (None, None)
        if j in ok:
            sub, idx = go(j + 2, False)
            take = (a[j] + sub, [j] + idx)
        skip = go(j + 1, must)
        if take[0] is None:
            cand = skip
        elif skip[0] is None or (take[0], skip[1]) > (skip[0], take[1]):
            cand = take
        else:
            cand = skip
        memo[(j, must)] = cand
        return cand

    return go(0, not allow_empty)


@problem("P-012-1", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=-9, hi=9))
def _(inp):
    return str(_best_nonadjacent(ints(L(inp)[1]), True)[0])


@problem("P-012-2", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=-9, hi=9))
def _(inp):
    return str(_best_nonadjacent(ints(L(inp)[1]), False)[0])


@problem("P-012-3", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=-9, hi=9))
def _(inp):
    a = ints(L(inp)[1])
    n = len(a)
    # (best sum, fewest stalls achieving it) over suffixes; empty set allowed.
    dp = [(0, 0)] * (n + 2)
    for j in range(n - 1, -1, -1):
        take = (a[j] + dp[j + 2][0], 1 + dp[j + 2][1])
        skip = dp[j + 1]
        dp[j] = take if (take[0], -take[1]) > (skip[0], -skip[1]) else skip
    return f"{dp[0][0]} {dp[0][1]}"


@problem("P-012-4", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=-9, hi=9))
def _(inp):
    a = ints(L(inp)[1])
    if all(v < 0 for v in a):
        return "IMPOSSIBLE"
    return str(_best_nonadjacent(a, True, only_nonneg=True)[0])


@problem("P-012-5", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=-9, hi=9))
def _(inp):
    total, idx = _best_nonadjacent(ints(L(inp)[1]), False)
    return nl(total, sp(j + 1 for j in idx))


# ── P-013 · staircase and stepping-stone DP ─────────────────────────────────
_INF = float("inf")


def _stair_costs(cost, start=None, pay_start=True):
    """Cheapest total to land on each step, jumping +1 or +2.

    `start` = None means setting off from the ground, where step 1 or step 2 may
    be the first landing. An integer means the walk resumes on that step;
    `pay_start` says whether its toll is charged again (it is not when the step
    was already paid for as the end of the previous leg).
    """
    n = len(cost)
    dp = [_INF] * (n + 1)
    for j in range(1, n + 1):
        if cost[j - 1] < 0:
            continue
        if start is None:
            prev = min(dp[j - 1], dp[j - 2] if j >= 2 else _INF, 0 if j <= 2 else _INF)
        elif j < start:
            continue
        elif j == start:
            dp[j] = cost[j - 1] if pay_start else 0
            continue
        else:
            prev = min(dp[j - 1], dp[j - 2] if j >= 2 else _INF)
        if prev < _INF:
            dp[j] = prev + cost[j - 1]
    return dp


@problem("P-013-1", gen=lambda r, i: (lambda n: nl(n, sp(r.choice([-1, 0, 1, 5, 9]) for _ in range(n))))(
    size(i, (1, 3, 5, 7))))
def _(inp):
    n = int(L(inp)[0])
    dp = _stair_costs(ints(L(inp)[1]))
    return "-1" if dp[n] == _INF else str(dp[n])


@problem("P-013-4", gen=lambda r, i: (lambda n: nl(n, sp(r.choice([-1, 0, 1, 5, 9]) for _ in range(n))))(
    size(i, (1, 3, 5, 7))))
def _(inp):
    n = int(L(inp)[0])
    cost = ints(L(inp)[1])
    options = []
    for start in (1, 2):
        if start <= n and cost[start - 1] >= 0:
            dp = _stair_costs(cost, start)
            if dp[n] < _INF:
                options.append((dp[n], start))
    return f"{min(options)[0]} {min(options)[1]}" if options else "-1"


def _g_stairs_pts(r, i):
    n = size(i, (1, 3, 5, 7))
    k = r.randint(0, 2)
    lines = [sp([n, k]), sp(r.choice([-1, 0, 1, 5, 9]) for _ in range(n))]
    if k:
        lines.append(sp(sorted(r.randint(1, n) for _ in range(k))))
    return nl(*lines)


@problem("P-013-3", gen=_g_stairs_pts)
def _(inp):
    ls = L(inp)
    n, k = ints(ls[0])
    cost = ints(ls[1])
    stops = ints(ls[2]) if k else [n]
    total = 0
    dp = _stair_costs(cost)
    if dp[stops[0]] == _INF:
        return "-1"
    total = dp[stops[0]]
    for a, b in zip(stops, stops[1:]):
        if b == a:
            continue
        if b < a:
            return "-1"
        seg = _stair_costs(cost, a, pay_start=False)
        if seg[b] == _INF:
            return "-1"
        total += seg[b]
    return str(total)


def _frog(h, penalty):
    n = len(h)
    dp = [_INF] * n
    dp[0] = 0
    for j in range(1, n):
        dp[j] = dp[j - 1] + abs(h[j] - h[j - 1])
        if j >= 2:
            dp[j] = min(dp[j], dp[j - 2] + abs(h[j] - h[j - 2]) + penalty)
    return dp[n - 1]


@problem("P-013-2", gen=g_n_arr(sizes=(1, 2, 4, 6), lo=-20, hi=40))
def _(inp):
    return str(_frog(ints(L(inp)[1]), 0))


@problem("P-013-5", gen=lambda r, i: (lambda n: nl(sp([n, r.choice([0, 1, 5, 100])]),
                                                   sp(arr(r, n, -20, 40))))(size(i, (1, 2, 4, 6))))
def _(inp):
    n, p = ints(L(inp)[0])
    return str(_frog(ints(L(inp)[1]), p))


# ── P-014 · counting tokenisations of a digit string ────────────────────────
def _count_tokens(s, single_ok, double_lo, double_hi, exact_k=None, no_adjacent=False):
    n = len(s)
    # state: (position, two-digit tokens used, previous token was two-digit)
    from functools import lru_cache

    @lru_cache(maxsize=None)
    def go(j, used, prev_double):
        if j == n:
            return 1 if exact_k is None or used == exact_k else 0
        total = 0
        if single_ok(s[j]):
            total += go(j + 1, used, False)
        if j + 1 < n and not (no_adjacent and prev_double):
            v = int(s[j:j + 2])
            if double_lo <= v <= double_hi:
                total += go(j + 2, used + 1, True)
        return total

    got = go(0, 0, False)
    go.cache_clear()
    return got


def _g_digits(mods=(100, 1000, 1000000007), extra=None, sizes=(1, 2, 3, 4)):
    def gen(r, i):
        s = word(r, size(i, sizes), "0125")
        second = sp([extra(r), r.choice(mods)]) if extra else str(r.choice(mods))
        return nl(s, second)
    return gen


@problem("P-014-1", gen=_g_digits())
def _(inp):
    ls = L(inp)
    return str(_count_tokens(ls[0], lambda c: c != "0", 10, 26) % int(ls[1]))


@problem("P-014-2", gen=_g_digits())
def _(inp):
    ls = L(inp)
    return str(_count_tokens(ls[0], lambda c: c != "0", 10, 34) % int(ls[1]))


@problem("P-014-3", gen=_g_digits())
def _(inp):
    ls = L(inp)
    return str(_count_tokens(ls[0], lambda c: True, 50, 75) % int(ls[1]))


@problem("P-014-4", gen=_g_digits(extra=lambda r: r.randint(0, 2)))
def _(inp):
    ls = L(inp)
    k, m = ints(ls[1])
    return str(_count_tokens(ls[0], lambda c: c != "0", 10, 26, exact_k=k) % m)


@problem("P-014-5", gen=_g_digits())
def _(inp):
    ls = L(inp)
    return str(_count_tokens(ls[0], lambda c: c != "0", 10, 26, no_adjacent=True) % int(ls[1]))


# ── P-015/P-018 · subset sums ───────────────────────────────────────────────
def _subset_sums(a):
    reach = {0}
    for v in a:
        reach |= {s + v for s in reach}
    return reach


def _g_subset(head_extra=0, sizes=(1, 3, 4, 6), hi=12):
    def gen(r, i):
        n = size(i, sizes)
        head = [n, r.randint(0, 20)] + [r.randint(0, 4) for _ in range(head_extra)]
        return nl(sp(head), sp(arr(r, n, 0, hi)))
    return gen


@problem("P-015-1", gen=_g_subset())
def _(inp):
    n, t = ints(L(inp)[0])
    return yn(t in _subset_sums(ints(L(inp)[1])))


@problem("P-015-2", gen=_g_subset())
def _(inp):
    n, cap = ints(L(inp)[0])
    return str(max(s for s in _subset_sums(ints(L(inp)[1])) if s <= cap))


@problem("P-015-3", gen=_g_subset())
def _(inp):
    n, t = ints(L(inp)[0])
    a = ints(L(inp)[1])
    if sum(a) < t:
        return "-1"
    return str(min(s for s in _subset_sums(a) if s >= t) - t)


@problem("P-015-4", gen=g_n_arr(sizes=(1, 3, 4, 6), lo=0, hi=12))
def _(inp):
    a = ints(L(inp)[1])
    total = sum(a)
    return str(min(abs(total - 2 * s) for s in _subset_sums(a)))


@problem("P-018-1", gen=g_n_arr(sizes=(1, 3, 4, 6), lo=1, hi=12))
def _(inp):
    a = ints(L(inp)[1])
    total = sum(a)
    return str(min(abs(total - 2 * s) for s in _subset_sums(a)))


@problem("P-015-5", gen=_g_subset(head_extra=1))
def _(inp):
    n, t, d = ints(L(inp)[0])
    cands = [s for s in _subset_sums(ints(L(inp)[1])) if abs(s - t) <= d]
    if not cands:
        return "NOT FOUND"
    return f"FOUND {min(cands, key=lambda s: (abs(s - t), s))}"


# ── P-016 · longest strictly increasing subsequence ─────────────────────────
@problem("P-016-1", gen=g_n_arr(sizes=(1, 3, 5, 8), lo=-6, hi=6))
def _(inp):
    a = ints(L(inp)[1])
    best = [1] * len(a)
    for j in range(len(a)):
        for k in range(j):
            if a[k] < a[j]:
                best[j] = max(best[j], best[k] + 1)
    return str(max(best))


# ── P-017 · edit distance ───────────────────────────────────────────────────
def _g_two_strings(r, i):
    m, n = ((0, 1), (2, 2), (3, 4), (5, 4))[i % 4]
    return nl(word(r, m, "abc"), word(r, n, "abc"))


@problem("P-017-1", gen=_g_two_strings)
def _(inp):
    ls = RL(inp)
    a = ls[0] if len(ls) > 0 else ""
    b = ls[1] if len(ls) > 1 else ""
    prev = list(range(len(b) + 1))
    for j, ca in enumerate(a, 1):
        cur = [j]
        for k, cb in enumerate(b, 1):
            cur.append(min(prev[k] + 1, cur[k - 1] + 1, prev[k - 1] + (ca != cb)))
        prev = cur
    return str(prev[len(b)])


# ── P-019 · fewest refuelling stops ─────────────────────────────────────────
def _g_stations(r, i):
    n = size(i, (0, 1, 2, 4))
    target = r.randint(10, 60)
    start = r.randint(0, 30)
    pos = sorted(set(r.randint(1, target - 1) for _ in range(n)))
    rows = [f"{p} {r.randint(1, 30)}" for p in pos]
    return nl(sp([target, start, len(rows)]), *rows)


@problem("P-019-1", gen=_g_stations)
def _(inp):
    ls = L(inp)
    target, fuel, n = ints(ls[0])
    stations = [ints(ls[1 + j]) for j in range(n)]
    heap, stops, j = [], 0, 0
    while fuel < target:
        while j < n and stations[j][0] <= fuel:
            heapq.heappush(heap, -stations[j][1])
            j += 1
        if not heap:
            return "-1"
        fuel += -heapq.heappop(heap)
        stops += 1
    return str(stops)


# ── P-020 · running median ──────────────────────────────────────────────────
@problem("P-020-1", gen=g_n_arr(sizes=(1, 2, 4, 6), lo=-9, hi=9))
def _(inp):
    seen = []
    out = []
    for v in ints(L(inp)[1]):
        seen.append(v)
        seen.sort()
        n = len(seen)
        if n % 2:
            out.append(str(seen[n // 2]))
        else:
            tot = seen[n // 2 - 1] + seen[n // 2]
            out.append(str(tot // 2) if tot % 2 == 0 else f"{tot / 2:.1f}")
    return sp(out)


# ── P-021 · the K values closest to X ───────────────────────────────────────
@problem("P-021-1", gen=lambda r, i: (lambda n: nl(sp([n, r.randint(1, n), r.randint(-9, 9)]),
                                                   sp(arr(r, n, -9, 9))))(size(i, (1, 2, 4, 6))))
def _(inp):
    n, k, x = ints(L(inp)[0])
    a = ints(L(inp)[1])
    return sp(sorted(sorted(a, key=lambda v: (abs(v - x), v))[:k]))


# ── P-022 · deepest interval overlap ────────────────────────────────────────
def _g_half_open(r, i):
    n = size(i, (1, 2, 3, 5))
    rows = []
    for _ in range(n):
        s0 = r.randint(0, 8)
        rows.append(f"{s0} {s0 + r.randint(1, 4)}")
    return nl(str(n), *rows)


@problem("P-022-1", gen=_g_half_open)
def _(inp):
    ls = L(inp)
    n = int(ls[0])
    spans = [tuple(ints(ls[1 + j])) for j in range(n)]
    pts = sorted({t for lo, hi in spans for t in (lo, hi)})
    return str(max(sum(1 for lo, hi in spans if lo <= t < hi) for t in pts))


# ── P-023 · cheapest pairwise merges ────────────────────────────────────────
@problem("P-023-1", gen=g_n_arr(sizes=(1, 2, 4, 6), lo=0, hi=30))
def _(inp):
    heap = ints(L(inp)[1])
    heapq.heapify(heap)
    total = 0
    while len(heap) > 1:
        merged = heapq.heappop(heap) + heapq.heappop(heap)
        total += merged
        heapq.heappush(heap, merged)
    return str(total)


# ── P-024 · longest strictly increasing chain in two dimensions ─────────────
def _g_pairs_grid(r, i):
    n = size(i, (1, 2, 4, 6))
    return nl(str(n), *[f"{r.randint(1, 6)} {r.randint(1, 6)}" for _ in range(n)])


@problem("P-024-1", gen=_g_pairs_grid)
def _(inp):
    ls = L(inp)
    n = int(ls[0])
    items = sorted(tuple(ints(ls[1 + j])) for j in range(n))
    best = [1] * n
    for j in range(n):
        for k in range(j):
            if items[k][0] < items[j][0] and items[k][1] < items[j][1]:
                best[j] = max(best[j], best[k] + 1)
    return str(max(best))


# ── P-025 · swaps to make every 1 consecutive ───────────────────────────────
@problem("P-025-1", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=0, hi=1))
def _(inp):
    a = ints(L(inp)[1])
    k = sum(a)
    if k <= 1:
        return "0"
    best = max(sum(a[j:j + k]) for j in range(len(a) - k + 1))
    return str(k - best)


# ── P-026/P-027 · bar profiles ──────────────────────────────────────────────
@problem("P-026-1", gen=g_n_arr(sizes=(1, 3, 5, 8), lo=0, hi=6))
def _(inp):
    h = ints(L(inp)[1])
    return str(sum(max(0, min(max(h[:j + 1]), max(h[j:])) - v) for j, v in enumerate(h)))


@problem("P-027-1", gen=g_n_arr(sizes=(1, 3, 5, 8), lo=0, hi=9))
def _(inp):
    h = ints(L(inp)[1])
    n = len(h)
    return str(max((hi - lo + 1) * min(h[lo:hi + 1])
                   for lo in range(n) for hi in range(lo, n)))


# ── P-028 · range marks over sparse coordinates ─────────────────────────────
def _g_marks(r, i):
    n, q = ((1, 1), (2, 2), (3, 2), (4, 3))[i % 4]
    coords = sorted(distinct(r, n, -12, 20))
    rows = []
    for _ in range(q):
        lo = r.randint(-12, 20)
        rows.append(f"{lo} {lo + r.randint(0, 10)} {r.randint(-5, 5)}")
    return nl(sp([n, q]), sp(coords), *rows)


@problem("P-028-1", gen=_g_marks)
def _(inp):
    ls = L(inp)
    n, q = ints(ls[0])
    coords = ints(ls[1])
    total = [0] * n
    for j in range(q):
        lo, hi, d = ints(ls[2 + j])
        for k, x in enumerate(coords):
            if lo <= x <= hi:
                total[k] += d
    return sp(total)


# ── P-029 · subsets avoiding forbidden pairs ────────────────────────────────
def _g_conflicts(r, i):
    m = size(i, (1, 2, 3, 4))
    q = r.randint(0, 3)
    rows = [f"{r.randrange(m)} {r.randrange(m)}" for _ in range(q)]
    return nl(sp([m, q]), *rows)


@problem("P-029-1", gen=_g_conflicts)
def _(inp):
    ls = L(inp)
    m, q = ints(ls[0])
    bad = [tuple(ints(ls[1 + j])) for j in range(q)]
    total = 0
    for mask in range(1 << m):
        if all(not (mask >> u & 1 and mask >> v & 1) or u == v for u, v in bad):
            total += 1
    return str(total)


# ── P-030 · subarrays with a given XOR ──────────────────────────────────────
@problem("P-030-1", gen=lambda r, i: (lambda n: nl(sp([n, r.randint(0, 9)]), sp(arr(r, n, 0, 9))))(
    size(i, (1, 3, 5, 7))))
def _(inp):
    n, k = ints(L(inp)[0])
    a = ints(L(inp)[1])
    total = 0
    for lo in range(n):
        x = 0
        for hi in range(lo, n):
            x ^= a[hi]
            total += x == k
    return str(total)


# ── P-031 · bitwise AND over a range ────────────────────────────────────────
@problem("P-031-1", gen=lambda r, i: (lambda lo: sp([lo, lo + r.choice([0, 1, 5, 40])]))(r.randint(0, 200)))
def _(inp):
    lo, hi = ints(RL(inp)[0])
    shift = 0
    while lo < hi:
        lo >>= 1
        hi >>= 1
        shift += 1
    return str(lo << shift)


# ── P-032 · P disjoint pairs, smallest possible largest gap ─────────────────
@problem("P-032-1", gen=lambda r, i: (lambda n: nl(sp([n, r.randint(1, n // 2)]), sp(arr(r, n, -9, 9))))(
    size(i, (2, 4, 6, 8))))
def _(inp):
    n, p = ints(L(inp)[0])
    a = sorted(ints(L(inp)[1]))

    def pairs_within(gap):
        count, j = 0, 0
        while j + 1 < n:
            if a[j + 1] - a[j] <= gap:
                count += 1
                j += 2
            else:
                j += 1
        return count

    lo, hi = 0, a[-1] - a[0]
    while lo < hi:
        mid = (lo + hi) // 2
        if pairs_within(mid) >= p:
            hi = mid
        else:
            lo = mid + 1
    return str(lo)


# ── P-033 · lexicographically smallest string through one stack ─────────────
@problem("P-033-1", gen=g_str(sizes=(1, 3, 5, 8), alpha="abc"))
def _(inp):
    s = RL(inp)[0]
    suffix_min = list(s)
    for j in range(len(s) - 2, -1, -1):
        suffix_min[j] = min(s[j], suffix_min[j + 1])
    st, out = [], []
    for j, c in enumerate(s):
        st.append(c)
        while st and (j + 1 == len(s) or st[-1] <= suffix_min[j + 1]):
            out.append(st.pop())
    return "".join(out)


# ── P-034 · shortest slice to drop to leave a sorted array ──────────────────
@problem("P-034-1", gen=g_n_arr(sizes=(1, 3, 5, 8), lo=-5, hi=5))
def _(inp):
    a = ints(L(inp)[1])
    n = len(a)
    ok = lambda xs: all(xs[j] <= xs[j + 1] for j in range(len(xs) - 1))
    for length in range(n + 1):
        for lo in range(n - length + 1):
            if ok(a[:lo] + a[lo + length:]):
                return str(length)
    return str(n)


# ── P-035 · subarrays with exactly K odd values ─────────────────────────────
@problem("P-035-1", gen=lambda r, i: (lambda n: nl(sp([n, r.randint(0, 3)]), sp(arr(r, n, -9, 9))))(
    size(i, (1, 3, 5, 7))))
def _(inp):
    n, k = ints(L(inp)[0])
    a = ints(L(inp)[1])
    total = 0
    for lo in range(n):
        odds = 0
        for hi in range(lo, n):
            odds += a[hi] % 2 != 0
            total += odds == k
    return str(total)


@problem("P-036-1", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=-6, hi=6))
def _(inp):
    run = 0
    for v in ints(L(inp)[1]):
        run += v
        if run < 0:
            return "NO"
    return "YES"


# ── P-037 · shortest bridge between two islands ─────────────────────────────
def _g_two_islands(r, i):
    rr, cc = ((2, 2), (3, 3), (3, 4), (4, 4))[i % 4]
    rows = [["0"] * cc for _ in range(rr)]
    rows[0][0] = "1"
    rows[rr - 1][cc - 1] = "1"
    for _ in range(r.randint(0, 2)):
        a, c = r.randrange(rr), r.randrange(cc)
        if (a, c) not in ((0, 0), (rr - 1, cc - 1)):
            rows[a][c] = r.choice("01")
    return nl(sp([rr, cc]), *["".join(row) for row in rows])


@problem("P-037-1", gen=_g_two_islands)
def _(inp):
    ls = L(inp)
    rr, cc = ints(ls[0])
    g = [ls[1 + a] for a in range(rr)]
    comps = _components(g, rr, cc)
    if len(comps) < 2:
        return "-1"
    best = None
    for j in range(len(comps)):
        for k in range(j + 1, len(comps)):
            for a1, c1 in comps[j][0]:
                for a2, c2 in comps[k][0]:
                    step = abs(a1 - a2) + abs(c1 - c2) - 1
                    best = step if best is None else min(best, step)
    return str(best)


# ── P-038/P-039 · classic knapsack shapes ───────────────────────────────────
@problem("P-038-1", gen=lambda r, i: (lambda n: nl(sp([n, r.randint(0, 20)]), sp(arr(r, n, 1, 9))))(
    size(i, (1, 2, 3, 4))))
def _(inp):
    n, t = ints(L(inp)[0])
    coins = ints(L(inp)[1])
    best = [0] + [None] * t
    for v in range(1, t + 1):
        for c in coins:
            if c <= v and best[v - c] is not None:
                best[v] = best[v - c] + 1 if best[v] is None else min(best[v], best[v - c] + 1)
    return str(-1 if best[t] is None else best[t])


def _g_knapsack(r, i):
    n = size(i, (0, 1, 3, 4))
    cap = r.randint(0, 12)
    rows = [f"{r.randint(1, max(1, cap))} {r.randint(0, 9)}" for _ in range(n)]
    return nl(sp([n, cap]), *rows)


@problem("P-039-1", gen=_g_knapsack)
def _(inp):
    ls = L(inp)
    n, cap = ints(ls[0])
    best = [0] * (cap + 1)
    for j in range(n):
        w, v = ints(ls[1 + j])
        for c in range(cap, w - 1, -1):
            best[c] = max(best[c], best[c - w] + v)
    return str(best[cap])


# ── P-040 · smallest rearrangement with no equal neighbours ─────────────────
@problem("P-040-1", gen=g_str(sizes=(1, 3, 4, 6), alpha="aab"))
def _(inp):
    s = RL(inp)[0]
    n = len(s)
    counts = {c: s.count(c) for c in set(s)}
    out = []

    def go():
        if len(out) == n:
            return True
        for c in sorted(counts):
            if counts[c] and (not out or out[-1] != c):
                counts[c] -= 1
                out.append(c)
                if go():
                    return True
                out.pop()
                counts[c] += 1
        return False

    return "".join(out) if go() else "IMPOSSIBLE"
