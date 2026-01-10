/**
 * Google Drive OAuth network defaults.
 *
 * @remarks
 * Keep OAuth request timeouts consistent across token exchange, refresh, and
 * revoke calls. These requests should never hang indefinitely.
 */

/**
 * Maximum time to wait for Google OAuth endpoints before failing.
 */
export const GOOGLE_OAUTH_REQUEST_TIMEOUT_MS = 15_000;
