## B-001 — Elementwise Normalization

**RANK:** Bronze

**PRIMARY TOPICS:** Arrays, loops

**SECONDARY TOPICS:** Arithmetic, transformation

**CORE TECHNIQUE:** One-pass mapping

**PROBLEM STRUCTURE:** Apply an independent stated rule to each value.

**REQUIRED INSIGHT:** Directly apply one-pass mapping to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** Unlike filtering or aggregation, every input position survives and is transformed independently.

**ALLOWED VARIATIONS:** Change the normalization rule, output shape, or whether the result is printed or stored.

**FORBIDDEN VARIATIONS:** Cross-element dependencies, sorting requirements, or multi-pass optimization.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n).

**COMMON TRAPS:** Overflow, negative values, accidental in-place aliasing.

**GENERATION NOTES:** Use a rule evaluable from one value; ensure sample values expose sign and boundary behavior.

## B-002 — Fixed Positional Reordering

**RANK:** Bronze

**PRIMARY TOPICS:** Arrays, indexing

**SECONDARY TOPICS:** Position mapping, iteration

**CORE TECHNIQUE:** Index remapping

**PROBLEM STRUCTURE:** Place each item at the position determined by a simple fixed formula.

**REQUIRED INSIGHT:** Directly apply index remapping to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** The answer is defined by an index permutation rather than by value-based selection.

**ALLOWED VARIATIONS:** Reverse, rotate by a stated offset, interleave halves, or move even positions before odd positions.

**FORBIDDEN VARIATIONS:** Data-dependent permutations, repeated operations, or cycle-detection requirements.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n).

**COMMON TRAPS:** Zero/one indexing, offset normalization, overwriting unread values.

**GENERATION NOTES:** Specify whether a fresh output sequence is expected; keep the positional rule closed-form.

## B-003 — Segment-Local Transformation

**RANK:** Bronze

**PRIMARY TOPICS:** Arrays, loops

**SECONDARY TOPICS:** Bounds checking, mutation

**CORE TECHNIQUE:** Bounded scan

**PROBLEM STRUCTURE:** Apply one simple operation only inside a clearly identified valid interval.

**REQUIRED INSIGHT:** Directly apply bounded scan to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** It tests safe local scope control rather than selecting an interval algorithmically.

**ALLOWED VARIATIONS:** Transform, reverse, replace, or negate a supplied segment.

**FORBIDDEN VARIATIONS:** Choosing the segment by optimization, overlapping operations, or range-query data structures.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; one segment; O(n).

**COMMON TRAPS:** Inclusive endpoints, empty segment policy, unaffected boundary elements.

**GENERATION NOTES:** Supply endpoints directly and guarantee their validity unless validation is the stated task.

## B-004 — Conditional Element Filtering

**RANK:** Bronze

**PRIMARY TOPICS:** Arrays, conditionals

**SECONDARY TOPICS:** Counters, output construction

**CORE TECHNIQUE:** Predicate scan

**PROBLEM STRUCTURE:** Emit precisely the elements that satisfy one visible independent predicate.

**REQUIRED INSIGHT:** Directly apply predicate scan to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** The central decision is retention versus removal, not counting or optimizing retained elements.

**ALLOWED VARIATIONS:** Filter by threshold, parity, divisibility, category label, or character class.

**FORBIDDEN VARIATIONS:** Predicates depending on neighboring/global elements or stable-partition optimization.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n).

**COMMON TRAPS:** Empty result, preserve original order, predicate wording.

**GENERATION NOTES:** Use a one-clause predicate and make ordering requirement explicit.

## B-005 — Run-Length Description

**RANK:** Bronze

**PRIMARY TOPICS:** Strings, arrays

**SECONDARY TOPICS:** Counters, local comparison

**CORE TECHNIQUE:** Run scan

**PROBLEM STRUCTURE:** Summarize consecutive equal items into values and run lengths.

**REQUIRED INSIGHT:** Directly apply run scan to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** It groups by adjacency, unlike frequency counting which ignores order.

**ALLOWED VARIATIONS:** Return run count, encoded pairs, longest run, or a textual compression.

**FORBIDDEN VARIATIONS:** Nested compression, optimal encoding choices, or decoding ambiguity.

**RECOMMENDED CONSTRAINT RANGE:** n 1–100,000; O(n).

**COMMON TRAPS:** Final run flush, one-element input, delimiter formatting.

**GENERATION NOTES:** Use an unambiguous output convention and ensure values fit a simple representation.

## B-006 — Alternating Position Update

**RANK:** Bronze

**PRIMARY TOPICS:** Arrays, loops

**SECONDARY TOPICS:** Parity, simulation

**CORE TECHNIQUE:** Parity-driven scan

**PROBLEM STRUCTURE:** Apply one of two stated actions based solely on an element's position parity.

**REQUIRED INSIGHT:** Directly apply parity-driven scan to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** The same input value can receive different treatment because of index class, not value class.

**ALLOWED VARIATIONS:** Odd/even positions, repeating period two, alternating sum, or alternating case.

**FORBIDDEN VARIATIONS:** Periods requiring state machines, interaction between operations, or cyclic optimization.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n).

**COMMON TRAPS:** Whether positions start at zero or one, odd-length tail.

**GENERATION NOTES:** State the indexing convention in the first sentence.

## B-007 — Single Extremum with Witness

**RANK:** Bronze

**PRIMARY TOPICS:** Arrays, scanning

**SECONDARY TOPICS:** Comparison, index tracking

**CORE TECHNIQUE:** Reduction

**PROBLEM STRUCTURE:** Find an extreme value while preserving the required associated witness, such as first position.

**REQUIRED INSIGHT:** Directly apply reduction to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** It adds deterministic tie handling to a basic reduction without introducing ranking.

**ALLOWED VARIATIONS:** Minimum/maximum, earliest/latest tie, value-only or value-and-index output.

**FORBIDDEN VARIATIONS:** Second-best tracking, top-k, or dynamic updates.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n).

**COMMON TRAPS:** Tie policy, all-equal input, sentinel initialization.

**GENERATION NOTES:** Explicitly name how ties are resolved.

## B-008 — Predicate Count

**RANK:** Bronze

**PRIMARY TOPICS:** Arrays, loops

**SECONDARY TOPICS:** Conditionals, counters

**CORE TECHNIQUE:** Counting reduction

**PROBLEM STRUCTURE:** Count how many independent elements meet one stated property.

**REQUIRED INSIGHT:** Directly apply counting reduction to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** It produces a cardinality, unlike filtering which requires output construction.

**ALLOWED VARIATIONS:** Threshold, parity, sign, divisibility, character category, or equality predicates.

**FORBIDDEN VARIATIONS:** Pair/global properties, multiple interacting predicates, or frequency-map necessity.

**RECOMMENDED CONSTRAINT RANGE:** n 1–500,000; O(n).

**COMMON TRAPS:** Strict versus non-strict comparisons, counter width.

**GENERATION NOTES:** Keep the property independently decidable for each element.

## B-009 — Conditional Aggregate

**RANK:** Bronze

**PRIMARY TOPICS:** Arrays, arithmetic

**SECONDARY TOPICS:** Predicate, accumulator

**CORE TECHNIQUE:** Filtered reduction

**PROBLEM STRUCTURE:** Aggregate selected items under one associative operation such as sum.

**REQUIRED INSIGHT:** Directly apply filtered reduction to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** Selection and aggregation are both visible but neither needs a data structure.

**ALLOWED VARIATIONS:** Sum, product under safe limits, sum of digits, or count-and-sum summary.

**FORBIDDEN VARIATIONS:** Median, dynamic extrema, or conditions based on aggregate history.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n).

**COMMON TRAPS:** Overflow, identity value for no matches, predicate order.

**GENERATION NOTES:** Constrain values so the intended numeric type is clear.

## B-010 — First Visible Match

**RANK:** Bronze

**PRIMARY TOPICS:** Arrays, linear search

**SECONDARY TOPICS:** Conditionals, early exit

**CORE TECHNIQUE:** Linear search

**PROBLEM STRUCTURE:** Locate the first position satisfying a supplied simple condition.

**REQUIRED INSIGHT:** Directly apply linear search to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** Order is essential because the objective is first occurrence, unlike general membership.

**ALLOWED VARIATIONS:** Exact target, threshold crossing, first class match, or first adjacent pattern.

**FORBIDDEN VARIATIONS:** Binary search, many queries, or nonlocal predicates.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n).

**COMMON TRAPS:** No match, index base, early termination.

**GENERATION NOTES:** Make the sequential-order requirement explicit.

## B-011 — Adjacent Relationship Check

**RANK:** Bronze

**PRIMARY TOPICS:** Arrays, loops

**SECONDARY TOPICS:** Local comparison, boolean

**CORE TECHNIQUE:** Neighbor scan

**PROBLEM STRUCTURE:** Decide whether every or any adjacent pair obeys a stated local relationship.

**REQUIRED INSIGHT:** Directly apply neighbor scan to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** Only consecutive positions interact; no global rearrangement or set reasoning is required.

**ALLOWED VARIATIONS:** Nondecreasing, bounded difference, alternation, or no equal neighbors.

**FORBIDDEN VARIATIONS:** Circular adjacency unless explicitly simple, longest segment, or sorting first.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n).

**COMMON TRAPS:** Length zero/one, direction wording, final pair.

**GENERATION NOTES:** Use one binary relation and clarify universal versus existential objective.

## B-012 — Best Adjacent Pair

**RANK:** Bronze

**PRIMARY TOPICS:** Arrays, arithmetic

**SECONDARY TOPICS:** Neighbor scan, reduction

**CORE TECHNIQUE:** Local optimization scan

**PROBLEM STRUCTURE:** Evaluate every consecutive pair and retain the best stated local score.

**REQUIRED INSIGHT:** Directly apply local optimization scan to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** The candidate space is fixed by adjacency, unlike pair-search over arbitrary indices.

**ALLOWED VARIATIONS:** Largest sum, smallest difference, strongest product under safe bounds, or pair index.

**FORBIDDEN VARIATIONS:** Non-adjacent pairing, variable-length windows, or sorting-based pairing.

**RECOMMENDED CONSTRAINT RANGE:** n 2–200,000; O(n).

**COMMON TRAPS:** Tie rule, negative values, overflow.

**GENERATION NOTES:** Specify whether the score or the pair position is required.

## B-013 — Simple Frequency Tally

**RANK:** Bronze

**PRIMARY TOPICS:** Arrays, strings

**SECONDARY TOPICS:** Counters, small alphabet

**CORE TECHNIQUE:** Direct tally

**PROBLEM STRUCTURE:** Count occurrences for a guaranteed small and explicit domain.

**REQUIRED INSIGHT:** Directly apply direct tally to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** It uses a direct bounded counter array rather than choosing a hash-based representation.

**ALLOWED VARIATIONS:** Digit counts, lowercase letters, colors, days, or small ratings.

**FORBIDDEN VARIATIONS:** Large/unbounded keys, multiple relational frequency conditions, or sorting by count.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; domain at most 100.

**COMMON TRAPS:** Character conversion, absent categories, output order.

**GENERATION NOTES:** Name the bounded domain and require a fixed reporting order.

## B-014 — Most Common in Fixed Domain

**RANK:** Bronze

**PRIMARY TOPICS:** Arrays, counting

**SECONDARY TOPICS:** Tie handling, small frequency array

**CORE TECHNIQUE:** Frequency reduction

**PROBLEM STRUCTURE:** Identify the best frequency category when all categories are drawn from a tiny declared domain.

**REQUIRED INSIGHT:** Directly apply frequency reduction to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** This is a bounded tally followed by one deterministic extremum scan, not general hash-map reasoning.

**ALLOWED VARIATIONS:** Most/least common digit, color, rating, or answer option.

**FORBIDDEN VARIATIONS:** Unbounded identifiers, top-k reporting, or custom sort by frequency.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; domain at most 100.

**COMMON TRAPS:** Tie rule, categories with zero count, initialization.

**GENERATION NOTES:** Give a fixed tie policy and small category universe.

## B-015 — Palindrome Inspection

**RANK:** Bronze

**PRIMARY TOPICS:** Strings, two-end scan

**SECONDARY TOPICS:** Character comparison, normalization

**CORE TECHNIQUE:** Symmetric comparison

**PROBLEM STRUCTURE:** Compare mirrored positions to decide whether one sequence reads identically in reverse.

**REQUIRED INSIGHT:** Directly apply symmetric comparison to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** The only relationship is symmetry; it is not a general string-matching task.

**ALLOWED VARIATIONS:** Case-sensitive text, digits, arrays, or ignoring a supplied simple separator class.

**FORBIDDEN VARIATIONS:** Arbitrary deletions, near-palindrome optimization, or substring search.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n).

**COMMON TRAPS:** Middle character, normalization order, empty input.

**GENERATION NOTES:** If ignoring characters, make the skip rule simple and explicit.

## B-016 — Mirror Mismatch Count

**RANK:** Bronze

**PRIMARY TOPICS:** Strings, arrays

**SECONDARY TOPICS:** Symmetric indexing, count

**CORE TECHNIQUE:** Symmetric reduction

**PROBLEM STRUCTURE:** Count mirrored position pairs that disagree.

**REQUIRED INSIGHT:** Directly apply symmetric reduction to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** It quantifies deviation from symmetry rather than merely deciding palindrome status.

**ALLOWED VARIATIONS:** Character mismatches, numeric absolute mismatch sum, or mismatch positions.

**FORBIDDEN VARIATIONS:** Minimum edits with choices, rotations, or arbitrary pairing.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n).

**COMMON TRAPS:** Do not double-count pairs, odd middle element.

**GENERATION NOTES:** Use a fixed mirror definition and one simple contribution per pair.

## B-017 — Character-Class Summary

**RANK:** Bronze

**PRIMARY TOPICS:** Strings, loops

**SECONDARY TOPICS:** Classification, counters

**CORE TECHNIQUE:** Character scan

**PROBLEM STRUCTURE:** Produce a multi-counter summary across visible character classes.

**REQUIRED INSIGHT:** Directly apply character scan to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** It practices reliable classification into disjoint categories rather than pattern recognition.

**ALLOWED VARIATIONS:** Vowels/consonants, uppercase/lowercase/digits, punctuation, or custom listed symbols.

**FORBIDDEN VARIATIONS:** Unicode normalization, overlapping class rules, or regular expressions.

**RECOMMENDED CONSTRAINT RANGE:** length 1–200,000; O(n).

**COMMON TRAPS:** Class precedence, spaces, empty groups.

**GENERATION NOTES:** Define classes as explicit ASCII-like sets or ranges.

## B-018 — Digit Decomposition Aggregate

**RANK:** Bronze

**PRIMARY TOPICS:** Integers, arithmetic

**SECONDARY TOPICS:** Modulo, division

**CORE TECHNIQUE:** Digit iteration

**PROBLEM STRUCTURE:** Repeatedly extract decimal digits and aggregate an independent digit property.

**REQUIRED INSIGHT:** Directly apply digit iteration to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** The structure is arithmetic digit extraction rather than string parsing or number theory.

**ALLOWED VARIATIONS:** Digit sum, digit product, count a digit, reverse digits, or digit parity count.

**FORBIDDEN VARIATIONS:** Huge integer strings, base conversion with complex rules, or digit DP.

**RECOMMENDED CONSTRAINT RANGE:** absolute value up to 10^18; O(number of digits).

**COMMON TRAPS:** Zero, negative sign, leading-zero interpretation.

**GENERATION NOTES:** Specify the treatment of zero and sign before the objective.

## B-019 — Elementary Number Classification

**RANK:** Bronze

**PRIMARY TOPICS:** Arithmetic, conditionals

**SECONDARY TOPICS:** Modulo, bounds

**CORE TECHNIQUE:** Direct property test

**PROBLEM STRUCTURE:** Classify a number using one elementary property with a short deterministic test.

**REQUIRED INSIGHT:** Directly apply direct property test to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** It uses a visible arithmetic condition, not factorization or theorem discovery.

**ALLOWED VARIATIONS:** Parity, divisibility by a small constant, sign, range membership, or leap-year rule.

**FORBIDDEN VARIATIONS:** Primality for large values, GCD across many numbers, or modular constructions.

**RECOMMENDED CONSTRAINT RANGE:** values up to 10^18 when constant-time; O(1).

**COMMON TRAPS:** Negative values, zero, equality boundaries.

**GENERATION NOTES:** Keep the test formula supplied or universally elementary.

## B-020 — Simple Divisor Scan

**RANK:** Bronze

**PRIMARY TOPICS:** Arithmetic, loops

**SECONDARY TOPICS:** Modulo, counting

**CORE TECHNIQUE:** Bounded enumeration

**PROBLEM STRUCTURE:** Inspect a small permitted range of candidate divisors to derive a divisor-related answer.

**REQUIRED INSIGHT:** Directly apply bounded enumeration to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** It teaches enumerate-and-test, distinct from using factorization or sieve techniques.

**ALLOWED VARIATIONS:** Count divisors, list divisors, smallest divisor, or proper-divisor sum.

**FORBIDDEN VARIATIONS:** Large bounds needing square-root optimization, prime factorization, or many queries.

**RECOMMENDED CONSTRAINT RANGE:** n up to 100,000; O(n) candidate scan.

**COMMON TRAPS:** Divisor pairs, n=1, output order.

**GENERATION NOTES:** Keep the numerical range deliberately small and mention positive integer input.

## B-021 — Two-Dimensional Cell Transformation

**RANK:** Bronze

**PRIMARY TOPICS:** Matrices, loops

**SECONDARY TOPICS:** Coordinates, mutation

**CORE TECHNIQUE:** Nested iteration

**PROBLEM STRUCTURE:** Apply a coordinate-local rule independently to every grid cell.

**REQUIRED INSIGHT:** Directly apply nested iteration to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** It is a rectangular traversal task, not grid search or neighbor propagation.

**ALLOWED VARIATIONS:** Scale entries, replace border cells, transpose a square matrix, or negate a checkerboard class.

**FORBIDDEN VARIATIONS:** Pathfinding, neighbor-dependent updates, ragged grids, or repeated transforms.

**RECOMMENDED CONSTRAINT RANGE:** rows×cols up to 200,000; O(rows×cols).

**COMMON TRAPS:** Row/column order, square-only transpose, in-place overwrite.

**GENERATION NOTES:** Use rectangular grids and ensure the transformation is locally defined.

## B-022 — Matrix Row or Column Reduction

**RANK:** Bronze

**PRIMARY TOPICS:** Matrices, scanning

**SECONDARY TOPICS:** Accumulators, index tracking

**CORE TECHNIQUE:** Axis reduction

**PROBLEM STRUCTURE:** Compute an independent aggregate for each row or column and report a selected summary.

**REQUIRED INSIGHT:** Directly apply axis reduction to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** The main reasoning is choosing and scanning one matrix axis, not 2D optimization.

**ALLOWED VARIATIONS:** Row sums, column maxima, count marked cells per row, or best row index.

**FORBIDDEN VARIATIONS:** Submatrix optimization, prefix matrices, or row/column interactions.

**RECOMMENDED CONSTRAINT RANGE:** rows×cols up to 200,000; O(rows×cols).

**COMMON TRAPS:** Tie policy, empty dimensions, accumulator reset.

**GENERATION NOTES:** State whether rows or columns are the units being summarized.

## B-023 — Grid Motion Simulation

**RANK:** Bronze

**PRIMARY TOPICS:** Simulation, grids

**SECONDARY TOPICS:** Coordinates, conditionals

**CORE TECHNIQUE:** Deterministic state update

**PROBLEM STRUCTURE:** Execute a short sequence of moves from a known state under simple boundary rules.

**REQUIRED INSIGHT:** Directly apply deterministic state update to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** The answer follows prescribed transitions; there is no choice or search.

**ALLOWED VARIATIONS:** Cardinal movement, clamp-at-edge, wraparound, or obstacle-free movement.

**FORBIDDEN VARIATIONS:** Path optimization, branching decisions, complex collision rules, or BFS.

**RECOMMENDED CONSTRAINT RANGE:** grid area and moves up to 200,000; O(moves).

**COMMON TRAPS:** Coordinate orientation, invalid moves, final versus visited output.

**GENERATION NOTES:** Use one actor and explicitly define boundary behavior.

## B-024 — One-Variable Resource Simulation

**RANK:** Bronze

**PRIMARY TOPICS:** Simulation, arithmetic

**SECONDARY TOPICS:** State update, conditionals

**CORE TECHNIQUE:** Sequential simulation

**PROBLEM STRUCTURE:** Update one small numeric state by a supplied sequence of deterministic events.

**REQUIRED INSIGHT:** Directly apply sequential simulation to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** It measures faithful ordered state tracking rather than optimizing event order.

**ALLOWED VARIATIONS:** Balance changes, temperature changes, scorekeeping, or inventory delta with floor zero.

**FORBIDDEN VARIATIONS:** Multiple interacting resources, choices, rollback, or priority scheduling.

**RECOMMENDED CONSTRAINT RANGE:** events up to 200,000; O(events).

**COMMON TRAPS:** Update order, clamping, overflow.

**GENERATION NOTES:** Limit to one state variable plus at most one stated clamp rule.

## B-025 — Simple Sortedness Preparation

**RANK:** Bronze

**PRIMARY TOPICS:** Arrays, sorting

**SECONDARY TOPICS:** Comparator, output

**CORE TECHNIQUE:** Basic sorting

**PROBLEM STRUCTURE:** Reorder one sequence under an explicitly supplied standard order.

**REQUIRED INSIGHT:** Directly apply basic sorting to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** The task is invoking and using ordinary sorting, not exploiting sorted order afterward.

**ALLOWED VARIATIONS:** Ascending/descending numbers, lexicographic words, sort by stated single key.

**FORBIDDEN VARIATIONS:** Custom multi-key rules, inversion counting, or sort-plus-greedy decisions.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n log n).

**COMMON TRAPS:** Numeric vs lexicographic order, stable ties, output formatting.

**GENERATION NOTES:** Use a built-in-comparator-compatible key.

## B-026 — Direct Sequence Construction

**RANK:** Bronze

**PRIMARY TOPICS:** Arrays, construction

**SECONDARY TOPICS:** Arithmetic progression, output

**CORE TECHNIQUE:** Formulaic construction

**PROBLEM STRUCTURE:** Build a sequence whose every value follows an immediately stated positional formula.

**REQUIRED INSIGHT:** Directly apply formulaic construction to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** No search is needed: each output entry is independently determined.

**ALLOWED VARIATIONS:** Arithmetic progression, repeated pattern, alternating constants, or index-derived values.

**FORBIDDEN VARIATIONS:** Constraint satisfaction, permutations with global conditions, or backtracking.

**RECOMMENDED CONSTRAINT RANGE:** output length up to 200,000; O(n).

**COMMON TRAPS:** Index base, overflow, separator formatting.

**GENERATION NOTES:** Give a formula that does not depend on previous choices.

## B-027 — Prefix Running Summary

**RANK:** Bronze

**PRIMARY TOPICS:** Arrays, loops

**SECONDARY TOPICS:** Accumulator, output

**CORE TECHNIQUE:** Streaming prefix computation

**PROBLEM STRUCTURE:** Output the evolving value of a simple associative aggregate after each prefix.

**REQUIRED INSIGHT:** Directly apply streaming prefix computation to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** It retains history only through one accumulator, unlike prefix-query preprocessing.

**ALLOWED VARIATIONS:** Running sum, running maximum, running parity, or running count of a property.

**FORBIDDEN VARIATIONS:** Offline range queries, dynamic updates, or multiple dependent aggregates.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n).

**COMMON TRAPS:** Initial value, output length, negative sums.

**GENERATION NOTES:** Require output for every prefix and choose an associative/simple accumulator.

## B-028 — Simple Token Transformation

**RANK:** Bronze

**PRIMARY TOPICS:** Strings, parsing

**SECONDARY TOPICS:** Whitespace split, case conversion

**CORE TECHNIQUE:** Token scan

**PROBLEM STRUCTURE:** Apply one independent transformation to each already-delimited token.

**REQUIRED INSIGHT:** Directly apply token scan to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** The string structure is shallow and token-local, not a grammar or parsing challenge.

**ALLOWED VARIATIONS:** Capitalize words, reverse each token, replace a listed token, or attach indices.

**FORBIDDEN VARIATIONS:** Quoted parsing, nested syntax, regular expressions, or cross-token optimization.

**RECOMMENDED CONSTRAINT RANGE:** total length 1–200,000; O(length).

**COMMON TRAPS:** Multiple spaces, punctuation treatment, reconstruction separator.

**GENERATION NOTES:** Provide a normalized delimiter convention.

## B-029 — Circular Index Lookup

**RANK:** Bronze

**PRIMARY TOPICS:** Arrays, modular arithmetic

**SECONDARY TOPICS:** Index normalization, search

**CORE TECHNIQUE:** Wrapped scan

**PROBLEM STRUCTURE:** Access or scan a sequence with a single wraparound convention.

**REQUIRED INSIGHT:** Directly apply wrapped scan to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** Modulo indexing is the only new element; no cyclic optimization or deque logic is needed.

**ALLOWED VARIATIONS:** Next item, fixed forward jumps, circular shift readout, or circular neighbor check.

**FORBIDDEN VARIATIONS:** Variable jumps with cycle detection, longest circular subarray, or repeated mutation.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n).

**COMMON TRAPS:** Negative modulo, n=1, wrap boundary.

**GENERATION NOTES:** Restrict to one traversal direction and a simple fixed offset rule.

## B-030 — Componentwise Sequence Combination

**RANK:** Bronze

**PRIMARY TOPICS:** Arrays, loops

**SECONDARY TOPICS:** Parallel indexing, arithmetic

**CORE TECHNIQUE:** Parallel scan

**PROBLEM STRUCTURE:** Combine corresponding items from two equally sized sequences under one direct pointwise rule.

**REQUIRED INSIGHT:** Directly apply parallel scan to the stated local rule; no hidden algorithmic reduction is required.

**UNIQUE DIFFERENTIATOR:** Unlike one-sequence transformation, each output position depends on its aligned partner but never on other positions.

**ALLOWED VARIATIONS:** Elementwise sum/difference, equality markers, pairwise maximum, or zipped string characters.

**FORBIDDEN VARIATIONS:** Mismatched-length alignment, cross-pair optimization, sorting, or stateful carries.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n).

**COMMON TRAPS:** Length promise, output order, numeric overflow.

**GENERATION NOTES:** Guarantee equal lengths and make each pair operation independent.

## S-001 — Duplicate Membership Detection

**RANK:** Silver

**PRIMARY TOPICS:** Arrays, sets

**SECONDARY TOPICS:** Hashing, early exit

**CORE TECHNIQUE:** Set membership

**PROBLEM STRUCTURE:** Decide whether any item has appeared before using a membership set.

**REQUIRED INSIGHT:** Recognize that set membership directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** Unlike fixed-domain counting, keys may be arbitrary and the goal is existence of a repeat.

**ALLOWED VARIATIONS:** Detect any duplicate, first repeated arrival, or duplicate in a stated stream.

**FORBIDDEN VARIATIONS:** Multiplicity optimization, sliding windows, or duplicate pair counting.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n) expected.

**COMMON TRAPS:** When to insert, self-comparison, arbitrary key range.

**GENERATION NOTES:** Keep one sequence and one repetition condition.

## S-002 — Target Pair Lookup

**RANK:** Silver

**PRIMARY TOPICS:** Arrays, hash maps

**SECONDARY TOPICS:** Complements, lookup

**CORE TECHNIQUE:** Complement search

**PROBLEM STRUCTURE:** Find or decide a pair satisfying one target relation through a stored complement/key.

**REQUIRED INSIGHT:** Recognize that complement search directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** The key insight is transforming a two-item relation into a constant-time lookup.

**ALLOWED VARIATIONS:** Sum target, difference target with orientation, XOR target, or return any witness pair.

**FORBIDDEN VARIATIONS:** Triples, all-pair enumeration, sorting requirement, or dynamic windows.

**RECOMMENDED CONSTRAINT RANGE:** n 2–300,000; O(n) expected.

**COMMON TRAPS:** Same-index reuse, duplicate keys, no-solution policy.

**GENERATION NOTES:** Use a relation whose inverse key is computable in O(1).

## S-003 — Frequency Threshold Classification

**RANK:** Silver

**PRIMARY TOPICS:** Arrays, hash maps

**SECONDARY TOPICS:** Counting, predicates

**CORE TECHNIQUE:** Frequency map

**PROBLEM STRUCTURE:** Classify or select values by whether their global occurrence count crosses a stated threshold.

**REQUIRED INSIGHT:** Recognize that frequency map directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** It requires a complete global frequency view, unlike direct small-domain tallying.

**ALLOWED VARIATIONS:** Unique values, repeated values, exactly-k frequency, or most frequent arbitrary key.

**FORBIDDEN VARIATIONS:** Top-k ties, frequency plus subarray conditions, or streaming-without-storage.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n) expected.

**COMMON TRAPS:** Threshold semantics, tie/report ordering, absent values.

**GENERATION NOTES:** Allow arbitrary identifiers while retaining one threshold condition.

## S-004 — Multiset Equality

**RANK:** Silver

**PRIMARY TOPICS:** Arrays, hash maps

**SECONDARY TOPICS:** Frequency comparison, matching

**CORE TECHNIQUE:** Count comparison

**PROBLEM STRUCTURE:** Decide whether two collections contain exactly the same elements with multiplicity.

**REQUIRED INSIGHT:** Recognize that count comparison directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** Order is irrelevant but duplicate counts are decisive, unlike simple set equality.

**ALLOWED VARIATIONS:** Arrays, words, characters, or two inventories.

**FORBIDDEN VARIATIONS:** Approximate matching, transformations with costs, or more than two collections.

**RECOMMENDED CONSTRAINT RANGE:** total n 1–300,000; O(n) expected.

**COMMON TRAPS:** Length precheck, decrement-to-zero handling, negative counts.

**GENERATION NOTES:** Use exactly two collections and equality under a clearly stated key normalization.

## S-005 — Anagram Signature Grouping

**RANK:** Silver

**PRIMARY TOPICS:** Strings, hashing

**SECONDARY TOPICS:** Canonicalization, grouping

**CORE TECHNIQUE:** Signature map

**PROBLEM STRUCTURE:** Group or compare strings by a canonical frequency/sorted signature.

**REQUIRED INSIGHT:** Recognize that signature map directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** It turns permutation equivalence into identity of a compact representation.

**ALLOWED VARIATIONS:** Find anagrams, group anagrams, count signature classes, or compare normalized labels.

**FORBIDDEN VARIATIONS:** Wildcards, edit distance, substring anagrams, or complex Unicode rules.

**RECOMMENDED CONSTRAINT RANGE:** total length 1–200,000; O(total length).

**COMMON TRAPS:** Case rules, signature collision avoidance, group order.

**GENERATION NOTES:** Use a small alphabet or permit sorted-string signatures.

## S-006 — Distinct-Count Windowless Summary

**RANK:** Silver

**PRIMARY TOPICS:** Arrays, sets

**SECONDARY TOPICS:** Cardinality, insertion

**CORE TECHNIQUE:** Set construction

**PROBLEM STRUCTURE:** Compute how many distinct keys occur in one complete collection.

**REQUIRED INSIGHT:** Recognize that set construction directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** It is a pure set-cardinality question, not a frequency threshold or moving-window problem.

**ALLOWED VARIATIONS:** Distinct words, colors, IDs, or union of two listed collections.

**FORBIDDEN VARIATIONS:** Subarray distinct counts, k-th distinct, or dynamic query updates.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n) expected.

**COMMON TRAPS:** Normalization, empty collection, union semantics.

**GENERATION NOTES:** One global collection or a direct union only.

## S-007 — First Unique by Global Frequency

**RANK:** Silver

**PRIMARY TOPICS:** Arrays, hash maps

**SECONDARY TOPICS:** Two-pass scan, frequency

**CORE TECHNIQUE:** Frequency then ordered scan

**PROBLEM STRUCTURE:** Return the earliest item whose global frequency has a stated uniqueness property.

**REQUIRED INSIGHT:** Recognize that frequency then ordered scan directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** It combines global counting with an order-sensitive witness, unlike unordered frequency classification.

**ALLOWED VARIATIONS:** First nonrepeating character, earliest single-occurrence ID, or earliest frequency-k item.

**FORBIDDEN VARIATIONS:** Sliding windows, online requirement, or complex tie objectives.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n) expected.

**COMMON TRAPS:** Second pass requirement, no witness, character encoding.

**GENERATION NOTES:** Keep the frequency criterion fixed and select by original order.

## S-008 — Common-Element Intersection

**RANK:** Silver

**PRIMARY TOPICS:** Arrays, sets

**SECONDARY TOPICS:** Membership, deduplication

**CORE TECHNIQUE:** Set intersection

**PROBLEM STRUCTURE:** Construct or count values shared by two collections under a stated multiplicity convention.

**REQUIRED INSIGHT:** Recognize that set intersection directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** The essential relationship is cross-collection membership, not pair targeting within one array.

**ALLOWED VARIATIONS:** Unique intersection, multiset intersection, count shared categories, or first shared element.

**FORBIDDEN VARIATIONS:** Three-way intersections, optimal matching costs, or interval intersection.

**RECOMMENDED CONSTRAINT RANGE:** total n 1–300,000; O(n) expected.

**COMMON TRAPS:** Multiplicity convention, output order, duplicate suppression.

**GENERATION NOTES:** State set versus multiset behavior explicitly.

## S-009 — Index-Value Association Lookup

**RANK:** Silver

**PRIMARY TOPICS:** Arrays, maps

**SECONDARY TOPICS:** Keyed storage, queries

**CORE TECHNIQUE:** Dictionary lookup

**PROBLEM STRUCTURE:** Answer independent direct queries by mapping each distinct key to an associated value.

**REQUIRED INSIGHT:** Recognize that dictionary lookup directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** It teaches use of a map as an addressable relation rather than as a frequency table.

**ALLOWED VARIATIONS:** Code-to-price lookup, name-to-score, last assignment wins, or direct existence queries.

**FORBIDDEN VARIATIONS:** Range queries, nested keys, aggregation per query, or conflict resolution beyond a stated rule.

**RECOMMENDED CONSTRAINT RANGE:** records plus queries up to 300,000; O(n+q) expected.

**COMMON TRAPS:** Duplicate-key policy, missing keys, query output order.

**GENERATION NOTES:** Give a simple deterministic overwrite or uniqueness promise.

## S-010 — Sorted Pair Convergence

**RANK:** Silver

**PRIMARY TOPICS:** Arrays, two pointers

**SECONDARY TOPICS:** Ordered comparison, target

**CORE TECHNIQUE:** Two-ended scan

**PROBLEM STRUCTURE:** Use two ends of an already sorted sequence to locate a target pair relationship.

**REQUIRED INSIGHT:** Recognize that two-ended scan directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** Both pointers move according to monotone comparison, unlike hash complement lookup.

**ALLOWED VARIATIONS:** Pair sum, pair difference, closest fixed target under simple output, or count a single equality relation.

**FORBIDDEN VARIATIONS:** Triples, unsorted input without allowed sort, variable windows, or all-pair heavy counting.

**RECOMMENDED CONSTRAINT RANGE:** n 2–300,000; O(n) after stated sortedness.

**COMMON TRAPS:** Pointer update direction, duplicate witnesses, no answer.

**GENERATION NOTES:** Preserve sorted input or explicitly allow one preliminary sort.

## S-011 — Merge Ordered Streams

**RANK:** Silver

**PRIMARY TOPICS:** Arrays, two pointers

**SECONDARY TOPICS:** Stable merge, comparison

**CORE TECHNIQUE:** Dual forward scan

**PROBLEM STRUCTURE:** Combine two sorted sequences while preserving global order.

**REQUIRED INSIGHT:** Recognize that dual forward scan directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** The output is built from two advancing sources, not from a generic sort call.

**ALLOWED VARIATIONS:** Merge numbers, merge event times, merge strings, or take a sorted union with stated duplicate policy.

**FORBIDDEN VARIATIONS:** K-way merge, external data, or merge plus optimization.

**RECOMMENDED CONSTRAINT RANGE:** total n 1–300,000; O(n).

**COMMON TRAPS:** Exhausted side, ties, duplicate policy.

**GENERATION NOTES:** Use two inputs and a standard total order.

## S-012 — Sorted Deduplication

**RANK:** Silver

**PRIMARY TOPICS:** Arrays, two pointers

**SECONDARY TOPICS:** In-place compaction, runs

**CORE TECHNIQUE:** Write-pointer scan

**PROBLEM STRUCTURE:** Remove repeated values from sorted input while keeping one representative per run.

**REQUIRED INSIGHT:** Recognize that write-pointer scan directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** Sorted adjacency makes duplicate removal a compact compaction task, unlike set construction.

**ALLOWED VARIATIONS:** Unique list, run representatives, count unique, or retain at most k equal items.

**FORBIDDEN VARIATIONS:** Unsorted stable deduplication with maps, complex quota rules, or moving windows.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n).

**COMMON TRAPS:** Write index, empty input, retain-count rule.

**GENERATION NOTES:** Keep input sorted and quota constant/small.

## S-013 — Interval Overlap Decision

**RANK:** Silver

**PRIMARY TOPICS:** Intervals, sorting

**SECONDARY TOPICS:** Endpoint comparison, two pointers

**CORE TECHNIQUE:** Sorted interval scan

**PROBLEM STRUCTURE:** Decide whether intervals from one or two supplied sorted lists overlap under a single endpoint convention.

**REQUIRED INSIGHT:** Recognize that sorted interval scan directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** It reasons about geometric endpoint order, not generic pair search.

**ALLOWED VARIATIONS:** Any internal overlap, overlap of two calendars, first collision, or intersection list of two sorted lists.

**FORBIDDEN VARIATIONS:** Weighted interval scheduling, arbitrary unsorted multi-list sweep, or maximum overlap.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n) after stated order.

**COMMON TRAPS:** Closed/open endpoints, touching intervals, pointer advancement.

**GENERATION NOTES:** State endpoint convention and at most two lists.

## S-014 — Two-Ended Compaction

**RANK:** Silver

**PRIMARY TOPICS:** Arrays, two pointers

**SECONDARY TOPICS:** Partition, swaps

**CORE TECHNIQUE:** Opposing pointers

**PROBLEM STRUCTURE:** Rearrange values in-place so two visible classes land on opposite sides.

**REQUIRED INSIGHT:** Recognize that opposing pointers directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** It is a partitioning task; exact internal order is deliberately irrelevant.

**ALLOWED VARIATIONS:** Move zeros, partition parity, place negative values, or segregate flags.

**FORBIDDEN VARIATIONS:** Stable partition, three-way partition, optimal swap count, or value-dependent classes.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n).

**COMMON TRAPS:** Pointer crossing, self-swaps, class definition.

**GENERATION NOTES:** Accept any valid arrangement and use one binary predicate.

## S-015 — Prefix Range Sum

**RANK:** Silver

**PRIMARY TOPICS:** Arrays, prefix sums

**SECONDARY TOPICS:** Preprocessing, queries

**CORE TECHNIQUE:** Prefix accumulation

**PROBLEM STRUCTURE:** Answer many static interval-sum queries from one cumulative array.

**REQUIRED INSIGHT:** Recognize that prefix accumulation directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** The separate reasoning step is converting interval answers into differences of two prefixes.

**ALLOWED VARIATIONS:** Inclusive sums, count of marked values, weighted totals, or one-dimensional grid row queries.

**FORBIDDEN VARIATIONS:** Point updates, 2D rectangles, min/max queries, or hash matching.

**RECOMMENDED CONSTRAINT RANGE:** n+q up to 300,000; O(n+q).

**COMMON TRAPS:** Prefix zero slot, inclusive boundaries, numeric width.

**GENERATION NOTES:** Use static data and an additive aggregate.

## S-016 — Difference Range Update

**RANK:** Silver

**PRIMARY TOPICS:** Arrays, difference arrays

**SECONDARY TOPICS:** Boundary markers, reconstruction

**CORE TECHNIQUE:** Difference marking

**PROBLEM STRUCTURE:** Apply many additive interval updates by recording only their boundary effects then reconstructing once.

**REQUIRED INSIGHT:** Recognize that difference marking directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** It is the inverse of prefix querying: updates are cheap and one final array is requested.

**ALLOWED VARIATIONS:** Add/subtract range values, increment bookings, or mark coverage counts.

**FORBIDDEN VARIATIONS:** Interleaved queries, non-additive updates, 2D ranges, or online output.

**RECOMMENDED CONSTRAINT RANGE:** n+q up to 300,000; O(n+q).

**COMMON TRAPS:** Right endpoint plus one, final prefix, overflow.

**GENERATION NOTES:** Request only the final state after all updates.

## S-017 — Balanced Delimiter Validation

**RANK:** Silver

**PRIMARY TOPICS:** Strings, stacks

**SECONDARY TOPICS:** Matching, nesting

**CORE TECHNIQUE:** Stack matching

**PROBLEM STRUCTURE:** Validate properly nested paired delimiters using a last-opened-first-closed stack.

**REQUIRED INSIGHT:** Recognize that stack matching directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** Nesting order, not mere equal counts, is the defining constraint.

**ALLOWED VARIATIONS:** Parentheses, several bracket types, quoted simple tokens, or report first invalid position.

**FORBIDDEN VARIATIONS:** Wildcards, deletion optimization, full expression parsing, or repair cost.

**RECOMMENDED CONSTRAINT RANGE:** length 1–300,000; O(n).

**COMMON TRAPS:** Closing with empty stack, leftover opens, matching types.

**GENERATION NOTES:** Limit alphabet to explicit delimiter pairs.

## S-018 — Adjacent Cancellation Stack

**RANK:** Silver

**PRIMARY TOPICS:** Arrays, stacks

**SECONDARY TOPICS:** Reduction, repeated elimination

**CORE TECHNIQUE:** Stack reduction

**PROBLEM STRUCTURE:** Process items left-to-right, removing a top item whenever it forms a stated canceling pair with the next item.

**REQUIRED INSIGHT:** Recognize that stack reduction directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** The stack captures cascades that a one-pass neighbor check would miss.

**ALLOWED VARIATIONS:** Opposite signs, equal pairs, simple reaction table, or string backspace markers.

**FORBIDDEN VARIATIONS:** Arbitrary rewrite grammars, weighted optimization, or nonlocal cancellations.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n).

**COMMON TRAPS:** Cascading removal, final stack order, cancellation symmetry.

**GENERATION NOTES:** Use a binary local rule whose effect is only pop or push.

## S-019 — Monotone Queue Service

**RANK:** Silver

**PRIMARY TOPICS:** Simulation, queues

**SECONDARY TOPICS:** FIFO, timing

**CORE TECHNIQUE:** Queue simulation

**PROBLEM STRUCTURE:** Simulate service in first-come-first-served order with a single simple state such as current time.

**REQUIRED INSIGHT:** Recognize that queue simulation directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** The queue discipline is the insight; there is no priority or optimization choice.

**ALLOWED VARIATIONS:** Waiting time, departure times, capacity-one service, or packet processing.

**FORBIDDEN VARIATIONS:** Priorities, multiple servers, scheduling optimization, or circular queue implementation.

**RECOMMENDED CONSTRAINT RANGE:** events 1–200,000; O(n).

**COMMON TRAPS:** Idle gaps, arrival order, service finish versus start.

**GENERATION NOTES:** Provide arrivals in nondecreasing order and one server.

## S-020 — Circular Queue Rotation

**RANK:** Silver

**PRIMARY TOPICS:** Arrays, queues

**SECONDARY TOPICS:** Modulo, FIFO simulation

**CORE TECHNIQUE:** Queue rotation

**PROBLEM STRUCTURE:** Execute a prescribed sequence of front-to-back rotations and reads.

**REQUIRED INSIGHT:** Recognize that queue rotation directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** It relies on FIFO order under cyclic movement, unlike direct circular indexing.

**ALLOWED VARIATIONS:** Josephus with fixed simple step and small n, rotate then peek, or card discard simulation.

**FORBIDDEN VARIATIONS:** Large-step mathematical shortcut, dynamic removal optimization, or priority behavior.

**RECOMMENDED CONSTRAINT RANGE:** n and operations up to 50,000; O(total rotations).

**COMMON TRAPS:** Empty queue, rotation count modulo size, rotation/read order.

**GENERATION NOTES:** Keep operations few enough for direct deque simulation.

## S-021 — Earliest Finishing Interval Selection

**RANK:** Silver

**PRIMARY TOPICS:** Intervals, greedy

**SECONDARY TOPICS:** Sorting, compatibility

**CORE TECHNIQUE:** Greedy selection

**PROBLEM STRUCTURE:** Choose a maximum-size set of mutually compatible intervals by repeatedly taking earliest finish.

**REQUIRED INSIGHT:** Recognize that greedy selection directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** The unique lesson is a compact exchange-based greedy rule for selection.

**ALLOWED VARIATIONS:** Meetings, tasks, broadcasts, or closed/open intervals under a supplied convention.

**FORBIDDEN VARIATIONS:** Weights, multiple resources, interval partitioning, or arbitrary objectives.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n log n).

**COMMON TRAPS:** Tie ordering, endpoint touching, initialize last finish.

**GENERATION NOTES:** Objective must be maximum count with one resource.

## S-022 — Smallest Feasible Coin Choice

**RANK:** Silver

**PRIMARY TOPICS:** Greedy, arrays

**SECONDARY TOPICS:** Local choice, remainder

**CORE TECHNIQUE:** Simple greedy

**PROBLEM STRUCTURE:** Use a stated canonical denomination system to make a target with the fewest coins.

**REQUIRED INSIGHT:** Recognize that simple greedy directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** The choice is locally obvious under a promised canonical system, not a greedy-proof puzzle.

**ALLOWED VARIATIONS:** Currency change, fixed-size packs, or score denominations.

**FORBIDDEN VARIATIONS:** Arbitrary denominations, count combinations, bounded inventory, or DP.

**RECOMMENDED CONSTRAINT RANGE:** target up to 10^9; denominations at most 20; O(k).

**COMMON TRAPS:** Unreachable target, denomination order, integer division.

**GENERATION NOTES:** Promise a canonical system or choose denominations where greedy is visibly correct.

## S-023 — Sorted Group Boundary Scan

**RANK:** Silver

**PRIMARY TOPICS:** Arrays, sorting

**SECONDARY TOPICS:** Runs, grouping

**CORE TECHNIQUE:** Sort then scan

**PROBLEM STRUCTURE:** Partition records into groups determined by equality of one sortable key and summarize each group.

**REQUIRED INSIGHT:** Recognize that sort then scan directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** Sorting is used to expose groups, not to optimize a selection.

**ALLOWED VARIATIONS:** Group identical scores, aggregate by category, count runs, or list key frequencies.

**FORBIDDEN VARIATIONS:** Multiple keys with hierarchy, top-k optimization, or dynamic group changes.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n log n).

**COMMON TRAPS:** Flush final group, equal-key ordering, output group format.

**GENERATION NOTES:** Use one grouping key and one simple aggregate.

## S-024 — Lexicographic Neighbor Comparison

**RANK:** Silver

**PRIMARY TOPICS:** Strings, sorting

**SECONDARY TOPICS:** Comparator, adjacent scan

**CORE TECHNIQUE:** Order-based scan

**PROBLEM STRUCTURE:** Use lexicographic ordering to find adjacent strings with a stated relationship.

**REQUIRED INSIGHT:** Recognize that order-based scan directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** String order creates relevant candidates; it is not generic string similarity.

**ALLOWED VARIATIONS:** Smallest adjacent gap under simple metric, duplicate word detection, or first sorted neighbor with prefix relation.

**FORBIDDEN VARIATIONS:** Edit distance, trie construction, complex locale collation, or all-pairs matching.

**RECOMMENDED CONSTRAINT RANGE:** n 1–100,000; total length 200,000; O(n log n).

**COMMON TRAPS:** Prefix ordering, duplicate strings, comparator consistency.

**GENERATION NOTES:** Use default byte/ASCII lexicographic order and a simple adjacent predicate.

## S-025 — Frequency-Ordered Reporting

**RANK:** Silver

**PRIMARY TOPICS:** Arrays, maps

**SECONDARY TOPICS:** Counting, sorting pairs

**CORE TECHNIQUE:** Map then order

**PROBLEM STRUCTURE:** Report keys ordered by a frequency-derived single criterion with an explicit tie rule.

**REQUIRED INSIGHT:** Recognize that map then order directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** It turns a frequency map into a compact ordered summary, unlike merely selecting a threshold.

**ALLOWED VARIATIONS:** Most common categories, sorted histogram, or top one with deterministic tie.

**FORBIDDEN VARIATIONS:** Top-k with heavy structures, streaming updates, or multiple competing order keys.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; distinct keys 100,000; O(n+d log d).

**COMMON TRAPS:** Tie order, absent keys, count direction.

**GENERATION NOTES:** Keep reporting scope small or request full sorted summary.

## S-026 — Prefix-XOR Range Query

**RANK:** Silver

**PRIMARY TOPICS:** Arrays, bitwise

**SECONDARY TOPICS:** Prefix transform, queries

**CORE TECHNIQUE:** Prefix XOR

**PROBLEM STRUCTURE:** Answer static XOR ranges using the cancellation property of prefix XOR.

**REQUIRED INSIGHT:** Recognize that prefix xor directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** It applies a non-additive but associative prefix representation, distinct from numeric range sums.

**ALLOWED VARIATIONS:** Inclusive XOR queries, parity mask query, or toggle summary.

**FORBIDDEN VARIATIONS:** Point updates, bitwise optimization, 2D ranges, or maximum XOR.

**RECOMMENDED CONSTRAINT RANGE:** n+q up to 300,000; O(n+q).

**COMMON TRAPS:** Zero prefix, endpoints, integer representation.

**GENERATION NOTES:** Use static array and XOR as the only range operation.

## S-027 — Simple Subsequence Match

**RANK:** Silver

**PRIMARY TOPICS:** Strings, two pointers

**SECONDARY TOPICS:** Ordered matching, scan

**CORE TECHNIQUE:** Forward matching

**PROBLEM STRUCTURE:** Determine whether one sequence appears in another while preserving order but allowing gaps.

**REQUIRED INSIGHT:** Recognize that forward matching directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** It models ordered containment, unlike substring matching which requires contiguity.

**ALLOWED VARIATIONS:** Word in text, command pattern, or numerical subsequence.

**FORBIDDEN VARIATIONS:** Minimum deletions, wildcard automata, many pattern queries, or edit distance.

**RECOMMENDED CONSTRAINT RANGE:** total length up to 300,000; O(n+m).

**COMMON TRAPS:** Empty pattern, advance only on match, case rules.

**GENERATION NOTES:** Use one pattern and one source with literal symbol equality.

## S-028 — Canonical Rotation Equality

**RANK:** Silver

**PRIMARY TOPICS:** Strings, arrays

**SECONDARY TOPICS:** Rotation, concatenation

**CORE TECHNIQUE:** Doubled-sequence search

**PROBLEM STRUCTURE:** Decide whether two equal-length sequences differ by one cyclic shift using a doubled representation.

**REQUIRED INSIGHT:** Recognize that doubled-sequence search directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** The core relation is cyclic equivalence rather than reversal or arbitrary rearrangement.

**ALLOWED VARIATIONS:** Strings, arrays of small tokens, or cyclic schedules.

**FORBIDDEN VARIATIONS:** Minimum rotation, many comparisons, approximate rotation, or rotations with edits.

**RECOMMENDED CONSTRAINT RANGE:** length up to 100,000; O(n) with standard find.

**COMMON TRAPS:** Length precheck, repeated patterns, empty strings.

**GENERATION NOTES:** Permit a standard substring search primitive or restrict small enough for direct check.

## S-029 — Simple Histogram Rectangle Simulation

**RANK:** Silver

**PRIMARY TOPICS:** Arrays, stacks

**SECONDARY TOPICS:** Monotone heights, direct scan

**CORE TECHNIQUE:** Stack-free bounded scan

**PROBLEM STRUCTURE:** For a deliberately small histogram, compute a stated basic local rectangle statistic by direct expansion.

**REQUIRED INSIGHT:** Recognize that stack-free bounded scan directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** It introduces histogram geometry without the monotonic-stack recognition demanded at Gold.

**ALLOWED VARIATIONS:** Largest bar area under tiny n, count bars above threshold, or fixed-width rectangle.

**FORBIDDEN VARIATIONS:** Large-n largest rectangle, monotonic stack, or variable query widths.

**RECOMMENDED CONSTRAINT RANGE:** n up to 2,000; O(n^2) allowed.

**COMMON TRAPS:** Width convention, zero heights, area width times min height.

**GENERATION NOTES:** Use only as a bridge exercise with constraints that make direct enumeration unquestionably intended.

## S-030 — Lowest Unused Small Label

**RANK:** Silver

**PRIMARY TOPICS:** Arrays, sets

**SECONDARY TOPICS:** Membership, bounded search

**CORE TECHNIQUE:** Set then probe

**PROBLEM STRUCTURE:** Find the smallest nonnegative/positive label absent from a collection by marking used values and scanning upward.

**REQUIRED INSIGHT:** Recognize that set then probe directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** It searches a constructed membership frontier, unlike arbitrary target membership.

**ALLOWED VARIATIONS:** First missing nonnegative, first unused seat, or smallest unavailable code.

**FORBIDDEN VARIATIONS:** Unbounded probing without limit, dynamic queries, or kth missing.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; answer bounded by n+1.

**COMMON TRAPS:** Zero versus one start, duplicates, out-of-range values.

**GENERATION NOTES:** State the starting label and permit ignoring values outside the frontier.

## S-031 — Postfix Expression Evaluation

**RANK:** Silver

**PRIMARY TOPICS:** Strings, stacks

**SECONDARY TOPICS:** Token parsing, arithmetic

**CORE TECHNIQUE:** Evaluation stack

**PROBLEM STRUCTURE:** Evaluate a valid postfix stream by replacing each operator and its two latest operands with one result.

**REQUIRED INSIGHT:** Recognize that evaluation stack directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** The stack holds partial values rather than delimiters or canceling symbols, giving it a different semantic role.

**ALLOWED VARIATIONS:** Integer arithmetic, simple boolean operators, or return final value.

**FORBIDDEN VARIATIONS:** Infix parsing, precedence handling, malformed grammar recovery, variables, or floating precision.

**RECOMMENDED CONSTRAINT RANGE:** tokens up to 100,000; O(n).

**COMMON TRAPS:** Operand order for subtraction/division, final stack size, negative tokens.

**GENERATION NOTES:** Provide whitespace-delimited valid tokens and a fixed small operator set.

## S-032 — Merge Overlapping Intervals

**RANK:** Silver

**PRIMARY TOPICS:** Intervals, sorting

**SECONDARY TOPICS:** Endpoint extension, scan

**CORE TECHNIQUE:** Sort and merge

**PROBLEM STRUCTURE:** Sort intervals by start and extend the current merged interval whenever the next one overlaps it.

**REQUIRED INSIGHT:** Recognize that sort and merge directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** It constructs a union representation, unlike merely deciding overlap or selecting nonoverlapping activities.

**ALLOWED VARIATIONS:** Merge bookings, consolidate ranges, union signal windows, or report total covered length.

**FORBIDDEN VARIATIONS:** Weighted coverage, dynamic insertions, multiple resource constraints, or interval scheduling objectives.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n log n).

**COMMON TRAPS:** Touching endpoint convention, flush final interval, sort by start.

**GENERATION NOTES:** Use one interval list and explicitly define whether touching intervals merge.

## S-033 — Bijection Pattern Matching

**RANK:** Silver

**PRIMARY TOPICS:** Strings, hash maps

**SECONDARY TOPICS:** Two-way mapping, tokens

**CORE TECHNIQUE:** Bidirectional dictionary

**PROBLEM STRUCTURE:** Decide whether symbols in a short pattern map one-to-one to words/items in a sequence.

**REQUIRED INSIGHT:** Recognize that bidirectional dictionary directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** Both forward and reverse maps are necessary, unlike ordinary keyed lookup or frequency matching.

**ALLOWED VARIATIONS:** Pattern-to-words, label-to-category, or template-to-token matching.

**FORBIDDEN VARIATIONS:** Substring variable lengths, wildcards, transformations, or non-bijective matching.

**RECOMMENDED CONSTRAINT RANGE:** pattern and tokens up to 100,000; O(n).

**COMMON TRAPS:** Length mismatch, enforce reverse map, token splitting.

**GENERATION NOTES:** Use literal whitespace-delimited tokens and an exact bijection objective.

## S-034 — Sorted Neighbor Minimum Gap

**RANK:** Silver

**PRIMARY TOPICS:** Arrays, sorting

**SECONDARY TOPICS:** Adjacent differences, reduction

**CORE TECHNIQUE:** Sort then local reduction

**PROBLEM STRUCTURE:** Find the optimal pair under a one-dimensional closeness metric by sorting and checking only adjacent values.

**REQUIRED INSIGHT:** Recognize that sort then local reduction directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** Ordering proves that every best pair becomes adjacent, unlike arbitrary pair lookup.

**ALLOWED VARIATIONS:** Minimum absolute difference, closest timestamps, nearest score pair, or closest duplicate-like values.

**FORBIDDEN VARIATIONS:** Two-dimensional distance, dynamic values, k closest pairs, or custom non-monotone metrics.

**RECOMMENDED CONSTRAINT RANGE:** n 2–200,000; O(n log n).

**COMMON TRAPS:** Duplicate gives zero, 64-bit subtraction, tie witness.

**GENERATION NOTES:** Use scalar values and absolute difference only.

## S-035 — Undoable Command Stack

**RANK:** Silver

**PRIMARY TOPICS:** Simulation, stacks

**SECONDARY TOPICS:** Push/pop commands, state

**CORE TECHNIQUE:** Command stack simulation

**PROBLEM STRUCTURE:** Process a stream in which one command restores/removes the most recent still-active action.

**REQUIRED INSIGHT:** Recognize that command stack simulation directly represents the stated relationship.

**UNIQUE DIFFERENTIATOR:** The LIFO history is a semantic undo relation rather than a generic queue or cancellation rule.

**ALLOWED VARIATIONS:** Undo typed characters, retract edits, rollback scores, or browser-like back actions.

**FORBIDDEN VARIATIONS:** Branching histories, redo trees, nested transactions, or persistent data structures.

**RECOMMENDED CONSTRAINT RANGE:** commands up to 300,000; O(n).

**COMMON TRAPS:** Undo with empty history, command order, output after all or each action.

**GENERATION NOTES:** Use one stack and one reversible command type.

## G-001 — Longest Distinct Window

**RANK:** Gold

**PRIMARY TOPICS:** Arrays, strings

**SECONDARY TOPICS:** Sliding window, frequency map

**CORE TECHNIQUE:** Variable sliding window

**PROBLEM STRUCTURE:** Maintain the longest contiguous window whose items are all distinct.

**REQUIRED INSIGHT:** Recognize variable sliding window as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** A moving left boundary repairs a violated uniqueness invariant; it is not a global set count.

**ALLOWED VARIATIONS:** Characters, IDs, colors, or numbers; report length or boundaries.

**FORBIDDEN VARIATIONS:** At-most-k plus other constraints, multiple windows, or offline queries.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n) expected.

**COMMON TRAPS:** Move left until valid, last-position updates, empty input.

**GENERATION NOTES:** Use one uniqueness constraint and one contiguous sequence.

## G-002 — Minimum Covering Window

**RANK:** Gold

**PRIMARY TOPICS:** Strings, arrays

**SECONDARY TOPICS:** Sliding window, counts

**CORE TECHNIQUE:** Cover window

**PROBLEM STRUCTURE:** Find the shortest contiguous region meeting all required item counts.

**REQUIRED INSIGHT:** Recognize cover window as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** It combines expansion for coverage with contraction for minimality, unlike longest-valid windows.

**ALLOWED VARIATIONS:** Cover a multiset of characters, required labels, or a small shopping list.

**FORBIDDEN VARIATIONS:** Wildcards, weighted cover, many targets, or arbitrary edit operations.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; required distinct keys at most 100,000.

**COMMON TRAPS:** Duplicate requirements, missing target, shrink while valid.

**GENERATION NOTES:** Use one source and one fixed target multiset.

## G-003 — At-Most-K Distinct Window

**RANK:** Gold

**PRIMARY TOPICS:** Arrays, hash maps

**SECONDARY TOPICS:** Sliding window, counts

**CORE TECHNIQUE:** Bounded-diversity window

**PROBLEM STRUCTURE:** Maintain a longest window whose number of distinct keys does not exceed k.

**REQUIRED INSIGHT:** Recognize bounded-diversity window as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** Validity depends on a dynamic frequency-map cardinality rather than simple uniqueness.

**ALLOWED VARIATIONS:** Characters, categories, or IDs; return longest length or count windows.

**FORBIDDEN VARIATIONS:** Additional sum/product constraints, changing k, or all-k output.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n) expected.

**COMMON TRAPS:** Delete zero-count keys, k=0, pointer shrink condition.

**GENERATION NOTES:** Use one cardinality limit and one contiguous sequence.

## G-004 — Exact-Sum Positive Window

**RANK:** Gold

**PRIMARY TOPICS:** Arrays, two pointers

**SECONDARY TOPICS:** Monotone sum, window

**CORE TECHNIQUE:** Positive sliding window

**PROBLEM STRUCTURE:** Locate/count a contiguous range with a target sum when positivity makes window sum monotone.

**REQUIRED INSIGHT:** Recognize positive sliding window as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** It exploits positive values to move endpoints without prefix hashing.

**ALLOWED VARIATIONS:** Target sum, smallest/longest exact target window, or positive duration totals.

**FORBIDDEN VARIATIONS:** Negative values, multiple target sums, or arbitrary weighted constraints.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; positive values; O(n).

**COMMON TRAPS:** When sum exceeds target, no-solution, zero policy.

**GENERATION NOTES:** Promise strictly positive values unless a separate zero rule is trivial.

## G-005 — Prefix-Sum Target Count

**RANK:** Gold

**PRIMARY TOPICS:** Arrays, hash maps

**SECONDARY TOPICS:** Cumulative sums, frequency

**CORE TECHNIQUE:** Prefix hash counting

**PROBLEM STRUCTURE:** Count subarrays meeting an additive target by matching prior prefix states.

**REQUIRED INSIGHT:** Recognize prefix hash counting as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** It converts every endpoint into a lookup for a required earlier cumulative value.

**ALLOWED VARIATIONS:** Sum target with signed values, zero-sum ranges, or count of balanced +/- labels.

**FORBIDDEN VARIATIONS:** Multiple dimensions, online updates, or arbitrary predicates.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n) expected.

**COMMON TRAPS:** Seed prefix zero, 64-bit counts, update map after query.

**GENERATION NOTES:** Use one scalar additive invariant and an exact target.

## G-006 — Equal-Category Balance Range

**RANK:** Gold

**PRIMARY TOPICS:** Arrays, prefix maps

**SECONDARY TOPICS:** Difference encoding, first index

**CORE TECHNIQUE:** Prefix-state matching

**PROBLEM STRUCTURE:** Find a longest/count range where two categories have equal totals by encoding their difference.

**REQUIRED INSIGHT:** Recognize prefix-state matching as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** The target is equality of competing categories, not a numerical sum given in input.

**ALLOWED VARIATIONS:** Zero/one balance, vowel/consonant balance, two-team score difference, or equal color counts.

**FORBIDDEN VARIATIONS:** Three-or-more balance dimensions, weighted equations, or moving queries.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n) expected.

**COMMON TRAPS:** Store earliest index for longest, prefix zero, map key sign.

**GENERATION NOTES:** Use exactly two categories with contributions +1 and -1.

## G-007 — Shortest Sum-At-Least Window

**RANK:** Gold

**PRIMARY TOPICS:** Arrays, sliding window

**SECONDARY TOPICS:** Positive sums, minimization

**CORE TECHNIQUE:** Minimizing window

**PROBLEM STRUCTURE:** Find the shortest positive-valued window whose sum reaches a threshold.

**REQUIRED INSIGHT:** Recognize minimizing window as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** The window is valid by a monotone aggregate but the objective is minimum length, unlike exact-sum search.

**ALLOWED VARIATIONS:** Minimum days reaching workload, shortest batch reaching quantity, or segment above quota.

**FORBIDDEN VARIATIONS:** Negative values, multiple constraints, or circular windows.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; positive values; O(n).

**COMMON TRAPS:** Shrink repeatedly, impossible target, large sums.

**GENERATION NOTES:** Use strictly positive values and one lower-bound threshold.

## G-008 — Bounded-Frequency Window

**RANK:** Gold

**PRIMARY TOPICS:** Arrays, strings

**SECONDARY TOPICS:** Sliding window, counts

**CORE TECHNIQUE:** Multiplicity invariant

**PROBLEM STRUCTURE:** Maintain the longest window in which no key occurs more than a stated cap.

**REQUIRED INSIGHT:** Recognize multiplicity invariant as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** Validity is per-key multiplicity, distinct from a bound on number of keys.

**ALLOWED VARIATIONS:** At most k repeats per character, limited product labels, or capped event type.

**FORBIDDEN VARIATIONS:** A second simultaneous window condition, varying cap by key, or offline queries.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n) expected.

**COMMON TRAPS:** When to decrement violations, cap zero, cleanup.

**GENERATION NOTES:** Use a uniform cap and one sequence.

## G-009 — Window Replacement Budget

**RANK:** Gold

**PRIMARY TOPICS:** Strings, arrays

**SECONDARY TOPICS:** Sliding window, max frequency

**CORE TECHNIQUE:** Replace-within-budget window

**PROBLEM STRUCTURE:** Find the longest window that can be made uniform using at most k replacements.

**REQUIRED INSIGHT:** Recognize replace-within-budget window as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** The key measure is window size minus its dominant frequency, not literal validity.

**ALLOWED VARIATIONS:** Uniform character, unify category labels, or repaint a contiguous strip.

**FORBIDDEN VARIATIONS:** Weighted replacements, multiple target classes with costs, or exact replacement count.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; alphabet bounded or map based; O(n).

**COMMON TRAPS:** Stale maximum count reasoning, k=0, window shrink.

**GENERATION NOTES:** All replacements must have unit cost and one desired final label.

## G-010 — First True Boundary Search

**RANK:** Gold

**PRIMARY TOPICS:** Arrays, binary search

**SECONDARY TOPICS:** Monotone predicate, bounds

**CORE TECHNIQUE:** Lower-bound binary search

**PROBLEM STRUCTURE:** Find the first index at which a sorted/monotone boolean condition becomes true.

**REQUIRED INSIGHT:** Recognize lower-bound binary search as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** It frames search as locating a transition rather than finding an exact value.

**ALLOWED VARIATIONS:** First >= target, first available slot, first failed test, or insertion position.

**FORBIDDEN VARIATIONS:** Non-monotone predicates, answer-space feasibility, or multiple dimensions.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(log n).

**COMMON TRAPS:** Closed interval invariants, all false/true, duplicate values.

**GENERATION NOTES:** State monotonicity directly or guarantee sorted input.

## G-011 — Last True Boundary Search

**RANK:** Gold

**PRIMARY TOPICS:** Arrays, binary search

**SECONDARY TOPICS:** Monotone predicate, bounds

**CORE TECHNIQUE:** Upper-bound binary search

**PROBLEM STRUCTURE:** Find the final index satisfying a monotone condition.

**REQUIRED INSIGHT:** Recognize upper-bound binary search as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** Its invariant and absent-boundary behavior differ from first-true search, serving range-end objectives.

**ALLOWED VARIATIONS:** Last <= target, last feasible timestamp, or last occurrence via boundary.

**FORBIDDEN VARIATIONS:** Non-monotone predicates, answer-space optimization, or repeated updates.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(log n).

**COMMON TRAPS:** Mid bias, all false/true, answer initialization.

**GENERATION NOTES:** Use a one-dimensional monotone predicate with clear sentinel output.

## G-012 — Rotated Sorted Location

**RANK:** Gold

**PRIMARY TOPICS:** Arrays, binary search

**SECONDARY TOPICS:** Partition recognition, order

**CORE TECHNIQUE:** Modified binary search

**PROBLEM STRUCTURE:** Locate a target by determining which half of a rotated sorted array remains ordered.

**REQUIRED INSIGHT:** Recognize modified binary search as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** The insight is local ordered-half recognition, not generic boundary search.

**ALLOWED VARIATIONS:** Distinct sorted rotation, return index, or decide membership.

**FORBIDDEN VARIATIONS:** Duplicate-heavy rotations, minimum finding plus extra objectives, or multiple rotations.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; distinct values; O(log n).

**COMMON TRAPS:** Which half is sorted, endpoint comparisons, absent target.

**GENERATION NOTES:** Promise distinct values and one rotation of a strictly sorted sequence.

## G-013 — Peak Position Search

**RANK:** Gold

**PRIMARY TOPICS:** Arrays, binary search

**SECONDARY TOPICS:** Slope, local property

**CORE TECHNIQUE:** Slope binary search

**PROBLEM STRUCTURE:** Find a local peak using comparison with a neighbor to choose an uphill side.

**REQUIRED INSIGHT:** Recognize slope binary search as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** The predicate is derived from directional slope rather than from a supplied sorted boundary.

**ALLOWED VARIATIONS:** Mountain-like values, any local maximum, or unimodal score peak.

**FORBIDDEN VARIATIONS:** Flat plateaus without rule, multi-peak optimization, or noisy search.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(log n).

**COMMON TRAPS:** Boundary neighbors, equal values, mid+1 access.

**GENERATION NOTES:** Define virtual boundary behavior or guarantee adjacent values differ.

## G-014 — Search in Monotone Matrix

**RANK:** Gold

**PRIMARY TOPICS:** Matrices, binary search

**SECONDARY TOPICS:** Row/column order, elimination

**CORE TECHNIQUE:** Corner elimination

**PROBLEM STRUCTURE:** Decide/find a target in a matrix sorted across rows and columns by eliminating a row or column each step.

**REQUIRED INSIGHT:** Recognize corner elimination as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** Two-dimensional monotonicity enables linear boundary walking, not repeated row searches.

**ALLOWED VARIATIONS:** Value membership, count one target with uniqueness promise, or locate coordinates.

**FORBIDDEN VARIATIONS:** Arbitrary matrices, many queries, duplicates requiring counts, or 2D prefix techniques.

**RECOMMENDED CONSTRAINT RANGE:** rows+cols up to 300,000; O(rows+cols).

**COMMON TRAPS:** Start corner, duplicate policy, empty dimensions.

**GENERATION NOTES:** Guarantee nondecreasing rows and columns; request one target.

## G-015 — Next Greater Element

**RANK:** Gold

**PRIMARY TOPICS:** Arrays, stacks

**SECONDARY TOPICS:** Monotonic stack, unresolved indices

**CORE TECHNIQUE:** Decreasing stack

**PROBLEM STRUCTURE:** Resolve each element's first later larger value by keeping only decreasing unresolved candidates.

**REQUIRED INSIGHT:** Recognize decreasing stack as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** The stack represents pending elements, unlike a local neighbor scan.

**ALLOWED VARIATIONS:** Next greater value/index, warmer day, next higher price, or circular version with one extra pass.

**FORBIDDEN VARIATIONS:** Variable distance constraints, dynamic updates, or largest histogram.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n).

**COMMON TRAPS:** Pop direction, no-answer marker, duplicate comparison.

**GENERATION NOTES:** Use one next-later relation and fixed comparison strictness.

## G-016 — Previous Smaller Boundary

**RANK:** Gold

**PRIMARY TOPICS:** Arrays, stacks

**SECONDARY TOPICS:** Monotonic stack, span

**CORE TECHNIQUE:** Increasing stack

**PROBLEM STRUCTURE:** Find each element's nearest earlier strictly smaller boundary using a maintained monotone stack.

**REQUIRED INSIGHT:** Recognize increasing stack as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** It produces a per-position structural boundary, unlike next-greater querying.

**ALLOWED VARIATIONS:** Previous smaller index, stock span, nearest lower terrain, or visibility blocker.

**FORBIDDEN VARIATIONS:** Bidirectional boundaries combined with area optimization, dynamic arrays, or trees.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n).

**COMMON TRAPS:** Strict versus non-strict pop, sentinel, index distance.

**GENERATION NOTES:** Request one directional nearest boundary only.

## G-017 — Daily Span Accumulation

**RANK:** Gold

**PRIMARY TOPICS:** Arrays, stacks

**SECONDARY TOPICS:** Compressed spans, monotonicity

**CORE TECHNIQUE:** Span stack

**PROBLEM STRUCTURE:** For each day, compress prior dominated observations to compute a contiguous span satisfying a threshold relation.

**REQUIRED INSIGHT:** Recognize span stack as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** Stored pairs aggregate spans, making it distinct from merely reporting nearest boundaries.

**ALLOWED VARIATIONS:** Stock span, consecutive non-increasing scores, or streak length under dominance.

**FORBIDDEN VARIATIONS:** Multiple simultaneous thresholds, circular spans, or range queries.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n).

**COMMON TRAPS:** Aggregate span when popping, equal comparison, first day.

**GENERATION NOTES:** Use one relation and per-position span output.

## G-018 — Streaming Kth Extreme

**RANK:** Gold

**PRIMARY TOPICS:** Arrays, heaps

**SECONDARY TOPICS:** Priority queue, size cap

**CORE TECHNIQUE:** Bounded min/max heap

**PROBLEM STRUCTURE:** Maintain the kth extreme value as items arrive by keeping only k relevant candidates.

**REQUIRED INSIGHT:** Recognize bounded min/max heap as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** It supports dynamic arrival order, unlike sorting once and indexing.

**ALLOWED VARIATIONS:** Kth largest score, kth smallest latency, or threshold after each insertion.

**FORBIDDEN VARIATIONS:** Deletions, arbitrary kth queries, dual medians, or very large k requiring alternatives.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; k up to n; O(n log k).

**COMMON TRAPS:** Heap polarity, fewer than k items, duplicate values.

**GENERATION NOTES:** Use insert-only stream and one fixed k.

## G-019 — Merge-K Ordered Heads

**RANK:** Gold

**PRIMARY TOPICS:** Heaps, arrays

**SECONDARY TOPICS:** Priority queue, pointers

**CORE TECHNIQUE:** K-way merge

**PROBLEM STRUCTURE:** Repeatedly extract the smallest current head among a modest number of sorted sources.

**REQUIRED INSIGHT:** Recognize k-way merge as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** A heap coordinates more than two advancing streams, unlike two-list merge.

**ALLOWED VARIATIONS:** Merge sorted lists, smallest range head sequence, or process timestamp feeds.

**FORBIDDEN VARIATIONS:** Unsorted streams, updates, external I/O, or range optimization.

**RECOMMENDED CONSTRAINT RANGE:** total n 200,000; k up to 2,000; O(n log k).

**COMMON TRAPS:** Advance exhausted source, heap tuple tie, output size.

**GENERATION NOTES:** Sources must be individually sorted and static.

## G-020 — Minimum Resources for Intervals

**RANK:** Gold

**PRIMARY TOPICS:** Intervals, heaps

**SECONDARY TOPICS:** Sorting, active ends

**CORE TECHNIQUE:** Sweep with heap

**PROBLEM STRUCTURE:** Find the maximum number of simultaneously active intervals by processing start times and expiring ends.

**REQUIRED INSIGHT:** Recognize sweep with heap as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** It is an allocation/overlap maximum problem, not selecting a compatible subset.

**ALLOWED VARIATIONS:** Rooms, channels, gates, or concurrent requests.

**FORBIDDEN VARIATIONS:** Weighted capacity, arbitrary time zones, interval edits, or scheduling with preferences.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n log n).

**COMMON TRAPS:** Touching endpoints, pop all expired, start/end ordering.

**GENERATION NOTES:** Use one unit-capacity resource type and explicit endpoint convention.

## G-021 — Deadline Profit Selection

**RANK:** Gold

**PRIMARY TOPICS:** Greedy, heaps

**SECONDARY TOPICS:** Sorting, replacement

**CORE TECHNIQUE:** Greedy heap selection

**PROBLEM STRUCTURE:** Choose maximum count/value of short tasks before deadlines by retaining the best feasible set.

**REQUIRED INSIGHT:** Recognize greedy heap selection as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** A heap repairs earlier choices, unlike single-pass earliest-finish selection.

**ALLOWED VARIATIONS:** Unit tasks with deadlines and profits, maximize count under simple deadline, or retain feasible jobs.

**FORBIDDEN VARIATIONS:** Arbitrary durations with profits, multi-resource scheduling, or complex knapsack.

**RECOMMENDED CONSTRAINT RANGE:** n 1–100,000; O(n log n).

**COMMON TRAPS:** Sort key, heap replacement, deadline zero.

**GENERATION NOTES:** Use unit-duration tasks and one stated objective.

## G-022 — Minimum Jump Frontier

**RANK:** Gold

**PRIMARY TOPICS:** Arrays, greedy

**SECONDARY TOPICS:** Reachability frontier, layers

**CORE TECHNIQUE:** Greedy range expansion

**PROBLEM STRUCTURE:** Compute minimum jumps to reach the end when each value gives maximum forward reach.

**REQUIRED INSIGHT:** Recognize greedy range expansion as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** The algorithm chooses a layer boundary, not a local best next index by simulation.

**ALLOWED VARIATIONS:** Minimum transmissions, checkpoints, or bounded forward hops.

**FORBIDDEN VARIATIONS:** Negative/backward jumps, weighted costs, path reconstruction, or unreachable ambiguity.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n).

**COMMON TRAPS:** Update next frontier, final layer, unreachable case.

**GENERATION NOTES:** Guarantee reachability or define no-solution output.

## G-023 — Partition Labels

**RANK:** Gold

**PRIMARY TOPICS:** Strings, greedy

**SECONDARY TOPICS:** Last occurrence, boundaries

**CORE TECHNIQUE:** Greedy closure

**PROBLEM STRUCTURE:** Split a sequence into the most pieces such that each key appears in only one piece.

**REQUIRED INSIGHT:** Recognize greedy closure as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** A segment closes exactly when all keys seen inside have ended, a global last-occurrence insight.

**ALLOWED VARIATIONS:** Characters, labels, colors, or project tags.

**FORBIDDEN VARIATIONS:** Min/max segment-size constraints, edits, or overlapping membership rules.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n).

**COMMON TRAPS:** Precompute last positions, reset segment start, repeated labels.

**GENERATION NOTES:** Use one sequence and nonoverlapping partition output.

## G-024 — Subset Sum with Tiny Candidate Set

**RANK:** Gold

**PRIMARY TOPICS:** Backtracking, arrays

**SECONDARY TOPICS:** Recursion, pruning

**CORE TECHNIQUE:** Include/exclude enumeration

**PROBLEM STRUCTURE:** Decide or construct a subset reaching a target when the item count is deliberately tiny.

**REQUIRED INSIGHT:** Recognize include/exclude enumeration as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** The state space is explicitly small, so recognition of binary choice recursion—not DP—is intended.

**ALLOWED VARIATIONS:** Target subset, exact weight selection, or subset product under safe bounds.

**FORBIDDEN VARIATIONS:** n beyond 22, duplicate-combination counting, negative-heavy pruning, or DP expectation.

**RECOMMENDED CONSTRAINT RANGE:** n at most 22; O(2^n).

**COMMON TRAPS:** Base case, reuse items, empty subset.

**GENERATION NOTES:** Keep n low enough for direct recursion and one exact target.

## G-025 — Permutation Generation with Constraints

**RANK:** Gold

**PRIMARY TOPICS:** Backtracking, arrays

**SECONDARY TOPICS:** Used markers, recursion

**CORE TECHNIQUE:** Backtracking construction

**PROBLEM STRUCTURE:** Generate all arrangements that satisfy one local placement rule.

**REQUIRED INSIGHT:** Recognize backtracking construction as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** It requires constructing and undoing choices, unlike checking a completed permutation.

**ALLOWED VARIATIONS:** Permutations avoiding adjacent equal type, fixed first item, or simple position parity rule.

**FORBIDDEN VARIATIONS:** Large n, global optimization, complex pruning, or duplicate multiset permutations without clear handling.

**RECOMMENDED CONSTRAINT RANGE:** n at most 8; output bounded; O(n!).

**COMMON TRAPS:** Backtrack cleanup, output order, duplicate candidates.

**GENERATION NOTES:** Use distinct items and a rule testable on the partial prefix.

## G-026 — Bounded Combination Enumeration

**RANK:** Gold

**PRIMARY TOPICS:** Backtracking, arrays

**SECONDARY TOPICS:** Start index, recursion

**CORE TECHNIQUE:** Combination generation

**PROBLEM STRUCTURE:** Enumerate fixed-size selections without order duplication under a simple validity rule.

**REQUIRED INSIGHT:** Recognize combination generation as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** The increasing-index invariant eliminates duplicate constructions, unlike permutation generation.

**ALLOWED VARIATIONS:** Choose k labels, combinations summing to small target, or select nonadjacent positions.

**FORBIDDEN VARIATIONS:** Large output, variable-length exhaustive search, complex constraint propagation.

**RECOMMENDED CONSTRAINT RANGE:** n at most 20; output bounded.

**COMMON TRAPS:** Advance start index, chosen size, pruning base case.

**GENERATION NOTES:** Choose constraints that keep output modest and deterministic.

## G-027 — Fast GCD Aggregate

**RANK:** Gold

**PRIMARY TOPICS:** Number theory, arrays

**SECONDARY TOPICS:** Euclidean algorithm, reduction

**CORE TECHNIQUE:** GCD fold

**PROBLEM STRUCTURE:** Reduce many values by repeated greatest-common-divisor computation.

**REQUIRED INSIGHT:** Recognize gcd fold as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** The mathematical operation is associative and reveals a common divisibility property, not a direct divisor scan.

**ALLOWED VARIATIONS:** GCD of list, common tile size, shared rhythm, or normalized ratio.

**FORBIDDEN VARIATIONS:** Prime factorization, range updates, or Diophantine optimization.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; values up to 10^18; O(n log V).

**COMMON TRAPS:** Zero handling, sign, use of integer gcd.

**GENERATION NOTES:** Use positive values unless zero semantics are named.

## G-028 — Prime Factor Exponent Summary

**RANK:** Gold

**PRIMARY TOPICS:** Number theory, arithmetic

**SECONDARY TOPICS:** Trial division, maps

**CORE TECHNIQUE:** Factorization scan

**PROBLEM STRUCTURE:** Factor modest integers and combine a stated property of their prime exponents.

**REQUIRED INSIGHT:** Recognize factorization scan as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** It requires recognizing factor structure, beyond testing one divisor property.

**ALLOWED VARIATIONS:** Total distinct primes, squarefree decision, shared factor count, or exponent parity.

**FORBIDDEN VARIATIONS:** Large 64-bit factorization, sieve-heavy many queries, or advanced primality tests.

**RECOMMENDED CONSTRAINT RANGE:** n up to 10,000; values up to 10^6.

**COMMON TRAPS:** Remaining prime, repeated factors, factor one.

**GENERATION NOTES:** Set ranges so trial division or a simple sieve is clearly compact.

## G-029 — Bitmask Feature Union

**RANK:** Gold

**PRIMARY TOPICS:** Bit manipulation, arrays

**SECONDARY TOPICS:** OR masks, membership

**CORE TECHNIQUE:** Bitwise aggregation

**PROBLEM STRUCTURE:** Represent small feature sets as bits and aggregate/compare them with bitwise operations.

**REQUIRED INSIGHT:** Recognize bitwise aggregation as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** It changes a set relationship into constant-time integer algebra.

**ALLOWED VARIATIONS:** Union flags, missing permissions, common flags, or coverage decision.

**FORBIDDEN VARIATIONS:** More than 60 features without representation, subset DP, or bitset convolution.

**RECOMMENDED CONSTRAINT RANGE:** features at most 30; n 200,000; O(n).

**COMMON TRAPS:** Bit indexing, signed shifts, zero mask.

**GENERATION NOTES:** Use an explicitly small feature universe.

## G-030 — Single-Odd XOR Witness

**RANK:** Gold

**PRIMARY TOPICS:** Bit manipulation, arrays

**SECONDARY TOPICS:** XOR cancellation, invariant

**CORE TECHNIQUE:** XOR reduction

**PROBLEM STRUCTURE:** Find the unique value with odd occurrence when all others cancel in pairs.

**REQUIRED INSIGHT:** Recognize xor reduction as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** The answer emerges by algebraic cancellation rather than counting or sorting.

**ALLOWED VARIATIONS:** Unique ID, unmatched token, lone paired value, or parity witness.

**FORBIDDEN VARIATIONS:** More than one odd-frequency value, recover two singles, or range-XOR derivations.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n).

**COMMON TRAPS:** XOR initialization, duplicates, integer width.

**GENERATION NOTES:** Promise exactly one value has odd count and all others are even/pairwise.

## G-031 — Cyclic Shift by Reversal

**RANK:** Gold

**PRIMARY TOPICS:** Arrays, transformations

**SECONDARY TOPICS:** Reversal composition, modular offset

**CORE TECHNIQUE:** In-place rotation

**PROBLEM STRUCTURE:** Rotate a sequence using a constant number of reversal operations or equivalent indexing.

**REQUIRED INSIGHT:** Recognize in-place rotation as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** It transforms a cyclic movement requirement into three simple positional reversals.

**ALLOWED VARIATIONS:** Left/right rotation, rotate words, or circular seating offset.

**FORBIDDEN VARIATIONS:** Many rotations with queries, linked lists, or move-cost minimization.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n).

**COMMON TRAPS:** Normalize k, direction, n=0.

**GENERATION NOTES:** Specify one rotation and whether in-place output is relevant.

## G-032 — Product-Except-Self Scan

**RANK:** Gold

**PRIMARY TOPICS:** Arrays, prefix/suffix

**SECONDARY TOPICS:** Two passes, multiplicative accumulation

**CORE TECHNIQUE:** Prefix-suffix construction

**PROBLEM STRUCTURE:** Produce for each position the aggregate of all other values without division.

**REQUIRED INSIGHT:** Recognize prefix-suffix construction as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** It combines directional accumulators to exclude self, unlike ordinary running summaries.

**ALLOWED VARIATIONS:** Product except self, multiplication mod a given number, or concatenate simple monoid-like values.

**FORBIDDEN VARIATIONS:** Division-only formulation, zero-special-case stories, arbitrary nonassociative operations.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n).

**COMMON TRAPS:** Prefix/suffix initialization, overflow/modulus, zero effects.

**GENERATION NOTES:** Use multiplication under stated safe limits or a modulus.

## G-033 — Circular Maximum Fixed-Length Sum

**RANK:** Gold

**PRIMARY TOPICS:** Arrays, prefix sums

**SECONDARY TOPICS:** Wraparound, fixed window

**CORE TECHNIQUE:** Circular window

**PROBLEM STRUCTURE:** Find the best contiguous block of exactly k elements allowing one wrap.

**REQUIRED INSIGHT:** Recognize circular window as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** The candidate length is fixed; circularity, not variable window feasibility, is the key detail.

**ALLOWED VARIATIONS:** Maximum/minimum k-day circular total, fixed rotating team block, or circular segment score.

**FORBIDDEN VARIATIONS:** Variable lengths, multiple wraps, negative k, or dynamic updates.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; 1<=k<=n; O(n).

**COMMON TRAPS:** Duplicate array length, avoid double wrapping, k=n.

**GENERATION NOTES:** Limit to one fixed length and one cycle.

## G-034 — Fixed-Length Maximum Window

**RANK:** Gold

**PRIMARY TOPICS:** Arrays, sliding window

**SECONDARY TOPICS:** Rolling aggregate, fixed width

**CORE TECHNIQUE:** Fixed sliding window

**PROBLEM STRUCTURE:** Compute the best score among all contiguous windows of exactly k positions by updating a rolling aggregate.

**REQUIRED INSIGHT:** Recognize fixed sliding window as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** Window length is immutable, so no validity-repair logic or frequency map is needed.

**ALLOWED VARIATIONS:** Maximum fixed-k sum, best k-day load, minimum fixed-k cost, or highest fixed duration average.

**FORBIDDEN VARIATIONS:** Variable-length optimization, negative-length ambiguity, multiple k queries, or circularity unless separately represented.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; 1<=k<=n; O(n).

**COMMON TRAPS:** Initialize first window, remove exiting item, 64-bit sum.

**GENERATION NOTES:** Use one fixed length and an additive numeric score.

## G-035 — Target-Pair Count Below Threshold

**RANK:** Gold

**PRIMARY TOPICS:** Arrays, sorting

**SECONDARY TOPICS:** Two pointers, monotone counting

**CORE TECHNIQUE:** Two-ended counting

**PROBLEM STRUCTURE:** Count unordered pairs whose sum is below a target by adding all partners implied by a successful left/right comparison.

**REQUIRED INSIGHT:** Recognize two-ended counting as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** The contribution is a block count, not a search for one witness pair.

**ALLOWED VARIATIONS:** Pairs below sum, pairs above threshold with symmetric scan, or count compatible values.

**FORBIDDEN VARIATIONS:** Triples, arbitrary pair predicates, dynamic updates, or multiplicity constraints beyond array positions.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n log n).

**COMMON TRAPS:** Count r-l at once, duplicates count by position, 64-bit answer.

**GENERATION NOTES:** Use scalar values, one threshold, and unordered index pairs.

## G-036 — Floyd Duplicate Witness

**RANK:** Gold

**PRIMARY TOPICS:** Arrays, cycle detection

**SECONDARY TOPICS:** Index-as-next-pointer, tortoise-hare

**CORE TECHNIQUE:** Functional cycle detection

**PROBLEM STRUCTURE:** Find a duplicated value in a constrained range by interpreting values as next pointers in a functional graph.

**REQUIRED INSIGHT:** Recognize functional cycle detection as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** The duplicate is the cycle entrance, so the task avoids sorting or extra hash storage.

**ALLOWED VARIATIONS:** Repeated identifier, corrupted range label, or duplicate in 1..n array.

**FORBIDDEN VARIATIONS:** Multiple duplicates, out-of-range values, missing-plus-duplicate recovery, or modifying input.

**RECOMMENDED CONSTRAINT RANGE:** n 2–300,000; values 1..n-1; O(n), O(1) extra.

**COMMON TRAPS:** Phase reset, valid bounds, distinguish index/value.

**GENERATION NOTES:** Promise exactly one repeated value and range-compatible values.

## G-037 — Asteroid Collision Reduction

**RANK:** Gold

**PRIMARY TOPICS:** Arrays, stacks

**SECONDARY TOPICS:** Directional conflict, repeated resolution

**CORE TECHNIQUE:** Simulation stack

**PROBLEM STRUCTURE:** Resolve a sequence of moving items when only opposite-direction neighbors can collide and survivors may cause cascades.

**REQUIRED INSIGHT:** Recognize simulation stack as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** The stack models unresolved forward movers and requires repeated conflict resolution, unlike simple adjacent cancellation.

**ALLOWED VARIATIONS:** Signed asteroid sizes, opposing robots with strength, or directional tokens.

**FORBIDDEN VARIATIONS:** Three-way collisions, arbitrary speeds/positions, continuous-time geometry, or pair scheduling.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n).

**COMMON TRAPS:** Equal-size annihilation, loop after pop, same-direction noncollision.

**GENERATION NOTES:** Use a fixed left/right direction encoding and integer magnitudes.

## G-038 — Generate Balanced Delimiter Strings

**RANK:** Gold

**PRIMARY TOPICS:** Backtracking, strings

**SECONDARY TOPICS:** Prefix invariant, recursion

**CORE TECHNIQUE:** Pruned generation

**PROBLEM STRUCTURE:** Generate all strings with paired delimiters by allowing an opening token while capacity remains and a closing token only when the prefix stays valid.

**REQUIRED INSIGHT:** Recognize pruned generation as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** The partial-prefix invariant prunes the construction space before invalid strings are formed.

**ALLOWED VARIATIONS:** Balanced parentheses, matched braces, or tiny well-formed command sequences.

**FORBIDDEN VARIATIONS:** Large n, multiple context-free grammar rules, counting-only DP, or arbitrary wildcard symbols.

**RECOMMENDED CONSTRAINT RANGE:** pair count at most 9; output bounded.

**COMMON TRAPS:** Track open/close counts, base case, output order.

**GENERATION NOTES:** Use one delimiter type and require all generated strings.

## G-039 — Largest Concatenated Number Ordering

**RANK:** Gold

**PRIMARY TOPICS:** Sorting, greedy

**SECONDARY TOPICS:** Custom comparator, string composition

**CORE TECHNIQUE:** Comparator sorting

**PROBLEM STRUCTURE:** Order numeric strings by comparing pairwise concatenations so their combined result is largest/smallest.

**REQUIRED INSIGHT:** Recognize comparator sorting as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** The key is a nonnumeric ordering rule based on contribution to a global concatenation.

**ALLOWED VARIATIONS:** Largest code string, best display number, or smallest nonleading-zero concatenation.

**FORBIDDEN VARIATIONS:** Arbitrary custom languages, negative numbers, huge memory joins, or multiple competing objectives.

**RECOMMENDED CONSTRAINT RANGE:** n 1–100,000; total digits 200,000; O(n log n).

**COMMON TRAPS:** Comparator a+b versus b+a, all zeros, string conversion.

**GENERATION NOTES:** Use nonnegative integer tokens and one concatenation objective.

## G-040 — Grid Word Trace

**RANK:** Gold

**PRIMARY TOPICS:** Grids, backtracking

**SECONDARY TOPICS:** DFS, visited cells

**CORE TECHNIQUE:** Constrained DFS

**PROBLEM STRUCTURE:** Decide whether a short target can be traced through orthogonally adjacent grid cells without reusing a cell.

**REQUIRED INSIGHT:** Recognize constrained dfs as the compact pattern that replaces brute-force candidate checking.

**UNIQUE DIFFERENTIATOR:** The state couples target progress with a reversible local visited choice, unlike unconstrained BFS.

**ALLOWED VARIATIONS:** Find a word, command path, numeric pattern, or simple sequence trace.

**FORBIDDEN VARIATIONS:** Many queries, diagonal movement, large target sets/trie, or weighted paths.

**RECOMMENDED CONSTRAINT RANGE:** grid cells at most 100; target length at most 15.

**COMMON TRAPS:** Restore visited state, base case, bounds.

**GENERATION NOTES:** Use a small grid, one target, and four-neighbor moves.

## P-001 — Binary-Search Minimum Capacity

**RANK:** Platinum

**PRIMARY TOPICS:** Binary search, greedy

**SECONDARY TOPICS:** Feasibility simulation, partitioning

**CORE TECHNIQUE:** Answer search

**PROBLEM STRUCTURE:** Find the least capacity allowing an ordered workload to be split under a bounded number of groups.

**REQUIRED INSIGHT:** Combine the stated components of answer search while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** A numeric optimization becomes a monotone yes/no check coupled with greedy packing.

**ALLOWED VARIATIONS:** Ship packages, allocate chapters, batch jobs, or daily capacity.

**FORBIDDEN VARIATIONS:** Reordering items, negative loads, multidimensional capacity, or noncontiguous groups.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n log sum).

**COMMON TRAPS:** Lower bound max item, group counting, 64-bit sums.

**GENERATION NOTES:** Keep order fixed, loads nonnegative, and feasibility greedy.

## P-002 — Binary-Search Maximum Minimum Spacing

**RANK:** Platinum

**PRIMARY TOPICS:** Binary search, sorting

**SECONDARY TOPICS:** Greedy placement, feasibility

**CORE TECHNIQUE:** Answer search

**PROBLEM STRUCTURE:** Maximize the minimum separation among a fixed number of selected ordered positions.

**REQUIRED INSIGHT:** Combine the stated components of answer search while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** The objective is inverted into testing whether greedy placement can achieve a candidate distance.

**ALLOWED VARIATIONS:** Place routers, checkpoints, seats, or sensors.

**FORBIDDEN VARIATIONS:** Weighted positions, variable selection count, 2D placement, or arbitrary graph distance.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n log range).

**COMMON TRAPS:** Sort first, first placement, binary bounds.

**GENERATION NOTES:** Use one-dimensional coordinates and unit selection costs.

## P-003 — Binary-Search Earliest Completion Rate

**RANK:** Platinum

**PRIMARY TOPICS:** Binary search, arithmetic

**SECONDARY TOPICS:** Ceiling feasibility, rate

**CORE TECHNIQUE:** Answer search

**PROBLEM STRUCTURE:** Find the minimum integer processing rate that completes independent workloads by a deadline.

**REQUIRED INSIGHT:** Combine the stated components of answer search while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** It couples numerical binary search with a sum of rounded per-item times.

**ALLOWED VARIATIONS:** Eating speed, download rate, machine pace, or inspection rate.

**FORBIDDEN VARIATIONS:** Parallel interacting machines, fractional rates, sequence-dependent jobs, or scheduling choices.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n log max value).

**COMMON TRAPS:** Ceiling division, time overflow, lower bound one.

**GENERATION NOTES:** Workloads must be independent and rate applies uniformly.

## P-004 — Partition Array Minimax DP-Free

**RANK:** Platinum

**PRIMARY TOPICS:** Binary search, greedy

**SECONDARY TOPICS:** Contiguous groups, feasibility

**CORE TECHNIQUE:** Answer search

**PROBLEM STRUCTURE:** Minimize the largest segment sum while making exactly/at-most a stated number of contiguous partitions.

**REQUIRED INSIGHT:** Combine the stated components of answer search while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** It is a partition objective solved by feasibility, distinct from capacity story surface.

**ALLOWED VARIATIONS:** Split lectures, divide pages, shard logs, or partition workloads.

**FORBIDDEN VARIATIONS:** Negative values, arbitrary reorder, per-group overheads, or reconstruction-heavy requirements.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; nonnegative values; O(n log sum).

**COMMON TRAPS:** At-most versus exactly groups, lower bounds, group count.

**GENERATION NOTES:** Use nonnegative weights and a pure minimax objective.

## P-005 — Shortest Path with One Wall Break

**RANK:** Platinum

**PRIMARY TOPICS:** Graphs, BFS

**SECONDARY TOPICS:** State expansion, grid

**CORE TECHNIQUE:** Stateful BFS

**PROBLEM STRUCTURE:** Find a shortest unweighted grid path while a single resource permits one blocked-cell traversal.

**REQUIRED INSIGHT:** Combine the stated components of stateful bfs while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** The visited state must include both location and remaining break permission.

**ALLOWED VARIATIONS:** One obstacle removal, one coupon edge, or one locked door key.

**FORBIDDEN VARIATIONS:** Many resources, weighted edges, teleport networks, or shortest-path counting.

**RECOMMENDED CONSTRAINT RANGE:** grid cells up to 200,000; O(cells).

**COMMON TRAPS:** Visited dimension, start/end blocked policy, use break once or at most once.

**GENERATION NOTES:** Use unit edges and a binary resource state.

## P-006 — Multi-Source Distance Spread

**RANK:** Platinum

**PRIMARY TOPICS:** Graphs, BFS

**SECONDARY TOPICS:** Queue initialization, distance

**CORE TECHNIQUE:** Multi-source BFS

**PROBLEM STRUCTURE:** Compute nearest-source distance or time to spread from many initial sources simultaneously.

**REQUIRED INSIGHT:** Combine the stated components of multi-source bfs while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** All sources enter the same wavefront, unlike repeatedly running single-source BFS.

**ALLOWED VARIATIONS:** Fire spread, nearest charging station, rotting items, or flood distance.

**FORBIDDEN VARIATIONS:** Weighted edges, changing sources, obstacles with keys, or path reconstruction for every cell.

**RECOMMENDED CONSTRAINT RANGE:** vertices/edges or grid cells up to 300,000; O(V+E).

**COMMON TRAPS:** Initialize all sources, unreachable cells, level counting.

**GENERATION NOTES:** Use unweighted adjacency and one homogeneous source type.

## P-007 — Alternating-Color Reachability

**RANK:** Platinum

**PRIMARY TOPICS:** Graphs, BFS

**SECONDARY TOPICS:** State by last edge color, adjacency

**CORE TECHNIQUE:** Stateful BFS

**PROBLEM STRUCTURE:** Reach nodes using paths whose successive edges must alternate between two types.

**REQUIRED INSIGHT:** Combine the stated components of stateful bfs while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** A node alone is insufficient state; the last edge class constrains the next transition.

**ALLOWED VARIATIONS:** Red/blue roads, turn-taking paths, or alternating commands.

**FORBIDDEN VARIATIONS:** More than two dynamic constraints, weighted costs, or arbitrary regular-language automata.

**RECOMMENDED CONSTRAINT RANGE:** V+E up to 200,000; O(V+E).

**COMMON TRAPS:** Separate visited states, start without color, duplicate edges.

**GENERATION NOTES:** Use exactly two edge types and unit length.

## P-008 — Grid Components with Perimeter

**RANK:** Platinum

**PRIMARY TOPICS:** Grids, DFS/BFS

**SECONDARY TOPICS:** Traversal, local edge count

**CORE TECHNIQUE:** Component traversal

**PROBLEM STRUCTURE:** Traverse marked cells to calculate a component property that includes its exposed boundary.

**REQUIRED INSIGHT:** Combine the stated components of component traversal while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** It combines connectivity search with a local geometric accumulation.

**ALLOWED VARIATIONS:** Island perimeter, fenced region edge count, exposed voxel face in 2D, or boundary tiles.

**FORBIDDEN VARIATIONS:** Holes classification, dynamic updates, weighted geometry, or many components with queries.

**RECOMMENDED CONSTRAINT RANGE:** grid cells up to 200,000; O(cells).

**COMMON TRAPS:** Count outer edges, visited cells, grid bounds.

**GENERATION NOTES:** Use four-neighbor connectivity and a single marked-cell type.

## P-009 — Topological Course Feasibility

**RANK:** Platinum

**PRIMARY TOPICS:** Graphs, BFS

**SECONDARY TOPICS:** Indegrees, directed acyclic structure

**CORE TECHNIQUE:** Kahn traversal

**PROBLEM STRUCTURE:** Decide whether directed prerequisites can all be completed by repeatedly removing zero-indegree nodes.

**REQUIRED INSIGHT:** Combine the stated components of kahn traversal while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** It recognizes a cycle through failure of a degree-based elimination, not generic DFS reachability.

**ALLOWED VARIATIONS:** Courses, build dependencies, task unlocks, or recipe prerequisites.

**FORBIDDEN VARIATIONS:** Weighted schedules, count orders, SCC reporting, or arbitrary cycle witness.

**RECOMMENDED CONSTRAINT RANGE:** V+E up to 300,000; O(V+E).

**COMMON TRAPS:** Edge direction, duplicate edges, initial zero indegrees.

**GENERATION NOTES:** Ask only feasibility or one valid order.

## P-010 — Bipartite Constraint Coloring

**RANK:** Platinum

**PRIMARY TOPICS:** Graphs, BFS/DFS

**SECONDARY TOPICS:** Two-coloring, components

**CORE TECHNIQUE:** Graph coloring

**PROBLEM STRUCTURE:** Assign two opposing labels to every connected component while checking each edge.

**REQUIRED INSIGHT:** Combine the stated components of graph coloring while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** It turns pairwise incompatibility into a parity-consistent traversal state.

**ALLOWED VARIATIONS:** Rival teams, same/different statements, two-shift schedule, or alternating graph.

**FORBIDDEN VARIATIONS:** More than two colors, weighted constraints, dynamic edges, or maximum matching.

**RECOMMENDED CONSTRAINT RANGE:** V+E up to 300,000; O(V+E).

**COMMON TRAPS:** Disconnected components, self-loop, color propagation.

**GENERATION NOTES:** Use undirected graph and exactly binary opposite constraints.

## P-011 — Shortest Path in Number State Space

**RANK:** Platinum

**PRIMARY TOPICS:** BFS, arithmetic

**SECONDARY TOPICS:** Implicit graph, transitions

**CORE TECHNIQUE:** Implicit BFS

**PROBLEM STRUCTURE:** Find minimum operations between values when each allowed operation defines unit-cost transitions over a bounded range.

**REQUIRED INSIGHT:** Combine the stated components of implicit bfs while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** The graph is implicit and generated from state rules rather than given as adjacency lists.

**ALLOWED VARIATIONS:** Add/subtract/multiply moves, lock changes, or integer transformations.

**FORBIDDEN VARIATIONS:** Huge unbounded states, weighted moves, operation history constraints, or bidirectional requirements.

**RECOMMENDED CONSTRAINT RANGE:** state range up to 300,000; O(range).

**COMMON TRAPS:** Bounds, visited marking, start equals target.

**GENERATION NOTES:** Use a small fixed transition set and a finite state interval.

## P-012 — One-Dimensional House Selection DP

**RANK:** Platinum

**PRIMARY TOPICS:** Dynamic programming, arrays

**SECONDARY TOPICS:** Recurrence, nonadjacency

**CORE TECHNIQUE:** Linear DP

**PROBLEM STRUCTURE:** Maximize a sum by selecting nonadjacent positions through a two-state recurrence.

**REQUIRED INSIGHT:** Combine the stated components of linear dp while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** The choice is local but future-constraining, requiring DP rather than direct greedy.

**ALLOWED VARIATIONS:** Rob houses, pick spaced rewards, harvest plots, or select nonconsecutive values.

**FORBIDDEN VARIATIONS:** Circular dependency, arbitrary distance weights, reconstruction with many constraints, or trees.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n).

**COMMON TRAPS:** Base cases, negative values policy, rolling variables.

**GENERATION NOTES:** Use a line and a single no-adjacent constraint.

## P-013 — Minimum Cost Step DP

**RANK:** Platinum

**PRIMARY TOPICS:** Dynamic programming, arrays

**SECONDARY TOPICS:** Small transitions, recurrence

**CORE TECHNIQUE:** Linear DP

**PROBLEM STRUCTURE:** Reach an endpoint at minimum cost when each step can come from one of a few previous states.

**REQUIRED INSIGHT:** Combine the stated components of linear dp while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** It introduces a minimization recurrence with compact rolling storage.

**ALLOWED VARIATIONS:** Stair costs, frog jumps of 1/2, checkpoints, or toll path.

**FORBIDDEN VARIATIONS:** Large jump ranges needing deques, negative cycles, or path count variants.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n).

**COMMON TRAPS:** Start options, final step definition, cost width.

**GENERATION NOTES:** Allow exactly one or two prior transition lengths.

## P-014 — Decode Count with Local Validity

**RANK:** Platinum

**PRIMARY TOPICS:** Dynamic programming, strings

**SECONDARY TOPICS:** Prefix recurrence, digit parsing

**CORE TECHNIQUE:** String DP

**PROBLEM STRUCTURE:** Count ways to parse a digit string into valid one/two-symbol codes.

**REQUIRED INSIGHT:** Combine the stated components of string dp while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** Each position depends on local token validity, a compact combinatorial recurrence.

**ALLOWED VARIATIONS:** Alphabet decoding, packet segmentation, or paired-token parsing.

**FORBIDDEN VARIATIONS:** Wildcards, large code ranges, grammar parsing, or output all decodings.

**RECOMMENDED CONSTRAINT RANGE:** length up to 100,000; modulo specified; O(n).

**COMMON TRAPS:** Zero rules, two-digit bounds, modulus.

**GENERATION NOTES:** Use a fixed two-character code range and ask only count.

## P-015 — Bounded Sum Reachability DP

**RANK:** Platinum

**PRIMARY TOPICS:** Dynamic programming, arrays

**SECONDARY TOPICS:** Boolean state, subset accumulation

**CORE TECHNIQUE:** Bitset/boolean DP

**PROBLEM STRUCTURE:** Decide which sums are reachable using each small item at most once.

**REQUIRED INSIGHT:** Combine the stated components of bitset/boolean dp while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** The state represents attainable totals, not recursive enumeration, enabling larger n with modest target.

**ALLOWED VARIATIONS:** Target weight, balance difference, partition feasibility, or coupon totals.

**FORBIDDEN VARIATIONS:** Huge target, counts of solutions, negative values, or multiple dimensions.

**RECOMMENDED CONSTRAINT RANGE:** n up to 200; target up to 20,000; O(n*target).

**COMMON TRAPS:** Descending update, sum zero, repeated values.

**GENERATION NOTES:** Keep one target dimension and decision objective.

## P-016 — Longest Increasing Subsequence Tails

**RANK:** Platinum

**PRIMARY TOPICS:** Dynamic programming, binary search

**SECONDARY TOPICS:** Tails array, lower bound

**CORE TECHNIQUE:** Patience-style DP

**PROBLEM STRUCTURE:** Find LIS length by maintaining the best ending value for every possible length.

**REQUIRED INSIGHT:** Combine the stated components of patience-style dp while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** The non-obvious state compression replaces quadratic pair comparison.

**ALLOWED VARIATIONS:** Increasing scores, nesting envelopes after sort, or strictly/non-strict sequence.

**FORBIDDEN VARIATIONS:** Reconstruct full sequence unless optional, multiple dimensions without ordering reduction, or weighted LIS.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n log n).

**COMMON TRAPS:** Lower versus upper bound, strictness, tails replacement.

**GENERATION NOTES:** Request length only and state strict/non-strict relation.

## P-017 — Edit Distance with One Operation Type

**RANK:** Platinum

**PRIMARY TOPICS:** Dynamic programming, strings

**SECONDARY TOPICS:** Small 2D recurrence, restricted edits

**CORE TECHNIQUE:** Grid DP

**PROBLEM STRUCTURE:** Compute minimum changes under one/two explicitly limited edit operations for short strings.

**REQUIRED INSIGHT:** Combine the stated components of grid dp while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** It is a compact alignment DP, distinct from full-scale unrestricted text matching.

**ALLOWED VARIATIONS:** Insert/delete only, substitutions only, or minimum deletions to equality.

**FORBIDDEN VARIATIONS:** Long strings, transpositions, weighted edit costs, or sequence reconstruction.

**RECOMMENDED CONSTRAINT RANGE:** lengths up to 1,500; O(nm).

**COMMON TRAPS:** Base row/column, operation set, memory use.

**GENERATION NOTES:** Use short inputs and a small fixed operation set.

## P-018 — Minimum Partition Difference Bitset

**RANK:** Platinum

**PRIMARY TOPICS:** Dynamic programming, arrays

**SECONDARY TOPICS:** Reachable sums, complement

**CORE TECHNIQUE:** Subset DP

**PROBLEM STRUCTURE:** Split a small-total collection into two groups whose sums are as close as possible.

**REQUIRED INSIGHT:** Combine the stated components of subset dp while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** It turns a two-group optimization into a single reachable-sum search near half the total.

**ALLOWED VARIATIONS:** Balance loads, divide gifts, or equalize weights.

**FORBIDDEN VARIATIONS:** Large totals, arbitrary number of groups, negative numbers, or count optimal partitions.

**RECOMMENDED CONSTRAINT RANGE:** n up to 200; total sum up to 30,000.

**COMMON TRAPS:** Scan near half, descending updates, total parity.

**GENERATION NOTES:** Use nonnegative values and a modest total sum.

## P-019 — Greedy Refuel with Max Heap

**RANK:** Platinum

**PRIMARY TOPICS:** Greedy, heaps

**SECONDARY TOPICS:** Reachability, deferred choices

**CORE TECHNIQUE:** Heap greedy

**PROBLEM STRUCTURE:** Reach a target with minimum stops by storing passed fuel options and taking the largest only when necessary.

**REQUIRED INSIGHT:** Combine the stated components of heap greedy while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** Choices are deferred until forced, distinguishing it from ordinary interval or deadline heaps.

**ALLOWED VARIATIONS:** Fuel stations, battery packs, supply depots, or cache refill points.

**FORBIDDEN VARIATIONS:** Variable fuel consumption, route choice graph, fractional refueling, or multiple vehicles.

**RECOMMENDED CONSTRAINT RANGE:** n 1–100,000; O(n log n).

**COMMON TRAPS:** Station ordering, unreachable case, consume-before-add logic.

**GENERATION NOTES:** Use one fixed route with nondecreasing station positions.

## P-020 — Streaming Median with Two Heaps

**RANK:** Platinum

**PRIMARY TOPICS:** Heaps, arrays

**SECONDARY TOPICS:** Balancing, partition invariant

**CORE TECHNIQUE:** Dual heap maintenance

**PROBLEM STRUCTURE:** Maintain a median after each insertion using two balanced heaps representing lower and upper halves.

**REQUIRED INSIGHT:** Combine the stated components of dual heap maintenance while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** The value partition invariant needs two structures, not a fixed-k heap.

**ALLOWED VARIATIONS:** Live scores, running latency median, or online middle value.

**FORBIDDEN VARIATIONS:** Deletions, arbitrary quantiles, weighted medians, or sliding windows.

**RECOMMENDED CONSTRAINT RANGE:** n 1–100,000; O(n log n).

**COMMON TRAPS:** Heap balance, even count convention, insertion side.

**GENERATION NOTES:** Use insertion-only stream and state median convention exactly.

## P-021 — K-Closest Selection by Heap

**RANK:** Platinum

**PRIMARY TOPICS:** Heaps, sorting

**SECONDARY TOPICS:** Distance key, size cap

**CORE TECHNIQUE:** Bounded heap selection

**PROBLEM STRUCTURE:** Select k items closest to a target using a distance key and a bounded worst-first heap.

**REQUIRED INSIGHT:** Combine the stated components of bounded heap selection while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** It combines metric transformation with candidate maintenance, unlike kth extreme by raw value.

**ALLOWED VARIATIONS:** Closest points on line, nearest scores, or closest timestamps.

**FORBIDDEN VARIATIONS:** Two-dimensional Euclidean precision, ties with complex rule, updates, or all queries.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n log k).

**COMMON TRAPS:** Absolute difference overflow, tie policy, heap polarity.

**GENERATION NOTES:** Use one-dimensional integer distance and fixed k.

## P-022 — Sweep-Line Maximum Coverage

**RANK:** Platinum

**PRIMARY TOPICS:** Intervals, sorting

**SECONDARY TOPICS:** Events, running count

**CORE TECHNIQUE:** Event sweep

**PROBLEM STRUCTURE:** Find the point/period with maximum simultaneous interval coverage by ordering endpoint events.

**REQUIRED INSIGHT:** Combine the stated components of event sweep while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** It converts overlap geometry into signed event accumulation, distinct from allocating rooms.

**ALLOWED VARIATIONS:** Peak users, busiest time, maximum paintings, or coverage count.

**FORBIDDEN VARIATIONS:** Dynamic intervals, weighted complex ties, multiple dimensions, or range queries.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n log n).

**COMMON TRAPS:** Start/end tie order, closed intervals, max update.

**GENERATION NOTES:** State endpoint convention and use unit weights unless simple weights are desired.

## P-023 — Merge Cost via Minimum Heap

**RANK:** Platinum

**PRIMARY TOPICS:** Greedy, heaps

**SECONDARY TOPICS:** Optimal merge pattern, accumulation

**CORE TECHNIQUE:** Greedy heap

**PROBLEM STRUCTURE:** Repeatedly combine two smallest items to minimize total pairwise merge cost.

**REQUIRED INSIGHT:** Combine the stated components of greedy heap while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** The optimum follows from making low weights pay repeated costs, an exchange-pattern greedy.

**ALLOWED VARIATIONS:** File merges, rope joining, card combining, or batch aggregation.

**FORBIDDEN VARIATIONS:** Arbitrary arity, negative weights, reconstruction, or constraints requiring DP.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n log n).

**COMMON TRAPS:** Cost width, push combined item, one-item case.

**GENERATION NOTES:** Use positive weights and binary merge cost equal to sum.

## P-024 — Sort-and-Scan Dominance Chain

**RANK:** Platinum

**PRIMARY TOPICS:** Sorting, greedy

**SECONDARY TOPICS:** Ordering, local validity

**CORE TECHNIQUE:** Ordered greedy

**PROBLEM STRUCTURE:** After sorting items by one key, greedily form maximum chain/count under a monotone second-key relation.

**REQUIRED INSIGHT:** Combine the stated components of ordered greedy while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** Ordering makes a previously global compatibility relation locally testable.

**ALLOWED VARIATIONS:** Nested envelopes with one tie rule, nonoverlapping deadlines, or increasing paired sizes.

**FORBIDDEN VARIATIONS:** Full 2D LIS, weighted chains, arbitrary partial orders, or three dimensions.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n log n).

**COMMON TRAPS:** Tie sort direction, strictness, equal keys.

**GENERATION NOTES:** Use a relation reducible to one sorted scan, not general 2D optimization.

## P-025 — Minimum Swaps to Group Binary Items

**RANK:** Platinum

**PRIMARY TOPICS:** Arrays, sliding window

**SECONDARY TOPICS:** Fixed-window count, circular option

**CORE TECHNIQUE:** Window optimization

**PROBLEM STRUCTURE:** Find the fewest swaps needed to cluster all items of one binary type by maximizing good items in a fixed-length window.

**REQUIRED INSIGHT:** Combine the stated components of window optimization while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** It recasts a swap objective as a best-window count; no actual swap simulation is needed.

**ALLOWED VARIATIONS:** Group ones, group marked seats, or circular grouping with one wrap.

**FORBIDDEN VARIATIONS:** More than two types, adjacent-swap distance, weighted swaps, or dynamic arrays.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n).

**COMMON TRAPS:** No target items, window size equals count, circular duplication.

**GENERATION NOTES:** Use arbitrary swaps and a binary marker type.

## P-026 — Trapping Rain Between Bars

**RANK:** Platinum

**PRIMARY TOPICS:** Arrays, two pointers

**SECONDARY TOPICS:** Running maxima, boundary choice

**CORE TECHNIQUE:** Two-sided scan

**PROBLEM STRUCTURE:** Sum water held at each position by advancing the side with smaller known boundary.

**REQUIRED INSIGHT:** Combine the stated components of two-sided scan while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** The solution relies on a two-boundary invariant rather than calculating per-cell scans.

**ALLOWED VARIATIONS:** Elevation bars, retaining walls, or stored capacity profile.

**FORBIDDEN VARIATIONS:** 2D trapping, dynamic height updates, overflow-prone huge dimensions, or arbitrary basins.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n).

**COMMON TRAPS:** Update max before/after, equal heights, 64-bit total.

**GENERATION NOTES:** Use nonnegative one-dimensional heights.

## P-027 — Largest Rectangle in Histogram

**RANK:** Platinum

**PRIMARY TOPICS:** Arrays, monotonic stack

**SECONDARY TOPICS:** Boundaries, sentinel

**CORE TECHNIQUE:** Monotone stack

**PROBLEM STRUCTURE:** Compute each bar's maximal span as shortest height using a stack of increasing bars.

**REQUIRED INSIGHT:** Combine the stated components of monotone stack while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** It combines nearest-smaller boundaries with area optimization in one compact pass.

**ALLOWED VARIATIONS:** Histogram area, widest constant-capacity run, or rectangular resource allocation.

**FORBIDDEN VARIATIONS:** 2D maximal rectangle, variable per-query bars, or dynamic updates.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n).

**COMMON TRAPS:** Sentinel flush, width endpoints, equal-height policy.

**GENERATION NOTES:** Use one histogram and request maximum area only.

## P-028 — Coordinate Compression with Range Marks

**RANK:** Platinum

**PRIMARY TOPICS:** Arrays, sorting

**SECONDARY TOPICS:** Compression, difference array

**CORE TECHNIQUE:** Compress then mark

**PROBLEM STRUCTURE:** Map sparse ordered coordinates to compact indices so simple range events can be processed.

**REQUIRED INSIGHT:** Combine the stated components of compress then mark while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** It couples order-preserving relabeling with a basic range technique, not general geometry.

**ALLOWED VARIATIONS:** Booked dates, sparse addresses, line coverage, or event timestamps.

**FORBIDDEN VARIATIONS:** Arbitrary distance semantics after compression, 2D coordinates, dynamic new values, or segment trees.

**RECOMMENDED CONSTRAINT RANGE:** points+events up to 200,000; O(n log n).

**COMMON TRAPS:** Include endpoints, map lookup, compressed adjacency interpretation.

**GENERATION NOTES:** Use compression only for order/range membership, not physical distances unless preserved explicitly.

## P-029 — Bitmask Subset Enumeration with Compatibility

**RANK:** Platinum

**PRIMARY TOPICS:** Bit manipulation, arrays

**SECONDARY TOPICS:** Masks, local validity

**CORE TECHNIQUE:** Subset mask scan

**PROBLEM STRUCTURE:** Enumerate all subsets of a tiny feature set and select/count those satisfying stated compatibility masks.

**REQUIRED INSIGHT:** Combine the stated components of subset mask scan while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** Bit representations make subset construction and membership checks constant-time.

**ALLOWED VARIATIONS:** Compatible tool kits, allowed permissions, small set cover decision, or disjoint mask selection.

**FORBIDDEN VARIATIONS:** n beyond 22, subset DP, complex global optimization, or huge output.

**RECOMMENDED CONSTRAINT RANGE:** features at most 20; O(2^n).

**COMMON TRAPS:** Mask initialization, subset loop bounds, empty subset.

**GENERATION NOTES:** Use a small universe and one Boolean mask predicate.

## P-030 — XOR Prefix Frequency Pairs

**RANK:** Platinum

**PRIMARY TOPICS:** Bitwise, hash maps

**SECONDARY TOPICS:** Prefix XOR, counting

**CORE TECHNIQUE:** Prefix hash counting

**PROBLEM STRUCTURE:** Count subarrays whose XOR equals a target by matching earlier XOR prefixes.

**REQUIRED INSIGHT:** Combine the stated components of prefix hash counting while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** It extends prefix-state matching to an XOR algebra, distinct from additive sums.

**ALLOWED VARIATIONS:** Target XOR ranges, parity-mask substrings, or toggle event segments.

**FORBIDDEN VARIATIONS:** Maximum XOR trie, point updates, 2D XOR, or multiple target queries.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n) expected.

**COMMON TRAPS:** Initial zero prefix, map update order, count width.

**GENERATION NOTES:** Use one target and static sequence.

## P-031 — Range Bitwise AND Stability

**RANK:** Platinum

**PRIMARY TOPICS:** Bit manipulation, binary search

**SECONDARY TOPICS:** Common-prefix observation

**CORE TECHNIQUE:** Bit pattern reduction

**PROBLEM STRUCTURE:** Find/compute the common bit prefix shared by all integers in a contiguous range.

**REQUIRED INSIGHT:** Combine the stated components of bit pattern reduction while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** It uses binary structure to avoid iterating every number, not merely repeated AND.

**ALLOWED VARIATIONS:** Range AND, common high bits, or mask stability threshold.

**FORBIDDEN VARIATIONS:** Huge multi-query structures, arbitrary sets, signed-range ambiguity, or bit DP.

**RECOMMENDED CONSTRAINT RANGE:** endpoints up to 10^18; O(log V).

**COMMON TRAPS:** Shift both ends, L>R, integer width.

**GENERATION NOTES:** Use nonnegative contiguous integer ranges.

## P-032 — Minimize Maximum Pair Difference

**RANK:** Platinum

**PRIMARY TOPICS:** Sorting, binary search

**SECONDARY TOPICS:** Greedy pairing, feasibility

**CORE TECHNIQUE:** Answer search

**PROBLEM STRUCTURE:** Form a stated number of disjoint pairs while minimizing the maximum within-pair difference.

**REQUIRED INSIGHT:** Combine the stated components of answer search while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** Sorted adjacency plus greedy pairing turns a pairing objective into a monotone decision.

**ALLOWED VARIATIONS:** Pair players, sensors, gloves, or timestamps.

**FORBIDDEN VARIATIONS:** Weighted matching, arbitrary graph pairs, crossing constraints, or maximize sum objectives.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n log range).

**COMMON TRAPS:** Skip versus pair greedily, disjointness, sorted gaps.

**GENERATION NOTES:** Use one-dimensional values and exactly p pairs.

## P-033 — Lexicographically Smallest Stack Output

**RANK:** Platinum

**PRIMARY TOPICS:** Strings, stacks

**SECONDARY TOPICS:** Suffix minimum, deferred output

**CORE TECHNIQUE:** Greedy stack

**PROBLEM STRUCTURE:** Produce the lexicographically smallest output obtainable by reading input through a stack.

**REQUIRED INSIGHT:** Combine the stated components of greedy stack while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** It combines a stack constraint with future suffix knowledge to decide when popping is safe.

**ALLOWED VARIATIONS:** Robot string, buffer output, or container reorder sequence.

**FORBIDDEN VARIATIONS:** Arbitrary deque operations, custom alphabet collation, or output with costs.

**RECOMMENDED CONSTRAINT RANGE:** length 1–200,000; O(n).

**COMMON TRAPS:** Compute suffix minima, equal characters, flush stack.

**GENERATION NOTES:** Use lowercase/ordered symbols and one input pass plus stack.

## P-034 — Shortest Removal for Nondecreasing Array

**RANK:** Platinum

**PRIMARY TOPICS:** Arrays, two pointers

**SECONDARY TOPICS:** Sorted prefix/suffix, merge

**CORE TECHNIQUE:** Two-ended optimization

**PROBLEM STRUCTURE:** Remove one contiguous subarray so the remaining concatenation is nondecreasing.

**REQUIRED INSIGHT:** Combine the stated components of two-ended optimization while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** It combines boundary detection with two-pointer bridge testing, beyond local sortedness checks.

**ALLOWED VARIATIONS:** Remove corrupted log block, discard one segment, or repair ordered measurements.

**FORBIDDEN VARIATIONS:** Multiple removals, edits/replacements, circular arrays, or weighted removal.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n).

**COMMON TRAPS:** Already sorted, prefix/suffix endpoints, bridge pointer.

**GENERATION NOTES:** Allow exactly one removal and ordinary nondecreasing order.

## P-035 — Count Subarrays with Fixed Number of Markers

**RANK:** Platinum

**PRIMARY TOPICS:** Arrays, sliding window

**SECONDARY TOPICS:** At-most conversion, subtraction

**CORE TECHNIQUE:** Window counting

**PROBLEM STRUCTURE:** Count subarrays with exactly k marked elements by subtracting counts with at most k and at most k-1.

**REQUIRED INSIGHT:** Combine the stated components of window counting while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** The exact constraint is derived from two monotone counting passes, not enumerated windows.

**ALLOWED VARIATIONS:** Exactly k odds, exactly k zeros, exactly k tagged events.

**FORBIDDEN VARIATIONS:** Multiple marker types, sum plus count constraints, negative marker weights, or dynamic queries.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n).

**COMMON TRAPS:** k=0, at-most helper, count width.

**GENERATION NOTES:** Each item must have a simple binary marker property.

## P-036 — Prefix-Minimum Validity Sweep

**RANK:** Platinum

**PRIMARY TOPICS:** Arrays, prefix sums

**SECONDARY TOPICS:** Invariant, greedy

**CORE TECHNIQUE:** Prefix invariant

**PROBLEM STRUCTURE:** Decide or minimally repair a sequence condition that is equivalent to every prefix aggregate respecting a bound.

**REQUIRED INSIGHT:** Combine the stated components of prefix invariant while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** The global validity collapses into tracking an extreme prefix, distinct from ordinary range queries.

**ALLOWED VARIATIONS:** Balanced inventory never negative, valid cumulative energy, or minimum initial resource.

**FORBIDDEN VARIATIONS:** Multiple resource types, rearrangements, arbitrary edits, or segment-tree queries.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n).

**COMMON TRAPS:** Prefix initial zero, minimum value, strict bound.

**GENERATION NOTES:** Use one additive state and one prefix lower/upper bound.

## P-037 — Shortest Bridge Between Regions

**RANK:** Platinum

**PRIMARY TOPICS:** Grids, DFS/BFS

**SECONDARY TOPICS:** Component marking, multi-source expansion

**CORE TECHNIQUE:** Two-phase traversal

**PROBLEM STRUCTURE:** Mark one connected region, then expand its entire frontier by BFS until reaching another region with minimum flips.

**REQUIRED INSIGHT:** Combine the stated components of two-phase traversal while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** It combines component identification with breadth-first distance expansion in a compact grid state.

**ALLOWED VARIATIONS:** Connect two islands, bridge colored zones, or minimum water cells to cross.

**FORBIDDEN VARIATIONS:** More than two region choices, weighted cells, dynamic grids, or diagonal movement.

**RECOMMENDED CONSTRAINT RANGE:** grid cells up to 200,000; O(cells).

**COMMON TRAPS:** Mark phase, initialize all border cells, off-by-one flips.

**GENERATION NOTES:** Guarantee exactly two four-connected marked regions.

## P-038 — Unbounded Coin Minimum DP

**RANK:** Platinum

**PRIMARY TOPICS:** Dynamic programming, arrays

**SECONDARY TOPICS:** Min recurrence, unbounded choices

**CORE TECHNIQUE:** One-dimensional DP

**PROBLEM STRUCTURE:** Find the fewest items needed to reach a target when each listed positive denomination can be reused indefinitely.

**REQUIRED INSIGHT:** Combine the stated components of one-dimensional dp while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** It is a minimization recurrence over target totals, distinct from bounded reachability.

**ALLOWED VARIATIONS:** Minimum coins, smallest pack count, or least operations with fixed increments.

**FORBIDDEN VARIATIONS:** Arbitrary negative increments, combination counts, huge target requiring number theory, or bounded inventory.

**RECOMMENDED CONSTRAINT RANGE:** target up to 100,000; denominations at most 100; O(target*k).

**COMMON TRAPS:** Infinity initialization, unreachable total, iteration direction.

**GENERATION NOTES:** Use positive integer denominations, reuse allowed, and return count only.

## P-039 — Zero-One Value Knapsack

**RANK:** Platinum

**PRIMARY TOPICS:** Dynamic programming, arrays

**SECONDARY TOPICS:** Capacity DP, descending update

**CORE TECHNIQUE:** One-dimensional optimization DP

**PROBLEM STRUCTURE:** Maximize total value under one capacity limit when each item may be chosen at most once.

**REQUIRED INSIGHT:** Combine the stated components of one-dimensional optimization dp while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** The descending capacity update preserves one-use semantics while the state captures value trade-offs.

**ALLOWED VARIATIONS:** Select equipment, fill a cargo limit, choose projects, or budget points.

**FORBIDDEN VARIATIONS:** Multiple capacities, unbounded reuse, fractional items, reconstruction requirement, or huge capacity.

**RECOMMENDED CONSTRAINT RANGE:** items up to 300; capacity up to 30,000; O(nC).

**COMMON TRAPS:** Descending loop, weight/value types, zero-weight items.

**GENERATION NOTES:** Use one integer capacity and nonnegative weights/values.

## P-040 — Reorganize Sequence Without Equal Neighbors

**RANK:** Platinum

**PRIMARY TOPICS:** Heaps, hash maps

**SECONDARY TOPICS:** Frequency, greedy placement

**CORE TECHNIQUE:** Max-heap greedy

**PROBLEM STRUCTURE:** Construct a sequence with no equal adjacent items by repeatedly selecting the most frequent available type while holding back the prior type.

**REQUIRED INSIGHT:** Combine the stated components of max-heap greedy while preserving its compact invariant or state.

**UNIQUE DIFFERENTIATOR:** It combines global frequency pressure with a one-step adjacency constraint.

**ALLOWED VARIATIONS:** Reorganize characters, schedule labels, alternate colors, or arrange task types.

**FORBIDDEN VARIATIONS:** Arbitrary cooldown greater than one, weighted tasks, lexicographic optimum, or many extra constraints.

**RECOMMENDED CONSTRAINT RANGE:** n up to 100,000; O(n log distinct).

**COMMON TRAPS:** Hold-back timing, impossible case, heap tie handling.

**GENERATION NOTES:** Use one adjacency-forbidden equality rule and request any valid output.

## D-001 — Dijkstra with One Discount

**RANK:** Diamond

**PRIMARY TOPICS:** Graphs, Dijkstra

**SECONDARY TOPICS:** Layered state, weighted shortest path

**CORE TECHNIQUE:** Stateful Dijkstra

**PROBLEM STRUCTURE:** Find a minimum-cost path when exactly/at most one edge can be traversed at a discounted cost.

**REQUIRED INSIGHT:** Discover the reduction to stateful dijkstra quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** The graph is expanded by coupon status while retaining a compact shortest-path implementation.

**ALLOWED VARIATIONS:** One free road, half-price flight, one toll waiver, or one boosted edge.

**FORBIDDEN VARIATIONS:** Multiple coupons, negative weights, path counts, or arbitrary discount formulas.

**RECOMMENDED CONSTRAINT RANGE:** V+E up to 200,000; nonnegative weights; O(E log V).

**COMMON TRAPS:** State distance array, coupon use timing, integer division.

**GENERATION NOTES:** Use one binary coupon state and nonnegative weights.

## D-002 — Dijkstra with Limited Stops

**RANK:** Diamond

**PRIMARY TOPICS:** Graphs, shortest paths

**SECONDARY TOPICS:** State by edges used, priority queue

**CORE TECHNIQUE:** Bounded-state shortest path

**PROBLEM STRUCTURE:** Find least cost subject to a small maximum number of edges/stops.

**REQUIRED INSIGHT:** Discover the reduction to bounded-state shortest path quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** Cost alone is insufficient because remaining stop budget changes future feasibility.

**ALLOWED VARIATIONS:** Flights with k stops, delivery hops, or bounded transfer routes.

**FORBIDDEN VARIATIONS:** Large k, negative weights, arbitrary resource dimensions, or complex Pareto frontiers.

**RECOMMENDED CONSTRAINT RANGE:** V+E up to 100,000; stop bound at most 30.

**COMMON TRAPS:** Off-by-one stops, state dominance, destination early exit.

**GENERATION NOTES:** Use nonnegative weights and a small explicit stop bound.

## D-003 — Union-Find Dynamic Connectivity

**RANK:** Diamond

**PRIMARY TOPICS:** Graphs, DSU

**SECONDARY TOPICS:** Components, union by size

**CORE TECHNIQUE:** Disjoint-set union

**PROBLEM STRUCTURE:** Process edge additions and answer whether two vertices have become connected.

**REQUIRED INSIGHT:** Discover the reduction to disjoint-set union quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** It maintains component representatives under merges, unlike one-time BFS connectivity.

**ALLOWED VARIATIONS:** Friend links, network cables, island additions, or team merges.

**FORBIDDEN VARIATIONS:** Edge deletions, path queries with weights, rollback DSU, or offline intervals.

**RECOMMENDED CONSTRAINT RANGE:** V+operations up to 300,000; near-linear.

**COMMON TRAPS:** Path compression, zero/one indexing, repeated unions.

**GENERATION NOTES:** Use insert-only undirected edges and connectivity/component-count queries.

## D-004 — DSU Cycle-Closing Edge

**RANK:** Diamond

**PRIMARY TOPICS:** Graphs, DSU

**SECONDARY TOPICS:** Redundant union, invariant

**CORE TECHNIQUE:** Disjoint-set detection

**PROBLEM STRUCTURE:** Identify the first/any edge that creates a cycle while components are incrementally merged.

**REQUIRED INSIGHT:** Discover the reduction to disjoint-set detection quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** A cycle is recognized locally by equal representatives, not through a full traversal.

**ALLOWED VARIATIONS:** Redundant cable, duplicate alliance, cycle-forming road, or invalid tree edge.

**FORBIDDEN VARIATIONS:** Directed cycles, edge removal repair, cycle reconstruction, or weighted constraints.

**RECOMMENDED CONSTRAINT RANGE:** V+E up to 300,000; near-linear.

**COMMON TRAPS:** Edge order, self-loops, return convention.

**GENERATION NOTES:** Use undirected insertions and request a single redundant edge result.

## D-005 — Minimum Spanning Connection via Kruskal

**RANK:** Diamond

**PRIMARY TOPICS:** Graphs, DSU

**SECONDARY TOPICS:** Sorted edges, components

**CORE TECHNIQUE:** Kruskal greedy

**PROBLEM STRUCTURE:** Connect all vertices at minimum total cost by accepting cheapest edges that join different components.

**REQUIRED INSIGHT:** Discover the reduction to kruskal greedy quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** It combines global edge ordering with DSU cycle prevention; it is not ordinary connectivity.

**ALLOWED VARIATIONS:** Wire cities, connect islands, cluster points with supplied edges, or lay roads.

**FORBIDDEN VARIATIONS:** Dense generated complete graphs, directed edges, negative-cycle stories, or second-best MST.

**RECOMMENDED CONSTRAINT RANGE:** V+E up to 200,000; O(E log E).

**COMMON TRAPS:** Disconnected graph, 64-bit sum, equal weights.

**GENERATION NOTES:** Provide an undirected weighted edge list and ask total cost/feasibility.

## D-006 — Tree Diameter by Double Traversal

**RANK:** Diamond

**PRIMARY TOPICS:** Trees, BFS/DFS

**SECONDARY TOPICS:** Farthest node, distance

**CORE TECHNIQUE:** Two-sweep tree property

**PROBLEM STRUCTURE:** Find the longest weighted/unweighted tree path through two farthest-point traversals.

**REQUIRED INSIGHT:** Discover the reduction to two-sweep tree property quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** The apparent all-pairs path problem collapses to two searches because the graph is a tree.

**ALLOWED VARIATIONS:** Network latency, longest cable chain, or farthest villages.

**FORBIDDEN VARIATIONS:** General graphs, dynamic trees, path reconstruction with complex ties, or negative weights.

**RECOMMENDED CONSTRAINT RANGE:** n up to 300,000; O(n).

**COMMON TRAPS:** Use iterative traversal if needed, weighted accumulation, n=1.

**GENERATION NOTES:** Guarantee a connected acyclic graph.

## D-007 — Tree Reroot Distance Sums

**RANK:** Diamond

**PRIMARY TOPICS:** Trees, DP

**SECONDARY TOPICS:** Subtree sizes, reroot transition

**CORE TECHNIQUE:** Rerooting DP

**PROBLEM STRUCTURE:** Compute sum of distances from every node by converting a root answer across edges.

**REQUIRED INSIGHT:** Discover the reduction to rerooting dp quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** A local reroot formula reuses global information instead of performing n traversals.

**ALLOWED VARIATIONS:** Best meeting root, network centrality sums, or relocation costs.

**FORBIDDEN VARIATIONS:** Weighted arbitrary reroot dimensions, dynamic updates, centroid decomposition, or all-pairs storage.

**RECOMMENDED CONSTRAINT RANGE:** n up to 200,000; O(n).

**COMMON TRAPS:** Parent sizes, root base sum, transition n-2*subtree.

**GENERATION NOTES:** Use an unweighted tree and request values for all nodes or their minimum.

## D-008 — Lowest Common Ancestor by Parent Lifting

**RANK:** Diamond

**PRIMARY TOPICS:** Trees, binary lifting

**SECONDARY TOPICS:** Ancestors, logarithmic jumps

**CORE TECHNIQUE:** Binary lifting

**PROBLEM STRUCTURE:** Answer many ancestor-meeting queries after compact logarithmic preprocessing.

**REQUIRED INSIGHT:** Discover the reduction to binary lifting quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** It replaces repeated upward walks with powers-of-two parent jumps.

**ALLOWED VARIATIONS:** Family ancestors, tree meeting point, org chart LCA, or shared folder root.

**FORBIDDEN VARIATIONS:** Dynamic tree edits, path aggregates, heavy-light decomposition, or arbitrary directed graphs.

**RECOMMENDED CONSTRAINT RANGE:** n+q up to 200,000; O((n+q)log n).

**COMMON TRAPS:** Depth alignment, log table size, root parent.

**GENERATION NOTES:** Use a static rooted tree and LCA-only queries.

## D-009 — Fenwick Prefix Update Query

**RANK:** Diamond

**PRIMARY TOPICS:** Arrays, Fenwick tree

**SECONDARY TOPICS:** Lowbit, point update

**CORE TECHNIQUE:** Binary indexed tree

**PROBLEM STRUCTURE:** Support point increments and prefix/range sum queries faster than rescanning.

**REQUIRED INSIGHT:** Discover the reduction to binary indexed tree quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** It adds a compact logarithmic mutable prefix structure, unlike static prefix sums.

**ALLOWED VARIATIONS:** Score updates, inventory deltas, live counts, or inversion subroutine.

**FORBIDDEN VARIATIONS:** Range updates with range queries, min/max aggregation, segment trees, or 2D Fenwick.

**RECOMMENDED CONSTRAINT RANGE:** n+q up to 300,000; O((n+q)log n).

**COMMON TRAPS:** One-indexing, lowbit loop direction, 64-bit sums.

**GENERATION NOTES:** Use additive point updates and prefix/range-sum queries only.

## D-010 — Inversion Counting by Fenwick Compression

**RANK:** Diamond

**PRIMARY TOPICS:** Arrays, Fenwick tree

**SECONDARY TOPICS:** Coordinate compression, order counts

**CORE TECHNIQUE:** Fenwick accumulation

**PROBLEM STRUCTURE:** Count out-of-order pairs by ranking values and accumulating prior/later frequencies.

**REQUIRED INSIGHT:** Discover the reduction to fenwick accumulation quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** It combines order compression with a mutable frequency prefix, beyond sorting alone.

**ALLOWED VARIATIONS:** Rank inversions, overtakes, disorder count, or smaller-after counts.

**FORBIDDEN VARIATIONS:** Online deletions, multidimensional dominance, weighted inversions, or reconstruction.

**RECOMMENDED CONSTRAINT RANGE:** n up to 200,000; O(n log n).

**COMMON TRAPS:** Equal values strictness, compression map, count width.

**GENERATION NOTES:** Use one-dimensional comparisons and static array.

## D-011 — Count Smaller After Self

**RANK:** Diamond

**PRIMARY TOPICS:** Arrays, Fenwick tree

**SECONDARY TOPICS:** Reverse scan, ranks

**CORE TECHNIQUE:** Fenwick order statistic

**PROBLEM STRUCTURE:** For each position, count later values strictly smaller via a reverse frequency structure.

**REQUIRED INSIGHT:** Discover the reduction to fenwick order statistic quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** It produces a full per-position dominance profile, not one total inversion number.

**ALLOWED VARIATIONS:** Future lower prices, later weaker scores, or smaller items to right.

**FORBIDDEN VARIATIONS:** Updates, two-dimensional conditions, arbitrary tie ordering, or merge-sort variant requirement.

**RECOMMENDED CONSTRAINT RANGE:** n up to 200,000; O(n log n).

**COMMON TRAPS:** Reverse iteration, query rank-1, duplicates.

**GENERATION NOTES:** Use static scalar values and strict comparison.

## D-012 — Coordinate Sweep Line Segment Intersections

**RANK:** Diamond

**PRIMARY TOPICS:** Geometry, sorting

**SECONDARY TOPICS:** Events, active set simplified

**CORE TECHNIQUE:** Sweep reasoning

**PROBLEM STRUCTURE:** Count/detect intersections between axis-aligned horizontal and vertical segments via ordered events and a Fenwick/active set.

**REQUIRED INSIGHT:** Discover the reduction to sweep reasoning quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** A geometric crossing relation becomes ordered range counting, unlike simple interval overlap.

**ALLOWED VARIATIONS:** Road crossings, laser beams, timetable axes, or grid wires.

**FORBIDDEN VARIATIONS:** General line segments, overlapping collinear segments, floating point, or dynamic changes.

**RECOMMENDED CONSTRAINT RANGE:** segments up to 100,000; O(n log n).

**COMMON TRAPS:** Event tie order, inclusive endpoints, coordinate compression.

**GENERATION NOTES:** Use axis-aligned segments and specify collinear overlap treatment as excluded.

## D-013 — Monotone Deque Sliding Maximum

**RANK:** Diamond

**PRIMARY TOPICS:** Arrays, deques

**SECONDARY TOPICS:** Candidate dominance, fixed windows

**CORE TECHNIQUE:** Monotonic deque

**PROBLEM STRUCTURE:** Output an extremum for every fixed-length window while discarding dominated and expired candidates.

**REQUIRED INSIGHT:** Discover the reduction to monotonic deque quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** It maintains a moving candidate frontier, beyond one global monotonic-stack pass.

**ALLOWED VARIATIONS:** Window maxima/minima, alert peaks, rolling highest value, or local temperature max.

**FORBIDDEN VARIATIONS:** Variable windows, median/quantile, dynamic updates, or two-dimensional windows.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n).

**COMMON TRAPS:** Expire indices, deque order, k boundary.

**GENERATION NOTES:** Use one fixed window length and one extremum.

## D-014 — Shortest Subarray at Least Target with Negatives

**RANK:** Diamond

**PRIMARY TOPICS:** Arrays, deques

**SECONDARY TOPICS:** Prefix sums, monotone deque

**CORE TECHNIQUE:** Prefix deque

**PROBLEM STRUCTURE:** Find the shortest range reaching a target even when negative values defeat ordinary sliding windows.

**REQUIRED INSIGHT:** Discover the reduction to prefix deque quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** A monotone deque of prefix candidates restores efficient minimum-length search.

**ALLOWED VARIATIONS:** Shortest quota segment, minimum energy interval, or fastest signed gain.

**FORBIDDEN VARIATIONS:** Multiple constraints, circular arrays, online updates, or weighted length costs.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n).

**COMMON TRAPS:** Prefix indices, pop front while valid, pop back dominance.

**GENERATION NOTES:** Use one scalar threshold and signed integers.

## D-015 — Max Subarray with One Deletion

**RANK:** Diamond

**PRIMARY TOPICS:** Dynamic programming, arrays

**SECONDARY TOPICS:** Two-state recurrence, optimization

**CORE TECHNIQUE:** State DP

**PROBLEM STRUCTURE:** Maximize contiguous sum when at most one element may be removed.

**REQUIRED INSIGHT:** Discover the reduction to state dp quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** A second running state captures deletion permission without enumerating removed positions.

**ALLOWED VARIATIONS:** Repair one corrupted score, omit one loss, or best streak after one skip.

**FORBIDDEN VARIATIONS:** More deletions, circular subarrays, reconstruction, or length constraints.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n).

**COMMON TRAPS:** All negative values, delete versus keep, state update order.

**GENERATION NOTES:** Use at most one deletion and scalar values.

## D-016 — Palindromic Subsequence One-Dimensional DP

**RANK:** Diamond

**PRIMARY TOPICS:** Dynamic programming, strings

**SECONDARY TOPICS:** Interval recurrence, rolling state

**CORE TECHNIQUE:** Compressed interval DP

**PROBLEM STRUCTURE:** Compute a palindrome-related optimum using a recurrence compressed over one string dimension.

**REQUIRED INSIGHT:** Discover the reduction to compressed interval dp quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** It requires seeing that a two-dimensional interval relationship can be updated in place compactly.

**ALLOWED VARIATIONS:** Longest palindromic subsequence, minimum insertions, or symmetric retention score.

**FORBIDDEN VARIATIONS:** Large reconstruction, weighted edits, arbitrary substring queries, or advanced palindromic trees.

**RECOMMENDED CONSTRAINT RANGE:** length up to 2,000; O(n^2).

**COMMON TRAPS:** Traversal order, previous diagonal, character match.

**GENERATION NOTES:** Request value only and use modest length.

## D-017 — Weighted Interval Scheduling

**RANK:** Diamond

**PRIMARY TOPICS:** Dynamic programming, sorting

**SECONDARY TOPICS:** Predecessor binary search, recurrence

**CORE TECHNIQUE:** DP plus ordering

**PROBLEM STRUCTURE:** Choose nonoverlapping intervals of maximum total weight using sorted endpoints and predecessor lookup.

**REQUIRED INSIGHT:** Discover the reduction to dp plus ordering quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** It adds value trade-offs to interval selection, requiring DP rather than earliest-finish greedy.

**ALLOWED VARIATIONS:** Paid jobs, reward events, profitable broadcasts, or ad placement.

**FORBIDDEN VARIATIONS:** Multiple resources, arbitrary dependencies, online insertions, or reconstruction-heavy output.

**RECOMMENDED CONSTRAINT RANGE:** n up to 200,000; O(n log n).

**COMMON TRAPS:** Predecessor boundary, endpoint convention, 64-bit value.

**GENERATION NOTES:** Use one resource and static intervals with scalar weights.

## D-018 — Minimum Arrows for Interval Points

**RANK:** Diamond

**PRIMARY TOPICS:** Greedy, intervals

**SECONDARY TOPICS:** Common intersection, endpoint order

**CORE TECHNIQUE:** Greedy stabbing

**PROBLEM STRUCTURE:** Select the fewest points that intersect every interval by placing each point at the next uncovered earliest ending interval.

**REQUIRED INSIGHT:** Discover the reduction to greedy stabbing quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** The surprising invariant is that one endpoint can cover an entire compatible cluster.

**ALLOWED VARIATIONS:** Burst balloons, inspection times, checkpoints, or common appointment slots.

**FORBIDDEN VARIATIONS:** Weighted points, multiple point types, interval deletion, or 2D rectangles.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n log n).

**COMMON TRAPS:** Touching endpoints, sort by end, update coverage.

**GENERATION NOTES:** Use closed intervals and unit cost per point.

## D-019 — Gas Circuit Start Invariant

**RANK:** Diamond

**PRIMARY TOPICS:** Greedy, arrays

**SECONDARY TOPICS:** Prefix deficit, total feasibility

**CORE TECHNIQUE:** Greedy reset

**PROBLEM STRUCTURE:** Find a start position that completes a circular route by resetting after any negative running balance.

**REQUIRED INSIGHT:** Discover the reduction to greedy reset quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** The invariant proves failed prefixes cannot contain a valid start, eliminating all simulations.

**ALLOWED VARIATIONS:** Fuel circuit, circular energy tasks, rotating budget, or supply loop.

**FORBIDDEN VARIATIONS:** Multiple resource dimensions, optimize remaining fuel, variable route choice, or multiple laps.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n).

**COMMON TRAPS:** Total feasibility, reset index, circular final check.

**GENERATION NOTES:** Use one scalar gain/cost at each fixed circular step.

## D-020 — Minimum Initial Health via Reverse Greedy

**RANK:** Diamond

**PRIMARY TOPICS:** Greedy, arrays

**SECONDARY TOPICS:** Backward requirement, prefix

**CORE TECHNIQUE:** Reverse recurrence

**PROBLEM STRUCTURE:** Determine the smallest initial resource that survives a fixed sequence by scanning backward from required final state.

**REQUIRED INSIGHT:** Discover the reduction to reverse recurrence quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** Reversing time makes a forward survival optimization a one-pass recurrence.

**ALLOWED VARIATIONS:** Dungeon rooms with simple integer gains/losses, account buffer, or battery charge.

**FORBIDDEN VARIATIONS:** Branching routes, bounded caps, multiple resources, or arbitrary choices.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n).

**COMMON TRAPS:** Minimum one, order reversal, large negatives.

**GENERATION NOTES:** Use a fixed path and an always-positive survival bound.

## D-021 — Maximum Product Subarray Sign States

**RANK:** Diamond

**PRIMARY TOPICS:** Dynamic programming, arrays

**SECONDARY TOPICS:** Max/min tracking, signs

**CORE TECHNIQUE:** Two-state DP

**PROBLEM STRUCTURE:** Find maximum product contiguous range by retaining both largest and smallest products ending at each position.

**REQUIRED INSIGHT:** Discover the reduction to two-state dp quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** Negative values can swap the useful extreme, a non-obvious state necessity.

**ALLOWED VARIATIONS:** Best growth streak, multiplicative score, or signed reliability product.

**FORBIDDEN VARIATIONS:** Modulo arithmetic, fixed lengths, multiple deletions, or huge big-integer products.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; values bounded; O(n).

**COMMON TRAPS:** Swap on negative, zero reset, overflow.

**GENERATION NOTES:** Constrain products to supported integer range or state a modulus-free safe range.

## D-022 — Kth Smallest Pair Distance

**RANK:** Diamond

**PRIMARY TOPICS:** Binary search, sorting

**SECONDARY TOPICS:** Pair counting, two pointers

**CORE TECHNIQUE:** Answer search

**PROBLEM STRUCTURE:** Find the kth ordered pair-distance by binary searching a distance and counting pairs within it.

**REQUIRED INSIGHT:** Discover the reduction to answer search quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** It combines a monotone numeric answer with a linear two-pointer feasibility/counting predicate.

**ALLOWED VARIATIONS:** Kth closest pair gap, sensor distance rank, or timestamp separation rank.

**FORBIDDEN VARIATIONS:** Two dimensions, weighted pairs, dynamic points, or reporting all pairs.

**RECOMMENDED CONSTRAINT RANGE:** n up to 100,000; O(n log range).

**COMMON TRAPS:** Count width, pointer monotonicity, duplicate values.

**GENERATION NOTES:** Use one-dimensional values and unordered pairs.

## D-023 — Modular Prefix Remainder Pair Count

**RANK:** Diamond

**PRIMARY TOPICS:** Number theory, hash maps

**SECONDARY TOPICS:** Prefix residues, combinatorics

**CORE TECHNIQUE:** Residue frequency

**PROBLEM STRUCTURE:** Count ranges whose sum is divisible by k by pairing equal prefix remainders.

**REQUIRED INSIGHT:** Discover the reduction to residue frequency quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** Divisibility is reduced to residue equality, not direct subarray sum checking.

**ALLOWED VARIATIONS:** Divisible sum ranges, balanced periodic events, or modular transaction batches.

**FORBIDDEN VARIATIONS:** Variable modulus per query, negative modulus ambiguity, 2D grids, or non-additive operation.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n+k) or O(n).

**COMMON TRAPS:** Normalize negative remainders, seed zero, count combinations.

**GENERATION NOTES:** Use one positive modulus and static sequence.

## D-024 — Prime-Factor Mask Compatibility

**RANK:** Diamond

**PRIMARY TOPICS:** Number theory, bitmasks

**SECONDARY TOPICS:** Factorization, disjoint masks

**CORE TECHNIQUE:** Factor mask reduction

**PROBLEM STRUCTURE:** Represent each modest integer by its prime-factor bitmask and select/test pairwise coprime combinations.

**REQUIRED INSIGHT:** Discover the reduction to factor mask reduction quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** It converts shared-factor structure into fast mask intersection after factor extraction.

**ALLOWED VARIATIONS:** Coprime subset of small prime universe, compatible recipes, or disjoint resource factors.

**FORBIDDEN VARIATIONS:** Large factorization, unrestricted primes, subset DP beyond small masks, or multiplicities that matter.

**RECOMMENDED CONSTRAINT RANGE:** values up to 10^6; distinct relevant primes at most 20.

**COMMON TRAPS:** Repeated factors, mask mapping, factor one.

**GENERATION NOTES:** Keep the prime universe small and the required mask relation simple.

## D-025 — Binomial Path Count with Obstacles

**RANK:** Diamond

**PRIMARY TOPICS:** Combinatorics, grids

**SECONDARY TOPICS:** Combinations, inclusion exclusion limited

**CORE TECHNIQUE:** Combinatorial reduction

**PROBLEM STRUCTURE:** Count monotone paths through a grid with one/small number of forbidden points via total paths and a compact subtraction.

**REQUIRED INSIGHT:** Discover the reduction to combinatorial reduction quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** It replaces full-grid DP with binomial structure when obstacle count is tiny.

**ALLOWED VARIATIONS:** One blocked checkpoint, few forbidden cells, or route avoidance.

**FORBIDDEN VARIATIONS:** Many obstacles, modulo with huge precomputation without guidance, arbitrary moves, or dynamic queries.

**RECOMMENDED CONSTRAINT RANGE:** grid dimensions up to 10^6; obstacles at most 8; modulo prime stated.

**COMMON TRAPS:** Order obstacles, factorial bounds, subtract paths through prior blocks.

**GENERATION NOTES:** Use only right/down movement and a very small obstacle set.

## D-026 — Bitwise OR Distinct Subarrays

**RANK:** Diamond

**PRIMARY TOPICS:** Bit manipulation, sets

**SECONDARY TOPICS:** Rolling result set, idempotence

**CORE TECHNIQUE:** Compressed state set

**PROBLEM STRUCTURE:** Count distinct bitwise OR values across all subarrays by keeping only distinct ORs ending at the current position.

**REQUIRED INSIGHT:** Discover the reduction to compressed state set quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** Idempotence bounds the number of evolving states despite quadratically many subarrays.

**ALLOWED VARIATIONS:** Distinct ORs, AND variants with stated nonnegative values, or feature accumulation segments.

**FORBIDDEN VARIATIONS:** Exact arbitrary functions, XOR distinct subarrays, dynamic updates, or large per-endpoint sets without bound.

**RECOMMENDED CONSTRAINT RANGE:** n up to 100,000; 32-bit nonnegative values.

**COMMON TRAPS:** Deduplicate current states, include singleton, set growth.

**GENERATION NOTES:** Use bitwise OR on fixed-width nonnegative integers.

## D-027 — Nim XOR Winner

**RANK:** Diamond

**PRIMARY TOPICS:** Games, bitwise

**SECONDARY TOPICS:** Sprague-Grundy basic, XOR invariant

**CORE TECHNIQUE:** XOR game reduction

**PROBLEM STRUCTURE:** Decide the winner of normal-play heaps where each move reduces one heap.

**REQUIRED INSIGHT:** Discover the reduction to xor game reduction quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** The full game tree collapses to XOR of heap sizes, a canonical impartial-game invariant.

**ALLOWED VARIATIONS:** Stone heaps, token piles, resources removed from one pile.

**FORBIDDEN VARIATIONS:** Misère variant, restricted moves, composite games, or move construction beyond simple witness.

**RECOMMENDED CONSTRAINT RANGE:** heaps up to 200,000; O(n).

**COMMON TRAPS:** Zero heaps, normal-play condition, XOR type.

**GENERATION NOTES:** State normal play and unrestricted positive removal from one heap.

## D-028 — Bitmask Traveling Path with Tiny Nodes

**RANK:** Diamond

**PRIMARY TOPICS:** Dynamic programming, bitmasks

**SECONDARY TOPICS:** Subset state, endpoint

**CORE TECHNIQUE:** Held-Karp DP

**PROBLEM STRUCTURE:** Find a shortest path/tour across a tiny set of nodes by recording visited-set and last-node state.

**REQUIRED INSIGHT:** Discover the reduction to held-karp dp quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** It is deliberately tiny-state DP where exponential structure is controlled by bitmasks.

**ALLOWED VARIATIONS:** Visit all checkpoints, shortest delivery tour, or small route planner.

**FORBIDDEN VARIATIONS:** More than 18 nodes, general graph large constraints, path reconstruction requirement, or time windows.

**RECOMMENDED CONSTRAINT RANGE:** nodes at most 16; O(n^2 2^n).

**COMMON TRAPS:** Start convention, initialize masks, infinity values.

**GENERATION NOTES:** Use a complete/supplied small weighted graph and ask cost only.

## D-029 — Network Broadcast Delay Dijkstra

**RANK:** Diamond

**PRIMARY TOPICS:** Graphs, Dijkstra

**SECONDARY TOPICS:** Distance relaxation, farthest distance

**CORE TECHNIQUE:** Single-source shortest path

**PROBLEM STRUCTURE:** Compute the time until all nodes receive a signal through nonnegative weighted directed edges.

**REQUIRED INSIGHT:** Discover the reduction to single-source shortest path quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** It requires recognizing that completion time is the maximum shortest-path distance from one source.

**ALLOWED VARIATIONS:** Signal delay, network propagation, fastest alerts, or directed travel time.

**FORBIDDEN VARIATIONS:** Negative weights, multiple sources with interactions, path counting, dynamic edges, or coupon states.

**RECOMMENDED CONSTRAINT RANGE:** V+E up to 200,000; O(E log V).

**COMMON TRAPS:** Unreachable nodes, stale heap entries, 64-bit distances.

**GENERATION NOTES:** Use a static directed graph, one source, and nonnegative integer weights.

## D-030 — Tree Maximum Independent Set

**RANK:** Diamond

**PRIMARY TOPICS:** Trees, dynamic programming

**SECONDARY TOPICS:** Take/skip states, postorder

**CORE TECHNIQUE:** Tree DP

**PROBLEM STRUCTURE:** Maximize total selected node weight when no chosen nodes are adjacent in a tree.

**REQUIRED INSIGHT:** Discover the reduction to tree dp quickly enough that the compact implementation remains viable.

**UNIQUE DIFFERENTIATOR:** Each node needs only take/skip states, turning a global adjacency constraint into local recurrences.

**ALLOWED VARIATIONS:** Choose nonadjacent houses on tree, independent committee, or spaced sensors.

**FORBIDDEN VARIATIONS:** General graphs, reconstruction with complex ties, multiple distance constraints, or dynamic tree updates.

**RECOMMENDED CONSTRAINT RANGE:** n up to 200,000; O(n).

**COMMON TRAPS:** Parent exclusion, iterative postorder, negative weights policy.

**GENERATION NOTES:** Use a static tree, one no-adjacent constraint, and scalar weights.

## M-001 — XOR Missing-and-Duplicate Separation

**RANK:** Master

**PRIMARY TOPICS:** Bit manipulation, arrays

**SECONDARY TOPICS:** XOR partition, distinguishing bit

**CORE TECHNIQUE:** Algebraic partition

**PROBLEM STRUCTURE:** Recover one missing and one duplicated value from a known range by XORing values and splitting on a set bit.

**REQUIRED INSIGHT:** Discover the structural or mathematical collapse embodied by algebraic partition, then implement the resulting short method.

**UNIQUE DIFFERENTIATOR:** One XOR reveals the pair's difference; a second partition disentangles them without counting storage.

**ALLOWED VARIATIONS:** Corrupted permutation, missing ticket and repeated ticket, or swapped ID pair.

**FORBIDDEN VARIATIONS:** Multiple errors, arbitrary value universe, range updates, or map/sort solutions as intended.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n), O(1) extra.

**COMMON TRAPS:** Choose lowbit, classify range values, determine which candidate is duplicate.

**GENERATION NOTES:** Promise exactly one missing and one duplicate in a consecutive range.

## M-002 — Prefix-XOR Maximum Pair via Trie

**RANK:** Master

**PRIMARY TOPICS:** Bitwise, tries

**SECONDARY TOPICS:** Prefix XOR, greedy bits

**CORE TECHNIQUE:** Binary trie

**PROBLEM STRUCTURE:** Find the maximum XOR of a subarray by inserting prefix XORs into a binary trie and greedily maximizing each bit.

**REQUIRED INSIGHT:** Discover the structural or mathematical collapse embodied by binary trie, then implement the resulting short method.

**UNIQUE DIFFERENTIATOR:** It reframes a range optimization as an online maximum pair-XOR problem.

**ALLOWED VARIATIONS:** Max XOR subarray, strongest toggle segment, or mask-difference interval.

**FORBIDDEN VARIATIONS:** Signed ambiguous ordering, dynamic deletions, multiple query ranges, or nonbinary bases.

**RECOMMENDED CONSTRAINT RANGE:** n up to 200,000; values 30-bit nonnegative; O(nB).

**COMMON TRAPS:** Insert prefix zero, trie direction, bit width.

**GENERATION NOTES:** Use static nonnegative integers and fixed bit width.

## M-003 — Parity Mask Even-Count Substrings

**RANK:** Master

**PRIMARY TOPICS:** Strings, bitmasks

**SECONDARY TOPICS:** Prefix parity states, combinatorics

**CORE TECHNIQUE:** Parity state matching

**PROBLEM STRUCTURE:** Count substrings in which every chosen character category occurs an even number of times by matching equal parity masks.

**REQUIRED INSIGHT:** Discover the structural or mathematical collapse embodied by parity state matching, then implement the resulting short method.

**UNIQUE DIFFERENTIATOR:** A potentially many-counter condition collapses to equality of one bitmask state.

**ALLOWED VARIATIONS:** Even vowels, all letters from a small alphabet even, toggled switch segments.

**FORBIDDEN VARIATIONS:** Large alphabets, arbitrary exact counts, multiple condition families, or dynamic changes.

**RECOMMENDED CONSTRAINT RANGE:** length up to 300,000; alphabet at most 20; O(n).

**COMMON TRAPS:** Seed zero mask, toggle mapping, count width.

**GENERATION NOTES:** Use a small fixed character set and parity-only conditions.

## M-004 — Subarray Bitwise AND Closest Target

**RANK:** Master

**PRIMARY TOPICS:** Bit manipulation, sets

**SECONDARY TOPICS:** Idempotent rolling states, optimization

**CORE TECHNIQUE:** Compressed state set

**PROBLEM STRUCTURE:** Find a subarray AND value closest to a target by retaining distinct ANDs ending at each position.

**REQUIRED INSIGHT:** Discover the structural or mathematical collapse embodied by compressed state set, then implement the resulting short method.

**UNIQUE DIFFERENTIATOR:** Repeated AND quickly stabilizes, so all relevant suffix values stay compact despite many ranges.

**ALLOWED VARIATIONS:** Closest risk mask, target permission intersection, or nearest feature overlap.

**FORBIDDEN VARIATIONS:** XOR/product versions, dynamic updates, large arbitrary operation state, or tie rules beyond simple.

**RECOMMENDED CONSTRAINT RANGE:** n up to 100,000; 32-bit nonnegative values.

**COMMON TRAPS:** Include current value, deduplicate, absolute-difference width.

**GENERATION NOTES:** Use static bitwise AND and one numeric target.

## M-005 — Minimal Operations via Power-of-Two Popcount

**RANK:** Master

**PRIMARY TOPICS:** Bit manipulation, arithmetic

**SECONDARY TOPICS:** Binary representation, invariant

**CORE TECHNIQUE:** Popcount reduction

**PROBLEM STRUCTURE:** Determine a minimum operation count when each allowed operation removes/adds a power-of-two contribution and carries make binary digits independent.

**REQUIRED INSIGHT:** Discover the structural or mathematical collapse embodied by popcount reduction, then implement the resulting short method.

**UNIQUE DIFFERENTIATOR:** The apparent sequence of operations reduces to a count/structure of set bits.

**ALLOWED VARIATIONS:** Split weights, remove powers, combine chips, or binary token operations.

**FORBIDDEN VARIATIONS:** Operations that mix bits nonlocally, signed unrestricted moves, or arbitrary costs.

**RECOMMENDED CONSTRAINT RANGE:** values up to 10^18; O(log V).

**COMMON TRAPS:** Zero, carry interpretation, operation direction.

**GENERATION NOTES:** Specify operations precisely so binary carries are the only interaction.

## M-006 — GCD Reachability by Global Invariant

**RANK:** Master

**PRIMARY TOPICS:** Number theory, arrays

**SECONDARY TOPICS:** GCD, additive closure

**CORE TECHNIQUE:** Invariant reduction

**PROBLEM STRUCTURE:** Decide whether a target state is reachable through operations that preserve the gcd of a collection/differences.

**REQUIRED INSIGHT:** Discover the structural or mathematical collapse embodied by invariant reduction, then implement the resulting short method.

**UNIQUE DIFFERENTIATOR:** Rather than simulate moves, derive the necessary and sufficient gcd divisibility condition.

**ALLOWED VARIATIONS:** Equalize values by differences, reach target score, or move tokens by fixed differences.

**FORBIDDEN VARIATIONS:** Operations not closed under addition/subtraction, multiple target objectives, or constructive minimum move counts.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; values up to 10^18; O(n log V).

**COMMON TRAPS:** Use absolute differences, base choice, target inclusion.

**GENERATION NOTES:** Provide a clearly gcd-preserving operation family and ask a decision.

## M-007 — Smallest Period by GCD Structure

**RANK:** Master

**PRIMARY TOPICS:** Strings, number theory

**SECONDARY TOPICS:** GCD lengths, repetition

**CORE TECHNIQUE:** String divisor reduction

**PROBLEM STRUCTURE:** Determine the smallest/common repeating unit of strings using divisibility of lengths plus concatenation compatibility.

**REQUIRED INSIGHT:** Discover the structural or mathematical collapse embodied by string divisor reduction, then implement the resulting short method.

**UNIQUE DIFFERENTIATOR:** A structural equality test and gcd of lengths replace candidate-period enumeration.

**ALLOWED VARIATIONS:** Common rhythm, repeating signal block, shared pattern unit, or string gcd.

**FORBIDDEN VARIATIONS:** Approximate periods, rotations, wildcards, many-string heavy parsing, or compression ratios.

**RECOMMENDED CONSTRAINT RANGE:** total length up to 300,000; O(total length).

**COMMON TRAPS:** Concatenation comparison, empty string policy, gcd length.

**GENERATION NOTES:** Use exact repetition and one/two input strings.

## M-008 — Digit-DP-Free Digit Count Formula

**RANK:** Master

**PRIMARY TOPICS:** Arithmetic, number theory

**SECONDARY TOPICS:** Positional cycles, counting

**CORE TECHNIQUE:** Place-value counting

**PROBLEM STRUCTURE:** Count appearances of a digit across a huge numeric interval by summing each decimal position's complete and partial cycles.

**REQUIRED INSIGHT:** Discover the structural or mathematical collapse embodied by place-value counting, then implement the resulting short method.

**UNIQUE DIFFERENTIATOR:** It converts an impossible enumeration into independent place-value contributions.

**ALLOWED VARIATIONS:** Count digit one, count zero with special rule, or count a fixed digit 1–9.

**FORBIDDEN VARIATIONS:** Arbitrary digit predicates, many online queries, base changes without clear formula, or digit DP.

**RECOMMENDED CONSTRAINT RANGE:** N up to 10^18; O(log N).

**COMMON TRAPS:** Leading zeros, zero digit adjustment, high/current/low decomposition.

**GENERATION NOTES:** Use a single digit and interval from 1 to N unless zero is carefully specified.

## M-009 — Chinese Remainder Construction for Coprime Moduli

**RANK:** Master

**PRIMARY TOPICS:** Number theory, modular arithmetic

**SECONDARY TOPICS:** Modular inverse, congruences

**CORE TECHNIQUE:** CRT composition

**PROBLEM STRUCTURE:** Construct the unique residue modulo product satisfying a tiny set of pairwise-coprime congruences.

**REQUIRED INSIGHT:** Discover the structural or mathematical collapse embodied by crt composition, then implement the resulting short method.

**UNIQUE DIFFERENTIATOR:** Independent modular constraints are combined algebraically instead of searched.

**ALLOWED VARIATIONS:** Clock synchronization, periodic schedules, remainder puzzle, or synchronized cycles.

**FORBIDDEN VARIATIONS:** Noncoprime moduli, many huge moduli, bigint overflow beyond defined range, or finding all solutions.

**RECOMMENDED CONSTRAINT RANGE:** at most 5 moduli; product fits 64-bit; O(k log M).

**COMMON TRAPS:** Inverse existence, normalization, multiplication overflow.

**GENERATION NOTES:** Promise pairwise coprime positive moduli and a bounded product.

## M-010 — Mobius-Free Coprime Pair Count by Divisor Sieve

**RANK:** Master

**PRIMARY TOPICS:** Number theory, arrays

**SECONDARY TOPICS:** Frequency multiples, inclusion concept

**CORE TECHNIQUE:** Divisor aggregation

**PROBLEM STRUCTURE:** Count a restricted coprime-related property using a small bounded value universe and divisor-frequency reasoning.

**REQUIRED INSIGHT:** Discover the structural or mathematical collapse embodied by divisor aggregation, then implement the resulting short method.

**UNIQUE DIFFERENTIATOR:** It reorganizes pair relations by shared divisors rather than checking pairs; its exact formula is supplied by the generator curriculum.

**ALLOWED VARIATIONS:** Count pairs with gcd one in tiny value range, identify values sharing a divisor, or coprime decision summary.

**FORBIDDEN VARIATIONS:** Large value domains, unrestricted full Möbius derivation, dynamic updates, or weighted tuples.

**RECOMMENDED CONSTRAINT RANGE:** n 100,000; values at most 100,000; precomputation O(V log V).

**COMMON TRAPS:** Frequency over multiples, inclusion sign, value one.

**GENERATION NOTES:** Use only if the curriculum provides the required divisor-inclusion identity in the statement or expected knowledge set.

## M-011 — Circular Prefix Minimum Rotation

**RANK:** Master

**PRIMARY TOPICS:** Greedy, arrays

**SECONDARY TOPICS:** Prefix sums, minimum prefix

**CORE TECHNIQUE:** Rotation invariant

**PROBLEM STRUCTURE:** Find a cyclic start that keeps every cumulative balance nonnegative by choosing after the minimum prefix.

**REQUIRED INSIGHT:** Discover the structural or mathematical collapse embodied by rotation invariant, then implement the resulting short method.

**UNIQUE DIFFERENTIATOR:** A global prefix minimum characterizes the valid rotation, replacing trial simulation.

**ALLOWED VARIATIONS:** Balanced parentheses rotation, feasible fuel start, circular budget, or production schedule.

**FORBIDDEN VARIATIONS:** Multiple resources, maximize slack, arbitrary rerouting, or many updates.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n).

**COMMON TRAPS:** Choose position after minimum, total sum feasibility, ties.

**GENERATION NOTES:** Use one additive circular sequence with total nonnegative.

## M-012 — Lexicographically Smallest Adjacent-Swap Transform

**RANK:** Master

**PRIMARY TOPICS:** Greedy, strings

**SECONDARY TOPICS:** Inversion budget, data structure simplified

**CORE TECHNIQUE:** Greedy selection

**PROBLEM STRUCTURE:** Construct the lexicographically smallest result obtainable with a limited number of adjacent swaps by greedily selecting the earliest affordable minimal symbol.

**REQUIRED INSIGHT:** Discover the structural or mathematical collapse embodied by greedy selection, then implement the resulting short method.

**UNIQUE DIFFERENTIATOR:** The key is an exchange argument about earliest positions, not brute-force swapping.

**ALLOWED VARIATIONS:** Small alphabet string, smallest queue, or digit rearrangement.

**FORBIDDEN VARIATIONS:** Large alphabet requiring heavy Fenwick machinery, arbitrary swap costs, repeated queries, or full permutation search.

**RECOMMENDED CONSTRAINT RANGE:** length up to 2,000; swap budget modest; O(n^2) acceptable.

**COMMON TRAPS:** Budget decrement by distance, stable removal, equal symbols.

**GENERATION NOTES:** Constrain n so direct list removal is fast and the greedy insight remains central.

## M-013 — Maximum Subsequence Score by Sort-and-Heap

**RANK:** Master

**PRIMARY TOPICS:** Greedy, heaps

**SECONDARY TOPICS:** Sort by bottleneck, maintain sum

**CORE TECHNIQUE:** Greedy heap

**PROBLEM STRUCTURE:** Maximize a score defined by selected-sum times selected-minimum by sorting candidates by potential bottleneck and retaining the best compatible sum.

**REQUIRED INSIGHT:** Discover the structural or mathematical collapse embodied by greedy heap, then implement the resulting short method.

**UNIQUE DIFFERENTIATOR:** The optimum is exposed by treating each item's value as the candidate minimum, a non-obvious transformation.

**ALLOWED VARIATIONS:** Team score, batch quality times output, or selected capacity times rating.

**FORBIDDEN VARIATIONS:** Multiple bottleneck dimensions, negative weights, arbitrary nonlinear score, or reconstruction.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; fixed k; O(n log k).

**COMMON TRAPS:** Sort direction, maintain exactly k, 64-bit product.

**GENERATION NOTES:** Use positive values and score sum(selected)*min(selected second attribute).

## M-014 — Minimum Adjacent Merge Palindrome Greedy

**RANK:** Master

**PRIMARY TOPICS:** Greedy, arrays

**SECONDARY TOPICS:** Two pointers, merge operation

**CORE TECHNIQUE:** Two-ended greedy

**PROBLEM STRUCTURE:** Find the minimum number of adjacent merges needed to make positive-number sequence palindromic by merging the smaller-side accumulation.

**REQUIRED INSIGHT:** Discover the structural or mathematical collapse embodied by two-ended greedy, then implement the resulting short method.

**UNIQUE DIFFERENTIATOR:** A local imbalance determines which side must merge, avoiding search over merge orders.

**ALLOWED VARIATIONS:** Combine weights into symmetric packages, merge beads, or balance mirrored loads.

**FORBIDDEN VARIATIONS:** Negative values, arbitrary nonadjacent merges, weighted merge costs, or output all operations.

**RECOMMENDED CONSTRAINT RANGE:** n up to 100,000; O(n).

**COMMON TRAPS:** Update accumulating side, equality, 64-bit sums.

**GENERATION NOTES:** Use positive values and merge cost counted per operation only.

## M-015 — Median Equals Minimizer Invariant

**RANK:** Master

**PRIMARY TOPICS:** Statistics, arrays

**SECONDARY TOPICS:** Absolute deviation, selection

**CORE TECHNIQUE:** Median reduction

**PROBLEM STRUCTURE:** Find a value minimizing total absolute deviation by recognizing any median as an optimizer.

**REQUIRED INSIGHT:** Discover the structural or mathematical collapse embodied by median reduction, then implement the resulting short method.

**UNIQUE DIFFERENTIATOR:** An apparent global optimization collapses to order statistic selection.

**ALLOWED VARIATIONS:** Meeting point on a line, minimize travel distance, target temperature, or central storage coordinate.

**FORBIDDEN VARIATIONS:** Squared distances, 2D geometry, weighted medians, or constraints on target set beyond simple.

**RECOMMENDED CONSTRAINT RANGE:** n 1–200,000; O(n log n) sort or O(n) select.

**COMMON TRAPS:** Even-n median choice, 64-bit sum, location must be allowed.

**GENERATION NOTES:** Use one-dimensional unweighted absolute distance and ask minimum value/cost.

## M-016 — Permutation Cycle Minimum Swaps

**RANK:** Master

**PRIMARY TOPICS:** Arrays, graphs

**SECONDARY TOPICS:** Cycle decomposition, invariant

**CORE TECHNIQUE:** Cycle decomposition

**PROBLEM STRUCTURE:** Compute minimum swaps to transform a permutation into target order from the fact that each cycle of length L needs L-1 swaps.

**REQUIRED INSIGHT:** Discover the structural or mathematical collapse embodied by cycle decomposition, then implement the resulting short method.

**UNIQUE DIFFERENTIATOR:** It replaces operation simulation with structural cycle accounting.

**ALLOWED VARIATIONS:** Sort permutation, fix seating, restore labels, or reorder unique values.

**FORBIDDEN VARIATIONS:** Duplicate values, restricted swap positions, weighted swaps, or arbitrary target matching.

**RECOMMENDED CONSTRAINT RANGE:** n 1–300,000; O(n).

**COMMON TRAPS:** Visited marking, target mapping, one-cycles.

**GENERATION NOTES:** Use a true permutation or unique values with deterministic target order.

## M-017 — Functional Graph Cycle Entry

**RANK:** Master

**PRIMARY TOPICS:** Graphs, pointers

**SECONDARY TOPICS:** Floyd detection, phases

**CORE TECHNIQUE:** Tortoise-hare

**PROBLEM STRUCTURE:** Find whether a next-pointer structure contains a cycle and identify its entry using two-speed pointers.

**REQUIRED INSIGHT:** Discover the structural or mathematical collapse embodied by tortoise-hare, then implement the resulting short method.

**UNIQUE DIFFERENTIATOR:** Cycle discovery and entry localization require a compact invariant rather than visited storage.

**ALLOWED VARIATIONS:** Linked successor map, repeated state transition, game loop, or teleport chain.

**FORBIDDEN VARIATIONS:** General directed graph cycles, multiple outgoing edges, cycle length plus many queries, or mutable mapping.

**RECOMMENDED CONSTRAINT RANGE:** nodes up to 1,000,000; O(n), O(1) extra.

**COMMON TRAPS:** Meeting phase, reset one pointer, no-cycle handling.

**GENERATION NOTES:** Use exactly one outgoing edge per state and a known start.

## M-018 — Tree XOR Path Pairing Reduction

**RANK:** Master

**PRIMARY TOPICS:** Trees, bitwise

**SECONDARY TOPICS:** Root XOR labels, frequency pairing

**CORE TECHNIQUE:** XOR reduction

**PROBLEM STRUCTURE:** Count/check tree paths satisfying a target XOR by converting every node to root-XOR label and matching label pairs.

**REQUIRED INSIGHT:** Discover the structural or mathematical collapse embodied by xor reduction, then implement the resulting short method.

**UNIQUE DIFFERENTIATOR:** A path property becomes a two-label relation through the root, avoiding path enumeration.

**ALLOWED VARIATIONS:** Target-XOR node pairs, toggled-edge paths, or matching signal routes.

**FORBIDDEN VARIATIONS:** Dynamic edges, arbitrary path queries, weighted non-XOR aggregation, or path reconstruction.

**RECOMMENDED CONSTRAINT RANGE:** n up to 200,000; O(n) expected with map.

**COMMON TRAPS:** Root label zero, avoid double count, target zero pairs.

**GENERATION NOTES:** Use a static tree with XOR edge weights and one target.

## M-019 — Topo Order Uniqueness via Forced Frontier

**RANK:** Master

**PRIMARY TOPICS:** Graphs, topological sort

**SECONDARY TOPICS:** Indegrees, queue size invariant

**CORE TECHNIQUE:** Kahn uniqueness test

**PROBLEM STRUCTURE:** Decide whether a DAG has exactly one topological order by checking that every Kahn step has one available node.

**REQUIRED INSIGHT:** Discover the structural or mathematical collapse embodied by kahn uniqueness test, then implement the resulting short method.

**UNIQUE DIFFERENTIATOR:** Order uniqueness is characterized by a forced frontier, not by enumerating permutations.

**ALLOWED VARIATIONS:** Unique build order, forced course plan, deterministic recipe sequence, or ranking constraints.

**FORBIDDEN VARIATIONS:** Count all orders, handle cycles beyond invalid return, dynamic prerequisites, or lexicographically smallest order objectives.

**RECOMMENDED CONSTRAINT RANGE:** V+E up to 300,000; O(V+E).

**COMMON TRAPS:** Queue size, cycle case, duplicate edges.

**GENERATION NOTES:** Use a directed graph and ask unique versus ambiguous/invalid.

## M-020 — Bitset LCS for Small Alphabet

**RANK:** Master

**PRIMARY TOPICS:** Strings, bitsets

**SECONDARY TOPICS:** Bit-parallel DP, masks

**CORE TECHNIQUE:** Bitset dynamic programming

**PROBLEM STRUCTURE:** Compute a longest-common-subsequence-related value using bit-parallel updates when alphabet and one length make bitsets compact.

**REQUIRED INSIGHT:** Discover the structural or mathematical collapse embodied by bitset dynamic programming, then implement the resulting short method.

**UNIQUE DIFFERENTIATOR:** It compresses an apparent quadratic DP into word-level operations via character masks.

**ALLOWED VARIATIONS:** LCS length, similarity score, or matching command sequences.

**FORBIDDEN VARIATIONS:** Unicode alphabet, reconstruction, huge arbitrary strings, custom weights, or edit script.

**RECOMMENDED CONSTRAINT RANGE:** lengths up to 50,000; alphabet at most 26; O(n*m/word).

**COMMON TRAPS:** Bitset complement masking, character masks, language bit width.

**GENERATION NOTES:** Use only where runtime supports native big-integer/bitset operations and ask length.

## M-021 — Subset Sum Meet-in-the-Middle

**RANK:** Master

**PRIMARY TOPICS:** Algorithms, arrays

**SECONDARY TOPICS:** Half enumeration, sorted lookup

**CORE TECHNIQUE:** Meet-in-the-middle

**PROBLEM STRUCTURE:** Decide/find a target subset sum by enumerating two halves and matching complementary totals.

**REQUIRED INSIGHT:** Discover the structural or mathematical collapse embodied by meet-in-the-middle, then implement the resulting short method.

**UNIQUE DIFFERENTIATOR:** Splitting the exponential space makes a 40-item task feasible without DP over large target values.

**ALLOWED VARIATIONS:** Exact target, closest not exceeding target, or equal partition with large values.

**FORBIDDEN VARIATIONS:** More than 44 items, negative/duplicate complexity beyond simple, count all subsets, or multi-dimensional targets.

**RECOMMENDED CONSTRAINT RANGE:** n at most 40; O(2^(n/2) log 2^(n/2)).

**COMMON TRAPS:** Include empty subset, duplicate sums, 64-bit totals.

**GENERATION NOTES:** Use one scalar target and modest n with potentially huge values.

## M-022 — Kth Element of Two Sorted Arrays Partition

**RANK:** Master

**PRIMARY TOPICS:** Arrays, binary search

**SECONDARY TOPICS:** Partition balance, order statistics

**CORE TECHNIQUE:** Partition binary search

**PROBLEM STRUCTURE:** Find a specified median/kth element across two sorted arrays by binary searching a valid partition in the shorter array.

**REQUIRED INSIGHT:** Discover the structural or mathematical collapse embodied by partition binary search, then implement the resulting short method.

**UNIQUE DIFFERENTIATOR:** The answer follows from neighboring partition values, avoiding full merge.

**ALLOWED VARIATIONS:** Median of two feeds, kth merged timestamp, or balanced sensor reading.

**FORBIDDEN VARIATIONS:** Unsorted inputs, many updates, weighted order statistics, or more than two arrays.

**RECOMMENDED CONSTRAINT RANGE:** n+m up to 300,000; O(log min(n,m)).

**COMMON TRAPS:** Partition bounds, sentinels, even median, shorter-array choice.

**GENERATION NOTES:** Use two sorted arrays and request kth/median only.

## M-023 — Binary Search on Answer via Threshold Transformation

**RANK:** Master

**PRIMARY TOPICS:** Binary search, greedy

**SECONDARY TOPICS:** Transformation, monotone predicate

**CORE TECHNIQUE:** Hidden monotonicity

**PROBLEM STRUCTURE:** Identify an optimization that becomes monotone only after subtracting a candidate threshold from each contribution, then test with a compact prefix/greedy condition.

**REQUIRED INSIGHT:** Discover the structural or mathematical collapse embodied by hidden monotonicity, then implement the resulting short method.

**UNIQUE DIFFERENTIATOR:** The difficult step is inventing the transformed feasibility predicate, not coding the binary search.

**ALLOWED VARIATIONS:** Maximum average subarray with minimum length, best ratio segment, or thresholded performance.

**FORBIDDEN VARIATIONS:** Multiple coupled constraints, exact rational arithmetic, dynamic arrays, or long numerical precision requirements.

**RECOMMENDED CONSTRAINT RANGE:** n up to 50,000; iterations 40–60; O(n log precision).

**COMMON TRAPS:** Floating precision, prefix minima, length constraint.

**GENERATION NOTES:** Use a single scalar ratio/average objective and state accepted tolerance.

## M-024 — Minimum Reversals via Permutation Graph Structure

**RANK:** Master

**PRIMARY TOPICS:** Arrays, graphs

**SECONDARY TOPICS:** Cycles, reversal invariant

**CORE TECHNIQUE:** Structural reduction

**PROBLEM STRUCTURE:** Derive a minimum operation count from permutation structure when one reversal operation has a stated cycle/symmetry effect.

**REQUIRED INSIGHT:** Discover the structural or mathematical collapse embodied by structural reduction, then implement the resulting short method.

**UNIQUE DIFFERENTIATOR:** The operation is not simulated; the solution depends on its algebraic structural invariant.

**ALLOWED VARIATIONS:** Sort a constrained permutation by allowed symmetric swaps/reversals, repair mirrored mapping, or transform paired positions.

**FORBIDDEN VARIATIONS:** Arbitrary reversal sorting, duplicate values, variable costs, or large constructive sequences.

**RECOMMENDED CONSTRAINT RANGE:** n up to 200,000; O(n).

**COMMON TRAPS:** Define operation effect, parity/cycle invariant, fixed points.

**GENERATION NOTES:** Use only a precisely characterized restricted reversal operation whose invariant is taught in curriculum.
