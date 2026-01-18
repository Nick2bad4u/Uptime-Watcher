import { formatZodIssues } from "@shared/utils/zodIssueFormatting";
import * as z from "zod";

/**
 * Minimal payload returned by Drive `files.create()` when requesting
 * `fields: "id"`.
 */
export interface GoogleDriveCreateResponse {
    readonly id: string;
}

/**
 * File size value returned by Drive API.
 *
 * @remarks
 * Google APIs can return sizes as strings (and occasionally numbers depending
 * on client abstractions).
 */
export type GoogleDriveFileSizeValue = number | string;

/**
 * Minimal metadata payload returned by Drive `files.get()` when requesting
 * `fields: "modifiedTime,size"`.
 */
export interface GoogleDriveFileMetadata {
    readonly modifiedTime?: string | undefined;
    readonly size?: GoogleDriveFileSizeValue | undefined;
}

/**
 * Normalized subset of the Google Drive `Schema$File` we depend on.
 */
export interface GoogleDriveListedFile {
    readonly id?: string | undefined;
    readonly mimeType?: string | undefined;
    readonly modifiedTime?: string | undefined;
    readonly name?: string | undefined;
    readonly size?: GoogleDriveFileSizeValue | undefined;
}

/**
 * Minimal list payload returned by Drive `files.list()`.
 */
export interface GoogleDriveListResponse {
    readonly files: readonly GoogleDriveListedFile[];
    readonly nextPageToken: null | string;
}

const googleDriveCreateResponseSchema: z.ZodType<GoogleDriveCreateResponse> =
    z.looseObject({
        id: z.string().min(1),
    });

/**
 * Parses and validates the `drive.files.create()` response data.
 */
export function parseGoogleDriveCreateResponse(
    value: unknown
): GoogleDriveCreateResponse {
    const parsed = googleDriveCreateResponseSchema.safeParse(value);
    if (!parsed.success) {
        const issues = formatZodIssues(parsed.error.issues);
        throw new TypeError(
            `Google Drive create response did not match the expected format: ${issues.slice(0, 3).join("; ")}`
        );
    }

    return { id: parsed.data.id };
}

const googleDriveFileMetadataSchema: z.ZodType<GoogleDriveFileMetadata> =
    z.looseObject({
        modifiedTime: z.string().optional(),
        size: z.union([z.string(), z.number()]).optional(),
    });

/**
 * Parses and validates the `drive.files.get()` response data.
 */
export function parseGoogleDriveFileMetadata(
    value: unknown
): GoogleDriveFileMetadata {
    const parsed = googleDriveFileMetadataSchema.safeParse(value);
    if (!parsed.success) {
        const issues = formatZodIssues(parsed.error.issues);
        throw new TypeError(
            `Google Drive metadata response did not match the expected format: ${issues.slice(0, 3).join("; ")}`
        );
    }

    return {
        modifiedTime: parsed.data.modifiedTime,
        size: parsed.data.size,
    };
}

const googleDriveFileSchema: z.ZodType<GoogleDriveListedFile> = z.looseObject({
    id: z.string().optional(),
    mimeType: z.string().optional(),
    modifiedTime: z.string().optional(),
    name: z.string().optional(),
    size: z.union([z.string(), z.number()]).optional(),
});

const googleDriveListResponseSchema: z.ZodType<{
    files?: GoogleDriveListedFile[] | undefined;
    nextPageToken?: null | string | undefined;
}> = z.looseObject({
    files: z.array(googleDriveFileSchema).optional(),
    nextPageToken: z.union([z.string(), z.null()]).optional(),
});

/**
 * Parses and validates the `drive.files.list()` response data.
 */
export function parseGoogleDriveListResponse(
    value: unknown
): GoogleDriveListResponse {
    const parsed = googleDriveListResponseSchema.safeParse(value);
    if (!parsed.success) {
        const issues = formatZodIssues(parsed.error.issues);
        throw new TypeError(
            `Google Drive list response did not match the expected format: ${issues.slice(0, 3).join("; ")}`
        );
    }

    return {
        files: parsed.data.files ?? [],
        nextPageToken: parsed.data.nextPageToken ?? null,
    };
}
