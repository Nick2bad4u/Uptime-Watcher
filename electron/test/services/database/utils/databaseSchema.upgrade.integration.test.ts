/**
 * Integration tests for forward-compatible database schema upgrades.
 *
 * @remarks
 * These tests verify that older on-disk schemas can be upgraded without
 * requiring manual database deletion. The upgrade path is intentionally
 * additive: we create missing tables/indexes and add missing dynamic monitor
 * columns derived from the monitor type registry.
 */

import { describe, expect, it, vi } from "vitest";

import {
    DATABASE_SCHEMA_VERSION,
    synchronizeDatabaseSchemaVersion,
} from "../../../../services/database/utils/schema/databaseSchema";

interface TableInfoRow {
    name?: unknown;
}

describe("databaseSchema upgrades (node-sqlite3-wasm)", () => {
    it("upgrades older user_version and adds missing dynamic monitor columns", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: databaseSchema", "component");
        await annotate("Category: Database", "category");
        await annotate("Type: Migration", "type");

        const sqliteModule =
            await vi.importActual<typeof import("node-sqlite3-wasm")>(
                "node-sqlite3-wasm"
            );

        const db = new sqliteModule.Database(":memory:");

        try {
            // Simulate an older database created before dynamic monitor fields
            // existed (or before new monitor types were added).
            db.run(
                `CREATE TABLE IF NOT EXISTS monitors (
                    id TEXT PRIMARY KEY,
                    site_identifier TEXT NOT NULL,
                    type TEXT NOT NULL,
                    enabled BOOLEAN NOT NULL DEFAULT 1,
                    check_interval INTEGER NOT NULL DEFAULT 300000,
                    timeout INTEGER NOT NULL DEFAULT 30000,
                    retry_attempts INTEGER NOT NULL DEFAULT 3,
                    status TEXT DEFAULT 'pending',
                    last_checked INTEGER,
                    next_check INTEGER,
                    response_time INTEGER,
                    last_error TEXT,
                    active_operations TEXT DEFAULT '[]',
                    created_at INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL
                )`
            );

            // Mark the schema as an older version.
            db.run("PRAGMA user_version = 1");

            expect(
                (db.get("PRAGMA user_version") as { user_version?: unknown })
                    .user_version
            ).toBe(1);

            expect(() =>
                synchronizeDatabaseSchemaVersion(db)
            ).not.toThrowError();

            const pragmaAfter = db.get("PRAGMA user_version") as {
                user_version?: unknown;
            };

            expect(pragmaAfter.user_version).toBe(DATABASE_SCHEMA_VERSION);

            const columns = db.all(
                "PRAGMA table_info(monitors)"
            ) as TableInfoRow[];
            const names = new Set(
                columns
                    .map((row) => row.name)
                    .filter(
                        (value): value is string => typeof value === "string"
                    )
            );

            // `url` is a dynamic field for HTTP monitors, so an older schema
            // without dynamic columns should have it added during upgrade.
            expect(names.has("url")).toBeTruthy();
        } finally {
            db.close();
        }
    });

    it("upgrades legacy user_version=0 schemas without skipping additive migrations", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: databaseSchema", "component");
        await annotate("Category: Database", "category");
        await annotate("Type: Migration", "type");

        const sqliteModule =
            await vi.importActual<typeof import("node-sqlite3-wasm")>(
                "node-sqlite3-wasm"
            );

        const db = new sqliteModule.Database(":memory:");

        try {
            // Simulate a legacy schema created before we managed PRAGMA
            // user_version. By default PRAGMA user_version is 0.
            expect(
                (db.get("PRAGMA user_version") as { user_version?: unknown })
                    .user_version
            ).toBe(0);

            // Create an old monitors table missing dynamic fields (e.g. `url`).
            db.run(
                `CREATE TABLE IF NOT EXISTS monitors (
                    id TEXT PRIMARY KEY,
                    site_identifier TEXT NOT NULL,
                    type TEXT NOT NULL,
                    enabled BOOLEAN NOT NULL DEFAULT 1,
                    check_interval INTEGER NOT NULL DEFAULT 300000,
                    timeout INTEGER NOT NULL DEFAULT 30000,
                    retry_attempts INTEGER NOT NULL DEFAULT 3,
                    status TEXT DEFAULT 'pending',
                    last_checked INTEGER,
                    next_check INTEGER,
                    response_time INTEGER,
                    last_error TEXT,
                    active_operations TEXT DEFAULT '[]',
                    created_at INTEGER NOT NULL,
                    updated_at INTEGER NOT NULL
                )`
            );

            expect(() =>
                synchronizeDatabaseSchemaVersion(db)
            ).not.toThrowError();

            const pragmaAfter = db.get("PRAGMA user_version") as {
                user_version?: unknown;
            };

            expect(pragmaAfter.user_version).toBe(DATABASE_SCHEMA_VERSION);

            const columns = db.all(
                "PRAGMA table_info(monitors)"
            ) as TableInfoRow[];
            const names = new Set(
                columns
                    .map((row) => row.name)
                    .filter(
                        (value): value is string => typeof value === "string"
                    )
            );

            // Dynamic column expected for HTTP monitors.
            expect(names.has("url")).toBeTruthy();
        } finally {
            db.close();
        }
    });
});
