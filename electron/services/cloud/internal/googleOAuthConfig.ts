/**
 * Google Drive OAuth configuration resolution.
 *
 * @remarks
 * Google OAuth client IDs are not secrets for desktop apps (public clients).
 * The app ships with a default client id so end users do not need to set
 * environment variables.
 *
 * Environment variables still take precedence for development overrides.
 */

import { readProcessEnv } from "@electron/utils/environment";

/**
 * Resolved Google Drive OAuth client configuration.
 */
export type GoogleDriveOAuthConfig = Readonly<{
    clientId: string;
    clientSecret?: string | undefined;
}>;

/**
 * Default Google OAuth desktop client id shipped with the app.
 *
 * @remarks
 * This value is effectively public in a packaged desktop app.
 */
export const DEFAULT_GOOGLE_DRIVE_CLIENT_ID =
    "847007675136-epa37blmge6np9k2g6fr73sbu0sr2i5j.apps.googleusercontent.com" as const;

/**
 * Resolves the Google Drive OAuth configuration.
 *
 * @remarks
 * Environment variable overrides are supported for local development and CI.
 */
export function resolveGoogleDriveOAuthConfig(): GoogleDriveOAuthConfig {
    const clientId =
        readProcessEnv("UPTIME_WATCHER_GOOGLE_CLIENT_ID") ??
        DEFAULT_GOOGLE_DRIVE_CLIENT_ID;

    const clientSecret =
        readProcessEnv("UPTIME_WATCHER_GOOGLE_CLIENT_SECRET") ?? undefined;

    return {
        clientId,
        clientSecret,
    };
}
