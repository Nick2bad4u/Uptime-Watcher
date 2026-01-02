import type { DropboxResponse, files, users } from "dropbox";

import { ensureError } from "@shared/utils/errorHandling";
import { normalizePathSeparatorsToPosix } from "@shared/utils/pathSeparators";
import { isRecord } from "@shared/utils/typeHelpers";
import { Dropbox, DropboxResponseError } from "dropbox";

import type {
    CloudObjectEntry,
    CloudStorageProvider,
} from "../CloudStorageProvider.types";
import type { DropboxTokenManager } from "./DropboxTokenManager";

import { logger } from "../../../../utils/logger";
import {
    assertCloudObjectKey,
    normalizeProviderObjectKey,
} from "../../cloudKeyNormalization";
import { BaseCloudStorageProvider } from "../BaseCloudStorageProvider";
import { CloudProviderOperationError } from "../cloudProviderErrors";
import { tryParseDropboxErrorSummary } from "./dropboxErrorSchemas";
import { withDropboxRetry } from "./dropboxRetry";
import {
    parseDropboxCurrentAccount,
    parseDropboxFilesDownloadResult,
    parseDropboxFilesUploadResult,
    tryParseDropboxListFolderFileEntry,
} from "./dropboxSdkSchemas";

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
    const normalized = normalizePathSeparatorsToPosix(pathDisplay);
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

function hasTag(value: unknown, tag: string, visited: WeakSet<object>): boolean {
    if (typeof value !== "object" || value === null) {
        return false;
    }

    if (visited.has(value)) {
        return false;
    }
    visited.add(value);

    if (Array.isArray(value)) {
        return value.some((item) => hasTag(item, tag, visited));
    }

    if (!isRecord(value)) {
        return false;
    }

    const record = value;
    if (record[".tag"] === tag) {
        return true;
    }

    for (const next of Object.values(record)) {
        let hasMatchingTag = false;

        if (Array.isArray(next)) {
            hasMatchingTag = next.some((item) => hasTag(item, tag, visited));
        } else if (typeof next === "object" && next !== null) {
            hasMatchingTag = hasTag(next, tag, visited);
        }

        if (hasMatchingTag) {
            return true;
        }
    }

    return false;
}

function hasTagInPayload(value: unknown, tag: string): boolean {
    return hasTag(value, tag, new WeakSet());
}

function isDropboxNotFoundError(error: unknown): boolean {
    if (!(error instanceof DropboxResponseError)) {
        return false;
    }

    if (error.status !== 409) {
        return false;
    }

    return hasTagInPayload(error.error, "not_found");
}

function isDropboxConflictError(error: unknown): boolean {
    if (!(error instanceof DropboxResponseError)) {
        return false;
    }

    if (error.status !== 409) {
        return false;
    }

    // Best-effort: recursively scan Dropbox's tagged error payload.
    return hasTagInPayload(error.error, "conflict");
}

async function convertDropboxDownloadedResultToBuffer(
    result: unknown
): Promise<Buffer> {
    const parsed = parseDropboxFilesDownloadResult(result);

    const maybeBinary = parsed.fileBinary;
    if (Buffer.isBuffer(maybeBinary)) {
        return maybeBinary;
    }

    if (maybeBinary instanceof Uint8Array) {
        return Buffer.from(maybeBinary);
    }

    if (maybeBinary instanceof ArrayBuffer) {
        return Buffer.from(new Uint8Array(maybeBinary));
    }

    const maybeBlob = parsed.fileBlob;
    if (maybeBlob instanceof Blob) {
        const arrayBuffer = await maybeBlob.arrayBuffer();
        return Buffer.from(new Uint8Array(arrayBuffer));
    }

    throw new TypeError(
        "Dropbox download did not include supported binary content"
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
            const detail = described ?? ensureError(error).message;
            throw new CloudProviderOperationError(
                `Dropbox get-account-label failed: ${detail}`,
                {
                    cause: error,
                    operation: "getAccountLabel",
                    providerKind: this.kind,
                }
            );
        });

        const account = parseDropboxCurrentAccount(response.result);
        return account.email;
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

                    const described = describeDropboxSdkErrorRich(error);
                    const detail = described ?? ensureError(error).message;
                    throw new CloudProviderOperationError(
                        `Dropbox listObjects failed: ${detail}`,
                        {
                            cause: error,
                            operation: "listObjects",
                            providerKind: this.kind,
                            target: normalizedPrefix,
                        }
                    );
                });

            if (!response) {
                break;
            }

            const { result } = response;
            const nextCursor: string = result.cursor;
            const { entries, has_more: nextHasMore } = result;

            let invalidEntryCount = 0;

            const mapEntryToCloudObject = (entry: unknown): {
                cloudObject: CloudObjectEntry | null;
                isInvalid: boolean;
            } => {
                const parsed = tryParseDropboxListFolderFileEntry(entry);
                if (!parsed) {
                    return { cloudObject: null, isInvalid: true };
                }

                const key = fromDropboxPathOrNull(parsed.pathDisplay);
                const matchesPrefix =
                    typeof key === "string" &&
                    key.length > 0 &&
                    (!normalizedPrefix || key.startsWith(normalizedPrefix));

                if (!matchesPrefix) {
                    return { cloudObject: null, isInvalid: false };
                }

                const lastModifiedAt = Date.parse(parsed.serverModified);
                if (!Number.isFinite(lastModifiedAt)) {
                    return { cloudObject: null, isInvalid: true };
                }

                return {
                    cloudObject: {
                        key,
                        lastModifiedAt,
                        sizeBytes: parsed.sizeBytes,
                    },
                    isInvalid: false,
                };
            };

            for (const entry of entries) {
                const mapped = mapEntryToCloudObject(entry);
                if (mapped.isInvalid) {
                    invalidEntryCount += 1;
                } else if (mapped.cloudObject) {
                    objects.push(mapped.cloudObject);
                }
            }

            if (invalidEntryCount > 0) {
                logger.warn(
                    "[DropboxCloudStorageProvider] Skipped invalid Dropbox list-folder entries",
                    {
                        invalidEntryCount,
                        prefix: normalizedPrefix,
                    }
                );
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

        let uploadMode: { ".tag": "add" } | { ".tag": "overwrite" } = {
            ".tag": "add",
        };
        if (args.overwrite === true) {
            uploadMode = { ".tag": "overwrite" };
        }

        const response = await withDropboxRetry({
            fn: async () =>
                client.filesUpload({
                    autorename: false,
                    contents: args.buffer,
                    mode: uploadMode,
                    mute: true,
                    path: toDropboxObjectPath(normalizedKey),
                    strict_conflict: false,
                }),
            operationName: "files/upload",
        }).catch((error: unknown) => {
            // Contract: overwrite=false and existing object => EEXIST.
            if (args.overwrite !== true && isDropboxConflictError(error)) {
                throw new CloudProviderOperationError(
                    `Dropbox object already exists: ${normalizedKey}`,
                    {
                        cause: error,
                        code: "EEXIST",
                        operation: "uploadObject",
                        providerKind: this.kind,
                        target: normalizedKey,
                    }
                );
            }

            const described = describeDropboxSdkErrorRich(error);
            const detail = described ?? ensureError(error).message;
            throw new CloudProviderOperationError(
                `Dropbox upload failed: ${detail}`,
                {
                    cause: error,
                    operation: "uploadObject",
                    providerKind: this.kind,
                    target: normalizedKey,
                }
            );
        });

        const uploadData = parseDropboxFilesUploadResult(response.result);

        const storedKey = fromDropboxPathOrNull(uploadData.pathDisplay);
        if (storedKey === null) {
            throw new CloudProviderOperationError(
                "Dropbox returned an unexpected upload path",
                {
                    operation: "uploadObject",
                    providerKind: this.kind,
                    target: normalizedKey,
                }
            );
        }

        const lastModifiedAt = Date.parse(uploadData.serverModified);
        if (!Number.isFinite(lastModifiedAt)) {
            throw new CloudProviderOperationError(
                "Dropbox returned an unexpected server_modified timestamp",
                {
                    operation: "uploadObject",
                    providerKind: this.kind,
                    target: normalizedKey,
                }
            );
        }

        return {
            key: storedKey,
            lastModifiedAt,
            sizeBytes: uploadData.sizeBytes,
        };
    }

    public async downloadObject(key: string): Promise<Buffer> {
        const client = await this.createClient();

        const normalizedKey = normalizeKey(key);
        assertCloudObjectKey(normalizedKey);

        const response = await withDropboxRetry({
            fn: async () =>
                client.filesDownload({
                    path: toDropboxObjectPath(normalizedKey),
                }),
            operationName: "files/download",
        }).catch((error: unknown) => {
            if (isDropboxNotFoundError(error)) {
                throw new CloudProviderOperationError(
                    `Dropbox object not found: ${normalizedKey}`,
                    {
                        cause: error,
                        code: "ENOENT",
                        operation: "downloadObject",
                        providerKind: this.kind,
                        target: normalizedKey,
                    }
                );
            }

            const described = describeDropboxSdkErrorRich(error);
            const detail = described ?? ensureError(error).message;
            throw new CloudProviderOperationError(
                `Dropbox download failed: ${detail}`,
                {
                    cause: error,
                    operation: "downloadObject",
                    providerKind: this.kind,
                    target: normalizedKey,
                }
            );
        });

        return convertDropboxDownloadedResultToBuffer(response.result);
    }

    public async deleteObject(key: string): Promise<void> {
        const client = await this.createClient();

        const normalizedKey = normalizeKey(key);
        assertCloudObjectKey(normalizedKey);

        await withDropboxRetry({
            fn: async () =>
                client.filesDeleteV2({
                    path: toDropboxObjectPath(normalizedKey),
                }),
            operationName: "files/delete_v2",
        }).catch((error: unknown) => {
            // Contract: deleting a missing object is a no-op.
            if (isDropboxNotFoundError(error)) {
                return;
            }

            const described = describeDropboxSdkErrorRich(error);
            const detail = described ?? ensureError(error).message;
            throw new CloudProviderOperationError(`Dropbox delete failed: ${detail}`, {
                cause: error,
                operation: "deleteObject",
                providerKind: this.kind,
                target: normalizedKey,
            });
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
