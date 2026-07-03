import { getOwnStringDataProperty } from "@shared/utils/errorPropertyAccess";
import { isObject } from "@shared/utils/typeGuards";

/**
 * Attempts to extract a stable string error code from an unknown error value.
 *
 * @remarks
 * Many Node/Electron APIs attach a string `code` property (e.g. `ENOENT`). This
 * helper centralizes the extraction to avoid scattered casts.
 *
 * For example, instead of writing:
 *
 * ```ts
 * (error as { code?: unknown }).code;
 * ```
 */
export function tryGetErrorCode(error: unknown): string | undefined {
    if (!isObject(error)) {
        return undefined;
    }

    const code = getOwnStringDataProperty(error, "code");
    return code && code.length > 0 ? code : undefined;
}
