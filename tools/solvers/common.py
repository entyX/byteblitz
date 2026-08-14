"""Shared plumbing for the reference solvers.

Every question in the six source CSVs gets a reference solver here. A solver is
a plain `str -> str` function over stdin/stdout text, plus a generator that
invents fresh, valid inputs for it. The build script cross-checks each solver
against the eight test cases that shipped with the question; only a solver that
reproduces all eight is trusted to mint new ones.

Test inputs in the source data top out at 144 characters, so solvers here are
written for clarity, not speed — brute force is fine and generators keep the
new cases just as small.
"""

import random

REGISTRY = {}


class Problem:
    __slots__ = ("pid", "solve", "gen")

    def __init__(self, pid, solve, gen):
        self.pid = pid
        self.solve = solve
        self.gen = gen


def problem(*pids, gen):
    """Register one solver against one or more question ids.

    Variant families ("... Planner", "... Checkpoint") restate the same task in
    different words, so several ids legitimately share a solver.
    """
    def deco(fn):
        for pid in pids:
            if pid in REGISTRY:
                raise KeyError(f"duplicate solver for {pid}")
            REGISTRY[pid] = Problem(pid, fn, gen)
        return fn
    return deco


# ── stdin helpers ───────────────────────────────────────────────────────────
def RL(inp):
    """Raw lines, nothing trimmed — for questions whose input may be blank or
    made entirely of spaces."""
    return inp.replace("\r\n", "\n").split("\n")


def L(inp):
    """Input split into lines, trailing blanks dropped."""
    ls = RL(inp)
    while ls and ls[-1].strip() == "":
        ls.pop()
    return ls


def T(inp):
    """Whole input as a flat token list."""
    return inp.split()


def I(inp):
    """Whole input as a flat list of ints."""
    return [int(x) for x in inp.split()]


def ints(line):
    return [int(x) for x in line.split()]


# ── stdout helpers ──────────────────────────────────────────────────────────
def sp(xs):
    return " ".join(str(x) for x in xs)


def nl(*parts):
    out = []
    for p in parts:
        out.append(p if isinstance(p, str) else str(p))
    return "\n".join(out)


def yn(b, yes="YES", no="NO"):
    return yes if b else no


# ── generator helpers ───────────────────────────────────────────────────────
# `i` is the index of the extra case being built (0..3). Generators fan out from
# a minimal shape at i=0 to a roomier one at i=3 so the four additions cover
# both the degenerate end and the ordinary middle.

def size(i, sizes=(1, 3, 6, 9)):
    return sizes[i % len(sizes)]


def arr(r, n, lo, hi):
    return [r.randint(lo, hi) for _ in range(n)]


def perm(r, n, start=1):
    xs = list(range(start, start + n))
    r.shuffle(xs)
    return xs


def word(r, n, alpha="abc"):
    return "".join(r.choice(alpha) for _ in range(n))


def sorted_arr(r, n, lo, hi):
    return sorted(arr(r, n, lo, hi))


def distinct(r, n, lo, hi):
    pool = list(range(lo, hi + 1))
    r.shuffle(pool)
    return pool[:n]


def g_n_arr(sizes=(1, 3, 6, 9), lo=1, hi=20):
    """`N` on line 1, then N space-separated integers on line 2."""
    def gen(r, i):
        n = size(i, sizes)
        return nl(n, sp(arr(r, n, lo, hi)))
    return gen


def g_head_arr(head, sizes=(1, 3, 6, 9), lo=1, hi=20):
    """`N k1 k2 ...` on line 1 (extra params from `head(r, n)`), array on line 2."""
    def gen(r, i):
        n = size(i, sizes)
        extra = head(r, n)
        return nl(sp([n] + list(extra)), sp(arr(r, n, lo, hi)))
    return gen


def g_str(sizes=(1, 3, 6, 9), alpha="abc"):
    """A single string on line 1."""
    def gen(r, i):
        return word(r, size(i, sizes), alpha)
    return gen


def g_n_str(sizes=(1, 3, 6, 9), alpha="abc"):
    """`N` on line 1, a length-N string on line 2."""
    def gen(r, i):
        n = size(i, sizes)
        return nl(n, word(r, n, alpha))
    return gen


def g_fixed(*cases):
    """Four hand-written inputs, used when random shapes can't stay valid."""
    def gen(r, i):
        return cases[i % len(cases)]
    return gen


def rng_for(pid):
    """Deterministic per-question RNG so rebuilds produce identical CSVs."""
    return random.Random("byteblitz::" + pid)
