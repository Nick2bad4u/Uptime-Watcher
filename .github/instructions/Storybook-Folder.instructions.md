---
name: "Storybook-Folder-Guidelines"
description: "Guidance for Storybook configuration, output, and stories."
applyTo: "storybook/**, storybook-static/**, .storybook/**"
---

# Storybook (storybook/, storybook-static/, .storybook/) Guidelines

- Purpose of Storybook-related folders:
  - `.storybook/` contains Storybook configuration, decorators, and global setup.
  - `storybook/` contains additional Storybook-specific code and integration helpers.
  - `storybook-static/` is **generated output**; do not hand-edit files here.
- Stories:
  - Prefer colocated `*.stories.tsx` files next to components in `src/`.
  - Use the existing Storybook instructions for story files; use these folders mainly for shared config and build artefacts.
- Configuration:
  - When editing Storybook config (preview, main, manager), keep aliases and loader settings in sync with Vite and TypeScript path mappings.
  - Reuse the helpers in `storybook/viteSharedConfig.ts` when adjusting builder behaviour so that tests, Storybook, and production builds stay aligned.
  - Reuse global theming, layout, and providers that mirror the real app shell.
- Testing & integration:
  - Ensure Storybook stories remain deterministic and match the production component behaviour.
  - Avoid adding app-specific state or side effects to Storybook-only utilities; keep them thin wrappers over real code.
