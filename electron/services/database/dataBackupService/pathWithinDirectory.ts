import * as path from "node:path";

import { createSanitizedFileName } from "./sanitizeBackupFileName";

/**
 * Resolves a sanitized file name within a base directory.
 *
 * @remarks
 * This guards against path traversal attempts by ensuring the resolved target
 * path stays within `baseDirectory`.
 */
export function resolvePathWithinDirectory(
    baseDirectory: string,
    fileName: string
): string {
    const sanitizedFileName = createSanitizedFileName(fileName);
    const resolvedBase = path.resolve(baseDirectory);
    const normalizedBase = `${resolvedBase}${path.sep}`;
    const targetPath = path.resolve(resolvedBase, sanitizedFileName);

    if (!targetPath.startsWith(normalizedBase)) {
        throw new Error(
            `[DataBackupService] Refusing to write outside of ${resolvedBase}`
        );
    }

    return targetPath;
}
