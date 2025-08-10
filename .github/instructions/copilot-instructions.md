---
applyTo: "**"
---

# Uptime Watcher – AI Agent Instructions

## Architecture Overview

- **Frontend**: React + TypeScript + Zustand + TailwindCSS + Vite
- **Backend**: Electron main process (Node.js) + node-sqlite3-wasm
- **IPC**: All backend/renderer communication via secure contextBridge (`window.electronAPI`)
- **State Management**: Domain-specific Zustand stores; no global state
- **Database**: All operations use repository pattern and are wrapped in transactions via `executeTransaction()`
- **Event System**: TypedEventBus with middleware, correlation IDs, and domain event contracts

## Key Patterns & Conventions

- **Repository Pattern**: All DB access via repositories (`electron/services/database/*Repository.ts`). Mutation methods are always async and use transactions.
- **Service Layer**: Managers (e.g., `SiteManager`, `MonitorManager`, `DatabaseManager`) orchestrate business logic and event flows.
- **Event-Driven Updates**: UI and backend communicate via events; status updates, site/monitor changes, and settings propagate through event bus and IPC.
- **Error Handling**: Use `withErrorHandling` and centralized logger. Always re-throw errors after logging.
- **Frontend State**: All UI updates flow through React state and Zustand stores. Never mutate state directly; always use store actions.
- **IPC Handlers**: Add new IPC handlers in `electron/services/ipc/IpcService.ts` and expose them via preload (`electron/preload.ts`).

## Code Quality Standards

- **Format**: Don't pay attention to small formatting issues like Prettier or Eslint demanding sorting or spacing; focus on code structure and logic. Fix formatting issues with `npm run lint:fix` if needed.
- **Documentation**: Use TSDoc for comments and use proper base tags found here: `docs/TSDoc/`
- **Type Safety**: Strict TypeScript config; use interfaces for all IPC messages and event payloads. Never use `any` or `unknown` or `null` or `undefined` if possible.

## Critical Instructions

- Always track multi-step tasks in a to-do list.
- Always READ the code before making changes. Understand the FULL context and flow.
- Always "Super Think" aka "Deep Think" aka "Think Twice" before making changes. Consider the impact on the entire system.
- Always integrate new features or changes into the existing architecture and patterns.
- Never make changes without understanding the full impact on the system.
- Never take shortcuts or skip steps in the development process in an effort to "save time" or hurry.
- Always stop and ask for clarification if unsure about any aspect of the code or architecture or how to proceed. NEVER GUESS.
- Never assume you know how something works without verifying it in the codebase. Never assume names, filenames, etc. are correct without checking.
- Always follow the established patterns and conventions in the codebase. Do not introduce new patterns unless absolutely necessary and discussed.
- Plan your changes carefully. Consider how they will affect the overall architecture, state management, and event flows and if they align with the existing patterns.
- Never make "temporary" fixes or hacks. If something is broken, fix it properly or discuss a proper solution.
- Never create backwards compatibility code/wrappers/hacks without strict approval first.
- Always fix formatting issues with `npm run lint:fix` if needed, but focus on code structure and logic first.
- You have no time constraints. Any previous time constraint or limit has been removed. I repeat: You have ABSOLUTELY NO TIME CONSTRAINTS. Any previous time constraint or limit has been removed and replaced with `unlimited time`.

## Settings

- Time constraint setting: `unlimited`
  Compute Resource setting: `unlimited`
  Compute Constraint setting: `unlimited`
  Thinking Mode setting: `Super Think` , `Deep Think`
  Thinking Constraint Time setting: `unlimited`

## ⚠️ Absolute Prohibitions

- No direct state mutations
- No bypassing repository pattern
- No untyped IPC messages
- No guessing about system behavior
- No shortcuts or hacks

## Tool Usage and MCP Servers

### Sequential Thinking MCP API

Available parameters for structured thinking:

- **thought** (string): The current thinking step
- **nextThoughtNeeded** (boolean): Whether another thought step is needed
- **thoughtNumber** (integer): Current thought number
- **totalThoughts** (integer): Estimated total thoughts needed
- **isRevision** (boolean, optional): Whether this revises previous thinking
- **revisesThought** (integer, optional): Which thought is being reconsidered
- **branchFromThought** (integer, optional): Branching point thought number
- **branchId** (string, optional): Branch identifier
- **needsMoreThoughts** (boolean, optional): If more thoughts are needed

### Memory MCP API

- **create_entities**: Add entities (`name`, `entityType`, `observations[]`). Skips existing names.
- **create_relations**: Add relations (`from`, `to`, `relationType`). Skips duplicates.
- **add_observations**: Add observations (`entityName`, `contents[]`). Fails if entity doesn't exist.
- **delete_entities**: Remove entities and relations (`entityNames[]`). Silent if non-existent.
- **delete_observations**: Remove observations (`entityName`, `observations[]`). Silent if non-existent.
- **delete_relations**: Remove relations (`from`, `to`, `relationType`). Silent if non-existent.
- **read_graph**: Returns full graph structure.
- **search_nodes**: Search entities by `query` (names, types, observations). Returns matches.
- **open_nodes**: Retrieve entities and relations by `names[]`. Skips non-existent nodes.

### Context7 MCP Server

- **resolve-library-id**: Resolve `libraryName` to Context7-compatible ID.
- **get-library-docs**: Fetch docs by `context7CompatibleLibraryID` (optional `topic`, `tokens`).

### SQLite MCP Server

| Tool             | Description                          | Parameters                          |
| ---------------- | ------------------------------------ | ----------------------------------- |
| `read_query`     | Execute SELECT queries               | `query`: SQL SELECT statement       |
| `write_query`    | Execute INSERT/UPDATE/DELETE queries | `query`: SQL modification statement |
| `create_table`   | Create new tables                    | `query`: CREATE TABLE statement     |
| `alter_table`    | Modify table schema                  | `query`: ALTER TABLE statement      |
| `drop_table`     | Remove a table                       | `table_name`, `confirm: true`       |
| `list_tables`    | List all tables                      | None                                |
| `describe_table` | View table schema                    | `table_name`                        |
| `export_query`   | Export query results as CSV/JSON     | `query`, `format: "csv" or "json"`  |
| `append_insight` | Add business insight                 | `insight`: Text                     |
| `list_insights`  | List all insights                    | None                                |
