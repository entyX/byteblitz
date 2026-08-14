"""Turn the six authored question CSVs into the twelve-test sets the app ships.

    python tools/build_questions.py --check     # validate solvers, write nothing
    python tools/build_questions.py             # validate, then write public/data

Each source question arrives with eight test cases. This script pairs every
question with a reference solver from `tools/solvers`, replays the eight known
cases through it, and only then lets that solver mint four more — giving twelve
tests per question and, as a side effect, an independent fact-check of the eight
that were authored by hand.

Questions whose eight cases are byte-identical are treated as one problem: the
source data restates several tasks under different names ("... Planner",
"... Verifier"), and one solver legitimately covers the whole family.
"""

import argparse
import csv
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))

from solvers.common import REGISTRY, rng_for  # noqa: E402
from solvers.corrections import CORRECTIONS, INPUT_FIXES  # noqa: E402
import solvers  # noqa: F401,E402  (importing registers every solver)

DIVISIONS = ["bronze", "silver", "gold", "platinum", "diamond", "master"]
SRC = ROOT / "public" / "data" / "byteblitz_{}_questions.csv"
OUT = ROOT / "public" / "data" / "burst_{}.csv"

N_GIVEN = 8
N_EXTRA = 4
N_TOTAL = N_GIVEN + N_EXTRA

FIELDS = (
    ["id", "name", "division", "category", "background", "task",
     "input_format", "constraints", "sample_input", "sample_output"]
    + [f"test{i}_{k}" for i in range(1, N_TOTAL + 1) for k in ("input", "output")]
)


def norm(s):
    """Judge-equivalent normalisation: the app ignores trailing whitespace."""
    s = str(s).replace("\r\n", "\n")
    return "\n".join(line.rstrip() for line in s.split("\n")).strip()


def load(div):
    with open(str(SRC).format(div), encoding="utf-8-sig", newline="") as fh:
        rows = list(csv.DictReader(fh))
    for row in rows:
        fix = INPUT_FIXES.get(row["id"])
        if fix:
            for key in ["sample_input"] + [f"test{i}_input" for i in range(1, N_GIVEN + 1)]:
                row[key] = fix[1](row[key])
    return rows


def signature(row):
    """Identity of a question as far as judging is concerned."""
    return tuple(
        norm(row[f"test{i}_{k}"])
        for i in range(1, N_GIVEN + 1)
        for k in ("input", "output")
    )


def resolve_solvers(rows):
    """Map every row id to a solver, sharing one across identical questions."""
    by_sig = defaultdict(list)
    for row in rows:
        by_sig[signature(row)].append(row)

    resolved = {}
    for sig, group in by_sig.items():
        found = next((REGISTRY[r["id"]] for r in group if r["id"] in REGISTRY), None)
        if found is None:
            continue
        for row in group:
            resolved[row["id"]] = found
    return resolved, by_sig


def validate(row, prob):
    """Replay the eight authored cases. Returns a list of disagreements."""
    bad = []
    for i in range(1, N_GIVEN + 1):
        given_in = row[f"test{i}_input"]
        given_out = norm(row[f"test{i}_output"])
        try:
            got = norm(prob.solve(given_in))
        except Exception as e:  # a crash is a disagreement like any other
            bad.append((i, given_in, given_out, f"<{type(e).__name__}: {e}>"))
            continue
        if got != given_out:
            bad.append((i, given_in, given_out, got))
    return bad


def extra_cases(row, prob):
    """Four fresh cases, preferring inputs the question does not already use.

    A few questions have a tiny input space — "N is between 1 and 4" leaves four
    possible inputs, and the authored set already spends all four (it repeats
    them, too). Those fall back to reusing valid inputs rather than failing.
    """
    seen = {norm(row[f"test{i}_input"]) for i in range(1, N_GIVEN + 1)}
    r = rng_for(row["id"])
    out = []
    spare = []
    for i in range(400):
        if len(out) == N_EXTRA:
            break
        inp = prob.gen(r, i)
        key = norm(inp)
        if key in seen:
            if len(spare) < N_EXTRA:
                spare.append(inp)
            continue
        seen.add(key)
        out.append((inp, norm(prob.solve(inp))))

    while len(out) < N_EXTRA and spare:
        inp = spare.pop(0)
        out.append((inp, norm(prob.solve(inp))))
    if len(out) < N_EXTRA:
        raise RuntimeError(f"{row['id']}: generator produced only {len(out)} cases")
    return out


def build(check_only, only_div=None, verbose=False):
    total = missing = failed = 0
    all_missing = []
    all_failed = []
    all_corrected = []

    for div in DIVISIONS:
        if only_div and div != only_div:
            continue
        rows = load(div)
        resolved, by_sig = resolve_solvers(rows)
        total += len(rows)

        out_rows = []
        div_missing = div_failed = 0

        for row in rows:
            prob = resolved.get(row["id"])
            if prob is None:
                div_missing += 1
                all_missing.append((div, row["id"], row["name"]))
                continue

            bad = validate(row, prob)
            corrected = []
            if bad:
                if row["id"] not in CORRECTIONS:
                    div_failed += 1
                    all_failed.append((div, row["id"], row["name"], bad))
                    continue
                # Authored output is wrong and the reason is on record: the
                # solver becomes the source of truth for this question.
                corrected = [i for i, _, _, _ in bad]
                all_corrected.append((div, row["id"], row["name"], bad))

            try:
                extras = extra_cases(row, prob)
            except Exception as e:
                div_failed += 1
                all_failed.append((div, row["id"], row["name"], [(0, "generator", "", str(e))]))
                continue

            rec = {k: row[k] for k in FIELDS[:10]}
            # The sample block is rendered verbatim in the arena, so it gets the
            # same trailing-whitespace trim the judged outputs get.
            rec["sample_output"] = norm(
                prob.solve(row["sample_input"]) if corrected else row["sample_output"])
            for i in range(1, N_GIVEN + 1):
                rec[f"test{i}_input"] = row[f"test{i}_input"]
                rec[f"test{i}_output"] = (
                    norm(prob.solve(row[f"test{i}_input"])) if corrected
                    else norm(row[f"test{i}_output"]))
            for j, (inp, exp) in enumerate(extras, start=N_GIVEN + 1):
                rec[f"test{j}_input"] = inp
                rec[f"test{j}_output"] = exp
            out_rows.append(rec)

        missing += div_missing
        failed += div_failed
        print(f"{div:9s} {len(rows):4d} questions  "
              f"{len(out_rows):4d} built  {div_missing:4d} no-solver  {div_failed:4d} mismatched")

        if not check_only and out_rows:
            path = str(OUT).format(div)
            Path(path).parent.mkdir(parents=True, exist_ok=True)
            with open(path, "w", encoding="utf-8", newline="") as fh:
                w = csv.DictWriter(fh, fieldnames=FIELDS, quoting=csv.QUOTE_ALL)
                w.writeheader()
                w.writerows(out_rows)

    print(f"\ntotal {total}  built {total - missing - failed}  "
          f"no-solver {missing}  mismatched {failed}")

    if all_corrected:
        print(f"\n-- authored outputs corrected: {len(all_corrected)} question(s) --")
        for div, pid, name, bad in all_corrected:
            cells = ", ".join(f"test{i}" for i, _, _, _ in bad)
            print(f"  {pid} {name} ({div}): {cells}")
            print(f"      {CORRECTIONS[pid]}")

    if all_failed:
        print("\n-- solver disagreements --")
        for div, pid, name, bad in all_failed[:40]:
            print(f"\n{pid} {name} ({div})")
            for i, inp, exp, got in bad[:3]:
                print(f"  test{i}  in={inp!r}")
                print(f"          csv={exp!r}")
                print(f"          got={got!r}")
    if all_missing and verbose:
        print("\n── no solver yet ──")
        for div, pid, name in all_missing:
            print(f"  {pid}  {name}")

    return missing + failed


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="validate only, write nothing")
    ap.add_argument("--div", help="restrict to one division")
    ap.add_argument("-v", "--verbose", action="store_true")
    a = ap.parse_args()
    sys.exit(1 if build(a.check, a.div, a.verbose) else 0)
