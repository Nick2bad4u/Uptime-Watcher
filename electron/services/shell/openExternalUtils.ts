import { tryGetErrorCode } from "@shared/utils/errorCodes";
import { shell } from "electron";

/**
 * Produces a stable error-code suffix for errors thrown by Electron APIs.
 *
 * @remarks
 * Several Electron APIs include a `code` property (string) on their errors. We
 * centralize formatting to prevent drift across services.
 */
export function getElectronErrorCodeSuffix(error: unknown): string {
    const code = tryGetErrorCode(error);

    return typeof code === "string" && code.length > 0 ? ` (${code})` : "";
}

/**
 * Opens a validated external URL via `shell.openExternal`.
 *
 * @remarks
 * This helper centralizes error formatting so that failures never echo the
 * full URL (which may contain secrets). Callers must pass a pre-redacted
 * `safeUrlForLogging`.
 */
export async function openExternalOrThrow(args: {
    /** Prefix used in the thrown error message. */
    readonly failureMessagePrefix: string;
    /** A URL already validated and normalized (e.g., from urlSafety helpers). */
    readonly normalizedUrl: string;
    /** A safe representation to include in errors/logs (redacted). */
    readonly safeUrlForLogging: string;
}): Promise<void> {
    try {
        await shell.openExternal(args.normalizedUrl);
    } catch (error: unknown) {
        const codeSuffix = getElectronErrorCodeSuffix(error);

        throw new Error(
            `${args.failureMessagePrefix}: ${args.safeUrlForLogging}${codeSuffix}`,
            { cause: error }
        );
    }
}
