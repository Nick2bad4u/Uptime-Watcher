import type { CloudBackupEntry } from "@shared/types/cloud";
import type { SerializedDatabaseBackupMetadata } from "@shared/types/databaseBackup";

import { ensureError } from "@shared/utils/errorHandling";
import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import * as z from "zod";

import type {
    CloudObjectEntry,
    CloudStorageProvider,
} from "../CloudStorageProvider.types";
import type { DropboxTokenManager } from "./DropboxTokenManager";

import {
    parseCloudBackupMetadataFile,
    serializeCloudBackupMetadataFile,
} from "../CloudBackupMetadataFile";
import { withDropboxRetry } from "./dropboxRetry";

const DROPBOX_API = "https://api.dropboxapi.com" as const;
const DROPBOX_CONTENT = "https://content.dropboxapi.com" as const;

/**
 * All objects for Uptime Watcher are stored underneath this folder.
 *
 * @remarks
 * If you configure the Dropbox app as an "App folder" (recommended), Dropbox
 * already sandboxes the app under the app folder. We still create a subfolder
 * to keep object paths predictable and portable across providers.
 */
const APP_ROOT_DIRECTORY_NAME = "uptime-watcher" as const;

const BACKUPS_PREFIX = "backups/" as const;

const dropboxFileEntrySchema = z.looseObject({
    ".tag": z.literal("file"),
    path_display: z.string().min(1),
    server_modified: z.string().min(1),
    size: z.number().int().nonnegative(),
});

const dropboxListFolderResponseSchema = z
    .object({
        cursor: z.string().optional(),
        entries: z.array(z.unknown()).default([]),
        has_more: z.boolean().default(false),
    })
    .strict();

const dropboxUploadResponseSchema = z.looseObject({
    path_display: z.string().min(1),
    server_modified: z.string().min(1),
    size: z.number().int().nonnegative(),
});

const dropboxCurrentAccountSchema = z.looseObject({
    email: z.string().min(1).optional(),
    name: z
        .looseObject({
            display_name: z.string().min(1).optional(),
        })
        .optional(),
});

function normalizeKey(key: string): string {
    // Normalize to POSIX-style keys.
    let normalized = key.replaceAll("\\", "/").trim();

    // Drop leading slashes to prevent accidental double-slash paths.
    normalized = normalized.replace(/^\/+/v, "");

    // Collapse duplicate separators.
    normalized = normalized.replaceAll(/\/+/gv, "/");

    // Disallow traversal segments.
    if (normalized.split("/").includes("..")) {
        throw new Error("Invalid Dropbox key (path traversal segment)");
    }

    return normalized;
}

function toDropboxPath(key: string): string {
    const normalized = normalizeKey(key);

    return normalized.length === 0
        ? `/${APP_ROOT_DIRECTORY_NAME}`
        : `/${APP_ROOT_DIRECTORY_NAME}/${normalized}`;
}

function fromDropboxPathOrNull(pathDisplay: string): null | string {
    const normalized = pathDisplay.replaceAll("\\", "/");
    const prefix = `/${APP_ROOT_DIRECTORY_NAME}/`;

    if (normalized === `/${APP_ROOT_DIRECTORY_NAME}`) {
        return "";
    }

    if (!normalized.startsWith(prefix)) {
        return null;
    }

    return normalizeKey(normalized.slice(prefix.length));
}

function tryParseDropboxErrorSummary(data: unknown): string | undefined {
    if (!data) {
        return undefined;
    }

    if (typeof data === "object") {
        const maybeSummary = (data as { error_summary?: unknown })
            .error_summary;
        if (
            typeof maybeSummary === "string" &&
            maybeSummary.trim().length > 0
        ) {
            return maybeSummary;
        }
    }

    if (typeof data === "string") {
        const trimmed = data.trim();
        if (!trimmed) {
            return undefined;
        }

        try {
            const parsed: unknown = JSON.parse(trimmed);
            return tryParseDropboxErrorSummary(parsed);
        } catch {
            return undefined;
        }
    }

    // Axios returns ArrayBuffer for errors when responseType is "arraybuffer".
    if (data instanceof ArrayBuffer) {
        const text = Buffer.from(new Uint8Array(data)).toString("utf8").trim();
        if (!text) {
            return undefined;
        }

        try {
            const parsed: unknown = JSON.parse(text);
            return tryParseDropboxErrorSummary(parsed);
        } catch {
            return undefined;
        }
    }

    if (Buffer.isBuffer(data)) {
        const text = data.toString("utf8").trim();
        if (!text) {
            return undefined;
        }

        try {
            const parsed: unknown = JSON.parse(text);
            return tryParseDropboxErrorSummary(parsed);
        } catch {
            return undefined;
        }
    }

    return undefined;
}

function describeDropboxAxiosErrorRich(error: unknown): string | undefined {
    if (!axios.isAxiosError(error)) {
        return undefined;
    }

    const status = error.response?.status;
    const summary = tryParseDropboxErrorSummary(error.response?.data);

    if (typeof summary === "string" && summary.trim().length > 0) {
        return typeof status === "number"
            ? `HTTP ${status}: ${summary}`
            : summary;
    }

    if (typeof status === "number") {
        return `HTTP ${status}: ${error.message}`;
    }

    return error.message;
}

function isDropboxNotFoundError(error: unknown): boolean {
    if (!axios.isAxiosError(error)) {
        return false;
    }

    if (error.response?.status !== 409) {
        return false;
    }

    const summary = tryParseDropboxErrorSummary(error.response.data);
    return (
        typeof summary === "string" &&
        summary.toLowerCase().includes("not_found")
    );
}

function createENOENT(message: string): NodeJS.ErrnoException {
    const error = new Error(message) as NodeJS.ErrnoException;
    error.code = "ENOENT";
    return error;
}

function backupMetadataKeyForBackupKey(backupKey: string): string {
    return `${backupKey}.metadata.json`;
}

/**
 * Dropbox-backed {@link CloudStorageProvider}.
 *
 * @remarks
 * Uses Dropbox API + Content endpoints with OAuth tokens managed by
 * {@link DropboxTokenManager}. All app objects are stored under
 * `/${APP_ROOT_DIRECTORY_NAME}/`.
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
                                "Content-Type": "application/json",
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
                            "Content-Type": "application/json",
                        },
                    }
                ),
            operationName: "users/get_current_account",
        }).catch((error: unknown) => {
            const described = describeDropboxAxiosErrorRich(error);
            if (described) {
                throw new Error(
                    `Dropbox get_current_account failed: ${described}`
                );
            }
            throw ensureError(error);
        });

        const parsed = dropboxCurrentAccountSchema.parse(
            response.data as unknown
        );
        return parsed.email ?? parsed.name?.display_name;
    }

    public async listObjects(prefix: string): Promise<CloudObjectEntry[]> {
        const token = await this.tokenManager.getAccessToken();
        const normalizedPrefix = normalizeKey(prefix);

        const rootPath = toDropboxPath("");

        const entries: unknown[] = [];
        let cursor: string | undefined = undefined;
        let hasMore = true;

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
                      include_mounted_folders: true,
                      include_non_downloadable_files: false,
                      path: rootPath,
                      recursive: true,
                  };

            const currentCursor = cursor;

            try {
                // eslint-disable-next-line no-await-in-loop -- Pagination must be sequential.
                const response = await withDropboxRetry<AxiosResponse<unknown>>(
                    {
                        fn: async () =>
                            this.httpApi.post(endpoint, payload, {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    "Content-Type": "application/json",
                                },
                            }),
                        operationName: currentCursor
                            ? "files/list_folder/continue"
                            : "files/list_folder",
                    }
                );

                const parsed = dropboxListFolderResponseSchema.parse(
                    response.data
                );

                entries.push(...parsed.entries);

                const { cursor: nextCursor, has_more: nextHasMore } = parsed;
                cursor = nextCursor;
                hasMore = nextHasMore;
            } catch (error) {
                // The app root folder may not exist until the first upload.
                if (!currentCursor && isDropboxNotFoundError(error)) {
                    break;
                }

                throw ensureError(error);
            }
        }

        const objects: CloudObjectEntry[] = [];

        for (const entry of entries) {
            const parsed = dropboxFileEntrySchema.safeParse(entry);

            if (parsed.success) {
                const key = fromDropboxPathOrNull(parsed.data.path_display);
                const matchesPrefix =
                    key !== null &&
                    key !== "" &&
                    (!normalizedPrefix || key.startsWith(normalizedPrefix));

                if (matchesPrefix) {
                    objects.push({
                        key,
                        lastModifiedAt: Date.parse(parsed.data.server_modified),
                        sizeBytes: parsed.data.size,
                    });
                }
            }
        }

        return objects;
    }

    public async uploadObject(args: {
        buffer: Buffer;
        key: string;
        overwrite?: boolean;
    }): Promise<CloudObjectEntry> {
        const token = await this.tokenManager.getAccessToken();

        const response = await withDropboxRetry({
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
                                mode: args.overwrite ? "overwrite" : "add",
                                mute: true,
                                path: toDropboxPath(args.key),
                                strict_conflict: false,
                            }),
                        },
                    }
                ),
            operationName: "files/upload",
        });

        const uploadData = dropboxUploadResponseSchema.parse(
            response.data as unknown
        );
        const storedKey = fromDropboxPathOrNull(uploadData.path_display);
        if (!storedKey) {
            throw new Error("Dropbox returned an unexpected upload path");
        }

        return {
            key: storedKey,
            lastModifiedAt: Date.parse(uploadData.server_modified),
            sizeBytes: uploadData.size,
        };
    }

    public async downloadObject(key: string): Promise<Buffer> {
        const token = await this.tokenManager.getAccessToken();

        const response = await withDropboxRetry({
            fn: async () =>
                this.httpContent.post<ArrayBuffer>(
                    `${DROPBOX_CONTENT}/2/files/download`,
                    undefined,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/octet-stream",
                            "Dropbox-API-Arg": JSON.stringify({
                                path: toDropboxPath(key),
                            }),
                        },
                        responseType: "arraybuffer",
                    }
                ),
            operationName: "files/download",
        }).catch((error: unknown) => {
            if (isDropboxNotFoundError(error)) {
                throw createENOENT(`Dropbox object not found: ${key}`);
            }

            const described = describeDropboxAxiosErrorRich(error);
            if (described) {
                throw new Error(`Dropbox download failed: ${described}`);
            }

            throw ensureError(error);
        });

        return Buffer.from(response.data);
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
        }).catch((error: unknown) => {
            // Contract: deleting a missing object is a no-op.
            if (isDropboxNotFoundError(error)) {
                return;
            }

            const described = describeDropboxAxiosErrorRich(error);
            if (described) {
                throw new Error(`Dropbox delete failed: ${described}`);
            }

            throw ensureError(error);
        });
    }

    public async listBackups(): Promise<CloudBackupEntry[]> {
        const objects = await this.listObjects(BACKUPS_PREFIX);
        const metadataObjects = objects.filter((object) =>
            object.key.endsWith(".metadata.json"));

        const results = await Promise.allSettled(
            metadataObjects.map(async (object) => {
                const raw = await this.downloadObject(object.key);
                const parsed: unknown = JSON.parse(raw.toString("utf8"));
                return parseCloudBackupMetadataFile(parsed);
            })
        );

        const backups = results
            .filter(
                (result): result is PromiseFulfilledResult<CloudBackupEntry> =>
                    result.status === "fulfilled"
            )
            .map((result) => result.value);

        backups.sort((a, b) => b.metadata.createdAt - a.metadata.createdAt);
        return backups;
    }

    public async uploadBackup(args: {
        buffer: Buffer;
        encrypted: boolean;
        fileName: string;
        metadata: SerializedDatabaseBackupMetadata;
    }): Promise<CloudBackupEntry> {
        const backupKey = `${BACKUPS_PREFIX}${args.fileName}`;

        await this.uploadObject({
            buffer: args.buffer,
            key: backupKey,
            overwrite: true,
        });

        const metadataKey = backupMetadataKeyForBackupKey(backupKey);
        await this.uploadObject({
            buffer: Buffer.from(
                serializeCloudBackupMetadataFile({
                    encrypted: args.encrypted,
                    fileName: args.fileName,
                    key: backupKey,
                    metadata: args.metadata,
                }),
                "utf8"
            ),
            key: metadataKey,
            overwrite: true,
        });

        return {
            encrypted: args.encrypted,
            fileName: args.fileName,
            key: backupKey,
            metadata: args.metadata,
        };
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
