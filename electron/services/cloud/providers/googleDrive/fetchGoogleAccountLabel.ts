import { tryParseGoogleUserInfoResponse } from "./googleOpenIdSchemas";

const GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

// This call is best-effort UI metadata and should never hang indefinitely.
const GOOGLE_USERINFO_TIMEOUT_MS = 5000;

/**
 * Fetches a human-readable account label for the currently authorized Google
 * account.
 *
 * @remarks
 * We use OpenID Connect userinfo to get a stable label for display in the UI.
 * This does **not** change which Drive area we store in (that is controlled by
 * the Drive scopes, notably `drive.appdata`).
 */
export async function fetchGoogleAccountLabel(
    accessToken: string
): Promise<string | undefined> {
    try {
        const response = await fetch(
            GOOGLE_USERINFO_URL,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                signal: AbortSignal.timeout(GOOGLE_USERINFO_TIMEOUT_MS),
            }
        );

        if (!response.ok) {
            return undefined;
        }

        const candidate: unknown = await response.json();

        const parsed = tryParseGoogleUserInfoResponse(candidate);
        const email = parsed?.email?.trim();
        if (email) {
            return email;
        }

        const name = parsed?.name?.trim();
        if (name) {
            return name;
        }

        return undefined;
    } catch {
        return undefined;
    }
}
