import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LOG_TEMPLATES } from "../../../../../shared/utils/logTemplates";
import { DB_FILE_NAME } from "../../../../../electron/constants";

import type { Logger } from "@shared/utils/logger/interfaces";

type LoggerMock = Record<keyof Logger, ReturnType<typeof vi.fn>>;

function createLoggerMock(): LoggerMock {
    return {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    };
}

let loggerMock: LoggerMock | undefined;

const getLoggerMock = (): LoggerMock => {
    if (!loggerMock) {
        throw new Error("loggerMock has not been initialized");
    }

    return loggerMock;
};

function loggerModuleMockFactory(): typeof import("../../../../../electron/utils/logger") {
    loggerMock = createLoggerMock();

    return {
        dbLogger: createLoggerMock() as unknown as Logger,
        diagnosticsLogger: createLoggerMock() as unknown as Logger,
        logger: loggerMock as unknown as Logger,
        monitorLogger: createLoggerMock() as unknown as Logger,
    } satisfies typeof import("../../../../../electron/utils/logger");
}

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

class MockDatabase {
    public inTransaction = false;

    public readonly run = vi.fn((query: string) => {
        void query;
        return this;
    });

    public readonly close = vi.fn();

    public readonly path: string;

    public constructor(path: string) {
        this.path = path;
        databaseConstructionHook?.(path);
        databaseInstances.push(this);
    }
}

const sqliteModuleMock = {
    Database:
        MockDatabase as unknown as (typeof import("node-sqlite3-wasm"))["Database"],
} satisfies Partial<typeof import("node-sqlite3-wasm")>;

vi.mock("../../../../../electron/utils/logger", loggerModuleMockFactory);

vi.mock("electron", () => ({
    app: {
        getPath: getPathMock,
    } as unknown as (typeof import("electron"))["app"],
}));

vi.mock(
    "../../../../../electron/services/database/utils/databaseSchema",
    () =>
        ({
            createDatabaseSchema: createDatabaseSchemaMock,
        }) satisfies Partial<
            typeof import("../../../../../electron/services/database/utils/databaseSchema")
        >
);

vi.mock("node-sqlite3-wasm", () => sqliteModuleMock);

describe("databaseService strict coverage", () => {
    beforeEach(() => {
        databaseConstructionHook = undefined;
        databaseInstances.length = 0;
        createDatabaseSchemaMock.mockReset();
        getPathMock.mockReset();
        vi.resetModules();
        vi.clearAllMocks();
        const currentLogger = loggerMock;
        if (currentLogger) {
            for (const fn of Object.values(currentLogger)) {
                fn.mockClear();
            }
        }
    });

    it("throws when attempting to read database before initialization", async () => {
        const { DatabaseService } = await import(
            "../../../../../electron/services/database/DatabaseService"
        );

        const service = DatabaseService.getInstance();

        expect(() => service.getDatabase()).toThrowError(
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

        expect(createDatabaseSchemaMock).toHaveBeenCalledWith(firstConnection);
        expect(databaseInstances).toHaveLength(1);

        const db = databaseInstances[0];

        expect(db).toBeDefined();
        expect(db!.path).toContain(DB_FILE_NAME);
        expect(db!.path).toContain("runtime-test");
        expect(path.normalize(db!.path)).toBe(path.normalize(expectedPath));
        const logger = getLoggerMock();

        expect(logger.info).toHaveBeenCalledWith(
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

        expect(() => service.initialize()).toThrowError("boom");
        const logger = getLoggerMock();

        expect(logger.error).toHaveBeenCalledWith(
            LOG_TEMPLATES.errors.DATABASE_SCHEMA_FAILED,
            expect.objectContaining({ error: expect.any(Error) })
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
        const logger = getLoggerMock();

        expect(logger.info).toHaveBeenCalledWith(
            LOG_TEMPLATES.services.DATABASE_CONNECTION_CLOSED
        );
        expect(() => service.getDatabase()).toThrowError(
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

        expect(() => service.close()).toThrowError(closeError);
        const logger = getLoggerMock();

        expect(logger.error).toHaveBeenCalledWith(
            LOG_TEMPLATES.errors.DATABASE_CLOSE_FAILED,
            expect.objectContaining({ error: closeError })
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
        db!.run.mockClear();

        const operation = vi.fn(async () => "nested result");
        const result = await service.executeTransaction(operation);

        expect(result).toBe("nested result");
        expect(operation).toHaveBeenCalledWith(db);
        expect(db!.run).not.toHaveBeenCalled();
        const logger = getLoggerMock();

        expect(logger.warn).toHaveBeenCalledWith(
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
        const logger = getLoggerMock();

        expect(logger.debug).toHaveBeenCalledWith(
            "[DatabaseService] Started new transaction"
        );
        expect(logger.debug).toHaveBeenCalledWith(
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
        ).rejects.toThrowError(failure);

        expect(db!.run).toHaveBeenCalledWith("ROLLBACK");
        const logger = getLoggerMock();

        expect(logger.error).toHaveBeenCalledWith(
            "[DatabaseService] Transaction operation failed",
            failure
        );
        expect(logger.debug).toHaveBeenCalledWith(
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
        ).rejects.toThrowError("intermediate failure");

        const logger = getLoggerMock();

        expect(logger.error).toHaveBeenCalledWith(
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
        ).rejects.toThrowError("auto rollback");

        const logger = getLoggerMock();

        expect(logger.debug).toHaveBeenCalledWith(
            "[DatabaseService] No active transaction to rollback (transaction was already rolled back by SQLite)"
        );
    });
});
