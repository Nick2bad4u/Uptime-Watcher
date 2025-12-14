/* eslint-disable security/detect-non-literal-fs-filename -- This provider only operates on sandboxed paths under appRoot derived from validated keys. */

import type { CloudBackupEntry } from "@shared/types/cloud";
import type { SerializedDatabaseBackupMetadata } from "@shared/types/databaseBackup";

import { ensureError } from "@shared/utils/errorHandling";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import type {
    CloudObjectEntry,
    CloudStorageProvider,
} from "./CloudStorageProvider.types";

import {
    parseCloudBackupMetadataFile,
    serializeCloudBackupMetadataFile,
} from "./CloudBackupMetadataFile";

const APP_ROOT_DIRECTORY_NAME = "uptime-watcher" as const;
const BACKUPS_PREFIX = "backups/" as const;

function isUnknownRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function assertSubpath(root: string, candidate: string): void {
    const normalizedRoot = path.resolve(root);
    const normalizedCandidate = path.resolve(candidate);

    if (!normalizedCandidate.startsWith(`${normalizedRoot}${path.sep}`)) {
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
    const stat = await fs.stat(absolutePath);
    return {
        key,
        lastModifiedAt: stat.mtimeMs,
        sizeBytes: stat.size,
    };
}

function backupMetadataKeyForBackupKey(backupKey: string): string {
    return `${backupKey}.metadata.json`;
}

/**
 * Local filesystem-backed cloud provider.
 *
 * @remarks
 * Primarily used for integration tests and as a development transport.
 */
export class FilesystemCloudStorageProvider implements CloudStorageProvider {
    public readonly kind = "filesystem" as const;

    private readonly appRoot: string;

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
        await this.ensureAppRoot();
        const normalizedPrefix = prefix.replaceAll("\\", "/");
        const results: CloudObjectEntry[] = [];

        const walk = async (directory: string): Promise<void> => {
            const entries = await fs
                .readdir(directory, { withFileTypes: true })
                .catch(() => null);
            if (!entries) {
                return;
            }

            const subdirs = entries
                .filter((entry) => entry.isDirectory())
                .map((entry) => path.join(directory, entry.name));

            const filePaths = entries
                .filter((entry) => entry.isFile())
                .map((entry) => path.join(directory, entry.name));

            const fileEntries = await Promise.all(
                filePaths.map(async (absolute) => {
                    const key = toPosixKey(this.appRoot, absolute);
                    if (!key.startsWith(normalizedPrefix)) {
                        return null;
                    }

                    return toCloudObjectEntry(key, absolute);
                })
            );

            for (const entry of fileEntries) {
                if (entry) {
                    results.push(entry);
                }
            }

            await Promise.all(subdirs.map((dir) => walk(dir)));
        };

        await walk(this.appRoot);

        results.sort((a, b) => a.key.localeCompare(b.key));
        return results;
    }

    public async downloadObject(key: string): Promise<Buffer> {
        await this.ensureAppRoot();
        const normalizedKey = key.replaceAll("\\", "/");
        const absolute = this.resolveKeyPath(normalizedKey);
        return fs.readFile(absolute);
    }

    public async uploadObject(args: {
        buffer: Buffer;
        key: string;
        overwrite?: boolean;
    }): Promise<CloudObjectEntry> {
        await this.ensureAppRoot();
        const key = args.key.replaceAll("\\", "/");
        const overwrite = args.overwrite ?? false;

        const targetPath = this.resolveKeyPath(key);
        await fs.mkdir(path.dirname(targetPath), { recursive: true });

        const tempPath = `${targetPath}.tmp-${crypto.randomUUID()}`;
        const backupPath = `${targetPath}.bak-${crypto.randomUUID()}`;

        await fs.writeFile(tempPath, args.buffer);

        const renameTempToTarget = async (): Promise<void> => {
            try {
                await fs.rename(tempPath, targetPath);
            } catch (error) {
                const code = isUnknownRecord(error)
                    ? (error as { code?: unknown }).code
                    : undefined;

                if (code === "ENOENT") {
                    await fs.mkdir(path.dirname(targetPath), {
                        recursive: true,
                    });
                    await fs.rename(tempPath, targetPath);
                    return;
                }

                throw error;
            }
        };

        try {
            const targetExists = await fs
                .stat(targetPath)
                .then((stat) => stat.isFile())
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
        const normalizedKey = key.replaceAll("\\", "/");
        const absolute = this.resolveKeyPath(normalizedKey);
        await fs.rm(absolute, { force: true });
    }

    public async uploadBackup(args: {
        buffer: Buffer;
        encrypted: boolean;
        fileName: string;
        metadata: SerializedDatabaseBackupMetadata;
    }): Promise<CloudBackupEntry> {
        const key = `${BACKUPS_PREFIX}${args.fileName}`;
        const metadataKey = backupMetadataKeyForBackupKey(key);

        const entry: CloudBackupEntry = {
            encrypted: args.encrypted,
            fileName: args.fileName,
            key,
            metadata: args.metadata,
        };

        await this.uploadObject({ buffer: args.buffer, key, overwrite: true });
        await this.uploadObject({
            buffer: Buffer.from(
                serializeCloudBackupMetadataFile(entry),
                "utf8"
            ),
            key: metadataKey,
            overwrite: true,
        });

        return entry;
    }

    public async listBackups(): Promise<CloudBackupEntry[]> {
        const objects = await this.listObjects(BACKUPS_PREFIX);
        const metadataObjects = objects.filter((object) =>
            object.key.endsWith(".metadata.json"));

        const backups = await Promise.all(
            metadataObjects.map(async (object) => {
                const raw = await this.downloadObject(object.key);
                const parsed: unknown = JSON.parse(raw.toString("utf8"));
                return parseCloudBackupMetadataFile(parsed);
            })
        );

        backups.sort((a, b) => b.metadata.createdAt - a.metadata.createdAt);
        return backups;
    }

    public async downloadBackup(
        key: string
    ): Promise<{ buffer: Buffer; entry: CloudBackupEntry }> {
        const buffer = await this.downloadObject(key);
        const metadataKey = backupMetadataKeyForBackupKey(key);
        const raw = await this.downloadObject(metadataKey);
        const parsed: unknown = JSON.parse(raw.toString("utf8"));

        return {
            buffer,
            entry: parseCloudBackupMetadataFile(parsed),
        };
    }

    private async ensureAppRoot(): Promise<void> {
        await fs.mkdir(this.appRoot, { recursive: true });
    }

    private resolveKeyPath(key: string): string {
        const normalizedKey = key.replaceAll("\\", "/");
        const absolutePath = path.resolve(
            this.appRoot,
            ...normalizedKey.split("/")
        );
        assertSubpath(this.appRoot, absolutePath);
        return absolutePath;
    }

    public constructor(args: { baseDirectory: string }) {
        this.appRoot = path.resolve(
            args.baseDirectory,
            APP_ROOT_DIRECTORY_NAME
        );
    }
}

/* eslint-enable security/detect-non-literal-fs-filename -- End sandboxed filesystem provider rules override. */
