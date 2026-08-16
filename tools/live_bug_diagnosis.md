# Live bug diagnosis — 2026-08-16

The deployed app at https://byteblitzonline.web.app loaded the C4 home page successfully. The browser viewport was 1280x1100. The live `.home-grid` had inline height `calc(100dvh - var(--nav-h, 63px) - 76px - 34px)` and inline overflow `hidden`, with a computed height of 927px. The deployed page had no `.play-btn` because no gamemode was selected yet. This confirms the home height-lock code is active in the deployed build for desktop-sized viewports; narrow behavior must be tested separately, and the dynamic lock should not be relied on for access to content.

The live page exposes Play and Training navigation, Unranked, Ranked, Tutorial, and Sign In controls. No authenticated post-match state is available in this sandbox session, so generated-attempt analysis must be verified by source-level route/state checks or by the user after deployment.
