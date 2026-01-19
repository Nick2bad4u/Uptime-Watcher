import { formatZodIssues } from "@shared/utils/zodIssueFormatting";
import * as z from "zod";

/**
 * Minimal schema for the Dropbox SDK `filesUpload` result.
 *
 * @remarks
 * Dropbox may add fields over time; we validate only the fields we depend on.
 */
const dropboxFilesUploadResultSchema = z
    .object({
    path_display: z.string().min(1),
    server_modified: z.string().min(1),
    size: z.number(),
    })
    .loose();

/**
 * Normalized subset of the Dropbox upload response.
 */
export interface DropboxFilesUploadResult {
    /** Normalized Dropbox path (display form) for the uploaded object. */
    readonly pathDisplay: string;
    /** Server-modified timestamp string returned by Dropbox. */
    readonly serverModified: string;
    /** Uploaded object size in bytes. */
    readonly sizeBytes: number;
}

/**
 * Parses and validates the Dropbox SDK `filesUpload()` result payload.
 */
export function parseDropboxFilesUploadResult(
    value: unknown
): DropboxFilesUploadResult {
    const parsed = dropboxFilesUploadResultSchema.safeParse(value);
    if (!parsed.success) {
        const issues = formatZodIssues(parsed.error.issues);
        throw new TypeError(
            `Dropbox returned an unexpected upload response: ${issues.slice(0, 3).join("; ")}`
        );
    }

    return {
        pathDisplay: parsed.data.path_display,
        serverModified: parsed.data.server_modified,
        sizeBytes: parsed.data.size,
    };
}

const dropboxFileBinarySchema = z.custom<unknown>(
    (value) => value instanceof Uint8Array || value instanceof ArrayBuffer,
    {
        error: "Expected Dropbox fileBinary to be a Uint8Array or ArrayBuffer",
    }
);

const dropboxFileBlobSchema = z.custom<unknown>(
    (value) => {
        const BlobConstructor = (globalThis as { Blob?: unknown }).Blob;
        if (typeof BlobConstructor !== "function") {
            return false;
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Runtime instanceof check against a global constructor.
        return value instanceof (BlobConstructor as new (...args: never[]) => object);
    },
    {
        error: "Expected Dropbox fileBlob to be a Blob",
    }
);

const dropboxFilesDownloadResultSchema = z
    .object({
        fileBinary: dropboxFileBinarySchema.optional(),
        fileBlob: dropboxFileBlobSchema.optional(),
    })
    .loose();

/**
 * Normalized subset of the Dropbox download response.
 */
export interface DropboxFilesDownloadResult {
    /** File content returned by the Dropbox SDK in Node-like environments. */
    readonly fileBinary?: unknown;
    /** File content returned by the Dropbox SDK in browser-like environments. */
    readonly fileBlob?: unknown;
}

/**
 * Parses and validates the Dropbox SDK `filesDownload()` result payload.
 */
export function parseDropboxFilesDownloadResult(
    value: unknown
): DropboxFilesDownloadResult {
    const parsed = dropboxFilesDownloadResultSchema.safeParse(value);
    if (!parsed.success) {
        const issues = formatZodIssues(parsed.error.issues);
        throw new TypeError(
            `Dropbox download result did not match the expected format: ${issues.slice(0, 3).join("; ")}`
        );
    }

    if (
        parsed.data.fileBinary === undefined &&
        parsed.data.fileBlob === undefined
    ) {
        throw new TypeError(
            "Dropbox download did not include fileBinary/fileBlob content"
        );
    }

    return {
        fileBinary: parsed.data.fileBinary,
        fileBlob: parsed.data.fileBlob,
    };
}

const dropboxListFolderFileEntrySchema = z
    .object({
    ".tag": z.literal("file"),
    path_display: z.string().min(1),
    server_modified: z.string().min(1),
    size: z.number(),
    })
    .loose();

/**
 * Normalized subset of a Dropbox list-folder file entry.
 */
export interface DropboxListFolderFileEntry {
    /** Normalized Dropbox path (display form) for the listed file. */
    readonly pathDisplay: string;
    /** Server-modified timestamp string returned by Dropbox. */
    readonly serverModified: string;
    /** Size in bytes for the listed file. */
    readonly sizeBytes: number;
}

/**
 * Best-effort parser for file entries returned by `filesListFolder()`.
 */
export function tryParseDropboxListFolderFileEntry(
    value: unknown
): DropboxListFolderFileEntry | null {
    const parsed = dropboxListFolderFileEntrySchema.safeParse(value);
    if (!parsed.success) {
        return null;
    }

    return {
        pathDisplay: parsed.data.path_display,
        serverModified: parsed.data.server_modified,
        sizeBytes: parsed.data.size,
    };
}

const dropboxCurrentAccountSchema = z
    .object({
    email: z.string().min(1),
        name: z
            .object({
                display_name: z.string().min(1),
            })
            .loose(),
    })
    .loose();

/**
 * Minimal subset of the current Dropbox account payload.
 */
export interface DropboxCurrentAccount {
    /** Display name for the account. */
    readonly displayName: string;
    /** Email address for the account. */
    readonly email: string;
}

/**
 * Parses and validates the Dropbox SDK `usersGetCurrentAccount()` result
 * payload.
 */
export function parseDropboxCurrentAccount(
    value: unknown
): DropboxCurrentAccount {
    const parsed = dropboxCurrentAccountSchema.safeParse(value);
    if (!parsed.success) {
        const issues = formatZodIssues(parsed.error.issues);
        throw new TypeError(
            `Dropbox returned an unexpected current account response: ${issues.slice(0, 3).join("; ")}`
        );
    }

    return {
        displayName: parsed.data.name.display_name,
        email: parsed.data.email,
    };
}
