/**
 * Integration tests for the database schema utilities against the real
 * node-sqlite3-wasm implementation.
 *
 * @remarks
 * These tests exist because node-sqlite3-wasm requires explicit finalization of
 * prepared statements. Using Database.run/get/all avoids leaving statements
 * open and prevents startup failures such as:
 *
 * - "cannot commit transaction - SQL statements in progress"
 */

import { describe, expect, it, vi } from "vitest";

import {
    createDatabaseSchema,
    synchronizeDatabaseSchemaVersion,
} from "../../../../services/database/utils/databaseSchema";

describe("databaseSchema integration (node-sqlite3-wasm)", () => {
    it("creates schema and commits cleanly on a fresh database", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: databaseSchema", "component");
        await annotate("Category: Database", "category");
        await annotate("Type: Integration", "type");

        const sqliteModule =
            await vi.importActual<typeof import("node-sqlite3-wasm")>(
                "node-sqlite3-wasm"
            );

        const db = new sqliteModule.Database(":memory:");

        try {
            expect(() => createDatabaseSchema(db)).not.toThrowError();
            expect(() =>
                synchronizeDatabaseSchemaVersion(db)).not.toThrowError();

            const sitesTable = db.get(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='sites'"
            ) as unknown;
            expect(sitesTable).toBeTruthy();
        } finally {
            db.close();
        }
    });
});
