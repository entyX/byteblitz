"""Print the authored questions in a compact form, for writing solvers against.

    python tools/dump.py bronze 0 40      # canonical questions [0, 40)

Only one representative per identical-test-data family is printed, and anything
already covered by a registered solver is skipped, so the listing shrinks as
solvers land.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from build_questions import load, signature, N_GIVEN, norm  # noqa: E402
from solvers.common import REGISTRY  # noqa: E402
import solvers  # noqa: F401,E402


def main(div, start, end, show_all=False):
    rows = load(div)
    seen = set()
    canon = []
    for row in rows:
        sig = signature(row)
        if sig in seen:
            continue
        seen.add(sig)
        canon.append(row)

    if not show_all:
        canon = [r for r in canon if r["id"] not in REGISTRY]

    print(f"# {div}: {len(rows)} rows, {len(seen)} unique, {len(canon)} unsolved")
    for row in canon[start:end]:
        print("\n" + "=" * 72)
        print(f"{row['id']} | {row['name']} | {row['category']}")
        print(f"TASK: {row['task']}")
        print(f"FMT: {row['input_format']}")
        print(f"CONS: {row['constraints']}")
        for i in range(1, N_GIVEN + 1):
            print(f"  t{i}: {norm(row[f'test{i}_input'])!r} -> {norm(row[f'test{i}_output'])!r}")


if __name__ == "__main__":
    d = sys.argv[1]
    s = int(sys.argv[2]) if len(sys.argv) > 2 else 0
    e = int(sys.argv[3]) if len(sys.argv) > 3 else 10 ** 9
    main(d, s, e, "--all" in sys.argv)
