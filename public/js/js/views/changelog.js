// ============================================================================
// Changelog — player-facing ByteBlitz release history.
// ============================================================================

import { h } from "../ui.js";

const RELEASES = [
  {
    version: "v1.3 [C4 BETA]",
    date: "August 16, 2026",
    current: true,
    items: [
      "Chunk 4 adds browser-local Burst question generation guided by the supplied archetype and five-template library. Generated questions must satisfy their rank, topic, difficulty, five-minute limit, allowed and forbidden techniques, strict schema, and eight-test validation gates.",
      "Accepted Burst questions are cached in a local generated pool with exact and semantic duplicate detection plus archetype usage tracking, while authored problems remain preferred until a player or both duelists have substantially covered their division.",
      "Training Grounds now opens every authored problem immediately. Discovery history remains available for selection preference and analytics but no longer locks or hides puzzle statements.",
      "Unranked includes a debugging switch for authored-first play or AI-generated-only play. Ranked and standard Unranked selection still favor existing authored questions by default and only expand into validated Burst generation when the configured completion thresholds are met.",
    ],
  },
  {
    version: "v1.3 [C3 BETA]",
    date: "August 15, 2026",
    current: false,
    items: [
      "Chunk 3 introduces browser-local AI code analysis powered by Qwen and WebGPU. The first model load is cached by the browser, and source stays on-device while the analysis and coaching chat run.",
      "Every saved solution can open a dedicated analysis URL with an efficiency score, estimated time and space complexity, code-quality review, strengths, weaknesses, optimization ideas, and an explanation of the approach.",
      "Public solution links now combine source code and AI analysis. Private analysis links remain owner-only and clearly explain when a viewer must ask the owner to make the solution public.",
      "Post-match analysis retains a bounded timeline of duel submissions, so players can review test progress, diagnose losses, compare an opponent’s final approach, and talk through improvements with ByteBlitz Coach.",
    ],
  },
  {
    version: "v1.3 [C2 BETA]",
    date: "August 15, 2026",
    current: false,
    items: [
      "Chunk 2 turns every Ranked and Casual duel result into a fuller post-match event, including the outcome, problem, opponent, solve times, tests passed, ELO movement, submissions, test runtime, and browser memory delta when the browser exposes it.",
      "After a duel, both participants can open a side-by-side comparison of the code they submitted during the match. The latest submitted source and performance summary are preserved only on the private duel record.",
      "The existing rematch, player challenge, and profile match-history flows remain available from this release.",
      "Rating-history charts now include a gradient area fill and accessible hover/focus tooltips for exact ELO and match date.",
      "Training Grounds now uses an icon-bearing View solutions control to list every explicitly public solution shared for a puzzle, while keeping a separate Mine control for private solution history.",
    ],
  },
  {
    version: "v1.3 [C1 BETA]",
    date: "August 15, 2026",
    current: false,
    items: [
      "Chunk 1 beta introduces a dedicated My Solutions workspace in Training Grounds. After Training, Unranked, or Ranked runs, players can visibly save an accepted solution or an incomplete draft with source, language, mode, result, time, tests, and history.",
      "My Solutions includes difficulty side navigation plus completed, incomplete, accomplishment, public, and category filters. Each card can view code, reopen its exact puzzle, mark an accomplishment, or pin it to the player profile.",
      "Saved solutions are private by default. Only completed solutions can be switched public; the switch creates a copyable public page and adds View solution wherever that player appears on the matching puzzle leaderboard.",
      "Player profiles now display solved puzzles, saved solutions, accomplishments, ELO, rank, win-loss record, best times, streaks, puzzle records, a pinned-accomplishment status badge, and a repaired visible ELO graph.",
      "The home dashboard now includes live friend news for five-day streak milestones and pinned accomplishments.",
    ],
  },
  {
    version: "v1.2.8",
    date: "August 14, 2026",
    current: false,
    items: [
      "New email-password accounts now receive a verification link at sign-up and remain inactive until the inbox owner confirms it.",
      "The account activation screen can resend the verification email and refresh Firebase after the link is opened. Unverified accounts cannot reserve usernames, create profiles, complete onboarding, enter Ranked, use friends or chat, or appear on public boards.",
      "Signed-out visitors can still use local Unranked practice without creating an account.",
      "The active account is monitored on every page: removing its live profile blocks the session immediately, while Firebase Authentication deletion or disabling is detected within seconds before further play or social activity can continue.",
      "If an account is removed from Firebase, the open session detects it immediately from the profile record or within seconds from Firebase Authentication, then shows an unskippable account-removal notice and signs the player out.",
      "Ranked and Unranked leaderboards now stream live standings. When a new result changes positions, affected rows slide past each other to make overtakes clear.",
    ],
  },
  {
    version: "v1.2.7",
    date: "August 14, 2026",
    current: false,
    items: [
      "Profile cards and the hero now scale, stack, and preserve division labels at high browser zoom and on narrow screens instead of dropping rank copy onto an unintended line.",
      "Placement now treats onboarding as a starting hypothesis rather than a rating floor. Seven consistent failures—including easy Bronze problems—can correct a Master selection all the way into the low-rating range.",
    ],
  },
  {
    version: "v1.2.6",
    date: "August 14, 2026",
    current: false,
    items: [
      "Losses now preserve a bounded amount of demonstrated test-case progress: at 11/12 or more tests, an Unranked loss can be softened by up to 55% and a Ranked loss by up to 28%. Wins, draws, and low-progress losses are unchanged.",
      "Ranked standings now foreground division with colored, bold, softly glowing ELO and a Bronze, Silver, Gold, or higher division label.",
      "Profiles now use smoother Ranked and Unranked track cards for division, ELO, win rate, best time, clears, placement, board position, and puzzle-record count.",
      "Players can save a public bio and choose whether their sign-in email is displayed next to their join date. The email is omitted from the public profile unless the owner opts in.",
      "The notification drawer now includes a Clear all action.",
    ],
  },
  {
    version: "v1.2.5",
    date: "August 14, 2026",
    current: false,
    items: [
      "Placement calibration now uses high-signal, shrinking per-game swings. Early placement games can move ELO by hundreds while the selected onboarding level remains a broad benchmark guard rail.",
      "Reset Progress now clears the selected skill level and automatically reopens onboarding, so a reset begins with a fresh self-assessment and new placement benchmark.",
      "Only players who have completed all seven Unranked placement games can appear on the Ranked leaderboard or receive a Ranked board position.",
      "New email-password accounts now require at least 12 characters with uppercase, lowercase, a number, and a symbol. Whitespace is rejected.",
      "Release history is now organized into expandable minor-version series such as v1.2, with each patch release inside its series.",
    ],
  },
  {
    version: "v1.2.4",
    date: "August 14, 2026",
    items: [
      "Bounded placement calibration, profile match-history graphs, progression reset, anonymous matchmaking, transactional duel readiness, indentation-aware Backspace, and corrected chat message grouping were introduced.",
      "Signed-out visitors can practice without a guest account or join anonymous no-ELO matchmaking.",
    ],
  },
  {
    version: "v1.2.2",
    date: "August 14, 2026",
    items: [
      "Puzzle leaderboard trophies now use a clear visual status: grey when no times exist and yellow when a puzzle has recorded clears.",
      "Hovering or keyboard-focusing any puzzle leaderboard trophy now uses the red ByteBlitz action treatment.",
    ],
  },
  {
    version: "v1.2.1",
    date: "August 14, 2026",
    items: [
      "Leaderboards now show profile pictures, country flags, and complete ranked records including draws.",
      "The Ranked and Unranked boards received a sharper, more detailed standings layout built around each player's ELO.",
      "Puzzle leaderboards now correctly show recorded fast solves.",
      "Friends and player profiles now use live status rings: grey when offline, green when online, and red while coding in a battle or puzzle.",
      "The dashboard now includes a weekly coding streak bar and a cleaner live activity panel that updates as players join, leave, and start matches.",
      "The in-arena Reference guide is now a movable and resizable panel that can be closed and reopened without interrupting your editor.",
      "Unranked placement has been tuned so provisional clears earn meaningful ELO movement, including slower solves, while faster clears still gain more.",
      "Matchmaking cancellation is now protected against ghost opponents: leaving the queue stops your search and returns any affected opponent to a real queue.",
    ],
  },
  {
    version: "v1.1",
    date: "August 13, 2026",
    items: [
      "The website was renovated with a new ByteBlitz arena experience.",
      "Ranked and Unranked game modes were introduced.",
      "The problem set for every division was completely refreshed with a new set of challenges.",
    ],
  },
  {
    version: "v1.0",
    date: "March 12, 2026",
    items: ["Initial release."],
  },
];

function seriesFor(version) {
  const match = /^v(\d+)\.(\d+)/.exec(version);
  return match ? `v${match[1]}.${match[2]}` : version;
}

function groupedReleases() {
  const groups = new Map();
  RELEASES.forEach((release) => {
    const series = seriesFor(release.version);
    if (!groups.has(series)) groups.set(series, []);
    groups.get(series).push(release);
  });
  return [...groups.entries()];
}

export function renderChangelog(params, root) {
  const page = h("div", { class: "wrap", style: { paddingTop: "32px", paddingBottom: "72px", maxWidth: "980px" } });

  const header = h("div");
  header.append(
    h("div", { class: "eyebrow mb-2" }, "// Release history"),
    h("h1", { class: "head mb-3" }, "ByteBlitz ", h("span", { class: "accent" }, "changelog")),
    h("p", { class: "body-text mb-8", style: { maxWidth: "700px" } }, "Patch releases are grouped by minor version. Open a series to review every public update in that line.")
  );

  const list = h("div", { class: "change-list" });
  groupedReleases().forEach(([series, releases]) => {
    const current = releases.some((release) => release.current);
    const group = h("details", { class: "change-series", open: current ? true : null });
    const summary = h("summary", { class: "between gap-3 wrapflex" },
      h("span", { class: "head", style: { fontSize: "clamp(1.35rem, 2.8vw, 1.85rem)" } }, series, " series"),
      h("span", { class: "label" }, `${releases.length} ${releases.length === 1 ? "release" : "releases"} · ${current ? "CURRENT" : "ARCHIVE"}`));
    const entries = h("div", { class: "change-series-body" });

    releases.forEach((release) => {
      const article = h("article", { class: "change-card" + (release.current ? " current" : "") });
      article.append(
        h("div", { class: "between gap-3 wrapflex" },
          h("h2", { class: "head", style: { fontSize: "clamp(1.2rem, 2.5vw, 1.65rem)" } }, release.version),
          h("span", { class: "change-date" }, release.date)
        ),
        h("ul", { class: "change-items" }, release.items.map((item) => h("li", {}, item)))
      );
      entries.append(article);
    });

    group.append(summary, entries);
    list.append(group);
  });

  page.append(header, list);
  root.append(page);
}
