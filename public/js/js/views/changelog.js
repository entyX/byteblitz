// ============================================================================
// Changelog — player-facing ByteBlitz release history.
// ============================================================================

import { h } from "../ui.js";

const RELEASES = [
  {
    version: "v1.2.3",
    date: "August 14, 2026",
    current: true,
    items: [
      "New accounts now complete seven Unranked placement games before Ranked unlocks. Confidence climbs from 0/10 to 10/10 while both ELO tracks calibrate quickly.",
      "Placement players now appear on the Ranked leaderboard with a provisional rating, while ranked matchmaking remains locked until placement completes.",
      "Friend challenges now begin with a casual-versus-rated choice. Casual duels never affect ELO; rated duels require both players to have completed placement.",
      "A skippable no-ELO tutorial game now appears after onboarding and remains available from the welcome header.",
      "The navbar now shifts its links left on desktop while player search is open, giving the expanded search field room to breathe.",
      "The tutorial action now lives in the welcome header, while Ranked is visibly disabled until Unranked placement is complete.",
      "Player search now combines exact username reservations with case-insensitive prefix lookup for more reliable results.",
      "Accounts can now be permanently deleted from their profile after explicit confirmation and fresh authentication; associated public records and social references are removed with the account.",
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

export function renderChangelog(params, root) {
  const page = h("div", { class: "wrap", style: { paddingTop: "32px", paddingBottom: "72px", maxWidth: "980px" } });

  const header = h("div");
  header.append(
    h("div", { class: "eyebrow mb-2" }, "// Release history"),
    h("h1", { class: "head mb-3" }, "ByteBlitz ", h("span", { class: "accent" }, "changelog")),
    h("p", { class: "body-text mb-8", style: { maxWidth: "700px" } }, "A player-focused record of what has changed in each public ByteBlitz version.")
  );

  const list = h("div", { class: "change-list" });
  RELEASES.forEach((release) => {
    const article = h("article", { class: "change-card" + (release.current ? " current" : "") });
    article.append(
      h("div", { class: "between gap-3 wrapflex" },
        h("h2", { class: "head", style: { fontSize: "clamp(1.45rem, 3vw, 2rem)" } }, release.version),
        h("span", { class: "change-date" }, release.date)
      ),
      h("ul", { class: "change-items" }, release.items.map((item) => h("li", {}, item)))
    );
    list.append(article);
  });

  page.append(header, list);
  root.append(page);
}
