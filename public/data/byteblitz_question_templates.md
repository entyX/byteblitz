## B-001 — Elementwise Normalization

### 1

Given an array of n integers and two integers L and R with L ≤ R, produce a new array where each element is clamped into the inclusive range [L, R] (replace values below L with L and above R with R). Output the resulting n integers in order.

### 2

Given an array of n integers and a positive modulus M, replace each element by its nonnegative remainder in 0..M−1 (the standard residue of division by M). Print the resulting sequence of n integers.

### 3

Given an array of n integers and a positive integer k, replace each element by the integer quotient of dividing by k with truncation toward zero (e.g., -3 divided by 2 becomes -1). Return the new array of n integers.

### 4

Given an array of n integers, map each element to its sign: -1 for negative values, 0 for zero, and 1 for positive values. Output the n resulting sign values in order.

### 5

Given an array of n integers and a nonnegative cap C, produce a new array where each element is replaced by the absolute value capped at C (i.e., min(|x|, C)). Print the resulting n nonnegative integers.

## B-002 — Fixed Positional Reordering

### 1

You are given an integer n and a sequence of n integers a1..an; produce a fresh output sequence that is the reverse of the input (the element originally at position i should appear at position n+1-i). Output the rearranged list.

### 2

You are given an integer n, a sequence a1..an, and an integer k (0 ≤ k < n). Produce a fresh output sequence obtained by rotating the input to the right by k positions (element at position i moves to position ((i-1+k) mod n)+1). Output the rotated list.

### 3

Given an even n and a sequence of n values, split it into the first half a1..a_{n/2} and second half a_{n/2+1}..an, then produce a fresh output sequence by interleaving them as a1, a_{n/2+1}, a2, a_{n/2+2}, … preserving relative order within each half. Output the interleaved list.

### 4

Given n and a sequence a1..an (1-indexed), produce a fresh output sequence that places all elements from even indices in increasing index order first, then all elements from odd indices in increasing index order (i.e., a2, a4, …, a1, a3, …). Output the rearranged list.

### 5

You are given n and a sequence a1..an; produce a fresh output sequence formed by swapping every adjacent pair: positions (1,2), (3,4), … are swapped, and if n is odd the last element remains at the end. Output the resulting list.

## B-003 — Segment-Local Transformation

### 1

Given an array of n integers and two indices L and R (1≤L≤R≤n), negate every element in the inclusive segment [L,R]; output the resulting array in order.

### 2

Given a lowercase string s and two positions L and R (1≤L≤R≤|s|), reverse the substring s[L..R] while leaving other characters unchanged; output the modified string.

### 3

Given an array of n integers, indices L and R (1≤L≤R≤n), and an integer v, replace each element in the inclusive segment [L,R] with v; output the total sum of the array after replacement.

### 4

Given a binary array of length n and indices L and R (1≤L≤R≤n), flip every bit inside the inclusive segment [L,R] (0→1, 1→0); output the number of ones in the array after the operation.

### 5

Given an array of n integers and indices L and R (1≤L≤R≤n), set every element in the inclusive segment [L,R] to 0; output how many array entries changed value as a result.

## B-004 — Conditional Element Filtering

### 1

Given an integer n and a list of n integers representing scores, and an integer threshold T, emit the scores strictly greater than T in the same order they appeared; if none satisfy the rule, output an empty result.

### 2

You are given n and a list of n positive integers representing user IDs. Print only the IDs that are even, preserving the original order; output an empty result if there are no evens.

### 3

Given n and a sequence of n integers and a positive integer k, output those numbers that are divisible by k in their original order; if none are divisible, output an empty result.

### 4

Given n and n pairs (item_name, category) and a target category C, list the item_name values whose category equals C, preserving input order; if no items match C, output an empty result.

### 5

Given n and a list of n words, emit only the words that start with a vowel (a, e, i, o, u, case-insensitive), keeping their original order; if none start with a vowel, output an empty result.

## B-005 — Run-Length Description

### 1

Given an integer n and a sequence of n integers, summarize consecutive equal elements and output the number of runs (the count of maximal contiguous blocks of identical numbers). Output a single integer: the run count.

### 2

Given a string of lowercase letters, produce its run-length encoding as a sequence of pairs in the form "letter count" separated by single spaces, listing runs from left to right. Output the encoded pairs on one line.

### 3

Given a list of color names (space-separated tokens) describing a strip, find the longest consecutive run of the same color; if multiple runs tie choose the leftmost. Output the color name and the run length separated by a space.

### 4

Given a binary string, compress it into textual segments of the form v:l where v is '0' or '1' and l is the run length; separate segments with commas and no spaces, in left-to-right order. Output the single compressed string.

### 5

Given a sequence of n small nonnegative integers, output its run-length encoding as pairs written like (v,L) with no spaces inside each pair and pairs separated by a single space, preserving run order from left to right. Output the encoded pairs on one line.

## B-006 — Alternating Position Update

### 1

Positions are 1-indexed. Given an array of n integers and two integers A and B, add A to every element at odd positions and add B to every element at even positions; output the resulting array.

### 2

Positions are 0-indexed. Given a string of letters, convert characters at even positions to uppercase and characters at odd positions to lowercase; output the transformed string.

### 3

Positions are 1-indexed. Given a list of n integers, compute the alternating sum defined as (sum of elements at odd positions) minus (sum of elements at even positions); output the single integer result.

### 4

Positions are 0-indexed. Given n words, reverse the letters of each word at odd positions while leaving words at even positions unchanged; output the sequence of words in order.

### 5

Positions are 1-indexed. Given an array of n integers, replace each element at odd positions with its square and each element at even positions with its cube; output the updated array.

## B-007 — Single Extremum with Witness

### 1

Given an array of n integers representing daily temperatures, find the minimum temperature and the 1-based index of its first occurrence; if the minimum appears multiple times, report the smallest index. Output the temperature followed by its 1-based index.

### 2

You are given n stock closing prices in chronological order; determine the maximum price and output the 1-based index of its last occurrence (if the maximum repeats, output the largest index). Output the index only.

### 3

Given n integer contest scores, find and print the highest score value; if several contestants share the top score, return the earliest occurrence’s value (ties go to the first appearance). Output the score value only.

### 4

Given an array of n sensor readings, determine the minimum reading and the 0-based index of its last occurrence; if the minimum occurs multiple times, report the greatest 0-based index. Output the index then the reading.

### 5

Given n elevation measurements along a trail, find the maximum elevation and the 1-based position of its first occurrence; if the maximum repeats, choose the smallest 1-based position. Output the elevation value and its 1-based position.

## B-008 — Predicate Count

### 1

You are given an integer n and an array of n integers representing account balances, plus an integer threshold T; count how many balances are strictly greater than T and output that count.

### 2

Given an array of n integers representing daily step counts, count how many entries are odd numbers and output the total count.

### 3

Given a list of n real-valued temperature readings in Celsius, count how many readings are below 0 (negative) and output that count.

### 4

You are given n product codes as integers and an integer k; count how many codes are divisible by k (remainder zero) and output the count.

### 5

Given a string of length n composed of letters and symbols, count how many characters are uppercase English letters (A–Z) and output that count.

## B-009 — Conditional Aggregate

### 1

Given an integer n and a sequence a1..an (1 ≤ n ≤ 200000, each ai between -10^9 and 10^9), compute the sum of all positive elements located at odd indices (1-based). Print the resulting sum; if no element satisfies the predicate print 0.

### 2

Given an integer n and a sequence b1..bn of bits (1 ≤ n ≤ 200000, each bi ∈ {0,1}), compute the product of all bits at indices that are multiples of 3. Output 1 if that product equals 1 and 0 otherwise; if there are no such indices output 1 (the multiplicative identity).

### 3

Given integers n and k (1 ≤ n ≤ 200000, 1 ≤ k ≤ 10) and a sequence a1..an (0 ≤ ai ≤ 10^9), compute the sum of the decimal digit-sums of every ai that is divisible by k. Print the total sum, or 0 if no elements are divisible by k.

### 4

Given n (1 ≤ n ≤ 200000), a threshold T (0 ≤ T ≤ 10^6), and a sequence a1..an of integers with |ai| ≤ 10^6, count how many ai satisfy |ai| ≤ T and also compute the sum of those ai. Output two integers: the count and the sum (output 0 0 if none).

### 5

Given n (1 ≤ n ≤ 200000), a sequence v1..vn of nonnegative coin values (0 ≤ vi ≤ 10^9) and a label string s of length n with characters 'H' or 'T', compute the sum of values vi for which si = 'H' and vi is even. Print that sum; if there are no matching coins print 0.

## B-010 — First Visible Match

### 1

Given an array of n integers and a target integer T, scan the array from left to right and find the first index where the element equals T; output the 1-based index of that element or -1 if there is no match.

### 2

You are given a queue of n people’s heights in order from front to back and a threshold H; scanning from the front, find the first person whose height is strictly greater than H and print their 0-based position, or print NONE if none qualify.

### 3

An ordered list of n product category IDs is provided along the shelf; reading left-to-right, locate the first position whose category equals the requested class C and output the 1-based position, or output 0 if no product matches.

### 4

Given a chronological list of n exam scores and a passing mark P, scan scores from earliest to latest and report the first time a score is at least P by printing its 1-based index, or print NO if the passing threshold is never reached.

### 5

You have an array of n daily stock prices in time order; find the earliest index i (1 ≤ i < n) such that price[i] < price[i+1] (the first adjacent increase) when checking left-to-right, and output i using 1-based indexing, or -1 if no such adjacent pair exists.

## B-011 — Adjacent Relationship Check

### 1

Given a sequence of n integers a1..an, determine whether it is nondecreasing (for every i, a_i <= a_{i+1}). Output YES if it is, otherwise NO.

### 2

Given n integers b1..bn and an integer K, check whether every adjacent pair satisfies |b_{i+1}-b_i| <= K. Output YES if all consecutive differences are within K, otherwise NO.

### 3

Given a binary string s of length n consisting of '0' and '1', decide whether s strictly alternates (for every i, s_i != s_{i+1}). Output YES if it alternates, otherwise NO.

### 4

Given a list of n heights h1..hn and an integer D, determine whether there exists an adjacent pair with absolute difference <= D; if such a pair exists output the 1-based index i of any left element of such a pair, otherwise output -1.

### 5

Given a sequence of n words w1..wn, verify that no two neighboring words are equal (for every i, w_i != w_{i+1}). Print OK if the property holds, otherwise print the index of the first i where w_i = w_{i+1}.

## B-012 — Best Adjacent Pair

### 1

Given n integers representing daily earnings in order, find the maximum sum of any two consecutive days and output that maximum sum; if multiple adjacent pairs tie, choose the earliest (smallest left index). Values may be negative and sums can overflow 32-bit.

### 2

You are given n temperature readings in sequence. Find the minimum absolute difference |a[i]-a[i+1]| among all adjacent readings and output that minimum absolute difference and the 1-based left index of the first pair achieving it; ties break to the smallest index. Readings may be negative.

### 3

Given n integers representing troop strengths along a line, compute the largest product of any two adjacent strengths and output that product value; if multiple pairs tie choose the earliest pair (smallest left index). Strengths fit 32-bit signed but products may require 64-bit.

### 4

Given n timestamps (integers) in chronological order, find the adjacent pair with the largest sum and output the 1-based indices of that pair (left then right); if several pairs tie choose the earliest left index. Timestamps can be negative and sums may exceed 32-bit.

### 5

Given n sensor voltage readings, find the adjacent pair whose values (a[i],a[i+1]) have the smallest absolute sum |a[i]+a[i+1]| and output the two values of that earliest pair (left then right); ties break to the smallest left index. Readings may be negative and sums may overflow 32-bit.

## B-013 — Simple Frequency Tally

### 1

Given a string of decimal digits (characters '0'–'9'), count how many times each digit appears and output ten integers for digits 0 through 9 in that exact order.

### 2

Given a sequence of N lowercase letters, tally occurrences of every letter from 'a' to 'z' and print 26 counts in alphabetical order (a then b then ... then z).

### 3

Given a list of color names drawn only from {red, orange, yellow, green, blue, purple}, count occurrences of each color and output six integers in the fixed order: red, orange, yellow, green, blue, purple.

### 4

Given a series of entries naming days of the week, count how many times each weekday appears and output seven integers for Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday in that order.

### 5

Given N integer ratings where each rating is between 1 and 5 inclusive, compute the frequency of each rating and output five integers for ratings 1, 2, 3, 4, 5 respectively.

## B-014 — Most Common in Fixed Domain

### 1

Given n answers each being a digit 0–9, output the digit that appears most often; if multiple digits tie, output the smallest digit. Treat digits that never appear as count zero. Input: n followed by n digits. Output: the single chosen digit.

### 2

You are given n votes for one of these eight colors in this fixed order: red, orange, yellow, green, blue, indigo, violet, brown. Print the color that is least frequent; if several colors tie, print the earliest color in the listed order. Input: n and n color names.

### 3

A teacher collects n ratings that are integers from 1 to 5. Determine the most common rating and print its value; if there is a tie, print the highest rating among those tied. Ratings not given count as zero. Input: n then n integers.

### 4

Given n students' multiple-choice answers where each answer is one of A, B, C, or D, output which option occurs most frequently; if tied, choose the alphabetically smallest option. Input: n then n letters.

### 5

A survey records n responses from a fixed set of ten emoji labels (emoji1, emoji2, …, emoji10 in that order). Report the least chosen emoji; if there is a tie, output the lowest-indexed emoji from the list. Input: n then n labels; emojis not present count as zero.

## B-015 — Palindrome Inspection

### 1

Given a string S (possibly empty), determine whether S reads identically forwards and backwards in a case-sensitive manner; output "YES" if it does and "NO" otherwise.

### 2

Given a line of text T composed of lowercase letters, spaces, and commas, decide whether T becomes a palindrome after removing all spaces and commas; output "YES" if the cleaned text is a palindrome and "NO" otherwise.

### 3

Given an array A of integers (length possibly zero), determine whether A is symmetric, i.e., A[i] == A[n-1-i] for every valid index i; print "YES" if symmetric and "NO" otherwise.

### 4

Given a string S containing letters and digits, check whether S is a palindrome after first converting every uppercase letter to its lowercase form (digits unchanged); output "YES" if it reads the same forwards and backwards after this normalization and "NO" otherwise.

### 5

Given a string S (possibly empty), if S is a palindrome (case-sensitive) output "YES"; otherwise output the 1-based index of the first position from the left where the character does not match its mirror position (i.e., the smallest i with S[i] != S[n+1-i]).

## B-016 — Mirror Mismatch Count

### 1

Given a string S of length n, define mirror pairs as characters at positions i and n+1-i for i=1..floor(n/2). Count how many mirror pairs have different characters. Output a single integer.

### 2

Given an array A of n integers, define mirror pairs as elements at indices i and n+1-i for i=1..floor(n/2). Compute the sum of absolute differences |A[i]-A[n+1-i]| over all mirror pairs. Output the total sum.

### 3

Given a binary string B of length n, with mirror pairs at positions i and n+1-i for i=1..floor(n/2), list the indices i (1-based) of left-side positions whose mirror bit disagrees (B[i] ≠ B[n+1-i]) in increasing order. Output the indices separated by spaces or an empty line if none.

### 4

Given a DNA string D of length n over {A,C,G,T}, define mirror pairs as positions i and n+1-i for i=1..floor(n/2). Output the count of mirror pairs where the nucleotides differ.

### 5

Given a row of n colored tiles represented by integers, mirror pairs are tiles at positions i and n+1-i for i=1..floor(n/2). Return the number of mirror pairs whose colors are unequal, then output that many lines each with the left and right indices (i and n+1-i) of each mismatched pair in increasing order of i.

## B-017 — Character-Class Summary

### 1

Given a single ASCII string, count vowels (aeiouAEIOU), consonants (letters A-Z or a-z that are not vowels), digits (0-9), and punctuation from the explicit set . , ! ? : ; - ' " ( ) [ ] { }; output four integers in that order separated by spaces.

### 2

Given a single line representing a nameplate, count uppercase letters (A-Z), lowercase letters (a-z), space characters (ASCII 32), and digits (0-9); output the four counts in that order.

### 3

Given a single ASCII log line, count letters (A-Z and a-z), digits (0-9), bracket characters from the set [ ] ( ) { } < >, and other printable symbols (any printable ASCII excluding letters, digits, brackets, and spaces); output four integers in that order.

### 4

Given a proposed password string, count uppercase letters (A-Z), lowercase letters (a-z), digits (0-9), and special characters from the explicit set ! @ # $ % ^ & * ( ) - _ + =; output four counts in that order.

### 5

Given a single inventory-code string (tokens may be empty and are separated by commas), count vowels (aeiouAEIOU), consonants (letters A-Z or a-z that are not vowels), separators (commas ',' and semicolons ';'), and digits (0-9); output four integers in that order.

## B-018 — Digit Decomposition Aggregate

### 1

Given an integer V representing a treasure value (|V| ≤ 10^18), ignore any leading minus sign and treat 0 as a single digit 0; compute the sum of its decimal digits and output that sum.

### 2

Given an integer K representing a lock code (|K| ≤ 10^18), ignore any negative sign and treat 0 as the single digit 0; compute the product of its decimal digits and output the product.

### 3

Given an integer ID and a digit d (0–9) where |ID| ≤ 10^18, ignore a leading minus sign and do not consider any leading zeros; treat ID = 0 as a single zero digit and output how many times digit d appears in the decimal representation.

### 4

Given an integer S denoting a serial number (|S| ≤ 10^18), preserve the sign of S and treat 0 as a single digit 0; form the integer obtained by reversing the decimal digits of the magnitude and output that reversed integer with the original sign and no leading zeros.

### 5

Given an integer P representing a game score (|P| ≤ 10^18), ignore any minus sign and treat 0 as a single digit 0; output the count of even decimal digits in its representation.

## B-019 — Elementary Number Classification

### 1

Given a single integer N (|N| ≤ 10^18), determine whether it is even or odd; output EVEN if N is divisible by 2, otherwise output ODD.

### 2

Given an integer N (|N| ≤ 10^18), decide whether N is divisible by 3; output DIVISIBLE if N mod 3 = 0, otherwise output NOT DIVISIBLE.

### 3

Given three integers X, L, R (|X|,|L|,|R| ≤ 10^18), classify X with respect to the inclusive interval [L,R]; output INSIDE if L ≤ X ≤ R, otherwise output OUTSIDE.

### 4

Given an integer year Y (can be zero or negative), determine whether Y is a Gregorian leap year using the rule: divisible by 4 but not by 100 unless divisible by 400; output LEAP or COMMON.

### 5

Given a single integer N (|N| ≤ 10^18), classify its sign and output POSITIVE if N>0, ZERO if N=0, and NEGATIVE if N<0.

## B-020 — Simple Divisor Scan

### 1

Given a positive integer N (N ≤ 100000) representing the number of tiles in a mosaic, output the number of positive divisors of N as a single integer.

### 2

For a positive integer M (M ≤ 100000), list all proper divisors of M (divisors strictly less than M) in increasing order separated by spaces; if none exist, output an empty line.

### 3

A safe uses a positive integer code X (X ≤ 100000); find and output the smallest divisor of X that is greater than 1 (for X=1, output 1).

### 4

Given a positive integer A (A ≤ 100000) representing the size of a shrine, compute and output the sum of all proper divisors of A (exclude A itself).

### 5

You are given a positive integer N (N ≤ 100000) and a bound K (1 ≤ K ≤ 1000); count and output how many positive divisors d of N satisfy d ≤ K.

## B-021 — Two-Dimensional Cell Transformation

### 1

Given a rectangular grid of integers representing an elevation map and an integer k, multiply every cell's value by k and output the resulting grid.

### 2

Given an r×c pixel grid of integers and an integer B, replace every border cell (cells in the first or last row or first or last column) with B while leaving inner cells unchanged, and output the modified grid.

### 3

Given an n×n integer matrix, output its transpose so that the element originally at row i, column j appears at row j, column i in the result.

### 4

Given an r×c spreadsheet as an integer matrix, negate the value of every cell whose row+column index is even (indices start at 1) and output the updated matrix; other cells remain unchanged.

### 5

Given an r×c grid of integers and a list of c integer column-factors, multiply every element in column j by the j-th factor and output the transformed grid.

## B-022 — Matrix Row or Column Reduction

### 1

Given R×C integers, treat rows as the units: compute the sum of each row and output the 1-based index of the row with the largest sum; if multiple rows tie choose the smallest index, and if R=0 output -1.

### 2

Given an R×C matrix of integers, treat columns as the units: compute the maximum value in each column and output the C maxima in left-to-right order; if C=0 output an empty list.

### 3

Given an R×C grid of characters '.' and '#', treat rows as the units: count the number of '#' in each row and output the R counts in top-to-bottom order; if R=0 output an empty list.

### 4

Given R×C integers, treat rows as the units: for each row compute its maximum element and output the 1-based index of the row whose maximum is smallest; if several rows tie choose the largest index, and if R=0 output -1.

### 5

Given an R×C matrix of integers, treat columns as the units: compute the maximum in each column and output the 1-based index of the column with the smallest maximum; if multiple columns tie choose the leftmost, and if C=0 output -1.

## B-023 — Grid Motion Simulation

### 1

A single robot starts at row r and column c on an R×C grid with rows 1..R (top to bottom) and columns 1..C (left to right); given a string of moves from {N,S,E,W}, any move that would leave the grid is ignored (clamp-at-edge). After performing all moves deterministically, output the final row and column of the robot.

### 2

A lone probe is placed at coordinate (x,y) on an R×C toroidal grid where moving off one edge reappears on the opposite edge (wraparound). Given a sequence of directions (N,S,E,W), apply each move and output the final coordinates of the probe.

### 3

A single courier starts at (r,c) on a grid with rows 0..R-1 and cols 0..C-1 and there are no obstacles; given a list of moves N,S,E,W, any move that would exit the grid is ignored (clamp-at-edge). Output the ordered list of visited coordinates including the starting cell.

### 4

A single drone begins at (r,c) on an R by C wraparound grid (moving past edges wraps to the other side). Given M moves as directions N,S,E,W, deterministically update its position and output the Manhattan distance between the final position and the starting position.

### 5

A lone painter at (r,c) on an R×C grid with no obstacles follows a given string of moves N,S,E,W; moves that would go outside leave the painter at the nearest edge (clamp-at-edge). After all moves, output the number of distinct cells painted (visited at least once, including the start).

## B-024 — One-Variable Resource Simulation

### 1

A bank account starts with an integer balance and you are given a sequence of integer transactions (positive deposits, negative withdrawals); apply them in order with the rule that the balance cannot go below zero. Output the final account balance after all transactions.

### 2

A thermometer begins at an integer temperature and a list of integer adjustments is applied sequentially (positive warms, negative cools). Simulate the updates and output the maximum temperature reached at any point during the sequence.

### 3

A player's score starts at an integer value and a sequence of integer event deltas (positive or negative) is applied in order. Determine and output the 1-based index of the first event after which the score becomes negative, or -1 if it never does.

### 4

A warehouse has an initial integer inventory count and receives a sequence of integer changes (positive stock-ins, negative removals); inventory is clamped to a minimum of zero after each change. Simulate all changes and output the final inventory count.

### 5

A spaceship's fuel tank starts with an integer amount and a sequence of integer operations (positive refuels, negative burns) is applied sequentially; fuel cannot drop below zero. After applying all operations, output the remaining fuel level.

## B-025 — Simple Sortedness Preparation

### 1

Given an array of n integers and an explicit list P that contains each distinct value exactly once and defines their desired order, reorder the array so its elements appear sorted according to P and output the resulting sequence.

### 2

You are given n lowercase words and a custom alphabet (a permutation of the 26 letters) that defines lexicographic order; sort the words according to that alphabetic order and output them.

### 3

Given n personal names and a direction token (ASC or DESC) specifying whether to sort by name length increasing or decreasing, reorder the list by length accordingly, preserving original relative order for equal lengths (stable), and output the names.

### 4

You have n product codes (nonempty strings) and an explicit ordering of characters that assigns a priority to each possible first character; sort the codes by the priority rank of their first character (ties keep original order) and output the sorted list.

### 5

Given n color names and a provided ranked list that specifies the full standard order among the color names, reorder the given sequence to follow that supplied ranking exactly and output the reordered color list.

## B-026 — Direct Sequence Construction

### 1

Given three integers n, s, d, construct an array of length n where the i-th element (1-based) equals s + (i-1)*d. Output the n integers in order separated by spaces.

### 2

Given integers n, x, y, build a sequence of length n where element i (1-based) is x if i is odd and y if i is even. Output the sequence of n values.

### 3

Given integers n and k followed by k integers p1..pk, produce a length-n sequence where the i-th element is p_{((i-1) mod k)+1} (repeat the k-long pattern). Output the n numbers.

### 4

Given integer n, create a sequence a of length n where a_i = i*(i+1) for i from 1 to n. Output the n values in order.

### 5

Given integers n, r, s, d produce a sequence of length n where the i-th element equals s + floor((i-1)/r)*d (values increase by d every r positions). Output the n integers.

## B-027 — Prefix Running Summary

### 1

Given a sequence of n integers a1,...,an, compute the running sum S_i = a1 + ... + ai for each i from 1 to n and output the n values S_1 ... S_n.

### 2

You are given n game scores s1,...,sn; for every prefix i output the maximum score seen so far, M_i = max(s1,...,si), producing n numbers M_1 ... M_n.

### 3

Given n binary values b1,...,bn (each 0 or 1), compute the parity p_i = (b1+...+bi) mod 2 for each prefix i and output the sequence p_1 ... p_n.

### 4

Given an integer k and a sequence a1,...,an, for each prefix i output the count c_i of elements among a1...ai that are divisible by k, producing n counts c_1 ... c_n.

### 5

Given a threshold T and a sequence of integers a1,...,an, for each prefix i output the number t_i of elements strictly greater than T among a1...ai, producing t_1 ... t_n.

## B-028 — Simple Token Transformation

### 1

Given a single line of text (length 1–200000) where tokens are separated by one or more spaces, transform each token by capitalizing its first character and making all other letters lowercase; punctuation is part of tokens. Ignore leading/trailing spaces and treat consecutive spaces as a single delimiter; output the tokens joined by a single space.

### 2

Given a single line of text (length 1–200000) with tokens separated by one or more spaces, reverse the characters of each token independently and reconstruct the line with a single space between tokens; punctuation stays attached to its token. Leading/trailing spaces and multiple intermediate spaces should be treated as delimiters and normalized to one space in output.

### 3

Given a line of text (tokens separated by one or more spaces) and two additional words A and B, replace every token exactly equal to A with B (case-sensitive) and leave other tokens unchanged; punctuation remains part of tokens. Normalize input by ignoring leading/trailing spaces and treat multiple spaces as a single delimiter; join output tokens with one space.

### 4

Given a line of text (tokens separated by one or more spaces), append a 1-based index to each token as _k (token_1, token_2, ...) preserving token characters and punctuation. Treat consecutive spaces as a single delimiter and ignore leading/trailing spaces; output tokens joined by a single space.

### 5

Given a single line of text (length 1–200000) whose tokens are separated by one or more spaces, convert every token to all uppercase letters while leaving punctuation attached to tokens. Normalize spacing by collapsing multiple spaces and trimming edges; reconstruct the output with tokens separated by a single space.

## B-029 — Circular Index Lookup

### 1

Given an integer n and an array a[0..n-1], find the smallest index i (0-based) such that a[i] == a[(i+1) mod n]; output that index or -1 if no such index exists.

### 2

Given an integer n, an array a[0..n-1], and a fixed offset k (0 ≤ k < n), count how many indices i satisfy a[(i+k) mod n] > a[i]; output the integer count.

### 3

Given a circular string of length n and a start position p (0 ≤ p < n), read and output the n characters encountered by moving one step forward each time with wraparound, producing the rotation starting at p.

### 4

Given an integer n and array a[0..n-1], determine whether there exists an index i such that a[i] is strictly greater than both neighbors a[(i-1) mod n] and a[(i+1) mod n]; output any such index or -1.

### 5

Given an integer n, an array a[0..n-1], and a fixed forward jump k (0 ≤ k < n), output the sequence of n pairs (a[i], a[(i+k) mod n]) for i from 0 to n-1 in order.

## B-030 — Componentwise Sequence Combination

### 1

Given two arrays A and B of n integers (n ≥ 1, lengths equal), compute an array C of length n where Ci = Ai + Bi for each index i; output C in order.

### 2

Given two sequences T and U of n integers representing paired readings (lengths equal), produce a sequence D of length n with Di = Ti - Ui for every i; output D in order.

### 3

Given two equal-length strings S and T of length n, produce a binary string R of length n where Ri is '1' if Si equals Ti and '0' otherwise; output R.

### 4

Given two lists H1 and H2 of n positive integers (paired players, equal lengths), produce a list M where Mi = max(H1i, H2i) for each i and output M in order.

### 5

Given two strings A and B of equal length n, produce the interleaved string formed by concatenating corresponding characters as A1B1A2B2...AnBn; output that resulting string.

## S-001 — Duplicate Membership Detection

### 1

Given a list of student names called during attendance, determine whether any name appears more than once; output YES if a duplicate exists and NO otherwise.

### 2

You receive a stream of package barcodes in arrival order; report the first barcode whose appearance is a repeat (the barcode at its second occurrence), or output -1 if no barcode repeats.

### 3

Given the list of email addresses to send a newsletter to, find the 1-based index of the first address that duplicates an earlier entry; output 0 if all addresses are unique.

### 4

A diagnostic log lists sensor integer IDs in sequence; output the earliest 0-based position at which a sensor ID has already been seen before, or print OK if every reading is unique.

### 5

You are dealt a sequence of card codes; determine and print the card code whose second occurrence happens earliest (the first-to-repeat value), or print NONE if every card is unique.

## S-002 — Target Pair Lookup

### 1

Given an array of n integers and a target T, find any two distinct indices i and j (1 ≤ i,j ≤ n, i ≠ j) such that a[i] + a[j] = T; output the pair of indices or -1 -1 if no such pair exists (n up to 300000).

### 2

You are given n integers and an integer K; determine whether there exist distinct indices i and j with a[i] - a[j] = K (orientation matters). Return any valid index pair or the word NONE if none exists (cannot reuse the same element twice).

### 3

Given an array of n nonnegative integers and a target X, find any two distinct positions i ≠ j where a[i] XOR a[j] = X; output the two 1-based indices or -1 -1 if no witness pair exists.

### 4

Given a list of n item weights and a capacity C, output any two distinct item weights w1 and w2 (in any order) that sum to C, or the single word IMPOSSIBLE if no such pair exists (indices must be different even if values repeat).

### 5

For an array of n integers and a target S, produce an array b of length n where b[i] is an index j (j ≠ i) such that a[i] + a[j] = S, or -1 if no such complement exists; return any valid complement index when multiple choices exist (n between 2 and 300000).

## S-003 — Frequency Threshold Classification

### 1

Given an array of n integer IDs and an integer threshold t, output all distinct IDs whose global occurrence count is at least t, sorted in increasing order; if none, output an empty list.

### 2

Given a list of n bird names (strings) and an integer k, count how many distinct bird names appear exactly k times in the entire list and print that count.

### 3

Given an array A of n product codes and an integer m, produce a binary array B of length n where B[i]=1 if the code A[i] appears more than m times in A, otherwise B[i]=0.

### 4

Given n hashtag strings and an integer t, find the single hashtag with the maximum frequency; if multiple hashtags tie for maximum, return the one whose first occurrence comes earliest in the list.

### 5

Given a sequence of n colored bead labels and an integer t, list all distinct colors whose frequency is at most t in the order of their first appearance; if none satisfy this, output an empty list.

## S-004 — Multiset Equality

### 1

You are given two integer arrays A and B; for comparison normalize each element to its absolute value and decide whether the two arrays contain exactly the same multiset of normalized integers. Output "YES" if they match, otherwise "NO".

### 2

Two lists of words (space-separated tokens) are provided: list U and list V. For each token normalize by converting to lowercase and stripping any leading or trailing punctuation characters . , ! ? : ; ' " ( ), then determine whether U and V contain the same multiset of normalized words. Output "YES" or "NO".

### 3

Given two strings S and T, consider only alphabetic characters and normalize each by converting to lowercase (ignore all non-letters); determine whether the multisets of remaining characters in S and T are identical. Output "YES" if they are, otherwise "NO".

### 4

You have two inventories: sequences of SKU codes from shop X and shop Y. Normalize each SKU by trimming leading/trailing whitespace and converting all letters to uppercase; decide whether the two inventories contain exactly the same multiset of normalized SKUs. Print "YES" or "NO".

### 5

Two lists of filenames A and B are given; normalize each filename to its base name by removing the final dot and extension (if any) and keeping the remainder exactly as-is, then check whether A and B contain the same multiset of base names. Output "YES" if they match and "NO" otherwise.

## S-005 — Anagram Signature Grouping

### 1

You are given N lowercase words (letters a–z); total length of all words ≤200000. Group the words into anagram classes (two words are related if one is a permutation of the other's letters) and output for each class the 1-based indices of its members from the original list; groups may be in any order but indices within a group must be ascending.

### 2

A mage has M rune strings composed only of letters a–f. Identify and output all distinct sorted signatures (letters in nondecreasing order) that occur at least twice among the runes, one signature per line in any order.

### 3

Given a list of product tags (lowercase a–z), compute and output a single integer: the number of distinct anagram classes present among the tags.

### 4

Two lists A and B of lowercase labels are given (total length ≤200000). Count and output the number of ordered pairs (i,j) such that A[i] and B[j] are anagrams of each other (have identical letter-multisets).

### 5

You have K license codes consisting of lowercase letters a–z. Find the anagram class with the maximum size and output two items: the size of that class and one representative string from that class (any member).

## S-006 — Distinct-Count Windowless Summary

### 1

You are given a sequence of n words that make up a document. Count how many distinct words appear in the entire sequence and output that integer.

### 2

A row of n painted tiles is described by their color names in order. Determine the number of distinct colors among all tiles and print that count.

### 3

A list of n device IDs (integers) is provided representing recorded devices. Compute how many distinct device IDs occur in the list and output that number.

### 4

Two guest lists are given: the first contains a entries of guest IDs and the second contains b entries. Compute the number of distinct guest IDs appearing in at least one list (the union) and output that integer.

### 5

Two jars list colors of beads they contain: the first has p color entries and the second has q color entries. Determine the count of distinct bead colors present across both jars (union of the two lists) and print that value.

## S-007 — First Unique by Global Frequency

### 1

Given a string S of length n, find the 0-based index of the first character whose total occurrence in S is exactly 1. Output that index, or -1 if no such character exists.

### 2

You are given an array A of n customer IDs (integers). Return the earliest ID (value) that occurs exactly once in the entire array; output -1 if none exists.

### 3

Given a sequence of n words and an integer k, find the earliest word in original order whose global frequency equals k. Output that word, or print a single dash (-) if no word meets the frequency k.

### 4

An ordered list of n color names is provided. Determine the 1-based position of the first color that appears exactly twice in the whole list; output 0 if no such color occurs.

### 5

Given an array of n byte values (0–255), return the value of the earliest byte that occurs exactly three times across the array; output -1 if none exists.

## S-008 — Common-Element Intersection

### 1

Given two integer arrays A and B, output all distinct values that appear in both arrays, sorted ascending; treat each array as a set (ignore duplicate occurrences).

### 2

You are given two sequences of product IDs sold by Store1 and Store2; for every product that appears in both sequences, output the product ID and the minimum number of times it appears in either store (multiset intersection counts), order of output arbitrary.

### 3

Given two lists of color names used in NeighborhoodX and NeighborhoodY, output a single integer: the count of unique color names present in both lists; duplicates within a neighborhood are ignored (set intersection).

### 4

Given arrays A and B, find and output the first element of A (smallest index) that also appears anywhere in B; treat membership in B as a set (duplicates in B ignored); if no such element exists output a specified sentinel.

### 5

Given two tag lists for Photo1 and Photo2, output each tag that appears in both photos along with the total combined multiplicity (sum of counts from both lists) for that tag; treat tags as multisets so duplicates contribute to counts.

## S-009 — Index-Value Association Lookup

### 1

You are given N product records each with a product code (string) and an integer price; if the same code appears multiple times the last listed price overwrites earlier ones. Then you receive Q product-code queries; for each query print the associated price or the literal NOT FOUND if the code does not exist.

### 2

There are N unique player-name and integer-score pairs (no name repeats). After reading them you must answer Q name queries by printing that player's score or -1 if the name is not in the list.

### 3

A log contains N submissions, each a student ID and a submission-version string; a student may submit multiple times and the latest entry overrides previous ones. For Q queried student IDs output the most recent version string or NO SUBMISSION if the student has no record.

### 4

A warehouse feed gives N SKU strings with integer quantities; later entries for the same SKU overwrite earlier quantities. For Q SKU queries print In stock if the SKU exists with quantity>0, otherwise print Out of stock.

### 5

You are given N distinct postal-code strings each mapped to an integer population (postal codes are unique). Then answer Q postal-code queries by printing the stored population or 0 if the postal code is not present.

## S-010 — Sorted Pair Convergence

### 1

Given a sorted sequence of n integers representing coin values and a target T, determine whether there exist two coins whose sum equals T; if so output one pair of 1-based indices i<j, otherwise output -1 -1.

### 2

Given a non-decreasing list of n integer timestamps and an integer D, find any pair of indices i<j such that timestamp[j]-timestamp[i]=D; output the two indices i j if found, otherwise output NONE.

### 3

Given an array of n integer weights and an integer T (you may sort the array once), choose two weights whose sum minimizes |sum-T|; output their 1-based indices and the achieved sum.

### 4

Given a sorted list of n page counts and an integer K, count the number of unordered index pairs (i<j) whose difference equals K and output that count.

### 5

Given a sorted array of n integers representing heights and an integer T, find two heights whose sum is the maximum value ≤ T; output that maximum sum, or output NONE if no such pair exists.

## S-011 — Merge Ordered Streams

### 1

Given two ascending integer arrays A and B, each sorted in nondecreasing order, output a single ascending array containing all elements from A and B (preserve every duplicate and relative order when equal).

### 2

You are given two chronologically sorted lists of event timestamps (strings like HH:MM:SS) from Log1 and Log2; merge them into one chronological timeline, and when timestamps tie, place Log1's events before Log2's.

### 3

Two lexicographically sorted lists of words S and T are provided; produce the sorted union list containing each distinct word that appears in S or T exactly once, in lexicographic order.

### 4

Sensor A and Sensor B each produce a nondecreasing sequence of floating-point readings; merge them into one nondecreasing sequence of pairs (reading, source) where source is 'A' or 'B', and when readings are equal prefer taking the element from A first.

### 5

You have two sorted lists of usernames U and V (each list has no duplicates within itself); merge them into a single sorted list and also output, in order, the lengths of maximal consecutive runs coming from U or from V (i.e., run-lengths of source segments in the merged list).

## S-012 — Sorted Deduplication

### 1

Given a sorted array of n integers, remove duplicates in-place so that each distinct value appears exactly once; return the new length m and ensure the first m elements of the array contain the unique values in nondecreasing order.

### 2

You are given a sorted list of n timestamps. Modify it in-place to keep at most two occurrences of any identical timestamp and return the new length; the remaining prefix must be sorted and contain no timestamp more than twice.

### 3

Given a sorted array of n nonnegative integers, compute and output the number of distinct values present in the array.

### 4

Given a nondecreasing sorted array of n usernames (strings), compress it in-place so that every username appears at most three times; return the length of the resulting prefix while preserving the original order of retained entries.

### 5

Given a sorted sequence of n sensor readings (floats), write one representative per run of equal readings to the front of the sequence and output the length of the compacted prefix containing those representatives.

## S-013 — Interval Overlap Decision

### 1

A technician receives a sorted list of n half-open maintenance windows [start,end) (times in minutes). Decide whether any two windows overlap (share any time instant); output YES or NO.

### 2

Two doctors' appointment calendars are each given as sorted lists of closed intervals [start,end] (minutes). Under closed endpoints (touching counts as overlap), determine whether there exists any appointment from calendar A that overlaps an appointment from calendar B; output YES or NO.

### 3

Given two sorted lists of half-open video segments [s,e) for Playlist A and Playlist B, find the first (earliest by start time) pair of segments (i,j) that overlap; if none exist, output (-1,-1).

### 4

Two machine reservation logs are given as sorted closed intervals [s,e] with integer endpoints; produce the sorted list of closed intervals representing every non-empty intersection between a reservation from log1 and a reservation from log2.

### 5

A list of n open intervals (s,e) (endpoints excluded) sorted by start time represents subway track occupancies. Under open endpoints (touching does not count), determine whether any two occupancies overlap (share any real point); output YES or NO.

## S-014 — Two-Ended Compaction

### 1

Given an array of integers A, rearrange its elements in-place so that every nonzero element appears before every zero (zeros may be in any order); output the resulting array.

### 2

Given a list of integers, reorder the elements in-place so that all even numbers occupy the left side and all odd numbers occupy the right side; output the final list.

### 3

Given an array of signed integers, partition it in-place so that all negative values come before all non-negative values; output the rearranged array.

### 4

Given an array of boolean flags, compact it in-place so that all false entries are on the left and all true entries are on the right; output the resulting array.

### 5

Given an array of integers and a target value t, rearrange the array in-place so that every element equal to t appears on the left and all other elements on the right; output the transformed array.

## S-015 — Prefix Range Sum

### 1

You are given an array C of n nonnegative integers where C[i] is the total number of visitors recorded from day 1 through day i; for q queries each with indices l and r (1≤l≤r≤n) output the number of visitors who arrived on days l..r inclusive.

### 2

An array P of length n contains cumulative rainfall readings: P[i] is the total milliliters collected from river positions 1 through i; for each of q queries providing l and r report the total rainfall between positions l..r inclusive.

### 3

An array S of n integers gives prefix weights of coins: S[i] equals the combined weight of coins in boxes 1..i; answer q queries each asking for the total coin weight contained in boxes l..r.

### 4

A binary marking system provides M[1..n] in prefix form where M[i] is the count of marked cells among columns 1..i of a single spreadsheet row; for q queries with bounds l and r output how many marked cells lie in columns l..r.

### 5

Given an array R of n integers where R[i] denotes the cumulative brightness sum of pixels from column 1 up to i in a single image row, answer q queries (l,r) by printing the total brightness across columns l..r inclusive.

## S-016 — Difference Range Update

### 1

There are n garden plots initially with zero compost; q operations follow each given as l r x meaning add x units of compost to every plot from l to r inclusive. After all operations, output the final compost amount for each plot as n integers.

### 2

A booking system has n consecutive days initially with zero bookings; q bookings follow, each specified by l r meaning increment the booking count by 1 for every day in the range l..r inclusive. After processing all bookings, output n integers: the booking count for each day.

### 3

A gallery wall has n panels with initial paint thickness zero; q strokes follow, each given as l r d where d may be negative and you add d thickness to every panel in [l,r]. After all strokes, output the final thickness of each of the n panels.

### 4

A highway has n toll booths starting at fee 0; q regulations follow, each as l r delta meaning add delta to every booth with index in l..r inclusive. After applying all regulations, print two integers: the 1-based index of a booth with maximum final fee (choose the smallest index on ties) and that maximum fee.

### 5

There are n integer points initially uncovered; q cameras are installed, each covering an interval l..r and increasing the coverage count by 1 for every point in that interval. Given an integer k, after all installations output a single integer: how many of the n points have coverage count at least k.

## S-017 — Balanced Delimiter Validation

### 1

Given a string composed only of '(' and ')' characters, determine whether all parentheses are properly nested (last-opened-first-closed). Output YES if the whole string is balanced; otherwise output the 1-based index of the first character that makes the prefix invalid.

### 2

Given a sequence consisting only of characters '(', ')', '[', ']', '{', '}', check whether the delimiters are properly nested with matching types. If balanced output VALID; if a closing bracket mismatches or closes an empty stack output the 1-based index of that character; if the string ends with leftover opens output the 1-based index of the first unmatched opening.

### 3

Given a string made from characters '(', ')', '<', '>' and double-quote characters '"' where anything between a pair of double quotes is treated as a quoted token and delimiters inside quotes are ignored, verify that delimiters outside quotes form a proper nesting. Output OK if balanced, otherwise output the 1-based index of the first invalid character encountered.

### 4

Given a sequence containing only '[', ']', '<', '>' and single-quote characters '\'', where single-quoted tokens may contain brackets that must be ignored, determine whether the unquoted delimiters are properly nested. Output 0 if the string is balanced; otherwise output the 1-based position of the first character that violates nesting rules.

### 5

Given a string of '(', ')', '[', ']', '{', '}' characters, validate nesting and matching types using last-opened-first-closed rules. If the string is balanced print Matched; if an early closing is invalid print the 1-based index of that closing; if the string finishes with unmatched openings print the 1-based index of the first unmatched opening.

## S-018 — Adjacent Cancellation Stack

### 1

You are given a sequence of n (1≤n≤300000) magnets, each labeled 'N' or 'S'. Scan left-to-right removing an adjacent opposite pair whenever the next magnet is opposite the one on top of the pile (N next to S or S next to N). Output the remaining sequence of magnets after all cancellations.

### 2

A polymer is a string of n lowercase letters (1≤n≤300000). Process the string left-to-right: when the next character equals the character on top of the stack they annihilate (both removed); otherwise push the next character. Output the final polymer string after all possible adjacent-equal cancellations.

### 3

Given a string of length n (1≤n≤300000) consisting of printable characters and a backspace marker '#', process left-to-right where each '#' cancels the most recent non-canceled character (both the character and the '#' are removed); a '#' with no prior character is simply removed. Produce the resulting string after performing all cancellations.

### 4

You receive n (1≤n≤300000) beads in a line, each colored from a small palette, and a list of unordered canceling color pairs (reaction table). Traverse beads left-to-right; when the next bead forms a canceling pair with the bead at the top of the pile, remove the top bead and discard the incoming bead, otherwise push it. Return the remaining sequence of beads in order.

### 5

Given a sequence of n integers (each either +1 or −1, 1≤n≤300000), process left-to-right, canceling an incoming element whenever it has opposite sign to the element on top of the pile (both removed); otherwise push it. Output the count of elements left after all adjacent opposite-sign cancellations.

## S-019 — Monotone Queue Service

### 1

Given n customers arriving at nondecreasing times a_i with service durations s_i and a single barista serving one customer at a time FCFS, compute each customer’s waiting time (time from arrival until their service starts).

### 2

Given n network packets with nondecreasing arrival times a_i and processing times p_i handled by a single sequential processor FCFS, output the departure time (finish processing timestamp) for each packet in input order.

### 3

Given n items arriving at nondecreasing times a_i to a single machine that takes a fixed processing time T per item and serves items FCFS, produce the service start time for every item in arrival order.

### 4

Given n print jobs with nondecreasing arrival times a_i and durations d_i processed by one printer FCFS, determine the maximum waiting time experienced by any job.

### 5

Given n patients arriving at nondecreasing times a_i with consultation durations c_i and one doctor serving FCFS, count how many patients had to wait (their service started strictly after arrival).

## S-020 — Circular Queue Rotation

### 1

Start with n numbered cards in a queue. Repeat: discard the front card (append its label to output), then move the new front card to the back; continue until the queue is empty. Output the sequence of discarded card labels in order.

### 2

You are given n customer IDs in arrival order and m operations; each operation is an integer r meaning “rotate the front r times” (each rotation moves front to back) then report the current front without removing it. Execute all operations and output the sequence of reported customer IDs.

### 3

n players labeled 1..n sit in a circle. Using a fixed step k, repeatedly rotate the queue k-1 times and then remove and record the front player; continue until every player is eliminated. Output the elimination order.

### 4

Given a conveyor with n product labels and a list of commands where each command is either ROTATE t (move the front item to the back t times) or TAKE (remove and record the front item), simulate the commands in order and output the recorded taken labels.

### 5

Start with n flashcards arranged in order and a sequence of q steps; each step gives a nonnegative integer r meaning “rotate front-to-back r times” followed immediately by REVIEW which removes and records the current front card. Perform all steps and output the recorded review sequence.

## S-021 — Earliest Finishing Interval Selection

### 1

You are given n meeting requests, each with integer start and end times; intervals are half-open [s,e) so a meeting that ends at time t allows another to start at t. Select a maximum-size set of non-overlapping meetings that fit in a single room and output the indices of the chosen meetings in any order.

### 2

There are n radio broadcast segments with integer start and end times interpreted as closed intervals [s,e] (segments that touch at endpoints conflict). Choose the largest subset that can be aired on a single frequency and output a single integer: the maximum number of non-conflicting segments.

### 3

Given n tasks with real-valued start and end times, treat intervals as (s,e] (start open, end closed), so a task beginning exactly when another ends is allowed. Find any maximum-size sequence of tasks that can be run on one machine and return the indices of selected tasks in increasing finish-time order.

### 4

A conference provides n talk proposals with integer start and end times; use half-open intervals [s,e) (an end time equals the next start is compatible). Pick the maximum number of talks that can be scheduled in one hall and output two lines: the count followed by the indices of talks in the chronological order they will occur.

### 5

You are given n surgery appointments with integer start and end times; intervals are closed [s,e] so touching endpoints are considered overlapping. Choose the largest possible set of surgeries that can be performed in one operating room and output the indices of the chosen appointments in any order.

## S-022 — Smallest Feasible Coin Choice

### 1

Given integers k and target T, then k increasing coin denominations d1<d2<...<dk with d1=1 and for i>1 each di is a multiple of di-1; choose nonnegative counts ci so sum(ci*di)=T using the fewest coins possible and output a single integer: that minimum total coin count.

### 2

Given integers k and target N, then k increasing pack sizes p1<...<pk where each pi divides pi+1 (p1 may be >1); choose nonnegative counts xi so sum(xi*pi)=N using the fewest packs; if it is impossible print -1, otherwise output k integers x1..xk (counts for p1..pk).

### 3

Given k and target score S followed by k scoring values s1<...<sk with s1=1 and each si dividing si+1, find nonnegative counts ti to reach exactly S with the minimum number of scoring tokens; output k integers giving the counts for scores sk down to s1 (descending denomination order).

### 4

Given k and amount A and k stamp values v1<...<vk where v1=1 and every vi divides vi+1, choose nonnegative counts yi so sum(yi*vi)=A minimizing total stamps used; output k integers y1..yk (counts for v1..vk in increasing denomination order).

### 5

Given base b and exponent limit k and a target M, consider k denominations equal to 1,b,b^2,...,b^{k-1} (so each value divides the next); determine the minimum number of tokens needed to sum exactly to M and the number of tokens of the largest denomination used; output two integers: minimal token count and count of denomination b^{k-1}.

## S-023 — Sorted Group Boundary Scan

### 1

You are given n student records, each containing an integer score; group students by identical score and output each distinct score with the count of students who achieved it, listed in increasing score order.

### 2

Given n sales entries, each with a product code string and a sale amount integer, aggregate total sales per product and output each product code paired with the summed amount for that code, ordered lexicographically by product code.

### 3

An event log has n entries each with an event type character and an integer timestamp; for each event type report the earliest timestamp it occurred, listing event types in ascending character order.

### 4

You are given a list of n beads described by color name strings; group beads by color and output each color with its frequency (count of beads of that color), listing colors in lexicographic order.

### 5

Given n book records each with an author name string and a page-count integer, compute total pages per author and output each author with the sum of pages across their books, ordered by author name.

## S-024 — Lexicographic Neighbor Comparison

### 1

Given n strings, determine whether any two are identical; using default ASCII lexicographic order, if a duplicate exists output one duplicated string, otherwise output NONE.

### 2

Given n strings, sort them in ASCII lexicographic order and find the adjacent pair with the longest common prefix; output the two original 1-based indices of that pair.

### 3

Given n strings, sort them in ASCII lexicographic order and find an adjacent pair whose absolute difference in lengths is minimal; output that minimal difference and the two strings in that pair.

### 4

Given n strings, sort them in ASCII lexicographic order and report the first adjacent pair where one string is a prefix of the other; output the prefix string and the longer string, or NONE if no such pair exists.

### 5

Given n strings, sort them in ASCII lexicographic order and find an adjacent pair with the shortest common-prefix length; output the two strings and the length of their common prefix.

## S-025 — Frequency-Ordered Reporting

### 1

Given a list of n words, output all distinct words sorted by decreasing frequency; if two words have the same count, list the lexicographically smaller word first.

### 2

You are given a sequence of product sale IDs; print the single product ID that appears most often (the top seller). If multiple products tie for top frequency, output the smallest numeric ID among them.

### 3

A row of painted tiles is described by their color names in order; print each color exactly once sorted from most frequent to least frequent, breaking ties by the color that appears earlier in the input sequence.

### 4

Given a list of integer error codes from logs, output every distinct error code ordered by descending frequency; if counts are equal, place the larger numeric error code before the smaller.

### 5

From survey responses consisting of category labels, produce the histogram: list each category once sorted by increasing frequency (rarest first); tie counts should be broken by alphabetical order of the category name.

## S-026 — Prefix-XOR Range Query

### 1

Given an array A of n nonnegative integers and q queries, each query gives two indices l and r; for each query output a single integer equal to A[l] XOR A[l+1] XOR ... XOR A[r] (inclusive).

### 2

You are given a sequence S of n 32-bit bitmasks and q inclusive queries (l, r); for each query print the resulting 32-bit parity mask obtained by XORing all S[i] with i in [l,r], as a nonnegative integer.

### 3

A row of n lamps has toggle records T[i] ∈ {0,1} (1 means toggled once); answer q queries each providing l and r by outputting 1 if the XOR of T[l..r] is 1 (odd toggles) and 0 otherwise.

### 4

A log of n transaction identifiers (nonnegative integers) is fixed; for q reports each giving l and r, produce the XOR of all identifiers in the inclusive range [l,r] as a decimal integer.

### 5

Given an array V of n integers and q queries each consisting of l, r and a mask m, output for each query the value m XOR V[l] XOR V[l+1] XOR ... XOR V[r] (inclusive).

## S-027 — Simple Subsequence Match

### 1

Given two strings P and T, determine whether P appears as a subsequence of T (characters in order, not necessarily contiguous). Output YES if P is a subsequence of T, otherwise NO.

### 2

You are given a command pattern C (a string) and a robot log L (a string); determine whether C can be read from L as a subsequence. If yes, output the 1-based indices in L of each matched command in order separated by spaces; otherwise output -1.

### 3

Given a sequence of integers A (pattern) and a longer sequence B (source), check whether A occurs as a subsequence of B. If A is a subsequence, output the index in B of the last matched element (1-based); if not, output 0.

### 4

Given a DNA motif P and a genomic string G, decide whether P is a subsequence of G. Output the smallest 1-based index in G where the first character of some valid subsequence match of P occurs, or -1 if no match exists.

### 5

Given a melody pattern M and a song S (each a sequence of note labels), determine whether M is a subsequence of S. If M is empty output 0; if matched, output the list of 1-based positions in S for each note of M (space-separated); otherwise output NO.

## S-028 — Canonical Rotation Equality

### 1

Given two equal-length lowercase strings A and B, decide whether B is a cyclic rotation of A (i.e., can be obtained by shifting A's characters circularly). Output YES if so, otherwise NO.

### 2

You are given two arrays of digits of the same length representing positions on a circular dial; determine whether the second array is a cyclic shift of the first. Print True if they match under some rotation, otherwise print False.

### 3

Two necklaces are encoded as equal-length sequences of color letters; determine whether one necklace can be rotated to match the other exactly (reflections are not allowed). Output 1 if they are rotations of each other, otherwise 0.

### 4

Given two schedules of the same length represented as sequences of uppercase task codes in circular order, decide if the second schedule is a rotation of the first. Answer Possible if a rotation makes them identical, otherwise Impossible.

### 5

You are given two equal-length sequences of small tokens (integers 0–9) representing a conveyor's circular layout at two times; determine whether the layouts differ only by a cyclic shift. Print yes if one is a rotation of the other, else print no.

## S-029 — Simple Histogram Rectangle Simulation

### 1

Given an array h of n non-negative integers (n ≤ 2000) representing heights of consecutive bars, compute the maximum area of any rectangle formed by contiguous bars; area = width (number of bars) × minimum height in that segment. Output the single integer maximum area.

### 2

Given an array h of n non-negative integers (n ≤ 2000) and an index k (0 ≤ k < n), compute the largest area of any contiguous rectangle that includes bar k; area = width × minimum height over the chosen segment. Output that area.

### 3

Given an array h of n non-negative integers (n ≤ 2000) and an integer w (1 ≤ w ≤ n), find the maximum area of any contiguous block of exactly w bars, where area = w × minimum height in that block. Output the maximum area.

### 4

Given an array h of n non-negative integers (n ≤ 2000) and a threshold T ≥ 0, count the number of contiguous segments (subarrays) whose minimum height is at least T. Output that count.

### 5

Given an array h of n non-negative integers (n ≤ 2000), for each index i (0 ≤ i < n) compute the maximum area of a contiguous rectangle for which bar i is the minimum-height bar (area = width × h[i]). Output n integers: the maximum area for each bar in order.

## S-030 — Lowest Unused Small Label

### 1

You are given a list of n integers representing used nonnegative tags; find the smallest nonnegative integer (starting at 0) that does not appear among the values in the range 0..n. Ignore any values outside 0..n and output that missing tag.

### 2

A stadium has seats numbered starting at 1. Given a list of n occupied seat numbers (integers, may repeat or lie outside the range), determine the smallest positive seat label in 1..n+1 that is unoccupied; ignore numbers outside 1..n+1 and print that seat number.

### 3

A vendor issues product codes beginning at 1000. Given n reported code numbers, find the smallest code in the inclusive range 1000..1000+n that does not occur in the list; ignore codes outside that range and output the missing code.

### 4

Given n reported firmware version numbers (integers) where versions start at 0, determine the smallest nonnegative version in 0..n that is not present in the list. Ignore duplicate entries and any values outside 0..n, then output that version number.

### 5

A conference assigns badge IDs starting from 1. Given a list of n assigned badge IDs (integers possibly repeated or out of bounds), find the smallest available badge ID within 1..n+1 that does not appear in the list; ignore values outside that interval and output the ID.

## S-031 — Postfix Expression Evaluation

### 1

Given a whitespace-delimited valid postfix expression of signed integer tokens and the binary operators +, -, *, and / (integer division), evaluate the expression and output the single integer left on the stack.

### 2

You are given a whitespace-delimited postfix stream of boolean tokens 'T' and 'F' and the binary operators AND and OR; evaluate the stream and output the final value as 'T' or 'F'.

### 3

Given a whitespace-delimited valid postfix program of signed integers and the binary operators +, -, *, and % (modulo), evaluate it using integer arithmetic and output the single integer result.

### 4

A supply-chain system receives a whitespace-delimited postfix sequence of nonnegative integer shipment sizes and the binary operators max and min; evaluate the sequence and output the final integer remaining.

### 5

Given a whitespace-delimited valid postfix expression of signed integers using the binary operators + and >, where '>' pops two values b then a and pushes 1 if a>b otherwise 0, evaluate the stream and output the single final integer token (computed integer or 0/1).

## S-032 — Merge Overlapping Intervals

### 1

You are given a list of meeting bookings as closed intervals [start, end] on a timeline; touching endpoints (end == next start) should be merged into a single meeting. Merge overlapping or touching bookings and output the minimal list of non-overlapping intervals sorted by start.

### 2

Given a list of IP address ranges represented as inclusive integer intervals [L,R], where touching ranges (R+1 == next L) are considered adjacent and should be merged, consolidate all overlapping or adjacent ranges and return the sorted list of merged ranges.

### 3

A sensor produces time windows as half-open intervals [start, end) in a single list; touching windows (end == next start) are not merged. Compute the union of the recorded windows and output the minimal sorted list of non-overlapping half-open intervals.

### 4

Given one list of booked seat segments on a row as real-valued intervals [a,b], treat touching intervals (b == next a) as merged into one segment; consolidate all overlaps and report the total covered length after merging.

### 5

You have a list of genomic coverage segments as intervals [s,e] (inclusive) in a single list; touching endpoints (e == next s) should not be merged. Merge overlapping segments and output the count of disjoint segments that remain.

## S-033 — Bijection Pattern Matching

### 1

Given a pattern string of letters (no spaces) and a sequence of whitespace-delimited words, decide whether each letter can be mapped bijectively to a distinct word so that following the pattern reproduces the sequence; output YES or NO.

### 2

Given two whitespace-separated sequences: a series of labels (e.g., A B A C) and a series of category names, determine whether there exists a one-to-one mapping from labels to categories consistent at every position; print Valid or Invalid.

### 3

You are given a template of numbered placeholders separated by spaces (e.g., p1 p2 p1) and a data line of space-separated tokens; determine whether there is an exact bijection between placeholders and tokens so the template expands to the data; output 1 for yes and 0 for no.

### 4

Given a short pattern of digit symbols separated by spaces and a longer space-delimited list of item names, check whether each symbol maps to exactly one item and each item maps to exactly one symbol across positions; print MATCH or NO MATCH.

### 5

Given a sequence of tag tokens (whitespace-delimited) and a sequence of log-field tokens (whitespace-delimited), decide whether a bidirectional one-to-one mapping from tags to fields exists that matches every position; output true or false.

## S-034 — Sorted Neighbor Minimum Gap

### 1

Given an array of n integers, find the minimum absolute difference between any two elements and output that integer.

### 2

You are given n timestamps (integers) in input order; find two distinct timestamps with the smallest absolute time gap and output their original 1-based indices separated by a space.

### 3

Given n player scores (integers), find two different players whose scores have the smallest absolute difference and print the two scores in nondecreasing order.

### 4

Given n integers, compute the minimum absolute difference between any pair and output two values: the minimum difference and the number of unordered pairs of elements that achieve this minimum.

### 5

Given an array of n integers, find a pair of indices (i<j) whose elements have the smallest absolute difference; if multiple pairs tie, output the lexicographically smallest index pair (i then j).

## S-035 — Undoable Command Stack

### 1

You are given a sequence of commands for a simple text editor: "TYPE c" appends character c to the end, and "UNDO" removes the most recently appended character that is still present. Process all commands and output the final text string.

### 2

A drawing program receives commands: "DRAW id" adds a stroke with identifier id on top, and "ERASE" removes the most recent still-present stroke. After executing all commands, output the remaining stroke identifiers from oldest to newest separated by spaces or print "EMPTY" if none.

### 3

A game log contains commands: "SCORE x" records gaining x points and "RETRACT" cancels the most recent not-yet-removed score event. After processing all commands, output the player's final total score as a single integer.

### 4

A browser records commands: "VISIT url" pushes a new page and "BACK" removes the most recently visited page (returning to the previous one). Given the command stream, output the current URL after all commands, or "HOME" if no page remains.

### 5

A shopping session has commands: "ADD item" puts an item into the cart and "REMOVE" undoes the most recent still-present add. After all commands, output the list of item names in the cart from earliest to latest, or output 0 if the cart is empty.

## G-001 — Longest Distinct Window

### 1

Given a string S of characters, find the length of the longest contiguous substring in which every character is distinct. Output the single integer length (0 if S is empty).

### 2

Given an array A of n integers representing customer IDs, identify the 1-based start and end indices of a longest contiguous subarray that contains no repeated ID; if multiple longest subarrays exist, return the leftmost pair. Output two integers: start end.

### 3

Given a sequence of color names C1..Cn, determine the longest contiguous block where all colors are distinct and return its length and the 0-based starting index of that block. Output two integers: length start (output 0 -1 for an empty sequence).

### 4

Given a list of string tokens events[ ] in order, find any longest contiguous subsequence with all tokens distinct and return its inclusive 0-based boundaries l and r. Output two integers l r, or -1 -1 if the list is empty.

### 5

Given an array of hexadecimal ID strings, compute the length of the longest contiguous segment consisting of pairwise distinct IDs. Output the single integer length (0 when the array is empty).

## G-002 — Minimum Covering Window

### 1

Given a string S and a required multiset of characters T (with counts for some letters), find the shortest substring of S that contains every character of T with at least the specified counts; output the start and end indices (1-based) or -1 if none exists.

### 2

You are given an array A of product IDs (integers) representing items scanned along a conveyor and a shopping list specified as a multiset of IDs with required multiplicities; return the inclusive indices of the smallest contiguous segment of A that fulfills the shopping list, or report that no such segment exists.

### 3

Given a chronological list of event tags E[1..n] and a target multiset of tags M (tags may repeat in M), determine the minimal-length time window (contiguous indices) that covers M's counts; output its length and start index, or indicate impossibility.

### 4

Given a DNA string D and a required nucleotide multiset Q (e.g., A:2, C:1, G:1), find the shortest contiguous subsequence of D that contains each nucleotide at least as many times as Q specifies; return the substring boundaries or -1 if absent.

### 5

Given a sequence of words W[1..n] from a document and a required keyword multiset K (certain keywords may be required multiple times), identify the smallest contiguous block of words containing K with required counts; output the 1-based start and end positions, or state that no block exists.

## G-003 — At-Most-K Distinct Window

### 1

You are given a sequence of color names arranged on a necklace and an integer k; find the length of the longest contiguous segment of beads that contains at most k distinct colors and output that length.

### 2

Given a chronological list of event tags (strings) and an integer k, count how many contiguous time windows (subarrays) have at most k distinct event types and output that count.

### 3

Given a DNA string of characters 'A','C','G','T' and an integer k, determine the maximum length of any contiguous substring that uses at most k distinct nucleotides and output that length.

### 4

You have an array of purchased product IDs (integers) in order and an integer k; compute the length of the longest contiguous run of purchases that involves at most k distinct product IDs and output that length.

### 5

Given a stream of emoji characters and an integer k, compute how many contiguous message segments contain at most k distinct emojis and output that count.

## G-004 — Exact-Sum Positive Window

### 1

You are given an array of n strictly positive integers and a target T; find any contiguous subarray whose elements sum exactly to T and output its 1-based start and end indices, or output -1 -1 if none exists.

### 2

Given an array of n strictly positive integers and a target T, count how many contiguous subarrays have sum exactly T and output that count.

### 3

Given an array of n strictly positive integers and a target T, determine the length of the shortest contiguous subarray whose sum equals T and output that length, or -1 if no such subarray exists.

### 4

You are given an ordered list of n strictly positive task durations and a target total time T; find the length of the longest contiguous block of tasks whose durations sum to exactly T and output that length, or 0 if none exists.

### 5

Given an array of n strictly positive coin values and a target T, list all 1-based starting indices of contiguous sequences that sum exactly to T in increasing order; output an empty list if there are none.

## G-005 — Prefix-Sum Target Count

### 1

Given an array of n signed integers representing daily coin gains and an integer K, count how many contiguous subarrays have sum exactly K and output that count as a single integer.

### 2

Given a sequence of n temperature changes, count how many contiguous periods have net temperature change equal to zero; output the total number of such periods.

### 3

Given a string of length n consisting of letters 'A' and 'B' and an integer T, treat A as +1 and B as -1 and count contiguous substrings whose total equals T; output the count.

### 4

Given an array of n signed integers representing elevation changes and an integer R, determine how many contiguous segments have total elevation change exactly R and output that number.

### 5

Given an array of n nonzero integers, treat each positive element as +1 and each negative element as -1; count the contiguous subarrays whose summed signs equal zero (equal counts of positives and negatives) and output the count.

## G-006 — Equal-Category Balance Range

### 1

Given an array of n bits (0 or 1), find the length of the longest contiguous subarray that contains an equal number of 0s and 1s. Output a single integer: the maximum length.

### 2

Given a string of n lowercase letters, treat vowels (a,e,i,o,u) as one category and consonants as the other; count the number of contiguous substrings where the number of vowels equals the number of consonants. Output a single integer: the count of such substrings.

### 3

Given a sequence of n goal events labeled 'A' or 'B' for two teams, find the earliest (leftmost) longest contiguous segment where team A and team B scored the same number of goals; output two 1-based indices l and r of that segment, or '-1 -1' if no non-empty balanced segment exists.

### 4

Given an array of n tokens colored 'R' or 'B', determine how many contiguous ranges have an equal number of red and blue tokens; output a single integer: the total number of such ranges.

### 5

Given an array of n integers each equal to +1 or -1 representing two types of items, find the length of the longest contiguous subarray whose sum is zero (equal counts of +1 and -1). Output a single integer: that maximum length.

## G-007 — Shortest Sum-At-Least Window

### 1

You are given a sequence of n positive integers representing tasks completed each day and an integer W; find the minimum number of consecutive days whose total tasks are at least W and output that minimum length, or 0 if no such window exists.

### 2

A factory records positive integers for produced widgets in each batch and provides a target Q; identify any shortest contiguous run of batches whose sum is at least Q and output the 1-based start and end batch indices, or -1 -1 if impossible.

### 3

Given minute-by-minute positive bandwidth measurements (n values) and a required transfer T, determine the shortest contiguous time interval whose total bandwidth is at least T and output its duration in minutes, or -1 if none exists.

### 4

A cyclist logs positive energy gains per minute over n minutes and needs to reach at least C energy; find any shortest contiguous segment whose sum is >= C and output the values of that segment in order, or output NONE if no such segment exists.

### 5

You have an array of n positive integers representing units assembled per shift and a quota M; compute the minimal length of a contiguous block of shifts whose total units meet or exceed M and, among all shortest blocks, output the 1-based index of its earliest starting shift and the length.

## G-008 — Bounded-Frequency Window

### 1

Given a string S and integer k, find the length of the longest contiguous substring in which every character appears at most k times. Output the maximum length.

### 2

You are given an array of product IDs and an integer k; find the 1-based start and end indices of the longest contiguous segment where no product ID occurs more than k times; if multiple longest segments exist, return the leftmost pair.

### 3

Given a chronological list of event types and a cap k, compute the maximum number of consecutive events such that each event type appears at most k times in that interval. Output that maximum count.

### 4

Given a sequence of colored bead labels and integer k, determine the maximum length of a contiguous subsequence in which each color appears no more than k times, and output how many distinct contiguous subsequences achieve this maximum length.

### 5

Given an array of sensor IDs and an integer k (k≥0), return the length of the longest contiguous window where each sensor ID occurs at most k times; treat k=0 as allowing only unique IDs in the window.

## G-009 — Window Replacement Budget

### 1

Given a string s of uppercase letters and an integer k, you may change up to k characters inside one contiguous substring so that every character in that substring becomes the same letter. Output the maximum possible length of such a substring.

### 2

You are given an array colors[1..n] of color IDs (integers) and a budget k of repaint operations; repainting a tile changes its color to any single chosen color and counts as one operation. Find any contiguous segment that can be made entirely one color using at most k repaints and output its 1-based start and end indices and the color ID used, maximizing the segment length.

### 3

Given a sequence of category names (strings) observed along a shelf and an integer k, you may relabel at most k items within one contiguous block to a single chosen category. Return the maximum length of a block that can be unified and also output which category achieves that maximum.

### 4

A binary string t of '0' and '1' represents a row of panels and you have k repaint moves, each flipping any single panel to either color; choose a contiguous stretch to repaint at most k panels so all panels in the stretch match. Output the longest length achievable.

### 5

Given a list ratings[1..n] where each entry is an integer rating class (bounded alphabet) and an integer k, you may change up to k entries inside one contiguous subarray to the same target rating. Determine and output the maximum length of a subarray that can be made uniform under that budget.

## G-010 — First True Boundary Search

### 1

Given a non-decreasing integer array A of length n (1 ≤ n ≤ 300000) and an integer T, find the smallest index i (0-based) such that A[i] ≥ T; output i or -1 if no such index exists.

### 2

You are given a boolean array B[0..n-1] that is false for a prefix and true for the remainder (monotone). Find the first index i where B[i] is true and output i, or output n if all entries are false.

### 3

A parking row has n numbered slots with an array S[1..n] where S[j]=0 means occupied and S[j]=1 means free, and once a slot is free every later slot is free as well (monotone). Find and output the 1-based index of the first free slot, or output 0 if none are free.

### 4

A sequence of test results P[0..n-1] is given where tests pass up to some point and then fail for the rest (P is true for a prefix, then false). Find the first index i where P[i] is false and output i, or -1 if all tests pass.

### 5

Given a non-decreasing list of strings L[0..n-1] and a query string s, determine the insertion position: the smallest index i (0..n) such that inserting s at i keeps L sorted (i.e., first element ≥ s). Output i.

## G-011 — Last True Boundary Search

### 1

Given a nondecreasing array A[0..n-1] of integers and a target X, find the largest index i (0-based) such that A[i] ≤ X. Output i, or -1 if no element satisfies the condition.

### 2

You are given a time-ordered server log S[0..n-1] of 0/1 values with the guarantee that S is monotone (a prefix of 1s then 0s). Find the last minute index i where the server was up (S[i]=1). Print i or -1 if it was never up.

### 3

Given a sorted list of release timestamps T[0..n-1] (in increasing order) and a deadline D, find and output the latest timestamp t from T with t ≤ D, or -1 if no such timestamp exists.

### 4

Given daily shipments W[0..n-1] (nonnegative) and a capacity C, find the largest day index i such that the prefix sum W[0]+...+W[i] ≤ C. Output i, or -1 if even the first day's shipment exceeds C.

### 5

An array H[0..n-1] of temperatures along a rod is nondecreasing. Given threshold K, determine the last position index i where H[i] ≤ K. Print i, or -1 if all positions exceed K.

## G-012 — Rotated Sorted Location

### 1

Given an array of n distinct integers formed by rotating a strictly increasing sequence exactly once and a target integer, determine whether the target appears in the array and return its zero-based index or -1 if absent.

### 2

You are given a rotated log of n unique ISO timestamps produced by a single rotation of an originally strictly increasing list; for a query timestamp output the index where it occurs, or -1 if it does not appear.

### 3

Given a list of n distinct lowercase words obtained by rotating a lexicographically strictly increasing dictionary once, decide whether a query word is present and print YES if found or NO otherwise.

### 4

Given an array of n distinct sensor readings (real numbers) that is a single rotation of a strictly increasing sequence, locate the specified reading and return its index, or return -1 if it is not in the array.

### 5

Given a rotated roster of n distinct employee IDs (integers) created by rotating an ascending sorted list exactly once and a query ID, return its zero-based index if present or output NOT FOUND if it does not appear.

## G-013 — Peak Position Search

### 1

Given an array of n integers h1..hn with hi != hi+1 for all i, treat endpoints as having only one neighbor; output any 1-based index i such that hi is strictly greater than its existing neighbor(s) (a local peak).

### 2

An array of n integers s1..sn is strictly increasing up to a single peak and then strictly decreasing (strict unimodal). Output the 1-based index of the unique maximum element.

### 3

A sequence of sensor readings r1..rn satisfies ri != ri+1 and values outside the array are treated as -infinity. Find and output any 1-based position i for which ri > r{i-1} and ri > r{i+1} (local peak under virtual -infinity boundaries).

### 4

Given player scores p1..pn where adjacent scores always differ, output the 1-based index and the score value of any player i such that pi > p{i-1} and pi > p{i+1}; endpoints need only beat their single neighbor to qualify.

### 5

An audio sample array a1..an has ai != ai+1 for every adjacent pair and contains at least one local maximum. Return any 1-based index i for which ai > a{i-1} and ai > a{i+1}, treating missing neighbors at ends as absent (endpoint must only exceed its sole neighbor).

## G-014 — Search in Monotone Matrix

### 1

Given an m×n integer treasure map where each row and each column is nondecreasing and a target value T, decide whether T appears in the map; output YES or NO.

### 2

You are given an r×c sensor matrix of integers that is nondecreasing left-to-right in every row and top-to-bottom in every column, and a target temperature t that is guaranteed to occur at most once; return the 1-based row and column of t if present, or -1 -1 if absent.

### 3

A warehouse price table is an m×n matrix of integers with nondecreasing rows and columns; a queried price p is promised to appear at most once. Output 1 if p is present in the table and 0 otherwise.

### 4

Given an elevation matrix H (rows and columns nondecreasing, values may repeat) and a target elevation e, find any coordinates of e if it exists; output a pair of 0-based indices (row column) or the word none if e is not present.

### 5

Given an m×n product-rating grid where every row and every column is nondecreasing and a rating q, determine whether q occurs in the grid; if m=0 or n=0 treat the grid as empty and report Not Found.

## G-015 — Next Greater Element

### 1

Given an array A[0..n-1] of integers, for each index i find the smallest index j>i such that A[j] is strictly greater than A[i]; output an array of length n containing j for each i or -1 if no such j exists.

### 2

Given a list T[0..n-1] of daily temperatures, for each day i output the number of days you must wait (j-i) until a strictly warmer day j>i; output 0 if there is no future warmer day.

### 3

Given a sequence P[0..n-1] of stock closing prices, produce an array where for each day i you report the next later day j>i with P[j]>P[i] and output j–i as the wait in days, or -1 if no such day exists.

### 4

Given an array V[0..n-1] of integers arranged circularly, for each position i find the minimum positive offset d (1≤d<n) so that V[(i+d) mod n] is strictly greater than V[i]; output d or -1 if no greater element exists anywhere around the circle.

### 5

Given heights H[0..n-1] of buildings along a street, for each building i return the index of the first building j>i that is strictly taller than H[i], or return -1 when none exists; output the resulting index array.

## G-016 — Previous Smaller Boundary

### 1

Given an array A of n integers, for each position i (1≤i≤n) output the index j (1-based) of the nearest earlier element with A[j] < A[i], or 0 if none exists.

### 2

Given daily stock prices P1..Pn, for each day i compute the span length i - j where j is the largest index < i with P[j] < P[i]; if no such j exists, output i.

### 3

You are given elevations E1..En along a trail; for each position i output the distance i - j to the nearest earlier position j with E[j] < E[i], or -1 if none exists.

### 4

Along a boulevard there are n lamps with intensities L1..Ln; for each lamp i return the index (1-based) of the nearest previous lamp j with L[j] < L[i] that acts as its backward blocker, or 0 if none.

### 5

Given a sequence S1..Sn, for each i output the value of the nearest earlier element S[j] that is strictly smaller than S[i], or -1 if no such earlier element exists.

## G-017 — Daily Span Accumulation

### 1

Given an array of n daily stock prices, for each day i compute the number of consecutive days ending at i (including i) such that every price in that span is <= price[i]; output the span length for every i in order.

### 2

You are given n daily rainfall totals; for each day i output the length of the longest contiguous streak ending at i where every day's rainfall is >= rainfall[i], i.e., how many consecutive days up to i have rainfall not less than today.

### 3

Given a sequence of n contest scores, for each position i determine the length of the longest contiguous suffix ending at i that is non-increasing (each element in the suffix is >= its successor); output that length for every i.

### 4

Given n daily sales figures, for each day i compute how many consecutive days ending at i (including i) have sales strictly less than sales[i]; produce the span length for each day in sequence.

### 5

Given an array of n building heights from left to right, for each building i output the number of consecutive buildings ending at i (to the left up to i) whose heights are <= height[i], i.e., the maximal contiguous visible run ending at i.

## G-018 — Streaming Kth Extreme

### 1

You are given n numeric scores arriving sequentially and a fixed integer k. After each arrival, report the current k-th largest score among all scores seen so far; if fewer than k scores have arrived, output NONE. Return n outputs in order of arrivals.

### 2

A server emits n latency measurements in arrival order, together with fixed integers k and threshold T. After each measurement print YES if at least k of the recorded latencies are ≤ T, otherwise print NO (treat prefixes with fewer than k readings as NO).

### 3

A stream of n stock prices (real numbers) arrives one by one and a fixed k is provided. After each price arrives, output the current k-th highest price observed so far, or NA if fewer than k prices have been seen.

### 4

n temperature sensor readings come in sequence and you are given a fixed k. For every prefix after each new reading, output the k-th smallest reading among all received values; if the prefix length is less than k print -1. Provide n outputs in order.

### 5

A bidding system receives n bids in chronological order and a fixed integer k. After each incoming bid output the value of the k-th largest bid among bids so far; if there are fewer than k bids output 0.

## G-019 — Merge-K Ordered Heads

### 1

You are given k static sorted integer arrays. Merge them into one nondecreasing sequence and output the full merged list of values in order, advancing sources until all are exhausted.

### 2

There are k sensors each producing a sorted list of integer timestamps. Produce the chronological stream of all events as pairs (timestamp, sensor_id) in nondecreasing timestamp order; when timestamps tie, list the smaller sensor_id first.

### 3

Each of k log files is a static, sorted list of entries (timestamp, message). Merge them into a single log ordered by timestamp and output the entries in order, breaking timestamp ties by source id while preserving per-source relative ordering.

### 4

You are given k sorted integer sequences and an integer M. Output the first M elements of the global nondecreasing merge of all sequences (or all elements if the total is less than M), reporting each element in merge order with its originating source id.

### 5

k sorted lists of integers are provided. Produce the merged nondecreasing sequence but collapse consecutive equal values in the output: for each run output a pair (value, count) where count is how many original items from the sources contributed to that consecutive run, until all sources are exhausted.

## G-020 — Minimum Resources for Intervals

### 1

You are given n meeting requests as pairs (start, end) with integer times and the convention that intervals are half-open [start, end) (a meeting ending at t frees the room for another starting at t); each room holds at most one meeting at a time. Compute the minimum number of conference rooms required to schedule all meetings; output a single integer. (n up to 200000.)

### 2

A server receives n streaming requests described by integer start and end times; channels are unit-capacity and intervals are inclusive [start, end] so a request ending at t still occupies a channel at time t. Determine the maximum number of channels simultaneously in use (the minimum channels needed overall) and output that number. (n up to 200000.)

### 3

There are n flights with arrival and departure times (integers). A gate is occupied from arrival time up to but not including departure time, i.e., [arrival, departure), and each gate serves at most one flight at a time. Output the smallest number of gates required so no two occupying flights share a gate. (n up to 200000.)

### 4

Given n customer chat sessions as integer (start, end) timestamps where sessions are inclusive at start and exclusive at end ([start, end)), and each agent handles one session at a time, compute the peak number of simultaneous active sessions (the minimum agents required) and print that integer. (n up to 200000.)

### 5

You have n EV charging bookings, each a pair of integer start and end times; bookings are treated as closed intervals [start, end] (touching endpoints count as overlapping) and each charger can serve one car at a time. Find and output the minimum number of chargers needed to satisfy all bookings. (n up to 200000.)

## G-021 — Deadline Profit Selection

### 1

You have n flowering tasks; each task takes 1 day and is described by an integer deadline d_i (last day it may be planted) and a beauty value v_i. At most one planting can occur per day. Choose a subset and schedule them so every chosen task finishes by its deadline and the sum of beauty values is maximized. Output the maximum total beauty.

### 2

There are n delivery requests, each requires one time slot and has an integer deadline d_i and tip a_i if delivered by that deadline. You may perform at most one delivery per slot; select deliveries to maximize total tips collected. Output the maximum total tip.

### 3

Given n student submissions where each submission takes one day and has an integer deadline d_i, schedule at most one submission per day so that as many submissions as possible are completed by their deadlines. Output the maximum number of submissions you can finish.

### 4

You manage n backup jobs; each job takes one hour and has a deadline d_i and a saved-cost s_i if completed on or before that deadline. The server runs one backup per hour; pick a feasible subset to maximize total saved-cost. Output the maximum total saved-cost.

### 5

There are n audition slots requested, each is a unit-length rehearsal with integer deadline d_i and an importance score p_i. You may hold at most one rehearsal per time slot; select rehearsals to both meet deadlines and maximize the number of rehearsals selected. Output any set of indices of auditions that achieves the maximum possible count.

## G-022 — Minimum Jump Frontier

### 1

Given an array A of n non-negative integers where A[i] is the maximum forward index reachable from i (you may move from i to any j with i < j ≤ i+A[i]), compute the minimum number of jumps required to reach index n-1 from index 0. Guarantee the end is reachable and output the minimum jump count.

### 2

There are n radio towers in a line; tower i can directly pass a packet to any tower j with i < j ≤ i+R[i], where R[i] are non-negative integers. Find the minimum number of relay transmissions to deliver a message from tower 0 to tower n−1; if delivery is impossible, output -1.

### 3

A hiker visits n checkpoints numbered 0..n−1; at checkpoint i the hiker can move forward up to S[i] checkpoints ahead (S[i] ≥ 0). Compute the minimum number of moves (resupplies) required to reach checkpoint n−1 from 0 and output that count; assume reachability unless stated otherwise.

### 4

A spaceship travels through n warp gates; activating gate i teleports you forward by any distance from 1 up to W[i] gates (W[i] ≥ 1), landing at a later gate index. Determine the minimum number of warp activations needed to arrive at the last gate n−1; if unreachable, print -1.

### 5

A sequence of n relay nodes has energy values E[0..n−1] where using node i allows a packet to hop forward up to E[i] nodes (from i to any j with i < j ≤ i+E[i]). Starting at node 0, compute the minimum number of hops to reach node n−1 and output that number; return -1 if the last node cannot be reached.

## G-023 — Partition Labels

### 1

Given a string of lowercase letters representing stickers in order, split it into the maximum number of contiguous parts such that each letter appears in at most one part; output the lengths of the parts in order.

### 2

You are given an array of color names describing beads on a necklace from left to right; partition the array into as many contiguous segments as possible so that every color occurs in only one segment, and return the 1-based start and end indices for each segment.

### 3

A sequence of project tags (strings) is recorded for successive commits; divide the sequence into the largest possible number of contiguous intervals so that no tag appears in more than one interval, and output the sizes of these intervals.

### 4

Given a row of numbered stickers where each sticker shows a short label, split the row into the maximum number of contiguous strips so each label is contained entirely within a single strip; return the list of inclusive index pairs for the strips.

### 5

You have a list of flag colors along a fence in order; partition the list into as many contiguous blocks as possible so that each color appears in only one block, and output the lengths of the blocks from left to right.

## G-024 — Subset Sum with Tiny Candidate Set

### 1

You have n (1 ≤ n ≤ 22) gem values g1..gn (positive integers) and a target T; decide whether any subset of gems has sum exactly T and output whether such a subset exists.

### 2

Given n (≤22) item weights w1..wn and a target capacity T, return indices of any non-empty subset whose total weight equals T, or output -1 if no such subset exists.

### 3

You are given n (≤20) positive integers s1..sn and a target product P (P ≤ 10^9); determine whether there exists a subset whose product equals P and, if so, output one subset of indices achieving P (otherwise indicate impossibility).

### 4

Given n (≤22) distinct artifact values a1..an and two integers k and T, find a subset of exactly k artifacts whose sum equals T; output their indices or NONE if no such k-sized subset exists.

### 5

You have n (≤22) numbered stones with positive weights v1..vn and a required load C; construct a subset whose sum is at least C and minimal among all sums ≥ C, output the subset indices or IMPOSSIBLE if no subset reaches C.

## G-025 — Permutation Generation with Constraints

### 1

Given n distinct beads (n ≤ 8), each bead carries a color label; generate all linear arrangements of the beads such that no two adjacent beads share the same color and output every valid ordering.

### 2

Given n distinct guests (n ≤ 8) and the name of one guest who must occupy the first seat, produce all seating permutations with that guest fixed at position one and list every valid seating order.

### 3

Given n distinct tasks (n ≤ 8) where each task is marked either heavy or light, generate all permutations in which every heavy task appears at an even position (2,4,...) and output all valid sequences.

### 4

Given n distinct books (n ≤ 8), each tagged with a genre, produce all shelf orderings where no two adjacent books have the same genre and output every valid permutation.

### 5

Given n distinct numbered tiles (n ≤ 8) labeled with integers, list all permutations such that the absolute difference between numbers on any two adjacent tiles is not equal to 1, and output all valid orders.

## G-026 — Bounded Combination Enumeration

### 1

You are given n treasure chests numbered 1..n with integer weights, and two integers k and T; enumerate all k-sized subsets of chest indices whose weights sum exactly to T. Output each combination as increasing indices on its own line, listing combinations in lexicographic order.

### 2

Given a row of n seats labeled 1..n and an integer k, enumerate every way to choose k distinct seat indices such that no two chosen seats are adjacent. Print each valid selection as an increasing list of indices on a separate line, ordered lexicographically.

### 3

Given n dishes with calorie values and integers k and Cmax, list all k-sized sets of dish indices whose total calories are at most Cmax. Output each valid combination as increasing indices, one per line, in lexicographic order.

### 4

Given a sequence of n beads indexed 1..n and an integer k, enumerate all k-sized index subsets that form an arithmetic progression (equal spacing between consecutive indices). Output each progression as increasing indices, one per line, sorted lexicographically.

### 5

Given a list of n integers and an integer k, enumerate all k-sized subsets of indices whose selected values sum to a prime number. Output each valid combination as increasing indices on its own line, with combinations listed in lexicographic order.

## G-027 — Fast GCD Aggregate

### 1

Given n positive integers representing cable lengths, find the largest integer d>0 such that every length is divisible by d and output d.

### 2

You are given n rectangles by integer widths and heights; determine the largest integer s>0 such that for every rectangle both width and height are multiples of s (the side of a square tile) and output s.

### 3

Given n positive integers denoting loop durations in milliseconds, compute the greatest beat unit t>0 that evenly divides every duration and output t.

### 4

Given n pairs of positive integers (a_i,b_i), reduce each pair to lowest terms by dividing by gcd(a_i,b_i) producing (x_i,y_i); compute and output the gcd of all x_i.

### 5

Given n timestamps as positive integers, find the largest integer t>0 that divides every difference between timestamps (i.e., t divides all a_i - a_j) and output t.

## G-028 — Prime Factor Exponent Summary

### 1

Given n integers a1,...,an (1 ≤ n ≤ 10000, 1 ≤ ai ≤ 10^6), compute the total number of distinct prime factors that divide at least one ai and output that count.

### 2

Given n integers a1,...,an (1 ≤ n ≤ 10000, 1 ≤ ai ≤ 10^6), determine whether the product a1*a2*...*an is squarefree (no prime has total exponent > 1); output YES if it is squarefree and NO otherwise.

### 3

Given n integers a1,...,an (1 ≤ n ≤ 10000, 1 ≤ ai ≤ 10^6), count the number of unordered pairs (i,j) with i<j such that gcd(ai,aj)>1 (they share at least one prime factor) and output that count.

### 4

Given n integers a1,...,an (1 ≤ n ≤ 10000, 1 ≤ ai ≤ 10^6), for each prime p dividing any ai consider the sum of p's exponents across all ai; output the number of primes whose total exponent is odd.

### 5

Given n integers a1,...,an and an integer k (1 ≤ n ≤ 10000, 1 ≤ ai ≤ 10^6, 1 ≤ k ≤ n), count how many distinct primes p divide at least k different ai, and output that count.

## G-029 — Bitmask Feature Union

### 1

Given a universe of at most 30 flags numbered 0..m-1 and n devices each represented by an integer bitmask, answer q queries: for each required mask R, output YES if there exists a device whose mask contains all bits of R (device_mask & R == R), otherwise NO.

### 2

Given at most 30 permission flags (indices 0..m-1) and an array of n user permission masks, find the smallest prefix length L such that the bitwise OR of the first L masks has every flag set; output L or -1 if no prefix achieves full coverage.

### 3

Given at most 30 product feature flags and n variants each with a mask, compute the flags common to all variants (the bitwise AND of all masks) and output the list of indices of flags that remain set, or an empty list if none.

### 4

Given at most 30 flags and n items each with a mask, plus a target mask T, determine whether there exist two distinct items i≠j whose bitwise OR equals T; if yes, output any such pair of indices, otherwise output -1.

### 5

Given at most 30 capability flags, n modules each with a mask, and a base mask B, count how many distinct masks can be produced by ORing B with exactly one module (values of B | module_mask) and output that count.

## G-030 — Single-Odd XOR Witness

### 1

Given an array of n integer device IDs where every ID appears an even number of times except exactly one ID that appears an odd number of times, find and output that odd-occurring ID.

### 2

You are handed n 32-bit packet checksums; every checksum occurs in identical pairs except a single checksum with odd multiplicity — print the checksum value that appears an odd number of times.

### 3

A list of n bead colors is given as integers for a bracelet; every color appears in pairs except one color that appears an odd number of times. Output the integer for that lone color.

### 4

A log contains n user tokens (integers). All tokens appear an even number of times due to paired events except exactly one token seen an odd number of times; report that unmatched token value.

### 5

Given n integers representing chip serial numbers where every serial repeats an even number of times except one serial with odd frequency, output that serial number.

## G-031 — Cyclic Shift by Reversal

### 1

Given an array of n integers and a nonnegative integer k, perform a left cyclic shift by k positions (each element moves k places to the left modulo n) and output the sequence after the shift; treat k possibly larger than n and preserve empty-array behavior.

### 2

You are given a circular table seating as a list of n distinct names and an integer k; rotate the seating clockwise by k seats (each person moves k positions clockwise) and output the new seating order starting from the same input index.

### 3

Given a sentence of n space-separated words and an integer k, perform a right cyclic shift of the words by k and print the resulting sentence as a single line; k may exceed n.

### 4

Given an array of n bytes and an integer k that may be negative, apply a cyclic rotation by k positions (positive k means right shift, negative means left) and output the resulting byte sequence in order.

### 5

Given n labeled checkpoints along a circular route (labels in input order) and an offset k, relabel the route by shifting every label forward by k positions modulo n and output the labels in the original index order after this single cyclic relabeling.

## G-032 — Product-Except-Self Scan

### 1

Given an array A of n integers and an integer M, produce an array B of length n where B[i] is the product of all A[j] for j ≠ i, computed modulo M; output B[0..n-1].

### 2

Given a list S of n nonempty strings, produce an array T where T[i] is the concatenation of all S[j] for j ≠ i in their original order; return T[0..n-1].

### 3

You are given n positive integers representing gear strengths and a prime modulus P; for each gear i output the product of strengths of all other gears modulo P, producing an array of n residues.

### 4

Given an array A of n small positive integers (1 ≤ A[i] ≤ 10) with n ≤ 200000, output for each index i the 64-bit integer equal to the product of all A[j] for j ≠ i; return the list of n products.

### 5

Given n 2×2 integer matrices and a modulus M, compute for each index i the matrix product (left-to-right) of all matrices except the i-th, with all entries taken modulo M; output the n resulting 2×2 matrices.

## G-033 — Circular Maximum Fixed-Length Sum

### 1

Given n daily profit integers in circular order and an integer k (1≤k≤n), find the maximum total profit obtainable from any contiguous block of exactly k days where blocks may wrap from day n to day 1. Output the maximum sum.

### 2

There are n players seated around a circle with integer skill values and an integer k (1≤k≤n); choose exactly k adjacent players (wrapping allowed) to form a rotating team. Output any 1-based starting seat index that achieves the maximum total skill and the corresponding total skill.

### 3

A circular necklace has n beads with integer beauty values; given k (1≤k≤n), pick exactly k consecutive beads (wraparound permitted) whose sum of beauty is minimal. Output that minimum sum.

### 4

n rainfall sensors placed around a circular field report integer amounts and you are given k (1≤k≤n); find the contiguous block of exactly k sensors (wrap allowed) with the largest total rainfall. Output the 1-based index of the first sensor of one optimal block and the total rainfall measured.

### 5

A circular game board has n cells with integer scores and an integer k (1≤k≤n); choose exactly k consecutive cells (a single wraparound permitted) to maximize the collected score. Output the maximum possible collected score.

## G-034 — Fixed-Length Maximum Window

### 1

Given n integers representing power readings over time and an integer k, find the maximum total power recorded in any contiguous block of exactly k readings. Output that maximum sum.

### 2

Given n integers of daily web requests and an integer k, compute the largest average requests over any contiguous k-day window and output that maximum average as a decimal value.

### 3

You are given n integers of toll costs per mile along a highway and an integer k; determine the minimum total toll for any contiguous segment of exactly k miles. Output that minimum sum.

### 4

Given n integers of hourly net profit and an integer k, find a contiguous block of exactly k hours that yields the highest net profit and output the 1-based start index of that block (if multiple blocks tie, output the smallest start index).

### 5

Given n integers representing quantities of grain in consecutive barns and an integer k, choose k adjacent barns to maximize total grain; output the maximum total and the 1-based start and end indices of one optimal block.

## G-035 — Target-Pair Count Below Threshold

### 1

Given an array of n integers representing package weights and an integer W, count the number of unordered index pairs (i<j) whose weights sum to strictly less than W and output that count.

### 2

You are given n integers for cable lengths and an integer L; compute how many unordered pairs of distinct indices have combined length strictly greater than L and print the count.

### 3

Given n antenna power readings and a threshold T, determine the number of unordered index pairs whose power sum is at most T (<= T); output the total count.

### 4

Given n battery capacities and a target M, count how many unordered pairs of distinct positions have combined capacity greater than or equal to M and return that count.

### 5

Given an array of n coin values and a limit S, compute the number of unordered index pairs whose values sum strictly below S and output the resulting count.

## G-036 — Floyd Duplicate Witness

### 1

Given an array A of length n (2≤n≤300000) where every element A[i] is an integer in 1..n-1 and exactly one value occurs twice while all others occur once, interpret A as next-pointer indices and output the duplicated value.

### 2

You are given a list P[1..n] of station targets with each P[i] in the range 1..n-1; exactly one station id appears twice and the rest are unique. Treat P as next pointers (i→P[i]) and report the repeated station id.

### 3

An array passport[1..n] contains passport numbers, each between 1 and n-1, and exactly one passport number appears twice. Viewing passport as a functional mapping (index → passport[index]), determine and print the duplicated passport number.

### 4

There are n teleport rooms and an array T[1..n] maps room i to room T[i] with all T[i] in 1..n-1; exactly one target room number occurs twice while the others are unique. Find and output that duplicated room number.

### 5

Given Links[1..n] where each Links[i] is an integer in {1,…,n-1} and exactly one node id is repeated while all other ids appear once, interpret Links as next pointers and return the duplicated node id.

## G-037 — Asteroid Collision Reduction

### 1

You are given an array of n signed integers representing asteroids in left-to-right order where a positive value moves right and a negative value moves left and the absolute value is size; when a right-moving and left-moving asteroid meet the larger-size asteroid survives with its direction and equal sizes both vanish. Resolve all collisions and output the list of surviving signed integers in left-to-right order.

### 2

Given a sequence of n signed integers for robots placed left-to-right: sign encodes direction (positive right, negative left) and absolute value is strength. Robots only collide when a right-moving robot meets a left-moving one; the weaker robot is destroyed and equal strengths annihilate. After all collisions, output the number of robots remaining.

### 3

Given a list of signed tokens in order where sign is direction (positive →, negative ←) and absolute value is token value; when adjacent opposite-direction tokens collide the one with larger value survives unchanged and equal values both disappear. After resolving every possible collision, output the sum of absolute values of the surviving tokens.

### 4

An array of n signed integers denotes ships along a line (left-to-right), sign for direction and absolute value for shield units; when a right-moving ship encounters a left-moving ship they fight: the survivor is the one with greater shield but its shield is reduced by the opponent's shield, and equal shields destroy both. Process collisions until no opposing neighbors remain and output the final sequence of signed integers showing each surviving ship's direction and remaining shield in left-to-right order.

### 5

You have n packages in order represented by signed integers: sign = travel direction (positive right, negative left), absolute value = mass. Only adjacent opposite-direction packages collide; on collision the heavier package survives with its direction and equal masses remove both. After fully resolving collisions, output the original 1-based indices of the packages that survive, listed in increasing order.

## G-038 — Generate Balanced Delimiter Strings

### 1

Given an integer n (1 ≤ n ≤ 9), generate every distinct well-formed string made of n pairs of parentheses '(' and ')' (no prefix may have more ')' than '('). Output all valid strings in lexicographic order.

### 2

Given an integer n (1 ≤ n ≤ 9), produce all correctly nested sequences consisting of n pairs of curly braces '{' and '}' (every opening must be matched and prefixes must remain valid). Return the complete list of sequences sorted lexicographically.

### 3

Given an integer n (1 ≤ n ≤ 9), list every valid command sequence formed by n 'BEGIN' tokens and n matching 'END' tokens where commands nest properly (an 'END' never appears without a matching earlier 'BEGIN'). Output each sequence as space-separated tokens, ordered lexicographically.

### 4

Given an integer n (1 ≤ n ≤ 9), generate all balanced angle-bracket strings using n pairs of '<' and '>' where each opener is matched by a closer and prefixes remain valid. Output the full set of strings in increasing lexicographic (string) order.

### 5

Given an integer n (1 ≤ n ≤ 9), generate every well-formed sequence of n pairs using 'A' as an opener and 'a' as its closer (no prefix may have more 'a' than 'A'). Output all strings grouped by their maximum nesting depth from smallest to largest, with sequences within each group in lexicographic order.

## G-039 — Largest Concatenated Number Ordering

### 1

You are given n nonnegative integers presented as decimal strings; reorder them so that their concatenation is the largest possible decimal number and output that concatenated string.

### 2

A list of n nonnegative integer tokens (as strings) is displayed; output a permutation of their 1-based indices such that concatenating the tokens in that index order yields the lexicographically largest possible code string.

### 3

Given n nonnegative integer segments (strings), reorder them to form the smallest possible concatenated decimal number that does not begin with a '0'; output the resulting concatenated string (or a single '0' if every segment is "0").

### 4

A set of n nonnegative integer labels (strings) must be arranged on a banner; output the labels in the order (space-separated) that produces the maximum possible concatenated display number.

### 5

Provided with n nonnegative numeric fragments as strings, choose an ordering that produces the lexicographically smallest concatenated string and output that concatenation.

## G-040 — Grid Word Trace

### 1

Given an R×C grid of lowercase letters (R×C ≤ 100) and a target word of length ≤ 15, determine whether the letters of the word can be traced by starting at some cell and moving to orthogonally adjacent cells without reusing a cell; output YES if such a trace exists and NO otherwise.

### 2

You are given a small grid (≤100 cells) of single-character robot commands and a target command sequence (length ≤15). Decide whether you can follow the sequence by stepping from a start cell through orthogonally adjacent cells without revisiting a cell; if possible output two integers for any valid start cell (row and column), otherwise output -1 -1.

### 3

Given an R×C numeric grid (digits 0–9, total cells ≤100) and a short digit pattern (length ≤15), check whether the pattern can be read by a path of orthogonally adjacent cells without repeating a cell; if a path exists output the list of its cell coordinates in order, otherwise output NONE.

### 4

A treasure map is an R×C grid of symbols (total cells ≤100) and you are given a symbol sequence (length ≤15). Determine if the sequence can be collected by moving orthogonally from one map cell to adjacent cells without revisiting any cell; output FOUND and any corresponding path of positions if possible, or NOT FOUND.

### 5

Given a grid of DNA bases (A,C,G,T) with at most 100 cells and a target base sequence of length at most 15, decide whether the sequence can be traced step-by-step using orthogonal moves without reusing cells; if a trace exists output IMPOSSIBLE/possible as a single token (POSSIBLE or IMPOSSIBLE) accordingly.

## P-001 — Binary-Search Minimum Capacity

### 1

Given a sequence of n nonnegative package weights in fixed order and an integer k, split the sequence into at most k contiguous truck loads so that the maximum total weight assigned to any truck is minimized; output that minimal truck capacity as an integer.

### 2

A book has n chapters with nonnegative page counts listed in order and must be bound into m contiguous volumes; determine the smallest integer X such that the chapters can be partitioned into at most m contiguous groups with each group's total pages ≤ X, and output X.

### 3

You are given n sequential batch jobs with nonnegative runtimes and a number d of days; divide the jobs into at most d contiguous daily schedules so the largest total runtime on any day is minimized—return that minimal daily capacity.

### 4

Given n ordered video segments with nonnegative sizes and an integer k, partition them into at most k contiguous streaming blocks so that the maximum block size is as small as possible; output that minimal block capacity.

### 5

A playlist lists n songs with nonnegative durations in fixed order and must be burned onto at most k contiguous discs; find and output the minimum integer disc length so every disc contains a contiguous run of songs whose sum does not exceed that length.

## P-002 — Binary-Search Maximum Minimum Spacing

### 1

Given N distinct integer coordinates of houses along a street and an integer C, choose exactly C houses to install Wi-Fi routers so that the minimum distance between any two routers is maximized; output that maximum minimum distance.

### 2

You are given N kilometer markers (integer positions) on a straight highway and an integer M. Place exactly M charging kiosks at those markers to maximize the smallest gap between any two kiosks; output the optimal minimum gap.

### 3

Given N available seat positions (integer offsets) on a single long bench and an integer S, select exactly S seats to seat guests so that the minimum pairwise distance is as large as possible; output that distance.

### 4

Provided N integer coordinates of inspection points along a pipeline and an integer P, install exactly P sensors at these points to maximize the minimum distance between any two sensors; output the maximum achievable minimum separation.

### 5

Given N integer positions of wooden posts along a coastline and an integer T, choose exactly T posts to place radar beacons so that the smallest distance between chosen beacons is maximized; output that maximum minimum distance.

## P-003 — Binary-Search Earliest Completion Rate

### 1

Given n piles of bananas with positive integer sizes a1..an and an integer deadline H, a single eater works at an integer speed k bananas per hour and takes ceil(ai/k) hours to finish pile i independently. Find the minimum integer k >= 1 so the total hours to eat all piles is <= H. Output that integer k.

### 2

You are given n file sizes s1..sn (positive integers) and a time limit T. A single download connection transfers at an integer rate r MB/s and each file takes ceil(si/r) seconds independently. Determine the smallest integer r >= 1 such that the sum of download times <= T; output r.

### 3

There are n crates with item counts c1..cn and a single inspector scans items at an integer rate v items/minute; inspecting crate i requires ceil(ci/v) minutes independently. Given a deadline M, compute the minimum integer v >= 1 so the total inspection time is <= M and return that value.

### 4

Given lengths L1..Ln of fence boards and a single painter who paints at an integer speed p length-units/hour, painting board i takes ceil(Li/p) hours independently. Given total allowed time H, find the smallest integer p >= 1 so the sum of times <= H and output p.

### 5

You have n booklets with page counts p1..pn and one printer printing at an integer pace s pages/minute; each booklet takes ceil(pi/s) minutes independently. Given a deadline D, determine the minimum integer s >= 1 for which the total printing time is <= D and output s.

## P-004 — Partition Array Minimax DP-Free

### 1

Given an array of nonnegative integers representing lecture durations in order and an integer k, split the lectures into exactly k contiguous days; output the minimum possible value of the largest total minutes assigned to any day.

### 2

You have n chapters with nonnegative page counts in sequence and an integer K: partition them into at most K contiguous volumes; output the smallest possible maximum pages in a single volume.

### 3

Given an ordered list of nonnegative log sizes and a target number k, divide the list into exactly k contiguous shards so that the largest shard size is minimized; output that minimal largest shard size.

### 4

An ordered sequence of nonnegative job loads must be assigned in contiguous blocks to at most m servers; compute the minimum achievable maximum load on any server.

### 5

A video is represented by consecutive segment bit-sizes (nonnegative); you must cut it into exactly t contiguous clips—return the minimal possible maximum total bits in any clip.

## P-005 — Shortest Path with One Wall Break

### 1

Given an n×m grid of characters '0' (open) and '1' (wall) with n·m ≤ 200000 and start cell (r1,c1) and goal (r2,c2), find the minimum number of orthogonal steps to reach the goal from the start when you may traverse at most one wall cell by using a single wall-break; if the start or goal is a wall you may use the break there. Output the minimum steps or -1 if unreachable.

### 2

Given an n×m grid (n·m ≤ 200000) with '.' open servers and '#' firewalled servers, and given start and target coordinates, compute the shortest number of orthogonal hops to reach the target when you possess one firewall-override token that permits passing through a single '#' cell at most once; using it on the start or target cell is allowed. Output the minimal hops or -1.

### 3

Given an n×m map (n·m ≤ 200000) with '.' empty cells and 'D' locked doors, and given start and treasure coordinates, return the minimum orthogonal steps to reach the treasure from the start when you have a single key that can be consumed to enter at most one 'D' cell (you may use the key on the start or treasure cell). Output the minimal steps or -1.

### 4

Given an n×m grid (n·m ≤ 200000) where 'O' denotes open road and 'T' denotes a toll gate, and given start and destination positions, find the fewest orthogonal moves to reach the destination if you hold a single-use coupon allowing you to pass through one 'T' cell; passing through the start or destination toll is permitted by consuming the coupon. Output the minimum moves or -1.

### 5

Given an n×m field (n·m ≤ 200000) marked with '.' free ground and 'X' boulders, and start and finish coordinates, determine the minimum number of orthogonal steps to reach the finish if you are allowed to clear and step into at most one 'X' cell (you may clear an 'X' at the start or finish). Output the minimum steps or -1.

## P-006 — Multi-Source Distance Spread

### 1

Given an R×C grid of cells marked as blocked or open and some open cells initially filled with water, water spreads each minute to the four orthogonally adjacent open cells; output the minimum number of minutes required to fill every reachable open cell or -1 if at least one open cell remains dry.

### 2

Given an undirected unweighted graph with N vertices and M edges and a list of K charging-station vertices, for every vertex compute and output the minimum number of edges to the nearest charging station, or -1 if it is unreachable.

### 3

Given an R×C grid containing empty cells, fresh items, and some initially rotten items where each minute every rotten item infects its four orthogonally adjacent fresh neighbors, output the minimum minutes to rot all fresh items or -1 if impossible.

### 4

Given an unweighted undirected graph and a set of initially burning nodes where fire spreads each unit time across any edge to adjacent nodes, output the time when the last vertex catches fire, or -1 if some vertices never burn.

### 5

Given an R×C grid with walls and open cells, plus positions of several medical tents, compute for every open cell the Manhattan-step distance to the nearest tent (or -1 for cells unreachable due to walls) and output the distances in grid order.

## P-007 — Alternating-Color Reachability

### 1

A directed graph with N nodes and M edges is given; each edge is colored red or blue and multiple parallel edges are allowed. Starting from node 1 with no prior color, compute for every node the minimum number of edges in a path from 1 to that node whose successive edges alternate in color; output N integers where unreachable nodes are reported as -1.

### 2

You are given a directed graph whose edges are labeled A or B, plus two specified vertices S and T. Starting at S with no previous label allowed, determine the minimum number of edges required to reach T along a path that alternates edge labels strictly (A then B then A...), or output -1 if unreachable.

### 3

An undirected graph of islands connected by sea or air routes (edges labeled SEA or AIR) and a starting island S are provided, followed by Q query islands. For each queried island, output the minimum number of hops from S using a path whose consecutive edges alternate between SEA and AIR, or -1 if unreachable.

### 4

Given a directed transport network where each road is marked DAY or NIGHT and a start node S plus a set of candidate hubs H, find which hub in H is reachable from S by a path whose successive edges alternate DAY/NIGHT and has the smallest number of edges; output the chosen hub and that distance, or -1 if none are reachable.

### 5

A directed portal network with N nodes and colored portals (red or blue) may contain duplicate portals. Starting at node 1 with no prior color, compute for every node two values: the minimum number of portals to reach that node with the last traversed portal being red, and similarly with the last portal being blue; report -1 for any unreachable state.

## P-008 — Grid Components with Perimeter

### 1

Given an m×n grid of '.' (water) and 'L' (land) cells, with four-neighbor connectivity, compute the total coastline length: the number of unit edges that separate a land cell from either a water cell or the grid boundary across all land components; output a single integer.

### 2

Given an m×n grid where '#' denotes fence tiles and a coordinate (r,c), using four-neighbor connectivity traverse the fence component containing (r,c) and output its perimeter defined as the count of fence-tile edges adjacent to empty cells or the grid boundary.

### 3

Given an m×n grid with '*' marked tiles and four-neighbor connectivity, find the connected component whose exposed-edge count (edges bordering empty cells or the border) is maximum and output two integers: that maximum exposed-edge count and the number of tiles in that component.

### 4

Given an m×n grid with 'C' contaminated cells and four-neighbor connectivity, determine how many contaminated tiles are boundary tiles (have at least one edge adjacent to an empty cell or the grid boundary) and output that count.

### 5

Given an m×n grid with 'B' block tiles and four-neighbor connectivity, compute and output two integers: the number of connected block components and the total number of exposed block edges (sum of all block-tile edges that face empty cells or the grid boundary).

## P-009 — Topological Course Feasibility

### 1

You are given N numbered courses and M prerequisite pairs (a, b) meaning course a must be completed before course b; prerequisites may repeat. Decide whether it is possible to finish every course by repeatedly taking any course with zero remaining prerequisites; output YES if doable or NO otherwise.

### 2

There are P software packages and a list of dependency pairs (x, y) where y depends on x (x → y). Determine whether you can build all packages by repeatedly installing any package with no unmet dependencies; if possible, output any valid installation order as a sequence of package IDs, otherwise output IMPOSSIBLE.

### 3

A game has Q quests labeled 1..Q and R directed unlock relations (u, v) meaning completing u unlocks v. Given these relations (duplicates allowed), report whether every quest can become completable by repeatedly accepting any quest with no remaining prerequisites; output ALL or NONE.

### 4

A cookbook lists S preparation steps and T prerequisite relations (i, j) that require step i before step j. Decide if you can perform all steps by always executing a step that currently has no unmet prerequisites; if yes, output one valid ordering of step indices, otherwise output CANNOT_COOK.

### 5

A factory must assemble A parts with B ordered constraints (p, q) meaning part p must be assembled before part q. Given the directed constraints (may include duplicate edges), determine whether a full assembly sequence exists by repeatedly choosing any part with zero incoming constraints; output POSSIBLE or IMPOSSIBLE, and if possible provide one valid sequence.

## P-010 — Bipartite Constraint Coloring

### 1

Given N players and M undirected rival pairs (each pair must be placed on opposite teams), decide whether players can be assigned teams 0/1 so every rival edge connects opposite labels; if possible output any length-N string of '0'/'1' giving each player's team, otherwise output IMPOSSIBLE.

### 2

Given N employees, M undirected constraints that two linked employees must work opposite shifts, and K employees with fixed shifts (0 or 1), determine whether the fixed assignments can be extended to all employees; if yes output any valid 0/1 assignment for every employee, otherwise output IMPOSSIBLE.

### 3

Given N houses and M undirected roads where each road requires the two incident houses be painted opposite colors (0 or 1), find the lexicographically smallest binary string of length N that satisfies all constraints, or output IMPOSSIBLE if no valid coloring exists.

### 4

Given N villages and M undirected roads that force adjacent villages to choose opposite flag colors (0/1), compute the total number of distinct valid 0/1 colorings of all villages that satisfy every road constraint; output that count (zero if impossible).

### 5

Given N festival attendees and M undirected 'must sit opposite' constraints between pairs, produce a valid 0/1 seating assignment satisfying all constraints that minimizes the total number of attendees labeled 1; if impossible output IMPOSSIBLE, otherwise output the minimum count and any assignment achieving it.

## P-011 — Shortest Path in Number State Space

### 1

Given integers S and T in the range [0,300000]. In one move you may replace x with x-1 (if >=0), x+1 (if <=300000), or 2*x (if <=300000). Output the minimum number of moves to transform S into T, or -1 if unreachable.

### 2

A five-digit numeric lock shows values 00000..99999; input gives start and goal displays (as integers 0..99999). From a value x one move may increment or decrement any single decimal digit by 1 modulo 10 (preserving five digits with leading zeros) or rotate the digits right by one position. Return the minimum moves to reach the goal from the start, or -1 if impossible.

### 3

Given S and T between 0 and 300000. From x you may perform one of: x+7 (<=300000), x-5 (>=0), or reverse the decimal digits of x (leading zeros dropped). Output the least number of moves to reach T from S, or -1 if unreachable.

### 4

Given integers S and T in [0,300000]. Allowed unit moves from x: x*3 (only if result <=300000), x-1 (if >=0), or if x is divisible by 10 replace x with x/10. Compute the minimum number of moves to transform S into T, or -1 if impossible.

### 5

Given S and T in the range 0..300000. From x a single move may be x+1 (<=300000), x-1 (>=0), or replace x with the sum of its decimal digits. Output the minimum moves required to reach T from S, or -1 if unreachable.

## P-012 — One-Dimensional House Selection DP

### 1

Given n houses in a row with integer amounts a1..an (n up to 300000), a robber may take money from any house but cannot rob two adjacent houses; compute and output the maximum total money obtainable.

### 2

You have n contiguous garden plots with integer yields b1..bn (n ≤ 300000); choose a subset of plots with no two adjacent to maximize total harvested yield (yields may be negative) and output that maximum.

### 3

A museum corridor contains n rooms with artifact values v1..vn; selecting room i forbids rooms i−1 and i+1. Given n up to 300000, choose nonadjacent rooms to maximize the sum of values and output the largest total.

### 4

Given a sequence of n days with integer profits p1..pn, select days to work so that no two chosen days are consecutive to maximize total profit. With n ≤ 300000, output the maximum achievable profit.

### 5

There are n paintings in a line with beauty scores s1..sn (integers). Pick a subset of paintings with no adjacent indices to maximize the sum of scores; given n up to 300000, output that maximum.

## P-013 — Minimum Cost Step DP

### 1

You are given n stairs numbered 1..n with nonnegative landing cost c[i]. You start at stair 0 with cost 0 and may reach stair i by coming from i-1 or i-2, paying c[i] when you land. Output the minimum total cost to reach stair n.

### 2

A river has positions at every half unit from 0 to n (0, 0.5, 1, …, n) with landing cost c[pos] for each; you start at 0 with zero cost. To land at position x you may arrive from x-1 (one unit) or x-0.5 (half unit) and pay c[x]. Output the minimum total cost to reach position n.

### 3

A road has n numbered checkpoints with nonnegative toll t[i]; you begin before checkpoint 1 with zero cost. You may arrive at checkpoint i from i-1 or from i-3 (if those positions exist), paying t[i] upon arrival. Compute and output the minimum total toll required to reach checkpoint n.

### 4

There are n toll booths in a line with fee f[i] (nonnegative); you may start by paying either f[1] or f[2] (begin at booth 1 or 2) and every subsequent booth i must be reached from i-2 (fixed two-booth hops), paying f[i] on arrival. Output the minimal total fees to end exactly at booth n.

### 5

A mountain trail has n markers with penalty p[i] for landing; you may start at marker 0 (ground, cost 0) or jump immediately to marker 1 paying p[1]. To reach marker i you may come from i-1 or i-2 and you pay p[i] when landing. Output the minimum total penalty to reach marker n.

## P-014 — Decode Count with Local Validity

### 1

Given a digit string S encoding a message where each code is either a single digit 1–9 or a two-digit number 10–26 (two-digit codes allowed only if the value is between 10 and 26 inclusive and '0' cannot appear alone), count how many valid partitions of S into codes exist; output the count modulo 1,000,000,007. Length of S ≤ 100000.

### 2

A stream of decimal digits represents concatenated packet IDs where each packet is encoded as one digit (1–9) or a two-digit ID 10–26, and the digit '0' may only occur as part of 10 or 20; compute the number of ways to split the stream into valid packet IDs, modulo 1000000007. Input length ≤ 100000.

### 3

Given a digit string T that encodes an instrument melody with symbols numbered 1..26 and encoded as either one digit (1–9) or a two-digit value between 10 and 26 (zeros cannot stand alone), determine how many symbol sequences produce T and return the result modulo the given integer M. |T| ≤ 100000.

### 4

A keypad log S is a string of digits; each valid key code is a single digit 1–9 or a two-digit code 10–26, with '0' allowed only as the second digit of 10 or 20. Count the number of valid decodings of S and print the count modulo 1,000,000,007. Length(S) ≤ 100000.

### 5

You are given a digit string representing concatenated paired-tokens where tokens map to integers 1..26 and may be encoded as either one digit (1–9) or as a two-digit number from 10 to 26; '0' cannot appear by itself. Compute the total number of valid token parsings of the string modulo 1000000007. Maximum length 100000.

## P-015 — Bounded Sum Reachability DP

### 1

You are given n positive integers representing coin values and a target integer T; each coin may be used at most once. Decide whether some subset of the coins sums exactly to T and output YES or NO.

### 2

You have n jewels with positive integer weights and an integer D; each jewel can go into at most one pan. Determine whether you can divide the jewels into two groups whose total-weight difference is at most D and output YES or NO.

### 3

Given n distinct coupon values (positive integers) and a required discount T, each coupon usable at most once, decide whether some subset of coupons yields a total discount of at least T; output YES or NO.

### 4

You are given n players' positive integer skill ratings; each player is assigned to exactly one team. Decide whether the multiset of ratings can be partitioned into two teams with equal total skill (output YES or NO).

### 5

Given n positive integer artifact weights and a box capacity C, each artifact can be placed at most once, determine whether you can choose a subset whose total weight equals C exactly; output YES or NO.

## P-016 — Longest Increasing Subsequence Tails

### 1

You are given a sequence of n integers representing players' scores in chronological order. Compute and output the length of the longest strictly increasing subsequence of scores.

### 2

You are given n envelopes described by integer pairs (width, height). Determine the maximum number k of envelopes that can be nested such that in the chosen sequence both width and height strictly increase; output k.

### 3

Given a sequence of n integers representing box heights in arrival order, determine and output the length of the longest non-decreasing subsequence (each next height >= previous).

### 4

Given n integers representing dancers' skill ratings in performance order, compute the length of the longest subsequence of dancers whose ratings are strictly increasing; output that length.

### 5

Given a sequence of n daily prices and a flag that is either STRICT or NONSTRICT, output the length of the longest subsequence where consecutive values are strictly increasing if the flag is STRICT, or non-decreasing if the flag is NONSTRICT.

## P-017 — Edit Distance with One Operation Type

### 1

Given two equal-length strings S and T, you are allowed only to substitute characters in S (each substitution replaces one character by any other). Compute and output the minimum number of substitutions required to make S equal to T.

### 2

Given two strings A and B, you may perform only single-character insertions into A and single-character deletions from A to transform A into B. Compute and output the minimum total number of such operations required.

### 3

Given two strings X and Y, you may delete characters from either string (each deletion removes a single character) until the two remaining strings are identical. Compute and output the minimum total number of deletions required.

### 4

Given a source string P and a target string Q, you may only delete characters from P (no insertions or substitutions) to try to obtain Q. Output the minimum number of deletions needed, or -1 if Q is not a subsequence of P.

### 5

Given an initial string U and a goal string V, you may only insert characters into U (no deletions or substitutions). Compute and output the minimum number of insertions required to transform U into V, or -1 if U is not a subsequence of V.

## P-018 — Minimum Partition Difference Bitset

### 1

Given n (1 ≤ n ≤ 200) nonnegative integers representing file sizes whose total sum ≤ 30000, split the files into two disks so the absolute difference between the disks' total sizes is minimized; output that minimum difference.

### 2

You are given n (1 ≤ n ≤ 200) nonnegative integers denoting gift values with total sum ≤ 30000; divide the gifts into two piles for two siblings to minimize the absolute difference of pile sums and output that minimum difference.

### 3

Given n (1 ≤ n ≤ 200) nonnegative integers for stone weights (total sum ≤ 30000), partition the stones into two piles so the difference in total weight is as small as possible; output the smallest achievable difference.

### 4

A charity has n (1 ≤ n ≤ 200) donation-box amounts as nonnegative integers with combined total ≤ 30000; assign the boxes to two trucks so the trucks' collected sums differ as little as possible and output that minimal difference.

### 5

Given n (1 ≤ n ≤ 200) nonnegative integers representing artwork appraisals whose sum ≤ 30000, split the items between two galleries to minimize the absolute difference of total appraisal values; output the minimum possible difference.

## P-019 — Greedy Refuel with Max Heap

### 1

You are given n fuel stations on a straight highway with nondecreasing positions pos[1..n] and fuel amounts fuel[1..n]; a car starts at position 0 with initial fuel F and must reach target distance L. When passing a station you may note its full fuel amount (no fractional fills) and choose to stop later to add one of the stored amounts; stops add the entire station amount. Output the minimum number of refueling stops required to reach L, or -1 if impossible.

### 2

A delivery drone must fly to a distant tower at distance D; there are n charging pads along the straight path with nondecreasing positions x[1..n] each providing an integer battery pack b[i]; the drone starts with charge C. You may skip pads but when you decide to stop you take a full pack (no partial packs); you can remember packs from passed pads and apply them later. Output one sequence of pad indices (in order) that yields the fewest stops to reach D, or output -1 if unreachable.

### 3

A hiker wants to reach the summit S along a trail; there are n supply depots at nondecreasing distances d[1..n] offering rations r[i], and the hiker begins with food amount F0. The hiker may pass depots storing their full ration option (no fractional rations) and only consume rations at stops; determine whether the summit is reachable using at most K resupply stops. Output YES if reachable within K stops, otherwise NO.

### 4

A courier travels along a straight route to deliver a package at distance T; there are n energy caches at nondecreasing positions p[1..n] each giving e[i] energy units, and the courier starts with energy E0. You may remember cache energies when passing and only take whole cache energy amounts at stops; compute the minimum number of cache stops to reach T and also output the remaining energy on arrival if reachable, or -1 if not.

### 5

An electric car must reach mile M on a straight interstate; n battery-swap stations are given by nondecreasing mile markers m[1..n] with swap-range gains g[i], and the car starts with range R0. At each passed station you may catalog its full swap gain (no fractional charging) and perform swaps later; determine the smallest number of swaps needed to arrive at M, or output -1 if it cannot be done.

## P-020 — Streaming Median with Two Heaps

### 1

A stream of n (1 ≤ n ≤ 100000) integer match scores arrives one by one; after each new score report the current median of all seen scores, using the rule that if the count is even you must output the smaller (lower) of the two middle values. Input: n followed by n integers; Output: n medians.

### 2

You receive an insertion-only sequence of n (1 ≤ n ≤ 100000) network latency measurements (milliseconds); after each measurement output the running median latency, choosing the lower middle when the total number of samples is even. Input: n then n integers; Output: n medians.

### 3

A trading system emits n (1 ≤ n ≤ 100000) transaction prices in time order; for each arrival output the current median trade price, breaking ties on even counts by reporting the smaller of the two middle prices. Input: n then n numbers; Output: n medians.

### 4

A set of n (1 ≤ n ≤ 100000) environmental sensor readings (floating-point values) is recorded sequentially; after each reading output the online median of all readings so far, and if there are an even number of readings report the lower (smaller) of the two central values. Input: n then n floats; Output: n medians.

### 5

An online rating widget collects n (1 ≤ n ≤ 100000) integer user ratings; as each rating arrives output the current median rating, using the convention that for even total count you return the smaller of the two middle ratings. Input: n then n integers; Output: n medians.

## P-021 — K-Closest Selection by Heap

### 1

Given n integer coordinates on a line and integers x and k, choose exactly k coordinates whose absolute difference from x is smallest; break ties by the smaller coordinate. Output the selected coordinates sorted by increasing absolute difference (and by coordinate for ties).

### 2

Given n student exam scores (integers), a threshold t and integer k, select k scores with minimal absolute difference from t; if two scores are equally distant choose the higher score. Output the 1-based indices of the selected scores ordered by increasing distance from t (breaking ties by higher score).

### 3

Given n event timestamps as integers and integers T and k, pick k timestamps nearest to T by absolute difference; break ties by the earlier timestamp. Output the chosen timestamps in order of increasing distance from T (earlier timestamps first when distances tie).

### 4

Given n daily temperature readings (integers), a target temperature target and integer k, select k distinct days whose temperatures are closest to target by absolute difference; if two days tie choose the smaller day index. Output the k day indices (1-based) ordered by increasing distance and by smaller index for ties.

### 5

Given n product prices (integers), a desired price p and integer k, find k prices with smallest absolute difference to p; break ties by the lower price. Output the selected prices sorted by nondecreasing distance to p (and by price for ties).

## P-022 — Sweep-Line Maximum Coverage

### 1

You are given n user sessions as pairs (s,e) of integer timestamps representing half-open intervals [s,e) with s<e; when starts and ends coincide, process starts before ends. Find the maximum number of concurrent sessions and the smallest timestamp at which this maximum occurs; output the count and that timestamp.

### 2

You are given n paintings as closed integer intervals [l,r] (both endpoints inclusive); when a start and an end coincide, treat the start first. Compute the total number of integer time points at which the number of active paintings equals the global maximum; output that total length.

### 3

You are given n train occupancies as half-open intervals [a,b) with integer times and a<b; when events share a time handle starts before ends. Determine the maximum simultaneous trains and output every maximal contiguous half-open time interval during which this maximum holds as a list of pairs.

### 4

You are given n advertisements indexed 0..n-1 shown during closed integer intervals [l,r]; on equal timestamps count starts before ends. Find the smallest index of an advertisement that is active at some time when the total number of simultaneous ads reaches the overall maximum; output that index.

### 5

You are given n processes with integer start and end times as [s,e) (start inclusive, end exclusive); for simultaneous events process starts before ends. Output two integers: the earliest time when the running-process count reaches its maximum, and the total duration (sum of integer time units) during which the count stays at that maximum.

## P-023 — Merge Cost via Minimum Heap

### 1

You are given n positive integers representing file sizes; merging any two files produces a single file whose size is the sum and costs an amount equal to that sum. Merge files until one remains. Output the minimum total cost required to merge all files into one.

### 2

Given n ropes with positive integer lengths, tying two ropes produces a rope whose length is their sum and incurs a cost equal to that sum. Repeatedly tie ropes until only one rope remains. Output the smallest total cost to join all ropes.

### 3

There are n cards each with a positive integer value; combining two cards creates a new card whose value is the sum and costs that summed value. Continue combining pairs until a single card is left. Output the minimum possible total cost to combine all cards.

### 4

You have n batches each with a positive weight; merging any two batches yields a batch of combined weight and costs the sum of their weights. Perform pairwise merges until one batch remains. Output the least total cost to aggregate all batches.

### 5

Given n packet groups with positive sizes, you may aggregate any two groups at a cost equal to their combined size, producing one group of that size; repeat until a single group remains. Compute and output the minimum total aggregation cost.

## P-024 — Sort-and-Scan Dominance Chain

### 1

You are given n movie showings, each with an integer start time and end time. Attendings cannot overlap (a showing must finish before the next starts). Compute the maximum number of full showings you can attend and output that count.

### 2

A city lists n roadwork intervals [L_i,R_i] on a single street; overlapping roadworks cannot run simultaneously. Determine the minimum number of intervals that must be cancelled so the remaining intervals are pairwise non-overlapping, and output that minimum.

### 3

There are n wireless transmitters; transmitter i covers the interval [x_i - r_i, x_i + r_i]. Activate a largest possible subset so no two coverage intervals overlap. Output the size of that subset.

### 4

A single parking space receives n reservation requests each as [start,end] along the day; you may accept requests but cannot have overlapping reservations. If two requests end at the same time you must prefer the one that started later. Return the indices of a maximum-size set of accepted reservations (indices may be in any order).

### 5

A festival has n stage performances given by (open_time, close_time); performances must not overlap and a performance ending at time t is allowed to chain into one starting at time t. Find the maximum number of performances that can be scheduled on that stage and output that maximum count.

## P-025 — Minimum Swaps to Group Binary Items

### 1

Given an array of n binary values (0/1) representing items on a line, compute the minimum number of arbitrary swaps between positions needed to make all 1s occupy a single contiguous segment; output that minimal swap count.

### 2

A row of n theater seats is described by a binary string where '1' marks a reserved seat and '0' an empty one; determine the fewest arbitrary swaps of seat occupants required so that all reserved seats become adjacent, and output that number.

### 3

A circular necklace of n beads is given as a binary array (0/1 by color). Find the minimum number of arbitrary swaps between bead positions so that all beads of value 1 appear consecutively around the circle; return the swap count.

### 4

You are given a binary array of length n representing street lamps (1 = on, 0 = off). Compute the minimum number of arbitrary element swaps needed to cluster all 0s into one contiguous block (not circular), and output that minimum.

### 5

An indexed list of n parking spots contains either a car (1) or empty space (0) around a looped driveway considered circular with single-wrap adjacency allowed; find the fewest arbitrary swaps to group all cars into one contiguous segment along the loop and output that minimal swap count.

## P-026 — Trapping Rain Between Bars

### 1

Given an array of n nonnegative integers representing heights of elevation bars along a promenade, compute the total units of rainwater that remain trapped between the bars after a downpour and output a single 64-bit integer. 1 ≤ n ≤ 300000.

### 2

You are given n nonnegative integers height[i] describing the heights of retaining-wall segments in order; determine the total volume of water (sum over all positions) that would be stored across the segments after rainfall and print the total as a 64-bit integer. 1 ≤ n ≤ 300000.

### 3

An array of n nonnegative integers denotes the skyline heights of consecutive city blocks; calculate the total amount of rainwater trapped between the blocks (aggregate across indices) and output one integer (fits in 64-bit). 1 ≤ n ≤ 300000.

### 4

Given n nonnegative integers representing the vertical capacities of adjacent storage bins (heights), find the total number of water units those bins collectively retain when rain fills the gaps between them and print the total as a 64-bit integer. 1 ≤ n ≤ 300000.

### 5

A sequence of n nonnegative integers gives the heights of successive levee segments on a river bank; after rainfall compute the aggregate water trapped between segments (sum across all positions) and output the total trapped units as a single 64-bit integer. 1 ≤ n ≤ 300000.

## P-027 — Largest Rectangle in Histogram

### 1

Given an array of n nonnegative integers representing the heights of adjacent warehouse stacks of crates along a single aisle, find the maximum number of crates that can be taken by selecting a contiguous block of stacks and using the minimum stack height over that block as the uniform height; output that maximal area as a single integer.

### 2

You are given n integers describing the power output capacity of n consecutive solar panel strings arranged in a row; by selecting a contiguous group of strings that must run at the same output equal to the smallest capacity in the group, compute and output the maximum total output (group width × chosen output).

### 3

An antique shelf holds n books each of unit width and varying spine heights provided as an array; determine the largest rectangular face area that can be formed by choosing a contiguous sequence of books and using the shortest spine height in that sequence as the rectangle height, then output that maximal area.

### 4

A skyline silhouette is given as n adjacent vertical segments with integer heights; choose a contiguous sequence of segments and form a rectangle whose height is the minimum height among those segments; return the largest possible rectangle area achievable from the silhouette.

### 5

Given n contiguous plots with integer height-limits for rectangular water tanks built on them, choose a consecutive range of plots and build tanks all to the same height equal to the smallest limit in that range; compute and output the maximal total water-volume footprint (width × uniform height).

## P-028 — Coordinate Compression with Range Marks

### 1

You are given N booked date ranges [L_i, R_i] (inclusive) and Q query dates d_j; for each query output whether that date is free (not contained in any booked range) or booked. Return Q boolean answers in input order.

### 2

You are given N paint operations each covering an interval [L_i, R_i] (inclusive) on a long road and M checkpoint coordinates x_j; for each checkpoint output the number of paint operations whose interval contains x_j.

### 3

You are given N delivery address ranges [L_i, R_i] (inclusive). Determine the smallest address (original coordinate on the line) that receives the maximum number of deliveries and output that address together with the delivery count.

### 4

You are given N user sessions as timestamp intervals [login_i, logout_i) (login inclusive, logout exclusive). Compute and output the maximum number of concurrent active sessions at any instant.

### 5

You are given N inspected segments [L_i, R_i] (inclusive) on a one-dimensional pipeline. After merging any overlapping or touching segments (touching at endpoints counts as connected), output the number of disjoint inspected components.

## P-029 — Bitmask Subset Enumeration with Compatibility

### 1

Given n (≤20) items each described by a d-bit mask (d≤20) and an allowed-features mask A, count the number of subsets of items (including the empty set) whose combined OR mask is a subset of A (i.e., no selected item introduces a forbidden bit). Output that count.

### 2

Given n (≤20) permission modules each with a d-bit grant mask (d≤20) and a required-permissions mask R, determine how many nonempty subsets of modules collectively grant all bits in R (their OR covers R). Output the count.

### 3

Given n (≤20) ingredients each with a d-bit flavor mask (d≤20) and a target flavor mask T, count all subsets of ingredients whose combined OR mask equals exactly T. Output the count.

### 4

Given n (≤20) robot attachments each with a d-bit toggle mask (d≤20) and an unsafe-bit mask S, find the maximum number of attachments you can select so that the combined OR mask has no bit in S set (i.e., OR & S == 0). Output that maximum size.

### 5

Given n (≤20) feature switches each with a d-bit mask (d≤20), a target mask T, and an integer k, determine whether there exists a subset of exactly k switches whose combined OR equals T. Output YES if such a subset exists, otherwise NO.

## P-030 — XOR Prefix Frequency Pairs

### 1

Given an array of n nonnegative integers and a target integer K, count the number of contiguous subarrays [l..r] (1 ≤ l ≤ r ≤ n) whose bitwise XOR equals K. Output the single integer count.

### 2

You are given a binary string s of length n and a target bit k (0 or 1). Treat each character as 0/1 and count how many substrings s[l..r] have XOR of all bits equal to k; print the count.

### 3

A device receives a static sequence of n 32-bit masks; applying a contiguous block of masks yields the XOR of those masks. Given the sequence and a goal mask G, count all intervals [l..r] whose combined mask equals G and output that count.

### 4

There are n timestamped toggle events, each event described by an m-bit mask (m ≤ 20). For a given target mask T, count the number of contiguous time intervals whose XOR of event masks equals T; return the total count.

### 5

You have n permission-change records, each a nonnegative integer mask. Given a single target mask X, compute how many contiguous segments of records produce an overall XOR equal to X and output the count.

## P-031 — Range Bitwise AND Stability

### 1

Given two nonnegative integers L and R (0 ≤ L ≤ R ≤ 10^18), compute the bitwise AND of every integer in the inclusive range [L, R] and output the resulting integer.

### 2

Given L and R (0 ≤ L ≤ R ≤ 10^18), determine how many most-significant binary bits are identical for every integer in the inclusive range [L, R]; output that count.

### 3

Given a starting value L (0 ≤ L ≤ 10^18), find the maximum R (L ≤ R ≤ 10^18) such that the bitwise AND of all integers in [L, R] equals L; output that R or -1 if no such R exists above L.

### 4

Given L, R (0 ≤ L ≤ R ≤ 10^18) and an integer P (0 ≤ P ≤ 60), decide whether the top P binary bits (the P most-significant bits) are the same for every integer in [L, R]; output YES or NO.

### 5

Given L and R (0 ≤ L ≤ R ≤ 10^18), compute the integer formed by the common most-significant prefix of all numbers in [L, R] (i.e., the maximal prefix bits preserved across the range) and output that prefixed value as an integer.

## P-032 — Minimize Maximum Pair Difference

### 1

Given a list of n integer skill ratings of players and an integer p, form exactly p disjoint pairs of players so that the maximum absolute difference of skills within any pair is as small as possible; output that minimum achievable maximum difference.

### 2

You are given n sensor positions on a straight line as integers and a target p; choose exactly p disjoint pairs of sensors to establish links so that the largest distance between two sensors in any pair is minimized; output that minimal largest distance.

### 3

Given n integers representing glove sizes and an integer p, select exactly p disjoint pairs of gloves (each glove used at most once) so that the greatest size difference among the chosen pairs is minimized; output that smallest possible greatest difference.

### 4

Given n event timestamps (integers) and a number p, partition the events into exactly p disjoint pairs so that the maximum time gap inside any pair is as small as possible; output the minimal achievable maximum gap.

### 5

You have n integer performance scores of competitors and an integer p; form exactly p disjoint pairs so that the maximum score difference among paired competitors is minimized, and report that minimum possible maximum difference.

## P-033 — Lexicographically Smallest Stack Output

### 1

Given a string s of lowercase letters (length up to 200000), you process its characters left-to-right, pushing each character onto a stack and at any times popping the stack top to append to the output; compute the lexicographically smallest output string obtainable by such stack operations.

### 2

A sequence of crates labeled with lowercase letters arrives in order; a robot may pick each crate and push it onto a LIFO buffer, and at any moments pop the top of the buffer to the dispatch line; output the lexicographically smallest dispatch sequence possible.

### 3

You are given a scroll containing a string of lowercase letters; a scribe reads characters left-to-right, can temporarily place read letters on a palm-stack, and may move the palm-stack top to the final line whenever desired; produce the lexicographically smallest final line achievable.

### 4

Containers labeled by lowercase letters travel on a conveyor in given order; a crane can lift the next container onto a vertical stack or unload the stack top to the yard at any time; after processing all conveyors and emptying the stack, output the lexicographically smallest sequence of yard placements.

### 5

A stream of packets labeled with lowercase letters arrives; a system may push each incoming packet onto a LIFO buffer or pop the buffer top to send a packet to output at any time (and must flush the buffer after the stream); determine the lexicographically smallest output string obtainable.

## P-034 — Shortest Removal for Nondecreasing Array

### 1

You are given an array of n integers representing recorded values in time order; by removing a single contiguous subarray (allowed to be empty) the concatenation of the remaining elements must be nondecreasing — output the minimum length of the removed subarray.

### 2

A sequence of n log entries is given as integer timestamps; choose one contiguous block of entries to delete so that the remaining timestamps are nondecreasing; output two integers l and r (1-based) marking the shortest such deleted block, choosing the smallest l on ties.

### 3

A list of n sensor readings is provided; discard one contiguous segment so the remaining readings form a nondecreasing sequence — output the resulting sequence after removing any shortest possible contiguous segment.

### 4

Given n quality scores for a data stream, remove a single contiguous span so the leftover scores are nondecreasing; report two numbers: the minimal number of elements removed and the starting index of a segment achieving that minimum (1-based, prefer smallest start on ties).

### 5

An ordered list of n measurements may contain a corrupted contiguous run; remove one contiguous run (possibly empty) so the concatenation of the remaining measurements is nondecreasing, and output the length of the shortest run that must be discarded.

## P-035 — Count Subarrays with Fixed Number of Markers

### 1

Given an array of n integers where an element is considered marked if it is odd, and an integer k, count the number of contiguous subarrays that contain exactly k marked elements and output that count.

### 2

You are given a binary string S of length n consisting of '1' (special) and '0' (normal) and an integer k; compute how many substrings of S contain exactly k occurrences of '1' and print the result.

### 3

An array of n sensor readings is provided; a reading is faulty if it equals 0. Given k, determine the number of contiguous intervals of readings that include exactly k faulty readings and return that count.

### 4

A sequence of n customer codes and a designated VIP code v are given; a position is a VIP if its code equals v. For an integer k, count contiguous segments of customers that contain exactly k VIPs and output the total.

### 5

Given an array of n positive integers where an element is marked if it is a prime number (treat 1 as non-prime), and an integer k, count the number of contiguous subarrays that contain exactly k prime-marked elements and output the count.

## P-036 — Prefix-Minimum Validity Sweep

### 1

You are given n integers representing hourly net crate changes at a warehouse; find the minimum nonnegative initial crate count so that for every prefix of hours the total crate count never drops below zero. Output that minimum initial number.

### 2

Given n integers of battery charge deltas and an integer capacity C, determine whether there exists an initial charge x with 0 ≤ x ≤ C such that every prefix cumulative charge stays within [0,C], and if so output the smallest such x, otherwise report impossibility.

### 3

Given n transaction amounts and a proposed starting bank balance B, decide whether every prefix cumulative balance remains nonnegative; if not, output the minimal additional upfront deposit required to make all prefixes nonnegative.

### 4

Given n daily net inflows to a reservoir and an integer minimal safe level L, compute the smallest integer initial water volume so that every prefix total volume is at least L; output that initial volume.

### 5

Given n minute-by-minute stamina changes for a runner and a required minimum stamina S to be maintained at all times, find the smallest nonnegative starting stamina so that after every prefix the stamina is ≥ S; output that value.

## P-037 — Shortest Bridge Between Regions

### 1

You are given an m×n binary grid of 1s (land) and 0s (water) containing exactly two four-connected islands of 1s. You may change 0s to 1s (flip water to land); find the minimum number of flips needed so that the two islands become connected via four-directional adjacency. Output the minimum flips.

### 2

Given an m×n grid with characters 'R', 'B', and '.' where the 'R' cells form exactly one four-connected red region and 'B' cells form exactly one four-connected blue region, you can convert '.' cells into passable ground at unit cost; compute the minimum number of '.' conversions required to create a four-directional path between the red and blue regions. Output the minimum conversions.

### 3

A map is given as an m×n grid with 'C' (castle) cells forming exactly two four-connected castle clusters and '~' (sea) elsewhere; you may reclaim sea cells ('~'→'C') one at a time to form a four-directional land connection between the two castle clusters. Return the minimum reclaimed cells.

### 4

You have an m×n grid of 1s (conductor) and 0s (insulator) containing exactly two four-connected conductive components. By turning insulator cells into conductors at unit cost, connect the two components via four-directional adjacency; output the smallest number of conversions required.

### 5

Given an m×n terrain grid where 'F' marks farm plots forming exactly two four-connected farm regions and 'M' marks marsh, you may drain marsh cells (convert 'M'→'F') to make a four-directional contiguous farm connecting both regions. Output the minimal count of drained marsh cells.

## P-038 — Unbounded Coin Minimum DP

### 1

Given a list of positive integer coin denominations (reuse allowed) and a target amount, determine the minimum number of coins required to make exactly that amount; output the minimum count or -1 if it cannot be formed.

### 2

You are given N positive integers representing pack sizes you can buy any number of, and a target order size; compute the smallest number of packs whose total equals the target exactly and return that count (or -1 if impossible).

### 3

Provided an array of positive integer spell costs that can be cast repeatedly and a required total mana expenditure, find the least number of spells needed to spend exactly that mana; output the minimum spell count or -1 if unreachable.

### 4

Given allowed positive integer step lengths and a target distance, compute the minimum number of steps (each step length may be reused) to reach exactly the target distance and return that minimum count or -1 if it cannot be reached.

### 5

Given positive integer stamp denominations available in unlimited quantity and a postage goal, determine the fewest stamps needed to make exactly that postage amount; output the minimum number of stamps or -1 if no combination achieves it.

## P-039 — Zero-One Value Knapsack

### 1

You have n (≤300) pieces of equipment, each with an integer weight w_i and an integer defense value v_i (w_i,v_i ≥ 0). Choose a subset of equipment (each piece at most once) whose total weight does not exceed capacity W (≤30000) to maximize total defense. Output the maximum defense achievable as a single integer.

### 2

There are n crates (n ≤ 300), crate i has integer weight w_i and integer profit p_i (w_i,p_i ≥ 0). Load a ship of capacity C (≤30000) by selecting any subset of crates (each at most once) so total weight ≤ C and total profit is maximized. Output the maximum total profit.

### 3

You are offered n projects, project i requires integer cost c_i and yields integer benefit b_i (c_i,b_i ≥ 0). With a budget B (≤30000) choose a subset of projects (no project more than once) whose total cost ≤ B to maximize total benefit. Output the maximum benefit attainable.

### 4

A museum must transport n artifacts, artifact i has integer shipping weight w_i and insured value v_i (w_i,v_i ≥ 0). Pack a truck with capacity W (≤30000), taking each artifact at most once, so the sum of weights ≤ W and the sum of insured values is maximized. Output the maximum total insured value.

### 5

You have n upgrade cards (n ≤ 300), card i consumes integer points c_i and grants integer power v_i (c_i,v_i ≥ 0). With a points pool P (≤30000) select a subset of cards (each at most once) whose total cost ≤ P to maximize total power. Output the maximum total power as a single integer.

## P-040 — Reorganize Sequence Without Equal Neighbors

### 1

Given an integer n (≤100000) and a string s of length n consisting of lowercase letters, rearrange the characters to form a string where no two adjacent characters are equal; output any such string or "IMPOSSIBLE" if none exists.

### 2

Given an integer n (≤100000) and an array A of n integers (labels 1..m) representing meeting types, reorder A so that no two equal labels are adjacent; output any valid reordered array of labels or "IMPOSSIBLE".

### 3

Given an integer m and an array C of m nonnegative integers summing to n (n≤100000) that specify counts of colored beads, construct a linear sequence of length n using exactly C[i] beads of color i with no two adjacent beads of the same color; output any sequence of color indices or "IMPOSSIBLE".

### 4

Given n (≤100000) tasks specified by their type strings (a list of n tokens), produce a permutation of the tasks such that no two consecutive tasks have the same type; output any valid reordered list of task tokens or "IMPOSSIBLE".

### 5

Given n (≤100000) boxes each labeled with a product code (strings or integers), produce an ordering of the box indices so that identical product codes never appear in consecutive positions; output any valid ordering of indices or "IMPOSSIBLE".

## D-001 — Dijkstra with One Discount

### 1

Given a directed graph with nonnegative edge weights and two nodes s and t, you may traverse at most one edge for free (cost 0); compute the minimum possible total cost to go from s to t and output that minimum cost.

### 2

Given an undirected network of flights where each edge has a nonnegative ticket price and airports A and B, you may apply a single half-price coupon to at most one flight; output the smallest total price to travel from A to B.

### 3

Given a metro map modeled as a weighted directed graph with stations S and T and nonnegative travel costs on edges, you hold one toll waiver that removes the cost of one traversed edge; determine the minimum total travel cost from S to T.

### 4

Given courier routes as a weighted directed graph with nonnegative edge costs and two nodes u and v, you can choose at most one edge to 'boost' so its traversal cost is halved; find the minimum total delivery cost from u to v.

### 5

Given a weighted directed graph with nonnegative edge costs and nodes s and t, you must use exactly one discount that makes a single traversed edge cost 0; output the minimum total path cost from s to t under that constraint.

## D-002 — Dijkstra with Limited Stops

### 1

You are given a directed graph of n airports and m scheduled flights; each flight is a nonnegative cost edge. Given source s, destination t and an integer K, find the minimum total cost to go from s to t using at most K flights (edges). Output the minimum cost or report unreachable; constraints n+m ≤ 100000, K ≤ 30.

### 2

Given an undirected graph of depots connected by road segments with nonnegative distances, compute the smallest total distance to drive from depot A to depot B using at most H road segments (edges). Output the minimal distance or indicate impossible. Constraints n+m ≤ 100000, H ≤ 30.

### 3

Given a directed network of routers where each link has a nonnegative latency, determine the minimum end-to-end latency from node u to node v using no more than K hops (edges). Output the minimal latency or -1 if no such route exists. Constraints n+m ≤ 100000, K ≤ 30.

### 4

Given a directed graph of stations and paid rides with nonnegative fares, find the cheapest fare to get from station S to station T using at most K transfers (i.e., at most K edges). Output the minimum fare or "IMPOSSIBLE" if unreachable. Constraints n+m ≤ 100000, K ≤ 30.

### 5

Given directed shipment routes between warehouses with nonnegative handling costs per route, compute the minimum total handling cost to send a package from origin O to destination D using at most K shipment legs (edges). Return the minimum cost or report "UNREACHABLE". Constraints n+m ≤ 100000, K ≤ 30.

## D-003 — Union-Find Dynamic Connectivity

### 1

There are n users and a sequence of operations; each operation is either AddFriend u v (create an undirected friendship link) or Query u v (are u and v in the same friend group now?). Process operations online and output YES or NO for each query. n plus the number of operations ≤ 300000.

### 2

You manage n servers and receive a stream of commands: Connect a b installs an undirected cable between servers a and b, Check a b asks whether a path exists between a and b at that moment. For each Check print Connected or Disconnected. Total servers plus operations ≤ 300000.

### 3

An archipelago has n islands; you are given m operations, each either BuildBridge x y (add an undirected bridge between islands x and y) or Ask x y (are x and y in the same connected island group now?). Answer Yes/No for each Ask in the order given. n+m ≤ 300000.

### 4

There are n players initially in separate teams and a list of operations: Merge x y unites the teams containing x and y, Same x y queries whether x and y belong to the same team. For each Same output 1 if they share a team or 0 otherwise. n plus operations ≤ 300000.

### 5

Given n islands with an initial set of k undirected bridges, then q operations follow where each operation either adds a new bridge between two islands or queries whether two islands are connected at that time. Process operations in order and output YES or NO for every query. n+k+q ≤ 300000.

## D-004 — DSU Cycle-Closing Edge

### 1

Given N servers and a sequence of undirected cable insertions specified as ordered pairs (u,v) applied in the given order, find the first cable whose addition connects two already-connected servers (self-loops count as redundant). Output the endpoints of that redundant cable as two integers, or output -1 -1 if no such cable exists.

### 2

You have N towns and M undirected roads being built one by one, each road given as a pair of town indices; detect the earliest road that closes a cycle in the evolving network (an edge from a town to itself is considered cycle-forming). Print the road's pair, or print 0 0 if the network remains a forest.

### 3

Process a list of unordered alliance requests between N players, each request given as a pair (a,b) in arrival order; report any request which would union two players already in the same alliance when applied (return the first such request if multiple exist). Return the offending pair of indices, or return the pair -1 -1 when no redundant request appears.

### 4

A water grid starts with N junctions and pipes are added sequentially as undirected pairs; identify the first pipe addition that would create a loop in the network (treat self-connecting pipes as loop-creating). Output the endpoints of that pipe, or output the single token NO if none closes a loop.

### 5

Given a chronological list of friendship events among N people as undirected pairs, find any event that links two people already in the same connected friendship group at the moment it occurs (prefer the earliest such event). Print the two indices of that event, or print 0 0 if every event joins distinct components.

## D-005 — Minimum Spanning Connection via Kruskal

### 1

You are given N cities and M undirected weighted cables, each cable connecting two cities with a cost. Compute the minimum total cost of a set of cables that makes every city reachable from every other, or report IMPOSSIBLE if it cannot be done.

### 2

There are N islands and M possible bridges described by an undirected edge list (u, v, cost). Output the minimum total cost to connect all islands into a single component, or output Impossible if the bridge set cannot span every island.

### 3

Given N sensors and M available bidirectional links with weights, each link specified by its two endpoints and cost, find the least total weight needed to connect all sensors into one network, or print -1 if full connectivity is unattainable.

### 4

A country has N towns and M candidate roads listed as undirected weighted edges (a, b, cost). Determine the minimum total construction cost to connect all towns, or output NO if it is impossible to connect every town with the given roads.

### 5

You are given N power substations and M undirected transmission lines, each line specified by its endpoints and installation cost. Compute the minimum sum of costs required to ensure every substation is connected, or output DISCONNECTED if a full connection cannot be achieved.

## D-006 — Tree Diameter by Double Traversal

### 1

Given a connected acyclic undirected graph of n nodes with n−1 edges where each edge has a nonnegative integer latency, compute and output the diameter: the maximum possible sum of latencies along any simple path between two nodes.

### 2

Given n villages connected by n−1 unweighted bidirectional roads forming a tree, find the greatest number of roads on a simple path between any two villages and output that integer (the tree diameter in edges).

### 3

A fiber network is a tree of n labeled terminals with positive integer link lengths; given the list of links (connected, acyclic), output the labels of any two terminals that are farthest apart (endpoints of some longest path).

### 4

Given a connected acyclic network of sensors where each undirected edge has a nonnegative integer delay, output two integers: the total delay (sum of edge weights) of a longest simple path and the number of edges on that path; if multiple longest paths exist, output values for any one.

### 5

Given an undirected tree with n nodes and nonnegative integer cable lengths on edges, report two values: the maximum distance (sum of weights) between any pair of nodes and the label of a node that lies on some longest path (if n=1 output distance 0 and that single node).

## D-007 — Tree Reroot Distance Sums

### 1

You are given an unweighted tree with n nodes labeled 1..n. For every vertex, compute the sum of distances from that vertex to all other vertices and output n integers: the sums for vertices 1 through n.

### 2

Given an unweighted tree and an array pop[1..n] of nonnegative integers giving the number of people at each node, compute for every vertex the total relocation cost if all people move to that vertex (cost = pop[j]*distance). Output n integers: the costs for vertices 1..n.

### 3

Given an unweighted tree and k marked participant nodes, compute for each vertex the total travel distance if all participants meet at that vertex; output the index of a vertex that minimizes this total and the minimal total distance.

### 4

Given an unweighted tree, compute for every vertex its network centrality defined as the sum of distances to all other vertices, then output the index (or indices) achieving the minimum centrality and the index (or indices) achieving the maximum centrality along with their respective sums.

### 5

Given an unweighted tree and a subset S of nodes, compute for every vertex the sum of distances from that vertex to every node in S and output n integers: the sums for vertices 1..n.

## D-008 — Lowest Common Ancestor by Parent Lifting

### 1

Given a rooted family tree of n people (nodes 1..n) described by n-1 edges and a designated root ancestor, answer q queries each consisting of two person indices; for each query output the lowest common ancestor (the deepest shared ancestor) node index. Assume n+q ≤ 200000.

### 2

A kingdom's map is a rooted tree of castles with parents given for every non-root castle; for q pairs of starting castles, determine the castle where their upward paths first meet (the lowest common ancestor) and print its index for each pair. Guarantee n+q ≤ 200000.

### 3

Given a company's org chart as a rooted tree with the CEO specified and each employee's direct manager, process q queries each asking for the lowest common manager of two employees; output the manager's node id for every query. Ensure n+q ≤ 200000.

### 4

A filesystem is represented as a rooted tree of folders with parent for every non-root folder; for q queries of two folder IDs, report the deepest folder that contains both (their lowest common ancestor) as a node id. Constraint: n+q ≤ 200000.

### 5

Provided a static lineage of noble houses as a rooted tree (nodes 1..n) with a known root, answer q queries where each asks for the lowest common ancestral house of two houses; output the ancestor node index for each query. n+q ≤ 200000.

## D-009 — Fenwick Prefix Update Query

### 1

An array of n players with initial integer scores indexed 1..n receives q operations: an update that increases player i's score by a given delta, and a query that requests the total score of players 1..k. For each query output the prefix sum.

### 2

n warehouses placed along a road have initial inventory counts. Process operations that add a signed delta to a single warehouse index i and queries that request the total inventory between positions l and r. Output each range-sum query result.

### 3

A timeline of n seconds has initial hit counts per second. You will get events that increment the hits at second t and queries that ask for the cumulative hits from second 1 up to time T. Return the cumulative total for every such query.

### 4

Start with an empty sequence and perform q operations: 'insert v' appends value v to the end, and 'query' requests the total number of inversions (pairs i<j with a[i]>a[j]) among all inserted elements so far. Output the inversion count for each query.

### 5

m polling stations numbered 1..m have initial vote tallies. Support point updates that add or subtract votes at station i and queries that ask for the total votes across stations l..r. Print the result for each range-sum query.

## D-010 — Inversion Counting by Fenwick Compression

### 1

Given an array A of n integers (n ≤ 200000), compute the number of inversion pairs: the count of index pairs (i, j) with i < j and A[i] > A[j]. Output a single integer representing this count.

### 2

There are n racers labeled 1..n who started in increasing label order. Given a permutation P of length n describing their finishing order, count the number of overtakes: pairs of labels (x,y) with x<y but x appears after y in P. Output a single integer.

### 3

Given an array A of n integers (n ≤ 200000), produce an array C of length n where C[i] is the number of indices j>i with A[j] < A[i]. Output the n counts in order.

### 4

Given an array A of n integers possibly containing equal values, count pairs (i, j) with i < j and A[i] >= A[j] (note: equal values should be counted). Output the total number of such non-increasing pairs.

### 5

Given two permutations L and R of the same n distinct IDs representing rankings on day 1 and day 2, count how many unordered ID pairs {u,v} have their relative order reversed between the days (u ahead of v in L but behind in R). Output a single integer.

## D-011 — Count Smaller After Self

### 1

Given an array of n integer daily stock prices, for each day i compute how many later days j>i have a strictly lower price than price[i]; output the n counts in original order.

### 2

You are given a sequence of n integer contest scores recorded in order of submission; for each submission position i return the count of later submissions with strictly smaller scores, producing an array of n counts.

### 3

An ordered row of n boxes has integer sizes; for every box at position i determine how many boxes to its right (indices j>i) have strictly smaller size, and output the resulting list of n integers.

### 4

Given n time-ordered integer river-level readings, for each measurement i report the number of subsequent measurements strictly lower than reading[i]; output the counts in sequence.

### 5

A product receives n chronological integer ratings; for each rating at index i output how many later ratings are strictly smaller than that rating, producing an n-length array of counts.

## D-012 — Coordinate Sweep Line Segment Intersections

### 1

A city has H horizontal roads and V vertical avenues described by integer endpoints (x1,x2,y) for horizontals and (x,y1,y2) for verticals; no two segments are collinear and overlapping and endpoints are inclusive. Count and output the total number of road crossings (pairs of one horizontal and one vertical road that intersect). Up to 100000 segments in total.

### 2

N laser beams are either horizontal or vertical, each given by integer endpoints; overlapping collinear beams do not occur and intersections at endpoints count. For each horizontal beam in input order, output the number of vertical beams it intersects.

### 3

A timetable diagram has M horizontal time slots and K vertical resource intervals, all axis-aligned with integer coordinates, no collinear overlaps, and endpoints inclusive. If any horizontal and vertical slot intersect, report the pair (index_h, index_v) whose intersection has the smallest x-coordinate (break ties by smallest y); otherwise output NONE.

### 4

A grid circuit contains H horizontal wires and V vertical wires given by integer endpoints, with no overlapping collinear segments and inclusive endpoints. Find a point (x,y) where the product of the number of horizontal wires at y and vertical wires at x (i.e., total crossings at that point) is maximal, and output that coordinate and the crossing count; if multiple, output any.

### 5

There are N axis-aligned pipes, each declared horizontal or vertical with integer endpoints, no collinear overlaps, endpoints inclusive, and N≤100000. For each vertical pipe in input order, output how many horizontal pipes it intersects.

## D-013 — Monotone Deque Sliding Maximum

### 1

You are given n stock prices in chronological order and an integer k; for each contiguous time window of k prices, output the maximum price observed in that window.

### 2

Given n river gauge measurements and a fixed window length k, for every contiguous block of k readings print the minimum water level within that block.

### 3

Given n server CPU-usage percentages sampled once per second and a window size k, produce the highest CPU percentage for each contiguous k-second window.

### 4

Given n hourly temperature readings and an integer k, report the rolling maximum temperature for every contiguous k-hour window.

### 5

Given n sensor readings and a fixed window size k, for each contiguous window of k readings output the maximum reading and the 1-based index of its earliest occurrence inside that window.

## D-014 — Shortest Subarray at Least Target with Negatives

### 1

Given an integer n, a target T, and an array a[1..n] of signed integers representing daily donations (positives add, negatives remove), find the length of the shortest contiguous subarray whose sum is at least T. Output the minimal length or -1 if no such subarray exists.

### 2

Given n, a threshold K, and an array e[1..n] of signed integers for cell energy changes, find a shortest contiguous index segment [l..r] whose sum >= K; if several segments share minimal length return any one. Output the 1-based indices l and r, or -1 if impossible.

### 3

Given n, a target G, and a sequence p[1..n] of signed integers denoting daily net profit/loss, determine the minimum number of consecutive days whose cumulative profit is at least G. Output that minimal count, or -1 if unattainable.

### 4

Given n, required net flow W, and sensor readings s[1..n] (signed integers), find the shortest contiguous interval whose sum is at least W; if multiple shortest intervals exist choose the one with smallest left index. Output the 1-based left and right indices of that interval, or -1 if none exist.

### 5

Given n, threshold H, and an array c[1..n] of signed hydration changes at checkpoints, find the minimum-length contiguous block of checkpoints whose total hydration gain is at least H. Output the minimal length, or -1 if no qualifying block exists.

## D-015 — Max Subarray with One Deletion

### 1

An array of integers gives a player's point changes per minute; you may remove at most one minute's entry. Find the maximum total points of any contiguous time interval after optionally deleting one element and output that maximum sum.

### 2

Given daily profit/loss values for a trader, you may skip at most one day inside a contiguous holding period. Determine the largest possible net profit of any contiguous subarray after at most one skip and output that maximal sum.

### 3

You are given an array of integer temperature deviations with at most one faulty reading that can be repaired (removed). Compute the maximum sum over any contiguous block after optionally deleting one element, and output that maximum.

### 4

A sequence of integers represents game score differentials (+ for wins, − for losses); you may omit at most one game's differential to form a streak. Compute the maximum possible contiguous-streak sum after at most one removal and output it.

### 5

A time-ordered array of integer sensor readings may contain one corrupted measurement you can drop. Find the maximum achievable sum of a contiguous interval after optionally removing one element and output that value.

## D-016 — Palindromic Subsequence One-Dimensional DP

### 1

Given a DNA sequence string S of length n, compute the length of its longest palindromic subsequence and output that single integer.

### 2

Given a chat message string S, determine the minimum number of characters you must insert anywhere into S to make it a palindrome and output that minimum count.

### 3

Given an event log string S, find the minimum number of characters to delete from S so the remaining string is a palindrome; output that minimum deletion count.

### 4

Given a melody represented as a string S of note symbols, you may retain a subsequence of notes; find the maximum number of notes you can keep so the retained subsequence reads the same forwards and backwards, and output that maximum retained count.

### 5

Given a binary code string S, compute the maximum number of mirrored matching pairs you can form in a palindromic subsequence (i.e., the number of matched pairs, not counting a central single), and output that integer.

## D-017 — Weighted Interval Scheduling

### 1

Given n concerts, each with integer start time s_i, end time e_i, and ticket revenue r_i, choose a subset of concerts that do not overlap in time to maximize total revenue and output that maximum revenue.

### 2

You are given n freelance gigs described by start s_i, finish f_i, and payment p_i; select a set of pairwise non-overlapping gigs to maximize total payment and output the maximum achievable sum.

### 3

There are n advertising slots, each with interval [a_i, b_i) and profit v_i; pick a collection of disjoint slots (no overlapping time) to maximize total profit and output that optimal profit.

### 4

Given n reward events, each with start time, end time, and reward value, choose non-overlapping events to maximize the total reward collected and output the maximum total reward.

### 5

Given n TV broadcast intervals with start time, end time, and licensing value, select a set of non-overlapping broadcasts that maximizes the sum of values and output that maximum value.

## D-018 — Minimum Arrows for Interval Points

### 1

You are given n closed intervals [l_i, r_i] representing the vertical ranges of n balloons; an arrow shot at height x pops every balloon with l_i ≤ x ≤ r_i. Choose the minimum number of arrow heights so every balloon is popped, and output that minimum and any set of heights achieving it.

### 2

There are n machines each needing a single inspection at some time within its closed availability interval [s_i, e_i]. Find the smallest set of inspection instants (points in time) so every machine is inspected within its interval, and output the count and one valid set of instants.

### 3

Along a straight highway there are n road segments where a speed-check must occur, each requiring a checkpoint placed at some position in the closed interval [a_i, b_i]. Determine the minimum number of point checkpoints that cover all segments and output that number and one feasible set of positions.

### 4

n clients each give a closed availability window [u_i, v_i] when they can attend a one-minute meeting (treated as an instantaneous time point contained in the interval). Compute the minimal number of meeting time-points needed so every client is assigned to a time within their window, and return that count and an example schedule.

### 5

A network of n sensors produces events requiring a snapshot during each closed time-window [t_i, s_i]. Pick the fewest snapshot times (instants) so every event window contains at least one snapshot; output the minimal number and one set of snapshot times.

## D-019 — Gas Circuit Start Invariant

### 1

Given two arrays gas[] and cost[] of length n representing gas gained at station i and gas required to drive from i to (i+1) mod n, determine an index s (0-based) from which a vehicle starting with zero gas can complete the full circular route without the tank ever going negative; output the index or -1 if impossible.

### 2

You have n charging pads in a circle; arrays charge[i] and drain[i] give energy obtained at pad i and energy consumed to reach the next pad. Find the smallest index s (0-based) where a drone starting with zero energy can traverse all n pads in order without its battery dropping below zero, or output -1.

### 3

A caravan visits n oases arranged circularly; at oasis i you receive supply[i] units and must spend need[i] units to reach the next oasis. Identify a starting oasis index s (0-based) such that beginning with zero supplies the caravan completes one full loop without running out, or return -1 if no such start exists.

### 4

A delivery truck makes a circular route of n stops; revenue[i] is collected at stop i and toll[i] is paid to travel to (i+1)th stop. Decide a start index s (0-based) from which the truck starting with zero balance can complete the circuit without the balance going negative; output the smallest valid s or -1 when none exists.

### 5

In a circular water-supply loop of n nodes, node i contributes water[i] and the pipe to the next node consumes use[i]. Determine a starting node index s (1-based) such that starting with zero water and visiting nodes in order you never have negative water and complete the loop; output s or 0 if impossible.

## D-020 — Minimum Initial Health via Reverse Greedy

### 1

Given an array of n integers representing health changes in a fixed sequence of dungeon rooms visited in order, compute the smallest positive integer initial health such that after applying each room's change sequentially the health never falls below 1. Output that initial health value.

### 2

You are given a list of n integers representing sequential bank transactions (positive deposits or negative withdrawals). Determine the minimum positive starting balance so the running balance after each transaction is at least 1, and output that starting balance.

### 3

A spaceship travels through n sectors with an array of integer shield gains or damages in order. Find the minimal positive initial shield value that keeps the shield strictly above zero after every sector (i.e., at least 1) and output that value.

### 4

Given n integers describing net battery change on each consecutive leg of a drone's flight, compute the smallest positive initial charge that ensures the charge never drops below 1 at any point along the fixed route. Return that minimal initial charge.

### 5

A runner goes through n checkpoints with integer stamina changes listed in order; determine the minimum positive starting stamina so the runner's stamina remains at least 1 after every checkpoint. Output the minimum starting stamina.

## D-021 — Maximum Product Subarray Sign States

### 1

Given integer n (1 ≤ n ≤ 200000) and an array a1..an of signed integers representing daily growth multipliers, find the maximum product over any non-empty contiguous subarray and output that product as a signed 64-bit integer. It is guaranteed the maximum product fits in a signed 64-bit integer.

### 2

Given n (1 ≤ n ≤ 200000) and an array r1..rn of signed integers representing multiplicative reliability factors for successive modules, choose a contiguous segment whose product is maximal; output three integers: the maximum product and the 1-based start and end indices of any segment achieving it. It is guaranteed the maximum product fits in a signed 64-bit integer.

### 3

Given n (1 ≤ n ≤ 200000) and an array s1..sn of signed integers representing level score multipliers, find a non-empty contiguous streak with maximal product; among all maximal-product streaks output the product and the minimal possible length of such a streak. It is guaranteed the maximum product fits in a signed 64-bit integer.

### 4

Given n (1 ≤ n ≤ 200000) and an array b1..bn of signed integers representing sensor multiplicative adjustments, find the contiguous subarray with maximum product and, if there are ties, choose the one with the earliest starting index; output the product and the 1-based starting index. It is guaranteed the maximum product fits in a signed 64-bit integer.

### 5

Given n (1 ≤ n ≤ 200000) and an array m1..mn of integers denoting efficiency multipliers, locate a non-empty contiguous subarray whose product is maximal and output the product followed by the list of its elements (in order); if multiple choices exist output any one. It is guaranteed the maximum product fits in a signed 64-bit integer.

## D-022 — Kth Smallest Pair Distance

### 1

Given n real-valued sensor positions on a line and an integer k, compute the k-th smallest absolute distance among all unordered sensor pairs (distance = |x_i - x_j| for i<j). Output that distance.

### 2

Given a list of n event timestamps (integers) and an integer k, determine the k-th smallest time separation between any two events (consider unordered pairs). Output the separation as an integer.

### 3

You are given n integer positions of sentries along a wall and an integer k; among all unordered pairs of sentry positions, find the k-th smallest gap (absolute difference). Print that gap.

### 4

Given n pitch values for musical notes (integers) and an integer k, consider every unordered pair of notes and their absolute pitch interval; return the k-th smallest interval value.

### 5

Given n one-dimensional locations of crates on a conveyor and an integer k, compute the k-th smallest pairwise distance between distinct crates (unordered pairs). Output that distance.

## D-023 — Modular Prefix Remainder Pair Count

### 1

Given an integer n, a fixed positive modulus k, and a static sequence of n integers, count how many contiguous subarrays have a sum that is divisible by k; output that total count.

### 2

You are given daily event counts for n consecutive days and a fixed positive integer k; determine the number of ordered pairs of days (i,j) with 1≤i≤j≤n for which the total events from day i through j is divisible by k, and print the count.

### 3

Given n transaction amounts and a single positive modulus k, compute how many non-empty contiguous batches (consecutive transactions) have a total amount that is a multiple of k; output the number of such batches.

### 4

A sensor produces a static sequence of n integer readings and you are given a positive integer k; find the number of intervals [l,r] with 1≤l≤r≤n whose cumulative reading sum is congruent to 0 modulo k, and return that count.

### 5

Given an array of n integers and a fixed positive modulus k, count the number of pairs of cut positions 0≤a<b≤n (cuts between elements) such that the sum of elements strictly between the cuts is divisible by k; output the total number of such pairs.

## D-024 — Prime-Factor Mask Compatibility

### 1

Given N positive integers (each ≤10^6) whose prime divisors all lie inside a provided universe of at most 20 primes, treat each integer by the set of distinct primes dividing it (ignore multiplicities) and compute the size of the largest subset of these integers that are pairwise coprime (no two share a prime). Output the maximum size.

### 2

You have M recipes, each encoded by an integer (≤10^6) whose distinct prime factors come from a known list of at most 20 ingredient-primes; a recipe requires the set of its distinct prime divisors. Given K, decide whether you can choose K recipes whose ingredient sets are pairwise disjoint. Output whether such a selection exists.

### 3

Given a collection of N resource modules labeled by integers (≤10^6) whose distinct prime factors are drawn from a universe of at most 20 primes, determine the minimum number of modules to remove so that the remaining modules have pairwise disjoint prime-factor sets (i.e., every pair is coprime). Output that minimum removal count.

### 4

Given an array of N numbers (each ≤10^6) guaranteed to factor only over at most 20 distinct primes overall, count how many unordered pairs (i<j) have gcd equal to 1 (equivalently, their prime-factor bitmasks are disjoint). Output the count of coprime pairs.

### 5

You are given N tasks; each task has a positive integer weight and is represented by an integer (≤10^6) whose distinct prime divisors lie in a universe of at most 20 primes. Choose a subset of tasks whose prime-factor sets are pairwise disjoint to maximize the sum of weights, and output the maximum total weight.

## D-025 — Binomial Path Count with Obstacles

### 1

Given an H by W grid (0≤H,W≤10^6) and k forbidden cells (0≤k≤8) specified by integer coordinates, count the number of monotone paths from (0,0) to (H,W) using only right and down moves that do not visit any forbidden cell; output the answer modulo a given prime p.

### 2

On an H by W grid (≤10^6) a courier must travel from (0,0) to (H,W) with one mandatory checkpoint C and k forbidden cells (total special coordinates ≤8); using only right and down moves, compute how many monotone routes visit C at least once while avoiding every forbidden cell, modulo prime p.

### 3

Given H,W (≤10^6) and k special checkpoints (k≤8) on the grid, determine the number of monotone paths from (0,0) to (H,W) that visit exactly r of those checkpoints (r given, 0≤r≤k), moving only right or down; report the count modulo a specified prime p.

### 4

Given start S=(sx,sy) and target T=(tx,ty) with 0≤sx≤tx≤H, 0≤sy≤ty≤W, grid bounds H,W≤10^6, and k forbidden cells (k≤8), count monotone right/down paths from S to T that avoid all forbidden cells and return the result modulo the given prime p.

### 5

On an H by W grid (H,W≤10^6) you are given two disjoint lists: F of k_f forbidden cells and M of k_m marked checkpoints with k_f+k_m≤8; count monotone paths from (0,0) to (H,W) that avoid every cell in F and visit at least one cell in M, using only right and down moves, modulo the provided prime p.

## D-026 — Bitwise OR Distinct Subarrays

### 1

Given an array A of n nonnegative 32-bit integers, consider the bitwise OR of every contiguous subarray of A; compute how many distinct integer values appear among all those subarray OR results. Return that count.

### 2

You are given a list of n device permission masks (nonnegative 32-bit integers). For any contiguous block of devices, the combined permission is the bitwise OR of their masks; determine the number of distinct permission masks that can be produced by some contiguous block and output that count.

### 3

An inventory has n items, each labeled with a 32-bit nonnegative feature mask. For every contiguous segment of items, the accumulated feature mask is the bitwise OR of masks in the segment; count how many distinct accumulated feature masks exist across all contiguous segments and output that number.

### 4

Given an array B of n nonnegative 32-bit integers, consider the bitwise AND of every contiguous subarray of B; compute the total number of distinct integers that occur as such subarray AND results and output that count.

### 5

You have a sequence of n paint bottles, each described by a 32-bit nonnegative color mask. Mixing any contiguous sequence yields the bitwise OR of their masks; determine how many distinct mixed color masks are obtainable from all contiguous sequences and return that count.

## D-027 — Nim XOR Winner

### 1

Given n piles of coins; players alternate removing any positive number of coins from a single pile and the player who takes the last coin wins. Given the n pile sizes, determine which player has a forced win and output either "First" or "Second". (n up to 200000.)

### 2

Alice and Bob play on m energy cells with nonnegative charge values; each turn a player reduces one cell by any positive integer (cannot increase), and the player who makes the final reduction to zeroes wins. Given the m charges, output "YES" if the starting player has a winning strategy, otherwise "NO". (m ≤ 200000.)

### 3

There are k treasure chests each containing some jewels; players alternately remove a positive number of jewels from a single chest, with normal play (last move wins). Given the k chest counts, print 1 if the first player can force a win, otherwise print 2. (k ≤ 200000.)

### 4

On a table are t stacks of tokens; a move consists of choosing one stack and removing any positive number of tokens from that stack, and the player who makes the last move wins. Given the t stack sizes, output the name of the winner: either "White" for the first player or "Black" for the second. (t up to 200000.)

### 5

A fleet of s servers hold integer loads; two admins alternate reducing the load on a single server by any positive integer amount, and the admin who performs the final reduction when all loads become zero wins. Given the s load values, decide whether the starting admin can force a win and print "Win" or "Lose". (s ≤ 200000.)

## D-028 — Bitmask Traveling Path with Tiny Nodes

### 1

Given n ≤ 16 locations and an n×n matrix of nonnegative travel costs (directed, complete graph), compute the minimum total cost of a Hamiltonian cycle that starts and ends at node 0 and visits every node exactly once; output the minimal cost or -1 if no such tour exists.

### 2

You are given n ≤ 16 checkpoints and an n×n symmetric distance matrix for an undirected complete graph plus a starting index s; find the minimum total distance of a route that starts at s and visits every checkpoint exactly once (end node may be any checkpoint). Output the minimal distance or -1 if impossible.

### 3

A delivery drone must leave base b, visit all n ≤ 16 customer nodes exactly once, and return to base; input is an n×n matrix of possibly asymmetric flight costs. Compute and output the minimal round-trip cost to visit every customer and return to b (or -1 if not possible).

### 4

Given n ≤ 16 warehouses with a directed weighted complete graph (n×n cost matrix) and two distinct special nodes A (start) and B (end), find the minimum cost of a path that starts at A, ends at B, and visits each warehouse exactly once. Output the minimum cost or -1 if no such path exists.

### 5

A tour company has n ≤ 16 sights with given pairwise travel costs (n×n matrix; unreachable pairs encoded by a large value). Find the minimal-cost Hamiltonian tour that visits every sight exactly once and returns to the same start node of your choice; output the minimal tour cost or -1 if no full tour exists.

## D-029 — Network Broadcast Delay Dijkstra

### 1

You are given a static directed graph of N stations and M edges; each edge u->v has a nonnegative integer transmission delay w, and a single source S begins sending a packet at time 0. Compute the minimum time after which every station has received the packet, or output -1 if some station is unreachable.

### 2

A network of towns is connected by one-way roads with nonnegative integer travel times on each road; an emergency alert originates from town S at time 0. Determine the earliest time by which all towns will have the alert, or report -1 when one or more towns cannot be reached.

### 3

Outposts are connected by directed laser links; each link u->v has a nonnegative integer propagation delay w and a central relay S emits a signal at time 0. Find the smallest time T such that every outpost has received the signal (or return -1 if any outpost is unreachable).

### 4

A fleet dispatch center S sends updates through a directed drone route network where each route u->v takes a nonnegative integer time w to traverse. Calculate the minimum time needed for every hub to receive the update from S, or output -1 if some hubs are unreachable.

### 5

Servers exchange market updates over directed links with nonnegative integer latencies w on each link; a primary server S issues an update at time 0. Compute the time when the last server receives the update, or output -1 if any server cannot be reached.

## D-030 — Tree Maximum Independent Set

### 1

Given an undirected tree with n nodes (n ≤ 200000) and an integer weight on each node, choose a subset of nodes no two of which are adjacent to maximize the sum of their weights; output that maximum sum.

### 2

A company has a tree of employees where each node has an integer influence value; you must select a committee of employees with no manager–direct-report pair both chosen to maximize total influence—given the tree and weights, output the maximum achievable total influence.

### 3

You are given a tree-shaped layout of locations and an integer security benefit for placing a sensor at each node; sensors cannot be placed at adjacent nodes. Given n and the node benefits, compute the maximum total security benefit.

### 4

A garden is modeled as a tree of plots with integer beauty values (possibly negative). Pick a set of plots to plant such that no two adjacent plots are chosen; report the maximum total beauty achievable.

### 5

Given a network tree of servers with integer capacities on nodes and the rule that neighboring servers cannot be simultaneously activated, determine the maximum total capacity attainable by choosing a nonadjacent set of servers; output that maximum.

## M-001 — XOR Missing-and-Duplicate Separation

### 1

Given an array of n integers that should contain each value from 1 to n but has exactly one value missing and one value duplicated, identify and output the missing number and the duplicated number.

### 2

You receive n ticket IDs, each supposed to be a distinct integer from L to L+n-1; however exactly one ID is missing and a different ID appears twice. Given n, L, and the list, output the missing ID and the repeated ID.

### 3

A deck of n cards is labeled with consecutive integers S..S+n-1 but one label is absent and another is printed twice. Given the list of n labels, determine and print the duplicated label and the missing label.

### 4

An audit provides n employee badge numbers drawn from consecutive IDs A..A+n-1 containing exactly one duplicate and one omission. Given the list of badge numbers, return two integers: the missing badge number and the duplicated badge number.

### 5

A stream of n sensor node IDs comes from a consecutive range B..B+n-1 but contains exactly one missing ID and one ID that appears twice; given the list of readings, output the absent ID followed by the duplicated ID.

## M-002 — Prefix-XOR Maximum Pair via Trie

### 1

You are given an array of n nonnegative 30-bit integers representing packet bitmasks. Find the maximum XOR obtainable by any contiguous subarray and output that maximum XOR value as a nonnegative integer.

### 2

Given a sequence of n nonnegative 30-bit integers encoding genome marker masks, identify the strongest toggle segment — the contiguous interval whose XOR is maximal. Output two 1-based indices L and R (L ≤ R) delimiting any interval that achieves this maximum.

### 3

A log contains n nonnegative 30-bit sensor readings; a mask-difference interval is the XOR of a contiguous subarray. Compute the maximum such XOR, and among intervals achieving it report the shortest length; output the maximum XOR value and that minimal length.

### 4

Given an array of n nonnegative 30-bit integers representing game move masks, compute the maximum XOR over all contiguous subarrays and print that mask as a 30-character binary string (MSB first) of '0'/'1'.

### 5

Given n nonnegative 30-bit integers, find the maximum XOR of any contiguous subarray; output a pair of prefix indices (i, j) with 0 ≤ i < j ≤ n such that the XOR of elements from index i+1 to j equals that maximum (zero-based prefix indexing), any valid pair if multiple exist.

## M-003 — Parity Mask Even-Count Substrings

### 1

You are given a string S composed only of the letters {a,b,c,d}; count the number of contiguous substrings in which each of the letters a and c appears an even number of times (letters b and d may appear arbitrarily). Output the total count of such substrings.

### 2

A hallway has N tiles labeled by characters from the set {R,G,B}, where stepping on R toggles lamp 0, G toggles lamp 1, and B toggles lamp 2. Count how many contiguous segments of tiles leave all three lamps toggled an even number of times (equivalently, all lamps off). Return that count.

### 3

Given a lowercase string S over the alphabet {a,e,i,o,u} (vowels only), compute the number of substrings in which every vowel appears an even number of times. Output the total number of such substrings.

### 4

You are given a string S where each character is one of ten symbols {x0,x1,...,x9}; each symbol xi corresponds to a fixed subset of four binary switches it toggles. Count contiguous substrings whose cumulative toggles leave every switch toggled an even number of times (overall parity zero). Return the count.

### 5

Given a string composed from three bracket types '(',')','[',']','{','}', treat each bracket type as a category (ignore orientation). Count the number of contiguous substrings in which each bracket type occurs an even number of times. Output that count.

## M-004 — Subarray Bitwise AND Closest Target

### 1

Given an array A of nonnegative 32-bit integers and a target integer T, consider the bitwise AND of every contiguous subarray; find and output the subarray AND value whose absolute difference to T is minimal. Treat equal AND values that end at the same index as a single state (i.e., only distinct ending ANDs matter).

### 2

You are given an ordered list of permission masks (32-bit nonnegative integers) and a target mask T; for every contiguous block its permission intersection is the bitwise AND of the block — find and output the intersection value nearest to T by absolute difference. When enumerating candidates you only need to keep distinct AND values that end at each position.

### 3

An array of sensor risk-masks and a numeric threshold T are provided; for every contiguous subsequence define its risk as the bitwise AND of its entries and choose the risk mask that minimizes |risk - T|. Output that minimizing risk mask, noting identical AND results ending at the same index can be deduplicated.

### 4

Given a sequence of feature-flag words (32-bit nonnegative integers) and a target mask T, find any contiguous segment whose bitwise AND has the smallest absolute difference to T and output the 1-based starting index of such a segment. You may compress states by retaining only distinct AND values that end at each index.

### 5

Given an array A and a target integer T, consider the bitwise AND of every contiguous subarray and compute the minimal absolute difference |AND - T| among them; output that minimal difference as an integer. Equivalent AND values that end at the same position are redundant and should be considered only once.

## M-005 — Minimal Operations via Power-of-Two Popcount

### 1

You are given a nonnegative integer N (0 ≤ N ≤ 10^18). In one operation you may add or subtract any power of two 2^k (k ≥ 0) to N. Output the minimum number of operations required to reduce N to 0.

### 2

Given two nonnegative integers A and B (≤ 10^18), an operation consists of adding or subtracting any power of two 2^k to A. Compute the minimum number of operations to change A into B.

### 3

Given an array of N integers a1..aN (each 0 ≤ ai ≤ 10^18), an operation picks an index i and adds or subtracts any power of two 2^k to ai. Determine the minimum number of operations to make all array elements equal.

### 4

Two piles contain integer weights X and Y (0 ≤ X,Y ≤ 10^18); each pile is a sum of chips whose sizes are powers of two. In one move you may take a single chip of size 2^k from one pile and place it on the other (changing the piles by ±2^k). Find the minimum number of moves to make the two piles equal.

### 5

You are given nonnegative counts c0,c1,...,cK (sum ci·2^i ≤ 10^18) describing how many unit tokens sit at each power-of-two position; an operation increments or decrements a single ci by 1 (adding or removing one 2^k contribution). Given a target integer T (0 ≤ T ≤ 10^18), output the minimum number of operations to change the distribution so its total value equals T.

## M-006 — GCD Reachability by Global Invariant

### 1

Given n integers a1..an and a target integer T, you may repeatedly pick i≠j and replace ai with |ai - aj|. Decide whether it is possible to reach a state where every ai equals T. Output YES or NO.

### 2

You are given n integer token positions x1..xn (positions may become negative) and a target K. In one move you choose i≠j and replace xi by either xi + xj or xi - xj. Determine whether some token can be made to occupy coordinate K; output YES or NO.

### 3

Given n integer scores s1..sn and target 0, you may repeatedly choose i≠j and set si := si ± sj (sign chosen each time). Decide whether it is possible to make all scores equal to 0. Output YES or NO.

### 4

You have n ropes with integer lengths L1..Ln and a desired length L. You may repeatedly pick i≠j and replace Li with |Li - Lj|. Determine if it is possible to obtain at least one rope of length exactly L; answer YES or NO.

### 5

There are n beacons at integer coordinates p1..pn and a target coordinate P. In a move choose i≠j and move beacon i to |pi - pj|. Decide whether you can reach a configuration in which all beacons sit at position P. Output YES or NO.

## M-007 — Smallest Period by GCD Structure

### 1

Given two non-empty strings A and B, find the shortest non-empty string X such that A is X repeated i times and B is X repeated j times for some positive integers i,j. Output X if it exists, otherwise output -1.

### 2

Given a string S, determine the shortest non-empty block B such that S equals B repeated k times for some integer k≥1. Output the length of B (output 0 if S is empty).

### 3

Given two strings S and T, let g = gcd(|S|,|T|). Find the shortest string U whose length divides g and such that both S and T are concatenations of U; output the length of U, or -1 if no such U exists.

### 4

Given two strings P and Q representing periodic signals, count how many distinct non-empty strings U exist such that both P and Q can be formed by repeating U. Output that count.

### 5

Given a string R (possibly empty), return the actual shortest non-empty motif M such that R is equal to M repeated k times for some k; if R is empty output an empty string, and if the only motif is R itself output R.

## M-008 — Digit-DP-Free Digit Count Formula

### 1

Given a positive integer N, count how many times the digit '1' appears in the decimal representations of all page numbers from 1 through N inclusive; output the total count.

### 2

A factory stamps consecutive serials from 1 to N. Given N and a digit d (1–9), compute the total number of occurrences of digit d in the decimal forms of all serial numbers 1..N; output that integer.

### 3

An odometer shows readings from 1 to N without leading zeros; for a given N, count the total appearances of the digit '0' in the decimal representations of all readings 1..N (do not count leading zeros); output the count.

### 4

Street addresses are numbered 1 to N. Given N, determine how many times the digit '7' appears across all address numbers from 1 through N inclusive; output the total occurrences.

### 5

Tickets for an event are labeled 1..N. Given N and a fixed digit k between 1 and 9, compute how many times digit k appears when writing all ticket numbers from 1 to N in decimal; output that total.

## M-009 — Chinese Remainder Construction for Coprime Moduli

### 1

Several wall clocks are set so that the true minutes past midnight X satisfy X ≡ a_i (mod m_i) for i=1..k; you are given k≤5 pairs (a_i,m_i) with positive, pairwise-coprime m_i and product M fitting in 64 bits. Construct the unique residue X in [0,M) that satisfies all congruences and output X and M.

### 2

k≤5 traffic lights repeat every m_i seconds and have an initial offset a_i, with all m_i positive and pairwise coprime and product M within 64 bits. Compute the unique timestamp T modulo M such that T≡a_i (mod m_i) for every light and return T (0≤T<M).

### 3

A treasure chest requires entering a code X that leaves remainder a_i when divided by m_i for i=1..k; the m_i are positive, pairwise-coprime, k≤5, and their product M fits in 64 bits. Find the unique code X in the range [0,M) satisfying all congruences and output X.

### 4

k≤5 LED strips blink with periods m_i and per-strip phase offset a_i; all m_i are positive and pairwise coprime with product M within 64 bits. Determine the unique moment t modulo M (0≤t<M) with t≡a_i (mod m_i) for every strip and output t.

### 5

Five machines on an assembly line cycle every m_i minutes and produce a special item after offset a_i; given k≤5 pairs with pairwise-coprime positive m_i and product M that fits in 64 bits, compute the unique timestamp S in [0,M) satisfying S≡a_i (mod m_i) for all i and output S.

## M-010 — Mobius-Free Coprime Pair Count by Divisor Sieve

### 1

Given an array of n integers a1..an with values in [1,V] (V ≤ 100000), compute the number of unordered pairs (i<j) such that gcd(ai,aj)=1 and output that single integer count.

### 2

Given a multiset of n labeled coins with values ai in [1,V], output the number of ordered pairs (i,j), i≠j, for which ai and aj are coprime; return that count.

### 3

Given a frequency array f[1..V] describing a multiset of n items (values in [1,V]), determine how many distinct values x with f[x]>0 have at least one other item y in the multiset (y at a different index) satisfying gcd(x,y)=1; output that number.

### 4

Given an array of n integers ai in [1,V], compute the number of unordered pairs 1≤i<j≤n with gcd(ai,aj)=1 but exclude any pair where either ai=1 or aj=1; output the resulting count.

### 5

Given n integers ai in [1,V], count the number of unordered pairs (i<j) whose gcd(ai,aj)>1 (i.e., they share some divisor >1) and output that single integer.

## M-011 — Circular Prefix Minimum Rotation

### 1

You are given a circular string of parentheses of length n where '(' counts +1 and ')' counts -1 and the total sum is nonnegative. Find an index k (1..n) such that, starting at k and reading the n characters cyclically, every prefix cumulative sum is >= 0; output any such k.

### 2

Two arrays gas[1..n] and cost[1..n] are arranged on a circular route and satisfy sum(gas)-sum(cost) >= 0. Find a station index s (1..n) where a car starting with zero fuel can drive the entire cycle in order without fuel ever dropping below zero; output s.

### 3

A circular sequence of monthly net incomes a[1..n] (positive or negative) has total sum >= 0. Choose a starting month m (1..n) so that, over the next n months taken cyclically from m, the running balance never becomes negative; output m.

### 4

There are n production shifts in a cycle; shift i produces p[i] units and immediately must meet demand d[i], with total production minus total demand >= 0. Find a shift index t (1..n) to begin the schedule so accumulated inventory never goes negative during one full cyclic pass; output t.

### 5

Around a circular fair there are n stalls; stall i receives supply s[i] and must serve r[i] customers, and overall sum(s)-sum(r) >= 0. Pick a stall index u (1..n) to start restocking and visiting stalls cyclically so the running stock never falls below zero; output u.

## M-012 — Lexicographically Smallest Adjacent-Swap Transform

### 1

You are given a string S of length n (n ≤ 2000) over the alphabet {a,b,c,d} and an integer k; an adjacent swap between neighbors costs 1 (so moving a character from index i to j<i costs i-j). Using at most k swaps, produce the lexicographically smallest string obtainable and output it.

### 2

A left-to-right queue of n colored tokens labeled from {1,2,3} and an integer k are given; you may repeatedly swap any token with its immediate left neighbor at cost 1 per swap (moving a token left by d positions consumes d of your budget). Return the lexicographically smallest sequence of labels achievable within k swaps.

### 3

Given a decimal digit string of length n and budget k, you may pick any digit and swap it left one position per operation (each adjacent swap costs 1). Using at most k such swaps, output the smallest possible digit string (interpreted lexicographically) you can form.

### 4

You hold a sequence of n playing cards whose ranks come from {A,2,3,4} and an integer k; each adjacent swap of neighboring cards costs 1 so shifting a card left by d uses d budget. Rearrange with at most k swaps to produce the lexicographically smallest rank sequence and print it.

### 5

A row of n labeled beads (labels drawn from a three-letter set) and an integer k are given; you may repeatedly exchange a bead with its left neighbor at unit cost per swap (distance moved reduces the budget accordingly). Compute and output the lexicographically smallest bead-label sequence obtainable using at most k adjacent swaps.

## M-013 — Maximum Subsequence Score by Sort-and-Heap

### 1

You are given n athletes, each with two positive integers stamina_i and focus_i. Select exactly k athletes to form a team; the team score is (sum of stamina of selected) multiplied by (minimum focus among selected). Compute the maximum possible team score.

### 2

There are n machines, machine i has positive throughput p_i and reliability r_i. Choose exactly k machines to operate; the batch performance equals (sum of chosen p_i) * (minimum chosen r_i). Output the maximum achievable performance.

### 3

Given n server instances where instance i has positive capacity c_i and uptime u_i, pick exactly k instances to serve a workload. The service metric is (sum of selected c_i) times (minimum selected u_i). Return the maximum possible metric.

### 4

You have n research proposals, each with positive benefit b_i and confidence q_i. Fund exactly k proposals; the portfolio value equals (sum of chosen b_i) * (minimum chosen q_i). Determine the largest possible portfolio value.

### 5

A supplier lists n component types, each with positive value v_i and durability d_i. Purchase exactly k components; the product score is (sum of chosen v_i) * (minimum chosen d_i). Compute the maximum product score.

## M-014 — Minimum Adjacent Merge Palindrome Greedy

### 1

Given a row of n positive stone piles a1..an, one operation merges two adjacent piles into a single pile whose stones equal their sum (each merge counts as 1). Compute the minimum number of adjacent merges required to make the sequence of pile sizes a palindrome; output that minimum integer.

### 2

You are given n positive integer bead-counts b1..bn arranged along a thread; an operation joins two neighboring beads into one with weight equal to their sum (cost 1 per join). Determine the least number of adjacent joins needed so the sequence reads the same left-to-right and right-to-left, and output that number.

### 3

Given n positive cargo crates with loads c1..cn in a line, an operation merges two adjacent crates into one crate with load equal to their sum (each merge counts as one operation). Find the minimum number of adjacent merges required to make the sequence of loads palindromic and output that integer.

### 4

A sequence of n positive shelf-weights w1..wn is given; in one operation you may fuse two adjacent shelves into a single shelf whose weight is the sum of the two (each fusion costs 1). Compute the minimum number of adjacent fusions needed so the weight sequence becomes a palindrome, and output that minimum.

### 5

There are n train cars with positive package counts p1..pn; an operation couples two neighboring cars into one car holding the sum of their packages (count each coupling as one merge). What is the minimum number of adjacent couplings required to transform the list of package counts into a palindrome? Output that minimum integer.

## M-015 — Median Equals Minimizer Invariant

### 1

Given n integers representing friends' house coordinates on a line, choose a meeting house that must be one of the given coordinates to minimize the sum of absolute distances from all houses; output the chosen house coordinate and the minimal total distance. If multiple coordinates achieve the minimum, output any one of them.

### 2

Given n integer delivery addresses on a straight road, choose any integer hub coordinate (not required to be an input address) that minimizes the total absolute travel distance; output the minimal total distance.

### 3

Given n integer preferred temperatures from different rooms, pick a single integer thermostat setting that minimizes the sum of absolute deviations from the preferences; output any minimizing temperature and the minimal total deviation.

### 4

Given n integers for storage-site positions along a highway, find the smallest integer coordinate (ties broken by taking the smallest coordinate) that minimizes the total absolute distance to all sites, and output that coordinate and the corresponding minimal total distance.

### 5

Given n integer street-intersection coordinates representing emergency call frequencies (one coordinate per call), place a single ambulance at one of the given intersection coordinates to minimize the sum of absolute distances to all calls; output the chosen intersection coordinate (if multiple optimal intersections exist, output the smallest coordinate) and the minimal total distance.

## M-016 — Permutation Cycle Minimum Swaps

### 1

You are given an array A of length n that is a permutation of 1..n. In one operation you may swap any two elements. Compute the minimum number of swaps required to transform A into the identity order [1,2,...,n]. Output a single integer answer.

### 2

A row of n distinct ticket-holders is listed by their unique names in current order. The target arrangement is the names sorted in lexicographical order. In one move you may swap any two people; compute the minimum number of swaps to reach the lexicographic order and output that count.

### 3

n uniquely labeled crates numbered 0..n-1 occupy slots 0..n-1 in some permuted order. Any move swaps two crates. Determine the minimum number of swaps required so that crate i is in slot i for all i, and output that minimum.

### 4

You have an array of n distinct integers (no duplicates). A single operation swaps any two elements; the goal is to reorder the array into nondecreasing order (increasing by value). Compute and output the minimum number of swaps needed to sort the array.

### 5

Given two arrays of length n containing the same n distinct IDs: the first is the current order and the second is the desired target order. You may swap any two positions in one operation. Compute the minimum number of swaps to transform the current array into the exact target array and output that number.

## M-017 — Functional Graph Cycle Entry

### 1

You are given n nodes numbered 0..n-1 and an array next[0..n-1] with next[i] in 0..n-1 that tells the single successor of node i, plus a start index s; follow successors from s until values repeat. Determine whether this successor chain reaches a cycle and output the index of the first node that belongs to that cycle (the entry reachable from s). Constraints: n ≤ 1e6; expected O(n) time, O(1) extra memory.

### 2

A network of m teleporters is described by an array to[1..m] where each teleporter i sends you to to[i] (1 ≤ to[i] ≤ m); you are dropped into teleporter s. Following the teleport chain, detect if you eventually enter a repeating loop and output the teleporter id where the loop first begins (the first repeated-state entry reachable from s). m ≤ 1e6; O(m) time, O(1) extra.

### 3

A deterministic game loop has N states labeled 0..N-1 and a transition function next_state[i] in 0..N-1 for every state; play starts at state S. Simulate the state transitions to decide whether play falls into a cycle and return the state index that is the entry point of the cycle reachable from S. N ≤ 10^6; O(N) time, O(1) extra.

### 4

You have an array jump[0..n-1] where executing instruction at index i transfers control to jump[i] (always 0..n-1); execution begins at index 0. Determine if execution eventually repeats an instruction and output the smallest index that is the entry point of that repeating cycle reachable from 0. n ≤ 1,000,000; O(n) time, O(1) extra.

### 5

There are P portals labeled by integers 1..P; portal_map[i] (1 ≤ portal_map[i] ≤ P) is the unique portal you arrive at after using portal i, and you start at portal s. Follow portal_map repeatedly to detect a loop and output the label of the first portal that lies on the repeating cycle reached from s. P ≤ 10^6; O(P) time, O(1) extra.

## M-018 — Tree XOR Path Pairing Reduction

### 1

Given a tree with n nodes and XOR-weighted edges rooted at node 1, compute each node's XOR-to-root label; given integer T, output the number of unordered node pairs (u,v) with u<v whose path XOR equals T.

### 2

Given a rooted tree with XOR edge weights, define each node's XOR label relative to root 1; given target T, output the number of ordered pairs (u,v), u!=v, such that the XOR along the path u–v equals T.

### 3

In a static tree of sensors with XOR-weighted links and root 1, compute root-XOR labels; given T, determine whether there exists any pair of nodes whose path XOR equals T and output YES or NO.

### 4

Each node in a tree is colored red or blue and edges have XOR weights; using root 1 compute every node's XOR-to-root label; given T, output the count of unordered pairs (u,v) that share the same color and whose path XOR equals T.

### 5

A network tree gives each edge two fixed XOR states (primary and toggled) plus a selection bit per edge fixing which state applies; compute node XOR-to-root labels from root 1 using those fixed weights and, given T, output the number of unordered node pairs whose path XOR equals T.

## M-019 — Topo Order Uniqueness via Forced Frontier

### 1

Given N software modules numbered 1..N and M directed dependency pairs (A->B) meaning A must be built before B, decide whether there is exactly one valid build sequence. Output UNIQUE if exactly one topological ordering exists, MULTIPLE if more than one, and IMPOSSIBLE if no ordering exists due to a cycle.

### 2

You are given N courses and M prerequisite relations (X->Y) indicating X is required before Y. Determine whether the prerequisites force a single possible semester ordering. Print UNIQUE when exactly one topological order exists, MULTIPLE when several exist, and IMPOSSIBLE if prerequisites contain a cycle.

### 3

A chef has N recipe steps and M directed constraints (u->v) meaning step u must precede step v. Decide if the constraints yield exactly one feasible step sequence. Return UNIQUE if the topological order is unique, MULTIPLE if ambiguous, and IMPOSSIBLE if the constraints are cyclic.

### 4

There are N components and M directed assembly rules (p->q) meaning p must be attached before q. Given the directed edges, determine whether the assembly has a single deterministic sequence. Output UNIQUE for exactly one topological ordering, MULTIPLE for more than one, and IMPOSSIBLE if no ordering exists.

### 5

Given N ranked items and M precedence relations (a->b) meaning a must appear before b, decide whether these directed constraints determine a single linear ranking. Print UNIQUE when exactly one topological order exists, MULTIPLE when multiple valid rankings exist, and IMPOSSIBLE if the relations form a cycle.

## M-020 — Bitset LCS for Small Alphabet

### 1

Given two DNA strings S and T of lengths n and m (each ≤ 50,000) over the alphabet {A,C,G,T}, compute the length of their longest common subsequence and output that integer.

### 2

Given two typing logs S and T of lengths n and m (each ≤ 50,000) over lowercase letters 'a'–'z', compute floor(100 * LCS(S,T) / max(n,m)) and output this integer percentage similarity.

### 3

Given two melody lines S and T (n,m ≤ 50,000) over note symbols 'A'–'G', compute the minimal total number of character deletions (sum across both strings) required to make them identical and output that integer.

### 4

Given two robot command sequences S and T (n,m ≤ 50,000) over uppercase letters 'A'–'Z', compute the length of their shortest common supersequence and output that single integer.

### 5

Given integers n, m, k and two strings S and T of lengths n and m (each ≤ 50,000) over an alphabet of size at most 26, determine whether S and T have a common subsequence of length at least k; output YES or NO.

## M-021 — Subset Sum Meet-in-the-Middle

### 1

You are given n (n ≤ 40) treasure weights as positive 64-bit integers and a target T. Decide whether some subset (possibly empty) sums exactly to T. Output YES if such a subset exists, otherwise NO.

### 2

Given n (n ≤ 40) coin values and a spending limit L, find the largest subset sum that does not exceed L. Output that maximum achievable sum (0 if only the empty subset fits).

### 3

Given n (n ≤ 40) machine loads as positive integers, determine whether the multiset can be split into two groups with equal total load. Output POSSIBLE if an equal partition exists, otherwise IMPOSSIBLE.

### 4

You are given n (n ≤ 40) item values and a target T. If some subset sums exactly to T, output any list of 1-based indices of elements in one such subset (space-separated); if no subset achieves T, output -1. Subsets may be empty.

### 5

Given n (n ≤ 40) energy yields for panels and a budget B, find a subset whose sum is ≤ B and as large as possible; among sums equal to that maximum, choose a subset with the fewest elements. Output two integers: the chosen subset size and its sum (0 0 if only the empty subset).

## M-022 — Kth Element of Two Sorted Arrays Partition

### 1

You are given two sorted integer arrays A (length n) and B (length m). Find the k-th smallest element in the combined multiset A ∪ B (1-based k, 1 ≤ k ≤ n+m). Output the element value.

### 2

Two sorted lists of event timestamps T1 and T2 are provided in ascending order. Return the median event time across both lists; if the total number of events is even, return the earlier of the two middle timestamps. Output the timestamp.

### 3

Two sensors produce sorted floating-point reading sequences S1 and S2. Compute the k-th smallest reading across both sequences combined (1-based k). Output the reading value.

### 4

Given two non-decreasing arrays of exam scores X and Y, determine the value that would occupy position k in the merged sorted array (1-based k). Output that score.

### 5

Two servers log packet latencies in ascending arrays L1 and L2. Determine the median latency across both logs; if the combined length is even, output the lower median. Output the latency value.

## M-023 — Binary Search on Answer via Threshold Transformation

### 1

Given n (n ≤ 50000) daily temperature readings t1..tn and an integer L (1 ≤ L ≤ n), find a contiguous interval of length at least L whose average temperature is maximal; output that maximum average as a floating-point number with absolute error ≤ 1e-6.

### 2

Given n (n ≤ 50000) days each with revenue ri and positive cost ci and an integer L (1 ≤ L ≤ n), find a contiguous period of at least L days that maximizes the ratio (sum ri) / (sum ci); output the maximum ratio with absolute error ≤ 1e-6.

### 3

Given n (n ≤ 50000) sequential road segments with speeds s1..sn and an integer L (1 ≤ L ≤ n), choose a contiguous run of at least L segments to maximize the average speed over the run; print the maximum average speed with absolute error ≤ 1e-6.

### 4

Given n (n ≤ 50000) per-minute performance scores a1..an for an athlete and an integer L (1 ≤ L ≤ n), find a contiguous time window of length at least L that maximizes the average score per minute; output that maximum average with absolute error ≤ 1e-6.

### 5

Given n (n ≤ 50000) experiments each reporting successes x1..xn and trials y1..yn with 0 ≤ xi ≤ yi and an integer L (1 ≤ L ≤ n), select a contiguous block of at least L experiments that maximizes the overall success rate (sum xi)/(sum yi); output the maximum rate with absolute error ≤ 1e-6.

## M-024 — Minimum Reversals via Permutation Graph Structure

### 1

Given a permutation A of 1..n, an operation chooses indices l<=r and simultaneously reverses A[l..r] and A[n+1-r..n+1-l] (the mirror block; blocks may overlap). Fixed points are indices i with A[i]=i and A[n+1-i]=n+1-i. Compute the minimum number of such operations required to transform A into the identity permutation [1,2,...,n].

### 2

Given a permutation B of 1..n, an operation picks l<=r and replaces the subarray B[l..r] by its reverse while also replacing each value v in that subarray with n+1-v (reverse+complement). Fixed points are positions i with B[i]=n+1-i. Output the minimum operations to transform B into the target array T where T[i]=n+1-i for all i.

### 3

You are given a permutation A of 1..n. One operation selects any index interval l..r and for every k in l..r swaps A[k] with A[n+1-k] (simultaneous mirror-pair swaps across the central axis). Define a pair as fixed if both A[k]=k and A[n+1-k]=n+1-k. Determine the minimum number of operations to sort A into [1..n].

### 4

Given a permutation P of length n (n even), partition indices into pairs (i,i+n/2) for i=1..n/2. An operation chooses l<=r in [1..n/2] and simultaneously reverses P[l..r] and P[l+n/2..r+n/2] (parallel half-reversal). Fixed paired positions are those already matching their targets. Compute the minimum operations to transform P so the first half is 1..n/2 and the second half is n/2+1..n in order.

### 5

Given a permutation S of 1..n, an operation picks a center axis and a radius t≥0 and reverses the contiguous symmetric window S[c-t..c+t] (if n odd) or S[c-t+1..c+t] (if n even), i.e., any palindrome-aligned reversal around the center; this operation preserves central symmetry and certain cycle parities. A fixed symmetric index satisfies S[i]=i and S[n+1-i]=n+1-i. Output the minimum number of such center-symmetric reversals to make S equal to [1..n].
