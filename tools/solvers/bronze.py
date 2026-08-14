from .common import *  # noqa: F401,F403


# ── B-001 · clamping, residues, quotients, signs ────────────────────────────
def _g_n_lr(r, i):
    n = size(i)
    lo = r.randint(-20, 10)
    hi = r.randint(lo, lo + r.choice([0, 3, 15]))
    return nl(sp([n, lo, hi]), sp(arr(r, n, -30, 30)))


@problem("B-001-1", gen=_g_n_lr)
def _(inp):
    n, lo, hi = ints(L(inp)[0])
    return sp(min(hi, max(lo, v)) for v in ints(L(inp)[1]))


@problem("B-001-2", gen=g_head_arr(lambda r, n: [r.choice([1, 2, 3, 7, 10])], lo=-40, hi=40))
def _(inp):
    n, m = ints(L(inp)[0])
    return sp(v % m for v in ints(L(inp)[1]))


@problem("B-001-3", gen=g_head_arr(lambda r, n: [r.choice([1, 2, 3, 5, 10])], lo=-40, hi=40))
def _(inp):
    n, k = ints(L(inp)[0])
    return sp(int(v / k) if v * k >= 0 else -(abs(v) // k) for v in ints(L(inp)[1]))


@problem("B-001-4", gen=g_n_arr(lo=-9, hi=9))
def _(inp):
    return sp((v > 0) - (v < 0) for v in ints(L(inp)[1]))


@problem("B-001-5", gen=g_head_arr(lambda r, n: [r.choice([0, 1, 5, 25])], lo=-30, hi=30))
def _(inp):
    n, c = ints(L(inp)[0])
    return sp(min(abs(v), c) for v in ints(L(inp)[1]))


# ── B-002 · rearranging a line of numbers ───────────────────────────────────
@problem("B-002-1", gen=g_n_arr(lo=-50, hi=50))
def _(inp):
    return sp(reversed(ints(L(inp)[1])))


@problem("B-002-2", gen=g_head_arr(lambda r, n: [r.randint(0, n - 1)], lo=-50, hi=50))
def _(inp):
    n, k = ints(L(inp)[0])
    a = ints(L(inp)[1])
    k %= n
    return sp(a[n - k:] + a[:n - k])


@problem("B-002-3", gen=g_n_arr(sizes=(2, 4, 6, 10), lo=-50, hi=50))
def _(inp):
    n = int(L(inp)[0])
    a = ints(L(inp)[1])
    lo, hi = a[:n // 2], a[n // 2:]
    out = []
    for x, y in zip(lo, hi):
        out += [x, y]
    return sp(out)


@problem("B-002-4", gen=g_n_arr(lo=-50, hi=50))
def _(inp):
    a = ints(L(inp)[1])
    return sp(a[1::2] + a[0::2])


@problem("B-002-5", gen=g_n_arr(lo=-50, hi=50))
def _(inp):
    a = ints(L(inp)[1])
    for j in range(0, len(a) - 1, 2):
        a[j], a[j + 1] = a[j + 1], a[j]
    return sp(a)


# ── B-003 · segment edits ───────────────────────────────────────────────────
def _g_seg(lo=-50, hi=50, extra=None, sizes=(1, 3, 6, 9)):
    def gen(r, i):
        n = size(i, sizes)
        a = r.randint(1, n)
        b = r.randint(a, n)
        head = [n, a, b] + (list(extra(r)) if extra else [])
        return nl(sp(head), sp(arr(r, n, lo, hi)))
    return gen


@problem("B-003-1", gen=_g_seg())
def _(inp):
    n, a, b = ints(L(inp)[0])
    x = ints(L(inp)[1])
    for j in range(a - 1, b):
        x[j] = -x[j]
    return sp(x)


def _g_substr(r, i):
    s = word(r, size(i, (1, 4, 6, 9)), "abcz")
    a = r.randint(1, len(s))
    b = r.randint(a, len(s))
    return nl(s, sp([a, b]))


@problem("B-003-2", gen=_g_substr)
def _(inp):
    s = L(inp)[0]
    a, b = ints(L(inp)[1])
    return s[:a - 1] + s[a - 1:b][::-1] + s[b:]


@problem("B-003-3", gen=_g_seg(extra=lambda r: [r.randint(-20, 20)]))
def _(inp):
    n, a, b, v = ints(L(inp)[0])
    x = ints(L(inp)[1])
    for j in range(a - 1, b):
        x[j] = v
    return str(sum(x))


@problem("B-003-4", gen=_g_seg(lo=0, hi=1))
def _(inp):
    n, a, b = ints(L(inp)[0])
    x = ints(L(inp)[1])
    for j in range(a - 1, b):
        x[j] ^= 1
    return str(sum(x))


@problem("B-003-5", gen=_g_seg(lo=-2, hi=2))
def _(inp):
    n, a, b = ints(L(inp)[0])
    x = ints(L(inp)[1])
    return str(sum(1 for j in range(a - 1, b) if x[j] != 0))


# ── B-004 · filtering ───────────────────────────────────────────────────────
@problem("B-004-1", gen=g_head_arr(lambda r, n: [r.randint(-10, 10)], lo=-15, hi=15))
def _(inp):
    n, t = ints(L(inp)[0])
    return sp(v for v in ints(L(inp)[1]) if v > t)


@problem("B-004-2", gen=g_n_arr(lo=1, hi=30))
def _(inp):
    return sp(v for v in ints(L(inp)[1]) if v % 2 == 0)


@problem("B-004-3", gen=g_head_arr(lambda r, n: [r.choice([1, 2, 3, 5, 7])], lo=-30, hi=30))
def _(inp):
    n, k = ints(L(inp)[0])
    return sp(v for v in ints(L(inp)[1]) if v % k == 0)


def _g_cat(r, i):
    n = size(i)
    cats = ["c1", "c2", "c3"]
    rows = [f"n{j + 1} {r.choice(cats)}" for j in range(n)]
    target = "zz" if i == 0 else r.choice(cats)
    return nl(str(n), *rows, target)


@problem("B-004-4", gen=_g_cat)
def _(inp):
    ls = L(inp)
    n = int(ls[0])
    target = ls[n + 1]
    return sp(ls[1 + j].split()[0] for j in range(n) if ls[1 + j].split()[1] == target)


def _g_words(r, i):
    n = size(i)
    pool = ["apple", "sky", "Eagle", "owl", "dog", "Ice", "up", "zebra"]
    return nl(n, sp(r.choice(pool) for _ in range(n)))


@problem("B-004-5", gen=_g_words)
def _(inp):
    return sp(w for w in L(inp)[1].split() if w[0].lower() in "aeiou")


# ── B-005 · runs ────────────────────────────────────────────────────────────
def _runs(seq):
    out = []
    for x in seq:
        if out and out[-1][0] == x:
            out[-1][1] += 1
        else:
            out.append([x, 1])
    return out


@problem("B-005-1", gen=g_n_arr(lo=1, hi=3))
def _(inp):
    return str(len(_runs(ints(L(inp)[1]))))


@problem("B-005-2", gen=g_str(sizes=(1, 4, 7, 10), alpha="aab"))
def _(inp):
    return sp(f"{c} {k}" for c, k in _runs(L(inp)[0]))


def _g_colours(r, i):
    n = size(i)
    pool = ["red", "blue", "green"]
    return nl(n, sp(r.choice(pool) for _ in range(n)))


@problem("B-005-3", gen=_g_colours)
def _(inp):
    best = max(_runs(L(inp)[1].split()), key=lambda p: p[1])
    return f"{best[0]} {best[1]}"


@problem("B-005-4", gen=g_str(sizes=(1, 4, 7, 10), alpha="0011"))
def _(inp):
    return ",".join(f"{c}:{k}" for c, k in _runs(L(inp)[0]))


@problem("B-005-5", gen=g_n_arr(lo=0, hi=3))
def _(inp):
    return sp(f"({v},{k})" for v, k in _runs(ints(L(inp)[1])))


# ── B-006 · position-dependent transforms ───────────────────────────────────
@problem("B-006-1", gen=g_head_arr(lambda r, n: [r.randint(-9, 9), r.randint(-9, 9)], lo=-20, hi=20))
def _(inp):
    n, a, b = ints(L(inp)[0])
    return sp(v + (a if j % 2 == 0 else b) for j, v in enumerate(ints(L(inp)[1])))


@problem("B-006-2", gen=g_str(sizes=(1, 4, 6, 9), alpha="abZxY"))
def _(inp):
    s = L(inp)[0]
    return "".join(c.upper() if j % 2 == 0 else c.lower() for j, c in enumerate(s))


@problem("B-006-3", gen=g_n_arr(lo=-20, hi=20))
def _(inp):
    a = ints(L(inp)[1])
    return str(sum(a[0::2]) - sum(a[1::2]))


def _g_wordlist(alpha="abc", wlen=(1, 4), sizes=(1, 3, 6, 9)):
    def gen(r, i):
        n = size(i, sizes)
        return nl(n, sp(word(r, r.randint(*wlen), alpha) for _ in range(n)))
    return gen


@problem("B-006-4", gen=_g_wordlist())
def _(inp):
    ws = L(inp)[1].split()
    return sp(w[::-1] if j % 2 else w for j, w in enumerate(ws))


@problem("B-006-5", gen=g_n_arr(lo=-5, hi=5))
def _(inp):
    return sp(v * v if j % 2 == 0 else v ** 3 for j, v in enumerate(ints(L(inp)[1])))


# ── B-007 · extrema and where they sit ──────────────────────────────────────
@problem("B-007-1", gen=g_n_arr(lo=-9, hi=9))
def _(inp):
    a = ints(L(inp)[1])
    return f"{min(a)} {a.index(min(a)) + 1}"


@problem("B-007-2", gen=g_n_arr(lo=0, hi=9))
def _(inp):
    a = ints(L(inp)[1])
    return str(len(a) - 1 - a[::-1].index(max(a)) + 1)


@problem("B-007-3", gen=g_n_arr(lo=-30, hi=30))
def _(inp):
    return str(max(ints(L(inp)[1])))


@problem("B-007-4", gen=g_n_arr(lo=-9, hi=9))
def _(inp):
    a = ints(L(inp)[1])
    return f"{len(a) - 1 - a[::-1].index(min(a))} {min(a)}"


@problem("B-007-5", gen=g_n_arr(lo=-9, hi=30))
def _(inp):
    a = ints(L(inp)[1])
    return f"{max(a)} {a.index(max(a)) + 1}"


# ── B-008 · counting ────────────────────────────────────────────────────────
@problem("B-008-1", gen=g_head_arr(lambda r, n: [r.randint(-10, 10)], lo=-15, hi=15))
def _(inp):
    n, t = ints(L(inp)[0])
    return str(sum(1 for v in ints(L(inp)[1]) if v > t))


@problem("B-008-2", gen=g_n_arr(lo=-20, hi=20))
def _(inp):
    return str(sum(1 for v in ints(L(inp)[1]) if v % 2 != 0))


def _g_decimals(r, i):
    n = size(i)
    vals = [f"{r.randint(-40, 40) / 10:.1f}" for _ in range(n)]
    return nl(n, sp(vals))


@problem("B-008-3", gen=_g_decimals)
def _(inp):
    return str(sum(1 for v in L(inp)[1].split() if float(v) < 0))


@problem("B-008-4", gen=g_head_arr(lambda r, n: [r.choice([1, 2, 3, 5, 7])], lo=-30, hi=30))
def _(inp):
    n, k = ints(L(inp)[0])
    return str(sum(1 for v in ints(L(inp)[1]) if v % k == 0))


def _g_mixedtext(r, i):
    pool = "aB3 zZ!9 Qq#0 mixEd7"
    return pool.split()[i % 4] if i < 4 else "abc"


@problem("B-008-5", gen=_g_mixedtext)
def _(inp):
    return str(sum(1 for c in L(inp)[0] if "A" <= c <= "Z"))


# ── B-009 · conditional accumulation ────────────────────────────────────────
@problem("B-009-1", gen=g_n_arr(lo=-20, hi=20))
def _(inp):
    a = ints(L(inp)[1])
    return str(sum(v for j, v in enumerate(a) if j % 2 == 0 and v > 0))


@problem("B-009-2", gen=g_n_arr(sizes=(2, 3, 6, 9), lo=0, hi=1))
def _(inp):
    a = ints(L(inp)[1])
    picks = [a[j] for j in range(2, len(a), 3)]
    return "1" if all(picks) else "0"


@problem("B-009-3", gen=g_head_arr(lambda r, n: [r.choice([1, 2, 3, 5])], lo=0, hi=400))
def _(inp):
    n, k = ints(L(inp)[0])
    return str(sum(sum(int(c) for c in str(v)) for v in ints(L(inp)[1]) if v % k == 0))


@problem("B-009-4", gen=g_head_arr(lambda r, n: [r.choice([0, 2, 5, 40])], lo=-20, hi=20))
def _(inp):
    n, t = ints(L(inp)[0])
    keep = [v for v in ints(L(inp)[1]) if abs(v) <= t]
    return f"{len(keep)} {sum(keep)}"


def _g_coins(r, i):
    n = size(i)
    return nl(n, sp(arr(r, n, 0, 12)), "".join(r.choice("HT") for _ in range(n)))


@problem("B-009-5", gen=_g_coins)
def _(inp):
    vals = ints(L(inp)[1])
    lab = L(inp)[2]
    return str(sum(v for v, c in zip(vals, lab) if c == "H" and v % 2 == 0))


# ── B-010 · first occurrence searches ───────────────────────────────────────
@problem("B-010-1", gen=g_head_arr(lambda r, n: [r.randint(1, 6)], lo=1, hi=6))
def _(inp):
    n, t = ints(L(inp)[0])
    a = ints(L(inp)[1])
    return str(a.index(t) + 1 if t in a else -1)


@problem("B-010-2", gen=g_head_arr(lambda r, n: [r.randint(150, 200)], lo=140, hi=210))
def _(inp):
    n, hh = ints(L(inp)[0])
    for j, v in enumerate(ints(L(inp)[1])):
        if v > hh:
            return str(j)
    return "NONE"


@problem("B-010-3", gen=g_head_arr(lambda r, n: [r.randint(1, 5)], lo=1, hi=5))
def _(inp):
    n, c = ints(L(inp)[0])
    a = ints(L(inp)[1])
    return str(a.index(c) + 1 if c in a else 0)


@problem("B-010-4", gen=g_head_arr(lambda r, n: [r.randint(0, 100)], lo=0, hi=100))
def _(inp):
    n, p = ints(L(inp)[0])
    for j, v in enumerate(ints(L(inp)[1])):
        if v >= p:
            return str(j + 1)
    return "NO"


@problem("B-010-5", gen=g_n_arr(lo=0, hi=6))
def _(inp):
    a = ints(L(inp)[1])
    for j in range(len(a) - 1):
        if a[j] < a[j + 1]:
            return str(j + 1)
    return "-1"


# ── B-011 · adjacency properties ────────────────────────────────────────────
def _g_maybe_sorted(sizes=(1, 3, 6, 9), lo=-9, hi=9, head=None):
    def gen(r, i):
        n = size(i, sizes)
        a = arr(r, n, lo, hi)
        if i % 2:
            a.sort()
        pre = list(head(r, n)) if head else []
        return nl(sp([n] + pre), sp(a))
    return gen


@problem("B-011-1", gen=_g_maybe_sorted())
def _(inp):
    a = ints(L(inp)[1])
    return yn(all(a[j] <= a[j + 1] for j in range(len(a) - 1)))


@problem("B-011-2", gen=_g_maybe_sorted(lo=0, hi=9, head=lambda r, n: [r.choice([0, 1, 3, 20])]))
def _(inp):
    n, k = ints(L(inp)[0])
    a = ints(L(inp)[1])
    return yn(all(abs(a[j + 1] - a[j]) <= k for j in range(n - 1)))


@problem("B-011-3", gen=g_str(sizes=(1, 4, 6, 9), alpha="01"))
def _(inp):
    s = L(inp)[0]
    return yn(all(s[j] != s[j + 1] for j in range(len(s) - 1)))


@problem("B-011-4", gen=_g_maybe_sorted(lo=0, hi=20, head=lambda r, n: [r.choice([0, 1, 4, 100])]))
def _(inp):
    n, d = ints(L(inp)[0])
    a = ints(L(inp)[1])
    for j in range(n - 1):
        if abs(a[j + 1] - a[j]) <= d:
            return str(j + 1)
    return "-1"


@problem("B-011-5", gen=_g_wordlist(alpha="ab", wlen=(1, 2)))
def _(inp):
    w = L(inp)[1].split()
    for j in range(len(w) - 1):
        if w[j] == w[j + 1]:
            return str(j + 1)
    return "OK"


# ── B-012 · best adjacent pair ──────────────────────────────────────────────
@problem("B-012-1", gen=g_n_arr(sizes=(2, 3, 6, 9), lo=-30, hi=30))
def _(inp):
    a = ints(L(inp)[1])
    return str(max(a[j] + a[j + 1] for j in range(len(a) - 1)))


@problem("B-012-2", gen=g_n_arr(sizes=(2, 3, 6, 9), lo=-15, hi=15))
def _(inp):
    a = ints(L(inp)[1])
    d = [abs(a[j + 1] - a[j]) for j in range(len(a) - 1)]
    best = min(d)
    return f"{best} {d.index(best) + 1}"


@problem("B-012-3", gen=g_n_arr(sizes=(2, 3, 6, 9), lo=-20, hi=20))
def _(inp):
    a = ints(L(inp)[1])
    return str(max(a[j] * a[j + 1] for j in range(len(a) - 1)))


@problem("B-012-4", gen=g_n_arr(sizes=(2, 3, 6, 9), lo=-20, hi=20))
def _(inp):
    a = ints(L(inp)[1])
    s = [a[j] + a[j + 1] for j in range(len(a) - 1)]
    j = s.index(max(s))
    return f"{j + 1} {j + 2}"


@problem("B-012-5", gen=g_n_arr(sizes=(2, 3, 6, 9), lo=-20, hi=20))
def _(inp):
    a = ints(L(inp)[1])
    s = [abs(a[j] + a[j + 1]) for j in range(len(a) - 1)]
    j = s.index(min(s))
    return f"{a[j]} {a[j + 1]}"


# ── B-013 · fixed-order censuses ────────────────────────────────────────────
@problem("B-013-1", gen=g_str(sizes=(1, 4, 7, 10), alpha="0123459"))
def _(inp):
    s = RL(inp)[0]
    return sp(s.count(str(d)) for d in range(10))


@problem("B-013-2", gen=g_n_str(sizes=(1, 4, 7, 10), alpha="abcmz"))
def _(inp):
    s = L(inp)[1]
    return sp(s.count(chr(ord("a") + j)) for j in range(26))


_COLOURS6 = ["red", "orange", "yellow", "green", "blue", "purple"]


def _g_pick(pool, sizes=(1, 3, 6, 9)):
    def gen(r, i):
        n = size(i, sizes)
        return nl(n, sp(r.choice(pool) for _ in range(n)))
    return gen


@problem("B-013-3", gen=_g_pick(_COLOURS6))
def _(inp):
    got = L(inp)[1].split()
    return sp(got.count(c) for c in _COLOURS6)


_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


@problem("B-013-4", gen=_g_pick(_DAYS))
def _(inp):
    got = L(inp)[1].split()
    return sp(got.count(d) for d in _DAYS)


@problem("B-013-5", gen=g_n_arr(lo=1, hi=5))
def _(inp):
    got = ints(L(inp)[1])
    return sp(got.count(v) for v in range(1, 6))


# ── B-014 · modes, with explicit tie rules ──────────────────────────────────
@problem("B-014-1", gen=g_n_arr(lo=0, hi=4))
def _(inp):
    got = ints(L(inp)[1])
    return str(min(range(10), key=lambda d: (-got.count(d), d)))


_COLOURS8 = ["red", "orange", "yellow", "green", "blue", "indigo", "violet", "brown"]


@problem("B-014-2", gen=_g_pick(_COLOURS8))
def _(inp):
    got = L(inp)[1].split()
    return min(_COLOURS8, key=lambda c: (got.count(c), _COLOURS8.index(c)))


@problem("B-014-3", gen=g_n_arr(lo=1, hi=5))
def _(inp):
    got = ints(L(inp)[1])
    return str(max(range(1, 6), key=lambda v: (got.count(v), v)))


@problem("B-014-4", gen=_g_pick(list("ABCD")))
def _(inp):
    got = L(inp)[1].split()
    return min("ABCD", key=lambda c: (-got.count(c), c))


_EMOJI = [f"emoji{j}" for j in range(1, 11)]


@problem("B-014-5", gen=_g_pick(_EMOJI))
def _(inp):
    got = L(inp)[1].split()
    return min(_EMOJI, key=lambda e: (got.count(e), _EMOJI.index(e)))


# ── B-015 · palindromes ─────────────────────────────────────────────────────
@problem("B-015-1", gen=g_str(sizes=(0, 3, 4, 6), alpha="abA"))
def _(inp):
    s = RL(inp)[0]
    return yn(s == s[::-1])


_PHRASES = [
    "step on no pets", "was it a car or a cat i saw", "not, a palindrome",
    "ab, , ba", "madam, im adam", "abc, def", "xyz zyx", "one, two",
]


def _g_phrase(r, i):
    return _PHRASES[i % len(_PHRASES)]


@problem("B-015-2", gen=_g_phrase)
def _(inp):
    s = "".join(c for c in RL(inp)[0] if c not in ", ")
    return yn(s == s[::-1])


def _g_maybe_pal(r, i):
    n = (0, 2, 4, 5)[i % 4]
    if n == 0:
        return "0"
    a = arr(r, n, 0, 3)
    if i % 2:
        a = a[:(n + 1) // 2] + a[:n // 2][::-1]
    return nl(n, sp(a))


@problem("B-015-3", gen=_g_maybe_pal)
def _(inp):
    ls = L(inp)
    n = int(ls[0])
    a = ints(ls[1]) if n else []
    return yn(a == a[::-1])


@problem("B-015-4", gen=g_str(sizes=(1, 3, 4, 6), alpha="aA1b"))
def _(inp):
    s = RL(inp)[0].lower()
    return yn(s == s[::-1])


@problem("B-015-5", gen=g_str(sizes=(0, 3, 4, 6), alpha="abA"))
def _(inp):
    s = RL(inp)[0]
    for j in range(len(s) // 2):
        if s[j] != s[-1 - j]:
            return str(j + 1)
    return "YES"


# ── B-016 · mirror-pair reports ─────────────────────────────────────────────
@problem("B-016-1", gen=g_str(sizes=(1, 3, 4, 6), alpha="abc"))
def _(inp):
    s = RL(inp)[0]
    return str(sum(1 for j in range(len(s) // 2) if s[j] != s[-1 - j]))


@problem("B-016-2", gen=g_n_arr(lo=-9, hi=9))
def _(inp):
    a = ints(L(inp)[1])
    return str(sum(abs(a[j] - a[-1 - j]) for j in range(len(a) // 2)))


@problem("B-016-3", gen=g_str(sizes=(1, 3, 4, 6), alpha="01"))
def _(inp):
    s = RL(inp)[0]
    return sp(j + 1 for j in range(len(s) // 2) if s[j] != s[-1 - j])


@problem("B-016-4", gen=g_str(sizes=(1, 3, 4, 6), alpha="ACGT"))
def _(inp):
    s = RL(inp)[0]
    return str(sum(1 for j in range(len(s) // 2) if s[j] != s[-1 - j]))


@problem("B-016-5", gen=g_n_arr(lo=0, hi=3))
def _(inp):
    a = ints(L(inp)[1])
    n = len(a)
    bad = [j for j in range(n // 2) if a[j] != a[n - 1 - j]]
    return nl(len(bad), *[f"{j + 1} {n - j}" for j in bad])


# ── B-017 · character-class breakdowns ──────────────────────────────────────
def _g_text(*pool):
    def gen(r, i):
        return pool[i % len(pool)]
    return gen


_VOW = set("aeiouAEIOU")


@problem("B-017-1", gen=_g_text("Quiz #7: go!", "aA", "()[]{}", "b1", "Why? 3 cats;", "u-2", "[x]", "Oi!"))
def _(inp):
    s = RL(inp)[0]
    punct = set(".,!?:;-'\"()[]{}")
    v = sum(1 for c in s if c in _VOW)
    cons = sum(1 for c in s if c.isalpha() and c not in _VOW)
    d = sum(1 for c in s if c.isdigit())
    p = sum(1 for c in s if c in punct)
    return sp([v, cons, d, p])


@problem("B-017-2", gen=_g_text("Ada Lovelace 1815", "  ", "aA1", "  Zz  99  ", "Qq 7", "x", "AB cd 90", " 1 "))
def _(inp):
    s = RL(inp)[0]
    return sp([sum(c.isupper() for c in s), sum(c.islower() for c in s),
               s.count(" "), sum(c.isdigit() for c in s)])


@problem("B-017-3", gen=_g_text("<tag id=7>", "b", "{}", "warn: 3 hits (x)", "a=1&b=2", "[[]]", "no symbols", "9)"))
def _(inp):
    s = RL(inp)[0]
    br = set("[](){}<>")
    letters = sum(c.isalpha() for c in s)
    digits = sum(c.isdigit() for c in s)
    brackets = sum(1 for c in s if c in br)
    other = sum(1 for c in s if not c.isalnum() and c not in br and not c.isspace())
    return sp([letters, digits, brackets, other])


@problem("B-017-4", gen=_g_text("Hunter2!", "aA", "_-+=", "Zz99$$", "pass", "X1^", "%%%", "Aa1!"))
def _(inp):
    s = RL(inp)[0]
    spec = set("!@#$%^&*()-_+=")
    return sp([sum(c.isupper() for c in s), sum(c.islower() for c in s),
               sum(c.isdigit() for c in s), sum(1 for c in s if c in spec)])


@problem("B-017-5", gen=_g_text("ax9,by8;cz7", "e", ";;,,", "AEI123bcd", "u1;v2", "xyz", "1,2,3", "Oo,Ee;9"))
def _(inp):
    s = RL(inp)[0]
    v = sum(1 for c in s if c in _VOW)
    cons = sum(1 for c in s if c.isalpha() and c not in _VOW)
    sep = sum(1 for c in s if c in ",;")
    d = sum(1 for c in s if c.isdigit())
    return sp([v, cons, sep, d])


# ── B-018 · digits of one big integer ───────────────────────────────────────
def _g_bigint(r, i):
    mag = [0, r.randint(1, 9), r.randint(10, 9999), r.randint(10 ** 8, 10 ** 12)][i % 4]
    sign = "-" if i % 2 and mag else ""
    return f"{sign}{mag}"


def _digits(inp):
    return [int(c) for c in RL(inp)[0].strip().lstrip("-")]


@problem("B-018-1", gen=_g_bigint)
def _(inp):
    return str(sum(_digits(inp)))


@problem("B-018-2", gen=_g_bigint)
def _(inp):
    p = 1
    for d in _digits(inp):
        p *= d
    return str(p)


def _g_bigint_digit(r, i):
    return nl(_g_bigint(r, i), r.randint(0, 9))


@problem("B-018-3", gen=_g_bigint_digit)
def _(inp):
    ls = L(inp)
    return str(ls[0].strip().lstrip("-").count(ls[1].strip()))


@problem("B-018-4", gen=_g_bigint)
def _(inp):
    s = RL(inp)[0].strip()
    neg = s.startswith("-")
    v = int(s.lstrip("-")[::-1])
    return f"-{v}" if neg and v else str(v)


@problem("B-018-5", gen=_g_bigint)
def _(inp):
    return str(sum(1 for d in _digits(inp) if d % 2 == 0))


# ── B-019 · one-integer classifications ─────────────────────────────────────
@problem("B-019-1", gen=_g_bigint)
def _(inp):
    return "EVEN" if int(RL(inp)[0]) % 2 == 0 else "ODD"


@problem("B-019-2", gen=_g_bigint)
def _(inp):
    return "DIVISIBLE" if int(RL(inp)[0]) % 3 == 0 else "NOT DIVISIBLE"


def _g_window(r, i):
    lo = r.randint(-20, 20)
    hi = lo + r.choice([0, 1, 10])
    x = r.choice([lo, hi, lo - 1, hi + 1, r.randint(-25, 25)])
    return sp([x, lo, hi])


@problem("B-019-3", gen=_g_window)
def _(inp):
    x, lo, hi = ints(RL(inp)[0])
    return "INSIDE" if lo <= x <= hi else "OUTSIDE"


def _g_year(r, i):
    return str(r.choice([1996, 1800, 2400, 2100, 4, -8, -1900, 12, 2019, 1600]))


@problem("B-019-4", gen=_g_year)
def _(inp):
    y = int(RL(inp)[0])
    return "LEAP" if y % 4 == 0 and (y % 100 != 0 or y % 400 == 0) else "COMMON"


@problem("B-019-5", gen=_g_bigint)
def _(inp):
    v = int(RL(inp)[0])
    return "POSITIVE" if v > 0 else "ZERO" if v == 0 else "NEGATIVE"


# ── B-020 · divisors ────────────────────────────────────────────────────────
def _g_smallint(hi=100000):
    def gen(r, i):
        return str([1, r.randint(2, 30), r.randint(31, 500), r.randint(501, hi)][i % 4])
    return gen


def _divs(n):
    return [d for d in range(1, n + 1) if n % d == 0]


@problem("B-020-1", gen=_g_smallint())
def _(inp):
    return str(len(_divs(int(RL(inp)[0]))))


@problem("B-020-2", gen=_g_smallint())
def _(inp):
    n = int(RL(inp)[0])
    return sp(d for d in _divs(n) if d < n)


@problem("B-020-3", gen=_g_smallint())
def _(inp):
    n = int(RL(inp)[0])
    for d in range(2, n + 1):
        if n % d == 0:
            return str(d)
    return "1"


@problem("B-020-4", gen=_g_smallint())
def _(inp):
    n = int(RL(inp)[0])
    return str(sum(d for d in _divs(n) if d < n))


def _g_n_k(r, i):
    n = [1, r.randint(2, 30), r.randint(31, 500), r.randint(501, 5000)][i % 4]
    return sp([n, r.choice([1, 2, 6, 1000])])


@problem("B-020-5", gen=_g_n_k)
def _(inp):
    n, k = ints(RL(inp)[0])
    return str(sum(1 for d in _divs(n) if d <= k))


# ── B-021 · grid transforms ─────────────────────────────────────────────────
def _grid(inp, start, rows):
    ls = L(inp)
    return [ints(ls[start + j]) for j in range(rows)]


def _g_grid(head=None, sizes=((1, 1), (2, 2), (3, 2), (3, 4)), lo=-9, hi=9, tail=None):
    def gen(r, i):
        rr, cc = sizes[i % len(sizes)]
        first = [rr, cc] + (list(head(r)) if head else [])
        out = [sp(first)] + [sp(arr(r, cc, lo, hi)) for _ in range(rr)]
        if tail:
            out.append(sp(tail(r, cc)))
        return nl(*out)
    return gen


@problem("B-021-1", gen=_g_grid(head=lambda r: [r.choice([-3, 0, 1, 5])]))
def _(inp):
    rr, cc, k = ints(L(inp)[0])
    return nl(*[sp(v * k for v in row) for row in _grid(inp, 1, rr)])


@problem("B-021-2", gen=_g_grid(head=lambda r: [r.choice([-1, 0, 7])]))
def _(inp):
    rr, cc, b = ints(L(inp)[0])
    g = _grid(inp, 1, rr)
    for a in range(rr):
        for c in range(cc):
            if a in (0, rr - 1) or c in (0, cc - 1):
                g[a][c] = b
    return nl(*[sp(row) for row in g])


def _g_square(r, i):
    n = (1, 2, 3, 4)[i % 4]
    return nl(n, *[sp(arr(r, n, -9, 9)) for _ in range(n)])


@problem("B-021-3", gen=_g_square)
def _(inp):
    n = int(L(inp)[0])
    g = _grid(inp, 1, n)
    return nl(*[sp(g[a][c] for a in range(n)) for c in range(n)])


@problem("B-021-4", gen=_g_grid())
def _(inp):
    rr, cc = ints(L(inp)[0])
    return nl(*[sp(-v if (a + c) % 2 == 0 else v for c, v in enumerate(row, 1))
                for a, row in enumerate(_grid(inp, 1, rr), 1)])


@problem("B-021-5", gen=_g_grid(tail=lambda r, c: arr(r, c, -5, 5)))
def _(inp):
    rr, cc = ints(L(inp)[0])
    g = _grid(inp, 1, rr)
    f = ints(L(inp)[rr + 1])
    return nl(*[sp(v * f[c] for c, v in enumerate(row)) for row in g])


# ── B-022 · row and column extremes ─────────────────────────────────────────
def _g_grid_r0(r, i):
    rr, cc = ((0, 3), (1, 1), (2, 2), (3, 4))[i % 4]
    return nl(sp([rr, cc]), *[sp(arr(r, cc, -9, 9)) for _ in range(rr)])


@problem("B-022-1", gen=_g_grid_r0)
def _(inp):
    rr, cc = ints(L(inp)[0])
    if rr == 0:
        return "-1"
    sums = [sum(row) for row in _grid(inp, 1, rr)]
    return str(sums.index(max(sums)) + 1)


def _g_grid_c0(r, i):
    rr, cc = ((1, 0), (1, 1), (2, 3), (3, 2))[i % 4]
    body = [sp(arr(r, cc, -9, 9)) for _ in range(rr)] if cc else []
    return nl(sp([rr, cc]), *body)


@problem("B-022-2", gen=_g_grid_c0)
def _(inp):
    rr, cc = ints(L(inp)[0])
    if cc == 0:
        return ""
    g = _grid(inp, 1, rr)
    return sp(max(g[a][c] for a in range(rr)) for c in range(cc))


def _g_chargrid(r, i):
    rr, cc = ((0, 4), (1, 1), (2, 3), (4, 2))[i % 4]
    return nl(sp([rr, cc]), *[word(r, cc, ".#") for _ in range(rr)])


@problem("B-022-3", gen=_g_chargrid)
def _(inp):
    rr, cc = ints(L(inp)[0])
    ls = L(inp)
    return sp(ls[1 + j].count("#") for j in range(rr))


@problem("B-022-4", gen=_g_grid_r0)
def _(inp):
    rr, cc = ints(L(inp)[0])
    if rr == 0:
        return "-1"
    mx = [max(row) for row in _grid(inp, 1, rr)]
    return str(len(mx) - mx[::-1].index(min(mx)))


@problem("B-022-5", gen=_g_grid_c0)
def _(inp):
    rr, cc = ints(L(inp)[0])
    if cc == 0:
        return "-1"
    g = _grid(inp, 1, rr)
    mx = [max(g[a][c] for a in range(rr)) for c in range(cc)]
    return str(mx.index(min(mx)) + 1)


# ── B-023 · walking a grid ──────────────────────────────────────────────────
_DELTA = {"N": (-1, 0), "S": (1, 0), "E": (0, 1), "W": (0, -1)}


def _g_walk(zero=False, mlen=(1, 3, 6, 9)):
    def gen(r, i):
        rr, cc = ((1, 1), (2, 2), (3, 4), (5, 5))[i % 4]
        lo = 0 if zero else 1
        a = r.randint(lo, rr - 1 + lo)
        c = r.randint(lo, cc - 1 + lo)
        return nl(sp([rr, cc, a, c]), word(r, size(i, mlen), "NSEW"))
    return gen


@problem("B-023-1", gen=_g_walk())
def _(inp):
    rr, cc, a, c = ints(L(inp)[0])
    for m in L(inp)[1].strip():
        da, dc = _DELTA[m]
        if 1 <= a + da <= rr and 1 <= c + dc <= cc:
            a, c = a + da, c + dc
    return f"{a} {c}"


@problem("B-023-2", gen=_g_walk())
def _(inp):
    rr, cc, a, c = ints(L(inp)[0])
    for m in L(inp)[1].strip():
        da, dc = _DELTA[m]
        a = (a - 1 + da) % rr + 1
        c = (c - 1 + dc) % cc + 1
    return f"{a} {c}"


@problem("B-023-3", gen=_g_walk(zero=True, mlen=(1, 3, 5, 7)))
def _(inp):
    rr, cc, a, c = ints(L(inp)[0])
    path = [(a, c)]
    for m in L(inp)[1].strip():
        da, dc = _DELTA[m]
        if 0 <= a + da < rr and 0 <= c + dc < cc:
            a, c = a + da, c + dc
        path.append((a, c))
    return nl(*[f"{x} {y}" for x, y in path])


@problem("B-023-4", gen=_g_walk())
def _(inp):
    rr, cc, a0, c0 = ints(L(inp)[0])
    a, c = a0, c0
    for m in L(inp)[1].strip():
        da, dc = _DELTA[m]
        a = (a - 1 + da) % rr + 1
        c = (c - 1 + dc) % cc + 1
    return str(abs(a - a0) + abs(c - c0))


@problem("B-023-5", gen=_g_walk())
def _(inp):
    rr, cc, a, c = ints(L(inp)[0])
    seen = {(a, c)}
    for m in L(inp)[1].strip():
        da, dc = _DELTA[m]
        if 1 <= a + da <= rr and 1 <= c + dc <= cc:
            a, c = a + da, c + dc
        seen.add((a, c))
    return str(len(seen))


# ── B-024 · running a ledger ────────────────────────────────────────────────
def _g_start_n(lo=-30, hi=30, s_lo=0, s_hi=50):
    def gen(r, i):
        n = size(i)
        return nl(sp([r.randint(s_lo, s_hi), n]), sp(arr(r, n, lo, hi)))
    return gen


@problem("B-024-1", gen=_g_start_n())
def _(inp):
    bal, n = ints(L(inp)[0])
    for d in ints(L(inp)[1]):
        bal = max(0, bal + d)
    return str(bal)


@problem("B-024-2", gen=_g_start_n(s_lo=-30, s_hi=30))
def _(inp):
    cur, n = ints(L(inp)[0])
    best = cur
    for d in ints(L(inp)[1]):
        cur += d
        best = max(best, cur)
    return str(best)


@problem("B-024-3", gen=_g_start_n(s_lo=-20, s_hi=40))
def _(inp):
    cur, n = ints(L(inp)[0])
    for j, d in enumerate(ints(L(inp)[1]), 1):
        cur += d
        if cur < 0:
            return str(j)
    return "-1"


@problem("B-024-4", "B-024-5", gen=_g_start_n(s_lo=0, s_hi=60))
def _(inp):
    cur, n = ints(L(inp)[0])
    for d in ints(L(inp)[1]):
        cur = max(0, cur + d)
    return str(cur)


# ── B-025 · sorting to an externally supplied order ─────────────────────────
def _g_order(pool=(1, 2, 3, 5)):
    def gen(r, i):
        n = size(i)
        a = [r.choice(pool) for _ in range(n)]
        p = sorted(set(a))
        r.shuffle(p)
        return nl(n, sp(a), len(p), sp(p))
    return gen


@problem("B-025-1", gen=_g_order())
def _(inp):
    ls = L(inp)
    a = ints(ls[1])
    p = ints(ls[3])
    return sp(sorted(a, key=p.index))


def _g_alien(r, i):
    n = size(i)
    ws = [word(r, r.randint(1, 3), "abc") for _ in range(n)]
    alpha = list("abcdefghijklmnopqrstuvwxyz")
    r.shuffle(alpha)
    return nl(n, sp(ws), "".join(alpha))


@problem("B-025-2", gen=_g_alien)
def _(inp):
    ls = L(inp)
    order = {c: j for j, c in enumerate(ls[2].strip())}
    return sp(sorted(ls[1].split(), key=lambda w: [order[c] for c in w]))


def _g_names_dir(r, i):
    n = size(i)
    ws = [word(r, r.randint(1, 5), "abcde") for _ in range(n)]
    return nl(n, sp(ws), r.choice(["ASC", "DESC"]))


@problem("B-025-3", gen=_g_names_dir)
def _(inp):
    ls = L(inp)
    ws = ls[1].split()
    desc = ls[2].strip() == "DESC"
    return sp(sorted(ws, key=lambda w: -len(w) if desc else len(w)))


def _g_priority(r, i):
    n = size(i)
    firsts = list("abcz")
    codes = [r.choice(firsts) + str(r.randint(1, 9)) for _ in range(n)]
    r.shuffle(firsts)
    return nl(n, sp(codes), "".join(firsts))


@problem("B-025-4", gen=_g_priority)
def _(inp):
    ls = L(inp)
    rank = ls[2].strip()
    return sp(sorted(ls[1].split(), key=lambda c: rank.index(c[0])))


def _g_order_words(r, i):
    n = size(i)
    pool = ["red", "green", "blue", "grey"]
    a = [r.choice(pool) for _ in range(n)]
    p = sorted(set(a))
    r.shuffle(p)
    return nl(n, sp(a), len(p), sp(p))


@problem("B-025-5", gen=_g_order_words)
def _(inp):
    ls = L(inp)
    p = ls[3].split()
    return sp(sorted(ls[1].split(), key=p.index))


# ── B-026 · generated sequences ─────────────────────────────────────────────
@problem("B-026-1", gen=lambda r, i: sp([size(i, (1, 3, 6, 9)), r.randint(-20, 20), r.randint(-9, 9)]))
def _(inp):
    n, s, d = ints(RL(inp)[0])
    return sp(s + j * d for j in range(n))


@problem("B-026-2", gen=lambda r, i: sp([size(i, (1, 2, 5, 8)), r.randint(-20, 20), r.randint(-20, 20)]))
def _(inp):
    n, x, y = ints(RL(inp)[0])
    return sp(x if j % 2 == 0 else y for j in range(n))


def _g_pattern(r, i):
    n = size(i, (1, 4, 7, 10))
    k = r.randint(1, 5)
    return nl(sp([n, k]), sp(arr(r, k, -20, 20)))


@problem("B-026-3", gen=_g_pattern)
def _(inp):
    n, k = ints(L(inp)[0])
    pat = ints(L(inp)[1])
    return sp(pat[j % k] for j in range(n))


@problem("B-026-4", gen=lambda r, i: str(size(i, (6, 8, 9, 11, 12, 13, 14, 15))))
def _(inp):
    n = int(RL(inp)[0])
    return sp(j * (j + 1) for j in range(1, n + 1))


@problem("B-026-5", gen=lambda r, i: sp([size(i, (1, 4, 7, 10)), r.randint(1, 4), r.randint(-20, 20), r.randint(-9, 9)]))
def _(inp):
    n, rr, s, d = ints(RL(inp)[0])
    return sp(s + (j // rr) * d for j in range(n))


# ── B-027 · running aggregates over a prefix ────────────────────────────────
@problem("B-027-1", gen=g_n_arr(lo=-20, hi=20))
def _(inp):
    out, t = [], 0
    for v in ints(L(inp)[1]):
        t += v
        out.append(t)
    return sp(out)


@problem("B-027-2", gen=g_n_arr(lo=-20, hi=20))
def _(inp):
    out, best = [], None
    for v in ints(L(inp)[1]):
        best = v if best is None else max(best, v)
        out.append(best)
    return sp(out)


@problem("B-027-3", gen=g_n_arr(lo=0, hi=1))
def _(inp):
    out, t = [], 0
    for v in ints(L(inp)[1]):
        t += v
        out.append(t % 2)
    return sp(out)


@problem("B-027-4", gen=g_head_arr(lambda r, n: [r.choice([1, 2, 3, 7])], lo=-20, hi=20))
def _(inp):
    n, k = ints(L(inp)[0])
    out, t = [], 0
    for v in ints(L(inp)[1]):
        t += v % k == 0
        out.append(t)
    return sp(out)


@problem("B-027-5", gen=g_head_arr(lambda r, n: [r.randint(-10, 10)], lo=-20, hi=20))
def _(inp):
    n, thr = ints(L(inp)[0])
    out, t = [], 0
    for v in ints(L(inp)[1]):
        t += v > thr
        out.append(t)
    return sp(out)


# ── B-028 · whitespace-tolerant token edits ─────────────────────────────────
_TOKENS = ["hi", "There", "9x", "wow!", "abc", "Q", "no-go", "e2e"]


def _g_line(r, i):
    n = size(i, (1, 2, 4, 6))
    gap = " " * r.randint(1, 3)
    return gap.join(r.choice(_TOKENS) for _ in range(n))


@problem("B-028-1", gen=_g_line)
def _(inp):
    return sp(t[0].upper() + t[1:].lower() for t in RL(inp)[0].split())


@problem("B-028-2", gen=_g_line)
def _(inp):
    return sp(t[::-1] for t in RL(inp)[0].split())


def _g_line_swap(r, i):
    return nl(_g_line(r, i), sp([r.choice(_TOKENS), r.choice(_TOKENS)]))


@problem("B-028-3", gen=_g_line_swap)
def _(inp):
    ls = RL(inp)
    a, b = ls[1].split()
    return sp(b if t == a else t for t in ls[0].split())


@problem("B-028-4", gen=_g_line)
def _(inp):
    return sp(f"{t}_{j}" for j, t in enumerate(RL(inp)[0].split(), 1))


@problem("B-028-5", gen=_g_line)
def _(inp):
    return sp(t.upper() for t in RL(inp)[0].split())


# ── B-029 · circular arrays ─────────────────────────────────────────────────
@problem("B-029-1", gen=g_n_arr(lo=1, hi=4))
def _(inp):
    a = ints(L(inp)[1])
    n = len(a)
    for j in range(n):
        if a[j] == a[(j + 1) % n]:
            return str(j)
    return "-1"


@problem("B-029-2", gen=g_head_arr(lambda r, n: [r.randint(0, n - 1)], lo=1, hi=6))
def _(inp):
    n, k = ints(L(inp)[0])
    a = ints(L(inp)[1])
    return str(sum(1 for j in range(n) if a[(j + k) % n] > a[j]))


def _g_ring(r, i):
    s = word(r, size(i, (1, 3, 5, 8)), "abcz")
    return nl(s, r.randint(0, len(s) - 1))


@problem("B-029-3", gen=_g_ring)
def _(inp):
    s = L(inp)[0]
    p = int(L(inp)[1])
    return s[p:] + s[:p]


@problem("B-029-4", gen=g_n_arr(lo=1, hi=4))
def _(inp):
    a = ints(L(inp)[1])
    n = len(a)
    for j in range(n):
        if a[j] > a[(j - 1) % n] and a[j] > a[(j + 1) % n]:
            return str(j)
    return "-1"


@problem("B-029-5", gen=g_head_arr(lambda r, n: [r.randint(0, n - 1)], lo=-9, hi=9))
def _(inp):
    n, k = ints(L(inp)[0])
    a = ints(L(inp)[1])
    return sp(f"({a[j]},{a[(j + k) % n]})" for j in range(n))


# ── B-030 · pairing two sequences ───────────────────────────────────────────
def _g_two_arr(lo=-20, hi=20):
    def gen(r, i):
        n = size(i)
        return nl(n, sp(arr(r, n, lo, hi)), sp(arr(r, n, lo, hi)))
    return gen


@problem("B-030-1", gen=_g_two_arr())
def _(inp):
    ls = L(inp)
    return sp(x + y for x, y in zip(ints(ls[1]), ints(ls[2])))


@problem("B-030-2", gen=_g_two_arr())
def _(inp):
    ls = L(inp)
    return sp(x - y for x, y in zip(ints(ls[1]), ints(ls[2])))


def _g_two_str(r, i):
    n = size(i, (1, 3, 5, 7))
    return nl(word(r, n, "abcX"), word(r, n, "abcX"))


@problem("B-030-3", gen=_g_two_str)
def _(inp):
    s, t = L(inp)[0], L(inp)[1]
    return "".join("1" if x == y else "0" for x, y in zip(s, t))


@problem("B-030-4", gen=_g_two_arr(lo=1, hi=30))
def _(inp):
    ls = L(inp)
    return sp(max(x, y) for x, y in zip(ints(ls[1]), ints(ls[2])))


@problem("B-030-5", gen=_g_two_str)
def _(inp):
    s, t = L(inp)[0], L(inp)[1]
    return "".join(x + y for x, y in zip(s, t))
