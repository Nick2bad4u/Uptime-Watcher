import type { CloudProviderKind } from "@shared/types/cloud";
import type { drive_v3 } from "googleapis";

import { tryGetErrorCode } from "@shared/utils/errorCodes";
import { ensureError } from "@shared/utils/errorHandling";
import { normalizePathSeparatorsToPosix } from "@shared/utils/pathSeparators";
import { google } from "googleapis";
import { Readable } from "node:stream";

import type {
    CloudObjectEntry,
    CloudStorageProvider,
} from "../CloudStorageProvider.types";
import type { GoogleDriveTokenManager } from "./GoogleDriveTokenManager";

import {
    assertCloudObjectKey,
    normalizeCloudObjectKey,
    normalizeProviderObjectKey,
} from "../../cloudKeyNormalization";
import { BaseCloudStorageProvider } from "../BaseCloudStorageProvider";
import { CloudProviderOperationError } from "../cloudProviderErrors";
import {
    type GoogleDriveListedFile,
    parseGoogleDriveCreateResponse,
    parseGoogleDriveFileMetadata,
    parseGoogleDriveListResponse,
} from "./googleDriveApiSchemas";
import { tryDescribeGoogleDriveApiError } from "./googleDriveErrorSchemas";

const GOOGLE_FOLDER_MIME_TYPE = "application/vnd.google-apps.folder";
const APP_ROOT_FOLDER_NAME = "uptime-watcher";
const BACKUPS_PREFIX = "backups/";

function normalizeKey(key: string): string {
    return normalizeProviderObjectKey(key);
}

function normalizeDriveNameSegment(candidate: string): null | string {
    if (candidate.length === 0) {
        return null;
    }

    if (candidate !== candidate.trim()) {
        return null;
    }

    if (normalizePathSeparatorsToPosix(candidate).includes("/")) {
        return null;
    }

    // Reuse the shared control character detector via normalization.
    // Keep `trim: false` semantics by checking above.
    const normalized = normalizeCloudObjectKey(candidate, {
        allowEmpty: false,
        forbidAsciiControlCharacters: true,
        forbidTraversalSegments: true,
        normalizeSeparators: false,
        stripLeadingSlashes: false,
        trim: false,
    });

    return normalized.length > 0 ? normalized : null;
}

function tryGetGoogleDriveHttpStatus(error: unknown): number | undefined {
    if (typeof error !== "object" || error === null) {
        return undefined;
    }

    if (!("response" in error)) {
        return undefined;
    }

    const {response} = (error as { response?: unknown });
    if (typeof response !== "object" || response === null) {
        return undefined;
    }

    const {status} = (response as { status?: unknown });
    return typeof status === "number" ? status : undefined;
}

function ensureTrailingSlash(prefix: string): string {
    const normalized = normalizeKey(prefix);
    if (!normalized) {
        return "";
    }
    return normalized.endsWith("/") ? normalized : `${normalized}/`;
}

function splitKey(key: string): { dirSegments: string[]; fileName: string } {
    const normalized = normalizeKey(key);

    assertCloudObjectKey(normalized);

    const parts = normalized.split("/").filter((part) => part.length > 0);

    const fileName = parts.at(-1);
    // `assertCloudObjectKey` guarantees non-empty.
    if (!fileName) {
        throw new Error("Cloud key cannot be empty");
    }

    return {
        dirSegments: parts.slice(0, -1),
        fileName,
    };
}

async function convertStreamToBuffer(
    stream: NodeJS.ReadableStream
): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
}

/**
 * Google Drive-backed provider that stores all app artifacts in the Drive
 * `appDataFolder` space.
 */
export class GoogleDriveCloudStorageProvider
    extends BaseCloudStorageProvider
    implements CloudStorageProvider
{
    public readonly kind: CloudProviderKind = "google-drive";

    private readonly clientId: string;

    private readonly clientSecret: string | undefined;

    private readonly tokenManager: GoogleDriveTokenManager;

    private readonly folderCache = new Map<string, string>();

    public async isConnected(): Promise<boolean> {
        return this.tokenManager.isConnected();
    }

    public async deleteObject(key: string): Promise<void> {
        const normalized = normalizeKey(key);
        try {
            const drive = await this.getDriveClient();

            const existing = await this.findFileByKey(drive, normalized);
            if (!existing) {
                return;
            }

            await drive.files.delete({ fileId: existing.id });
        } catch (error) {
            // Deleting a missing file should be idempotent.
            if (tryGetGoogleDriveHttpStatus(error) === 404) {
                return;
            }

            const detail = tryDescribeGoogleDriveApiError(error);
            const suffix = detail ? `: ${detail}` : "";
            throw new CloudProviderOperationError(
                `Failed to delete Google Drive object '${normalized}'${suffix}`,
                {
                    cause: error,
                    operation: "deleteObject",
                    providerKind: this.kind,
                    target: normalized,
                }
            );
        }
    }

    public async downloadObject(key: string): Promise<Buffer> {
        const normalized = normalizeKey(key);
        try {
            const drive = await this.getDriveClient();

            const existing = await this.findFileByKey(drive, normalized);
            if (!existing) {
                throw new CloudProviderOperationError(
                    `Google Drive object not found: ${normalized}`,
                    {
                        code: "ENOENT",
                        operation: "downloadObject",
                        providerKind: this.kind,
                        target: normalized,
                    }
                );
            }

            const response = await drive.files.get(
                { alt: "media", fileId: existing.id },
                { responseType: "stream" }
            );


            return await convertStreamToBuffer(response.data);
        } catch (error) {
            const code = tryGetErrorCode(error);
            if (code === "ENOENT") {
                throw ensureError(error);
            }

            if (tryGetGoogleDriveHttpStatus(error) === 404) {
                throw new CloudProviderOperationError(
                    `Google Drive object not found: ${normalized}`,
                    {
                        cause: error,
                        code: "ENOENT",
                        operation: "downloadObject",
                        providerKind: this.kind,
                        target: normalized,
                    }
                );
            }

            const detail = tryDescribeGoogleDriveApiError(error);
            const suffix = detail ? `: ${detail}` : "";
            throw new CloudProviderOperationError(
                `Failed to download Google Drive object '${normalized}'${suffix}`,
                {
                    cause: error,
                    operation: "downloadObject",
                    providerKind: this.kind,
                    target: normalized,
                }
            );
        }
    }

    public async listObjects(prefix: string): Promise<CloudObjectEntry[]> {
        const normalizedPrefix = ensureTrailingSlash(prefix);
        try {
            const drive = await this.getDriveClient();

            const rootFolderId = await this.getOrCreateFolderId(drive, []);

            // If a prefix is provided, attempt to resolve that folder first.
            let startFolderId = rootFolderId;
            let startPrefix = "";
            if (normalizedPrefix) {
                const parts = normalizedPrefix
                    .split("/")
                    .filter((part) => part.length > 0);

                const resolved = await this.resolveFolderId(drive, parts);
                if (!resolved) {
                    return [];
                }

                startFolderId = resolved;
                startPrefix = normalizedPrefix;
            }

            const entries = await this.listFolderRecursive(
                drive,
                startFolderId,
                startPrefix
            );

            return entries.toSorted((a, b) => a.key.localeCompare(b.key));
        } catch (error) {
            const detail = tryDescribeGoogleDriveApiError(error);
            const suffix = detail ? `: ${detail}` : "";
            throw new CloudProviderOperationError(
                `Failed to list Google Drive objects for prefix '${normalizedPrefix}'${suffix}`,
                {
                    cause: error,
                    operation: "listObjects",
                    providerKind: this.kind,
                    target: normalizedPrefix,
                }
            );
        }
    }

    public async uploadObject(args: {
        buffer: Buffer;
        key: string;
        overwrite?: boolean;
    }): Promise<CloudObjectEntry> {
        const normalizedKey = normalizeKey(args.key);
        try {
            const { dirSegments, fileName } = splitKey(normalizedKey);
            const drive = await this.getDriveClient();

            const parentId = await this.getOrCreateFolderId(drive, dirSegments);

            const existing = await this.findChildByName(drive, {
                mimeType: undefined,
                name: fileName,
                parentId,
            });

            if (existing && args.overwrite === false) {
                throw new CloudProviderOperationError(
                    `Google Drive object already exists: ${normalizedKey}`,
                    {
                        code: "EEXIST",
                        operation: "uploadObject",
                        providerKind: this.kind,
                        target: normalizedKey,
                    }
                );
            }

            const media = {
                body: Readable.from(args.buffer),
                mimeType: "application/octet-stream",
            };

            let fileId: null | string = existing?.id ?? null;

            if (fileId) {
                await drive.files.update({
                    fileId,
                    media,
                });
            } else {
                const created = await drive.files.create({
                    fields: "id",
                    media,
                    requestBody: {
                        name: fileName,
                        parents: [parentId],
                    },
                });

                fileId = parseGoogleDriveCreateResponse(created.data).id;
            }

            const metadata = await drive.files.get({
                fields: "modifiedTime, size",
                fileId,
            });

            const parsedMetadata = parseGoogleDriveFileMetadata(metadata.data);

            const modifiedAt = parsedMetadata.modifiedTime
                ? new Date(parsedMetadata.modifiedTime).getTime()
                : Date.now();

            const sizeFromApi = Number(parsedMetadata.size ?? 0);
            const sizeBytes = sizeFromApi > 0 ? sizeFromApi : args.buffer.length;

            return {
                key: normalizedKey,
                lastModifiedAt: modifiedAt,
                sizeBytes,
            };
        } catch (error) {
            // Preserve EEXIST semantic for callers.
            const code = tryGetErrorCode(error);
            if (code === "EEXIST") {
                const preserved = ensureError(error);
                if (preserved instanceof CloudProviderOperationError) {
                    throw preserved;
                }

                throw new CloudProviderOperationError(preserved.message, {
                    cause: error,
                    code: "EEXIST",
                    operation: "uploadObject",
                    providerKind: this.kind,
                    target: normalizedKey,
                });
            }

            const detail = tryDescribeGoogleDriveApiError(error);
            const suffix = detail ? `: ${detail}` : "";
            throw new CloudProviderOperationError(
                `Failed to upload Google Drive object '${normalizedKey}'${suffix}`,
                {
                    cause: error,
                    operation: "uploadObject",
                    providerKind: this.kind,
                    target: normalizedKey,
                }
            );
        }
    }

    private async getDriveClient(): Promise<drive_v3.Drive> {
        const accessToken = await this.tokenManager.getValidAccessToken();

        const oauth2 = new google.auth.OAuth2(
            this.clientId,
            this.clientSecret,
            undefined
        );

        oauth2.setCredentials({
            access_token: accessToken,
        });

        return google.drive({ auth: oauth2, version: "v3" });
    }

    private async getOrCreateFolderId(
        drive: drive_v3.Drive,
        pathSegments: string[]
    ): Promise<string> {
        const normalizedSegments = [APP_ROOT_FOLDER_NAME, ...pathSegments]
            .map((segment) => segment.trim())
            .filter((segment) => segment.length > 0);

        const cacheKey = normalizedSegments.join("/");
        const cached = this.folderCache.get(cacheKey);
        if (cached) {
            return cached;
        }

        let parentId = "appDataFolder";
        let currentPath = "";

        for (const segment of normalizedSegments) {
            currentPath = currentPath ? `${currentPath}/${segment}` : segment;

            // eslint-disable-next-line no-await-in-loop -- Each folder depends on the previous parent id.
            const existing = await this.findChildByName(drive, {
                mimeType: GOOGLE_FOLDER_MIME_TYPE,
                name: segment,
                parentId,
            });

            if (existing) {
                parentId = existing.id;
                this.folderCache.set(currentPath, existing.id);
            } else {
                // eslint-disable-next-line no-await-in-loop -- Each folder depends on the previous parent id.
                const created = await drive.files.create({
                    fields: "id",
                    requestBody: {
                        mimeType: GOOGLE_FOLDER_MIME_TYPE,
                        name: segment,
                        parents: [parentId],
                    },
                });

                const { id } = parseGoogleDriveCreateResponse(created.data);

                parentId = id;
                this.folderCache.set(currentPath, id);
            }
        }

        this.folderCache.set(cacheKey, parentId);
        return parentId;
    }

    private async findFileByKey(
        drive: drive_v3.Drive,
        key: string
    ): Promise<null | { id: string }> {
        const { dirSegments, fileName } = splitKey(key);
        const parentId = await this.resolveFolderId(drive, dirSegments);
        if (!parentId) {
            return null;
        }

        const existing = await this.findChildByName(drive, {
            mimeType: undefined,
            name: fileName,
            parentId,
        });

        return existing ? { id: existing.id } : null;
    }

    private async resolveFolderId(
        drive: drive_v3.Drive,
        pathSegments: string[]
    ): Promise<null | string> {
        const normalizedSegments = [APP_ROOT_FOLDER_NAME, ...pathSegments]
            .map((segment) => segment.trim())
            .filter((segment) => segment.length > 0);

        let parentId = "appDataFolder";

        for (const segment of normalizedSegments) {
            // eslint-disable-next-line no-await-in-loop -- Folder traversal must be sequential.
            const child = await this.findChildByName(drive, {
                mimeType: GOOGLE_FOLDER_MIME_TYPE,
                name: segment,
                parentId,
            });

            if (!child) {
                return null;
            }

            parentId = child.id;
        }

        return parentId;
    }

    private async findChildByName(
        drive: drive_v3.Drive,
        args: { mimeType: string | undefined; name: string; parentId: string }
    ): Promise<null | { id: string }> {
        const safeName = args.name.replaceAll("'", String.raw`\\'`);
        const conditions: string[] = [
            `name = '${safeName}'`,
            `'${args.parentId}' in parents`,
            "trashed = false",
        ];

        if (args.mimeType) {
            conditions.push(`mimeType = '${args.mimeType}'`);
        }

        const response = await drive.files.list({
            fields: "files(id)",
            q: conditions.join(" and "),
            spaces: "appDataFolder",
        });

        const parsedList = parseGoogleDriveListResponse(response.data);
        if (parsedList.files.length === 0) {
            return null;
        }

        const [first] = parsedList.files;
        if (!first?.id) {
            return null;
        }

        return { id: first.id };
    }

    private async listFolderRecursive(
        drive: drive_v3.Drive,
        folderId: string,
        prefix: string
    ): Promise<CloudObjectEntry[]> {
        const entries: CloudObjectEntry[] = [];

        const processFile = async (
            file: GoogleDriveListedFile
        ): Promise<void> => {
            if (!file.id || !file.name) {
                return;
            }

            const safeSegment = normalizeDriveNameSegment(file.name);
            if (!safeSegment) {
                return;
            }

            if (file.mimeType === GOOGLE_FOLDER_MIME_TYPE) {
                const nested = await this.listFolderRecursive(
                    drive,
                    file.id,
                    `${prefix}${safeSegment}/`
                );
                entries.push(...nested);
                return;
            }

            const key = normalizeKey(`${prefix}${safeSegment}`);
            const sizeBytes = Number(file.size ?? 0);
            const lastModifiedAt = file.modifiedTime
                ? new Date(file.modifiedTime).getTime()
                : 0;

            entries.push({ key, lastModifiedAt, sizeBytes });
        };

        let pageToken: null | string = null;

        do {
            const params: drive_v3.Params$Resource$Files$List = {
                fields: "nextPageToken, files(id, name, mimeType, modifiedTime, size)",
                q: `'${folderId}' in parents and trashed = false`,
                spaces: "appDataFolder",
            };

            if (pageToken) {
                params.pageToken = pageToken;
            }

            // eslint-disable-next-line no-await-in-loop -- Drive pagination requests must be sequential.
            const response = await drive.files.list(params);

            const parsedList = parseGoogleDriveListResponse(response.data);
            pageToken = parsedList.nextPageToken;

            for (const file of parsedList.files) {
                // eslint-disable-next-line no-await-in-loop -- Recursive listing is sequential by folder.
                await processFile(file);
            }
        } while (pageToken);

        return entries;
    }

    public constructor(args: {
        clientId: string;
        clientSecret?: string;
        tokenManager: GoogleDriveTokenManager;
    }) {
        super(BACKUPS_PREFIX);
        this.clientId = args.clientId;
        this.clientSecret = args.clientSecret;
        this.tokenManager = args.tokenManager;
    }
}
