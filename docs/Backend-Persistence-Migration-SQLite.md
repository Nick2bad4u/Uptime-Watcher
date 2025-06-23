# Backend Persistence Migration: lowdb → SQLite (node-sqlite3-wasm)

## Overview
This document explains the migration of Uptime Watcher's backend persistence layer from lowdb (JSON file) to SQLite using `node-sqlite3-wasm`. It covers the rationale, new schema, main backend logic, and best practices for maintainers.

---

## Motivation
- **Performance & Scalability**: SQLite offers robust, concurrent, and reliable storage for larger datasets and multi-process access, unlike lowdb's in-memory/JSON approach.
- **Data Integrity**: ACID-compliant transactions and schema enforcement reduce corruption risk.
- **Feature Expansion**: Enables advanced queries, multi-file DB support, and future analytics.

---

## New Database Schema
- **sites**: Stores all monitored sites and their monitor configs/history.
  - `identifier` (TEXT, PRIMARY KEY)
  - `name` (TEXT)
  - `monitors_json` (TEXT, JSON-encoded array of monitor objects)
- **settings**: Stores key-value app settings (e.g., historyLimit).
  - `key` (TEXT, PRIMARY KEY)
  - `value` (TEXT)
- **stats**: (Reserved for future use, e.g., uptime/downtime totals)
  - `key` (TEXT, PRIMARY KEY)
  - `value` (TEXT)

---

## Backend Logic & API
All persistence and CRUD operations are now handled via SQL queries using `node-sqlite3-wasm`. The main logic is in `electron/uptimeMonitor.ts`:

### Initialization
- On startup, the DB is created (if missing) in Electron's userData path.
- Tables are created if they do not exist.
- All sites and settings are loaded into memory and monitoring resumes as needed.

### CRUD Operations
- **Add/Update Site**: Upsert into `sites` table; monitors are stored as JSON.
- **Remove Site**: Delete from `sites` table and in-memory map.
- **Get Sites**: Always fetches from DB for latest state.
- **Update Settings**: Upsert into `settings` table.
- **History Limit**: Stored in `settings` and enforced in monitor history arrays.

### Monitoring Logic
- Per-site and per-monitor intervals are managed in memory.
- All status/history changes are persisted immediately to DB.
- Retry logic is used for DB reads/writes to handle transient errors.

### Export/Import
- **Export**: Serializes all sites and settings as JSON (for backup or migration).
- **Import**: Replaces all DB data with imported JSON, then reloads state.

### Error Handling
- All DB operations are wrapped in try/catch with logging and event emission for UI error display.
- Retries are used for critical read/write operations.

---

## Best Practices & Notes
- **Do not access or mutate the DB directly outside `uptimeMonitor.ts`**. Use the provided API/events.
- **Schema changes**: If you add new fields, update both the DB schema and the serialization logic.
- **Monitor history**: Always enforce `historyLimit` after changes.
- **Error handling**: Always log and emit errors for UI feedback.
- **Testing**: After changes, test add/update/remove site, monitoring, export/import, and app restart scenarios.

---

## Migration Steps (Summary)
1. Remove all lowdb usage/imports from backend.
2. Add and initialize SQLite DB with tables for sites, settings, and stats.
3. Refactor all CRUD and persistence logic to use SQL queries.
4. Update export/import to serialize/deserialize DB tables.
5. Test all flows and error handling.

---

## References
- [`electron/uptimeMonitor.ts`](./uptimeMonitor.ts) — Main backend logic
- [`node-sqlite3-wasm` docs](https://www.npmjs.com/package/node-sqlite3-wasm)
- Project [State & Theme Integration Guide](../docs/AI-State-Theme-Integration-Guide.md)

---

For questions or future migrations, see the comments in `uptimeMonitor.ts` and this document.


// Migration utility for replacing lowdb with node-sqlite3-wasm in Uptime Watcher
// This script will help you migrate your data and update your backend logic.

// 1. Install node-sqlite3-wasm:
//    npm install node-sqlite3-wasm

// 2. Replace all lowdb usage in your backend (electron/uptimeMonitor.ts) with node-sqlite3-wasm.
//    - Open the database with: const sqlite3 = require('node-sqlite3-wasm');
//    - const db = new sqlite3.Database('uptime-watcher.sqlite');
//    - Use db.run(), db.get(), db.all(), etc. for CRUD operations.
//
// 3. Define your schema (sites, settings, stats, etc.) and migrate any existing JSON data if needed.
//
// 4. Update your IPC handlers to use the new database logic.
//
// 5. Test all CRUD operations and monitoring resumption logic.

// See README or migration plan for more details.
