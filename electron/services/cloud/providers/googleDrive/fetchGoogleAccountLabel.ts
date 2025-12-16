import { safePropertyAccess } from "@shared/utils/typeHelpers";

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
            "https://openidconnect.googleapis.com/v1/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            return undefined;
        }

        const json: unknown = await response.json();

        const email = safePropertyAccess(json, "email");
        if (typeof email === "string" && email.length > 0) {
            return email;
        }

        const name = safePropertyAccess(json, "name");
        if (typeof name === "string" && name.length > 0) {
            return name;
        }

        return undefined;
    } catch {
        return undefined;
    }
}
