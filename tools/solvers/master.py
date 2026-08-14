from .common import *  # noqa: F401,F403

from collections import deque
from itertools import combinations, permutations
from math import gcd


# ── M-001 · the missing value and the repeated one ──────────────────────────
def _g_missing_dup(r, i):
    n = size(i, (2, 4, 5, 7))
    vals = list(range(1, n + 1))
    missing = r.choice(vals)
    dup = r.choice([v for v in vals if v != missing])
    vals[vals.index(missing)] = dup
    r.shuffle(vals)
    return nl(n, sp(vals))


@problem("M-001-1", gen=_g_missing_dup)
def _(inp):
    n = int(L(inp)[0])
    a = ints(L(inp)[1])
    dup = next(v for v in a if a.count(v) > 1)
    missing = next(v for v in range(1, n + 1) if v not in a)
    return f"{missing} {dup}"


# ── M-002/M-004/M-026-style · subarray bit aggregates ───────────────────────
def _subarray_values(a, op):
    out = set()
    for lo in range(len(a)):
        v = None
        for hi in range(lo, len(a)):
            v = a[hi] if v is None else op(v, a[hi])
            out.add(v)
    return out


@problem("M-002-1", gen=g_n_arr(sizes=(1, 2, 4, 6), lo=0, hi=31))
def _(inp):
    return str(max(_subarray_values(ints(L(inp)[1]), lambda x, y: x ^ y)))


@problem("M-004-1", gen=lambda r, i: (lambda n: nl(sp([n, r.randint(0, 15)]), sp(arr(r, n, 0, 15))))(
    size(i, (1, 2, 3, 5))))
def _(inp):
    n, t = ints(L(inp)[0])
    vals = _subarray_values(ints(L(inp)[1]), lambda x, y: x & y)
    return str(min(vals, key=lambda v: (abs(v - t), v)))


# ── M-003 · substrings where every letter count is even ─────────────────────
@problem("M-003-1", gen=g_str(sizes=(1, 3, 5, 7), alpha="abc"))
def _(inp):
    s = RL(inp)[0]
    seen = {0: 1}
    mask = 0
    total = 0
    for c in s:
        mask ^= 1 << (ord(c) - 97)
        total += seen.get(mask, 0)
        seen[mask] = seen.get(mask, 0) + 1
    return str(total)


# ── M-005 · popcount ────────────────────────────────────────────────────────
@problem("M-005-1", gen=lambda r, i: str([0, r.randint(1, 9), r.randint(10, 9999), r.randint(10 ** 6, 10 ** 12)][i % 4]))
def _(inp):
    return str(bin(int(RL(inp)[0])).count("1"))


# ── M-006 · is the target a multiple of the collection gcd ──────────────────
@problem("M-006-1", gen=lambda r, i: (lambda n: nl(sp([n, r.randint(0, 40)]), sp(arr(r, n, 0, 30))))(
    size(i, (1, 2, 3, 5))))
def _(inp):
    n, t = ints(L(inp)[0])
    a = ints(L(inp)[1])
    g = 0
    for v in a:
        g = gcd(g, v)
    if g == 0:
        return yn(t == 0)
    return yn(t != 0 and t % g == 0)


# ── M-007 · shortest common repeating unit ──────────────────────────────────
def _g_repeat_pair(r, i):
    base = word(r, r.randint(1, 3), "ABC")
    a = base * r.randint(1, 3)
    b = base * r.randint(1, 3) if i % 2 else word(r, r.randint(1, 4), "ABC")
    return nl(a, b)


@problem("M-007-1", gen=_g_repeat_pair)
def _(inp):
    ls = L(inp)
    a, b = ls[0], ls[1]
    for k in range(1, min(len(a), len(b)) + 1):
        unit = a[:k]
        if len(a) % k == 0 and len(b) % k == 0 and unit * (len(a) // k) == a \
                and unit * (len(b) // k) == b:
            return unit
    return "NONE"


# ── M-008 · how many digit 1s appear from 1 to N ────────────────────────────
@problem("M-008-1", gen=lambda r, i: str([r.randint(1, 9), r.randint(10, 99), r.randint(100, 999), r.randint(1000, 20000)][i % 4]))
def _(inp):
    n = int(RL(inp)[0])
    total = 0
    place = 1
    while place <= n:
        high, cur, low = n // (place * 10), (n // place) % 10, n % place
        total += high * place + (place if cur > 1 else low + 1 if cur == 1 else 0)
        place *= 10
    return str(total)


# ── M-009 · Chinese remainder theorem ───────────────────────────────────────
def _g_congruences(r, i):
    k = size(i, (1, 2, 2, 3))
    mods = r.sample([2, 3, 5, 7, 11], k)
    return nl(str(k), *[f"{r.randrange(m)} {m}" for m in mods])


@problem("M-009-1", gen=_g_congruences)
def _(inp):
    ls = L(inp)
    k = int(ls[0])
    pairs = [ints(ls[1 + j]) for j in range(k)]
    total = 1
    for _, m in pairs:
        total *= m
    for x in range(total):
        if all(x % m == rem for rem, m in pairs):
            return str(x)
    return "0"


# ── M-010 · coprime pairs ───────────────────────────────────────────────────
@problem("M-010-1", gen=g_n_arr(sizes=(1, 2, 3, 5), lo=1, hi=30))
def _(inp):
    a = ints(L(inp)[1])
    return str(sum(1 for x, y in combinations(a, 2) if gcd(x, y) == 1))


# ── M-011 · smallest safe circular start ────────────────────────────────────
@problem("M-011-1", gen=g_n_arr(sizes=(1, 2, 3, 5), lo=-6, hi=6))
def _(inp):
    a = ints(L(inp)[1])
    n = len(a)
    for start in range(n):
        run = 0
        for step in range(n):
            run += a[(start + step) % n]
            if run < 0:
                break
        else:
            return str(start)
    return "-1"


# ── M-012 · smallest string within K adjacent swaps ─────────────────────────
def _g_swap_string(r, i):
    return nl(word(r, size(i, (1, 3, 4, 6)), "abcz"), str(r.randint(0, 6)))


@problem("M-012-1", gen=_g_swap_string)
def _(inp):
    ls = L(inp)
    s = list(ls[0])
    k = int(ls[1])
    for at in range(len(s)):
        if k <= 0:
            break
        reach = min(len(s) - 1, at + k)
        best = min(range(at, reach + 1), key=lambda j: (s[j], j))
        k -= best - at
        s[at:best + 1] = [s[best]] + s[at:best]
    return "".join(s)


# ── M-013 · pick K positions, sum(A) times the smallest chosen B ────────────
def _g_two_rows(r, i):
    n = size(i, (1, 2, 4, 6))
    return nl(sp([n, r.randint(1, n)]), sp(arr(r, n, 0, 12)), sp(arr(r, n, 0, 12)))


@problem("M-013-1", gen=_g_two_rows)
def _(inp):
    ls = L(inp)
    n, k = ints(ls[0])
    a, b = ints(ls[1]), ints(ls[2])
    best = 0
    for combo in combinations(range(n), k):
        best = max(best, sum(a[j] for j in combo) * min(b[j] for j in combo))
    return str(best)


# ── M-014 · merges until the sequence is a palindrome ───────────────────────
@problem("M-014-1", gen=g_n_arr(sizes=(1, 2, 4, 5), lo=1, hi=9))
def _(inp):
    a = ints(L(inp)[1])
    lo, hi = 0, len(a) - 1
    merges = 0
    while lo < hi:
        if a[lo] == a[hi]:
            lo += 1
            hi -= 1
        elif a[lo] < a[hi]:
            a[lo + 1] += a[lo]
            lo += 1
            merges += 1
        else:
            a[hi - 1] += a[hi]
            hi -= 1
            merges += 1
    return str(merges)


# ── M-015 · total absolute deviation from a median ──────────────────────────
@problem("M-015-1", gen=g_n_arr(sizes=(1, 2, 4, 6), lo=-9, hi=9))
def _(inp):
    a = sorted(ints(L(inp)[1]))
    mid = a[len(a) // 2]
    return str(sum(abs(v - mid) for v in a))


# ── M-016 · swaps that sort a permutation ───────────────────────────────────
@problem("M-016-1", gen=lambda r, i: (lambda n: nl(n, sp(perm(r, n))))(size(i, (1, 2, 4, 6))))
def _(inp):
    a = ints(L(inp)[1])
    n = len(a)
    seen = [False] * n
    cycles = 0
    for j in range(n):
        if seen[j]:
            continue
        cycles += 1
        k = j
        while not seen[k]:
            seen[k] = True
            k = a[k] - 1
    return str(n - cycles)


# ── M-017 · where the next-pointer walk starts repeating ────────────────────
@problem("M-017-1", gen=lambda r, i: (lambda n: nl(n, sp(r.randint(0, n) for _ in range(n))))(
    size(i, (1, 2, 4, 6))))
def _(inp):
    nxt = ints(L(inp)[1])
    seen = {}
    cur, step = 1, 0
    while cur != 0:
        if cur in seen:
            return str(cur)
        seen[cur] = step
        step += 1
        cur = nxt[cur - 1]
    return "0"


# ── M-018 · tree paths with a given XOR ─────────────────────────────────────
def _g_xor_tree(r, i):
    n = size(i, (1, 2, 4, 5))
    rows = [f"{r.randint(1, v - 1)} {v} {r.randint(0, 7)}" for v in range(2, n + 1)]
    return nl(sp([n, r.randint(0, 7)]), *rows)


@problem("M-018-1", gen=_g_xor_tree)
def _(inp):
    ls = L(inp)
    n, k = ints(ls[0])
    adj = [[] for _ in range(n + 1)]
    for j in range(n - 1):
        u, v, w = ints(ls[1 + j])
        adj[u].append((v, w))
        adj[v].append((u, w))
    acc = [None] * (n + 1)
    acc[1] = 0
    stack = [1]
    while stack:
        u = stack.pop()
        for v, w in adj[u]:
            if acc[v] is None:
                acc[v] = acc[u] ^ w
                stack.append(v)
    return str(sum(1 for x, y in combinations(acc[1:], 2) if x ^ y == k))


# ── M-019 · is the topological order unique ─────────────────────────────────
def _g_digraph(r, i):
    n = size(i, (1, 2, 3, 5))
    m = r.randint(0, 4)
    rows = [f"{r.randint(1, n)} {r.randint(1, n)}" for _ in range(m)]
    return nl(sp([n, m]), *rows)


@problem("M-019-1", gen=_g_digraph)
def _(inp):
    ls = L(inp)
    n, m = ints(ls[0])
    out = [set() for _ in range(n + 1)]
    indeg = [0] * (n + 1)
    for j in range(m):
        u, v = ints(ls[1 + j])
        if v not in out[u]:
            out[u].add(v)
            indeg[v] += 1
    ready = [v for v in range(1, n + 1) if indeg[v] == 0]
    placed = 0
    while ready:
        if len(ready) > 1:
            return "NO"
        u = ready.pop()
        placed += 1
        for v in out[u]:
            indeg[v] -= 1
            if indeg[v] == 0:
                ready.append(v)
    return yn(placed == n)


# ── M-020 · longest common subsequence ──────────────────────────────────────
def _g_lcs_pair(r, i):
    m, n = ((0, 1), (2, 3), (4, 3), (5, 5))[i % 4]
    return nl(word(r, m, "abc"), word(r, n, "abc"))


@problem("M-020-1", gen=_g_lcs_pair)
def _(inp):
    ls = RL(inp)
    a = ls[0] if ls else ""
    b = ls[1] if len(ls) > 1 else ""
    prev = [0] * (len(b) + 1)
    for ca in a:
        cur = [0]
        for k, cb in enumerate(b, 1):
            cur.append(prev[k - 1] + 1 if ca == cb else max(prev[k], cur[k - 1]))
        prev = cur
    return str(prev[len(b)])


# ── M-021 · subset sum over signed values ───────────────────────────────────
@problem("M-021-1", gen=lambda r, i: (lambda n: nl(sp([n, r.randint(-6, 14)]), sp(arr(r, n, -6, 9))))(
    size(i, (1, 2, 4, 6))))
def _(inp):
    n, t = ints(L(inp)[0])
    reach = {0}
    for v in ints(L(inp)[1]):
        reach |= {s + v for s in reach}
    return yn(t in reach)


# ── M-022 · Kth value across two sorted arrays ──────────────────────────────
def _g_two_sorted_k(r, i):
    n, m = ((1, 1), (0, 2), (3, 2), (3, 4))[i % 4]
    a = sorted(arr(r, n, -9, 9))
    b = sorted(arr(r, m, -9, 9))
    return nl(sp([n, m, r.randint(1, n + m)]), sp(a), sp(b))


@problem("M-022-1", gen=_g_two_sorted_k)
def _(inp):
    ls = RL(inp)
    n, m, k = ints(ls[0])
    a = ints(ls[1]) if len(ls) > 1 and ls[1].strip() else []
    b = ints(ls[2]) if len(ls) > 2 and ls[2].strip() else []
    return str(sorted(a + b)[k - 1])


# ── M-023 · largest floor average over segments of length >= K ──────────────
@problem("M-023-1", gen=lambda r, i: (lambda n: nl(sp([n, r.randint(1, n)]), sp(arr(r, n, -9, 9))))(
    size(i, (1, 2, 4, 6))))
def _(inp):
    n, k = ints(L(inp)[0])
    a = ints(L(inp)[1])
    return str(max(sum(a[lo:hi + 1]) // (hi - lo + 1)
                   for lo in range(n) for hi in range(lo + k - 1, n)))


# ── M-024 · fewest contiguous reversals that sort a permutation ─────────────
@problem("M-024-1", gen=lambda r, i: (lambda n: nl(n, sp(perm(r, n))))(size(i, (1, 2, 3, 5))))
def _(inp):
    start = tuple(ints(L(inp)[1]))
    goal = tuple(sorted(start))
    if start == goal:
        return "0"
    n = len(start)
    seen = {start}
    frontier = [start]
    steps = 0
    while frontier:
        steps += 1
        nxt = []
        for state in frontier:
            for lo in range(n):
                for hi in range(lo + 1, n):
                    cand = state[:lo] + state[lo:hi + 1][::-1] + state[hi + 1:]
                    if cand == goal:
                        return str(steps)
                    if cand not in seen:
                        seen.add(cand)
                        nxt.append(cand)
        frontier = nxt
    return "-1"
