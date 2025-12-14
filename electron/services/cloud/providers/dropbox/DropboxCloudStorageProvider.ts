import type { CloudBackupEntry } from "@shared/types/cloud";
import type { SerializedDatabaseBackupMetadata } from "@shared/types/databaseBackup";

import { ensureError } from "@shared/utils/errorHandling";
import axios, { type AxiosInstance } from "axios";
import * as z from "zod";

import type {
    CloudObjectEntry,
    CloudStorageProvider,
} from "../CloudStorageProvider";
import type { DropboxTokenManager } from "./DropboxTokenManager";

import {
    parseCloudBackupMetadataFile,
    serializeCloudBackupMetadataFile,
} from "../CloudBackupMetadataFile";
import { withDropboxRetry } from "./dropboxRetry";

const DROPBOX_API = "https://api.dropboxapi.com" as const;
const DROPBOX_CONTENT = "https://content.dropboxapi.com" as const;

const APP_ROOT_DIRECTORY_NAME = "uptime-watcher" as const;
const BACKUPS_PREFIX = "backups/" as const;

interface DropboxFileEntry {
    ".tag": "file";
    path_display: string;
    server_modified: string;
    size: number;
}

const dropboxFileEntrySchema: z.ZodType<DropboxFileEntry> = z.looseObject({
    ".tag": z.literal("file"),
    path_display: z.string(),
    server_modified: z.string(),
    size: z.number().nonnegative(),
});

const dropboxListFolderResponseSchema = z.looseObject({
    cursor: z.string().optional(),
    entries: z.array(z.unknown()).optional(),
    has_more: z.boolean().optional(),
});

const dropboxCurrentAccountSchema = z.looseObject({
    email: z.string().optional(),
    name: z
        .looseObject({
            display_name: z.string().optional(),
        })
        .optional(),
});

function normalizeKey(key: string): string {
    return key.replaceAll("\\", "/");
}

function toDropboxPath(key: string): string {
    const normalized = normalizeKey(key);
    if (normalized.length === 0) {
        return `/${APP_ROOT_DIRECTORY_NAME}`;
    }

    return `/${APP_ROOT_DIRECTORY_NAME}/${normalized}`;
}

function fromDropboxPath(dropboxPath: string): string {
    const normalized = dropboxPath.replaceAll("\\", "/");
    const prefix = `/${APP_ROOT_DIRECTORY_NAME}/`;
    if (normalized === `/${APP_ROOT_DIRECTORY_NAME}`) {
        return "";
    }

    if (!normalized.startsWith(prefix)) {
        throw new Error("Unexpected Dropbox path outside app root");
    }

    return normalized.slice(prefix.length);
}

function backupMetadataKeyForBackupKey(backupKey: string): string {
    return `${backupKey}.metadata.json`;
}

// Backup metadata parsing/serialization is shared across providers.

/**
 * Dropbox-backed cloud provider.
 */
export class DropboxCloudStorageProvider implements CloudStorageProvider {
    public readonly kind = "dropbox" as const;

    private readonly httpApi: AxiosInstance;

    private readonly httpContent: AxiosInstance;

    private readonly tokenManager: DropboxTokenManager;

    public async isConnected(): Promise<boolean> {
        try {
            const token = await this.tokenManager.getAccessToken();
            await withDropboxRetry({
                fn: async () =>
                    this.httpApi.post(
                        `${DROPBOX_API}/2/users/get_current_account`,
                        null,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    ),
                operationName: "users/get_current_account (connectivity)",
            });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Returns a human-friendly account label (email or display name) when
     * available.
     */
    public async getAccountLabel(): Promise<string | undefined> {
        const token = await this.tokenManager.getAccessToken();
        const response = await withDropboxRetry({
            fn: async () =>
                this.httpApi.post(
                    `${DROPBOX_API}/2/users/get_current_account`,
                    null,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                ),
            operationName: "users/get_current_account",
        });

        const parsed = dropboxCurrentAccountSchema.parse(
            response.data as unknown
        );
        return parsed.email ?? parsed.name?.display_name;
    }

    public async listObjects(prefix: string): Promise<CloudObjectEntry[]> {
        const normalizedPrefix = normalizeKey(prefix);
        const token = await this.tokenManager.getAccessToken();

        const results: CloudObjectEntry[] = [];

        let hasMore = true;
        let cursor: string | undefined = undefined;

        while (hasMore) {
            const endpoint = cursor
                ? `${DROPBOX_API}/2/files/list_folder/continue`
                : `${DROPBOX_API}/2/files/list_folder`;

            const payload = cursor
                ? { cursor }
                : {
                      include_deleted: false,
                      include_has_explicit_shared_members: false,
                      include_media_info: false,
                      path: toDropboxPath(""),
                      recursive: true,
                  };

            // eslint-disable-next-line no-await-in-loop -- Pagination must be sequential.
            const response = await withDropboxRetry({
                fn: async () =>
                    this.httpApi.post(endpoint, payload, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }),
                operationName: cursor
                    ? "files/list_folder/continue"
                    : "files/list_folder",
            });

            const parsed = dropboxListFolderResponseSchema.parse(
                response.data as unknown
            );

            for (const entryCandidate of parsed.entries ?? []) {
                const fileEntry =
                    dropboxFileEntrySchema.safeParse(entryCandidate);
                if (fileEntry.success) {
                    const key = fromDropboxPath(fileEntry.data.path_display);
                    if (key.startsWith(normalizedPrefix)) {
                        results.push({
                            key,
                            lastModifiedAt: Date.parse(
                                fileEntry.data.server_modified
                            ),
                            sizeBytes: fileEntry.data.size,
                        });
                    }
                }
            }

            const { cursor: nextCursor, has_more: nextHasMore } = parsed;
            cursor = nextCursor;
            hasMore = nextHasMore ?? false;
        }

        results.sort((a, b) => a.key.localeCompare(b.key));
        return results;
    }

    public async downloadObject(key: string): Promise<Buffer> {
        const token = await this.tokenManager.getAccessToken();
        const response = await withDropboxRetry({
            fn: async () =>
                this.httpContent.post<ArrayBuffer>(
                    `${DROPBOX_CONTENT}/2/files/download`,
                    null,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Dropbox-API-Arg": JSON.stringify({
                                path: toDropboxPath(key),
                            }),
                        },
                        responseType: "arraybuffer",
                    }
                ),
            operationName: "files/download",
        });

        return Buffer.from(response.data);
    }

    public async uploadObject(args: {
        buffer: Buffer;
        key: string;
        overwrite?: boolean;
    }): Promise<CloudObjectEntry> {
        const token = await this.tokenManager.getAccessToken();
        const overwrite = args.overwrite ?? false;

        const mode = overwrite ? "overwrite" : "add";

        const uploadResponse = await withDropboxRetry({
            fn: async () =>
                this.httpContent.post(
                    `${DROPBOX_CONTENT}/2/files/upload`,
                    args.buffer,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/octet-stream",
                            "Dropbox-API-Arg": JSON.stringify({
                                autorename: false,
                                mode,
                                mute: true,
                                path: toDropboxPath(args.key),
                                strict_conflict: true,
                            }),
                        },
                    }
                ),
            operationName: "files/upload",
        });

        const uploadData = dropboxFileEntrySchema.parse(
            uploadResponse.data as unknown
        );

        return {
            key: fromDropboxPath(uploadData.path_display),
            lastModifiedAt: Date.parse(uploadData.server_modified),
            sizeBytes: uploadData.size,
        };
    }

    public async deleteObject(key: string): Promise<void> {
        const token = await this.tokenManager.getAccessToken();
        await withDropboxRetry({
            fn: async () =>
                this.httpApi.post(
                    `${DROPBOX_API}/2/files/delete_v2`,
                    { path: toDropboxPath(key) },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    }
                ),
            operationName: "files/delete_v2",
        });
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
        try {
            const buffer = await this.downloadObject(key);
            const metadataKey = backupMetadataKeyForBackupKey(key);
            const raw = await this.downloadObject(metadataKey);
            const parsed: unknown = JSON.parse(raw.toString("utf8"));
            const entry = parseCloudBackupMetadataFile(parsed);

            return { buffer, entry };
        } catch (error) {
            throw ensureError(error);
        }
    }

    public constructor(args: {
        httpApi?: AxiosInstance;
        httpContent?: AxiosInstance;
        tokenManager: DropboxTokenManager;
    }) {
        this.tokenManager = args.tokenManager;
        this.httpApi = args.httpApi ?? axios.create();
        this.httpContent = args.httpContent ?? axios.create();
    }
}
