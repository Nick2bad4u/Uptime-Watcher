import { validateExternalOpenUrlCandidate } from "@shared/utils/urlSafety";
import { getUtfByteLength } from "@shared/utils/utfByteLength";
import {
    isNonEmptyString,
    isValidUrl,
} from "@shared/validation/validatorUtils";

/**
 * Maximum byte length accepted for URL parameters passed through IPC.
 *
 * @remarks
 * Defense-in-depth guard to prevent oversized payloads from forcing expensive
 * parsing or logging work at IPC boundaries.
 */
const MAX_IPC_URL_UTF_BYTES = 32_768;

/**
 * Standard parameter validation utilities for common IPC operations.
 *
 * @remarks
 * These validators intentionally return `null` on success so they can be
 * composed by the higher-level parameter-validation helpers.
 */
export const IpcValidators = {
    /**
     * Validates an optional string parameter.
     */
    optionalString: (value: unknown, paramName: string): null | string => {
        if (value !== undefined && !isNonEmptyString(value)) {
            return `${paramName} must be a non-empty string when provided`;
        }
        return null;
    },

    /**
     * Validates a required boolean parameter.
     */
    requiredBoolean: (value: unknown, paramName: string): null | string => {
        if (typeof value !== "boolean") {
            return `${paramName} must be a boolean`;
        }
        return null;
    },

    /**
     * Validates a required URL parameter intended for opening via
     * `shell.openExternal`.
     *
     * @remarks
     * This differs from {@link requiredUrl} by allowing `mailto:` in addition to
     * `http:` and `https:`.
     */
    requiredExternalOpenUrl: (
        value: unknown,
        paramName: string
    ): null | string => {
        const validation = validateExternalOpenUrlCandidate(value);
        if ("reason" in validation) {
            return `${paramName} ${validation.reason}`;
        }

        return null;
    },

    /**
     * Validates a required number parameter.
     */
    requiredNumber: (value: unknown, paramName: string): null | string => {
        if (typeof value !== "number" || Number.isNaN(value)) {
            return `${paramName} must be a valid number`;
        }
        return null;
    },

    /**
     * Validates a required object parameter.
     */
    requiredObject: (value: unknown, paramName: string): null | string => {
        if (
            typeof value !== "object" ||
            value === null ||
            Array.isArray(value)
        ) {
            return `${paramName} must be a valid object`;
        }
        return null;
    },

    /**
     * Validates a required string parameter.
     */
    requiredString: (value: unknown, paramName: string): null | string => {
        if (!isNonEmptyString(value)) {
            return `${paramName} must be a non-empty string`;
        }
        return null;
    },

    /**
     * Validates a required URL parameter restricted to safe HTTP(S) protocols.
     */
    requiredUrl: (value: unknown, paramName: string): null | string => {
        // Preserve legacy semantics: non-string values should be reported as an
        // invalid URL rather than a type mismatch.
        if (typeof value !== "string") {
            return `${paramName} must be a valid http(s) URL`;
        }

        const byteLength = getUtfByteLength(value);
        if (byteLength > MAX_IPC_URL_UTF_BYTES) {
            return `${paramName} must not exceed ${MAX_IPC_URL_UTF_BYTES} bytes`;
        }

        if (/[\n\r]/u.test(value)) {
            return `${paramName} must not contain newlines`;
        }

        if (
            !isValidUrl(value, {
                disallowAuth: true,
            })
        ) {
            return `${paramName} must be a valid http(s) URL`;
        }

        return null;
    },
} as const;
