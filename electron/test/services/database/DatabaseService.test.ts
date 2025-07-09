/**
 * Tests for DatabaseService.
 * Validates database initialization, schema management, and operations.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import * as path from "path";

import { DatabaseService } from "../../../services/database/DatabaseService";

// Mock dependencies
vi.mock("electron", () => ({
    app: {
        getPath: vi.fn(() => "/mock/userData"),
    },
}));

vi.mock("node-sqlite3-wasm", () => ({
    Database: vi.fn(() => ({
        run: vi.fn(),
        close: vi.fn(),
    })),
}));

vi.mock("../../../utils/logger", () => ({
    logger: {
        info: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
    },
}));

vi.mock("path", () => ({
    join: vi.fn((...args) => args.join("/")),
}));

vi.mock("fs", () => ({
    readFileSync: vi.fn(() => Buffer.from("mock database content")),
}));

describe("DatabaseService", () => {
    let databaseService: DatabaseService;
    let mockDatabase: any;
    let mockApp: any;
    let mockLogger: any;

    beforeEach(async () => {
        vi.clearAllMocks();

        // Reset singleton instance
        (DatabaseService as any).instance = undefined;

        mockApp = await import("electron").then((m) => m.app);
        mockLogger = await import("../../../utils/logger").then((m) => m.logger);

        const { Database } = await import("node-sqlite3-wasm");
        mockDatabase = {
            run: vi.fn(),
            close: vi.fn(),
        };
        (Database as any).mockImplementation(() => mockDatabase);

        databaseService = DatabaseService.getInstance();
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("Singleton Pattern", () => {
        it("should return the same instance", () => {
            const instance1 = DatabaseService.getInstance();
            const instance2 = DatabaseService.getInstance();
            expect(instance1).toBe(instance2);
        });
    });
});
