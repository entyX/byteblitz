"""Questions whose authored expected output is wrong.

Every solver here is cross-checked against the eight test cases that shipped
with its question, and a disagreement normally fails the build. These are the
cases where the disagreement was traced back to the source CSV rather than the
solver: each entry records what the CSV claimed, what the task statement
actually requires, and why. For a listed question the build recomputes all
outputs — sample included — from the solver, so the shipped set is internally
consistent.

Nothing lands here without working the case by hand first. If a solver is
wrong, fix the solver.
"""

import re

# Questions whose *input* is malformed. The value is a reason plus a rewrite
# applied to the sample and to all eight test inputs before anything is solved,
# so the shipped input matches the input format the question states.
_LINE_LABEL = re.compile(r"^[ 	]*Line[ 	]*\d+[ 	]*:[ 	]*", re.M)

INPUT_FIXES = {
    pid: (
        "test inputs literally contained the words 'Line 1: ' / 'Line 2: ' from "
        "the input-format description, so stdin did not match the format the "
        "question states; the labels are stripped.",
        lambda s: _LINE_LABEL.sub("", s),
    )
    for pid in (
        "G-015-1", "G-015-2", "G-015-3", "G-015-4", "G-015-5",
        "G-026-1", "G-026-2", "G-026-3", "G-026-4", "G-026-5",
    )
}


CORRECTIONS = {
    "G-001-3": (
        "test8 'a b a c d e' claimed '2 5' (the run a c d e, length 4). The run "
        "starting at index 1 — b a c d e — is also repeat-free and is length 5, "
        "so the earliest longest run is '1 5'."
    ),
    "G-001-5": (
        "test1 'A1B2A3B4' claimed start 4 and test6 '1A2B3A4' claimed start 3. "
        "Both name a later run of the same length as an earlier one: 'A1B2A3B4' "
        "has '1B2A3' at 1-based 2, and '1A2B3A4' has '1A2B3' at 1-based 1. The "
        "task asks for the smallest start index on ties."
    ),
    "G-002-5": (
        "test6 'XYZABCYZA' with Z>=2, A>=1 claimed 'ZABCYZA' (length 7). The two "
        "Z's sit at indices 2 and 7 and an A sits at index 3, so 'ZABCYZ' "
        "(length 6) already satisfies every requirement."
    ),
    "M-007-1": (
        "test5 'AAAA' / 'AA' claimed 'AA', which is the *longest* common "
        "repeating unit. The task asks for the shortest, and 'A' repeats to "
        "build both strings. The other seven tests do not distinguish the two "
        "readings, so test5 was the only place the longest answer showed up."
    ),
    "M-007-2": (
        "test5 'AAAA' / 'AA' claimed 'AA', which is the *longest* common "
        "repeating unit. The task asks for the shortest, and 'A' repeats to "
        "build both strings. The other seven tests do not distinguish the two "
        "readings, so test5 was the only place the longest answer showed up."
    ),
    "M-007-3": (
        "test5 'AAAA' / 'AA' claimed 'AA', which is the *longest* common "
        "repeating unit. The task asks for the shortest, and 'A' repeats to "
        "build both strings. The other seven tests do not distinguish the two "
        "readings, so test5 was the only place the longest answer showed up."
    ),
    "M-007-4": (
        "test5 'AAAA' / 'AA' claimed 'AA', which is the *longest* common "
        "repeating unit. The task asks for the shortest, and 'A' repeats to "
        "build both strings. The other seven tests do not distinguish the two "
        "readings, so test5 was the only place the longest answer showed up."
    ),
    "M-007-5": (
        "test5 'AAAA' / 'AA' claimed 'AA', which is the *longest* common "
        "repeating unit. The task asks for the shortest, and 'A' repeats to "
        "build both strings. The other seven tests do not distinguish the two "
        "readings, so test5 was the only place the longest answer showed up."
    ),
    "P-020-1": (
        "test6 '-1 -2 -3' claimed the second median is -2.5. After two "
        "arrivals the multiset is {-2, -1}, whose median is (-2 + -1)/2 = -1.5. "
        "(-2.5 would be the mean of -2 and -3, which have not both arrived.)"
    ),
    "P-020-2": (
        "test6 '-1 -2 -3' claimed the second median is -2.5. After two "
        "arrivals the multiset is {-2, -1}, whose median is (-2 + -1)/2 = -1.5. "
        "(-2.5 would be the mean of -2 and -3, which have not both arrived.)"
    ),
    "P-020-3": (
        "test6 '-1 -2 -3' claimed the second median is -2.5. After two "
        "arrivals the multiset is {-2, -1}, whose median is (-2 + -1)/2 = -1.5. "
        "(-2.5 would be the mean of -2 and -3, which have not both arrived.)"
    ),
    "P-020-4": (
        "test6 '-1 -2 -3' claimed the second median is -2.5. After two "
        "arrivals the multiset is {-2, -1}, whose median is (-2 + -1)/2 = -1.5. "
        "(-2.5 would be the mean of -2 and -3, which have not both arrived.)"
    ),
    "P-020-5": (
        "test6 '-1 -2 -3' claimed the second median is -2.5. After two "
        "arrivals the multiset is {-2, -1}, whose median is (-2 + -1)/2 = -1.5. "
        "(-2.5 would be the mean of -2 and -3, which have not both arrived.)"
    ),
    "P-011-2": (
        "test7 '2 202' claimed 200, which is the cost of stepping +1 all the way "
        "and never using rev(x). A 23-move route exists: 2..12, rev to 21, down "
        "to 19, rev to 91, down to 89, rev to 98, up to 102, rev to 201, +1."
    ),
    "P-011-3": (
        "test6 '1 16 3 5' claimed 4. Using +A once and then doubling twice — "
        "1 -> 4 -> 8 -> 16 — reaches the target in 3 moves."
    ),
    "P-013-4": (
        "test4 '100 1 1 1' claimed cost 3 from start 2. Starting on step 2 and "
        "jumping straight to step 4 costs 1 + 1 = 2, and two-step jumps are "
        "allowed, so the minimum is 2."
    ),
    "P-013-5": (
        "test8 '1 3 2 5 4' with P=1 claimed 6. Jumping 1->3->5 costs "
        "|2-1| + 1 + |4-2| + 1 = 5."
    ),
    "P-006-4": (
        "test6 (W..X / ..X. / W..X) claimed '2 2' plus two cells, but the '.' at "
        "row 2, column 4 is walled off from both W cells, so the stated rule "
        "gives IMPOSSIBLE. test8 (WXX / XXX / XXW) claimed IMPOSSIBLE although it "
        "has no '.' cells at all, which the question says must print '0 0'."
    ),
    "P-006-5": (
        "test3 queried node 2, which is itself the hospital, and claimed distance "
        "1 instead of 0. test4 claimed distance 3 for node 4 on the path "
        "1-2-3-4-5-6 with hospitals {1,6}; node 4 is two hops from 6."
    ),
    "P-007-1": (
        "test5 lists the edge '1 3 0', so intersection 3 is one road away from "
        "intersection 1 and no alternation is needed. The claimed answer 3 walks "
        "1-2-1-3 instead."
    ),
    "P-007-2": (
        "test5 claimed 2, which requires taking portal 1-3 (type Beta) followed by "
        "3-4 (also Beta) — two portals of the same type in a row. Every route to "
        "room 4 repeats a type, so the answer is -1."
    ),
    "P-007-3": (
        "test6 claimed 4. The edges 1-3 (Push), 3-4 (Pull), 4-5 (Push) already "
        "alternate and reach station 5 in 3 moves."
    ),
    "P-007-4": (
        "test6 claimed 3 on the same graph as P-007-1 test5: the passage '1 3 0' "
        "connects chamber 1 to chamber 3 directly, so the answer is 1."
    ),
    "P-008-4": (
        "test7 (111 / 110) is one five-cell component touching the border. Its "
        "perimeter is 10, not the claimed 8 — a 5-cell L has 10 exposed sides."
    ),
    "P-008-5": (
        "test7 (1110 / 1110 / 0001 / 0001) has a 2x3 block (perimeter 10) and a "
        "2x1 block (perimeter 6). The top two by area sum to 16, not 18."
    ),
    "P-001-5": (
        "test7 '10 1 1 10' with 2 servers claimed 12. Cutting after the second "
        "job gives [10,1] and [1,10], so the largest load is 11."
    ),
    "P-003-2": (
        "test6 '10 20' with T=3 claimed 20. At rate 10 the files take "
        "ceil(10/10) + ceil(20/10) = 3 seconds, which already fits, so the "
        "minimum rate is 10. test5 is the same array with T=4 and does say 10."
    ),
    "P-003-3": (
        "test6 '10 10 10 10' with M=6 and test8 '10 10' with M=3 both claimed 7, "
        "which is the answer you get by dividing the *total* by the time budget. "
        "Each batch is inspected separately, so the cost is sum(ceil(size/B)): at "
        "B=7 test6 needs 8 minutes and test8 needs 4. Both answers are 10."
    ),
    "P-003-4": (
        "test3 '7 9' with K=3 claimed 5, the answer for a 4-hour budget (and the "
        "value P-003-5 test1 gives for the same array). At 5 pages/hour the two "
        "chapters need ceil(7/5) + ceil(9/5) = 4 hours. The answer for K=3 is 7."
    ),
    "P-003-5": (
        "test5 '100 100' with H=5 claimed 40. At 40 kW each vehicle needs "
        "ceil(100/40) = 3 hours, so 6 in total. 50 kW finishes in 4."
    ),
    "P-004-2": (
        "test2 '5 5 5 5' with k=3 claimed '10 3'. The minimal largest sum is "
        "indeed 10, but the question then asks for the smallest number of groups "
        "that achieves it, and [5,5] [5,5] achieves 10 with 2 groups."
    ),
    "P-004-4": (
        "test5 '3 1 2 1 1' with k=3, M=2 claimed 4. Grouping as [3] [1,2] [1,1] "
        "obeys both limits and has largest sum 3."
    ),
    "P-006-1": (
        "test8's last row claimed '0 1 0', which repeats row 0 rather than "
        "describing row 2. Row 2 is '. C .': the charger sits in the middle, so "
        "the distances are '1 0 1'."
    ),
    "G-024-2": (
        "test6 '40 30 20 10' with T=100 claimed -1, but the whole set sums to "
        "exactly 100, so '1 2 3 4' is a valid subset. test8 '5 1 4 4' with T=9 "
        "claimed '1', a single index holding 5; the lexicographically smallest "
        "subset that actually sums to 9 is '1 3' (5 + 4)."
    ),
    "G-026-3": (
        "test7 '20 10' listed only the two alternating combinations. Choosing 10 "
        "non-adjacent indices out of 20 has C(11,10) = 11 solutions — for example "
        "'1 3 5 7 9 11 13 15 17 20' is also valid."
    ),
    "G-026-4": (
        "test6 listed only '1 2 3 4 5'. The array holds eleven further 1s at "
        "indices 6..16, and any of them can stand in for index 1 alongside "
        "2 3 4 5, so there are 12 valid combinations."
    ),
    "G-018-3": (
        "test4 '9 8 7 6 5' with k=3 claimed 3. The 3rd largest is 7 at every "
        "prefix from length 3 on, so the only change is the first definition: 1."
    ),
    "G-018-5": (
        "test1 queried p=3 on '5 1 3 6 4 2 7' with k=3 and claimed 5. The first "
        "three values are 5, 1, 3; their 3rd largest is 1, not 5. The other two "
        "queries in the same test were already right."
    ),
    "G-022-3": (
        "test4 and test7 disagree with the reach rule the question states (a move "
        "from checkpoint p with reach d lands on any later checkpoint at position "
        "<= p + d). test4 (0/6, 2/4, 6/3, 10/0) cannot reach L=10 at all — from "
        "position 6 the reach is 9 — so the answer is -1, not 2. test7 (0/2, 2/3, "
        "5/2, 7/3, 10/0) forces 0->2->5->7->10, which is 4 moves, not 3."
    ),
    "G-023-3": (
        "test8 'abacbdade' claimed '7 1 1'. That splits after index 6, which puts "
        "the 'd' at index 5 in one block and the 'd' at index 7 in another — the "
        "one thing the partition forbids. The greedy closure gives '8 1'."
    ),
    "G-023-5": (
        "test8 'abacbdade' claimed '7 1 1'; same defect as G-023-3, which ships "
        "the identical case. Splitting after index 6 separates the two 'd's. The "
        "correct partition is '8 1'."
    ),
    "G-015-4": (
        "test4 '5 4 3 2' claimed '-1 -1 -1 -1', which is the non-circular answer. "
        "The task allows one wrap, and 5 sits to the right of 4, 3 and 2 once you "
        "wrap, so the answer is '-1 5 5 5'. The question's other tests (notably "
        "'-5 -6 -7 -5' and '3 1 2') do use the wrap, so test4 was the outlier."
    ),
    "G-005-1": (
        "test1 '1 2 3 -1 0' with target 5 claimed 2. Three subarrays sum to 5: "
        "[2,3], [1,2,3,-1] and [1,2,3,-1,0]."
    ),
    "G-005-5": (
        "test6 '3 3 3 0' with target 6 claimed 2. Three subarrays sum to 6: "
        "[3,3] at positions 1-2, [3,3] at 2-3, and [3,3,0] at 2-4."
    ),
}
