import {
    EXTERNAL_OPEN_HTTPS_REQUIRED_REASON,
    validateExternalOpenUrlCandidateWithPolicy,
} from "../../shell/validatedExternalOpen";

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
 * - Must be a valid external-open URL per
 *   {@link validateExternalOpenUrlCandidateWithPolicy}
 * - Must use `https:`
 *
 * @param args - Provider name and candidate URL.
 */
export function validateOAuthAuthorizeUrl(args: {
    allowedHosts?: readonly string[];
    providerName: string;
    url: string;
}): {
    normalizedUrl: string;
    urlForLog: string;
} {
    const validation = validateExternalOpenUrlCandidateWithPolicy(args.url, {
        requireHttps: true,
    });

    if (!validation.ok) {
        if (validation.reason === EXTERNAL_OPEN_HTTPS_REQUIRED_REASON) {
            throw new Error(
                `Refusing to open unexpected ${args.providerName} OAuth URL: ${validation.safeUrlForLogging}`
            );
        }

        throw new Error(
            `Refusing to open disallowed ${args.providerName} OAuth URL: ${validation.safeUrlForLogging}`
        );
    }

    const allowedHosts = args.allowedHosts?.map((host) => host.toLowerCase());
    if (allowedHosts && allowedHosts.length > 0) {
        const parsed = new URL(validation.normalizedUrl);
        const hostname = parsed.hostname.toLowerCase();

        if (!allowedHosts.includes(hostname)) {
            throw new Error(
                `Refusing to open unexpected ${args.providerName} OAuth URL host: ${validation.safeUrlForLogging}`
            );
        }
    }

    return {
        normalizedUrl: validation.normalizedUrl,
        urlForLog: validation.safeUrlForLogging,
    };
}
