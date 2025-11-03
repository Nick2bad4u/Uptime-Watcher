import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LOG_TEMPLATES } from "../../../../../shared/utils/logTemplates";
import { DB_FILE_NAME } from "../../../../../electron/constants";

const loggerMock = {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
};

const getPathMock = vi.fn();
const createDatabaseSchemaMock = vi.fn();

interface MockDatabaseInstance {
    close: ReturnType<typeof vi.fn>;
    inTransaction: boolean;
    path: string;
    run: ReturnType<typeof vi.fn>;
}

const databaseInstances: MockDatabaseInstance[] = [];
let databaseConstructionHook: ((path: string) => void) | undefined;

vi.mock("../../../../../electron/utils/logger", () => ({
    logger: loggerMock,
}));

vi.mock("electron", () => ({
    app: {
        getPath: getPathMock,
    },
}));

vi.mock("../../../../../electron/services/database/utils/databaseSchema", () => ({
    createDatabaseSchema: createDatabaseSchemaMock,
}));

vi.mock("node-sqlite3-wasm", () => ({
    Database: class MockDatabase {
        public inTransaction = false;

        public readonly run = vi.fn((query: string) => {
            void query;
            return this;
        });

        public readonly close = vi.fn();

        public constructor(public readonly path: string) {
            databaseConstructionHook?.(path);
            databaseInstances.push(this);
        }
    },
}));

describe("DatabaseService strict coverage", () => {
    beforeEach(() => {
        databaseConstructionHook = undefined;
        databaseInstances.length = 0;
        createDatabaseSchemaMock.mockReset();
        getPathMock.mockReset();
        vi.resetModules();
        vi.clearAllMocks();
    });

    it("throws when attempting to read database before initialization", async () => {
        const { DatabaseService } = await import(
            "../../../../../electron/services/database/DatabaseService"
        );

        const service = DatabaseService.getInstance();

        expect(() => service.getDatabase()).toThrow(
            "Database not initialized. Call initialize() first."
        );
    });

    it("initializes the database exactly once and reuses the existing instance", async () => {
        const { DatabaseService } = await import(
            "../../../../../electron/services/database/DatabaseService"
        );

        const service = DatabaseService.getInstance();
        getPathMock.mockReturnValue("/tmp/runtime-test");

        const firstConnection = service.initialize();
        const expectedPath = path.join("/tmp/runtime-test", DB_FILE_NAME);

        expect(createDatabaseSchemaMock).toHaveBeenCalledWith(
            firstConnection
        );
        expect(databaseInstances).toHaveLength(1);
        const db = databaseInstances[0];
        expect(db).toBeDefined();
        expect(db!.path).toContain(DB_FILE_NAME);
        expect(db!.path).toContain("runtime-test");
        expect(path.normalize(db!.path)).toBe(path.normalize(expectedPath));
        expect(loggerMock.info).toHaveBeenCalledWith(
            `[DatabaseService] Initializing SQLite DB at: ${db!.path}`
        );

        const secondConnection = service.initialize();
        expect(secondConnection).toBe(firstConnection);
        expect(databaseInstances).toHaveLength(1);
    });

    it("propagates constructor failures during initialization", async () => {
        const { DatabaseService } = await import(
            "../../../../../electron/services/database/DatabaseService"
        );

        const service = DatabaseService.getInstance();
        getPathMock.mockReturnValue("/tmp/crash");
        databaseConstructionHook = () => {
            throw new Error("boom");
        };

        expect(() => service.initialize()).toThrow("boom");
        expect(loggerMock.error).toHaveBeenCalledWith(
            LOG_TEMPLATES.errors.DATABASE_SCHEMA_FAILED,
            expect.any(Error)
        );
        expect(createDatabaseSchemaMock).not.toHaveBeenCalled();
    });

    it("closes the database connection and clears state", async () => {
        const { DatabaseService } = await import(
            "../../../../../electron/services/database/DatabaseService"
        );

        const service = DatabaseService.getInstance();
        getPathMock.mockReturnValue("/tmp/close-scenario");
        service.initialize();

        const [db] = databaseInstances;
        expect(db).toBeDefined();

        service.close();

        expect(db?.close).toHaveBeenCalledTimes(1);
        expect(loggerMock.info).toHaveBeenCalledWith(
            LOG_TEMPLATES.services.DATABASE_CONNECTION_CLOSED
        );
        expect(() => service.getDatabase()).toThrow(
            "Database not initialized. Call initialize() first."
        );
    });

    it("logs errors encountered during close operations", async () => {
        const { DatabaseService } = await import(
            "../../../../../electron/services/database/DatabaseService"
        );

        const service = DatabaseService.getInstance();
        getPathMock.mockReturnValue("/tmp/close-failure");
        service.initialize();

        const [db] = databaseInstances;
        const closeError = new Error("close failed");
        db?.close.mockImplementation(() => {
            throw closeError;
        });

        expect(() => service.close()).toThrow(closeError);
        expect(loggerMock.error).toHaveBeenCalledWith(
            LOG_TEMPLATES.errors.DATABASE_SCHEMA_FAILED,
            closeError
        );
    });

    it("executes operations inside existing transactions without starting a new one", async () => {
        const { DatabaseService } = await import(
            "../../../../../electron/services/database/DatabaseService"
        );

        const service = DatabaseService.getInstance();
        getPathMock.mockReturnValue("/tmp/nested-tx");
        service.initialize();

        const [db] = databaseInstances;
        db!.inTransaction = true;

        const operation = vi.fn(async () => "nested result");
        const result = await service.executeTransaction(operation);

        expect(result).toBe("nested result");
        expect(operation).toHaveBeenCalledWith(db);
        expect(db!.run).not.toHaveBeenCalled();
        expect(loggerMock.warn).toHaveBeenCalledWith(
            expect.stringContaining("Nested transaction detected")
        );
    });

    it("commits successful transactions and returns the operation result", async () => {
        const { DatabaseService } = await import(
            "../../../../../electron/services/database/DatabaseService"
        );

        const service = DatabaseService.getInstance();
        getPathMock.mockReturnValue("/tmp/success-tx");
        service.initialize();

        const [db] = databaseInstances;
        db!.run.mockImplementation((query: string) => {
            if (query === "BEGIN TRANSACTION") {
                db!.inTransaction = true;
            }
            if (query === "COMMIT") {
                db!.inTransaction = false;
            }
            return db!;
        });

        const result = await service.executeTransaction(async () => "ok");

        expect(result).toBe("ok");
        expect(db!.run).toHaveBeenCalledWith("BEGIN TRANSACTION");
        expect(db!.run).toHaveBeenCalledWith("COMMIT");
        expect(loggerMock.debug).toHaveBeenCalledWith(
            "[DatabaseService] Started new transaction"
        );
        expect(loggerMock.debug).toHaveBeenCalledWith(
            "[DatabaseService] Successfully committed transaction"
        );
    });

    it("rolls back transactions when the operation fails", async () => {
        const { DatabaseService } = await import(
            "../../../../../electron/services/database/DatabaseService"
        );

        const service = DatabaseService.getInstance();
        getPathMock.mockReturnValue("/tmp/failure-tx");
        service.initialize();

        const [db] = databaseInstances;
        db!.run.mockImplementation((query: string) => {
            if (query === "BEGIN TRANSACTION") {
                db!.inTransaction = true;
            }
            if (query === "ROLLBACK") {
                db!.inTransaction = false;
            }
            return db!;
        });

        const failure = new Error("operation failed");

        await expect(
            service.executeTransaction(async () => {
                throw failure;
            })
        ).rejects.toThrow(failure);

        expect(db!.run).toHaveBeenCalledWith("ROLLBACK");
        expect(loggerMock.error).toHaveBeenCalledWith(
            "[DatabaseService] Transaction operation failed",
            failure
        );
        expect(loggerMock.debug).toHaveBeenCalledWith(
            "[DatabaseService] Successfully rolled back transaction"
        );
    });

    it("handles rollback errors and logs a diagnostic message", async () => {
        const { DatabaseService } = await import(
            "../../../../../electron/services/database/DatabaseService"
        );

        const service = DatabaseService.getInstance();
        getPathMock.mockReturnValue("/tmp/rollback-failure");
        service.initialize();

        const [db] = databaseInstances;
        const rollbackError = new Error("rollback boom");
        db!.run.mockImplementation((query: string) => {
            if (query === "BEGIN TRANSACTION") {
                db!.inTransaction = true;
                return db!;
            }
            if (query === "ROLLBACK") {
                throw rollbackError;
            }
            return db!;
        });

        await expect(
            service.executeTransaction(async () => {
                throw new Error("intermediate failure");
            })
        ).rejects.toThrow("intermediate failure");

        expect(loggerMock.error).toHaveBeenCalledWith(
            "[DatabaseService] Failed to rollback active transaction",
            rollbackError
        );
    });

    it("detects when SQLite already rolled back the transaction", async () => {
        const { DatabaseService } = await import(
            "../../../../../electron/services/database/DatabaseService"
        );

        const service = DatabaseService.getInstance();
        getPathMock.mockReturnValue("/tmp/auto-rollback");
        service.initialize();

        const [db] = databaseInstances;
        db!.run.mockImplementation((query: string) => {
            if (query === "BEGIN TRANSACTION") {
                db!.inTransaction = true;
            }
            return db!;
        });

        await expect(
            service.executeTransaction(async () => {
                db!.inTransaction = false;
                throw new Error("auto rollback");
            })
        ).rejects.toThrow("auto rollback");

        expect(loggerMock.debug).toHaveBeenCalledWith(
            "[DatabaseService] No active transaction to rollback (transaction was already rolled back by SQLite)"
        );
    });
});
