import { hasAsciiControlCharacters } from "@shared/utils/stringSafety";

/**
 * Options for {@link normalizeCloudObjectKey}.
 */
export type NormalizeCloudKeyOptions = Readonly<{
    /**
     * When false, empty output keys cause an error.
     *
     * @defaultValue true
     */
    allowEmpty?: boolean;

    /**
     * When true, consecutive `/` characters are collapsed.
     *
     * @defaultValue true
     */
    collapseSlashes?: boolean;

    /**
     * When true, ASCII control characters are rejected.
     *
     * @defaultValue false
     */
    forbidAsciiControlCharacters?: boolean;

    /**
     * When true, `.` and `..` path segments are rejected.
     *
     * @defaultValue true
     */
    forbidTraversalSegments?: boolean;

    /**
     * When true, Windows path separators (`\\`) are normalized to `/`.
     *
     * @defaultValue true
     */
    normalizeSeparators?: boolean;

    /**
     * When true, leading `/` characters are stripped.
     *
     * @defaultValue true
     */
    stripLeadingSlashes?: boolean;

    /**
     * When true, the key is trimmed.
     *
     * @defaultValue true
     */
    trim?: boolean;
}>;

/**
 * Normalizes provider object keys into a canonical POSIX-ish representation.
 *
 * @remarks
 * This helper is intentionally _normalization only_. It does not enforce
 * provider-specific sandbox rules (e.g. maximum byte length, required prefixes,
 * etc). Those should be enforced by the caller.
 */
export function normalizeCloudObjectKey(
    rawKey: string,
    options: NormalizeCloudKeyOptions = {}
): string {
    const {
        allowEmpty = true,
        collapseSlashes = true,
        forbidAsciiControlCharacters = false,
        forbidTraversalSegments = true,
        normalizeSeparators = true,
        stripLeadingSlashes = true,
        trim = true,
    } = options;

    let normalized = rawKey;

    if (trim) {
        normalized = normalized.trim();
    }

    if (normalizeSeparators) {
        normalized = normalized.replaceAll("\\\\", "/");
    }

    if (stripLeadingSlashes) {
        normalized = normalized.replace(/^\/+/u, "");
    }

    if (collapseSlashes) {
        // Collapse redundant slashes deterministically without regex.
        while (normalized.includes("//")) {
            normalized = normalized.replaceAll("//", "/");
        }
    }

    if (!allowEmpty && normalized.length === 0) {
        throw new Error("Cloud key must not be empty");
    }

    if (forbidAsciiControlCharacters && hasAsciiControlCharacters(normalized)) {
        throw new Error("Cloud key must not contain control characters");
    }

    if (forbidTraversalSegments) {
        const segments = normalized.split("/");
        if (segments.some((segment) => segment === "." || segment === "..")) {
            throw new Error(
                "Cloud key must not contain path traversal segments"
            );
        }
    }

    return normalized;
}
