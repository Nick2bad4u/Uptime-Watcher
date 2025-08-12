/**
 * Test suite for databaseSchema.simple
 *
 * @fileoverview Comprehensive tests for unknown functionality
 * in the Uptime Watcher application.
 *
 * @author GitHub Copilot
 * @since 2025-08-11
 * @category General
 * @module Unknown
 * @tags ["test"]
 */

import { describe, expect, it, vi, afterEach } from "vitest";
import { createDatabaseTables } from "../../../../services/database/utils/databaseSchema";

describe("Database Schema", () => {
    const mockDatabase = {
        run: vi.fn(),
    };

    afterEach(() => {
        vi.clearAllMocks();
    });
    it("should create tables", () => {
        mockDatabase.run.mockReturnValue(undefined);

        createDatabaseTables(mockDatabase as any);

        expect(mockDatabase.run).toHaveBeenCalled();
        expect(mockDatabase.run).toHaveBeenCalledWith(
            expect.stringContaining("CREATE TABLE IF NOT EXISTS sites")
        );
    });
    it("should handle errors", () => {
        mockDatabase.run.mockImplementation(() => {
            throw new Error("Database error");
        });
        expect(() => createDatabaseTables(mockDatabase as any)).toThrow(
            "Database error"
        );
    });
});
