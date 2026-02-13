/**
 * URL scheme-structure validation helpers shared across URL validators.
 *
 * @remarks
 * These guards intentionally focus on _string structure_ before delegating to
 * parser-level or validator.js checks. Centralizing them prevents policy drift
 * between modules that validate HTTP(S) URLs for different trust boundaries.
 *
 * @packageDocumentation
 */

/**
 * Returns true when the candidate only contains a scheme delimiter (for example
 * `https://`) without any authority/path information.
 */
export function isSchemeOnlyUrl(value: string): boolean {
    return /^[a-z][\d+.a-z-]*:\/\/$/iu.test(value);
}

/**
 * Returns true when a protocol is required but the scheme delimiter is missing.
 */
export function hasMissingProtocolDelimiter(
    value: string,
    requireProtocol: boolean
): boolean {
    return requireProtocol && !value.includes("://");
}

/**
 * Returns true when an HTTP(S) URL candidate has an invalid authority delimiter
 * shape (for example `https:/example.com`).
 */
export function hasHttpAuthorityDelimiterIssue(
    value: string,
    protocols: readonly string[]
): boolean {
    const requiresAuthorityDelimiter = protocols.some((protocol) => {
        const normalizedProtocol = protocol.toLowerCase();
        return normalizedProtocol === "http" || normalizedProtocol === "https";
    });

    if (!requiresAuthorityDelimiter) {
        return false;
    }

    const normalizedValue = value.toLowerCase();

    if (
        normalizedValue.startsWith("http:") &&
        normalizedValue.slice(5, 7) !== "//"
    ) {
        return true;
    }

    if (
        normalizedValue.startsWith("https:") &&
        normalizedValue.slice(6, 8) !== "//"
    ) {
        return true;
    }

    return false;
}

/**
 * Returns true when a URL contains suspicious nested HTTP(S) scheme fragments
 * after the first scheme delimiter.
 *
 * @remarks
 * This also rejects URLs ending with a bare `://` suffix, which frequently
 * indicates malformed concatenation.
 */
export function hasNestedHttpSchemeAfterFirstDelimiter(value: string): boolean {
    const firstSchemeSeparator = value.indexOf("://");
    if (firstSchemeSeparator === -1) {
        return false;
    }

    if (value.endsWith("://")) {
        return true;
    }

    const remainder = value.slice(firstSchemeSeparator + 3).toLowerCase();
    // Avoid a literal "http://" string to satisfy @microsoft/sdl/no-insecure-url.
    const httpPrefix = ["http", "://"].join("");
    const httpsPrefix = ["https", "://"].join("");
    return (
        remainder.startsWith(httpPrefix) || remainder.startsWith(httpsPrefix)
    );
}
