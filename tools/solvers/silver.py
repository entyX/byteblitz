from .common import *  # noqa: F401,F403


# ── S-001 · first duplicate, reported five different ways ───────────────────
def _g_names(alpha="abc", wlen=(1, 3), sizes=(1, 3, 5, 8)):
    def gen(r, i):
        n = size(i, sizes)
        return nl(n, sp(word(r, r.randint(*wlen), alpha) for _ in range(n)))
    return gen


@problem("S-001-1", gen=_g_names())
def _(inp):
    ws = L(inp)[1].split()
    return yn(len(set(ws)) != len(ws))


def _first_dup(xs):
    seen = set()
    for j, v in enumerate(xs):
        if v in seen:
            return j, v
        seen.add(v)
    return None, None


@problem("S-001-2", gen=g_n_arr(lo=1, hi=6))
def _(inp):
    _, v = _first_dup(ints(L(inp)[1]))
    return str(-1 if v is None else v)


@problem("S-001-3", gen=_g_names(alpha="ab", wlen=(1, 2)))
def _(inp):
    j, _ = _first_dup(L(inp)[1].split())
    return str(0 if j is None else j + 1)


@problem("S-001-4", gen=g_n_arr(lo=-4, hi=4))
def _(inp):
    j, _ = _first_dup(ints(L(inp)[1]))
    return "OK" if j is None else str(j)


@problem("S-001-5", gen=_g_names(alpha="AK7", wlen=(1, 2)))
def _(inp):
    _, v = _first_dup(L(inp)[1].split())
    return v if v is not None else "NONE"


# ── S-002 · index pairs meeting an arithmetic condition ─────────────────────
def _g_pair(lo=-9, hi=9, tlo=-18, thi=18, sizes=(2, 3, 5, 8)):
    def gen(r, i):
        n = size(i, sizes)
        return nl(sp([n, r.randint(tlo, thi)]), sp(arr(r, n, lo, hi)))
    return gen


@problem("S-002-1", gen=_g_pair())
def _(inp):
    n, t = ints(L(inp)[0])
    a = ints(L(inp)[1])
    for j in range(n):
        for k in range(j + 1, n):
            if a[j] + a[k] == t:
                return f"{j + 1} {k + 1}"
    return "-1 -1"


@problem("S-002-2", gen=_g_pair())
def _(inp):
    n, k = ints(L(inp)[0])
    a = ints(L(inp)[1])
    for j in range(n):
        for m in range(n):
            if m != j and a[j] - a[m] == k:
                return f"{j + 1} {m + 1}"
    return "NONE"


@problem("S-002-3", gen=_g_pair(lo=0, hi=15, tlo=0, thi=15))
def _(inp):
    n, x = ints(L(inp)[0])
    a = ints(L(inp)[1])
    for j in range(n):
        for k in range(j + 1, n):
            if a[j] ^ a[k] == x:
                return f"{j + 1} {k + 1}"
    return "-1 -1"


@problem("S-002-4", gen=_g_pair(lo=0, hi=12, tlo=0, thi=20))
def _(inp):
    n, c = ints(L(inp)[0])
    a = ints(L(inp)[1])
    for j in range(n):
        for k in range(j + 1, n):
            if a[j] + a[k] == c:
                return f"{a[j]} {a[k]}"
    return "IMPOSSIBLE"


@problem("S-002-5", gen=_g_pair())
def _(inp):
    n, s = ints(L(inp)[0])
    a = ints(L(inp)[1])
    out = []
    for j in range(n):
        out.append(next((k + 1 for k in range(n) if k != j and a[j] + a[k] == s), -1))
    return sp(out)


# ── S-003 · frequency filters ───────────────────────────────────────────────
@problem("S-003-1", gen=g_head_arr(lambda r, n: [r.randint(1, 3)], lo=-3, hi=3))
def _(inp):
    n, t = ints(L(inp)[0])
    a = ints(L(inp)[1])
    return sp(sorted({v for v in a if a.count(v) >= t}))


def _g_words_k(pool_alpha="ab", sizes=(1, 3, 5, 8), krange=(1, 3)):
    def gen(r, i):
        n = size(i, sizes)
        ws = [word(r, r.randint(1, 2), pool_alpha) for _ in range(n)]
        return nl(sp([n, r.randint(*krange)]), sp(ws))
    return gen


@problem("S-003-2", gen=_g_words_k())
def _(inp):
    n, k = ints(L(inp)[0])
    ws = L(inp)[1].split()
    return str(sum(1 for w in set(ws) if ws.count(w) == k))


@problem("S-003-3", gen=_g_words_k(krange=(0, 2)))
def _(inp):
    n, m = ints(L(inp)[0])
    ws = L(inp)[1].split()
    return sp(1 if ws.count(w) > m else 0 for w in ws)


@problem("S-003-4", gen=_g_names(alpha="abc", wlen=(1, 2)))
def _(inp):
    ws = L(inp)[1].split()
    return max(ws, key=lambda w: (ws.count(w), -ws.index(w)))


@problem("S-003-5", gen=_g_words_k(krange=(0, 2)))
def _(inp):
    n, t = ints(L(inp)[0])
    ws = L(inp)[1].split()
    out = []
    for w in ws:
        if ws.count(w) <= t and w not in out:
            out.append(w)
    return sp(out)


# ── S-004 · multiset equality after normalising ─────────────────────────────
def _g_two_lists(make, sizes=((1, 1), (2, 2), (3, 3), (4, 3))):
    def gen(r, i):
        n, m = sizes[i % len(sizes)]
        return nl(n, sp(make(r) for _ in range(n)), m, sp(make(r) for _ in range(m)))
    return gen


@problem("S-004-1", gen=_g_two_lists(lambda r: r.randint(-4, 4)))
def _(inp):
    ls = L(inp)
    return yn(sorted(abs(v) for v in ints(ls[1])) == sorted(abs(v) for v in ints(ls[3])))


_STRIP = ".,!?:;'\"()"


@problem("S-004-2", gen=_g_two_lists(lambda r: r.choice(["Hi,", "hi", "(a)", "A!", "b", "B."])))
def _(inp):
    ls = L(inp)
    f = lambda xs: sorted(w.lower().strip(_STRIP) for w in xs)
    return yn(f(ls[1].split()) == f(ls[3].split()))


def _g_two_texts(r, i):
    pool = ["Rat!", "tar 9", "p q r", "r q p", "Ho", "oh!", "mn", "nm?",
            "Dusty", "Study 7", "ab", "ba", "k-9", "9k", "Zed", "Zzz"]
    return nl(pool[(2 * i) % len(pool)], pool[(2 * i + 1) % len(pool)])


@problem("S-004-3", gen=_g_two_texts)
def _(inp):
    ls = RL(inp)
    f = lambda s: sorted(c.lower() for c in s if c.isalpha())
    return yn(f(ls[0]) == f(ls[1]))


@problem("S-004-4", gen=_g_two_lists(lambda r: r.choice(["a1", "A1", "b2", "B2", "c3"])))
def _(inp):
    ls = L(inp)
    f = lambda xs: sorted(w.upper() for w in xs)
    return yn(f(ls[1].split()) == f(ls[3].split()))


@problem("S-004-5", gen=_g_two_lists(lambda r: r.choice(["a.txt", "a", "b.md", "b", "c.v1.z"])))
def _(inp):
    ls = L(inp)
    f = lambda xs: sorted(w.rsplit(".", 1)[0] if "." in w else w for w in xs)
    return yn(f(ls[1].split()) == f(ls[3].split()))


# ── S-005 · anagram classes ─────────────────────────────────────────────────
def _sig(w):
    return "".join(sorted(w))


@problem("S-005-1", gen=_g_names(alpha="abc", wlen=(1, 3)))
def _(inp):
    ws = L(inp)[1].split()
    groups = {}
    for j, w in enumerate(ws, 1):
        groups.setdefault(_sig(w), []).append(j)
    return nl(*[sp(g) for g in sorted(groups.values(), key=lambda g: g[0])])


@problem("S-005-2", gen=_g_names(alpha="abcdef", wlen=(1, 3)))
def _(inp):
    ws = L(inp)[1].split()
    sigs = [_sig(w) for w in ws]
    return nl(*sorted({s for s in sigs if sigs.count(s) >= 2}))


@problem("S-005-3", gen=_g_names(alpha="abc", wlen=(1, 3)))
def _(inp):
    return str(len({_sig(w) for w in L(inp)[1].split()}))


@problem("S-005-4", gen=_g_two_lists(lambda r: "".join(r.sample("abc", r.randint(1, 3)))))
def _(inp):
    ls = L(inp)
    a = [_sig(w) for w in ls[1].split()]
    b = [_sig(w) for w in ls[3].split()]
    return str(sum(1 for x in a for y in b if x == y))


@problem("S-005-5", gen=_g_names(alpha="abc", wlen=(1, 3)))
def _(inp):
    ws = L(inp)[1].split()
    sigs = [_sig(w) for w in ws]
    best = max(range(len(ws)), key=lambda j: (sigs.count(sigs[j]), -j))
    return f"{sigs.count(sigs[best])} {ws[best]}"


# ── S-006 · distinct counts ─────────────────────────────────────────────────
@problem("S-006-1", "S-006-2", gen=_g_names(alpha="abC", wlen=(1, 2)))
def _(inp):
    return str(len(set(L(inp)[1].split())))


@problem("S-006-3", gen=g_n_arr(lo=-5, hi=5))
def _(inp):
    return str(len(set(ints(L(inp)[1]))))


@problem("S-006-4", gen=_g_two_lists(lambda r: r.randint(-4, 4)))
def _(inp):
    ls = L(inp)
    return str(len(set(ints(ls[1])) | set(ints(ls[3]))))


@problem("S-006-5", gen=_g_two_lists(lambda r: r.choice(["red", "blue", "jade", "puce"])))
def _(inp):
    ls = L(inp)
    return str(len(set(ls[1].split()) | set(ls[3].split())))


# ── S-007 · first element with an exact global count ────────────────────────
@problem("S-007-1", gen=g_str(sizes=(1, 3, 5, 8), alpha="abc"))
def _(inp):
    s = RL(inp)[0]
    for j, c in enumerate(s):
        if s.count(c) == 1:
            return str(j)
    return "-1"


def _first_with_count(xs, k):
    return next((v for v in xs if xs.count(v) == k), None)


@problem("S-007-2", gen=g_n_arr(lo=1, hi=5))
def _(inp):
    a = ints(L(inp)[1])
    v = _first_with_count(a, 1)
    return str(-1 if v is None else v)


@problem("S-007-3", gen=_g_words_k(krange=(1, 3)))
def _(inp):
    n, k = ints(L(inp)[0])
    ws = L(inp)[1].split()
    return _first_with_count(ws, k) or "-"


@problem("S-007-4", gen=_g_names(alpha="ab", wlen=(1, 2)))
def _(inp):
    ws = L(inp)[1].split()
    return str(next((j for j, w in enumerate(ws, 1) if ws.count(w) == 2), 0))


@problem("S-007-5", gen=g_n_arr(sizes=(1, 3, 6, 9), lo=0, hi=3))
def _(inp):
    a = ints(L(inp)[1])
    v = _first_with_count(a, 3)
    return str(-1 if v is None else v)


# ── S-008 · intersecting two lists ──────────────────────────────────────────
@problem("S-008-1", gen=_g_two_lists(lambda r: r.randint(-4, 4)))
def _(inp):
    ls = L(inp)
    return sp(sorted(set(ints(ls[1])) & set(ints(ls[3]))))


@problem("S-008-2", gen=_g_two_lists(lambda r: r.randint(0, 4)))
def _(inp):
    ls = L(inp)
    a, b = ints(ls[1]), ints(ls[3])
    return nl(*[f"{v} {min(a.count(v), b.count(v))}"
                for v in sorted(set(a) & set(b))])


@problem("S-008-3", gen=_g_two_lists(lambda r: r.choice(["red", "blue", "jade", "puce"])))
def _(inp):
    ls = L(inp)
    return str(len(set(ls[1].split()) & set(ls[3].split())))


@problem("S-008-4", gen=_g_two_lists(lambda r: r.randint(0, 6)))
def _(inp):
    ls = L(inp)
    b = set(ints(ls[3]))
    return str(next((v for v in ints(ls[1]) if v in b), -1))


@problem("S-008-5", gen=_g_two_lists(lambda r: r.choice(["sun", "sky", "sea", "moon"])))
def _(inp):
    ls = L(inp)
    a, b = ls[1].split(), ls[3].split()
    return nl(*[f"{t} {a.count(t) + b.count(t)}" for t in sorted(set(a) & set(b))])


# ── S-009 · build a dictionary, then answer lookups ─────────────────────────
def _g_kv(vals, keys=("a", "b", "A", "z"), sizes=((1, 1), (2, 2), (3, 2), (4, 3))):
    def gen(r, i):
        n, q = sizes[i % len(sizes)]
        recs = [f"{r.choice(keys)} {vals(r)}" for _ in range(n)]
        qs = [r.choice(keys + ("q",)) for _ in range(q)]
        return nl(str(n), *recs, str(q), *qs)
    return gen


def _kv_pairs(inp):
    ls = L(inp)
    n = int(ls[0])
    d = {}
    for j in range(1, n + 1):
        k, v = ls[j].split()
        d[k] = v
    q = int(ls[n + 1])
    return d, [ls[n + 2 + j].strip() for j in range(q)]


@problem("S-009-1", gen=_g_kv(lambda r: r.randint(0, 500)))
def _(inp):
    d, qs = _kv_pairs(inp)
    return nl(*[d.get(k, "NOT FOUND") for k in qs])


@problem("S-009-2", gen=_g_kv(lambda r: r.randint(-500, 500), keys=("a", "b", "A", "z")))
def _(inp):
    d, qs = _kv_pairs(inp)
    return nl(*[d.get(k, "-1") for k in qs])


@problem("S-009-3", gen=_g_kv(lambda r: "v" + str(r.randint(1, 4))))
def _(inp):
    d, qs = _kv_pairs(inp)
    return nl(*[d.get(k, "NO SUBMISSION") for k in qs])


@problem("S-009-4", gen=_g_kv(lambda r: r.choice([0, 0, 1, 9])))
def _(inp):
    d, qs = _kv_pairs(inp)
    return nl(*["In stock" if int(d.get(k, 0)) > 0 else "Out of stock" for k in qs])


@problem("S-009-5", gen=_g_kv(lambda r: r.randint(0, 900)))
def _(inp):
    d, qs = _kv_pairs(inp)
    return nl(*[d.get(k, "0") for k in qs])


# ── S-010 · pairs in a sorted array ─────────────────────────────────────────
def _g_sorted_pair(lo=-9, hi=9, tlo=-18, thi=18, sizes=(2, 3, 5, 8)):
    def gen(r, i):
        n = size(i, sizes)
        return nl(sp([n, r.randint(tlo, thi)]), sp(sorted(arr(r, n, lo, hi))))
    return gen


@problem("S-010-1", gen=_g_sorted_pair())
def _(inp):
    n, t = ints(L(inp)[0])
    a = ints(L(inp)[1])
    for j in range(n):
        for k in range(j + 1, n):
            if a[j] + a[k] == t:
                return f"{j + 1} {k + 1}"
    return "-1 -1"


@problem("S-010-2", gen=_g_sorted_pair(lo=0, hi=12, tlo=0, thi=12))
def _(inp):
    n, d = ints(L(inp)[0])
    a = ints(L(inp)[1])
    for j in range(n):
        for k in range(j + 1, n):
            if a[k] - a[j] == d:
                return f"{j + 1} {k + 1}"
    return "NONE"


@problem("S-010-3", gen=_g_pair())
def _(inp):
    n, t = ints(L(inp)[0])
    a = ints(L(inp)[1])
    best = None
    for j in range(n):
        for k in range(j + 1, n):
            cand = (abs(a[j] + a[k] - t), j, k)
            if best is None or cand < best:
                best = cand
    _, j, k = best
    return f"{j + 1} {k + 1} {a[j] + a[k]}"


@problem("S-010-4", gen=_g_sorted_pair(lo=0, hi=8, tlo=0, thi=8))
def _(inp):
    n, k = ints(L(inp)[0])
    a = ints(L(inp)[1])
    return str(sum(1 for x in range(n) for y in range(x + 1, n) if a[y] - a[x] == k))


@problem("S-010-5", gen=_g_sorted_pair())
def _(inp):
    n, t = ints(L(inp)[0])
    a = ints(L(inp)[1])
    ok = [a[j] + a[k] for j in range(n) for k in range(j + 1, n) if a[j] + a[k] <= t]
    return str(max(ok)) if ok else "NONE"


# ── S-011 · merging two sorted lists ────────────────────────────────────────
def _g_two_sorted(make, key=None, sizes=((1, 1), (2, 2), (3, 2), (4, 3))):
    def gen(r, i):
        n, m = sizes[i % len(sizes)]
        a = sorted((make(r) for _ in range(n)), key=key)
        b = sorted((make(r) for _ in range(m)), key=key)
        return nl(n, sp(a), m, sp(b))
    return gen


@problem("S-011-1", gen=_g_two_sorted(lambda r: r.randint(-9, 9)))
def _(inp):
    ls = L(inp)
    return sp(sorted(ints(ls[1]) + ints(ls[3])))


def _g_times(r, i):
    n, m = ((1, 1), (2, 2), (3, 2), (4, 3))[i % 4]
    mk = lambda: "%02d:%02d:%02d" % (r.randint(0, 23), r.randint(0, 59), r.randint(0, 59))
    return nl(n, sp(sorted(mk() for _ in range(n))), m, sp(sorted(mk() for _ in range(m))))


@problem("S-011-2", gen=_g_times)
def _(inp):
    ls = L(inp)
    a, b = ls[1].split(), ls[3].split()
    out = []
    while a or b:
        out.append(a.pop(0) if b == [] or (a and a[0] <= b[0]) else b.pop(0))
    return sp(out)


@problem("S-011-3", gen=_g_two_sorted(lambda r: word(r, 2, "abc")))
def _(inp):
    ls = L(inp)
    return sp(sorted(set(ls[1].split()) | set(ls[3].split())))


def _g_decs(r, i):
    n, m = ((1, 1), (2, 2), (3, 2), (4, 3))[i % 4]
    mk = lambda: f"{r.randint(-40, 40) / 10:.1f}"
    return nl(n, sp(sorted((mk() for _ in range(n)), key=float)),
              m, sp(sorted((mk() for _ in range(m)), key=float)))


@problem("S-011-4", gen=_g_decs)
def _(inp):
    ls = L(inp)
    a, b = ls[1].split(), ls[3].split()
    out = []
    while a or b:
        if b == [] or (a and float(a[0]) <= float(b[0])):
            out.append(f"{a.pop(0)} A")
        else:
            out.append(f"{b.pop(0)} B")
    return nl(*out)


def _g_users(r, i):
    n, m = ((1, 1), (2, 2), (3, 2), (4, 3))[i % 4]
    pool = ["ann", "bob", "cid", "dee", "eve", "fay", "gus", "hal"]
    picks = r.sample(pool, n + m)
    return nl(n, sp(sorted(picks[:n])), m, sp(sorted(picks[n:])))


@problem("S-011-5", gen=_g_users)
def _(inp):
    ls = L(inp)
    a, b = ls[1].split(), ls[3].split()
    merged, srcs = [], []
    while a or b:
        if b == [] or (a and a[0] <= b[0]):
            merged.append(a.pop(0))
            srcs.append("A")
        else:
            merged.append(b.pop(0))
            srcs.append("B")
    runs = []
    for s in srcs:
        if runs and runs[-1][0] == s:
            runs[-1][1] += 1
        else:
            runs.append([s, 1])
    return nl(sp(merged), sp(k for _, k in runs))


# ── S-012 · compacting a sorted list in place ───────────────────────────────
def _g_sorted_arr(lo=1, hi=4, sizes=(1, 3, 5, 8)):
    def gen(r, i):
        n = size(i, sizes)
        return nl(n, sp(sorted(arr(r, n, lo, hi))))
    return gen


@problem("S-012-1", gen=_g_sorted_arr(lo=-4, hi=4))
def _(inp):
    a = ints(L(inp)[1])
    out = [v for j, v in enumerate(a) if j == 0 or v != a[j - 1]]
    return nl(len(out), sp(out))


@problem("S-012-2", gen=_g_sorted_arr())
def _(inp):
    a = ints(L(inp)[1])
    out = [v for j, v in enumerate(a) if j < 2 or v != a[j - 2]]
    return nl(len(out), sp(out))


@problem("S-012-3", gen=_g_sorted_arr(lo=0, hi=5))
def _(inp):
    return str(len(set(ints(L(inp)[1]))))


def _g_sorted_words(r, i):
    n = size(i, (1, 3, 5, 8))
    return nl(n, sp(sorted(word(r, 2, "abc") for _ in range(n))))


@problem("S-012-4", gen=_g_sorted_words)
def _(inp):
    a = L(inp)[1].split()
    out = [v for j, v in enumerate(a) if j < 3 or v != a[j - 3]]
    return nl(len(out), sp(out))


def _g_sorted_decs(r, i):
    n = size(i, (1, 3, 5, 8))
    return nl(n, sp(sorted((f"{r.randint(-20, 20) / 10:.1f}" for _ in range(n)), key=float)))


@problem("S-012-5", gen=_g_sorted_decs)
def _(inp):
    a = L(inp)[1].split()
    out = [v for j, v in enumerate(a) if j == 0 or v != a[j - 1]]
    return nl(len(out), sp(out))


# ── S-013 · overlapping intervals ───────────────────────────────────────────
def _g_ivals(sizes=(1, 2, 3, 5), hi=20, closed=False):
    def gen(r, i):
        n = size(i, sizes)
        rows = []
        for _ in range(n):
            s = r.randint(0, hi)
            rows.append((s, s + r.randint(0 if closed else 1, 5)))
        rows.sort()
        return nl(str(n), *[f"{s} {e}" for s, e in rows])
    return gen


def _read_ivals(ls, at):
    n = int(ls[at])
    return n, [ints(ls[at + 1 + j]) for j in range(n)]


@problem("S-013-1", "S-013-5", gen=_g_ivals())
def _(inp):
    _, iv = _read_ivals(L(inp), 0)
    return yn(any(iv[k][0] < iv[j][1] for j in range(len(iv)) for k in range(j + 1, len(iv))))


def _g_two_ivals(closed=False, sizes=((1, 1), (2, 2), (3, 2), (3, 4))):
    def gen(r, i):
        n, m = sizes[i % len(sizes)]
        def block(cnt):
            rows = []
            for _ in range(cnt):
                s = r.randint(0, 20)
                rows.append((s, s + r.randint(0 if closed else 1, 5)))
            rows.sort()
            return [f"{s} {e}" for s, e in rows]
        return nl(str(n), *block(n), str(m), *block(m))
    return gen


@problem("S-013-2", gen=_g_two_ivals(closed=True))
def _(inp):
    ls = L(inp)
    n, a = _read_ivals(ls, 0)
    _, b = _read_ivals(ls, n + 1)
    return yn(any(x[0] <= y[1] and y[0] <= x[1] for x in a for y in b))


@problem("S-013-3", gen=_g_two_ivals())
def _(inp):
    ls = L(inp)
    n, a = _read_ivals(ls, 0)
    m, b = _read_ivals(ls, n + 1)
    for j in range(n):
        for k in range(m):
            if a[j][0] < b[k][1] and b[k][0] < a[j][1]:
                return f"{j + 1} {k + 1}"
    return "-1 -1"


@problem("S-013-4", gen=_g_two_ivals(closed=True))
def _(inp):
    ls = L(inp)
    n, a = _read_ivals(ls, 0)
    _, b = _read_ivals(ls, n + 1)
    hits = [(max(x[0], y[0]), min(x[1], y[1])) for x in a for y in b
            if max(x[0], y[0]) <= min(x[1], y[1])]
    return nl(*[f"{s} {e}" for s, e in sorted(hits)])


# ── S-014 · stable partitions ───────────────────────────────────────────────
def _stable(a, pred):
    return [v for v in a if pred(v)] + [v for v in a if not pred(v)]


@problem("S-014-1", gen=g_n_arr(lo=-3, hi=3))
def _(inp):
    return sp(_stable(ints(L(inp)[1]), lambda v: v != 0))


@problem("S-014-2", gen=g_n_arr(lo=-6, hi=6))
def _(inp):
    return sp(_stable(ints(L(inp)[1]), lambda v: v % 2 == 0))


@problem("S-014-3", gen=g_n_arr(lo=-6, hi=6))
def _(inp):
    return sp(_stable(ints(L(inp)[1]), lambda v: v < 0))


@problem("S-014-4", gen=g_n_arr(lo=0, hi=1))
def _(inp):
    return sp(_stable(ints(L(inp)[1]), lambda v: v == 0))


@problem("S-014-5", gen=g_head_arr(lambda r, n: [r.randint(0, 3)], lo=0, hi=3))
def _(inp):
    n, t = ints(L(inp)[0])
    return sp(_stable(ints(L(inp)[1]), lambda v: v == t))


# ── S-015 · range sums off a cumulative array ───────────────────────────────
def _g_cum(step=(0, 9), sizes=((1, 1), (3, 2), (5, 3), (6, 3))):
    def gen(r, i):
        n, q = sizes[i % len(sizes)]
        cum, t = [], 0
        for _ in range(n):
            t += r.randint(*step)
            cum.append(t)
        qs = []
        for _ in range(q):
            lo = r.randint(1, n)
            qs.append(f"{lo} {r.randint(lo, n)}")
        return nl(sp([n, q]), sp(cum), *qs)
    return gen


@problem("S-015-1", "S-015-2", "S-015-3", "S-015-5", gen=_g_cum())
def _(inp):
    ls = L(inp)
    n, q = ints(ls[0])
    cum = ints(ls[1])
    out = []
    for j in range(q):
        lo, hi = ints(ls[2 + j])
        out.append(cum[hi - 1] - (cum[lo - 2] if lo > 1 else 0))
    return nl(*out)


@problem("S-015-4", gen=_g_cum(step=(0, 1)))
def _(inp):
    ls = L(inp)
    n, q = ints(ls[0])
    cum = ints(ls[1])
    out = []
    for j in range(q):
        lo, hi = ints(ls[2 + j])
        out.append(cum[hi - 1] - (cum[lo - 2] if lo > 1 else 0))
    return nl(*out)


# ── S-016 · range updates, then read the array ──────────────────────────────
def _g_updates(delta=(-5, 5), sizes=((1, 1), (4, 2), (6, 3), (8, 4)), extra=None):
    def gen(r, i):
        n, q = sizes[i % len(sizes)]
        head = [n, q] + ([extra(r)] if extra else [])
        rows = []
        for _ in range(q):
            lo = r.randint(1, n)
            hi = r.randint(lo, n)
            rows.append(f"{lo} {hi}" + (f" {r.randint(*delta)}" if delta else ""))
        return nl(sp(head), *rows)
    return gen


def _apply_updates(inp, has_delta=True, head_len=2):
    ls = L(inp)
    head = ints(ls[0])
    n, q = head[0], head[1]
    out = [0] * n
    for j in range(q):
        row = ints(ls[1 + j])
        lo, hi = row[0], row[1]
        d = row[2] if has_delta else 1
        for k in range(lo - 1, hi):
            out[k] += d
    return head, out


@problem("S-016-1", "S-016-3", gen=_g_updates())
def _(inp):
    return sp(_apply_updates(inp)[1])


@problem("S-016-2", gen=_g_updates(delta=None))
def _(inp):
    return sp(_apply_updates(inp, has_delta=False)[1])


@problem("S-016-4", gen=_g_updates())
def _(inp):
    out = _apply_updates(inp)[1]
    return f"{out.index(max(out)) + 1} {max(out)}"


@problem("S-016-5", gen=_g_updates(delta=None, extra=lambda r: r.randint(1, 3)))
def _(inp):
    head, out = _apply_updates(inp, has_delta=False)
    k = head[2]
    return str(sum(1 for v in out if v >= k))


# ── S-017 · bracket validation, reporting the offending index ───────────────
def _bracket_scan(s, pairs, ok, quote=None):
    stack = []
    inq = False
    for j, c in enumerate(s, 1):
        if quote and c == quote:
            inq = not inq
            continue
        if inq:
            continue
        if c in pairs:
            stack.append((j, c))
        elif c in pairs.values():
            if not stack or pairs[stack[-1][1]] != c:
                return str(j)
            stack.pop()
    return str(stack[0][0]) if stack else ok


@problem("S-017-1", gen=g_str(sizes=(1, 2, 4, 6), alpha="()"))
def _(inp):
    return _bracket_scan(RL(inp)[0], {"(": ")"}, "YES")


@problem("S-017-2", gen=g_str(sizes=(1, 2, 4, 6), alpha="()[]{}"))
def _(inp):
    return _bracket_scan(RL(inp)[0], {"(": ")", "[": "]", "{": "}"}, "VALID")


@problem("S-017-5", gen=g_str(sizes=(1, 2, 4, 6), alpha="()[]{}"))
def _(inp):
    return _bracket_scan(RL(inp)[0], {"(": ")", "[": "]", "{": "}"}, "Matched")


def _g_quoted(chars, q):
    def gen(r, i):
        n = size(i, (1, 2, 4, 6))
        s = "".join(r.choice(chars) for _ in range(n))
        if i % 2:
            s = q + s + q
        return s
    return gen


@problem("S-017-3", gen=_g_quoted("()<>", '"'))
def _(inp):
    return _bracket_scan(RL(inp)[0], {"(": ")", "<": ">"}, "OK", quote='"')


@problem("S-017-4", gen=_g_quoted("[]<>", "'"))
def _(inp):
    return _bracket_scan(RL(inp)[0], {"[": "]", "<": ">"}, "0", quote="'")


# ── S-018 · stack cancellation ──────────────────────────────────────────────
def _collapse(seq, cancels):
    st = []
    for v in seq:
        if st and cancels(st[-1], v):
            st.pop()
        else:
            st.append(v)
    return st


@problem("S-018-1", gen=g_n_str(sizes=(1, 2, 5, 8), alpha="NS"))
def _(inp):
    return "".join(_collapse(L(inp)[1], lambda a, b: a != b))


@problem("S-018-2", gen=g_n_str(sizes=(1, 2, 5, 8), alpha="abc"))
def _(inp):
    return "".join(_collapse(L(inp)[1], lambda a, b: a == b))


@problem("S-018-3", gen=g_str(sizes=(1, 3, 5, 8), alpha="ab1##"))
def _(inp):
    st = []
    for c in RL(inp)[0]:
        if c == "#":
            if st:
                st.pop()
        else:
            st.append(c)
    return "".join(st)


def _g_beads(r, i):
    n = size(i, (1, 2, 5, 8))
    pool = ["red", "blue", "green"]
    m = r.randint(1, 2)
    rules = [f"{r.choice(pool)} {r.choice(pool)}" for _ in range(m)]
    return nl(str(n), sp(r.choice(pool) for _ in range(n)), str(m), *rules)


@problem("S-018-4", gen=_g_beads)
def _(inp):
    ls = L(inp)
    n = int(ls[0])
    beads = ls[1].split()
    m = int(ls[2])
    rules = {frozenset(ls[3 + j].split()) for j in range(m)}
    return sp(_collapse(beads, lambda a, b: frozenset((a, b)) in rules))


def _g_charges(r, i):
    n = size(i, (1, 2, 5, 8))
    return nl(n, sp(r.choice([1, -1]) for _ in range(n)))


@problem("S-018-5", gen=_g_charges)
def _(inp):
    a = ints(L(inp)[1])
    return str(len(_collapse(a, lambda x, y: x * y < 0)))


# ── S-019 · one server, first-come first-served ─────────────────────────────
def _g_queue(sizes=(1, 2, 4, 5), dur=(1, 6)):
    def gen(r, i):
        n = size(i, sizes)
        t = 0
        rows = []
        for _ in range(n):
            t += r.randint(0, 3)
            rows.append(f"{t} {r.randint(*dur)}")
        return nl(str(n), *rows)
    return gen


def _fcfs(rows):
    """Start times under a single server, in arrival order."""
    free = 0
    starts = []
    for a, d in rows:
        s = max(free, a)
        starts.append(s)
        free = s + d
    return starts


def _rows_after_n(inp):
    ls = L(inp)
    n = int(ls[0])
    return [ints(ls[1 + j]) for j in range(n)]


@problem("S-019-1", gen=_g_queue())
def _(inp):
    rows = _rows_after_n(inp)
    return sp(s - a for s, (a, _) in zip(_fcfs(rows), rows))


@problem("S-019-2", gen=_g_queue())
def _(inp):
    rows = _rows_after_n(inp)
    return sp(s + d for s, (_, d) in zip(_fcfs(rows), rows))


@problem("S-019-3", gen=g_head_arr(lambda r, n: [r.randint(1, 6)], sizes=(1, 3, 5, 6), lo=0, hi=12))
def _(inp):
    n, t = ints(L(inp)[0])
    arr_ = sorted(ints(L(inp)[1]))
    return sp(_fcfs([(a, t) for a in arr_]))


@problem("S-019-4", gen=_g_queue())
def _(inp):
    rows = _rows_after_n(inp)
    return str(max(s - a for s, (a, _) in zip(_fcfs(rows), rows)))


@problem("S-019-5", gen=_g_queue())
def _(inp):
    rows = _rows_after_n(inp)
    return str(sum(1 for s, (a, _) in zip(_fcfs(rows), rows) if s > a))


# ── S-020 · queue rotations ─────────────────────────────────────────────────
@problem("S-020-1", gen=g_n_arr(sizes=(1, 2, 4, 6), lo=1, hi=30))
def _(inp):
    q = ints(L(inp)[1])
    out = []
    while q:
        out.append(q.pop(0))
        if q:
            q.append(q.pop(0))
    return sp(out)


def _g_rot(r, i):
    n, m = ((1, 1), (2, 2), (4, 3), (5, 3))[i % 4]
    return nl(sp([n, m]), sp(arr(r, n, 1, 30)), sp(arr(r, m, 0, 9)))


@problem("S-020-2", gen=_g_rot)
def _(inp):
    ls = L(inp)
    q = ints(ls[1])
    out = []
    for k in ints(ls[2]):
        for _ in range(k):
            q.append(q.pop(0))
        out.append(q[0])
    return sp(out)


@problem("S-020-3", gen=lambda r, i: sp([size(i, (1, 2, 4, 6)), r.randint(1, 9)]))
def _(inp):
    n, k = ints(RL(inp)[0])
    q = list(range(1, n + 1))
    out = []
    while q:
        for _ in range((k - 1) % len(q)):
            q.append(q.pop(0))
        out.append(q.pop(0))
    return sp(out)


def _g_cmds(r, i):
    n, c = ((1, 1), (3, 3), (4, 4), (5, 5))[i % 4]
    labels = [word(r, 1, "abcde") + str(j) for j in range(1, n + 1)]
    cmds, alive = [], n
    for _ in range(c):
        if alive and r.random() < 0.5:
            cmds.append("TAKE")
            alive -= 1
        else:
            cmds.append(f"ROTATE {r.randint(0, 6)}")
    return nl(str(n), sp(labels), str(len(cmds)), *cmds)


@problem("S-020-4", gen=_g_cmds)
def _(inp):
    ls = L(inp)
    n = int(ls[0])
    q = ls[1].split()
    c = int(ls[2])
    out = []
    for j in range(c):
        cmd = ls[3 + j].split()
        if cmd[0] == "TAKE":
            out.append(q.pop(0))
        else:
            for _ in range(int(cmd[1])):
                q.append(q.pop(0))
    return sp(out)


def _g_review(r, i):
    n = size(i, (1, 2, 4, 6))
    q = r.randint(1, n)
    labels = [word(r, 1, "abcdef") for _ in range(n)]
    return nl(sp([n, q]), sp(labels), sp(arr(r, q, 0, 7)))


@problem("S-020-5", gen=_g_review)
def _(inp):
    ls = L(inp)
    n, q = ints(ls[0])
    cards = ls[1].split()
    out = []
    for k in ints(ls[2]):
        for _ in range(k):
            cards.append(cards.pop(0))
        out.append(cards.pop(0))
    return sp(out)


# ── S-021 · greedy interval selection ───────────────────────────────────────
def _g_sched(closed=False, dec=False, sizes=(1, 2, 4, 5)):
    def gen(r, i):
        n = size(i, sizes)
        rows = []
        for _ in range(n):
            s = r.randint(0, 12)
            e = s + r.randint(0 if closed else 1, 4)
            rows.append(f"{s / 10:.1f} {e / 10:.1f}" if dec else f"{s} {e}")
        return nl(str(n), *rows)
    return gen


def _greedy(rows, touching_conflicts):
    """Indices picked by earliest-finish-first, ties by start then index."""
    order = sorted(range(len(rows)), key=lambda j: (rows[j][1], rows[j][0], j))
    picked, last = [], None
    for j in order:
        s, e = rows[j]
        if last is None or (s > last if touching_conflicts else s >= last):
            picked.append(j + 1)
            last = e
    return picked


def _num_rows(inp, dec=False):
    ls = L(inp)
    n = int(ls[0])
    conv = float if dec else int
    return [tuple(conv(x) for x in ls[1 + j].split()) for j in range(n)]


@problem("S-021-1", gen=_g_sched())
def _(inp):
    return sp(_greedy(_num_rows(inp), False))


@problem("S-021-2", gen=_g_sched(closed=True))
def _(inp):
    return str(len(_greedy(_num_rows(inp), True)))


@problem("S-021-3", gen=_g_sched(dec=True))
def _(inp):
    return sp(_greedy(_num_rows(inp, dec=True), False))


@problem("S-021-4", gen=_g_sched())
def _(inp):
    picked = _greedy(_num_rows(inp), False)
    return nl(len(picked), sp(picked))


@problem("S-021-5", gen=_g_sched(closed=True))
def _(inp):
    return sp(_greedy(_num_rows(inp), True))


# ── S-022 · canonical coin systems ──────────────────────────────────────────
def _g_denoms(start_one=True, tlo=0, thi=200):
    def gen(r, i):
        k = size(i, (1, 2, 3, 4))
        d = [1 if start_one else r.choice([2, 5])]
        for _ in range(k - 1):
            d.append(d[-1] * r.choice([2, 3, 5]))
        return nl(sp([k, r.randint(tlo, thi)]), sp(d))
    return gen


def _greedy_counts(denoms, target):
    """Counts per denomination (increasing order) and the leftover."""
    counts = [0] * len(denoms)
    rem = target
    for j in range(len(denoms) - 1, -1, -1):
        counts[j] = rem // denoms[j]
        rem -= counts[j] * denoms[j]
    return counts, rem


@problem("S-022-1", gen=_g_denoms())
def _(inp):
    k, t = ints(L(inp)[0])
    counts, _ = _greedy_counts(ints(L(inp)[1]), t)
    return str(sum(counts))


@problem("S-022-2", gen=_g_denoms(start_one=False))
def _(inp):
    k, n = ints(L(inp)[0])
    counts, rem = _greedy_counts(ints(L(inp)[1]), n)
    return "-1" if rem else sp(counts)


@problem("S-022-3", gen=_g_denoms())
def _(inp):
    k, s = ints(L(inp)[0])
    counts, _ = _greedy_counts(ints(L(inp)[1]), s)
    return sp(reversed(counts))


@problem("S-022-4", gen=_g_denoms())
def _(inp):
    k, a = ints(L(inp)[0])
    counts, _ = _greedy_counts(ints(L(inp)[1]), a)
    return sp(counts)


@problem("S-022-5", gen=lambda r, i: sp([r.randint(2, 10), size(i, (1, 2, 3, 4)), r.randint(0, 300)]))
def _(inp):
    b, k, m = ints(RL(inp)[0])
    denoms = [b ** j for j in range(k)]
    counts, _ = _greedy_counts(denoms, m)
    return f"{sum(counts)} {counts[-1]}"


# ── S-023 · group and total ─────────────────────────────────────────────────
@problem("S-023-1", gen=g_n_arr(lo=0, hi=6))
def _(inp):
    a = ints(L(inp)[1])
    return nl(*[f"{v} {a.count(v)}" for v in sorted(set(a))])


def _g_kv_rows(vals, keys=("a", "b", "zz", "A")):
    def gen(r, i):
        n = size(i, (1, 2, 4, 6))
        return nl(str(n), *[f"{r.choice(keys)} {vals(r)}" for _ in range(n)])
    return gen


def _group(inp, pick):
    ls = L(inp)
    n = int(ls[0])
    acc = {}
    for j in range(1, n + 1):
        k, v = ls[j].split()
        acc[k] = pick(acc.get(k), int(v))
    return nl(*[f"{k} {acc[k]}" for k in sorted(acc)])


@problem("S-023-2", gen=_g_kv_rows(lambda r: r.randint(-20, 20)))
def _(inp):
    return _group(inp, lambda old, v: v if old is None else old + v)


@problem("S-023-3", gen=_g_kv_rows(lambda r: r.randint(0, 500), keys=("a", "b", "A", "z")))
def _(inp):
    return _group(inp, lambda old, v: v if old is None else min(old, v))


@problem("S-023-4", gen=_g_names(alpha="abc", wlen=(1, 2)))
def _(inp):
    ws = L(inp)[1].split()
    return nl(*[f"{w} {ws.count(w)}" for w in sorted(set(ws))])


@problem("S-023-5", gen=_g_kv_rows(lambda r: r.randint(1, 400)))
def _(inp):
    return _group(inp, lambda old, v: v if old is None else old + v)


# ── S-024 · lexicographic neighbours ────────────────────────────────────────
@problem("S-024-1", gen=_g_names(alpha="ab", wlen=(1, 2)))
def _(inp):
    ws = L(inp)[1].split()
    dups = sorted(w for w in set(ws) if ws.count(w) > 1)
    return dups[0] if dups else "NONE"


def _g_distinct_words(sizes=(2, 3, 4, 6)):
    def gen(r, i):
        n = size(i, sizes)
        pool = ["a", "ab", "abc", "b", "ba", "bc", "c", "ca", "cab", "zz"]
        return nl(n, sp(r.sample(pool, n)))
    return gen


def _lcp(a, b):
    j = 0
    while j < len(a) and j < len(b) and a[j] == b[j]:
        j += 1
    return j


@problem("S-024-2", gen=_g_distinct_words())
def _(inp):
    ws = L(inp)[1].split()
    order = sorted(range(len(ws)), key=lambda j: ws[j])
    best = max(range(len(ws) - 1),
               key=lambda j: (_lcp(ws[order[j]], ws[order[j + 1]]), -j))
    return f"{order[best] + 1} {order[best + 1] + 1}"


@problem("S-024-3", gen=_g_names(alpha="abc", wlen=(1, 4), sizes=(2, 3, 4, 6)))
def _(inp):
    ws = sorted(L(inp)[1].split())
    best = min(range(len(ws) - 1), key=lambda j: (abs(len(ws[j + 1]) - len(ws[j])), j))
    return f"{abs(len(ws[best + 1]) - len(ws[best]))} {ws[best]} {ws[best + 1]}"


@problem("S-024-4", gen=_g_distinct_words())
def _(inp):
    ws = sorted(L(inp)[1].split())
    for j in range(len(ws) - 1):
        if ws[j + 1].startswith(ws[j]):
            return f"{ws[j]} {ws[j + 1]}"
    return "NONE"


@problem("S-024-5", gen=_g_names(alpha="abc", wlen=(1, 3), sizes=(2, 3, 4, 6)))
def _(inp):
    ws = sorted(L(inp)[1].split())
    best = min(range(len(ws) - 1), key=lambda j: (_lcp(ws[j], ws[j + 1]), j))
    return f"{ws[best]} {ws[best + 1]} {_lcp(ws[best], ws[best + 1])}"


# ── S-025 · ordering by frequency ───────────────────────────────────────────
@problem("S-025-1", gen=_g_names(alpha="ab", wlen=(1, 2), sizes=(1, 3, 5, 8)))
def _(inp):
    ws = L(inp)[1].split()
    return sp(sorted(set(ws), key=lambda w: (-ws.count(w), w)))


@problem("S-025-2", gen=g_n_arr(sizes=(1, 3, 5, 8), lo=0, hi=6))
def _(inp):
    a = ints(L(inp)[1])
    return str(min(set(a), key=lambda v: (-a.count(v), v)))


@problem("S-025-3", gen=_g_names(alpha="abc", wlen=(1, 2), sizes=(1, 3, 5, 8)))
def _(inp):
    ws = L(inp)[1].split()
    return sp(sorted(set(ws), key=lambda w: (-ws.count(w), ws.index(w))))


@problem("S-025-4", gen=g_n_arr(sizes=(1, 3, 5, 8), lo=0, hi=6))
def _(inp):
    a = ints(L(inp)[1])
    return sp(sorted(set(a), key=lambda v: (-a.count(v), -v)))


@problem("S-025-5", gen=_g_names(alpha="ab", wlen=(1, 2), sizes=(1, 3, 5, 8)))
def _(inp):
    ws = L(inp)[1].split()
    return sp(sorted(set(ws), key=lambda w: (ws.count(w), w)))


# ── S-026 · XOR over a range ────────────────────────────────────────────────
def _g_xor(hi=1000, masked=False, lo=0):
    def gen(r, i):
        n, q = ((1, 1), (3, 2), (5, 3), (6, 3))[i % 4]
        qs = []
        for _ in range(q):
            a = r.randint(1, n)
            b = r.randint(a, n)
            qs.append(f"{a} {b}" + (f" {r.randint(0, hi)}" if masked else ""))
        return nl(sp([n, q]), sp(arr(r, n, lo, hi)), *qs)
    return gen


def _xor_range(a, lo, hi):
    v = 0
    for x in a[lo - 1:hi]:
        v ^= x
    return v


@problem("S-026-1", "S-026-2", "S-026-4", gen=_g_xor())
def _(inp):
    ls = L(inp)
    n, q = ints(ls[0])
    a = ints(ls[1])
    return nl(*[_xor_range(a, *ints(ls[2 + j])) for j in range(q)])


@problem("S-026-3", gen=_g_xor(hi=1))
def _(inp):
    ls = L(inp)
    n, q = ints(ls[0])
    a = ints(ls[1])
    return nl(*[_xor_range(a, *ints(ls[2 + j])) for j in range(q)])


@problem("S-026-5", gen=_g_xor(masked=True))
def _(inp):
    ls = L(inp)
    n, q = ints(ls[0])
    a = ints(ls[1])
    out = []
    for j in range(q):
        lo, hi, m = ints(ls[2 + j])
        out.append(m ^ _xor_range(a, lo, hi))
    return nl(*out)


# ── S-027 · subsequence matching ────────────────────────────────────────────
def _subseq_positions(pat, src):
    """1-based positions of the earliest-possible match, or None."""
    pos, k = [], 0
    for j, v in enumerate(src, 1):
        if k < len(pat) and v == pat[k]:
            pos.append(j)
            k += 1
    return pos if k == len(pat) else None


def _g_two_words(alpha="abc", sizes=((1, 1), (2, 3), (3, 5), (4, 6))):
    def gen(r, i):
        m, n = sizes[i % len(sizes)]
        return nl(word(r, m, alpha), word(r, n, alpha))
    return gen


@problem("S-027-1", gen=_g_two_words())
def _(inp):
    ls = L(inp)
    return yn(_subseq_positions(ls[0], ls[1]) is not None)


@problem("S-027-2", gen=_g_two_words())
def _(inp):
    ls = L(inp)
    pos = _subseq_positions(ls[0], ls[1])
    return sp(pos) if pos else "-1"


def _g_two_int_lists(sizes=((1, 1), (2, 3), (3, 5), (4, 6)), lo=1, hi=4):
    def gen(r, i):
        m, n = sizes[i % len(sizes)]
        return nl(m, sp(arr(r, m, lo, hi)), n, sp(arr(r, n, lo, hi)))
    return gen


@problem("S-027-3", gen=_g_two_int_lists())
def _(inp):
    ls = L(inp)
    pos = _subseq_positions(ints(ls[1]), ints(ls[3]))
    return str(pos[-1] if pos else 0)


@problem("S-027-4", gen=_g_two_words(alpha="ACGT"))
def _(inp):
    ls = L(inp)
    pos = _subseq_positions(ls[0], ls[1])
    return str(pos[0] if pos else -1)


def _g_melody(r, i):
    m, n = ((0, 1), (1, 2), (2, 4), (3, 5))[i % 4]
    notes = ["do", "re", "mi", "fa", "so"]
    return nl(m, sp(r.choice(notes) for _ in range(m)), n, sp(r.choice(notes) for _ in range(n)))


@problem("S-027-5", gen=_g_melody)
def _(inp):
    ls = RL(inp)
    m = int(ls[0])
    if m == 0:
        return "0"
    pos = _subseq_positions(ls[1].split(), ls[3].split())
    return sp(pos) if pos else "NO"


# ── S-028 · cyclic rotation checks ──────────────────────────────────────────
def _is_rotation(a, b):
    return len(a) == len(b) and any(a[k:] + a[:k] == b for k in range(len(a) or 1))


def _g_rot_words(alpha="abc"):
    def gen(r, i):
        n = size(i, (1, 2, 4, 6))
        a = word(r, n, alpha)
        b = a[n // 2:] + a[:n // 2] if i % 2 else word(r, n, alpha)
        return nl(a, b)
    return gen


@problem("S-028-1", gen=_g_rot_words())
def _(inp):
    ls = L(inp)
    return yn(_is_rotation(ls[0], ls[1]))


@problem("S-028-3", gen=_g_rot_words(alpha="rgb"))
def _(inp):
    ls = L(inp)
    return "1" if _is_rotation(ls[0], ls[1]) else "0"


def _g_rot_lists(make):
    def gen(r, i):
        n = size(i, (1, 2, 4, 6))
        a = [make(r) for _ in range(n)]
        b = a[n // 2:] + a[:n // 2] if i % 2 else [make(r) for _ in range(n)]
        return nl(n, sp(a), n, sp(b))
    return gen


@problem("S-028-2", gen=_g_rot_lists(lambda r: r.randint(0, 4)))
def _(inp):
    ls = L(inp)
    return "True" if _is_rotation(ls[1].split(), ls[3].split()) else "False"


@problem("S-028-4", gen=_g_rot_lists(lambda r: r.choice(["AA", "BB", "CC"])))
def _(inp):
    ls = L(inp)
    return "Possible" if _is_rotation(ls[1].split(), ls[3].split()) else "Impossible"


@problem("S-028-5", gen=_g_rot_lists(lambda r: r.randint(0, 4)))
def _(inp):
    ls = L(inp)
    return "yes" if _is_rotation(ls[1].split(), ls[3].split()) else "no"


# ── S-029 · histogram rectangles ────────────────────────────────────────────
def _spans(h):
    """For each bar, the widest run in which it is the minimum."""
    n = len(h)
    out = []
    for j in range(n):
        lo = j
        while lo > 0 and h[lo - 1] >= h[j]:
            lo -= 1
        hi = j
        while hi < n - 1 and h[hi + 1] >= h[j]:
            hi += 1
        out.append((lo, hi))
    return out


@problem("S-029-1", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=0, hi=9))
def _(inp):
    h = ints(L(inp)[1])
    return str(max((hi - lo + 1) * h[j] for j, (lo, hi) in enumerate(_spans(h))))


@problem("S-029-2", gen=g_head_arr(lambda r, n: [r.randint(0, n - 1)], sizes=(1, 3, 5, 7), lo=0, hi=9))
def _(inp):
    n, k = ints(L(inp)[0])
    h = ints(L(inp)[1])
    best = 0
    for lo in range(k + 1):
        for hi in range(k, n):
            best = max(best, (hi - lo + 1) * min(h[lo:hi + 1]))
    return str(best)


@problem("S-029-3", gen=g_head_arr(lambda r, n: [r.randint(1, n)], sizes=(1, 3, 5, 7), lo=0, hi=9))
def _(inp):
    n, w = ints(L(inp)[0])
    h = ints(L(inp)[1])
    return str(max(w * min(h[j:j + w]) for j in range(n - w + 1)))


@problem("S-029-4", gen=g_head_arr(lambda r, n: [r.randint(0, 6)], sizes=(1, 3, 5, 7), lo=0, hi=9))
def _(inp):
    n, t = ints(L(inp)[0])
    h = ints(L(inp)[1])
    return str(sum(1 for lo in range(n) for hi in range(lo, n) if min(h[lo:hi + 1]) >= t))


@problem("S-029-5", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=0, hi=9))
def _(inp):
    h = ints(L(inp)[1])
    return sp((hi - lo + 1) * h[j] for j, (lo, hi) in enumerate(_spans(h)))


# ── S-030 · smallest absent value in a window ───────────────────────────────
def _first_absent(present, lo, hi):
    for v in range(lo, hi + 1):
        if v not in present:
            return v
    return hi + 1


@problem("S-030-1", gen=g_n_arr(sizes=(1, 3, 5, 8), lo=-2, hi=8))
def _(inp):
    n = int(L(inp)[0])
    return str(_first_absent(set(ints(L(inp)[1])), 0, n))


@problem("S-030-2", gen=g_n_arr(sizes=(1, 3, 5, 8), lo=-2, hi=8))
def _(inp):
    n = int(L(inp)[0])
    return str(_first_absent(set(ints(L(inp)[1])), 1, n + 1))


@problem("S-030-3", gen=g_n_arr(sizes=(1, 3, 5, 8), lo=998, hi=1008))
def _(inp):
    n = int(L(inp)[0])
    return str(_first_absent(set(ints(L(inp)[1])), 1000, 1000 + n))


@problem("S-030-4", gen=g_n_arr(sizes=(1, 3, 5, 8), lo=-2, hi=8))
def _(inp):
    n = int(L(inp)[0])
    return str(_first_absent(set(ints(L(inp)[1])), 0, n))


@problem("S-030-5", gen=g_n_arr(sizes=(1, 3, 5, 8), lo=-2, hi=8))
def _(inp):
    n = int(L(inp)[0])
    return str(_first_absent(set(ints(L(inp)[1])), 1, n + 1))


# ── S-031 · postfix evaluation ──────────────────────────────────────────────
def _postfix(tokens, ops, is_operand):
    st = []
    for t in tokens:
        if t in ops and not is_operand(t):
            b = st.pop()
            a = st.pop()
            st.append(ops[t](a, b))
        else:
            st.append(t)
    return st[-1]


def _trunc_div(a, b):
    q = abs(a) // abs(b)
    return q if (a < 0) == (b < 0) else -q


def _trunc_mod(a, b):
    return a - _trunc_div(a, b) * b


def _g_postfix(ops, operand, sizes=(1, 3, 5, 7)):
    def gen(r, i):
        n = size(i, sizes)
        toks = [operand(r)]
        for _ in range(n - 1):
            toks += [operand(r), r.choice(ops)]
        return sp(toks)
    return gen


@problem("S-031-1", gen=_g_postfix(["+", "-", "*", "/"], lambda r: r.randint(-9, 9) or 1))
def _(inp):
    toks = [int(t) if t not in "+-*/" or len(t) > 1 else t for t in RL(inp)[0].split()]
    ops = {"+": lambda a, b: a + b, "-": lambda a, b: a - b,
           "*": lambda a, b: a * b, "/": _trunc_div}
    return str(_postfix(toks, ops, lambda t: not isinstance(t, str)))


@problem("S-031-2", gen=_g_postfix(["AND", "OR"], lambda r: r.choice(["T", "F"])))
def _(inp):
    ops = {"AND": lambda a, b: "T" if a == b == "T" else "F",
           "OR": lambda a, b: "T" if "T" in (a, b) else "F"}
    return _postfix(RL(inp)[0].split(), ops, lambda t: t in ("T", "F"))


@problem("S-031-3", gen=_g_postfix(["+", "-", "*", "%"], lambda r: r.randint(-9, 9) or 1))
def _(inp):
    toks = [int(t) if t not in "+-*%" or len(t) > 1 else t for t in RL(inp)[0].split()]
    ops = {"+": lambda a, b: a + b, "-": lambda a, b: a - b,
           "*": lambda a, b: a * b, "%": _trunc_mod}
    return str(_postfix(toks, ops, lambda t: not isinstance(t, str)))


@problem("S-031-4", gen=_g_postfix(["max", "min"], lambda r: r.randint(0, 30)))
def _(inp):
    toks = [t if t in ("max", "min") else int(t) for t in RL(inp)[0].split()]
    ops = {"max": max, "min": min}
    return str(_postfix(toks, ops, lambda t: not isinstance(t, str)))


@problem("S-031-5", gen=_g_postfix(["+", ">"], lambda r: r.randint(-9, 9) or 1))
def _(inp):
    toks = [int(t) if t not in ("+", ">") else t for t in RL(inp)[0].split()]
    ops = {"+": lambda a, b: a + b, ">": lambda a, b: 1 if a > b else 0}
    return str(_postfix(toks, ops, lambda t: not isinstance(t, str)))


# ── S-032 · merging overlapping intervals ───────────────────────────────────
def _merge(iv, joins):
    """joins(prev_end, next_start) decides whether two runs become one."""
    out = []
    for s, e in sorted(iv):
        if out and joins(out[-1][1], s):
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out


@problem("S-032-1", gen=_g_ivals(closed=True))
def _(inp):
    iv = _read_ivals(L(inp), 0)[1]
    return nl(*[f"{s} {e}" for s, e in _merge(iv, lambda pe, s: s <= pe)])


@problem("S-032-2", gen=_g_ivals(closed=True))
def _(inp):
    iv = _read_ivals(L(inp), 0)[1]
    return nl(*[f"{s} {e}" for s, e in _merge(iv, lambda pe, s: s <= pe + 1)])


@problem("S-032-3", gen=_g_ivals())
def _(inp):
    iv = _read_ivals(L(inp), 0)[1]
    return nl(*[f"{s} {e}" for s, e in _merge(iv, lambda pe, s: s < pe)])


def _g_dec_ivals(r, i):
    n = size(i, (1, 2, 3, 4))
    rows = []
    for _ in range(n):
        s = r.randint(0, 60)
        rows.append(f"{s / 10:.1f} {(s + r.randint(0, 20)) / 10:.1f}")
    return nl(str(n), *rows)


@problem("S-032-4", gen=_g_dec_ivals)
def _(inp):
    ls = L(inp)
    n = int(ls[0])
    iv = [tuple(float(x) for x in ls[1 + j].split()) for j in range(n)]
    return f"{sum(e - s for s, e in _merge(iv, lambda pe, s: s <= pe)):.1f}"


@problem("S-032-5", gen=_g_ivals(closed=True))
def _(inp):
    iv = _read_ivals(L(inp), 0)[1]
    return str(len(_merge(iv, lambda pe, s: s < pe)))


# ── S-033 · bijection between two token sequences ───────────────────────────
def _bijective(a, b):
    if len(a) != len(b):
        return False
    fwd, rev = {}, {}
    for x, y in zip(a, b):
        if fwd.setdefault(x, y) != y or rev.setdefault(y, x) != x:
            return False
    return True


def _g_bijection(left, right, split_left=False):
    def gen(r, i):
        n = size(i, (1, 2, 3, 4))
        a = [r.choice(left) for _ in range(n)]
        b = [r.choice(right) for _ in range(n)]
        return nl("".join(a) if split_left else sp(a), sp(b))
    return gen


@problem("S-033-1", gen=_g_bijection("ab", ["dog", "cat", "fish"], split_left=True))
def _(inp):
    ls = RL(inp)
    return yn(_bijective(list(ls[0].strip()), ls[1].split()))


@problem("S-033-2", gen=_g_bijection(["A", "B", "C"], ["red", "blue", "green"]))
def _(inp):
    ls = RL(inp)
    return "Valid" if _bijective(ls[0].split(), ls[1].split()) else "Invalid"


@problem("S-033-3", gen=_g_bijection(["p1", "p2", "p3"], ["cat", "dog", "emu"]))
def _(inp):
    ls = RL(inp)
    return "1" if _bijective(ls[0].split(), ls[1].split()) else "0"


@problem("S-033-4", gen=_g_bijection(["1", "2", "3"], ["apple", "pear", "plum"]))
def _(inp):
    ls = RL(inp)
    return "MATCH" if _bijective(ls[0].split(), ls[1].split()) else "NO MATCH"


@problem("S-033-5", gen=_g_bijection(["t1", "t2", "t3"], ["host", "port", "path"]))
def _(inp):
    ls = RL(inp)
    return "true" if _bijective(ls[0].split(), ls[1].split()) else "false"


# ── S-034 · closest pair of values ──────────────────────────────────────────
def _closest(a):
    n = len(a)
    return min(((abs(a[j] - a[k]), j, k) for j in range(n) for k in range(j + 1, n)))


@problem("S-034-1", gen=g_n_arr(sizes=(2, 3, 5, 8), lo=-20, hi=20))
def _(inp):
    return str(_closest(ints(L(inp)[1]))[0])


@problem("S-034-2", "S-034-5", gen=g_n_arr(sizes=(2, 3, 5, 8), lo=0, hi=30))
def _(inp):
    _, j, k = _closest(ints(L(inp)[1]))
    return f"{j + 1} {k + 1}"


@problem("S-034-3", gen=g_n_arr(sizes=(2, 3, 5, 8), lo=-20, hi=20))
def _(inp):
    a = ints(L(inp)[1])
    _, j, k = _closest(a)
    return sp(sorted((a[j], a[k])))


@problem("S-034-4", gen=g_n_arr(sizes=(2, 3, 5, 8), lo=-9, hi=9))
def _(inp):
    a = ints(L(inp)[1])
    n = len(a)
    best = _closest(a)[0]
    hits = sum(1 for j in range(n) for k in range(j + 1, n) if abs(a[j] - a[k]) == best)
    return f"{best} {hits}"


# ── S-035 · push/pop command logs ───────────────────────────────────────────
def _g_cmdlog(push, arg=None, sizes=(1, 3, 4, 6)):
    def gen(r, i):
        n = size(i, sizes)
        rows = []
        for _ in range(n):
            if r.random() < 0.6:
                rows.append(f"{push} {arg(r)}" if arg else push)
            else:
                rows.append(POP_WORD[push])
        return nl(str(n), *rows)
    return gen


POP_WORD = {"TYPE": "UNDO", "DRAW": "ERASE", "SCORE": "RETRACT",
            "VISIT": "BACK", "ADD": "REMOVE"}


def _run_log(inp, push):
    ls = L(inp)
    n = int(ls[0])
    st = []
    for j in range(1, n + 1):
        parts = ls[j].split()
        if parts[0] == push:
            st.append(parts[1])
        elif st:
            st.pop()
    return st


@problem("S-035-1", gen=_g_cmdlog("TYPE", lambda r: word(r, 1, "abc")))
def _(inp):
    return "".join(_run_log(inp, "TYPE"))


@problem("S-035-2", gen=_g_cmdlog("DRAW", lambda r: "s" + str(r.randint(1, 9))))
def _(inp):
    st = _run_log(inp, "DRAW")
    return sp(st) if st else "EMPTY"


@problem("S-035-3", gen=_g_cmdlog("SCORE", lambda r: r.randint(-50, 50)))
def _(inp):
    return str(sum(int(v) for v in _run_log(inp, "SCORE")))


@problem("S-035-4", gen=_g_cmdlog("VISIT", lambda r: word(r, 1, "abc") + ".com"))
def _(inp):
    st = _run_log(inp, "VISIT")
    return st[-1] if st else "HOME"


@problem("S-035-5", gen=_g_cmdlog("ADD", lambda r: r.choice(["milk", "eggs", "jam"])))
def _(inp):
    st = _run_log(inp, "ADD")
    return sp(st) if st else "0"
