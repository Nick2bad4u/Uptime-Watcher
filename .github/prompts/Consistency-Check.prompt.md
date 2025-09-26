---
mode: "BeastMode"
tools: ['createFile', 'createDirectory', 'editFiles', 'search', 'runCommands', 'runTasks', 'usages', 'vscodeAPI', 'think', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'extensions', 'todos', 'runTests', 'context7', 'append_insight', 'describe_table', 'list_insights', 'list_tables', 'read_query', 'sequentialthinking', 'electron-mcp-server', 'execute_command', 'get_diagnostics', 'get_references', 'get_symbol_lsp_info', 'open_files', 'rename_symbol', 'review', 'reviewStaged', 'reviewUnstaged', 'websearch']
description: "Run a consistency audit tailored for the Uptime Watcher Electron + React stack."
---

# Uptime Watcher Consistency Audit Prompt

## Objective

Execute a repository-wide consistency review across all **implementation** files (ignore tests). Begin with foundational utilities and domain repositories before moving through the Electron main process, shared modules, and finally the renderer (`app.tsx`, routing, Zustand stores, UI components). Ensure alignment with the established Electron + React + SQLite architecture.

## Analysis Requirements

### 1. Structural Consistency Check

- [ ] Confirm uniform usage of the repository pattern, TypedEventBus, and contextBridge IPC wrappers.
- [ ] Flag any divergence from the layered separation: Electron main (infrastructure), shared/domain modules, renderer (presentation + state).
- [ ] Validate consistent application of dependency injection, factory helpers, and transaction wrappers.

### 2. Data Flow Audit

- [ ] Trace data paths end-to-end: database repositories → service/domain layer → IPC → renderer stores/components.
- [ ] Highlight inconsistent validation, sanitization, or transformation logic for comparable entities (e.g., monitors, heartbeats).
- [ ] Verify error propagation and logging follow the standardized structured logging approach across layers.

### 3. Logic Uniformity Review

- [ ] Detect duplicated domain logic implemented differently across repositories, services, or Zustand stores.
- [ ] Ensure Zustand slices share consistent patterns for selectors, actions, and async flows.
- [ ] Review side-effect management (async tasks, timers, Electron background work) for adherence to existing abstractions.

### 4. Interface Consistency

- [ ] Check IPC channel naming, payload schemas, and TypeScript contracts against current conventions.
- [ ] Confirm shared DTOs/types are reused instead of ad-hoc interfaces in renderer or main process code.
- [ ] Audit component props and service method signatures for alignment with documented types in `docs/TSDoc/`.

### 5. Inconsistency Detection

- [ ] Surface areas where similar operations (e.g., monitor CRUD, notification dispatching) diverge in implementation strategy.
- [ ] Identify anti-patterns (direct DB access in renderer, bypassing transaction helpers, untyped IPC calls).
- [ ] Flag “special case” code paths that should be generalized or expressed via shared utilities/hooks.

## Output Requirements

### 1. Categorized Report

For each inconsistency provide:
- File path(s) and focused code excerpts.
- Description of the inconsistency, referencing affected layer or pattern.
- Recommended alignment strategy referencing current best practice within the codebase.

### 2. Prioritization

Rank findings by:
- Risk to application stability or correctness.
- Likelihood of introducing bugs during upcoming feature development.
- Impact on maintainability and developer onboarding.

### 3. Improvement Suggestions

For each inconsistency category supply:
- The unified approach to adopt (cite specific files or patterns as exemplars).
- Concrete refactoring steps (ordered list).
- Impact analysis covering affected modules, IPC contracts, data schemas, and documentation.

### 4. Roadmap

Deliver a staged remediation plan:
- **Quick Wins** – low-effort standardizations (naming, shared utility adoption) with high payoff.
- **Medium-Term** – coordinated refactors (store consolidation, IPC contract normalization).
- **Long-Term** – architectural alignments (event bus middleware, shared validation layer).

## Additional Guidance

- Focus solely on implementation files; exclude `*.test.*`, Playwright specs, and storybook examples.
- Pay special attention to boundaries: repository ↔ service, main ↔ renderer IPC, renderer state ↔ components.
- Defer formatting concerns; structural consistency takes precedence (run `npm run lint:fix` after code changes).
- Reference existing documentation in `docs/TSDoc/` for canonical definitions before suggesting schema changes.
- Use the Electron MCP server to inspect runtime behavior or UI state if deeper context is required.
