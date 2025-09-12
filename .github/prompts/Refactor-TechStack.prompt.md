---
mode: "agent"
tools: ['edit', 'runNotebooks', 'search', 'new', 'runCommands', 'runTasks', 'usages', 'vscodeAPI', 'think', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'extensions', 'todos', 'runTests', 'sequentialthinking', 'review', 'reviewStaged', 'reviewUnstaged', 'websearch']
description: "Refactor code to align with Electron, React 19, TypeScript, Vite, Zustand, Vitest, Tailwind, and modern linting/testing best practices"
---

Refactor the codebase to fully leverage the following tech stack and conventions:

Tech Stack Context:

- Electron (v37+) for desktop app shell
- React 19 with hooks
- TypeScript (strict mode, v5.8+)
- Zustand for state management
- Vite for build tooling, Electron integration plugins
- Tailwind CSS 4 for styling
- Vitest & Playwright for testing (unit, e2e)
- ESLint (with TypeScript, React, security, accessibility, import, unicorn, etc.)
- Prettier for formatting
- Stylelint for CSS/Tailwind
- Commitlint, husky, lint-staged for commit/CI
- Zod for validation
- SQLite (wasm/native), axios for data and IO
- Electron IPC conventions (main/renderer split)
- Electron-log for logging
- Codecov for coverage, code quality enforcement

Refactor Requirements:

- Ensure TypeScript strict types throughout (including React, Zustand stores, hooks, Electron IPC)
- Align with project’s ESLint, Prettier, and Stylelint rules/configs
- Use Vite and Electron plugin conventions for builds and hot reloading
- Ensure all React components and hooks are idiomatic, functional, and use React 19 features
- Integrate Tailwind utility classes and keep styling consistent
- All state must use Zustand stores or React context as per project conventions
- Validate inputs and API with Zod schemas, export types for shared usage
- Ensure robust Electron IPC (main/renderer separation, type-safe channels, cleanup)
- Use electron-log for app logging (renderer and main)
- Error and loading states handled in every async UI component/hook
- Ensure all data persistence uses SQLite via wasm/native bridge, typed
- Use axios for HTTP, with error boundary integration and retry logic
- Follow file/folder naming conventions (kebab-case for files, PascalCase for components)
- Remove dead code, flatten nesting, extract utilities and hooks as needed
- Add/Update JSDoc with usage examples and type info

Testing Requirements:

- Ensure 100% test coverage with Vitest, Playwright for e2e, @testing-library/react for hooks/components
- Mock Electron, Zustand, and external APIs for tests
- Test all states: normal, error, loading, and edge cases
- Test IPC, database, and HTTP flows (mocked)
- Ensure CI passes lint, type, and coverage checks (Codecov, commitlint)

Integration & Documentation:

- Ensure all exports in relevant index.ts files
- Update README/docs with usage, integration, and migration info
- Add code comments/JSDoc for public APIs, types, and any tricky logic
- Document Electron/React integration, IPC patterns, and Zod schemas

File Structure:

- Place refactored code in correct src/ subdirs (components, hooks, stores, utils, electron, etc.)
- Ensure index.ts exports where required
- Create/Update test files next to source
- Update/add documentation as needed
