/* eslint-disable security/detect-non-literal-fs-filename -- This provider only operates on sandboxed paths under appRoot derived from validated keys. */

import type { Dirent } from "node:fs";

import {
    assertCloudObjectKey,
    DEFAULT_MAX_PROVIDER_OBJECT_KEY_BYTES,
    normalizeCloudObjectKey,
    normalizeProviderObjectKey,
} from "@shared/utils/cloudKeyNormalization";
import { tryGetErrorCode } from "@shared/utils/errorCodes";
import { ensureError } from "@shared/utils/errorHandling";
import { normalizePathSeparatorsToPosix } from "@shared/utils/pathSeparators";
import { randomUUID } from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { stringSplit } from "ts-extras";

import type {
    CloudObjectEntry,
    CloudStorageProvider,
} from "./CloudStorageProvider.types";

import { lstatIfExists, removePathBestEffort } from "../../../utils/fsSafeOps";
import { BaseCloudStorageProvider } from "./BaseCloudStorageProvider";
import { CloudProviderOperationError } from "./cloudProviderErrors";

const APP_ROOT_DIRECTORY_NAME = "uptime-watcher" as const;
const BACKUPS_PREFIX = "backups/" as const;

type FileSystemEntryStats = Awaited<ReturnType<typeof fs.lstat>>;

function assertSubpath(root: string, candidate: string): void {
    const normalizedRoot = path.resolve(root);
    const normalizedCandidate = path.resolve(candidate);

    const relative = path.relative(normalizedRoot, normalizedCandidate);

    if (relative.length === 0) {
        return;
    }

    // `path.relative` returns an absolute path when drives differ on Windows.
    if (
        path.isAbsolute(relative) ||
        relative === ".." ||
        relative.startsWith(`..${path.sep}`)
    ) {
        throw new Error("Invalid key path (path traversal)");
    }
}

function toPosixKey(root: string, absolutePath: string): string {
    return normalizePathSeparatorsToPosix(path.relative(root, absolutePath));
}

async function toCloudObjectEntry(
    key: string,
    absolutePath: string
): Promise<CloudObjectEntry> {
    const stat = await fs.lstat(absolutePath);

    if (stat.isSymbolicLink()) {
        throw new Error(`Refusing to read cloud object via symlink: ${key}`);
    }

    return {
        key,
        lastModifiedAt: stat.mtimeMs,
        sizeBytes: stat.size,
    };
}

async function assertSafeExistingDirectory(
    absolutePath: string,
    segment: string
): Promise<void> {
    const currentStat = await fs.lstat(absolutePath);
    if (currentStat.isSymbolicLink()) {
        throw new Error(
            `Refusing to create cloud directory through symlinked path component: ${segment}`
        );
    }

    if (!currentStat.isDirectory()) {
        throw new Error(
            `Expected directory but found non-directory entry at '${absolutePath}'`
        );
    }
}

async function readWritableObjectTargetStat(
    key: string,
    targetPath: string
): Promise<FileSystemEntryStats | null> {
    const stat = await lstatIfExists(targetPath);

    if (stat?.isSymbolicLink()) {
        throw new Error(`Refusing to write cloud object via symlink: ${key}`);
    }

    if (stat && !stat.isFile()) {
        throw new Error(`Filesystem cloud object is not a file: ${key}`);
    }

    return stat;
}

async function readDirectoryEntriesIfExists(
    directory: string
): Promise<Dirent[] | null> {
    try {
        return await fs.readdir(directory, { withFileTypes: true });
    } catch (error: unknown) {
        if (tryGetErrorCode(error) === "ENOENT") {
            return null;
        }

        throw ensureError(error);
    }
}

/**
 * Local filesystem-backed cloud provider.
 *
 * @remarks
 * Primarily used for integration tests and as a development transport.
 */
export class FilesystemCloudStorageProvider
    extends BaseCloudStorageProvider
    implements CloudStorageProvider
{
    public readonly kind = "filesystem" as const;

    private readonly appRoot: string;

    private appRootRealPath: null | string = null;

    private static assertNoWindowsDriveTokens(key: string): void {
        // Disallow Windows drive letters / NT namespaces in keys.
        // The provider keys are logical object identifiers, not OS paths.
        if (key.includes(":")) {
            throw new Error("Invalid key path (drive tokens are not allowed)");
        }
    }

    private static normalizePrefix(rawPrefix: string): string {
        const normalized = normalizeCloudObjectKey(rawPrefix, {
            allowEmpty: true,
            forbidAsciiControlCharacters: true,
            forbidTraversalSegments: true,
            maxByteLength: DEFAULT_MAX_PROVIDER_OBJECT_KEY_BYTES,
            stripLeadingSlashes: true,
        });

        FilesystemCloudStorageProvider.assertNoWindowsDriveTokens(normalized);

        if (!normalized) {
            return "";
        }

        return normalized.endsWith("/") ? normalized : `${normalized}/`;
    }

    private static normalizeObjectKey(rawKey: string): string {
        const normalized = normalizeProviderObjectKey(rawKey);
        assertCloudObjectKey(normalized);
        FilesystemCloudStorageProvider.assertNoWindowsDriveTokens(normalized);
        return normalized;
    }

    private static resolvePrefixPath(root: string, prefix: string): string {
        if (!prefix) {
            return root;
        }

        const absolutePath = path.resolve(
            root,
            ...stringSplit(prefix, "/").filter(Boolean)
        );
        assertSubpath(root, absolutePath);
        return absolutePath;
    }

    private async getAppRootRealPath(): Promise<string> {
        await this.ensureAppRoot();
        const currentRealPath = await fs.realpath(this.appRoot);

        if (this.appRootRealPath && this.appRootRealPath !== currentRealPath) {
            throw new Error(
                "Filesystem cloud root changed while provider is active"
            );
        }

        this.appRootRealPath = currentRealPath;
        return currentRealPath;
    }

    private async assertNoSymlinkPathComponents(
        root: string,
        absolutePath: string
    ): Promise<void> {
        const relative = path.relative(root, absolutePath);

        if (relative.length === 0) {
            // Root itself.
            return;
        }

        const segments = stringSplit(relative, path.sep).filter(Boolean);
        let cursor = root;

        // Check every existing component; refuse to traverse through symlinks
        // (including Windows junctions).
        for (const segment of segments) {
            cursor = path.join(cursor, segment);
            // eslint-disable-next-line no-await-in-loop -- must validate each path component sequentially to avoid TOCTOU issues
            const stat = await lstatIfExists(cursor);

            // Component doesn't exist yet (e.g., upload). That is fine.
            if (stat?.isSymbolicLink()) {
                throw new Error(
                    `Refusing to access cloud object through symlinked path component: ${segment}`
                );
            }
        }
    }

    private async ensureSafeDirectory(
        absoluteDirectory: string
    ): Promise<void> {
        const root = await this.getAppRootRealPath();
        const resolved = path.resolve(absoluteDirectory);
        assertSubpath(root, resolved);

        const relative = path.relative(root, resolved);
        const segments = stringSplit(relative, path.sep).filter(
            (segment) => segment.length > 0
        );

        let cursor = root;
        for (const segment of segments) {
            cursor = path.join(cursor, segment);

            // eslint-disable-next-line no-await-in-loop -- must create/check each segment sequentially to prevent symlink races
            const stat = await lstatIfExists(cursor);
            if (stat) {
                // eslint-disable-next-line no-await-in-loop -- each path segment must be verified before proceeding to children
                await assertSafeExistingDirectory(cursor, segment);
            } else {
                // eslint-disable-next-line no-await-in-loop -- mkdir must be sequential with the lstat above
                await fs.mkdir(cursor).catch((error: unknown) => {
                    const code = tryGetErrorCode(error);

                    if (code === "EEXIST") {
                        return;
                    }

                    throw error;
                });

                // Directory created, or another process won the creation race.
                // Re-check it to avoid trusting an `EEXIST` result for a
                // symlink or non-directory entry.
                // eslint-disable-next-line no-await-in-loop -- verification must follow mkdir for this path component
                await assertSafeExistingDirectory(cursor, segment);
            }
        }
    }

    public async isConnected(): Promise<boolean> {
        await this.ensureAppRoot();
        const stat = await fs.stat(this.appRoot);
        return stat.isDirectory();
    }

    public async listObjects(prefix: string): Promise<CloudObjectEntry[]> {
        try {
            const root = await this.getAppRootRealPath();
            const normalizedPrefix =
                FilesystemCloudStorageProvider.normalizePrefix(prefix);
            const startDirectory =
                FilesystemCloudStorageProvider.resolvePrefixPath(
                    root,
                    normalizedPrefix
                );
            const startStat = await lstatIfExists(startDirectory);

            if (!startStat) {
                return [];
            }

            if (startStat.isSymbolicLink()) {
                throw new Error(
                    `Refusing to list cloud objects via symlinked prefix: ${normalizedPrefix}`
                );
            }

            if (!startStat.isDirectory()) {
                return [];
            }

            const results: CloudObjectEntry[] = [];

            const walk = async (directory: string): Promise<void> => {
                const entries = await readDirectoryEntriesIfExists(directory);
                if (!entries) {
                    return;
                }

                for (const entry of entries) {
                    const absolute = path.join(directory, entry.name);

                    if (entry.isDirectory()) {
                        // eslint-disable-next-line no-await-in-loop -- Filesystem provider listing intentionally stats directories sequentially to bound provider IO.
                        const stat = await lstatIfExists(absolute);

                        if (!stat) {
                            continue;
                        }

                        if (stat.isDirectory() && !stat.isSymbolicLink()) {
                            // eslint-disable-next-line no-await-in-loop -- Filesystem provider listing intentionally walks sequentially to bound provider IO.
                            await walk(absolute);
                        }

                        continue;
                    }

                    if (entry.isFile()) {
                        const key = toPosixKey(root, absolute);
                        if (!key.startsWith(normalizedPrefix)) {
                            continue;
                        }

                        // Ensure the derived key is already canonical.
                        //
                        // @remarks
                        // Filesystem filenames can contain leading/trailing
                        // whitespace and other oddities that we intentionally
                        // do not normalize into a *different* cloud key. If a
                        // key would change under normalization, ignore it.
                        try {
                            const normalizedKey =
                                FilesystemCloudStorageProvider.normalizeObjectKey(
                                    key
                                );
                            if (normalizedKey !== key) {
                                continue;
                            }
                        } catch {
                            continue;
                        }

                        try {
                            // eslint-disable-next-line no-await-in-loop -- Filesystem provider listing intentionally stats files sequentially to bound provider IO.
                            const cloudEntry = await toCloudObjectEntry(
                                key,
                                absolute
                            );
                            results.push(cloudEntry);
                        } catch {
                            // Ignore files that disappear or become unreadable while listing.
                        }
                    }
                }
            };

            await walk(startDirectory);

            results.sort((a, b) => a.key.localeCompare(b.key));
            return results;
        } catch (error) {
            const code = tryGetErrorCode(error);
            const normalized = ensureError(error);
            throw new CloudProviderOperationError(
                `Failed to list filesystem objects for prefix '${prefix}': ${normalized.message}`,
                {
                    cause: error,
                    code,
                    operation: "listObjects",
                    providerKind: this.kind,
                    target: prefix,
                }
            );
        }
    }

    public async downloadObject(key: string): Promise<Buffer> {
        const normalizedKey =
            FilesystemCloudStorageProvider.normalizeObjectKey(key);

        try {
            await this.ensureAppRoot();
            const absolute = await this.resolveKeyPath(normalizedKey);
            return await fs.readFile(absolute);
        } catch (error) {
            const code = tryGetErrorCode(error);
            const normalized = ensureError(error);
            throw new CloudProviderOperationError(
                `Failed to download filesystem object '${normalizedKey}': ${normalized.message}`,
                {
                    cause: error,
                    code,
                    operation: "downloadObject",
                    providerKind: this.kind,
                    target: normalizedKey,
                }
            );
        }
    }

    public async uploadObject(args: {
        buffer: Buffer;
        key: string;
        overwrite?: boolean;
    }): Promise<CloudObjectEntry> {
        const key = FilesystemCloudStorageProvider.normalizeObjectKey(args.key);
        const isOverwrite = args.overwrite ?? false;

        let tempPath: null | string = null;

        try {
            await this.ensureAppRoot();
            const targetPath = await this.resolveKeyPath(key);
            await this.ensureSafeDirectory(path.dirname(targetPath));

            await readWritableObjectTargetStat(key, targetPath);

            tempPath = `${targetPath}.tmp-${randomUUID()}`;
            const backupPath = `${targetPath}.bak-${randomUUID()}`;

            await fs.writeFile(tempPath, args.buffer, { flag: "wx" });

            const renameTempToTarget = async (): Promise<void> => {
                if (!tempPath) {
                    throw new Error("Internal error: temp path not set");
                }

                try {
                    await fs.rename(tempPath, targetPath);
                } catch (error) {
                    const code = tryGetErrorCode(error);

                    if (code === "ENOENT") {
                        await this.ensureSafeDirectory(
                            path.dirname(targetPath)
                        );
                        await fs.rename(tempPath, targetPath);
                        return;
                    }

                    throw error;
                }
            };

            const latestTargetStat = await readWritableObjectTargetStat(
                key,
                targetPath
            );
            const isTargetExists = latestTargetStat?.isFile() === true;

            if (!isOverwrite && isTargetExists) {
                throw new CloudProviderOperationError(
                    `Filesystem cloud object already exists: ${key}`,
                    {
                        code: "EEXIST",
                        operation: "uploadObject",
                        providerKind: this.kind,
                        target: key,
                    }
                );
            }

            if (!isTargetExists) {
                await renameTempToTarget();
                return await toCloudObjectEntry(key, targetPath);
            }

            // Swap files with a backup to preserve atomicity across platforms.
            await fs.rename(targetPath, backupPath);
            try {
                await renameTempToTarget();
            } catch (error) {
                const rollbackErrors: Error[] = [];

                await fs
                    .rm(tempPath, { force: true })
                    .catch((rollbackError: unknown) => {
                        rollbackErrors.push(ensureError(rollbackError));
                    });
                await fs
                    .rename(backupPath, targetPath)
                    .catch((rollbackError: unknown) => {
                        rollbackErrors.push(ensureError(rollbackError));
                    });

                if (rollbackErrors.length > 0) {
                    throw new AggregateError(
                        [ensureError(error), ...rollbackErrors],
                        "Failed to upload filesystem object and restore the previous object",
                        { cause: error }
                    );
                }

                throw error;
            }

            await removePathBestEffort(backupPath);

            return await toCloudObjectEntry(key, targetPath);
        } catch (error) {
            if (tempPath) {
                await removePathBestEffort(tempPath);
            }

            if (error instanceof CloudProviderOperationError) {
                throw error;
            }

            const code = tryGetErrorCode(error);
            const normalized = ensureError(error);
            throw new CloudProviderOperationError(
                `Failed to upload filesystem object '${key}': ${normalized.message}`,
                {
                    cause: error,
                    code,
                    operation: "uploadObject",
                    providerKind: this.kind,
                    target: key,
                }
            );
        }
    }

    public async deleteObject(key: string): Promise<void> {
        const normalizedKey =
            FilesystemCloudStorageProvider.normalizeObjectKey(key);

        try {
            await this.ensureAppRoot();
            const absolute = await this.resolveKeyPath(normalizedKey);

            const stat = await lstatIfExists(absolute);
            if (!stat) {
                return;
            }

            if (stat.isSymbolicLink()) {
                throw new Error(
                    `Refusing to delete cloud object via symlink: ${normalizedKey}`
                );
            }

            if (!stat.isFile()) {
                throw new Error(
                    `Filesystem cloud object is not a file: ${normalizedKey}`
                );
            }

            await fs.rm(absolute, { force: true });
        } catch (error) {
            const code = tryGetErrorCode(error);
            const normalized = ensureError(error);
            throw new CloudProviderOperationError(
                `Failed to delete filesystem object '${normalizedKey}': ${normalized.message}`,
                {
                    cause: error,
                    code,
                    operation: "deleteObject",
                    providerKind: this.kind,
                    target: normalizedKey,
                }
            );
        }
    }

    private async ensureAppRoot(): Promise<void> {
        await fs.mkdir(this.appRoot, { recursive: true });
        const stat = await fs.lstat(this.appRoot);

        if (stat.isSymbolicLink()) {
            throw new Error("Filesystem cloud root must not be a symlink");
        }

        if (!stat.isDirectory()) {
            throw new Error("Filesystem cloud root must be a directory");
        }
    }

    private async resolveKeyPath(key: string): Promise<string> {
        const normalizedKey =
            FilesystemCloudStorageProvider.normalizeObjectKey(key);

        const root = await this.getAppRootRealPath();
        const absolutePath = path.resolve(
            root,
            ...stringSplit(normalizedKey, "/")
        );
        assertSubpath(root, absolutePath);
        await this.assertNoSymlinkPathComponents(root, absolutePath);
        return absolutePath;
    }

    public constructor(args: { baseDirectory: string }) {
        super(BACKUPS_PREFIX);
        this.appRoot = path.resolve(
            args.baseDirectory,
            APP_ROOT_DIRECTORY_NAME
        );
    }
}

/* eslint-enable security/detect-non-literal-fs-filename -- End sandboxed filesystem provider rules override. */
