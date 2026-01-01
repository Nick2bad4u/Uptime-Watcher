import { validateExternalOpenUrlCandidate } from "@shared/utils/urlSafety";

/**
 * Validates an OAuth authorization URL before opening it via
 * `shell.openExternal`.
 *
 * @remarks
 * OAuth authorization URLs are rendered in the user's external browser, not
 * inside the Electron renderer. Even so, the URL is derived from an external
 * provider SDK and must be treated as untrusted input.
 *
 * This helper centralizes validation so Dropbox/Google/etc cannot drift in what
 * they accept.
 *
 * Policy:
 *
 * - Must be a valid external-open URL per {@link validateExternalOpenUrlCandidate}
 * - Must use `https:`
 *
 * @param args - Provider name and candidate URL.
 */
export function validateOAuthAuthorizeUrl(args: {
    providerName: string;
    url: string;
}): {
    normalizedUrl: string;
    urlForLog: string;
} {
    const validation = validateExternalOpenUrlCandidate(args.url);

    if ("reason" in validation) {
        throw new Error(
            `Refusing to open disallowed ${args.providerName} OAuth URL: ${validation.safeUrlForLogging}`
        );
    }

    const parsed = new URL(validation.normalizedUrl);

    if (parsed.protocol !== "https:") {
        throw new Error(
            `Refusing to open unexpected ${args.providerName} OAuth URL: ${validation.safeUrlForLogging}`
        );
    }

    return {
        normalizedUrl: validation.normalizedUrl,
        urlForLog: validation.safeUrlForLogging,
    };
}
