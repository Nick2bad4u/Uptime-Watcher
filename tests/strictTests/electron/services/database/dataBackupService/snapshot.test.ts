import { beforeEach, describe, expect, it, vi } from "vitest";

interface MockDatabaseInstance {
    readonly close: ReturnType<typeof vi.fn>;
    readonly exec: ReturnType<typeof vi.fn>;
    readonly openOptions: unknown;
    readonly path: string;
}

const databaseInstances: MockDatabaseInstance[] = [];
let execHook: ((sql: string) => void) | undefined;

class MockDatabase {
    public readonly close = vi.fn();

    public readonly exec = vi.fn((sql: string) => {
        execHook?.(sql);
        return undefined as never;
    });

    public readonly openOptions: unknown;

    public readonly path: string;

    public constructor(path: string, options?: unknown) {
        this.path = path;
        this.openOptions = options;
        databaseInstances.push(this);
    }
}

type Sqlite3WasmRuntimeModule = Omit<
    typeof import("node-sqlite3-wasm"),
    "Database" | "default"
> & {
    readonly Database: typeof MockDatabase;
    readonly default: {
        readonly Database: typeof MockDatabase;
    };
};

vi.mock(
    "node-sqlite3-wasm",
    () =>
        ({
            Database: MockDatabase,
            default: {
                Database: MockDatabase,
            },
        }) satisfies Partial<Sqlite3WasmRuntimeModule>
);

describe("snapshot (strict coverage)", () => {
    beforeEach(() => {
        databaseInstances.length = 0;
        execHook = undefined;
        vi.resetModules();
        vi.clearAllMocks();
    });

    it("creates a VACUUM snapshot, escaping single-quotes", async () => {
        const { createVacuumSnapshot } =
            await import("../../../../../../electron/services/database/dataBackupService/snapshot");

        const execCalls: string[] = [];
        execHook = (sql) => {
            execCalls.push(sql);
        };

        createVacuumSnapshot({
            dbPath: "/tmp/mock-db.sqlite",
            snapshotPath: "/tmp/backup-snap'shot.sqlite",
        });

        expect(databaseInstances).toHaveLength(1);
        expect(databaseInstances[0]?.path).toBe("/tmp/mock-db.sqlite");
        expect(databaseInstances[0]?.openOptions).toMatchObject({
            fileMustExist: true,
        });

        expect(
            execCalls.some((sql) => sql.includes("PRAGMA busy_timeout"))
        ).toBeTruthy();
        expect(execCalls).toContain(
            "VACUUM INTO '/tmp/backup-snap''shot.sqlite'"
        );
        expect(databaseInstances[0]?.close).toHaveBeenCalledTimes(1);
    });

    it("continues when PRAGMA busy_timeout fails", async () => {
        const { createVacuumSnapshot } =
            await import("../../../../../../electron/services/database/dataBackupService/snapshot");

        const execCalls: string[] = [];
        execHook = (sql) => {
            execCalls.push(sql);
            if (sql.includes("PRAGMA busy_timeout")) {
                throw new Error("PRAGMA not supported");
            }
        };

        createVacuumSnapshot({
            dbPath: "/tmp/mock-db.sqlite",
            snapshotPath: "/tmp/backup-snapshot.sqlite",
        });

        expect(
            execCalls.some((sql) => sql.includes("PRAGMA busy_timeout"))
        ).toBeTruthy();
        expect(execCalls).toContain(
            "VACUUM INTO '/tmp/backup-snapshot.sqlite'"
        );
        expect(databaseInstances[0]?.close).toHaveBeenCalledTimes(1);
    });

    it("rejects NUL bytes in snapshotPath but still closes the temp connection", async () => {
        const { createVacuumSnapshot } =
            await import("../../../../../../electron/services/database/dataBackupService/snapshot");

        const execCalls: string[] = [];
        execHook = (sql) => {
            execCalls.push(sql);
        };

        expect(() => {
            createVacuumSnapshot({
                dbPath: "/tmp/mock-db.sqlite",
                snapshotPath: "/tmp/backup\0snapshot.sqlite",
            });
        }).toThrowError(/nul bytes/i);

        expect(execCalls).toHaveLength(1);
        expect(execCalls[0]).toContain("PRAGMA busy_timeout");
        expect(databaseInstances[0]?.close).toHaveBeenCalledTimes(1);
    });

    it("createConsistentSnapshot returns the snapshot path on the first attempt", async () => {
        const { createConsistentSnapshot } =
            await import("../../../../../../electron/services/database/dataBackupService/snapshot");

        execHook = () => undefined;

        const databaseService = {
            close: vi.fn(),
            initialize: vi.fn(),
        };

        const logger = {
            warn: vi.fn(),
        };

        const result = createConsistentSnapshot({
            databaseService: databaseService as never,
            dbPath: "/tmp/mock-db.sqlite",
            logger: logger as never,
            snapshotDir: "/tmp/mock-dir",
            snapshotFileName: "backup-snapshot.sqlite",
        });

        expect(result).toContain("backup-snapshot.sqlite");
        expect(databaseService.close).not.toHaveBeenCalled();
        expect(databaseService.initialize).not.toHaveBeenCalled();
        expect(logger.warn).not.toHaveBeenCalled();
    });

    it("createConsistentSnapshot rethrows non-lock errors", async () => {
        const { createConsistentSnapshot } =
            await import("../../../../../../electron/services/database/dataBackupService/snapshot");

        execHook = (sql) => {
            if (sql.includes("VACUUM INTO")) {
                throw Object.assign(new Error("SQLITE_ERROR: fail"), {
                    code: "SQLITE_ERROR",
                });
            }
        };

        const databaseService = {
            close: vi.fn(),
            initialize: vi.fn(),
        };

        const logger = {
            warn: vi.fn(),
        };

        expect(() =>
            createConsistentSnapshot({
                databaseService: databaseService as never,
                dbPath: "/tmp/mock-db.sqlite",
                logger: logger as never,
                snapshotDir: "/tmp/mock-dir",
                snapshotFileName: "backup-snapshot.sqlite",
            })
        ).toThrowError(/sqlite_error/i);

        expect(databaseService.close).not.toHaveBeenCalled();
        expect(databaseService.initialize).not.toHaveBeenCalled();
        expect(logger.warn).not.toHaveBeenCalled();
    });

    it("createConsistentSnapshot retries once on SQLITE_BUSY and restores the primary connection", async () => {
        const { createConsistentSnapshot } =
            await import("../../../../../../electron/services/database/dataBackupService/snapshot");

        let vacuumAttempts = 0;
        execHook = (sql) => {
            if (sql.includes("VACUUM INTO")) {
                vacuumAttempts += 1;
                if (vacuumAttempts === 1) {
                    throw Object.assign(
                        new Error("SQLITE_BUSY: database is locked"),
                        {
                            code: "SQLITE_BUSY",
                        }
                    );
                }
            }
        };

        const databaseService = {
            close: vi.fn(),
            initialize: vi.fn(),
        };

        const logger = {
            warn: vi.fn(),
        };

        const result = createConsistentSnapshot({
            databaseService: databaseService as never,
            dbPath: "/tmp/mock-db.sqlite",
            logger: logger as never,
            snapshotDir: "/tmp/mock-dir",
            snapshotFileName: "backup-snapshot.sqlite",
        });

        expect(result).toContain("backup-snapshot.sqlite");
        expect(databaseService.close).toHaveBeenCalledTimes(1);
        expect(databaseService.initialize).toHaveBeenCalledTimes(1);
        expect(logger.warn).toHaveBeenCalledTimes(1);
        expect(databaseInstances).toHaveLength(2);
        expect(databaseInstances[0]?.close).toHaveBeenCalledTimes(1);
        expect(databaseInstances[1]?.close).toHaveBeenCalledTimes(1);
    });

    it("createConsistentSnapshot still reinitializes the primary connection if the retry fails", async () => {
        const { createConsistentSnapshot } =
            await import("../../../../../../electron/services/database/dataBackupService/snapshot");

        let vacuumAttempts = 0;
        execHook = (sql) => {
            if (sql.includes("VACUUM INTO")) {
                vacuumAttempts += 1;
                throw Object.assign(
                    new Error(`SQLITE_BUSY attempt ${vacuumAttempts}`),
                    {
                        code: "SQLITE_BUSY",
                    }
                );
            }
        };

        const databaseService = {
            close: vi.fn(),
            initialize: vi.fn(),
        };

        const logger = {
            warn: vi.fn(),
        };

        expect(() =>
            createConsistentSnapshot({
                databaseService: databaseService as never,
                dbPath: "/tmp/mock-db.sqlite",
                logger: logger as never,
                snapshotDir: "/tmp/mock-dir",
                snapshotFileName: "backup-snapshot.sqlite",
            })
        ).toThrowError(/sqlite_busy/i);

        expect(databaseService.close).toHaveBeenCalledTimes(1);
        expect(databaseService.initialize).toHaveBeenCalledTimes(1);
        expect(logger.warn).toHaveBeenCalledTimes(1);
        expect(databaseInstances).toHaveLength(2);
        expect(databaseInstances[0]?.close).toHaveBeenCalledTimes(1);
        expect(databaseInstances[1]?.close).toHaveBeenCalledTimes(1);
    });
});
