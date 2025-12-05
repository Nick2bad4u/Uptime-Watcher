---
name: "Remove-Eslint-Disable"
agent: "BeastMode"
description: "Review and clean up ESLint disable comments across the Uptime Watcher repo"
argument-hint: "Identify, remove, or justify eslint-disable comments. Produce a migration plan for any necessary rule changes."
---

# Review and Clean up ESLint disable comments for Uptime Watcher

This task focuses on eliminating unnecessary inline ESLint disables, standardizing justifications where they remain, and proposing configuration changes where appropriate. The goal is to reduce technical debt and bring the code base closer to a state where discipline can be enforced automatically rather than suppressed.

Commands you will use frequently:

- npm run lint:fix — runs ESLint autofix
- npm run type-check:all — confirm TypeScript type errors that may affect ESLint
- npm run test — run unit and integration tests (Vitest)
- npm run test:playwright — run Playwright E2E tests when relevant
- git grep -n "eslint-disable" or rg "eslint-disable" — locate inline disables

Step-by-step

1. Gather a list of inline disables.
	- Use the repo grep/rg command to find all occurrences of: eslint-disable, eslint-disable-line, eslint-disable-next-line.
	- Categorize the results by file types: configs (e.g., *.config.ts/.mjs), tests, src, shared, electron, storybook, docs, public, and generated assets.

2. Triage by category.
	- Config files (vite.config.ts, eslint.config.mjs, stylelint.config.mjs): many config files legitimately toggle rules; standardize top-of-file disables where they are required and prefer `overrides` in eslint.config.mjs instead of pervasive file-level disables where possible.
	- Test harness and runner files (vitest.*, test-runner-jest.config.js): explicit `n/no-process-env` or `unicorn/prefer-module` disables are often acceptable for runner configs—ensure these are minimal and have a short commented justification.
	- src/shared/electron code: aim to remove disables where the rule can be satisfied by code refactor or a typed wrapper. If unsafe `any` usage is necessary for an API shim, add a short justification and mark with a task to improve typing.
	- Generated or static assets (storybook-static, public/, dist): these are typically ignored by linting via eslint.config.mjs ignores; don't change unless the file is part of source tracked assets used for development.

3. For each disable: attempt to fix rather than remove the rule.
	- Prefer small code changes that respect the rule. Example: replace `// eslint-disable-next-line @typescript-eslint/no-explicit-any` with a precise type or a safe wrapper.
	- If the rule reports a false positive due to plugin limitations or type inference, create an override in the `eslint.config.mjs` file targeted to the specific path and rule rather than disabling inline.
	- If a disable is needed temporarily: replace broad top-of-file `/* eslint-disable */` with a targeted `/* eslint-disable rule/a, rule/b -- reason and ticket (#XXXX) */` and add a TODO referencing an issue to remove it.

4. When a configuration change is the better fix:
	- Propose a rule modification or an `overrides` in `eslint.config.mjs` with a minimal scope (path-level override) and a rationale comment within the rules array.
	- Do not propose global rule disabling. Instead, propose a narrow override and document the reason in the review file.

5. Document all decisions.
	- For each removed or modified disable, add a line to `docs/Reviews/Remove-Eslint-Disable-Review.md` describing: file path, rules removed, reason, and whether a follow-up issue is required.
	- If the disable remains, record the justification and the proposed removal plan or rule change (with a ticket reference).

6. Test and verify.
	- Re-run `npm run lint` then `npm run type-check:all` and `npm run test`. Fix any regressions and confirm E2E tests if relevant to the changed code.

Special Instructions and Policy for this repo

- Prefer to fix code rather than silencing rules. Use `eslint-disable-next-line` for a single line only when an exception is necessary.
- If a rule is a documented false positive for a specific plugin or file pattern, prefer adding an `overrides` entry for that file pattern in `eslint.config.mjs` (or a new config) and explain the rationale in the commit/PR.
- Standardize inline disables by placing a brief, one-line justification after the disable, e.g., `/* eslint-disable @typescript-eslint/no-unsafe-assignment -- Config file uses dynamic imports; plugin produces safe false positives (docs/issue#123) */`.
- When disabling `@eslint-community/eslint-comments/disable-enable-pair` for a config file, keep the inline comment but add `-- reason: single-file config pattern` justification.
- Do not add global config changes or rule-wide disables without opening an issue describing the risk and proposed change.

Acceptance Criteria

- All retained `eslint-disable` comments are justified and documented in `docs/Reviews/Remove-Eslint-Disable-Review.md` with a clear follow-up plan.
- No new test regressions; unit tests and core checks continue to pass.
- Commit messages should follow `chore(lint):` or `fix:` prefixes as appropriate and include short rationale. When a rule change is proposed, create a follow up issue and link to it in the PR/commit message.

If Attachments are present:

- Treat them as specific lint errors or problematic code regions requiring attention. Document any decisions and rationale in the review doc.

Examples & Quick Commands

- Find disables:
  - git grep -n "eslint-disable" -- "**/*"
  - rg --hidden --line-number "eslint-disable" --glob '!node_modules' --glob '!dist' | sort
- Run full check:
  - npm run lint:fix
  - npm run type-check:all
  - npm run test

Notes:

- Some top-level disables are intentional in configs for compatibility with the linting toolchain (like `/* eslint-disable @eslint-community/eslint-comments/disable-enable-pair` in `eslint.config.mjs`). Keep these only if they are justified and document them.
- If a rule is being repeatedly disabled across many source files, prefer a repository configuration change scoped to relevant files instead of inlining disables.

Good luck — this task is about making thoughtful, well-justified changes that improve long-term code quality.

# Remove-Eslint-Disable — Review and Decision Log

This document records findings, changes, and decisions made while assessing and removing inline `eslint-disable` comments across the Uptime Watcher repository.

## Goals

- Eliminate unnecessary inline `eslint-disable` comments from source files
- Standardize and minimize disables that remain
- Prefer configuration-level scoped overrides over inlining disables across many files
- Document any rules that must be modified or disabled with a narrow scope and a reason

## How to run checks

- Find `eslint-disable` occurrences:

  - npm i -g ripgrep (if not installed)
  - rg --hidden --line-number "eslint-disable" --glob '!node\_modules' --glob '!dist' | sort

- Run full automatic fixes and checks:

  - npm run lint\:all:fix
  - npm run type-check:all
  - npm run test

## Standard process for each `eslint-disable`

1. Find the file and locate the disable.
2. Determine the reason the rule was disabled.
3. Attempt a code fix that satisfies the rule (prefer this).
4. If not feasible:
   - If it’s a plugin false positive or a config file that legitimately requires different rules, prefer adding an `overrides` entry in `eslint.config.mjs` scoped to the affected directory or file pattern.
   - If it's a one-off, convert top-of-file disables to per-line `/* eslint-disable-next-line rule */` with an inline explanation.
   - When a disable must remain, add a documented justification and create a follow-up issue to track removing the disable long-term.
5. Re-run the linters and checks.

## Allowed exceptions and preferred patterns

- Config files (like `vite.config.ts`, `eslint.config.mjs`, `stylelint.config.mjs`) may contain top-of-file `/* eslint-disable ... */` entries. Keep these minimal, precise, and documented:
  - Example:
    ```ts
    /* eslint-disable @eslint-community/eslint-comments/disable-enable-pair -- single-file config pattern; prefer `overrides` for broad scope later */
    ```
- Test runner files and scripts may use `eslint-disable` for `n/no-process-env` or `unicorn/prefer-module` if the runner requires CommonJS or environment variables.
- Generated, vendor, or static build artifacts should be ignored by `eslint.config.mjs` using `ignores`; only adjust inline disables if the asset is part of the source tree.

## Standard justification format

When an inline disable cannot be removed, convert it to a single-line disable with a small justification. Use this format:

```ts
/* eslint-disable <rule1>[, rule2, ...] -- <short justification>. Ticket: <#123> if applicable */
```

Examples:

```ts
// eslint-disable-next-line n/no-process-env -- test script reads env in CI; documented in #456
/* eslint-disable @typescript-eslint/no-explicit-any -- Legacy adapter uses any internally; follow-up issue #789 to improve types */
```

## Documenting changes

Record all changes in this file with:

- File path
- Old disable (copy & paste)
- New state (removed, modified, replaced with override, or replaced with smaller disable)
- Rationale
- Follow-up item (issue reference or 'none')

For each file, please include the commit/PR link or short hash once the change is committed.

## Proposed eslint.config.mjs changes (if any)

If a rule is producing repeated or legitimate false positives for a specific file pattern, advocating a targeted `overrides` in `eslint.config.mjs` is preferred. Document the proposed override here with the rationale and example rule setting.
