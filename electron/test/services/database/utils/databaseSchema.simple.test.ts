/**
 * Unit tests for the public database schema entry points.
 */

import type { Database } from "node-sqlite3-wasm";

import { fc } from "@fast-check/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createDatabaseSchema } from "../../../../services/database/utils/schema/databaseSchema";

const RUN_RESULT: ReturnType<Database["run"]> = {
    changes: 0,
    lastInsertRowid: 0,
};

const createMockDatabase = (): Pick<Database, "run"> => ({
    run: vi.fn<Database["run"]>(() => RUN_RESULT),
});

describe("Database Schema", () => {
    const maliciousInputs = [
        "'; DROP TABLE monitors; --",
        "' OR '1'='1",
        "'; INSERT INTO",
        "' UNION SELECT",
        "'; DELETE FROM",
        "<script>alert('xss')</script>",
        "../../../etc/passwd",
    ] as const;

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("creates the full schema in a transaction", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: databaseSchema", "component");
        await annotate("Category: Service", "category");
        await annotate("Type: Constructor", "type");

        const mockDatabase = createMockDatabase();

        createDatabaseSchema(mockDatabase as Database);

        expect(mockDatabase.run).toHaveBeenCalledWith("BEGIN TRANSACTION");
        expect(mockDatabase.run).toHaveBeenCalledWith(
            expect.stringContaining("CREATE TABLE IF NOT EXISTS sites")
        );
        expect(mockDatabase.run).toHaveBeenCalledWith(
            expect.stringContaining("CREATE TABLE IF NOT EXISTS monitors")
        );
        expect(mockDatabase.run).toHaveBeenCalledWith(
            expect.stringContaining(
                "CREATE INDEX IF NOT EXISTS idx_monitors_site_identifier"
            )
        );
        expect(mockDatabase.run).toHaveBeenCalledWith("COMMIT");
        expect(mockDatabase.run).not.toHaveBeenCalledWith("ROLLBACK");
    });

    it("rolls back when schema creation fails after the transaction starts", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: databaseSchema", "component");
        await annotate("Category: Service", "category");
        await annotate("Type: Error Handling", "type");

        const mockDatabase = createMockDatabase();
        vi.mocked(mockDatabase.run).mockImplementation((sql: string) => {
            if (sql.includes("CREATE TABLE")) {
                throw new Error("Database error");
            }
            return RUN_RESULT;
        });

        expect(() => {
            createDatabaseSchema(mockDatabase as Database);
        }).toThrow("Database error");

        expect(mockDatabase.run).toHaveBeenCalledWith("ROLLBACK");
        expect(mockDatabase.run).not.toHaveBeenCalledWith("COMMIT");
    });

    describe("Property-Based Database Schema Tests", () => {
        it("uses fixed SQL commands that do not include external data", async () => {
            await fc.assert(
                fc.property(
                    fc.array(fc.constantFrom(...maliciousInputs), {
                        minLength: 0,
                        maxLength: maliciousInputs.length,
                    }),
                    (selectedMaliciousInputs) => {
                        const mockDatabase = createMockDatabase();

                        createDatabaseSchema(mockDatabase as Database);

                        const sqlCommands = vi
                            .mocked(mockDatabase.run)
                            .mock.calls.map(([sql]) => sql);

                        expect(sqlCommands.length).toBeGreaterThan(0);

                        for (const command of sqlCommands) {
                            expect(command.trim()).toMatch(
                                /^(?:BEGIN TRANSACTION|COMMIT|CREATE INDEX IF NOT EXISTS|CREATE TABLE IF NOT EXISTS)/v
                            );

                            for (const input of selectedMaliciousInputs) {
                                expect(command).not.toContain(input);
                            }
                        }
                    }
                )
            );
        });

        it("handles repeated schema creation attempts consistently", async () => {
            await fc.assert(
                fc.property(fc.integer({ min: 1, max: 10 }), (attemptCount) => {
                    const mockDatabase = createMockDatabase();

                    for (let index = 0; index < attemptCount; index++) {
                        createDatabaseSchema(mockDatabase as Database);
                    }

                    expect(mockDatabase.run).toHaveBeenCalledTimes(
                        attemptCount * 13
                    );
                })
            );
        });
    });
});
