import { hasAsciiControlCharacters } from "@shared/utils/stringSafety";
import { getUtfByteLength } from "@shared/utils/utfByteLength";

/**
 * Shared filesystem base-directory validation.
 *
 * @remarks
 * This is intentionally implemented as pure string validation (no IO), so it
 * can be used consistently across renderer-to-IPC validation and main-process
 * services.
 */

/** Maximum byte budget accepted for filesystem provider base directories. */
export const MAX_FILESYSTEM_BASE_DIRECTORY_BYTES = 4096;

/**
 * Discrete validation failures for filesystem base directory candidates.
 */
export type FilesystemBaseDirectoryValidationIssue =
    | { readonly code: "control-chars" }
    | { readonly code: "empty" }
    | { readonly code: "not-absolute" }
    | { readonly code: "not-string" }
    | { readonly code: "null-byte" }
    | { readonly code: "too-large"; readonly maxBytes: number }
    | { readonly code: "whitespace" }
    | { readonly code: "windows-device-namespace" };

function isWindowsDeviceNamespacePath(value: string): boolean {
    // Treat forward slashes as backslashes for this check.
    const normalized = value.replaceAll("/", "\\");
    return normalized.startsWith("\\\\?\\") || normalized.startsWith("\\\\.\\");
}

function isAbsoluteFilesystemPath(value: string): boolean {
    if (isWindowsDeviceNamespacePath(value)) {
        return true;
    }

    // POSIX absolute paths
    if (value.startsWith("/")) {
        return true;
    }

    // UNC paths (\\server\share or //server/share)
    if (value.startsWith("\\\\") || value.startsWith("//")) {
        return true;
    }

    // Windows drive paths (C:\ or C:/)
    if (value.length >= 3) {
        const [firstChar, secondChar, thirdChar] = value;
        if (secondChar !== ":" || firstChar === undefined) {
            return false;
        }

        const codePoint = firstChar.codePointAt(0);
        const isAsciiLetter =
            codePoint !== undefined &&
            ((codePoint >= 65 && codePoint <= 90) ||
                (codePoint >= 97 && codePoint <= 122));

        if (!isAsciiLetter) {
            return false;
        }

        return thirdChar === "\\" || thirdChar === "/";
    }

    return false;
}

/**
 * Validates a filesystem base directory candidate.
 *
 * @returns A list of issues (empty means valid).
 */
export function validateFilesystemBaseDirectoryCandidate(
    candidate: unknown,
    options: {
        readonly maxBytes?: number;
    } = {}
): readonly FilesystemBaseDirectoryValidationIssue[] {
    if (typeof candidate !== "string") {
        return [{ code: "not-string" }];
    }

    const maxBytes = options.maxBytes ?? MAX_FILESYSTEM_BASE_DIRECTORY_BYTES;

    const trimmed = candidate.trim();
    if (trimmed.length === 0) {
        return [{ code: "empty" }];
    }

    const issues: FilesystemBaseDirectoryValidationIssue[] = [];

    if (candidate !== trimmed) {
        issues.push({ code: "whitespace" });
    }

    if (getUtfByteLength(candidate) > maxBytes) {
        issues.push({ code: "too-large", maxBytes });
    }

    if (hasAsciiControlCharacters(candidate)) {
        issues.push({ code: "control-chars" });
    }

    if (candidate.includes("\0")) {
        issues.push({ code: "null-byte" });
    }

    if (isWindowsDeviceNamespacePath(candidate)) {
        issues.push({ code: "windows-device-namespace" });
    }

    // Use the trimmed value for absoluteness checks (aligns with IPC behavior).
    if (!isAbsoluteFilesystemPath(trimmed)) {
        issues.push({ code: "not-absolute" });
    }

    return issues;
}

/**
 * Returns true when a filesystem base directory candidate is valid.
 */
export function isFilesystemBaseDirectoryValid(
    candidate: unknown,
    options: {
        readonly maxBytes?: number;
    } = {}
): boolean {
    return validateFilesystemBaseDirectoryCandidate(candidate, options).length === 0;
}
