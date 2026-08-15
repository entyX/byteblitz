// ============================================================================
// First-run flow and the avatar picker.
//
// A new player is asked how strong they are before their first match, and both
// rating tracks start there instead of everyone beginning at 1500 and grinding
// to where they already belong. The deviation stays at its default, so the
// answer is a starting guess the system corrects fast, not a claim it trusts.
// ============================================================================

import {
  h, clear, modal, toast, avatar, avatarIcon, AVATAR_ICON_KEYS, AVATAR_HUES,
  defaultHue,
} from "./ui.js";
import { SKILL_LEVELS, tierFor } from "./glicko.js";
import { applySkillLevel, saveAvatar, saveCountry, needsOnboarding } from "./store.js";
import { countryOptions } from "./countries.js";
import { session, refreshGuest } from "./session.js";
import { offerTutorial } from "./game.js";

let open = false;

/**
 * Ask a new player to place themselves. Resolves once they've chosen (or the
 * profile already has a level). Not dismissable: every path out sets a level.
 */
export function runOnboarding(profile) {
  if (open || !needsOnboarding(profile)) return Promise.resolve(null);
  open = true;

  return new Promise((resolve) => {
    let busy = false;

    async function choose(level) {
      if (busy) return;
      busy = true;
      try {
        await applySkillLevel(profile, level);
        await saveCountry(profile, country.value);
        refreshGuest();
        m.close();
        open = false;
        toast(`Starting at ${level.rating}. Complete seven Unranked placement games to unlock Ranked.`, "ok");
        offerTutorial(session.profile ?? { ...profile, ...{ skillLevel: level.id, rating: level.rating, soloRating: level.rating } });
        resolve(level);
      } catch (e) {
        console.error(e);
        busy = false;
        toast("Couldn't save that — try again.", "err");
      }
    }

    const country = h("select", { class: "input", "aria-label": "Country or region" },
      ...countryOptions(profile.country).map((item) => h("option", { value: item.value, selected: item.selected }, item.label)));

    const optionsEls = SKILL_LEVELS.map((s) => {
      return h("button", { class: "skill-opt", onClick: () => choose(s) },
        h("div", { class: "grow" },
          h("div", { class: "name" }, s.name),
          h("div", { class: "desc" }, s.desc)));
    });

    const m = modal(h("div", {},
      h("div", { class: "eyebrow mb-2" }, "// Welcome"),
      h("h2", { class: "head mb-3" }, "How strong are ", h("span", { class: "accent" }, "you"), "?"),
      h("p", { class: "body-text mb-5" },
        "This sets the base for both your Unranked and Ranked ratings. Then complete seven Unranked placement games: your ELO moves quickly while confidence grows from 0/10 to 10/10, and Ranked unlocks once placement is complete."),
      h("label", { class: "label mb-2", style: { display: "block" } }, "// Country / region"),
      country,
      h("p", { class: "label mt-2 mb-4", style: { textTransform: "none", letterSpacing: "0", lineHeight: "1.5" } },
        "This flag appears on the leaderboard. You can change it later from your profile."),
      h("div", { class: "skill-grid" }, ...optionsEls),
      h("p", { class: "label mt-5", style: { textTransform: "none", letterSpacing: "0", lineHeight: "1.6" } },
        "Not sure? Pick Intermediate. Your first seven Unranked placement games are designed to correct a rough starting estimate quickly."),
    ), { wide: true, closable: false });

    // Make onboarding modal more compact for small screens
    m.el.classList.add('onboarding');
  });
}

/** Check the current session and run onboarding if it's a fresh profile. */
export function maybeOnboard() {
  const p = session.profile;
  if (needsOnboarding(p)) runOnboarding(p);
}

// ── Avatar picker ───────────────────────────────────────────────────────────
export function openAvatarPicker(profile, onSaved) {
  let icon = profile.avatarIcon ?? AVATAR_ICON_KEYS[0];
  let hue = Number.isFinite(profile.avatarHue) ? profile.avatarHue : defaultHue(profile.username);

  const previewHost = h("div", { class: "row", style: { justifyContent: "center" } });
  const iconGrid = h("div", { class: "avatar-grid" });
  const colorGrid = h("div", { class: "color-grid" });

  function paintPreview() {
    clear(previewHost).append(
      avatar({ username: profile.username, avatarIcon: icon, avatarHue: hue }, "xl"));
  }

  function paintIcons() {
    clear(iconGrid);
    AVATAR_ICON_KEYS.forEach((key) => {
      iconGrid.append(h("button", {
        class: "avatar-opt" + (key === icon ? " on" : ""),
        title: key, "aria-label": key,
        onClick: () => { icon = key; paintIcons(); paintPreview(); },
      }, avatarIcon(key, 22)));
    });
  }

  function paintColors() {
    clear(colorGrid);
    AVATAR_HUES.forEach((hu) => {
      colorGrid.append(h("button", {
        class: "color-opt" + (hu === hue ? " on" : ""),
        "aria-label": "colour " + hu,
        style: { background: `linear-gradient(135deg, hsl(${hu} 78% 56%), hsl(${(hu + 26) % 360} 82% 42%))` },
        onClick: () => { hue = hu; paintColors(); paintPreview(); },
      }));
    });
  }

  const save = h("button", { class: "btn btn-primary grow", onClick: async () => {
    save.disabled = true;
    try {
      await saveAvatar(profile, icon, hue);
      refreshGuest();
      m.close();
      toast("Profile picture updated.", "ok");
      onSaved?.({ avatarIcon: icon, avatarHue: hue });
    } catch (e) {
      console.error(e);
      save.disabled = false;
      toast("Couldn't save that picture.", "err");
    }
  } }, "Save");

  const m = modal(h("div", {},
    h("div", { class: "eyebrow mb-2" }, "// Profile picture"),
    h("h2", { class: "head mb-5" }, "Pick your look"),
    previewHost,
    h("div", { class: "section-title mt-6" }, "// Symbol"),
    iconGrid,
    h("div", { class: "section-title mt-6" }, "// Colour"),
    colorGrid,
    h("div", { class: "row gap-2 mt-6" }, save,
      h("button", { class: "btn grow", onClick: () => m.close() }, "Cancel")),
  ), { wide: true });

  paintPreview();
  paintIcons();
  paintColors();
  return m;
}
