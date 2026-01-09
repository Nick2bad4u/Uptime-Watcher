/**
 * Minimal Google Drive HTTP client.
 *
 * @remarks
 * This module intentionally avoids the `googleapis` SDK because it is extremely
 * large and inflates packaged app size. Instead we call the Google Drive REST
 * API directly.
 */

import type { AxiosInstance } from "axios";

import axios from "axios";
import crypto from "node:crypto";

import type { GoogleDriveTokenManager } from "./GoogleDriveTokenManager";

const DRIVE_API_BASE_URL = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD_BASE_URL = "https://www.googleapis.com/upload/drive/v3";

const GOOGLE_DRIVE_REQUEST_TIMEOUT_MS = 2 * 60_000;

type DriveListParams = Readonly<{
    fields: string;
    pageSize: number;
    pageToken?: string | undefined;
    q: string;
    spaces: "appDataFolder";
}>;

type DriveGetParams = Readonly<{
    /** When set to "media" the API returns raw bytes. */
    alt?: "media" | undefined;
    fields?: string | undefined;
    fileId: string;
}>;

type DriveCreateParams = Readonly<{
    fields?: string | undefined;
    media?:
        | undefined
        | {
              body: Buffer;
              mimeType: string;
          };
    requestBody: unknown;
}>;

type DriveUpdateParams = Readonly<{
    fields?: string | undefined;
    fileId: string;
    media: {
        body: Buffer;
        mimeType: string;
    };
}>;

type DriveDeleteParams = Readonly<{
    fileId: string;
}>;

/**
 * Subset of the Google Drive v3 Files API used by the app.
 */
export type GoogleDriveFilesApi = Readonly<{
    create: (params: DriveCreateParams) => Promise<{ data: unknown }>;
    delete: (params: DriveDeleteParams) => Promise<{ data: unknown }>;
    get: (
        params: DriveGetParams
    ) => Promise<{ data: Buffer } | { data: unknown }>;
    list: (params: DriveListParams) => Promise<{ data: unknown }>;
    update: (params: DriveUpdateParams) => Promise<{ data: unknown }>;
}>;

/**
 * Minimal client surface modeled after the subset of `drive_v3.Drive` used by
 * Uptime Watcher.
 */
export type GoogleDriveClient = Readonly<{
    files: GoogleDriveFilesApi;
}>;

class GoogleDriveHttpClient {
    private readonly api: AxiosInstance;

    private readonly tokenManager: GoogleDriveTokenManager;

    private readonly uploadApi: AxiosInstance;

    public readonly files: GoogleDriveFilesApi;

    private static buildMultipartRelatedBody(
        metadata: unknown,
        buffer: Buffer,
        mimeType: string,
        boundary: string
    ): Buffer {
        const prefix = `--${boundary}\r\n`;
        const suffix = `\r\n--${boundary}--\r\n`;

        const metadataPart = `${prefix}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
        const mediaHeader = `${prefix}Content-Type: ${mimeType}\r\n\r\n`;

        return Buffer.concat([
            Buffer.from(metadataPart, "utf8"),
            Buffer.from(mediaHeader, "utf8"),
            buffer,
            Buffer.from(suffix, "utf8"),
        ]);
    }

    private static getBufferFromBinaryResponse(value: unknown): Buffer {
        if (Buffer.isBuffer(value)) {
            return value;
        }

        if (value instanceof ArrayBuffer) {
            return Buffer.from(new Uint8Array(value));
        }

        if (ArrayBuffer.isView(value)) {
            return Buffer.from(
                value.buffer,
                value.byteOffset,
                value.byteLength
            );
        }

        throw new TypeError("Google Drive API did not return binary content.");
    }

    private async getAuthorizationHeaders(): Promise<Record<string, string>> {
        const accessToken = await this.tokenManager.getValidAccessToken();

        return {
            Authorization: `Bearer ${accessToken}`,
        };
    }

    public constructor(tokenManager: GoogleDriveTokenManager) {
        this.api = axios.create({
            baseURL: DRIVE_API_BASE_URL,
            timeout: GOOGLE_DRIVE_REQUEST_TIMEOUT_MS,
        });
        this.tokenManager = tokenManager;
        this.uploadApi = axios.create({
            baseURL: DRIVE_UPLOAD_BASE_URL,
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
            timeout: GOOGLE_DRIVE_REQUEST_TIMEOUT_MS,
        });

        this.files = {
            create: async ({
                fields,
                media,
                requestBody,
            }): Promise<{ data: unknown }> => {
                const headers = await this.getAuthorizationHeaders();

                if (!media) {
                    const response = await this.api.post(
                        "/files",
                        requestBody,
                        {
                            headers: {
                                "Content-Type": "application/json",
                                ...headers,
                            },
                            params: fields ? { fields } : undefined,
                        }
                    );

                    return { data: response.data };
                }

                const boundary = `uptimewatcher_${crypto.randomUUID()}`;
                const body = GoogleDriveHttpClient.buildMultipartRelatedBody(
                    requestBody,
                    media.body,
                    media.mimeType,
                    boundary
                );

                const response = await this.uploadApi.post("/files", body, {
                    headers: {
                        "Content-Type": `multipart/related; boundary=${boundary}`,
                        ...headers,
                    },
                    params: {
                        uploadType: "multipart",
                        ...(fields ? { fields } : {}),
                    },
                });

                return { data: response.data };
            },

            delete: async ({ fileId }): Promise<{ data: unknown }> => {
                const headers = await this.getAuthorizationHeaders();
                const response = await this.api.delete(
                    `/files/${encodeURIComponent(fileId)}`,
                    {
                        headers,
                    }
                );

                return { data: response.data };
            },

            get: async ({
                alt,
                fields,
                fileId,
            }): Promise<{ data: Buffer } | { data: unknown }> => {
                const headers = await this.getAuthorizationHeaders();

                if (alt === "media") {
                    const response = await this.api.get<unknown>(
                        `/files/${encodeURIComponent(fileId)}`,
                        {
                            headers,
                            params: { alt },
                            responseType: "arraybuffer",
                        }
                    );

                    return {
                        data: GoogleDriveHttpClient.getBufferFromBinaryResponse(
                            response.data
                        ),
                    };
                }

                const response = await this.api.get(
                    `/files/${encodeURIComponent(fileId)}`,
                    {
                        headers,
                        params: fields ? { fields } : undefined,
                    }
                );

                return { data: response.data };
            },

            list: async (params): Promise<{ data: unknown }> => {
                const headers = await this.getAuthorizationHeaders();
                const response = await this.api.get("/files", {
                    headers,
                    params,
                });

                return { data: response.data };
            },

            update: async ({
                fields,
                fileId,
                media,
            }): Promise<{ data: unknown }> => {
                const headers = await this.getAuthorizationHeaders();
                const response = await this.uploadApi.patch(
                    `/files/${encodeURIComponent(fileId)}`,
                    media.body,
                    {
                        headers: {
                            "Content-Type": media.mimeType,
                            ...headers,
                        },
                        params: {
                            uploadType: "media",
                            ...(fields ? { fields } : {}),
                        },
                    }
                );

                return { data: response.data };
            },
        };
    }
}

/**
 * Creates a Google Drive client bound to the provided token manager.
 */
export function createGoogleDriveClient(
    tokenManager: GoogleDriveTokenManager
): GoogleDriveClient {
    const client = new GoogleDriveHttpClient(tokenManager);

    return {
        files: client.files,
    };
}
