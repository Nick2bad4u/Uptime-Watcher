---
name: "Src-Folder-Guidelines"
description: "Guidance for the React renderer layer under src/."
applyTo: "src/**"
---

# Renderer (src/) Guidelines

- Treat `src/` as the **React renderer layer**:
  - Never import directly from `electron` or use `ipcRenderer`; go through the typed preload bridge (`window.electronAPI`) via services in `src/services/`.
  - Prefer shared domain types from `@shared/types` and shared validation from `@shared/validation` instead of redefining shapes.
- Directory map:
  - `src/components/` → presentational and coordinator components (colocate stories/tests when practical).
  - `src/hooks/` → reusable renderer hooks; anything crossing IPC boundaries must go through services.
  - `src/services/` → typed façades over IPC (`EventsService`, `StateSyncService`, `SettingsService`, etc.).
  - `src/stores/` → Zustand slices and selectors; expose domain-specific hooks instead of the raw store.
  - `src/theme/` → theming primitives (`ThemeManager`, themed components, global tokens in `styles/components`).
  - `src/utils/` and `src/types/` → renderer-only helpers and type aliases; import via the `@app/*` path alias defined in `tsconfig.json`.
- Follow the **component + hook + store** structure:
  - UI components live in `src/components/` and must be presentational or thin coordinators.
  - Business logic goes into hooks in `src/hooks/` or domain-specific Zustand stores in `src/stores/`; do not embed IPC calls, service wiring, or complex domain rules directly in components.
- Styling and layout:
  - Use existing themed primitives (`ThemedText`, `ThemedButton`, `ThemedCard`, etc.) and Tailwind utility classes.
  - Avoid introducing new ad-hoc design systems; extend the theme components instead.
- Data access and side effects:
  - Call services from `src/services/` (e.g., `SettingsService`, `EventsService`) rather than talking to IPC or storage directly.
  - Keep side effects in hooks or services, not in deeply nested components.
- Types & props:
  - Use the `Properties` suffix for props interfaces (e.g., `FooCardProperties`).
  - Reuse shared types and helper utilities before inventing new ones; prefer imports from `@shared/*` or existing renderer `types.ts` modules over duplicating literals.
- Testing:
  - Prefer Vitest + React Testing Library for renderer tests in `src/test/`.
  - Keep components deterministic; avoid hidden timeouts or randomness.
