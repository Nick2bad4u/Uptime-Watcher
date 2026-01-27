import type { Logger } from "@shared/utils/logger/interfaces";

import { isSqliteLockedError } from "@shared/utils/sqliteErrors";
import sqlite3 from "node-sqlite3-wasm";

import type { DatabaseService } from "../DatabaseService";

import { resolvePathWithinDirectory } from "./pathWithinDirectory";
import { createSanitizedFileName } from "./sanitizeBackupFileName";

const SNAPSHOT_BUSY_TIMEOUT_MS = 10_000;

function escapeSqlStringLiteral(value: string): string {
    // Defensive hardening: NUL bytes can behave unexpectedly across native
    // boundaries (SQLite bindings ultimately cross into C/C++). While Windows
    // paths cannot contain NUL bytes, JS strings can, and we never want such
    // values to reach SQLite.
    if (value.includes("\0")) {
        throw new Error("SQLite string literal cannot contain NUL bytes");
    }

    return `'${value.replaceAll("'", "''")}'`;
}

/**
 * Creates a database snapshot via `VACUUM INTO`.
 */
export function createVacuumSnapshot(args: {
    readonly dbPath: string;
    readonly snapshotPath: string;
}): void {
    const { dbPath, snapshotPath } = args;

    const tempDb = new sqlite3.Database(dbPath, {
        fileMustExist: true,
    });
    try {
        try {
            tempDb.exec(`PRAGMA busy_timeout = ${SNAPSHOT_BUSY_TIMEOUT_MS}`);
        } catch {
            // Best-effort; snapshot still works without it.
        }

        tempDb.exec(`VACUUM INTO ${escapeSqlStringLiteral(snapshotPath)}`);
    } finally {
        tempDb.close();
    }
}

/**
 * Creates a consistent snapshot in `snapshotDir`, retrying once after closing
 * the primary connection on SQLITE_BUSY/LOCKED.
 */
export function createConsistentSnapshot(args: {
    readonly databaseService: DatabaseService;
    readonly dbPath: string;
    readonly logger: Logger;
    readonly snapshotDir: string;
    readonly snapshotFileName: string;
}): string {
    const { databaseService, dbPath, logger, snapshotDir, snapshotFileName } =
        args;

    const safeName = createSanitizedFileName(snapshotFileName);
    const snapshotPath = resolvePathWithinDirectory(snapshotDir, safeName);

    // Preferred path: avoid disrupting the primary connection.
    try {
        createVacuumSnapshot({ dbPath, snapshotPath });
        return snapshotPath;
    } catch (error: unknown) {
        if (!isSqliteLockedError(error)) {
            throw error;
        }

        logger.warn(
            "[DataBackupService] Snapshot creation hit SQLITE_BUSY/LOCKED; retrying after closing primary connection"
        );

        databaseService.close();
        try {
            createVacuumSnapshot({ dbPath, snapshotPath });
            return snapshotPath;
        } finally {
            databaseService.initialize();
        }
    }
}
