---
mode: "BeastMode"
tools: ['executePrompt', 'usages', 'testFailure', 'fetch', 'ms-vscode.vscode-websearchforcopilot/websearch', 'todos', 'edit/createFile', 'edit/createDirectory', 'edit/editFiles', 'search/fileSearch', 'search/textSearch', 'search/listDirectory', 'search/readFile', 'search/codebase', 'runCommands/runInTerminal', 'runCommands/getTerminalOutput', 'runTasks/runTask', 'runTasks/getTaskOutput', 'vscode-mcp/get_diagnostics', 'vscode-mcp/get_references', 'vscode-mcp/get_symbol_lsp_info', 'deepwiki/ask_question']
description: "Run a consistency audit tailored for the Uptime Watcher Electron + React stack."
---

# Uptime Watcher Consistency Audit Prompt

## Objective

Review implementation code across the stack to confirm the project continues to follow its layered Electron + React architecture. Cover foundational utilities, services, platform glue, and renderer-facing modules without dwelling on test-only files.

Go in detail to identify inconsistencies in structure, data flow, logic, and interfaces that could lead to maintenance challenges or bugs. Provide a prioritized report of findings with actionable recommendations for alignment.

Be super thorough and precise, as this will guide future refactoring and standardization efforts.

We want architectural perfection before adding new features.

If you find documentation gaps add them. If you find out-of-date documentation add a task to update it to the todo list.

## Analysis Requirements

### 1. Structural Alignment

- Ensure common architectural patterns for data access, eventing, and IPC are applied uniformly and respect the boundaries between infrastructure, shared logic, and presentation layers.
- Call out notable deviations from the expected layering or from the helper abstractions that already exist in the codebase.

### 2. Data Flow Health

- Trace representative flows from persistence through services and IPC into renderer state and UI to confirm validations, transformations, and error handling behave consistently.
- Note any mismatched logging or observability approaches that could hinder troubleshooting.

### 3. Logic Uniformity

- Look for domain rules or business logic implemented in multiple places with conflicting behaviour.
- Check that state stores and side-effect handlers follow the established conventions for naming, selectors, async control, and cleanup.

### 4. Interface Cohesion

- Compare IPC channels, shared contracts, and component/service signatures to the canonical types already published in shared modules or documentation.
- Highlight ad-hoc interfaces that should instead reuse the shared definitions.

### 5. Inconsistency Sweep

- Identify special-case paths or shortcuts that bypass shared utilities, transaction helpers, or event buses.
- Surface direct cross-layer calls or other anti-patterns that erode maintainability.

## Output Requirements

### 1. Categorized Report

For each inconsistency provide:
- Relevant file path(s) with concise excerpts.
- A short description of the issue, including the layer or pattern it affects.
- A recommended alignment approach grounded in an existing best practice within the repository.

### 2. Prioritization

Rank findings by their risk to stability, potential to introduce bugs, and overall impact on maintainability or onboarding.

### 3. Improvement Suggestions

Group related findings and outline:
- The preferred approach or exemplar to follow.
- Ordered steps to realign the affected code.
- Expected impact across modules, IPC contracts, schemas, or docs.

### 4. Roadmap

Suggest a staged plan:
- **Quick Wins** – light standardisations with meaningful payoff.
- **Medium-Term** – coordinated refactors requiring moderate coordination.
- **Long-Term** – deeper architectural work worth tracking separately.

## Additional Guidance

- Focus on implementation files; tests, Playwright specs, and Storybook content are out of scope.
- Prioritise cross-layer boundaries (repositories ↔ services, main ↔ renderer IPC, renderer state ↔ components).
- Treat formatting as secondary; address consistency first and run automated formatting afterwards if needed.
- Refer to existing documentation (e.g., `docs/TSDoc/`, architecture notes) before proposing schema or contract adjustments.
- Leverage available tooling (diagnostics, runtime inspection, etc.) when additional context is required.

# Fixing Inconsistencies

When addressing identified inconsistencies, follow these steps:
1. **Understand the Context**: Review the relevant code sections to fully grasp the intended functionality and how it fits within the overall architecture.
2. **Consult Documentation**: Refer to any existing documentation or architectural guidelines to ensure your changes align with established best practices.
3. **Refactor Thoughtfully**: Make changes that enhance consistency without introducing new issues. Ensure that your refactoring maintains the original functionality.
4. **Test Thoroughly**: After making changes, run existing tests and add new ones if necessary to verify that the changes do not break any functionality.
5. **Document Changes**: Update any relevant documentation to reflect the changes made, ensuring that future developers can understand the rationale behind the adjustments.
6. **No Backwards Compatibility**: Do NOT create backwards compatibility layers; instead, refactor all affected code to use the updated patterns or interfaces directly.
7. **Add to Todo List**: Add all identified inconsistencies to a detailed todo list with descriptions and work through the entire list.
