from .common import *  # noqa: F401,F403


# ── G-001 · longest run with no repeats ─────────────────────────────────────
def _longest_unique(seq):
    """(start, end) of the earliest longest repeat-free run, 0-based inclusive."""
    best = (0, 0)
    lo = 0
    seen = {}
    for hi, v in enumerate(seq):
        if v in seen and seen[v] >= lo:
            lo = seen[v] + 1
        seen[v] = hi
        if hi - lo > best[1] - best[0]:
            best = (lo, hi)
    return best


@problem("G-001-1", gen=g_str(sizes=(1, 3, 6, 9), alpha="abcd"))
def _(inp):
    lo, hi = _longest_unique(RL(inp)[0])
    return str(hi - lo + 1)


@problem("G-001-2", gen=g_n_arr(sizes=(1, 3, 6, 9), lo=1, hi=4))
def _(inp):
    lo, hi = _longest_unique(ints(L(inp)[1]))
    return f"{lo + 1} {hi + 1}"


def _g_colour_list(r, i):
    n = size(i, (1, 3, 6, 9))
    return nl(n, sp(r.choice(["red", "blue", "green", "teal"]) for _ in range(n)))


@problem("G-001-3", gen=_g_colour_list)
def _(inp):
    lo, hi = _longest_unique(L(inp)[1].split())
    return f"{lo} {hi}"


@problem("G-001-4", gen=g_n_arr(sizes=(1, 3, 6, 9), lo=-3, hi=3))
def _(inp):
    lo, hi = _longest_unique(ints(L(inp)[1]))
    return str(hi - lo + 1)


@problem("G-001-5", gen=g_str(sizes=(1, 3, 6, 9), alpha="AB12"))
def _(inp):
    lo, hi = _longest_unique(RL(inp)[0])
    return f"{lo + 1} {hi - lo + 1}"


def _g_two_words(alpha="abc", sizes=((1, 1), (2, 3), (3, 5), (4, 6))):
    def gen(r, i):
        m, n = sizes[i % len(sizes)]
        return nl(word(r, m, alpha), word(r, n, alpha))
    return gen


# ── G-002 · shortest window covering a multiset ─────────────────────────────
def _covers(window, need):
    return all(window.count(k) >= v for k, v in need.items())


def _shortest_cover(seq, need):
    """(lo, hi) 0-based inclusive of the shortest leftmost covering window."""
    n = len(seq)
    best = None
    for lo in range(n):
        for hi in range(lo, n):
            if _covers(seq[lo:hi + 1], need):
                if best is None or (hi - lo, lo) < (best[1] - best[0], best[0]):
                    best = (lo, hi)
                break
    return best


def _counts(seq):
    return {k: seq.count(k) for k in set(seq)}


@problem("G-002-1", gen=_g_two_words(alpha="abc", sizes=((1, 1), (2, 4), (2, 6), (3, 7))))
def _(inp):
    ls = L(inp)
    s, t = ls[0], ls[1]
    best = _shortest_cover(s, _counts(t))
    return s[best[0]:best[1] + 1] if best else "-1"


def _g_multiset(r, i):
    n, m = ((1, 1), (4, 2), (6, 2), (8, 3))[i % 4]
    return nl(sp([n, m]), sp(arr(r, n, 1, 3)), sp(arr(r, m, 1, 3)))


@problem("G-002-2", gen=_g_multiset)
def _(inp):
    ls = L(inp)
    best = _shortest_cover(ints(ls[1]), _counts(ints(ls[2])))
    return f"{best[0] + 1} {best[1] + 1}" if best else "-1"


def _g_shopping(r, i):
    k, n = ((1, 1), (2, 4), (2, 6), (3, 7))[i % 4]
    pool = ["apple", "banana", "kiwi"]
    return nl(sp([k, n]), sp(r.choice(pool) for _ in range(k)),
              sp(r.choice(pool) for _ in range(n)))


@problem("G-002-3", gen=_g_shopping)
def _(inp):
    ls = L(inp)
    best = _shortest_cover(ls[2].split(), _counts(ls[1].split()))
    return f"{best[0] + 1} {best[1] + 1}" if best else "NOT FOUND"


def _g_ab_need(r, i):
    n = size(i, (1, 3, 5, 8))
    s = word(r, n, "AB")
    return nl(s, sp([r.randint(1, 3), r.randint(1, 3)]))


@problem("G-002-4", gen=_g_ab_need)
def _(inp):
    ls = L(inp)
    s = ls[0]
    a, b = ints(ls[1])
    best = _shortest_cover(s, {"A": a, "B": b})
    return f"{best[0] + 1} {best[1] + 1}" if best else "-1"


def _g_letter_reqs(r, i):
    n = size(i, (1, 3, 6, 9))
    s = word(r, n, "ABC")
    letters = r.sample("ABC", r.randint(1, 3))
    reqs = [f"{c} {r.randint(1, 2)}" for c in letters]
    return nl(s, str(len(reqs)), *reqs)


@problem("G-002-5", gen=_g_letter_reqs)
def _(inp):
    ls = L(inp)
    s = ls[0]
    t = int(ls[1])
    need = {}
    for j in range(t):
        c, k = ls[2 + j].split()
        need[c] = int(k)
    best = _shortest_cover(s, need)
    return s[best[0]:best[1] + 1] if best else "NONE"


# ── G-003 · windows with at most K distinct ─────────────────────────────────
def _at_most_k(seq, k):
    """(longest window length, number of windows) with at most k distinct."""
    n = len(seq)
    longest = 0
    count = 0
    for lo in range(n):
        for hi in range(lo, n):
            if len(set(seq[lo:hi + 1])) <= k:
                longest = max(longest, hi - lo + 1)
                count += 1
    return longest, count


@problem("G-003-1", gen=lambda r, i: nl(r.randint(0, 3), word(r, size(i, (1, 3, 6, 9)), "abc")))
def _(inp):
    ls = L(inp)
    return str(_at_most_k(ls[1], int(ls[0]))[0])


def _g_n_k_arr(lo=1, hi=4, kmax=3):
    def gen(r, i):
        n = size(i, (1, 3, 6, 9))
        return nl(sp([n, r.randint(0, kmax)]), sp(arr(r, n, lo, hi)))
    return gen


@problem("G-003-2", "G-003-5", gen=_g_n_k_arr())
def _(inp):
    n, k = ints(L(inp)[0])
    return str(_at_most_k(ints(L(inp)[1]), k)[0])


@problem("G-003-3", gen=_g_n_k_arr())
def _(inp):
    n, k = ints(L(inp)[0])
    return str(_at_most_k(ints(L(inp)[1]), k)[1])


def _g_letters_k(r, i):
    n = size(i, (1, 3, 6, 9))
    return nl(sp([n, r.randint(0, 3)]), sp(r.choice("ABC") for _ in range(n)))


@problem("G-003-4", gen=_g_letters_k)
def _(inp):
    n, k = ints(L(inp)[0])
    return str(_at_most_k(L(inp)[1].split(), k)[0])


# ── G-004 · windows with an exact sum (positive values) ─────────────────────
def _exact_windows(a, s):
    """(lo, hi) 0-based inclusive for every window summing to s."""
    n = len(a)
    out = []
    for lo in range(n):
        t = 0
        for hi in range(lo, n):
            t += a[hi]
            if t == s:
                out.append((lo, hi))
    return out


def _g_sum_target(lo=1, hi=5, sizes=(1, 3, 5, 7)):
    def gen(r, i):
        n = size(i, sizes)
        a = arr(r, n, lo, hi)
        j = r.randint(0, n - 1)
        k = r.randint(j, n - 1)
        target = sum(a[j:k + 1]) if i % 2 else r.randint(1, 20)
        return nl(sp([n, target]), sp(a))
    return gen


@problem("G-004-1", gen=_g_sum_target())
def _(inp):
    n, s = ints(L(inp)[0])
    w = _exact_windows(ints(L(inp)[1]), s)
    return f"{w[0][0] + 1} {w[0][1] + 1}" if w else "-1"


@problem("G-004-2", gen=_g_sum_target())
def _(inp):
    n, s = ints(L(inp)[0])
    return str(len(_exact_windows(ints(L(inp)[1]), s)))


@problem("G-004-3", gen=_g_sum_target())
def _(inp):
    n, s = ints(L(inp)[0])
    w = _exact_windows(ints(L(inp)[1]), s)
    return str(min(hi - lo + 1 for lo, hi in w)) if w else "-1"


@problem("G-004-4", gen=_g_sum_target())
def _(inp):
    n, s = ints(L(inp)[0])
    w = _exact_windows(ints(L(inp)[1]), s)
    return str(max(hi - lo + 1 for lo, hi in w)) if w else "-1"


@problem("G-004-5", gen=_g_sum_target())
def _(inp):
    n, s = ints(L(inp)[0])
    w = _exact_windows(ints(L(inp)[1]), s)
    return sp(lo + 1 for lo, _ in w) if w else "-1"


# ── G-005 · counting subarrays with a given sum ─────────────────────────────
def _count_sum(a, t):
    n = len(a)
    total = 0
    for lo in range(n):
        s = 0
        for hi in range(lo, n):
            s += a[hi]
            total += s == t
    return total


def _g_signed_target(lo=-3, hi=3, sizes=(1, 3, 5, 7)):
    def gen(r, i):
        n = size(i, sizes)
        a = arr(r, n, lo, hi)
        j = r.randint(0, n - 1)
        target = sum(a[j:r.randint(j, n - 1) + 1]) if i % 2 else r.randint(-4, 4)
        return nl(sp([n, target]), sp(a))
    return gen


@problem("G-005-1", "G-005-5", gen=_g_signed_target())
def _(inp):
    n, t = ints(L(inp)[0])
    return str(_count_sum(ints(L(inp)[1]), t))


@problem("G-005-2", gen=g_n_str(sizes=(1, 3, 5, 7), alpha="AB"))
def _(inp):
    s = L(inp)[1]
    return str(_count_sum([1 if c == "A" else -1 for c in s], 0))


def _g_bits_k(r, i):
    n = size(i, (1, 3, 5, 7))
    return nl(sp([n, r.randint(0, 3)]), sp(arr(r, n, 0, 1)))


@problem("G-005-3", gen=_g_bits_k)
def _(inp):
    n, k = ints(L(inp)[0])
    return str(_count_sum(ints(L(inp)[1]), k))


def _g_steps(r, i):
    n = size(i, (1, 3, 5, 7))
    return nl(sp([n, r.randint(-3, 3)]), word(r, n, "+-"))


@problem("G-005-4", gen=_g_steps)
def _(inp):
    ls = L(inp)
    n, d = ints(ls[0])
    return str(_count_sum([1 if c == "+" else -1 for c in ls[1]], d))


# ── G-006 · balanced two-symbol substrings ──────────────────────────────────
def _balanced_windows(vals):
    """0-based inclusive windows whose signed values sum to zero."""
    n = len(vals)
    out = []
    for lo in range(n):
        s = 0
        for hi in range(lo, n):
            s += vals[hi]
            if s == 0:
                out.append((lo, hi))
    return out


def _signs(s, plus):
    return [1 if c in plus else -1 for c in s]


@problem("G-006-1", gen=g_n_str(sizes=(1, 3, 5, 7), alpha="01"))
def _(inp):
    w = _balanced_windows(_signs(L(inp)[1], "1"))
    return str(max((hi - lo + 1 for lo, hi in w), default=0))


@problem("G-006-2", gen=g_n_str(sizes=(1, 3, 5, 7), alpha="RB"))
def _(inp):
    return str(len(_balanced_windows(_signs(L(inp)[1], "R"))))


@problem("G-006-3", gen=g_n_str(sizes=(1, 3, 5, 7), alpha="AB"))
def _(inp):
    w = _balanced_windows(_signs(L(inp)[1], "A"))
    if not w:
        return "-1 -1"
    lo, hi = max(w, key=lambda p: (p[1] - p[0], -p[0]))
    return f"{lo + 1} {hi + 1}"


@problem("G-006-4", gen=g_n_str(sizes=(1, 3, 5, 7), alpha="abez"))
def _(inp):
    w = _balanced_windows(_signs(L(inp)[1], "aeiou"))
    return str(max((hi - lo + 1 for lo, hi in w), default=0))


@problem("G-006-5", gen=g_n_str(sizes=(1, 3, 5, 7), alpha="01"))
def _(inp):
    w = _balanced_windows(_signs(L(inp)[1], "1"))
    if not w:
        return "0 0"
    best = max(hi - lo + 1 for lo, hi in w)
    return f"{best} {sum(1 for lo, hi in w if hi - lo + 1 == best)}"


# ── G-007 · shortest window reaching a total ────────────────────────────────
def _g_reach(sizes=(1, 3, 5, 8), lo=1, hi=9, tmax=25):
    def gen(r, i):
        n = size(i, sizes)
        return nl(sp([n, r.randint(1, tmax)]), sp(arr(r, n, lo, hi)))
    return gen


@problem("G-007-1", "G-007-2", "G-007-3", "G-007-4", "G-007-5", gen=_g_reach())
def _(inp):
    n, s = ints(L(inp)[0])
    a = ints(L(inp)[1])
    best = 0
    for lo in range(n):
        t = 0
        for hi in range(lo, n):
            t += a[hi]
            if t >= s:
                best = hi - lo + 1 if best == 0 else min(best, hi - lo + 1)
                break
    return str(best)


# ── G-008 · windows where no value repeats more than k times ────────────────
def _capped_windows(seq, k):
    """0-based inclusive windows in which no value occurs more than k times."""
    n = len(seq)
    out = []
    for lo in range(n):
        for hi in range(lo, n):
            w = seq[lo:hi + 1]
            if max(w.count(v) for v in set(w)) <= k:
                out.append((lo, hi))
            else:
                break
    return out


def _best_capped(seq, k):
    w = _capped_windows(seq, k)
    return max(w, key=lambda p: (p[1] - p[0], -p[0])) if w else None


def _g_capped(sizes=(1, 3, 6, 8), lo=1, hi=3, kmax=3):
    def gen(r, i):
        n = size(i, sizes)
        return nl(sp([n, r.randint(0, kmax)]), sp(arr(r, n, lo, hi)))
    return gen


@problem("G-008-1", gen=lambda r, i: nl(sp([size(i, (1, 3, 6, 9)), r.randint(0, 3)]),
                                        word(r, size(i, (1, 3, 6, 9)), "abc")))
def _(inp):
    ls = L(inp)
    n, k = ints(ls[0])
    b = _best_capped(ls[1], k)
    return str(b[1] - b[0] + 1 if b else 0)


@problem("G-008-2", gen=_g_capped())
def _(inp):
    n, k = ints(L(inp)[0])
    b = _best_capped(ints(L(inp)[1]), k)
    return f"{b[0] + 1} {b[1] + 1}" if b else "0 0"


@problem("G-008-3", gen=_g_capped())
def _(inp):
    n, k = ints(L(inp)[0])
    return str(len(_capped_windows(ints(L(inp)[1]), k)))


@problem("G-008-4", gen=_g_capped())
def _(inp):
    n, k = ints(L(inp)[0])
    a = ints(L(inp)[1])
    b = _best_capped(a, k)
    return str(len(set(a[b[0]:b[1] + 1])) if b else 0)


@problem("G-008-5", gen=_g_capped())
def _(inp):
    n, k = ints(L(inp)[0])
    a = ints(L(inp)[1])
    b = _best_capped(a, k)
    if not b:
        return "0 0"
    w = a[b[0]:b[1] + 1]
    return f"{len(w)} {min(set(w), key=lambda v: (-w.count(v), v))}"


# ── G-009 · longest window uniform after k repaints ─────────────────────────
def _repaint(seq, k, target=None):
    n = len(seq)
    best = 0
    for lo in range(n):
        for hi in range(lo, n):
            w = seq[lo:hi + 1]
            keep = w.count(target) if target else max(w.count(v) for v in set(w))
            if len(w) - keep <= k:
                best = max(best, len(w))
    return best


def _g_repaint_str(alpha):
    def gen(r, i):
        n = size(i, (1, 3, 6, 9))
        return nl(sp([n, r.randint(0, 3)]), word(r, n, alpha))
    return gen


@problem("G-009-1", gen=_g_repaint_str("ABC"))
def _(inp):
    ls = L(inp)
    n, k = ints(ls[0])
    return str(_repaint(ls[1], k))


@problem("G-009-2", gen=_g_capped(lo=1, hi=4))
def _(inp):
    n, k = ints(L(inp)[0])
    return str(_repaint(ints(L(inp)[1]), k))


@problem("G-009-3", gen=_g_repaint_str("01"))
def _(inp):
    ls = L(inp)
    n, k = ints(ls[0])
    return str(_repaint(ls[1], k))


def _g_roles(r, i):
    n = size(i, (1, 3, 6, 9))
    return nl(sp([n, r.randint(0, 3)]), sp(r.choice(["eng", "art", "chef"]) for _ in range(n)))


@problem("G-009-4", gen=_g_roles)
def _(inp):
    ls = L(inp)
    n, k = ints(ls[0])
    return str(_repaint(ls[1].split(), k))


def _g_target_paint(r, i):
    n = size(i, (1, 3, 6, 9))
    return nl(sp([n, r.randint(0, 3), r.choice("abc")]), word(r, n, "abc"))


@problem("G-009-5", gen=_g_target_paint)
def _(inp):
    ls = L(inp)
    n, k, t = ls[0].split()
    return str(_repaint(ls[1], int(k), t))


# ── G-010 · first index meeting a monotone condition ────────────────────────
def _g_sorted_target(lo=-9, hi=9, sizes=(1, 3, 5, 8)):
    def gen(r, i):
        n = size(i, sizes)
        return nl(n, sp(sorted(arr(r, n, lo, hi))), r.randint(lo, hi))
    return gen


@problem("G-010-1", gen=_g_sorted_target())
def _(inp):
    ls = L(inp)
    a = ints(ls[1])
    t = int(ls[2])
    return str(next((j + 1 for j, v in enumerate(a) if v >= t), -1))


@problem("G-010-2", gen=lambda r, i: (lambda n, ones: nl(n, sp([0] * (n - ones) + [1] * ones)))(
    size(i, (1, 3, 5, 8)), r.randint(0, size(i, (1, 3, 5, 8)))))
def _(inp):
    a = ints(L(inp)[1])
    return str(next((j + 1 for j, v in enumerate(a) if v == 1), -1))


@problem("G-010-3", gen=lambda r, i: (lambda n, f: nl(n, "P" * (n - f) + "F" * f))(
    size(i, (1, 3, 5, 8)), r.randint(0, size(i, (1, 3, 5, 8)))))
def _(inp):
    s = L(inp)[1]
    return str(s.find("F") + 1 if "F" in s else -1)


def _g_insert(r, i):
    n = size(i, (0, 2, 4, 7))
    return nl(n, sp(sorted(arr(r, n, -9, 9))), r.randint(-9, 9))


@problem("G-010-4", gen=_g_insert)
def _(inp):
    ls = RL(inp)
    n = int(ls[0])
    a = ints(ls[1]) if n else []
    x = int(ls[2])
    return str(next((j for j, v in enumerate(a) if v >= x), n))


@problem("G-010-5", gen=lambda r, i: nl(sp([size(i, (1, 3, 5, 8)), r.randint(0, 25)]),
                                        sp(arr(r, size(i, (1, 3, 5, 8)), 0, 8))))
def _(inp):
    n, m = ints(L(inp)[0])
    if m <= 0:
        return "1"
    t = 0
    for j, v in enumerate(ints(L(inp)[1]), 1):
        t += v
        if t >= m:
            return str(j)
    return "-1"


# ── G-011 · last index meeting a monotone condition ─────────────────────────
def _g_head_sorted(rev=False, lo=-9, hi=9, sizes=(1, 3, 5, 8), tlo=-9, thi=9):
    def gen(r, i):
        n = size(i, sizes)
        a = sorted(arr(r, n, lo, hi), reverse=rev)
        return nl(sp([n, r.randint(tlo, thi)]), sp(a))
    return gen


@problem("G-011-1", gen=_g_head_sorted())
def _(inp):
    n, x = ints(L(inp)[0])
    a = ints(L(inp)[1])
    return str(max((j + 1 for j, v in enumerate(a) if v <= x), default=0))


@problem("G-011-2", gen=_g_head_sorted(rev=True))
def _(inp):
    n, t = ints(L(inp)[0])
    a = ints(L(inp)[1])
    return str(max((j + 1 for j, v in enumerate(a) if v >= t), default=0))


@problem("G-011-3", gen=_g_head_sorted(lo=1, hi=9, tlo=0, thi=25))
def _(inp):
    n, s = ints(L(inp)[0])
    t = 0
    best = 0
    for j, v in enumerate(ints(L(inp)[1]), 1):
        t += v
        if t <= s:
            best = j
    return str(best)


def _g_sorted_letters(r, i):
    n = size(i, (1, 3, 5, 8))
    return nl(f"{n} {r.choice('abcz')}", "".join(sorted(word(r, n, "abcz"))))


@problem("G-011-4", gen=_g_sorted_letters)
def _(inp):
    ls = L(inp)
    c = ls[0].split()[1]
    return str(max((j + 1 for j, ch in enumerate(ls[1]) if ch <= c), default=0))


@problem("G-011-5", gen=lambda r, i: nl(sp([size(i, (1, 3, 5, 8)), r.choice([1, 60, 120, 720, 1440])]),
                                        sp(sorted(arr(r, size(i, (1, 3, 5, 8)), 0, 1439)))))
def _(inp):
    n, d = ints(L(inp)[0])
    a = ints(L(inp)[1])
    return str(max((j + 1 for j, v in enumerate(a) if v + d - 1 <= 1439), default=0))


# ── G-012 · rotated sorted arrays ───────────────────────────────────────────
def _g_rotated(extra=None, sizes=(1, 2, 5, 8)):
    def gen(r, i):
        n = size(i, sizes)
        base = sorted(distinct(r, n, -9, 20))
        k = r.randint(0, n - 1)
        a = base[k:] + base[:k]
        rest = extra(r, a) if extra else []
        return nl(*([str(n), sp(a)] + list(rest)))
    return gen


@problem("G-012-1", gen=_g_rotated(lambda r, a: [str(r.choice(a + [99]))]))
def _(inp):
    ls = L(inp)
    a = ints(ls[1])
    t = int(ls[2])
    return str(a.index(t) if t in a else -1)


@problem("G-012-2", gen=_g_rotated(lambda r, a: [str(r.choice(a + [99]))]))
def _(inp):
    ls = L(inp)
    a = ints(ls[1])
    t = int(ls[2])
    return str(a.index(t) + 1 if t in a else -1)


@problem("G-012-3", gen=_g_rotated(lambda r, a: (lambda q: [str(q), sp(r.choice(a + [99]) for _ in range(q))])(r.randint(1, 3))))
def _(inp):
    ls = L(inp)
    a = set(ints(ls[1]))
    q = int(ls[2])
    return nl(*[yn(v in a) for v in ints(ls[3])])


@problem("G-012-4", gen=_g_rotated())
def _(inp):
    a = ints(L(inp)[1])
    return str(a.index(min(a)))


@problem("G-012-5", gen=_g_rotated(lambda r, a: [sp([r.choice(a + [99]), r.choice(a + [99])])]))
def _(inp):
    ls = L(inp)
    a = ints(ls[1])
    x, y = ints(ls[2])
    if x not in a or y not in a:
        return "-1"
    return str((a.index(y) - a.index(x)) % len(a))


# ── G-013 · unimodal sequences ──────────────────────────────────────────────
def _g_unimodal(sizes=(1, 2, 5, 7), interior=False):
    def gen(r, i):
        n = size(i, sizes)
        peak = r.randint(1, n - 2) if interior else r.randint(0, n - 1)
        up = sorted(distinct(r, peak + 1, -20, 40))
        down = sorted(distinct(r, n - peak - 1, -60, up[-1] - 1), reverse=True)
        return nl(n, sp(up + down))
    return gen


@problem("G-013-1", gen=_g_unimodal())
def _(inp):
    a = ints(L(inp)[1])
    return str(a.index(max(a)) + 1)


@problem("G-013-2", gen=_g_unimodal())
def _(inp):
    a = ints(L(inp)[1])
    return str(a.index(max(a)))


@problem("G-013-3", gen=_g_unimodal())
def _(inp):
    a = ints(L(inp)[1])
    return f"{a.index(max(a)) + 1} {max(a)}"


@problem("G-013-4", gen=_g_unimodal(sizes=(3, 4, 5, 7), interior=True))
def _(inp):
    a = ints(L(inp)[1])
    return str(a.index(max(a)) + 1)


@problem("G-013-5", gen=_g_unimodal())
def _(inp):
    return str(max(ints(L(inp)[1])))


# ── G-014 · row- and column-sorted grids ────────────────────────────────────
def _g_sorted_grid(strict=False, target=None, words=False):
    def gen(r, i):
        rr, cc = ((1, 1), (2, 2), (3, 3), (2, 4))[i % 4]
        base = []
        row = 0
        for a in range(rr):
            row += r.randint(1 if strict else 0, 3)
            cur, line = row, []
            for _ in range(cc):
                cur += r.randint(1 if strict else 0, 3)
                line.append(cur)
            base.append(line)
        # columns inherit monotonicity because every row starts higher.
        grid = [[base[a][c] + a for c in range(cc)] for a in range(rr)]
        if words:
            body = [sp("w" + str(v).rjust(3, "0") for v in line) for line in grid]
            pool = [w for line in body for w in line.split()]
            tgt = r.choice(pool + ["zzz"]) if target is None else target
        else:
            body = [sp(line) for line in grid]
            pool = [v for line in grid for v in line]
            tgt = r.choice(pool + [999])
        return nl(sp([rr, cc]), *body, str(tgt))
    return gen


def _read_grid(inp, conv=int):
    ls = L(inp)
    rr, cc = ints(ls[0])
    grid = [[conv(x) for x in ls[1 + a].split()] for a in range(rr)]
    return rr, cc, grid, ls[rr + 1].strip()


@problem("G-014-1", gen=_g_sorted_grid())
def _(inp):
    rr, cc, grid, t = _read_grid(inp)
    return yn(any(int(t) in row for row in grid))


@problem("G-014-5", gen=_g_sorted_grid())
def _(inp):
    rr, cc, grid, t = _read_grid(inp)
    return "PRESENT" if any(int(t) in row for row in grid) else "ABSENT"


@problem("G-014-2", gen=_g_sorted_grid(strict=True))
def _(inp):
    rr, cc, grid, t = _read_grid(inp)
    for a in range(rr):
        for c in range(cc):
            if grid[a][c] == int(t):
                return f"{a + 1} {c + 1}"
    return "-1 -1"


def _staircase(grid, rr, cc, target):
    """The question's own corner-elimination walk, from the top-right cell."""
    a, c = 0, cc - 1
    while 0 <= a < rr and 0 <= c < cc:
        if grid[a][c] == target:
            return a + 1, c + 1
        if grid[a][c] > target:
            c -= 1
        else:
            a += 1
    return None


@problem("G-014-3", gen=_g_sorted_grid())
def _(inp):
    rr, cc, grid, t = _read_grid(inp)
    hit = _staircase(grid, rr, cc, int(t))
    return f"{hit[0]} {hit[1]}" if hit else "-1 -1"


@problem("G-014-4", gen=_g_sorted_grid(words=True))
def _(inp):
    rr, cc, grid, t = _read_grid(inp, str)
    hit = _staircase(grid, rr, cc, t)
    return f"FOUND {hit[0]} {hit[1]}" if hit else "NOT FOUND"


# ── G-015 · next strictly greater element to the right ──────────────────────
def _next_greater(a):
    """Index of the first strictly greater element to the right, or None."""
    n = len(a)
    return [next((k for k in range(j + 1, n) if a[k] > a[j]), None) for j in range(n)]


@problem("G-015-1", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=-5, hi=5))
def _(inp):
    a = ints(L(inp)[1])
    return sp(a[k] if k is not None else -1 for k in _next_greater(a))


@problem("G-015-2", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=-5, hi=5))
def _(inp):
    a = ints(L(inp)[1])
    return sp(k - j if k is not None else -1 for j, k in enumerate(_next_greater(a)))


@problem("G-015-3", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=-5, hi=30))
def _(inp):
    a = ints(L(inp)[1])
    return sp(k - j if k is not None else 0 for j, k in enumerate(_next_greater(a)))


@problem("G-015-4", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=-5, hi=5))
def _(inp):
    a = ints(L(inp)[1])
    n = len(a)
    out = []
    for j in range(n):
        out.append(next((a[(j + d) % n] for d in range(1, n) if a[(j + d) % n] > a[j]), -1))
    return sp(out)


@problem("G-015-5", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=-5, hi=5))
def _(inp):
    a = ints(L(inp)[1])
    return sp(k + 1 if k is not None else 0 for k in _next_greater(a))


# ── G-016 · nearest earlier strictly smaller element ────────────────────────
def _prev_smaller(a):
    """Index of the nearest earlier strictly smaller element, or None."""
    return [next((k for k in range(j - 1, -1, -1) if a[k] < a[j]), None)
            for j in range(len(a))]


@problem("G-016-1", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=-5, hi=5))
def _(inp):
    return sp(0 if k is None else k + 1 for k in _prev_smaller(ints(L(inp)[1])))


@problem("G-016-2", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=-5, hi=5))
def _(inp):
    p = _prev_smaller(ints(L(inp)[1]))
    return sp(j + 1 - (0 if k is None else k + 1) for j, k in enumerate(p))


@problem("G-016-3", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=-5, hi=5))
def _(inp):
    a = ints(L(inp)[1])
    return sp(-1 if k is None else a[k] for k in _prev_smaller(a))


@problem("G-016-4", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=-5, hi=5))
def _(inp):
    p = _prev_smaller(ints(L(inp)[1]))
    return sp(j - (0 if k is None else k + 1) for j, k in enumerate(p))


@problem("G-016-5", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=-5, hi=5))
def _(inp):
    return sp(-1 if k is None else k for k in _prev_smaller(ints(L(inp)[1])))


# ── G-017 · streak ending at each position ──────────────────────────────────
def _streak(a, ok):
    """Length of the longest run ending at i in which every member satisfies ok."""
    out = []
    for j in range(len(a)):
        k = j
        while k > 0 and ok(a[k - 1], a[j]):
            k -= 1
        out.append(j - k + 1)
    return out


@problem("G-017-1", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=0, hi=6))
def _(inp):
    return sp(_streak(ints(L(inp)[1]), lambda prev, cur: prev <= cur))


@problem("G-017-2", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=-5, hi=5))
def _(inp):
    return sp(_streak(ints(L(inp)[1]), lambda prev, cur: prev >= cur))


@problem("G-017-3", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=-5, hi=5))
def _(inp):
    return sp(_streak(ints(L(inp)[1]), lambda prev, cur: prev > cur))


@problem("G-017-4", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=-5, hi=5))
def _(inp):
    return sp(_streak(ints(L(inp)[1]), lambda prev, cur: prev < cur))


@problem("G-017-5", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=-5, hi=5))
def _(inp):
    a = ints(L(inp)[1])
    out = []
    for j, v in enumerate(a):
        out.append(out[-1] + 1 if j and a[j - 1] <= v else 1)
    return sp(out)


# ── G-018 · order statistics ────────────────────────────────────────────────
def _g_n_k_vals(lo=-9, hi=9, sizes=(1, 3, 5, 7)):
    def gen(r, i):
        n = size(i, sizes)
        return nl(sp([n, r.randint(1, n)]), sp(arr(r, n, lo, hi)))
    return gen


@problem("G-018-1", gen=_g_n_k_vals())
def _(inp):
    n, k = ints(L(inp)[0])
    a = ints(L(inp)[1])
    return "NA" if n < k else str(sorted(a, reverse=True)[k - 1])


@problem("G-018-2", gen=_g_n_k_vals())
def _(inp):
    n, k = ints(L(inp)[0])
    a = ints(L(inp)[1])
    out = []
    for j in range(1, n + 1):
        out.append("NA" if j < k else str(sorted(a[:j])[k - 1]))
    return nl(*out)


def _g_names(alpha="abc", wlen=(1, 3), sizes=(1, 3, 5, 8)):
    def gen(r, i):
        n = size(i, sizes)
        return nl(n, sp(word(r, r.randint(*wlen), alpha) for _ in range(n)))
    return gen

@problem("G-018-3", gen=_g_n_k_vals())
def _(inp):
    n, k = ints(L(inp)[0])
    a = ints(L(inp)[1])
    changes = 0
    prev = None
    for j in range(k, n + 1):
        cur = sorted(a[:j], reverse=True)[k - 1]
        if prev is None or cur != prev:
            changes += 1
        prev = cur
    return str(changes)


def _g_n_k_t(r, i):
    n = size(i, (1, 3, 5, 7))
    return nl(sp([n, r.randint(1, n), r.randint(-5, 5)]), sp(arr(r, n, -9, 9)))


@problem("G-018-4", gen=_g_n_k_t)
def _(inp):
    n, k, t = ints(L(inp)[0])
    a = ints(L(inp)[1])
    out = []
    for j in range(1, n + 1):
        if j < k:
            out.append("UNKNOWN")
        else:
            out.append("ALARM" if sorted(a[:j])[k - 1] <= t else "OK")
    return nl(*out)


def _g_n_k_q(r, i):
    n = size(i, (1, 3, 5, 7))
    q = r.randint(1, 3)
    return nl(sp([n, r.randint(1, n), q]), sp(arr(r, n, -9, 9)),
              *[str(r.randint(1, n)) for _ in range(q)])


@problem("G-018-5", gen=_g_n_k_q)
def _(inp):
    ls = L(inp)
    n, k, q = ints(ls[0])
    a = ints(ls[1])
    out = []
    for j in range(q):
        p = int(ls[2 + j])
        out.append("NA" if p < k else str(sorted(a[:p], reverse=True)[k - 1]))
    return nl(*out)


# ── G-019 · merging k sorted sequences ──────────────────────────────────────
def _merge_tagged(seqs):
    """(value, 1-based source) in merged order, ties resolved by source index."""
    items = [(v, s + 1, j) for s, seq in enumerate(seqs) for j, v in enumerate(seq)]
    return [(v, s) for v, s, _ in sorted(items, key=lambda t: (t[0], t[1], t[2]))]


def _read_seqs(ls, at, k):
    out = []
    for j in range(k):
        row = ints(ls[at + j])
        out.append(row[1:1 + row[0]])
    return out


def _g_seqs(head_m=False):
    def gen(r, i):
        k = size(i, (1, 2, 3, 4))
        seqs = [sorted(arr(r, r.randint(0, 3), -9, 9)) for _ in range(k)]
        if not any(seqs):
            seqs[0] = [r.randint(-9, 9)]
        rows = [sp([len(s)] + s) for s in seqs]
        head = sp([k, r.randint(1, 6)]) if head_m else str(k)
        return nl(head, *rows)
    return gen


@problem("G-019-1", gen=_g_seqs())
def _(inp):
    ls = L(inp)
    k = int(ls[0])
    return sp(v for v, _ in _merge_tagged(_read_seqs(ls, 1, k)))


@problem("G-019-2", gen=_g_seqs(head_m=True))
def _(inp):
    ls = L(inp)
    k, m = ints(ls[0])
    return sp(v for v, _ in _merge_tagged(_read_seqs(ls, 1, k))[:m])


@problem("G-019-3", gen=_g_seqs())
def _(inp):
    ls = L(inp)
    k = int(ls[0])
    return sp(f"{v}:{s}" for v, s in _merge_tagged(_read_seqs(ls, 1, k)))


@problem("G-019-4", gen=_g_seqs())
def _(inp):
    ls = L(inp)
    k = int(ls[0])
    out = []
    for v, _ in _merge_tagged(_read_seqs(ls, 1, k)):
        if not out or out[-1] != v:
            out.append(v)
    return sp(out)


@problem("G-019-5", gen=_g_seqs())
def _(inp):
    ls = L(inp)
    k = int(ls[0])
    merged = [v for v, _ in _merge_tagged(_read_seqs(ls, 1, k))]
    return str(merged[(len(merged) + 1) // 2 - 1])


# ── G-020 · peak simultaneous intervals ─────────────────────────────────────
def _g_intervals(closed=False, duration=False, sizes=(1, 2, 3, 5)):
    def gen(r, i):
        n = size(i, sizes)
        rows = []
        for _ in range(n):
            s = r.randint(0, 8)
            d = r.randint(0 if closed else 1, 4)
            rows.append(f"{s} {d}" if duration else f"{s} {s + d}")
        return nl(str(n), *rows)
    return gen


def _spans(inp, closed=False, duration=False):
    ls = L(inp)
    n = int(ls[0])
    out = []
    for j in range(n):
        a, b = ints(ls[1 + j])
        out.append((a, a + b) if duration else (a, b + 1 if closed else b))
    return out  # every span is [lo, hi) over integer time


def _occupancy(spans):
    """(time, count) for each integer instant that any span covers."""
    pts = sorted({t for lo, hi in spans for t in (lo, hi)})
    return [(t, sum(1 for lo, hi in spans if lo <= t < hi)) for t in pts]


@problem("G-020-1", gen=_g_intervals())
def _(inp):
    return str(max(c for _, c in _occupancy(_spans(inp))))


@problem("G-020-2", gen=_g_intervals(closed=True))
def _(inp):
    occ = _occupancy(_spans(inp, closed=True))
    best = max(c for _, c in occ)
    return f"{best} {min(t for t, c in occ if c == best)}"


@problem("G-020-3", gen=_g_intervals())
def _(inp):
    spans = _spans(inp)
    pts = sorted({t for lo, hi in spans for t in (lo, hi)})
    best = 0
    total = 0
    for a, b in zip(pts, pts[1:]):
        c = sum(1 for lo, hi in spans if lo <= a < hi)
        if c > best:
            best, total = c, b - a
        elif c == best:
            total += b - a
    return f"{best} {total}"


@problem("G-020-4", gen=_g_intervals(duration=True))
def _(inp):
    return str(max(c for _, c in _occupancy(_spans(inp, duration=True))))


@problem("G-020-5", gen=_g_intervals())
def _(inp):
    spans = _spans(inp)
    occ = _occupancy(spans)
    best = max(c for _, c in occ)
    at = min(t for t, c in occ if c == best)
    return f"{best} {min(j + 1 for j, (lo, hi) in enumerate(spans) if lo <= at < hi)}"


# ── G-021 · job sequencing with deadlines ───────────────────────────────────
def _schedule(jobs):
    """Greedy max-value selection; returns the chosen 0-based job indices."""
    slots = {}
    for value, deadline, idx in sorted(jobs, key=lambda t: (-t[0], t[2])):
        day = deadline
        while day >= 1 and day in slots:
            day -= 1
        if day >= 1:
            slots[day] = idx
    return sorted(slots.values())


def _read_jobs(inp):
    ls = L(inp)
    n = int(ls[0])
    out = []
    for j in range(n):
        v, d = ints(ls[1 + j])
        out.append((v, d, j))
    return out


def _g_jobs(sizes=(1, 3, 4, 6), vmax=9, dmax=3):
    def gen(r, i):
        n = size(i, sizes)
        return nl(str(n), *[f"{r.randint(0, vmax)} {r.randint(0, dmax)}" for _ in range(n)])
    return gen


@problem("G-021-1", "G-021-4", gen=_g_jobs())
def _(inp):
    jobs = _read_jobs(inp)
    return str(sum(jobs[j][0] for j in _schedule(jobs)))


@problem("G-021-3", gen=_g_jobs())
def _(inp):
    picked = _schedule(_read_jobs(inp))
    return nl(len(picked), sp(j + 1 for j in picked)) if picked else "0"


@problem("G-021-5", gen=_g_jobs())
def _(inp):
    jobs = _read_jobs(inp)
    picked = _schedule(jobs)
    return f"{sum(jobs[j][0] for j in picked)} {len(picked)}"


@problem("G-021-2", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=0, hi=4))
def _(inp):
    used = set()
    for d in sorted(ints(L(inp)[1])):
        day = 1
        while day <= d and day in used:
            day += 1
        if day <= d:
            used.add(day)
    return str(len(used))


# ── G-022 · minimum jumps ───────────────────────────────────────────────────
def _min_jumps(reach, lo, hi):
    """Fewest moves from index lo to index hi, staying inside [lo, hi]."""
    dist = {lo: 0}
    frontier = [lo]
    while frontier:
        nxt = []
        for j in frontier:
            for k in range(j + 1, min(hi, j + reach[j]) + 1):
                if k not in dist:
                    dist[k] = dist[j] + 1
                    nxt.append(k)
        frontier = nxt
    return dist.get(hi)


@problem("G-022-1", "G-022-2", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=0, hi=3))
def _(inp):
    a = ints(L(inp)[1])
    d = _min_jumps(a, 0, len(a) - 1)
    return str(-1 if d is None else d)


def _g_checkpoints(r, i):
    m = size(i, (1, 2, 4, 5))
    pos = [0]
    for _ in range(m - 1):
        pos.append(pos[-1] + r.randint(1, 4))
    rows = [f"{p} {r.randint(0, 6)}" for p in pos[:-1]] + [f"{pos[-1]} 0"]
    return nl(sp([m, pos[-1]]), *rows)


@problem("G-022-3", gen=_g_checkpoints)
def _(inp):
    ls = L(inp)
    m, total = ints(ls[0])
    pts = [ints(ls[1 + j]) for j in range(m)]
    reach = [sum(1 for k in range(j + 1, m) if pts[k][0] <= pts[j][0] + pts[j][1])
             for j in range(m)]
    d = _min_jumps(reach, 0, m - 1)
    return str(-1 if d is None else d)


def _g_mandatory(r, i):
    n = size(i, (1, 3, 5, 6))
    mids = sorted(r.sample(range(2, n), min(r.randint(0, 2), max(0, n - 2))))
    stops = [1] + mids + [n] if n > 1 else [1]
    return nl(sp([n, len(stops)]), sp(arr(r, n, 0, 3)), sp(stops))


@problem("G-022-4", gen=_g_mandatory)
def _(inp):
    ls = L(inp)
    n, k = ints(ls[0])
    a = ints(ls[1])
    stops = ints(ls[2])
    total = 0
    for lo, hi in zip(stops, stops[1:]):
        d = _min_jumps(a, lo - 1, hi - 1)
        if d is None:
            return "-1"
        total += d
    return str(total)


def _g_crews(r, i):
    m = size(i, (1, 2, 4, 5))
    total = r.randint(0, 8)
    rows = [f"{r.randint(0, total)} {r.randint(0, 4)}" for _ in range(m)]
    return nl(sp([m, total]), *rows)


@problem("G-022-5", gen=_g_crews)
def _(inp):
    ls = L(inp)
    m, total = ints(ls[0])
    iv = sorted((s, s + d) for s, d in (ints(ls[1 + j]) for j in range(m)))
    if total == 0:
        return "0"
    used, at, j = 0, 0, 0
    while at < total:
        best = at
        while j < m and iv[j][0] <= at:
            best = max(best, iv[j][1])
            j += 1
        if best == at:
            return "-1"
        at = best
        used += 1
    return str(used)


# ── G-023 · partition so no label spans two blocks ──────────────────────────
def _partition(seq):
    last = {v: j for j, v in enumerate(seq)}
    out, start, end = [], 0, 0
    for j, v in enumerate(seq):
        end = max(end, last[v])
        if j == end:
            out.append(j - start + 1)
            start = j + 1
    return out


@problem("G-023-1", gen=_g_names(alpha="abc", wlen=(1, 2), sizes=(1, 3, 5, 7)))
def _(inp):
    return sp(_partition(L(inp)[1].split()))


@problem("G-023-2", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=-2, hi=3))
def _(inp):
    return sp(_partition(ints(L(inp)[1])))


@problem("G-023-3", "G-023-5", gen=g_str(sizes=(1, 3, 5, 8), alpha="abcd"))
def _(inp):
    return sp(_partition(RL(inp)[0]))


@problem("G-023-4", gen=lambda r, i: (lambda n: nl(n, sp(r.choice("ABCD") for _ in range(n))))(
    size(i, (1, 3, 5, 7))))
def _(inp):
    return sp(_partition(L(inp)[1].split()))

from itertools import combinations, permutations
from math import gcd


# ── G-024 · subsets over a small item list ──────────────────────────────────
def _g_items(tlo=0, thi=20, vlo=0, vhi=9, sizes=(1, 3, 4, 6)):
    def gen(r, i):
        n = size(i, sizes)
        return nl(sp([n, r.randint(tlo, thi)]), sp(arr(r, n, vlo, vhi)))
    return gen


def _subsets(a):
    for k in range(len(a) + 1):
        for combo in combinations(range(len(a)), k):
            yield combo


@problem("G-024-1", gen=_g_items())
def _(inp):
    n, t = ints(L(inp)[0])
    a = ints(L(inp)[1])
    return yn(any(sum(a[j] for j in c) == t for c in _subsets(a)))


@problem("G-024-2", gen=_g_items())
def _(inp):
    n, t = ints(L(inp)[0])
    a = ints(L(inp)[1])
    best = None
    for k in range(1, n + 1):
        for c in combinations(range(n), k):
            if sum(a[j] for j in c) == t:
                cand = [j + 1 for j in c]
                if best is None or cand < best:
                    best = cand
    return sp(best) if best else "-1"


def _g_items_k(r, i):
    n = size(i, (1, 3, 4, 6))
    return nl(sp([n, r.randint(1, n), r.randint(0, 20)]), sp(arr(r, n, 0, 9)))


@problem("G-024-3", gen=_g_items_k)
def _(inp):
    n, k, t = ints(L(inp)[0])
    a = ints(L(inp)[1])
    for c in combinations(range(n), k):
        if sum(a[j] for j in c) == t:
            return sp(j + 1 for j in c)
    return "-1"


@problem("G-024-4", gen=_g_items(tlo=0, thi=24, vlo=0, vhi=6))
def _(inp):
    n, p = ints(L(inp)[0])
    a = ints(L(inp)[1])
    for c in _subsets(a):
        prod = 1
        for j in c:
            prod *= a[j]
        if prod == p:
            return "YES"
    return "NO"


@problem("G-024-5", gen=_g_items())
def _(inp):
    n, lim = ints(L(inp)[0])
    a = ints(L(inp)[1])
    return str(max(s for s in (sum(a[j] for j in c) for c in _subsets(a)) if s <= lim))


# ── G-025 · filtered permutations of 1..N ───────────────────────────────────
def _perm_filter(n, ok):
    rows = [sp(p) for p in permutations(range(1, n + 1)) if ok(p)]
    return nl(*rows) if rows else "EMPTY"


_g_small_n = lambda r, i: str(i % 4 + 1)


@problem("G-025-1", gen=_g_small_n)
def _(inp):
    return _perm_filter(int(RL(inp)[0]), lambda p: p[0] < p[-1])


@problem("G-025-2", gen=_g_small_n)
def _(inp):
    return _perm_filter(int(RL(inp)[0]),
                        lambda p: all(abs(p[j] - p[j + 1]) != 1 for j in range(len(p) - 1)))


@problem("G-025-3", gen=_g_small_n)
def _(inp):
    return _perm_filter(int(RL(inp)[0]),
                        lambda p: all((p[j] + p[j + 1]) % 2 for j in range(len(p) - 1)))


@problem("G-025-4", gen=_g_small_n)
def _(inp):
    return _perm_filter(int(RL(inp)[0]), lambda p: len(p) == 1 or p[0] < p[1])


@problem("G-025-5", gen=_g_small_n)
def _(inp):
    def ok(p):
        n = len(p)
        return p[n // 2] == 1 if n % 2 else p[n // 2 - 1] < p[n // 2]
    return _perm_filter(int(RL(inp)[0]), ok)


# ── G-026 · enumerating index combinations ──────────────────────────────────
def _combo_lines(rows):
    return nl(*rows) if rows else "NONE"


def _g_combo(head, body=None, sizes=(1, 4, 5, 7)):
    def gen(r, i):
        n = size(i, sizes)
        lines = [sp([n] + list(head(r, n)))]
        if body:
            lines.append(sp(body(r, n)))
        return nl(*lines)
    return gen


@problem("G-026-1", gen=_g_combo(lambda r, n: [r.randint(1, n), r.randint(0, 12)],
                                 lambda r, n: arr(r, n, 0, 6)))
def _(inp):
    n, k, s = ints(L(inp)[0])
    a = ints(L(inp)[1])
    return _combo_lines([sp(j + 1 for j in c) for c in combinations(range(n), k)
                         if sum(a[j] for j in c) == s])


def _g_labels(r, i):
    n = size(i, (1, 4, 5, 6))
    labels = [word(r, r.randint(1, 4), "abc") for _ in range(n)]
    return nl(sp([n, r.randint(1, min(4, n)), r.randint(1, 8)]), sp(labels))


@problem("G-026-2", gen=_g_labels)
def _(inp):
    ls = L(inp)
    n, k, want = ints(ls[0])
    labels = ls[1].split()
    return _combo_lines([sp(labels[j] for j in c) for c in combinations(range(n), k)
                         if sum(len(labels[j]) for j in c) == want])


@problem("G-026-3", gen=lambda r, i: sp([size(i, (1, 4, 6, 8)), r.randint(1, 3)]))
def _(inp):
    n, k = ints(RL(inp)[0])
    return _combo_lines([sp(j + 1 for j in c) for c in combinations(range(n), k)
                         if all(b - a > 1 for a, b in zip(c, c[1:]))])


@problem("G-026-4", gen=_g_combo(lambda r, n: [r.randint(1, min(5, n))],
                                 lambda r, n: arr(r, n, 1, 4)))
def _(inp):
    n, k = ints(L(inp)[0])
    a = ints(L(inp)[1])
    return _combo_lines([sp(j + 1 for j in c) for c in combinations(range(n), k)
                         if len({a[j] for j in c}) == k])


def _g_range_combo(r, i):
    n = size(i, (1, 4, 5, 7))
    lo = r.randint(0, 8)
    return nl(sp([n, r.randint(1, min(4, n)), lo, lo + r.randint(0, 4)]), sp(arr(r, n, 0, 6)))


@problem("G-026-5", gen=_g_range_combo)
def _(inp):
    n, k, lo, hi = ints(L(inp)[0])
    a = ints(L(inp)[1])
    return _combo_lines([sp(j + 1 for j in c) for c in combinations(range(n), k)
                         if lo <= sum(a[j] for j in c) <= hi])


# ── G-027 · gcd over a list ─────────────────────────────────────────────────
def _gcd_all(xs):
    g = 0
    for v in xs:
        g = gcd(g, v)
    return g


@problem("G-027-1", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=1, hi=60))
def _(inp):
    return str(_gcd_all(ints(L(inp)[1])))


@problem("G-027-2", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=1, hi=60))
def _(inp):
    a = ints(L(inp)[1])
    g = _gcd_all(a)
    return f"{g} {sum(v // g for v in a)}"


def _g_pairs(r, i):
    n = size(i, (1, 2, 3, 4))
    return nl(str(n), *[f"{r.randint(1, 40)} {r.randint(1, 40)}" for _ in range(n)])


@problem("G-027-3", gen=_g_pairs)
def _(inp):
    ls = L(inp)
    n = int(ls[0])
    pairs = [ints(ls[1 + j]) for j in range(n)]
    g = _gcd_all([v for pair in pairs for v in pair])
    return nl(*[f"{p // g} {q // g}" for p, q in pairs])


@problem("G-027-4", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=0, hi=60))
def _(inp):
    a = ints(L(inp)[1])
    if len(a) == 1 or len(set(a)) == 1:
        return "0"
    return str(_gcd_all([abs(v - a[0]) for v in a[1:]]))


@problem("G-027-5", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=1, hi=40))
def _(inp):
    a = ints(L(inp)[1])
    g = _gcd_all(a)
    run = 0
    hits = 0
    for v in a:
        run = gcd(run, v)
        hits += run == g
    return str(hits)


# ── G-028 · prime factorisations ────────────────────────────────────────────
def _factor(v):
    out = {}
    d = 2
    while d * d <= v:
        while v % d == 0:
            out[d] = out.get(d, 0) + 1
            v //= d
        d += 1
    if v > 1:
        out[v] = out.get(v, 0) + 1
    return out


def _exponents(vals):
    total = {}
    for v in vals:
        for p, e in _factor(v).items():
            total[p] = total.get(p, 0) + e
    return total


@problem("G-028-1", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=1, hi=60))
def _(inp):
    return str(len(_exponents(ints(L(inp)[1]))))


@problem("G-028-2", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=1, hi=40))
def _(inp):
    return yn(all(e == 1 for e in _exponents(ints(L(inp)[1])).values()))


@problem("G-028-3", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=1, hi=60))
def _(inp):
    exps = _exponents(ints(L(inp)[1]))
    if not exps:
        return "1 0"
    p = min(exps, key=lambda q: (-exps[q], q))
    return f"{p} {exps[p]}"


@problem("G-028-4", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=1, hi=60))
def _(inp):
    return str(sum(1 for e in _exponents(ints(L(inp)[1])).values() if e % 2))


def _g_two_prime_lists(r, i):
    n, m = ((1, 1), (2, 2), (3, 2), (4, 3))[i % 4]
    return nl(sp([n, m]), sp(arr(r, n, 1, 40)), sp(arr(r, m, 1, 40)))


@problem("G-028-5", gen=_g_two_prime_lists)
def _(inp):
    ls = L(inp)
    return str(len(set(_exponents(ints(ls[1]))) & set(_exponents(ints(ls[2])))))


@problem("G-029-1", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=0, hi=31))
def _(inp):
    v = 0
    for x in ints(L(inp)[1]):
        v |= x
    return str(v)


# ── G-029/G-030 · bitmask aggregates ────────────────────────────────────────
@problem("G-029-2", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=0, hi=31))
def _(inp):
    v = None
    for x in ints(L(inp)[1]):
        v = x if v is None else v & x
    return str(v)


def _g_masks_r(r, i):
    n = size(i, (1, 3, 5, 7))
    return nl(sp([n, r.randint(0, 31)]), sp(arr(r, n, 0, 31)))


def _union(xs):
    v = 0
    for x in xs:
        v |= x
    return v


@problem("G-029-3", gen=_g_masks_r)
def _(inp):
    n, req = ints(L(inp)[0])
    return str(req & ~_union(ints(L(inp)[1])))


@problem("G-029-4", gen=g_n_arr(sizes=(1, 3, 5, 7), lo=0, hi=31))
def _(inp):
    return str(bin(_union(ints(L(inp)[1]))).count("1"))


@problem("G-029-5", gen=_g_masks_r)
def _(inp):
    n, req = ints(L(inp)[0])
    return yn(req & ~_union(ints(L(inp)[1])) == 0)


def _g_odd_one_out(r, i):
    pairs = arr(r, size(i, (0, 1, 2, 3)), 0, 30)
    vals = [v for v in pairs for _ in (0, 1)] + [r.randint(31, 60)]
    r.shuffle(vals)
    return nl(len(vals), sp(vals))


@problem("G-030-1", gen=_g_odd_one_out)
def _(inp):
    v = 0
    for x in ints(L(inp)[1]):
        v ^= x
    return str(v)


# ── G-031 · rotations ───────────────────────────────────────────────────────
@problem("G-031-1", gen=g_head_arr(lambda r, n: [r.randint(0, 12)], sizes=(1, 3, 5, 7), lo=-9, hi=9))
def _(inp):
    n, k = ints(L(inp)[0])
    a = ints(L(inp)[1])
    k %= n
    return sp(a[n - k:] + a[:n - k])


def _g_k_words(r, i):
    n = size(i, (1, 2, 4, 6))
    return nl(str(r.randint(0, 9)), sp(word(r, r.randint(1, 4), "abc") for _ in range(n)))


@problem("G-031-2", gen=_g_k_words)
def _(inp):
    ls = L(inp)
    k = int(ls[0])
    w = ls[1].split()
    k %= len(w)
    return sp(w[k:] + w[:k])


def _g_n_k_names(r, i):
    n = size(i, (1, 2, 4, 6))
    return nl(sp([n, r.randint(0, 12)]), sp(word(r, r.randint(1, 4), "abc") for _ in range(n)))


@problem("G-031-3", gen=_g_n_k_names)
def _(inp):
    ls = L(inp)
    n, k = ints(ls[0])
    names = ls[1].split()
    k %= n
    return sp(names[n - k:] + names[:n - k])


def _g_k_digits(r, i):
    n = size(i, (1, 2, 4, 6))
    first = r.randint(1, 9)
    return nl(str(r.randint(0, 12)), str(first) + word(r, n - 1, "0123456789"))


@problem("G-031-4", gen=_g_k_digits)
def _(inp):
    ls = L(inp)
    k = int(ls[0])
    s = ls[1]
    k %= len(s)
    return s[k:] + s[:k]


def _g_k_bits(r, i):
    n = size(i, (1, 2, 4, 7))
    return nl(str(r.randint(0, 12)), word(r, n, "01"))


@problem("G-031-5", gen=_g_k_bits)
def _(inp):
    ls = L(inp)
    k = int(ls[0])
    s = ls[1]
    k %= len(s)
    return s[len(s) - k:] + s[:len(s) - k]


# ── G-032 · product of everything except self ───────────────────────────────
def _prod_except(a, mod=None):
    out = []
    for j in range(len(a)):
        p = 1
        for k, v in enumerate(a):
            if k != j:
                p = p * v % mod if mod else p * v
        out.append(p)
    return out


@problem("G-032-1", "G-032-2", "G-032-5", gen=g_n_arr(sizes=(1, 2, 3, 4), lo=-5, hi=5))
def _(inp):
    return sp(_prod_except(ints(L(inp)[1])))


def _g_n_m_vals(r, i):
    n = size(i, (1, 2, 3, 4))
    m = r.choice([2, 5, 7, 11, 13])
    return nl(sp([n, m]), sp(arr(r, n, 0, m - 1)))


@problem("G-032-3", gen=_g_n_m_vals)
def _(inp):
    n, m = ints(L(inp)[0])
    return sp(_prod_except(ints(L(inp)[1]), m))


@problem("G-032-4", gen=g_n_arr(sizes=(1, 2, 3, 5), lo=0, hi=1))
def _(inp):
    a = ints(L(inp)[1])
    return sp(1 if all(v for k, v in enumerate(a) if k != j) else 0 for j in range(len(a)))


# ── G-033/G-034 · fixed-size window sums ────────────────────────────────────
def _window_sums(a, k, circular):
    n = len(a)
    if circular:
        return [sum(a[(s + d) % n] for d in range(k)) for s in range(n)]
    return [sum(a[s:s + k]) for s in range(n - k + 1)]


def _g_window(with_t=False, sizes=(1, 3, 4, 6)):
    def gen(r, i):
        n = size(i, sizes)
        head = [n, r.randint(1, n)] + ([r.randint(-8, 12)] if with_t else [])
        return nl(sp(head), sp(arr(r, n, -9, 9)))
    return gen


@problem("G-033-1", gen=_g_window())
def _(inp):
    n, k = ints(L(inp)[0])
    return str(max(_window_sums(ints(L(inp)[1]), k, True)))


@problem("G-033-2", gen=_g_window())
def _(inp):
    n, k = ints(L(inp)[0])
    return str(min(_window_sums(ints(L(inp)[1]), k, True)))


@problem("G-033-3", gen=_g_window())
def _(inp):
    n, k = ints(L(inp)[0])
    s = _window_sums(ints(L(inp)[1]), k, True)
    return str(s.index(max(s)) + 1)


@problem("G-033-4", gen=_g_window(with_t=True))
def _(inp):
    n, k, t = ints(L(inp)[0])
    return str(sum(1 for v in _window_sums(ints(L(inp)[1]), k, True) if v >= t))


@problem("G-033-5", gen=_g_window())
def _(inp):
    n, k = ints(L(inp)[0])
    return str(max(_window_sums([-v for v in ints(L(inp)[1])], k, True)))


@problem("G-034-1", gen=_g_window())
def _(inp):
    n, k = ints(L(inp)[0])
    return str(max(_window_sums(ints(L(inp)[1]), k, False)))


@problem("G-034-3", gen=_g_window())
def _(inp):
    n, k = ints(L(inp)[0])
    s = _window_sums(ints(L(inp)[1]), k, False)
    return str(s.index(max(s)) + 1)


@problem("G-034-4", gen=_g_window(with_t=True))
def _(inp):
    n, k, t = ints(L(inp)[0])
    return str(sum(1 for v in _window_sums(ints(L(inp)[1]), k, False) if v >= t))


@problem("G-034-5", gen=_g_window())
def _(inp):
    n, k = ints(L(inp)[0])
    return str(max(abs(v) for v in _window_sums(ints(L(inp)[1]), k, False)))


# ── G-035 · counting pairs by sum or gap ────────────────────────────────────
def _pairs(a, ok):
    n = len(a)
    return sum(1 for j in range(n) for k in range(j + 1, n) if ok(a[j], a[k]))


def _g_pair_target(sizes=(2, 3, 4, 6)):
    def gen(r, i):
        n = size(i, sizes)
        return nl(sp([n, r.randint(-6, 10)]), sp(arr(r, n, -9, 9)))
    return gen


@problem("G-035-1", gen=_g_pair_target())
def _(inp):
    n, t = ints(L(inp)[0])
    return str(_pairs(ints(L(inp)[1]), lambda x, y: x + y < t))


@problem("G-035-2", gen=_g_pair_target())
def _(inp):
    n, t = ints(L(inp)[0])
    return str(_pairs(ints(L(inp)[1]), lambda x, y: x + y <= t))


@problem("G-035-3", gen=_g_pair_target())
def _(inp):
    n, t = ints(L(inp)[0])
    return str(_pairs(ints(L(inp)[1]), lambda x, y: x + y > t))


@problem("G-035-4", gen=_g_pair_target())
def _(inp):
    n, d = ints(L(inp)[0])
    return str(_pairs(ints(L(inp)[1]), lambda x, y: abs(x - y) <= d))


@problem("G-035-5", gen=_g_pair_target())
def _(inp):
    n, t = ints(L(inp)[0])
    return str(_pairs(ints(L(inp)[1]), lambda x, y: x + y == t))


# ── G-036 · the one repeated value ──────────────────────────────────────────
def _g_dup(r, i):
    n = size(i, (2, 4, 5, 7))
    vals = list(range(1, n))
    r.shuffle(vals)
    a = vals[:n - 1] + [r.choice(vals[:n - 1])]
    r.shuffle(a)
    return nl(len(a), sp(a))


@problem("G-036-1", gen=_g_dup)
def _(inp):
    a = ints(L(inp)[1])
    return str(next(v for v in a if a.count(v) > 1))


# ── G-037 · asteroid collisions ─────────────────────────────────────────────
@problem("G-037-1", gen=lambda r, i: (lambda n: nl(n, sp(r.choice([-1, 1]) * r.randint(1, 9)
                                                        for _ in range(n))))(size(i, (1, 2, 4, 6))))
def _(inp):
    st = []
    for v in ints(L(inp)[1]):
        alive = True
        while alive and st and st[-1] > 0 > v:
            if st[-1] < -v:
                st.pop()
            elif st[-1] == -v:
                st.pop()
                alive = False
            else:
                alive = False
        if alive:
            st.append(v)
    return sp(st) if st else "EMPTY"


# ── G-038 · balanced strings of N open and N close symbols ──────────────────
def _balanced(n, open_ch, close_ch):
    out = []

    def walk(s, o, c):
        if len(s) == 2 * n:
            out.append(s)
            return
        if o < n:
            walk(s + open_ch, o + 1, c)
        if c < o:
            walk(s + close_ch, o, c + 1)

    walk("", 0, 0)
    return nl(*out)


_g_bal_n = lambda r, i: str(i % 4 + 1)


@problem("G-038-1", gen=_g_bal_n)
def _(inp):
    return _balanced(int(RL(inp)[0]), "(", ")")


@problem("G-038-2", gen=_g_bal_n)
def _(inp):
    return _balanced(int(RL(inp)[0]), "[", "]")


@problem("G-038-3", gen=_g_bal_n)
def _(inp):
    return _balanced(int(RL(inp)[0]), "{", "}")


@problem("G-038-4", gen=_g_bal_n)
def _(inp):
    return _balanced(int(RL(inp)[0]), "1", "0")


@problem("G-038-5", gen=_g_bal_n)
def _(inp):
    return _balanced(int(RL(inp)[0]), "L", "R")


# ── G-039 · concatenation order ─────────────────────────────────────────────
def _join_extreme(tokens, largest):
    from functools import cmp_to_key

    def cmp(x, y):
        a, b = x + y, y + x
        if a == b:
            return 0
        return -1 if (a > b) == largest else 1

    out = "".join(sorted(tokens, key=cmp_to_key(cmp)))
    return "0" if out.lstrip("0") == "" else out


def _g_tokens(r, i):
    n = size(i, (1, 2, 3, 5))
    return nl(n, sp(r.choice(["0", "1", "12", "3", "30", "5", "80", "808"]) for _ in range(n)))


@problem("G-039-1", gen=_g_tokens)
def _(inp):
    return _join_extreme(L(inp)[1].split(), True)


@problem("G-039-2", gen=_g_tokens)
def _(inp):
    return _join_extreme(L(inp)[1].split(), False)


# ── G-040 · trace a word through a grid ─────────────────────────────────────
def _g_word_grid(r, i):
    rr, cc = ((1, 1), (2, 2), (3, 3), (2, 3))[i % 4]
    grid = [word(r, cc, "ABC") for _ in range(rr)]
    w = word(r, r.randint(1, 3), "ABC")
    return nl(sp([rr, cc]), *grid, w)


@problem("G-040-1", gen=_g_word_grid)
def _(inp):
    ls = L(inp)
    rr, cc = ints(ls[0])
    grid = [ls[1 + a] for a in range(rr)]
    w = ls[rr + 1].strip()

    def walk(a, c, k, used):
        if grid[a][c] != w[k]:
            return False
        if k == len(w) - 1:
            return True
        used.add((a, c))
        for da, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            na, nc = a + da, c + dc
            if 0 <= na < rr and 0 <= nc < cc and (na, nc) not in used:
                if walk(na, nc, k + 1, used):
                    used.discard((a, c))
                    return True
        used.discard((a, c))
        return False

    return yn(any(walk(a, c, 0, set()) for a in range(rr) for c in range(cc)))
