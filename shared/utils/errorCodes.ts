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
 * (error as { code?: unknown }).code
 * ```
 */
export function tryGetErrorCode(error: unknown): string | undefined {
    if (!isObject(error)) {
        return undefined;
    }

    const { code } = error as { code?: unknown };
    return typeof code === "string" && code.length > 0 ? code : undefined;
}
