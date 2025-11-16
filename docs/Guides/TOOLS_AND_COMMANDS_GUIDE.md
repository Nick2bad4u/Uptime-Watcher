---

schema: "../../config/schemas/doc-frontmatter.schema.json"
title: "Tools and Commands Guide"
summary: "Reference for how the AI agent uses editing tools, search, tasks, tests, and diagnostics in the Uptime Watcher repository."
created: "2025-11-15"
last\_reviewed: "2025-11-15"
category: "guide"
author: "Nick2bad4u"
tags:

- "uptime-watcher"
- "tools"
- "commands"
- "ai-agent"
- "workflow"

---

# Tools and commands guide

This guide documents how the agent interacts with project tools: editing helpers, search/navigation, commands/tasks, diagnostics, and orchestration. It captures practical behavior observed in this repo rather than abstract theory.

## 🔧 Editing and filesystem operations

### File creation

- New files are created by passing an **absolute path** and full file content.
- Parent directories are created automatically when needed.
- Use this only when the file does **not** already exist; otherwise use patch-based edits.

Practical notes:

- Always use absolute Windows paths (`c:/Users/Nick/.../Uptime-Watcher/...`).
- Prefer creating scratch or experimental files under `temp/` or other non-critical folders.
- Never use file creation to overwrite an existing source file; use patch-based editing instead.

### Patch-based editing

- Existing files are modified using a custom diff format:
  - The entire change is wrapped in `*** Begin Patch` / `*** End Patch`.
  - Each file section starts with an action header, for example:
    - `*** Update File: c:/.../file.ts`
    - `*** Add File: c:/.../new-file.ts`
    - `*** Delete File: c:/.../old-file.ts`
  - Within an updated file:
    - Unchanged context lines are written as-is.
    - Lines to remove start with `-`.
    - Lines to add start with `+`.
- **Context matters**:
  - The patch engine matches on context, not line numbers.
  - Provide a few **stable** lines before and after the change to avoid mismatches; copying them from a fresh file read is safest.
  - For ambiguous areas, add `@@` markers to anchor a class or function.
- Only text files are supported; binary assets and notebooks are out of scope.

Advanced usage:

- Treat `read` → `think` → `patch` as a single workflow: always re-read the target region immediately before composing a patch.
- For multiple changes in the same file:
  - Use a separate `*** Update File: ...` hunk for each distinct region.
  - Make sure the pre/post context for each hunk does **not** overlap, to keep matching unambiguous.
  - If similar code appears many times, rely on `@@` markers plus slightly larger context windows.
- When a patch fails to apply, do **not** retry blindly with the same context; re-read the file and regenerate the patch from the current contents.

Multi-file patches:

- A single patch can operate on multiple files by including multiple action headers between `*** Begin Patch` and `*** End Patch`:
  - `*** Update File: c:/.../existing-file.ts` to modify an existing file.
  - `*** Add File: c:/.../new-file.ts` to create a new text file through the patch mechanism.
  - `*** Delete File: c:/.../old-file.ts` to remove an existing file.
- For each file section, provide its own context and hunks; do not interleave hunks from different files.

Common failure modes:

- **Context mismatch**: even small whitespace differences (extra blank lines, reordered sections) will cause an "Invalid context" error. Fix by re-reading the file and regenerating the patch.
- **Missing wrapper or headers**: patches must include both the `*** Begin Patch`/`*** End Patch` wrapper and a `*** <Action> File:` line for each file.
- **Overlapping hunks**: avoid multiple hunks that share the same context; keep each region's pre/post context unique.

## 🔍 Reading and search

### Listing directories

- Directory listings return names of children, with a trailing `/` for folders.
- Always pass absolute paths when working in this repo (e.g. `c:/Users/Nick/...`).

### Reading files

- File reads accept an absolute `filePath` and optional `offset`/`limit`:
  - `offset` is **1-based** line number.
  - `limit` bounds the number of lines returned.
- Large files are truncated around \~2000 lines, so pagination is required for long docs or configs.
- For understanding a section, request a generous slice (e.g. 200–400 lines) rather than many tiny reads.
- For **very large logs** (coverage runs, fuzzing output, etc.), it is often faster to:
  - Capture the command output into `temp/` via PowerShell redirection.
  - Read only the tail or a high `offset` window to see the summary.
  - Delete the temporary log once you have extracted what you need.

Additional tips:

- `offset` is 1-based: `offset: 1` starts at the first line, `offset: 201` starts at line 201.
- Prefer reading a focused window around the code you are changing instead of whole files; this keeps context tight and reduces noise.

### Text search (fast, pattern-based)

- Text search supports plain strings or regex, configured via a flag.
- Use `includePattern` to scope the search:
  - Example: `docs/**`, `src/**/*.ts`, `electron/**`.
- Results include file paths and line numbers, which can be combined with a subsequent file read.
- Searches are case-insensitive by default in this environment.

Formatting tips:

- Treat `includePattern` as a glob, not a regex. Use forward slashes and keep it relative to the workspace root (for example, `src/test/stores/alerts/**`).
- When looking for a symbol that appears in many places, narrow the pattern early (e.g. to `src/stores/**`) to avoid excessive, low-signal matches.

### File search (glob-based)

- File searches take a glob pattern relative to the workspace root.
- Common patterns:
  - `**/*.ts` for all TypeScript files.
  - `docs/Guides/*.md` for all guide documents.
  - `**/SomeFile.ts` for a specific file regardless of folder.

Behavior notes:

- File search respects ignore rules and tooling configuration. Files in certain folders (for example, `temp/` or generated output) may not appear even if they exist on disk.
- When working with scratch files that are intentionally ignored, rely on direct path-based file reads instead of file search.

### Semantic search

- Used when textual identifiers are unknown and a natural-language query is more appropriate.
- More expensive than plain text search, and should not be invoked in parallel with itself.
- Returns either key snippets or, in small workspaces, entire files.

## 🧪 Commands, tasks, and test runs

### Terminal commands (PowerShell)

- Commands run inside a persistent PowerShell session.
- Key rules for this project environment:
  - Use `;` to chain commands, **not** `&&` .Example: `Get-Location; Write-Host "Ready"`
  - Use `Set-Location` with absolute paths. Example: `Set-Location "c:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher"`
  - Quote paths with spaces using double quotes.
- For noisy commands, redirect output to a temp file:
  - Example: `npm run lint -- --help *> temp/lint-help.log`.
  - Then read the log via file-read tooling, and delete it afterwards.
- Use background mode for long-running servers (e.g. dev server, Electron shell).
- Avoid interactive commands that require user input. Use non-interactive flags when available.

Additional patterns:

- Always begin by changing to the repo root:
  - `Set-Location "c:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher"`.
- Use `*> temp\command-output.log` for commands that produce long or noisy output, then:
  - Inspect the log via file reads.
  - Delete it once you have summarized the key information.
- Avoid chaining too many operations into a single shell line; keep commands small and inspect results between steps.

#### Complex PowerShell Syntax Patterns

- **Piping and filtering**:
  - `Get-ChildItem -Path . -Filter *.js | Select-Object Name, Length`
  - `Get-Process | Where-Object { $_.ProcessName -like "*node*" } | Stop-Process -Force`
- **Variable assignment and expansion**:
  - `$output = npm test; Write-Host $output`
  - `$files = @("file1.txt", "file2.txt"); foreach ($file in $files) { Write-Host $file }`
- **Conditional execution with error handling**:
  - `if (Test-Path "path\to\file") { Write-Host "File exists" } else { Write-Host "Not found" }`
  - `try { npm run build } catch { Write-Host "Build failed: $_" }`
- **Output redirection**:
  - `*>` redirects all streams (stdout + stderr): `command *> output.log`
  - `2>&1` combines stderr into stdout: `command 2>&1 | Tee-Object -FilePath output.log`
  - `Out-Null` suppresses output: `command | Out-Null`
- **Background job execution**:
  - `Start-Job -ScriptBlock { npm run dev } -Name "dev-server"`
  - `Get-Job; Stop-Job -Name "dev-server"`
- **String interpolation**:
  - `Write-Host "Result: $(npm version)"`
  - `$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"; Write-Host "Log_$timestamp.txt"`
- **Array and hashtable operations**:
  - `$errors = @(); if ($error) { $errors += $error[0] }`
  - `$config = @{ "key" = "value" }; Write-Host $config.key`

### VS Code tasks

- Tasks such as `npm: Test`, `npm: Lint`, or `npm: Type-check:All` are accessible via the task runner.
- They are an abstraction over commands like `node --run test` or `npm run lint:fix`.
- For tasks that may take a while, it is possible to start them and later query their output.
- In this repository specifically:
  - `npm: Test` runs the main Vitest suite (`npm run test`).
  - `npm: Test:Coverage` runs `npm run test:coverage` to collect coverage.
  - `npm: Lint`, `npm: Lint:Fix`, and `npm: Lint:All:Fix` wrap the ESLint/TypeScript/Stylelint pipeline.
  - `npm: Type-check:All` mirrors `npm run type-check:all` and is the go-to for strict type validation.

Formatting notes:

- Task IDs are the exact strings shown in the workspace config (for example, `npm: Test`, `npm: Test:Coverage`).
- When invoking tasks programmatically, always provide the absolute `workspaceFolder` path along with the task ID, and read output via the associated task terminal or task-output helpers.

### Direct test runs

- Tests can be run via project scripts (e.g. `npm run test`) or via a test runner abstraction.
- The test runner supports:
  - Filtering by file path.
  - Filtering by test names.
  - A mode dedicated to coverage reporting.
- This repo uses **Vitest**, not Jest, so Jest-only flags such as `--runTestsByPath` are **not supported**. Passing them will cause a CLI error like `Unknown option --runTestsByPath`.
- Prefer the existing scripts instead of hand-crafting complex Vitest invocations:
  ```powershell
  Set-Location "c:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher"
  # Fast signal: run the main suite with a compact reporter
  npm run test
  # Full coverage run with the default reporter
  npm run test:coverage
  # Analyze coverage results to find the weakest files
  node scripts/analyze-coverage.mjs --no-color --format table --limit 20
  ```

Focused runs:

- When possible, run only the tests you care about by specifying a single test file (via the test runner abstraction) instead of the whole suite; this keeps feedback fast.
- Use coverage mode sparingly during iteration and more heavily when validating a finished change.

Vitest CLI flags:

- The underlying test runner is Vitest, so all CLI behavior matches its help output (for example, `vitest run --reporter=dot --silent --help`).
- Useful flags include:
  - `--reporter` to switch between reporters (default, verbose, dot, hanging-process, etc.).
  - `--coverage` to enable coverage.
  - `--testNamePattern` to filter by test name.
  - `--watch` to keep tests running in watch mode during development.

#### Example: increasing coverage for a Zustand store

The typical workflow used to raise coverage for `src/stores/alerts/useAlertStore.ts` looks like this:

1. **Run the tests and coverage once** to get a baseline:

```powershell
Set-Location "c:\Users\Nick\Dropbox\PC (2)\Documents\GitHub\Uptime-Watcher"
npm run test
npm run test:coverage
```

2. **Locate weak spots** using the coverage analyzer:

```powershell
node scripts/analyze-coverage.mjs --no-color --format table --limit 20
```

This prints a table of files sorted by lowest coverage. For example, it may show that `src/stores/alerts/useAlertStore.ts` has lower function/branch coverage than the surrounding code.

3. **Inspect the target module and tests**:

- Open `src/stores/alerts/useAlertStore.ts` to understand the queueing logic, timestamp normalization, and ID generation.
- Open `src/test/stores/alerts/useAlertStore.test.ts` to see existing scenarios and helper builders for `StatusUpdate` payloads.

4. **Design targeted tests for uncovered branches**. Concretely, additional tests were added to cover:

- Site-name derivation when the site name is blank but the identifier is present.
- Fallbacks to the event `siteIdentifier` and the final `"unknown-site"` branch when all identifiers are missing.
- Timestamp normalization when `StatusUpdate.timestamp` is not a parseable date (forcing a `Date.now()` fallback).
- Identifier generation behavior when `globalThis.crypto.randomUUID` is unavailable, using both `crypto.getRandomValues` and a pure `Date.now()` fallback.

5. **Re-run tests and coverage** to confirm the new behavior and improved metrics:

```powershell
npm run test
npm run test:coverage
node scripts/analyze-coverage.mjs --no-color --format table --limit 20
```

6. **Clean up temporary logs** created during this workflow (for example, any coverage logs captured under `temp/`). Keeping `temp/` tidy prevents accidental re-use of stale analysis.

## 🧰 Diagnostics and IDE integration

### Language server diagnostics

- Diagnostics queries pull errors, warnings, info, and hints from the editor's language servers.
- They can be filtered by:
  - Source (e.g. TypeScript, ESLint).
  - Severity (error, warning, info, hint).
- Particularly useful after targeted edits to avoid running the full lint or type-check pipeline.

Usage tips:

- Prefer targeted diagnostics on the files you just edited instead of global runs; this keeps feedback fast and focused.
- Use diagnostics as a final safety net after applying patches to confirm that the file still type-checks and passes linting.

### Symbol information and references

- LSP-backed helpers can:
  - Show hover information for a symbol (type, docstring, etc.).
  - Locate definitions and implementations.
  - List all references across the workspace with a configurable context window.
- These tools are preferable to raw search when refactoring types or APIs.

### Rename refactors

- Symbol rename operations update declarations, usages, and imports together.
- Safer than manual search/replace and keeps the codebase consistent.

## 🗂️ Orchestration and meta-tools

### Structured todo tracking

- The todo system stores an array of tasks; each entry includes:
  - `id` (integer identifier).
  - `title` (short label).
  - `description` (detailed context).
  - `status` (`not-started`, `in-progress`, `completed`).
- Every update must supply the **entire** list, not just a single modified item.
- Only one todo item should be `in-progress` at any given time.

Additional conventions:

- Use small, stable integer IDs (1, 2, 3, ...) and avoid renumbering items mid-stream.
- Keep titles short but descriptive, and use descriptions to capture enough context that a future agent can resume the work.

### Persistent memory

- Reserved only for long-lived, cross-session knowledge.
- File paths must live under the `/memories` root.
- Supported operations include creating files, replacing text, inserting content, deleting, and renaming.
- Temporary or per-PR details (e.g. checklists for one fix) should go in the repo, not in persistent memory.

Operational guidance:

- Use memory for durable knowledge about tooling behavior, architectural patterns, and user preferences that should survive across sessions.
- Avoid storing ephemeral state (e.g. open bug IDs, current branch, or one-off task checklists); keep those in repo files such as `TODO.md` instead.
- When using string-replacement operations, ensure the target text is unique within the file to prevent unintended edits.

### Sub-agents

- Sub-agents are best suited for small, well-defined tasks such as:
  - Grouping or transforming data extracted from the codebase.
  - Generating repetitive edits based on clear patterns.
- They receive a single prompt and return one answer; they are not interactive.
- Callers must specify the desired shape of the result explicitly (for example, a particular JSON object).
- Sub-agents should not be used for complex code understanding or multi-step workflows; those belong in the main agent.

## 🌐 External documentation helpers

### Web fetching and crawling

- When a concrete URL is provided in a request, web-fetching must be used to retrieve its content.
- If relevant links are discovered, additional fetches can be performed recursively until sufficient context is gathered.

### Tavily/DeepWiki helpers

- Tavily-based tools handle generic web search, site mapping, crawling, and targeted extraction.
- DeepWiki-based tools specialize in GitHub wikis and repository documentation. You can ask natural-language questions about the codebase and receive summarized answers based on the docs, even this one.
- Both are useful for:
  - Pulling in external API documentation (React, Electron, etc.).
  - Cross-checking project patterns against upstream recommendations.
  - Finding best practices for specific technologies used in the codebase.
