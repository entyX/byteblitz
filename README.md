# ByteBlitz

Fast-paced 1v1 algorithmic coding battles. One problem, two people, one clock.

Live: **https://byteblitzonline.web.app**

Pure HTML/CSS/JS — no build step, no bundler, no framework. Native ES modules,
Firebase from the CDN, deployed straight to Firebase Hosting.

---

## Running it

```
firebase deploy --project byteblitzonline            # everything
firebase deploy --only hosting --project byteblitzonline
firebase deploy --only firestore:rules,firestore:indexes --project byteblitzonline
```

For local work, any static server pointed at `public/` will do:

```
npx serve public          # or: python -m http.server -d public 5000
```

Firestore and Auth still talk to the live project, so local and deployed share
the same data.

---

## Layout

```
public/
  index.html            app shell (everything else is loaded as a module)
  css/app.css           the whole design system
  data/byteblitz_*_questions.csv  the problem set, one file per tier
  js/
    app.js              nav, search, notifications, routing, boot
    router.js           hash router
    session.js          auth state, guest sessions, the sign-in modal
    onboarding.js       first-run skill placement + the avatar picker
    store.js            every Firestore read/write
    local.js            guest storage — localStorage, no Firebase
    firebase.js         SDK init and re-exports
    glicko.js           Glicko-2 rating engine, ranks, unranked scoring
    problems.js         CSV parsing, problem selection
    search.js           the nav-bar player search
    arena.js            the match screen (editor, clock, judge, lockdown)
    game.js             unranked / training / duel controllers
    matchmaking.js      lobby, rating window, duel documents
    runner.js           Pyodide + JS worker, syntax highlighting
    js-worker.js        sandboxed JavaScript execution
    ui.js               DOM helpers, modals, toasts, avatars, icons
    views/              home, training, leaderboard, messages, profile
```

There is no homepage. `/` is the game.

---

## Ratings — Glicko-2

The same system lichess uses. A player is `(rating, rd, vol)` starting at
`1500 / 350 / 0.06`, with `τ = 0.75`. Each game is its own rating period.

- A rating renders as `1642?` while `rd > 110` — provisional, exactly like lichess.
- `rd` inflates with inactivity (one rating period = 7 days), capped at 350.
- Ranked and unranked are **separate rating tracks**. Unranked can never move
  ranked. (The unranked track is stored under the `solo*` field names it has
  always used; only the UI wording changed.)

Glicko-2 accepts any score in `[0,1]`, so how a duel was won is expressed
directly rather than bolted on as a multiplier:

| Outcome | Winner | Loser |
|---|---|---|
| Solved all tests first | 1.0 | 0.0 |
| Clock ran out, more hidden tests passed | 0.75 | 0.25 |
| Opponent left / resigned | 1.0 | 0.0 |
| Draw | 0.5 | 0.5 |

**Unranked** has no human opponent, so the clock is the opponent. Beat par time
comfortably → score near 1; land exactly on par → 0.5; crawl over the line →
0.15 floor; fail → 0.

That score is then rated against **you, at your current rating** — the question
each run answers is "did you perform at your own level today?". It used to be a
fixed rating per tier, which meant that once you reached the rating that tier's
par implied, you stopped moving no matter how well you played: runs settled to
±2 and the rating went dead. Anchoring to the player keeps every run
meaningful, and it self-limits, because climbing moves you into a harder tier
with a longer par.

### Provisional swings

Plain Glicko-2 collapses `rd` fast — 350 → 259 → 209 → 181 in three games — so
by game four a "provisional" player was only moving ±15. That makes the
provisional label a lie and leaves a badly-placed player grinding.

During the first `PLACEMENT_GAMES` results the deviation is therefore floored on
a straight line from `DEFAULT_RD` (350) down to `PROVISIONAL_RD` (110), so
placement games all swing hard and the rating lands near the truth quickly.
After that it is ordinary Glicko-2 and a settled player moves ±10 a game.
`placementRd` in `glicko.js`; applied to both tracks in `store.js`.

### Starting rating

New players place themselves before their first match rather than everyone
starting at 1500 and grinding to where they already belong:

| Answer | Starts at | Tier |
|---|---|---|
| Beginner | 600 | Bronze |
| Intermediate | 1200 | Silver |
| Advanced | 1800 | Platinum |
| Master | 2400 | Master |

Both tracks start there, and `rd` stays at the default 350 — so the rating
renders as `1800?` and moves fast until the system agrees. Answering is
mandatory and happens once; `skillLevel` on the profile records it. Guests get
the same prompt, stored locally. See `SKILL_LEVELS` in `glicko.js` and
`js/onboarding.js`.

### Ranks and placement

A rating is not a rank. Ranks (Bronze → Master) are only awarded after
**10 ranked matches** — `PLACEMENT_GAMES` in `glicko.js`. Until then the player
has a real ranked rating but is shown as **Unranked** everywhere: the ladder,
their profile, the home card, puzzle boards.

**Unranked mode has no ranks at all**, by design. It's a rating and a clock;
nobody is Gold at playing alone.

### Tiers

| Tier | Rating | Time limit |
|---|---|---|
| Bronze | < 1200 | 5:00 |
| Silver | 1200–1499 | 5:00 |
| Gold | 1500–1799 | 5:00 |
| Platinum | 1800–2099 | 5:00 |
| Diamond | 2100–2399 | 5:00 |
| Master | 2400+ | 5:00 |

Every division gets the same five minutes. The problems get harder as you climb;
the clock does not move.

In a duel the problem tier comes from the **lower-rated** player.

---

## Modes

The main page asks you to pick one of two gamemodes before it shows you
anything to press; until then the third card reads "choose a gamemode".

**Ranked** — Firestore lobby matchmaking. Both clients derive the same problem
from a shared seed. Account required.

**Unranked** — race the clock alone. Moves your unranked rating, never touches
ranked. Playable as a guest. There is **no difficulty picker**: the tier comes
from your unranked rating, the same way a duel's tier comes from the players'.

**Training Grounds** — pick a specific puzzle, chase your best time, compare on
a per-puzzle leaderboard. Never moves any rating.

**Duel a friend** — direct challenge with the same rules and stakes as ranked.

### Ranked matchmaking window

Ranked pairs on rating, not on whoever is nearest the front of the queue. The
search opens at **±100** and widens 100 every 20 s, taking all comers past 600.
Candidates are always sorted nearest-rating-first, so a widened window still
produces the best pairing available. Because the window grows with time rather
than with lobby traffic, the watcher re-evaluates every 4 s as well as on
snapshot. See `currentWindow` in `js/matchmaking.js`.

---

## Training Grounds — discovery

Nothing is locked behind a match count and every difficulty is open from day
one. Two things unlock a puzzle:

- **The first 10% of each difficulty is free** (`STARTER_FRACTION` in
  `store.js`) — 24 of Bronze's 239, 6 of Gold's 60 — so there is always
  something to play.
- **Meeting it in a real match.** Play a puzzle in Unranked or Ranked and it's
  named and playable in Training Grounds forever after.

Everything else shows as **???** — no title, no category, no description — and
does nothing when clicked. Locked puzzles are still listed so the catalogue's
real size is honest, but compactly, folded to 18 tiles behind a "show all".
Discovery is written to `users/{uid}.seen` as an `{ archetypeId: true }` map, or
into localStorage for guests. Every puzzle, locked or not, carries a 🏆 that
opens its time board.

---

## Profile pictures

A picture is a symbol plus a hue, stored as `avatarIcon` / `avatarHue` on the
profile — no uploads, no Firebase Storage, no bandwidth cost, nothing to
moderate, and it works for guests offline. Twelve symbols, eight colours, in
`AVATAR_ICONS` / `AVATAR_HUES` in `ui.js`. A player who has never picked one
still gets a stable identity: the hue is derived from their name, so they look
the same everywhere they appear.

---

## Guest play

"Play as a guest" touches **no Firebase service at all** — no anonymous auth, no
Firestore. `js/local.js` keeps one localStorage record holding the guest's
unranked rating, best times, training records and discovered puzzles.

| Guests can | Guests cannot |
|---|---|
| Play Unranked | Play Ranked |
| Play Training Grounds | Appear on any leaderboard |
| Keep a rating and best times on that device | Add friends, message, or duel |
| Browse leaderboards and profiles | — |

Signing out of a guest session leaves the saved progress alone; signing out of a
real account lands you signed out rather than back in an old guest session.

---

## Match lockdown

The arena runs **fullscreen**, and while an element is fullscreen the browser
paints only that element's subtree. Anything appended to `<body>` is therefore
invisible mid-match — which silently broke every modal and toast raised from
the arena (resign, reference, draw offers, submit results): the buttons fired,
nothing appeared. `overlayHost()` in `ui.js` mounts overlays into
`document.fullscreenElement` when there is one. Anything new that floats above
the page must go through `modal()` / `toast()` for the same reason.

While a match is live, all three modes enforce:

- fullscreen (exiting resigns)
- tab/window focus (`visibilitychange` and `blur` both resign)
- `beforeunload` warning, and `pagehide` fires the loss before the tab dies
- copy, cut, paste, drag-drop and the context menu are blocked in the editor

Fullscreen is requested inside the click handler on the rules screen, because
browsers only grant it from a user gesture.

---

## Code execution

Everything runs in the browser. No judge server, no API keys, no rate limits.

- **Python** — Pyodide (CPython → wasm) from jsDelivr. Each test executes in a
  fresh namespace; a `sys.settrace` step counter kills runaway loops before they
  can freeze the tab and the match clock with it.
- **JavaScript** — a Web Worker the host terminates on timeout. Submissions get
  `input()`, `readline()`, `readInt()`, `readInts()` and `print()`; the worker's
  own globals are shadowed.

Answers are compared whitespace-tolerantly (`outputMatches` in `problems.js`).

---

## Problem set

Six authored Byteblitz CSVs under `public/data/`, with **8 test cases each** —
the first four are shown in the arena and the remaining four are hidden during
a duel.

| Tier | Problems | Test cases |
|---|---|---|
| Bronze | 150 | 1,200 |
| Silver | 175 | 1,400 |
| Gold | 200 | 1,600 |
| Platinum | 200 | 1,600 |
| Diamond | 150 | 1,200 |
| Master | 120 | 960 |

Every column is read by name, so column order in the CSV isn't load-bearing.
Statement fields (`background`, `task`, `input_format`, `constraints`) are shown
verbatim; test inputs are stored in the exact shape a solution reads from stdin,
so there is no reconstruction step.

### Regenerating the problem set

The shipped CSVs are the authored Byteblitz files in `public/data/`:

```
node tools/check_frontend.mjs           # load the shipped files through problems.js
```

Each `byteblitz_<tier>_questions.csv` file carries eight authored test cases per
question. `tools/solvers/` holds one reference solver per question. The
optional validation script replays the authored cases through their matching
solvers before any derived data is created.

That cross-check is also a fact-check of the authored data. It caught 44
questions whose expected output was wrong — a "shortest" answer that gave the
longest one, a circular next-greater that ignored the wrap, a running median
averaging the wrong two values. Each is listed with its reasoning in
`tools/solvers/corrections.py`; for those questions the solver is treated as the
source of truth and every output is recomputed from it. Ten more questions had
the literal text `Line 1: ` baked into their stdin, contradicting their own
stated input format; that is stripped by the same file.

---

## Firestore

| Collection | Purpose |
|---|---|
| `users/{uid}` | profile, both rating tracks, record, best times, `seen` map, `skillLevel`, avatar |
| `usernames/{lower}` | uniqueness index |
| `matchmaking_lobby/{uid}` | ranked queue |
| `duels/{duelId}` | live match state |
| `challenges/{id}` | friend duel invites |
| `friends/{uid}/list/{other}` | friendships |
| `friendRequests/{to}/from/{from}` | inbox, plus a `sent` mirror under the sender |
| `notifications/{uid}/items/{id}` | bell feed |
| `conversations/{id}/messages/{id}` | direct messages |
| `puzzleTimes/{archetype}__{uid}` | training records + per-puzzle board |

Leaderboards order by `lbRating` / `lbSolo`, which are only written once a
player has actually played — Firestore skips documents missing the field, so
unplayed accounts never appear.

`users`, `usernames` and `puzzleTimes` are **publicly readable**. Guests never
authenticate, so without that the leaderboards, profiles and puzzle boards would
be unreadable to them. Writes stay owner-only and nothing private is stored on a
profile doc. **These rules must be deployed** or signed-out visitors see a
"sign in to view" message instead of the boards:

```
firebase deploy --only firestore:rules --project byteblitzonline
```

---

## Project setup

Auth providers must be enabled in the Firebase console
(**Authentication → Sign-in method**):

- **Email/Password** — enabled
- **Google** — required for "Continue with Google"

**Anonymous is not used and does not need enabling** — guest play is local-only
by design, which is why it works whether or not the provider is on.

`byteblitzonline.web.app` and `byteblitzonline.firebaseapp.com` are already in
the authorized-domains list.
