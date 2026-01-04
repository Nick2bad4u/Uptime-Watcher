import { normalizePathSeparatorsToPosix } from "@shared/utils/pathSeparators";
import { hasAsciiControlCharacters } from "@shared/utils/stringSafety";
import { getUtfByteLength } from "@shared/utils/utfByteLength";

/**
 * Default maximum size budget for provider object keys.
 *
 * @remarks
 * This is intentionally generous. It is primarily a defense-in-depth guard
 * against pathological inputs that can cause excessive memory or filesystem
 * overhead.
 */
export const DEFAULT_MAX_PROVIDER_OBJECT_KEY_BYTES = 4096;

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
     * Maximum allowed UTF-8 byte length of the normalized key.
     *
     * @remarks
     * Use this when the key originates from untrusted input.
     */
    maxByteLength?: number;

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
        maxByteLength,
        normalizeSeparators = true,
        stripLeadingSlashes = true,
        trim = true,
    } = options;

    let normalized = rawKey;

    if (trim) {
        normalized = normalized.trim();
    }

    if (normalizeSeparators) {
        normalized = normalizePathSeparatorsToPosix(normalized);
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

    if (
        typeof maxByteLength === "number" &&
        Number.isFinite(maxByteLength) &&
        maxByteLength > 0 &&
        getUtfByteLength(normalized) > maxByteLength
    ) {
        throw new Error(`Cloud key must not exceed ${maxByteLength} bytes`);
    }

    return normalized;
}

/**
 * Normalizes a provider object key with the default sandbox rules used across
 * built-in providers.
 *
 * @remarks
 * This is the common configuration used by Dropbox + Google Drive providers:
 *
 * - Trim
 * - Normalize Windows separators
 * - Strip leading slashes
 * - Reject ASCII control characters
 * - Reject traversal segments
 *
 * Providers may still apply additional constraints (prefixing, max sizes, etc).
 */
export function normalizeProviderObjectKey(rawKey: string): string {
    return normalizeCloudObjectKey(rawKey, {
        allowEmpty: true,
        forbidAsciiControlCharacters: true,
        forbidTraversalSegments: true,
        maxByteLength: DEFAULT_MAX_PROVIDER_OBJECT_KEY_BYTES,
        stripLeadingSlashes: true,
    });
}

/**
 * Asserts that a normalized key can be used as an object key (i.e. refers to an
 * actual object rather than a directory/prefix).
 */
export function assertCloudObjectKey(key: string): void {
    if (key.length === 0) {
        throw new Error("Cloud key cannot be empty");
    }

    if (key.endsWith("/")) {
        throw new Error("Cloud key must not end with '/'");
    }
}
