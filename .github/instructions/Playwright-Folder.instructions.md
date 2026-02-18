---
name: "Playwright-Folder-Guidelines"
description: "Guidance for Playwright end-to-end tests and helpers under playwright/."
applyTo: "playwright/**"
---

# Playwright (playwright/) Guidelines

- Treat `playwright/` as the **E2E test harness**:
  - All browser/Electron integration tests live here, plus shared fixtures and helpers.
  - Do not put application business logic here; import from `src/` or `shared/` when needed.
- Test structure:
  - Prefer feature-oriented directories under `playwright/tests/`.
  - Use the shared fixtures defined in `playwright/fixtures/` and helpers in `playwright/helpers/` or `playwright/utils/`.
- Fixtures & setup:
  - `playwright/fixtures/global-setup.ts` and `global-teardown.ts` manage Electron application lifecycle—extend these when additional bootstrapping is required.
  - `playwright/fixtures/electron-helpers.ts` exposes helpers for working with `ElectronApplication` and windows; reuse instead of duplicating launch logic.
  - Store reusable selectors or formatting helpers under `playwright/utils/` so suites stay lean.
- Locators & accessibility:
  - Use role-based and label-based locators (`getByRole`, `getByLabel`, `getByText`) to keep tests robust and a11y-aligned.
- Electron specifics:
  - When testing the Electron app, go through the standardized Electron/Playwright setup (see existing fixtures) instead of ad-hoc process launching.
- Stability:
  - Avoid arbitrary sleeps; rely on Playwright auto-waiting and web-first assertions.
  - Capture diagnostics (screenshots, traces) via built-in reporters and commit them only when they provide long-lived value; otherwise leave artefacts in `playwright/test-results/`.
