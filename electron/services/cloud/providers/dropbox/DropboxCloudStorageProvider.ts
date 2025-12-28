import type { DropboxResponse, files, users } from "dropbox";

import { ensureError } from "@shared/utils/errorHandling";
import { tryParseJsonRecord } from "@shared/utils/jsonSafety";
import { isRecord } from "@shared/utils/typeHelpers";
import { Dropbox, DropboxResponseError } from "dropbox";

import type {
    CloudObjectEntry,
    CloudStorageProvider,
} from "../CloudStorageProvider.types";
import type { DropboxTokenManager } from "./DropboxTokenManager";

import {
    assertCloudObjectKey,
    normalizeProviderObjectKey,
} from "../../cloudKeyNormalization";
import { BaseCloudStorageProvider } from "../BaseCloudStorageProvider";
import { withDropboxRetry } from "./dropboxRetry";

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

type DropboxSdkClient = Pick<
    Dropbox,
    | "authTokenRevoke"
    | "filesDeleteV2"
    | "filesDownload"
    | "filesListFolder"
    | "filesListFolderContinue"
    | "filesUpload"
    | "usersGetCurrentAccount"
>;

type DropboxListFolderResponse = DropboxResponse<files.ListFolderResult>;
type DropboxCurrentAccountResponse = DropboxResponse<users.FullAccount>;

function normalizeKey(key: string): string {
    return normalizeProviderObjectKey(key);
}

function toDropboxObjectPath(key: string): string {
    const normalized = normalizeKey(key);
    assertCloudObjectKey(normalized);
    return `/${APP_ROOT_DIRECTORY_NAME}/${normalized}`;
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

    try {
        return normalizeKey(normalized.slice(prefix.length));
    } catch {
        return null;
    }
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

        const parsed = tryParseJsonRecord(trimmed);
        if (!parsed) {
            return undefined;
        }

        return tryParseDropboxErrorSummary(parsed);
    }

    // Axios returns ArrayBuffer for errors when responseType is "arraybuffer".
    if (data instanceof ArrayBuffer) {
        const text = Buffer.from(new Uint8Array(data)).toString("utf8").trim();
        if (!text) {
            return undefined;
        }

        const parsed = tryParseJsonRecord(text);
        if (!parsed) {
            return undefined;
        }

        return tryParseDropboxErrorSummary(parsed);
    }

    if (Buffer.isBuffer(data)) {
        const text = data.toString("utf8").trim();
        if (!text) {
            return undefined;
        }

        const parsed = tryParseJsonRecord(text);
        if (!parsed) {
            return undefined;
        }

        return tryParseDropboxErrorSummary(parsed);
    }

    return undefined;
}

function describeDropboxSdkErrorRich(error: unknown): string | undefined {
    if (!(error instanceof DropboxResponseError)) {
        return undefined;
    }

    const summary = tryParseDropboxErrorSummary(error.error);
    if (typeof summary === "string" && summary.trim().length > 0) {
        return `HTTP ${error.status}: ${summary}`;
    }

    return `HTTP ${error.status}`;
}

function hasNotFoundTag(value: unknown, visited: WeakSet<object>): boolean {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    if (visited.has(value)) {
        return false;
    }
    visited.add(value);

    if (!isRecord(value)) {
        return false;
    }

    const record = value;
    if (record[".tag"] === "not_found") {
        return true;
    }

    for (const next of Object.values(record)) {
        if (Array.isArray(next)) {
            for (const item of next) {
                if (hasNotFoundTag(item, visited)) {
                    return true;
                }
            }
        } else if (
            typeof next === "object" &&
            next !== null &&
            hasNotFoundTag(next, visited)
        ) {
            return true;
        }
    }

    return false;
}

function isDropboxNotFoundError(error: unknown): boolean {
    if (!(error instanceof DropboxResponseError)) {
        return false;
    }

    if (error.status !== 409) {
        return false;
    }

    return hasNotFoundTag(error.error, new WeakSet());
}

function createENOENT(message: string): NodeJS.ErrnoException {
    const error = new Error(message) as NodeJS.ErrnoException;
    error.code = "ENOENT";
    return error;
}

async function convertDropboxDownloadedResultToBuffer(
    result: unknown
): Promise<Buffer> {
    if (typeof result !== "object" || result === null) {
        throw new Error("Dropbox download result is not an object");
    }

    if (!isRecord(result)) {
        throw new TypeError("Dropbox download result is not an object record");
    }

    const record = result;

    const maybeBinary = record["fileBinary"];
    if (Buffer.isBuffer(maybeBinary)) {
        return maybeBinary;
    }

    if (maybeBinary instanceof Uint8Array) {
        return Buffer.from(maybeBinary);
    }

    if (maybeBinary instanceof ArrayBuffer) {
        return Buffer.from(new Uint8Array(maybeBinary));
    }

    const maybeBlob = record["fileBlob"];
    if (maybeBlob instanceof Blob) {
        const arrayBuffer = await maybeBlob.arrayBuffer();
        return Buffer.from(new Uint8Array(arrayBuffer));
    }

    throw new Error(
        "Dropbox download did not include fileBinary/fileBlob content"
    );
}

/**
 * Dropbox-backed {@link CloudStorageProvider}.
 *
 * @remarks
 * Uses Dropbox API + Content endpoints with OAuth tokens managed by
 * {@link DropboxTokenManager}. All app objects are stored under
 * `/${APP_ROOT_DIRECTORY_NAME}/`.
 */
export class DropboxCloudStorageProvider
    extends BaseCloudStorageProvider
    implements CloudStorageProvider
{
    public readonly kind = "dropbox" as const;

    private readonly tokenManager: DropboxTokenManager;

    private readonly clientFactory: (accessToken: string) => DropboxSdkClient;

    private async createClient(): Promise<DropboxSdkClient> {
        const token = await this.tokenManager.getAccessToken();
        return this.clientFactory(token);
    }

    public async isConnected(): Promise<boolean> {
        try {
            const client = await this.createClient();
            await withDropboxRetry({
                fn: async () => {
                    await client.usersGetCurrentAccount();
                },
                operationName: "users/get_current_account (connectivity)",
            });
            return true;
        } catch {
            return false;
        }
    }

    public async getAccountLabel(): Promise<string | undefined> {
        const client = await this.createClient();

        const response: DropboxCurrentAccountResponse = await withDropboxRetry({
            fn: async () => client.usersGetCurrentAccount(),
            operationName: "users/get_current_account",
        }).catch((error: unknown) => {
            const described = describeDropboxSdkErrorRich(error);
            if (described) {
                throw new Error(
                    `Dropbox get_current_account failed: ${described}`
                );
            }
            throw ensureError(error);
        });

        const account = response.result;

        const email =
            account.email.trim().length > 0 ? account.email : undefined;

        const displayName =
            account.name.display_name.trim().length > 0
                ? account.name.display_name
                : undefined;

        return email ?? displayName;
    }

    public async listObjects(prefix: string): Promise<CloudObjectEntry[]> {
        const client = await this.createClient();
        const normalizedPrefix = normalizeKey(prefix);

        const rootPath = toDropboxPath("");

        const objects: CloudObjectEntry[] = [];
        let cursor: string | undefined = undefined;
        let hasMore = true;

        while (hasMore) {
            const currentCursor: string | undefined = cursor;

            const response: DropboxListFolderResponse | null =
                // eslint-disable-next-line no-await-in-loop -- Pagination must be sequential.
                await this.fetchListFolderPage({
                    client,
                    cursor: currentCursor,
                    rootPath,
                }).catch((error: unknown) => {
                    // The app root folder may not exist until the first upload.
                    if (!currentCursor && isDropboxNotFoundError(error)) {
                        return null;
                    }

                    throw ensureError(error);
                });

            if (!response) {
                break;
            }

            const { result } = response;
            const nextCursor: string = result.cursor;
            const { entries, has_more: nextHasMore } = result;

            for (const entry of entries) {
                if (
                    entry[".tag"] === "file" &&
                    typeof entry.path_display === "string"
                ) {
                    const key = fromDropboxPathOrNull(entry.path_display);

                    const matchesPrefix =
                        typeof key === "string" &&
                        key.length > 0 &&
                        (!normalizedPrefix || key.startsWith(normalizedPrefix));

                    if (matchesPrefix) {
                        objects.push({
                            key,
                            lastModifiedAt: Date.parse(entry.server_modified),
                            sizeBytes: entry.size,
                        });
                    }
                }
            }

            cursor = nextCursor;
            hasMore = nextHasMore;
        }

        return objects;
    }

    private async fetchListFolderPage(args: {
        client: DropboxSdkClient;
        cursor: string | undefined;
        rootPath: string;
    }): Promise<DropboxListFolderResponse> {
        const { client, cursor, rootPath } = args;
        if (cursor) {
            return withDropboxRetry<DropboxListFolderResponse>({
                fn: async () =>
                    client.filesListFolderContinue({
                        cursor,
                    }),
                operationName: "files/list_folder/continue",
            });
        }

        return withDropboxRetry<DropboxListFolderResponse>({
            fn: async () =>
                client.filesListFolder({
                    include_deleted: false,
                    include_has_explicit_shared_members: false,
                    include_media_info: false,
                    include_mounted_folders: true,
                    include_non_downloadable_files: false,
                    path: rootPath,
                    recursive: true,
                }),
            operationName: "files/list_folder",
        });
    }

    public async uploadObject(args: {
        buffer: Buffer;
        key: string;
        overwrite?: boolean;
    }): Promise<CloudObjectEntry> {
        const client = await this.createClient();

        // Normalize and validate eagerly so we fail fast with consistent error
        // messages (instead of relying on Dropbox API errors).
        const normalizedKey = normalizeKey(args.key);
        assertCloudObjectKey(normalizedKey);

        const response = await withDropboxRetry({
            fn: async () =>
                client.filesUpload({
                    autorename: false,
                    contents: args.buffer,
                    mode: args.overwrite
                        ? { ".tag": "overwrite" }
                        : { ".tag": "add" },
                    mute: true,
                    path: toDropboxObjectPath(normalizedKey),
                    strict_conflict: false,
                }),
            operationName: "files/upload",
        }).catch((error: unknown) => {
            const described = describeDropboxSdkErrorRich(error);
            if (described) {
                throw new Error(`Dropbox upload failed: ${described}`);
            }
            throw ensureError(error);
        });

        const uploadData = response.result as {
            path_display?: unknown;
            server_modified?: unknown;
            size?: unknown;
        };

        if (
            typeof uploadData.path_display !== "string" ||
            typeof uploadData.server_modified !== "string" ||
            typeof uploadData.size !== "number"
        ) {
            throw new TypeError(
                "Dropbox returned an unexpected upload response"
            );
        }

        const storedKey = fromDropboxPathOrNull(uploadData.path_display);
        if (storedKey === null) {
            throw new Error("Dropbox returned an unexpected upload path");
        }

        return {
            key: storedKey,
            lastModifiedAt: Date.parse(uploadData.server_modified),
            sizeBytes: uploadData.size,
        };
    }

    public async downloadObject(key: string): Promise<Buffer> {
        const client = await this.createClient();

        const normalizedKey = normalizeKey(key);
        assertCloudObjectKey(normalizedKey);

        const response = await withDropboxRetry({
            fn: async () =>
                client.filesDownload({ path: toDropboxObjectPath(normalizedKey) }),
            operationName: "files/download",
        }).catch((error: unknown) => {
            if (isDropboxNotFoundError(error)) {
                throw createENOENT(
                    `Dropbox object not found: ${normalizedKey}`
                );
            }

            const described = describeDropboxSdkErrorRich(error);
            if (described) {
                throw new Error(`Dropbox download failed: ${described}`);
            }

            throw ensureError(error);
        });

        return convertDropboxDownloadedResultToBuffer(response.result);
    }

    public async deleteObject(key: string): Promise<void> {
        const client = await this.createClient();

        const normalizedKey = normalizeKey(key);
        assertCloudObjectKey(normalizedKey);

        await withDropboxRetry({
            fn: async () =>
                client.filesDeleteV2({ path: toDropboxObjectPath(normalizedKey) }),
            operationName: "files/delete_v2",
        }).catch((error: unknown) => {
            // Contract: deleting a missing object is a no-op.
            if (isDropboxNotFoundError(error)) {
                return;
            }

            const described = describeDropboxSdkErrorRich(error);
            if (described) {
                throw new Error(`Dropbox delete failed: ${described}`);
            }

            throw ensureError(error);
        });
    }

    public constructor(args: {
        clientFactory?: (accessToken: string) => DropboxSdkClient;
        tokenManager: DropboxTokenManager;
    }) {
        super(BACKUPS_PREFIX);
        this.tokenManager = args.tokenManager;

        this.clientFactory =
            args.clientFactory ??
            ((accessToken): DropboxSdkClient => new Dropbox({ accessToken }));
    }
}
