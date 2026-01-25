import type { Logger } from "@shared/utils/logger/interfaces";

import { ensureError } from "@shared/utils/errorHandling";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

/**
 * Creates a new temporary directory.
 */
export async function createTempDirectory(prefix: string): Promise<string> {
    const tmpRoot = os.tmpdir();
    const tmpPrefix = path.join(tmpRoot, prefix);
    return fs.mkdtemp(tmpPrefix);
}

/**
 * Best-effort removal of a directory.
 */
export async function removeDirectorySafe(args: {
    readonly context: string;
    readonly directoryPath: string;
    readonly logger: Logger;
}): Promise<void> {
    try {
        await fs.rm(args.directoryPath, { force: true, recursive: true });
    } catch (error) {
        const normalizedError = ensureError(error);
        args.logger.warn(
            `[DataBackupService] Failed to remove ${args.context}`,
            normalizedError
        );
    }
}
