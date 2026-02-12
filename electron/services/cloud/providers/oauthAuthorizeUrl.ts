import {
    EXTERNAL_OPEN_HTTPS_REQUIRED_REASON,
    validateExternalOpenUrlCandidateWithPolicy,
} from "@electron/services/shell/validatedExternalOpen";

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
    providerName: string;
    url: string;
}): {
    normalizedUrl: string;
    urlForLog: string;
} {
    const validation = validateExternalOpenUrlCandidateWithPolicy(args.url, {
        requireHttps: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare -- Literal comparison ensures stable narrowing under strict TS.
    if (validation.ok === false) {
        if (validation.reason === EXTERNAL_OPEN_HTTPS_REQUIRED_REASON) {
            throw new Error(
                `Refusing to open unexpected ${args.providerName} OAuth URL: ${validation.safeUrlForLogging}`
            );
        }

        throw new Error(
            `Refusing to open disallowed ${args.providerName} OAuth URL: ${validation.safeUrlForLogging}`
        );
    }

    return {
        normalizedUrl: validation.normalizedUrl,
        urlForLog: validation.safeUrlForLogging,
    };
}
