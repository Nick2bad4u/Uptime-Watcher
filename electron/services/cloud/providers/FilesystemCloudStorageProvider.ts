/* eslint-disable security/detect-non-literal-fs-filename -- This provider only operates on sandboxed paths under appRoot derived from validated keys. */

import { tryGetErrorCode } from "@shared/utils/errorCodes";
import { ensureError } from "@shared/utils/errorHandling";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import type {
    CloudObjectEntry,
    CloudStorageProvider,
} from "./CloudStorageProvider.types";

import {
    assertCloudObjectKey,
    normalizeCloudObjectKey,
    normalizeProviderObjectKey,
} from "../cloudKeyNormalization";
import { BaseCloudStorageProvider } from "./BaseCloudStorageProvider";

const APP_ROOT_DIRECTORY_NAME = "uptime-watcher" as const;
const BACKUPS_PREFIX = "backups/" as const;

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
    return path.relative(root, absolutePath).replaceAll("\\", "/");
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

    private async getAppRootRealPath(): Promise<string> {
        if (this.appRootRealPath) {
            return this.appRootRealPath;
        }

        await this.ensureAppRoot();
        this.appRootRealPath = await fs.realpath(this.appRoot);
        return this.appRootRealPath;
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

        const segments = relative.split(path.sep).filter(Boolean);
        let cursor = root;

        // Check every existing component; refuse to traverse through symlinks
        // (including Windows junctions).
        for (const segment of segments) {
            cursor = path.join(cursor, segment);
            // eslint-disable-next-line no-await-in-loop -- must validate each path component sequentially to avoid TOCTOU issues
            const stat = await fs.lstat(cursor).catch(() => null);

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
        const segments = relative
            .split(path.sep)
            .filter((segment) => segment.length > 0);

        let cursor = root;
        for (const segment of segments) {
            cursor = path.join(cursor, segment);

            // eslint-disable-next-line no-await-in-loop -- must create/check each segment sequentially to prevent symlink races
            const stat = await fs.lstat(cursor).catch(() => null);
            if (stat) {
                if (stat.isSymbolicLink()) {
                    throw new Error(
                        `Refusing to create cloud directory through symlinked path component: ${segment}`
                    );
                }

                if (!stat.isDirectory()) {
                    throw new Error(
                        `Expected directory but found non-directory entry at '${cursor}'`
                    );
                }
            } else {
                // eslint-disable-next-line no-await-in-loop -- mkdir must be sequential with the lstat above
                await fs.mkdir(cursor).catch((error: unknown) => {
                    const code = tryGetErrorCode(error);

                    if (code === "EEXIST") {
                        return;
                    }

                    throw error;
                });

                // Directory created.
            }
        }
    }

    public async isConnected(): Promise<boolean> {
        try {
            await this.ensureAppRoot();
            const stat = await fs.stat(this.appRoot);
            return stat.isDirectory();
        } catch {
            return false;
        }
    }

    public async listObjects(prefix: string): Promise<CloudObjectEntry[]> {
        const root = await this.getAppRootRealPath();
        const normalizedPrefix =
            FilesystemCloudStorageProvider.normalizePrefix(prefix);
        const results: CloudObjectEntry[] = [];

        const walk = async (directory: string): Promise<void> => {
            const entries = await fs
                .readdir(directory, { withFileTypes: true })
                .catch(() => null);
            if (!entries) {
                return;
            }

            const candidateSubdirs = entries
                .filter((entry) => entry.isDirectory())
                .map((entry) => path.join(directory, entry.name));

            const subdirCandidates = await Promise.all(
                candidateSubdirs.map(async (absolutePath) => {
                    const stat = await fs.lstat(absolutePath).catch(() => null);

                    if (!stat) {
                        return null;
                    }

                    if (stat.isSymbolicLink()) {
                        return null;
                    }

                    return stat.isDirectory() ? absolutePath : null;
                })
            );

            const subdirs = subdirCandidates.filter(
                (value): value is string => value !== null
            );

            const filePaths = entries
                .filter((entry) => entry.isFile())
                .map((entry) => path.join(directory, entry.name));

            const fileEntries = await Promise.all(
                filePaths.map(async (absolute) => {
                    const key = toPosixKey(root, absolute);
                    if (!key.startsWith(normalizedPrefix)) {
                        return null;
                    }

                    try {
                        return await toCloudObjectEntry(key, absolute);
                    } catch {
                        return null;
                    }
                })
            );

            for (const entry of fileEntries) {
                if (entry) {
                    results.push(entry);
                }
            }

            await Promise.all(subdirs.map((dir) => walk(dir)));
        };

        await walk(root);

        results.sort((a, b) => a.key.localeCompare(b.key));
        return results;
    }

    public async downloadObject(key: string): Promise<Buffer> {
        await this.ensureAppRoot();
        const normalizedKey =
            FilesystemCloudStorageProvider.normalizeObjectKey(key);
        const absolute = await this.resolveKeyPath(normalizedKey);
        return fs.readFile(absolute);
    }

    public async uploadObject(args: {
        buffer: Buffer;
        key: string;
        overwrite?: boolean;
    }): Promise<CloudObjectEntry> {
        await this.ensureAppRoot();
        const key = FilesystemCloudStorageProvider.normalizeObjectKey(args.key);
        const overwrite = args.overwrite ?? false;

        const targetPath = await this.resolveKeyPath(key);
        await this.ensureSafeDirectory(path.dirname(targetPath));

        // Refuse to overwrite/replace symlinks.
        const targetStat = await fs.lstat(targetPath).catch(() => null);
        if (targetStat?.isSymbolicLink()) {
            throw new Error(
                `Refusing to write cloud object via symlink: ${key}`
            );
        }

        const tempPath = `${targetPath}.tmp-${crypto.randomUUID()}`;
        const backupPath = `${targetPath}.bak-${crypto.randomUUID()}`;

        await fs.writeFile(tempPath, args.buffer);

        const renameTempToTarget = async (): Promise<void> => {
            try {
                await fs.rename(tempPath, targetPath);
            } catch (error) {
                const code = tryGetErrorCode(error);

                if (code === "ENOENT") {
                    await this.ensureSafeDirectory(path.dirname(targetPath));
                    await fs.rename(tempPath, targetPath);
                    return;
                }

                throw error;
            }
        };

        try {
            const targetExists = await fs
                .lstat(targetPath)
                .then((stat) => stat.isFile() && !stat.isSymbolicLink())
                .catch(() => false);

            if (!overwrite) {
                if (targetExists) {
                    throw new Error(`Cloud object already exists: ${key}`);
                }

                await renameTempToTarget();
                return await toCloudObjectEntry(key, targetPath);
            }

            if (!targetExists) {
                await renameTempToTarget();
                return await toCloudObjectEntry(key, targetPath);
            }

            // Swap files with a backup to preserve atomicity across platforms.
            await fs.rename(targetPath, backupPath);
            try {
                await renameTempToTarget();
                await fs.rm(backupPath, { force: true });
            } catch (error) {
                await fs.rm(tempPath, { force: true }).catch(() => {});
                await fs.rename(backupPath, targetPath).catch(() => {});
                throw error;
            }

            return await toCloudObjectEntry(key, targetPath);
        } catch (error) {
            await fs.rm(tempPath, { force: true }).catch(() => {});
            throw ensureError(error);
        }
    }

    public async deleteObject(key: string): Promise<void> {
        await this.ensureAppRoot();
        const normalizedKey =
            FilesystemCloudStorageProvider.normalizeObjectKey(key);
        const absolute = await this.resolveKeyPath(normalizedKey);

        const stat = await fs.lstat(absolute).catch(() => null);
        if (!stat) {
            return;
        }

        if (stat.isSymbolicLink()) {
            throw new Error(
                `Refusing to delete cloud object via symlink: ${key}`
            );
        }

        if (!stat.isFile()) {
            throw new Error(`Cloud object is not a file: ${key}`);
        }

        await fs.rm(absolute, { force: true });
    }

    private async ensureAppRoot(): Promise<void> {
        await fs.mkdir(this.appRoot, { recursive: true });
    }

    private async resolveKeyPath(key: string): Promise<string> {
        const normalizedKey =
            FilesystemCloudStorageProvider.normalizeObjectKey(key);

        const root = await this.getAppRootRealPath();
        const absolutePath = path.resolve(root, ...normalizedKey.split("/"));
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
