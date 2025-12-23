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

import { readProcessEnv } from "@shared/utils/environment";

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
 * Default Google OAuth client secret shipped with the app.
 *
 * @remarks
 * Desktop apps are **public clients**; this value is not confidential once the
 * app is distributed. It exists solely so the bundled OAuth client works for
 * end users without requiring environment variables.
 */
export const DEFAULT_GOOGLE_DRIVE_CLIENT_SECRET =
    "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" as const;

/**
 * Resolves the Google Drive OAuth configuration.
 *
 * @remarks
 * Environment variable overrides are supported for local development and CI.
 */
export function resolveGoogleDriveOAuthConfig(): GoogleDriveOAuthConfig {
    const envClientId = readProcessEnv("UPTIME_WATCHER_GOOGLE_CLIENT_ID");
    const envClientSecret = readProcessEnv(
        "UPTIME_WATCHER_GOOGLE_CLIENT_SECRET"
    );

    const clientId = envClientId ?? DEFAULT_GOOGLE_DRIVE_CLIENT_ID;

    // Only use the bundled secret for the bundled client id. If someone
    // overrides the client id (custom OAuth app) but doesn't provide a matching
    // secret, we must not send the bundled secret (it would cause
    // invalid_client).
    const clientSecret =
        envClientSecret ??
        (envClientId ? undefined : DEFAULT_GOOGLE_DRIVE_CLIENT_SECRET);

    return {
        clientId,
        clientSecret,
    };
}
