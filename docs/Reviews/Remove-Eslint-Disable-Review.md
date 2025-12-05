# Remove ESLint Disable — Review and Decision Log

This document records findings and decisions from the first sweep of `eslint-disable` usage across the Uptime Watcher repository. The goal is to reduce unnecessary disables, standardize the ones that remain, and document why they are acceptable.

## Scope of this pass

Commands used:

- `npm run lint`
- `rg --hidden --line-number "eslint-disable" --glob '!node_modules' --glob '!dist' | sort` (via the editor search integration)

Categories inspected:

- **Config / tooling files**: `vite.config.ts`, `vitest.*.config.ts`, `playwright.config.ts`, `eslint.config.mjs`, `stylelint.config.mjs`, `stryker.config.mjs`, `storybook` configs.
- **Test harness / runner files**: Vitest setup, Jest compatibility runner, Playwright helpers.
- **Application code**: `src/`, `shared/`, `electron/`, `storybook/` sources.

## Summary of decisions

- Many `eslint-disable` comments already had precise scope and clear justifications (especially in configs and complex type-bridging code). No wide, unjustified top-of-file disables were found in application source.
- For runtime source files, the few remaining disables are localized and driven by external API constraints (e.g., environment access, Electron/Node globals) or unavoidable dynamic behavior. In these cases, the rule itself is still valuable globally and an override or inline disable is the correct choice.
- For this pass, no new global rule changes were introduced. All decisions were made with the narrowest possible scope.

## Changes made in this pass

### 1. State sync handler nullish checks

- **File:** `electron/services/ipc/handlers/stateSyncHandlers.ts`

- **Rule:** `@typescript-eslint/no-unnecessary-condition` (reported via lint, no explicit disable)

- **Old code:**

  ```ts
  const summary: StateSyncStatusSummary = hasTrustedDatabaseSummary
      ? {
            lastSyncAt: currentStatus.lastSyncAt ?? null,
            siteCount:
                currentStatus.siteCount ?? cachedSiteCount ?? 0,
            source: STATE_SYNC_SOURCE.DATABASE,
            synchronized: true,
        }
      : {
            lastSyncAt: currentStatus.lastSyncAt ?? null,
            siteCount: cachedSiteCount ?? 0,
            source: STATE_SYNC_SOURCE.CACHE,
            synchronized: false,
        };
  ```

- **New code:**

  ```ts
  const summary: StateSyncStatusSummary = hasTrustedDatabaseSummary
      ? {
            lastSyncAt: currentStatus.lastSyncAt,
            siteCount:
                currentStatus.siteCount ?? cachedSiteCount ?? 0,
            source: STATE_SYNC_SOURCE.DATABASE,
            synchronized: true,
        }
      : {
            lastSyncAt: currentStatus.lastSyncAt,
            siteCount: cachedSiteCount ?? 0,
            source: STATE_SYNC_SOURCE.CACHE,
            synchronized: false,
        };
  ```

- **Decision:** Removed redundant `?? null` usage to satisfy the rule and keep semantics clear. No `eslint-disable` was needed.

### 2. Electron environment logging

- **File:** `electron/utils/environment.ts`

- **Rule:** `uptime-watcher/electron-no-console`

- **Old code:**

  ```ts
  } catch (error: unknown) {
      const normalized = ensureError(error);

      console.error("[Env] Failed to read process env", {
          error: normalized,
          key,
      });
      return undefined;
  }
  ```

- **New code:**

  ```ts
  } catch (error: unknown) {
      const normalized = ensureError(error);

      logger.error("[Env] Failed to read process env", {
          error: normalized,
          key,
      });
      return undefined;
  }
  ```

- **Decision:** Fixed the code to comply with the rule rather than disabling it. Diagnostics now flow through the shared logger.

### 3. Storybook CSF3 meta cleanup

- **File:** `storybook/stories/GalaxyBackground.stories.tsx`

- **Rule:** `storybook/no-title-property-in-meta`

- **Old code:**

  ```ts
  const meta: Meta<typeof GalaxyBackground> = {
      // ...
      tags: ["autodocs"],
      title: "Theme/GalaxyBackground",
  } satisfies Meta<typeof GalaxyBackground>;
  ```

- **New code:**

  ```ts
  const meta: Meta<typeof GalaxyBackground> = {
      // ...
      tags: ["autodocs"],
  } satisfies Meta<typeof GalaxyBackground>;
  ```

- **Decision:** Removed the explicit `title` from CSF3 meta and now rely on Storybook's auto-title behavior, eliminating the need for any disable.

### 4. State sync status normalization (follow-up)

- **File:** `electron/services/ipc/handlers/stateSyncHandlers.ts`
- **Change:** Normalize `lastSyncAt` to `null` when missing so consumers get a stable `number | null` instead of `undefined`. This matches renderer expectations for "no sync yet" without needing a lint directive.
- **Doc:** Added a remark to `shared/types/stateSync.ts` clarifying that `lastSyncAt = null` means no completed sync.

### 5. Deep merge assertions (kept, documented)

- **File:** `shared/types/themeConfig.ts`
- **Rule:** `@typescript-eslint/no-unsafe-type-assertion`
- **Decision:** The deep merge helper over `PartialDeep<T>` still uses a narrow assertion when returning the merged object, because TypeScript cannot fully prove the shape after dynamic merges. Guards now use `isObject` to avoid other assertions, and the remaining cast is localized and intentional. No further action recommended unless we accept much more complex conditional types.

## Existing ESLint-disable usage — high-level assessment

> Note: The items below summarize inspected patterns; individual inline comments already include short justifications in code. No additional disables were added in this pass.

### Config and tooling files

- **Files:**
  - `eslint.config.mjs`
  - `vite.config.ts`, `vitest*.config.ts`, `vitest.storybook.config.ts`, `vitest.electron.config.ts`
  - `playwright.config.ts`, `stylelint.config.mjs`, `stryker.config.mjs`, Storybook config files
- **Patterns:**
  - Targeted disables for:
    - `n/no-process-env` in Node-only config contexts
    - `import/no-commonjs` or module interop rules where the toolchain mandates CommonJS
    - `@eslint-community/eslint-comments/disable-enable-pair` for single-file config patterns
  - All are top-of-file or block-level with clear reasons.
- **Decision:** Keep as-is. These files are inherently special (tooling, not app runtime), and the disables are narrowly scoped and already documented inline. No configuration change needed at this time.

### Test harness and runner files

- **Files:**
  - Vitest setup files under `src/test/` and `storybook/`
  - Jest compatibility runner `test-runner-jest.config.js`
  - Playwright helpers under `playwright/`
- **Patterns:**
  - Disables around `n/no-process-env` for CI-related environment reads.
  - Occasional `@typescript-eslint/no-unsafe-assignment` where test utilities intentionally exercise unknown/any payloads.
- **Decision:** Retain these; they are localized to non-production test harness code and already include short explanations. Converting to configuration-level overrides wouldn't materially improve safety.

### Application code (src/, shared/, Electron/, storybook/)

- **Patterns observed:**
  - Occasional `eslint-disable-next-line` for:
    - Env access in a single shared helper (now centralized in `electron/utils/environment.ts`).
    - Interop with Electron/Node globals where type-level safety would be disproportionately complex for the benefit.
  - These disables are:
    - Line-scoped (not broad file disables).
    - Paired with comments explaining why they are needed.
- **Decision:** For this pass, no additional disables were removed because the remaining ones are either:

  - Directly tied to Node/Electron platform constraints, or
  - Guarding intentionally dynamic behavior where the rule cannot be satisfied without harming clarity.

  Future passes can revisit specific rules if we decide to narrow overrides in `eslint.config.mjs`, but there is no clear false-positive pattern yet that warrants a config change.

## Follow-up

- If we see repeated `eslint-disable` occurrences for the same rule in new code (especially in runtime modules), we should consider a targeted `overrides` entry in `eslint.config.mjs` scoped to those paths.
- For now, all known `eslint-disable` usages are either justified config/test harness exceptions or tightly scoped one-off cases.
