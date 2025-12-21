import { tryGetErrorCode } from "@shared/utils/errorCodes";

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
