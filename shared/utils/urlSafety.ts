/**
 * URL safety helpers for logging and external requests.
 *
 * @remarks
 * These utilities are intentionally conservative. They are used at trust
 * boundaries where leaking credentials or internal hostnames into logs or third
 * party requests would be a security/privacy issue.
 *
 * @packageDocumentation
 */

import { hasAsciiControlCharacters } from "@shared/utils/stringSafety";
import { getUtfByteLength } from "@shared/utils/utfByteLength";
import validator from "validator";

/** Maximum accepted UTF-8 byte budget for user-supplied external-open URLs. */
const MAX_EXTERNAL_OPEN_URL_BYTES = 4096;

const SAFE_URL_SUSPECT_SEGMENT_MIN_LENGTH = 32;

/** Fallback placeholder when a user-supplied URL cannot be safely represented in
logs. */
const FALLBACK_SAFE_URL_FOR_LOGGING = "[redacted]";

/**
 * Result of validating and normalizing a URL intended for external opening.
 *
 * @remarks
 * `safeUrlForLogging` is always present, allowing callers to log failures
 * without additional guards.
 */
export type ExternalOpenUrlRejectedResult = Readonly<{
    ok: false;
    /**
     * A short message fragment starting with "must" suitable for prefixing with
     * a field name (e.g. "url").
     */
    reason: string;
    /** A redacted representation safe for logs and user-facing errors. */
    safeUrlForLogging: string;
}>;

/** Accepted result from {@link validateExternalOpenUrlCandidate}. */
export type ExternalOpenUrlAcceptedResult = Readonly<{
    /** A normalized URL safe to pass to Electron's `shell.openExternal()`. */
    normalizedUrl: string;
    ok: true;
    /** A redacted representation safe for logs and user-facing errors. */
    safeUrlForLogging: string;
}>;

/** Discriminated union result from {@link validateExternalOpenUrlCandidate}. */
export type ExternalOpenUrlValidationResult =
    | ExternalOpenUrlAcceptedResult
    | ExternalOpenUrlRejectedResult;

function getRedactedPathname(pathname: string): string {
    return pathname
        .split("/")
        .map((segment) =>
            segment.length >= SAFE_URL_SUSPECT_SEGMENT_MIN_LENGTH
                ? "[redacted]"
                : segment
        )
        .join("/");
}

/**
 * Removes sensitive URL parts so log lines don't leak credentials or tokens.
 *
 * @remarks
 * - Strips username/password.
 * - Strips query string and hash.
 * - Leaves scheme/host/path for diagnostics.
 */
export function getSafeUrlForLogging(rawUrl: string): string {
    if (typeof rawUrl !== "string" || rawUrl.length === 0) {
        return "";
    }

    try {
        const url = new URL(rawUrl);
        url.username = "";
        url.password = "";
        url.search = "";
        url.hash = "";

        // For non-hierarchical schemes (e.g., mailto:, file:), WHATWG URL
        // reports origin as the string "null".
        if (url.origin === "null") {
            return `${url.protocol}[redacted]`;
        }

        // Remove query strings and hashes to avoid logging secrets.
        // Additionally, redact suspiciously-long path segments (tokens, IDs).
        const safePath = getRedactedPathname(url.pathname);

        return `${url.origin}${safePath}`;
    } catch {
        return "[unparseable-url]";
    }
}

type HttpUrlNormalizationResult =
    | ExternalOpenUrlAcceptedResult
    | ExternalOpenUrlRejectedResult;

function getFirstQueryOrHashIndex(url: string): number {
    const queryIndex = url.indexOf("?");
    const hashIndex = url.indexOf("#");

    if (queryIndex === -1) {
        return hashIndex;
    }

    if (hashIndex === -1) {
        return queryIndex;
    }

    return Math.min(queryIndex, hashIndex);
}

function hasSpaceBeforeQueryOrHash(url: string): boolean {
    const delimiterIndex = getFirstQueryOrHashIndex(url);
    const prefix = delimiterIndex === -1 ? url : url.slice(0, delimiterIndex);
    return prefix.includes(" ");
}

function isValidHttpUrlWithValidator(url: string): boolean {
    return validator.isURL(url, {
        allow_protocol_relative_urls: false,
        disallow_auth: true,
        protocols: ["http", "https"],
        require_host: true,
        require_protocol: true,
        // Allow localhost-style hosts. We intentionally do *not* block
        // private-network hosts for external opening.
        require_tld: false,
    });
}

function tryNormalizeHttpUrlViaWhatwg(url: string): null | string {
    try {
        return new URL(url).toString();
    } catch {
        return null;
    }
}

function normalizeHttpUrlForExternalOpen(args: {
    safeUrlForLogging: string;
    url: string;
}): HttpUrlNormalizationResult {
    if (isValidHttpUrlWithValidator(args.url)) {
        return {
            normalizedUrl: args.url,
            ok: true,
            safeUrlForLogging: getSafeUrlForLogging(args.url),
        };
    }

    // Keep a strict stance on path whitespace: if spaces appear before the
    // query/hash delimiter, treat it as invalid rather than "fixing" it.
    // This preserves our existing security posture and UX.
    if (hasSpaceBeforeQueryOrHash(args.url)) {
        return {
            ok: false,
            reason: "must be a valid http(s) URL",
            safeUrlForLogging: args.safeUrlForLogging,
        };
    }

    const normalizedViaWhatwg = tryNormalizeHttpUrlViaWhatwg(args.url);
    if (!normalizedViaWhatwg) {
        return {
            ok: false,
            reason: "must be a valid http(s) URL",
            safeUrlForLogging: args.safeUrlForLogging,
        };
    }

    // Encoding (e.g. spaces -> %20) can grow the URL slightly; enforce the
    // byte budget on the normalized representation.
    if (getUtfByteLength(normalizedViaWhatwg) > MAX_EXTERNAL_OPEN_URL_BYTES) {
        return {
            ok: false,
            reason: `must not exceed ${MAX_EXTERNAL_OPEN_URL_BYTES} bytes`,
            safeUrlForLogging: args.safeUrlForLogging,
        };
    }

    if (!isValidHttpUrlWithValidator(normalizedViaWhatwg)) {
        return {
            ok: false,
            reason: "must be a valid http(s) URL",
            safeUrlForLogging: args.safeUrlForLogging,
        };
    }

    return {
        normalizedUrl: normalizedViaWhatwg,
        ok: true,
        safeUrlForLogging: getSafeUrlForLogging(normalizedViaWhatwg),
    };
}

function toIpvOctets(
    hostname: string
): [number, number, number, number] | null {
    const parts = hostname.split(".");
    if (parts.length !== 4) {
        return null;
    }

    // Guard against cases like "1..1.1" where `Number("")` would become 0.

    if (parts.some((part) => part.length === 0 || !/^\d{1,3}$/u.test(part))) {
        return null;
    }

    const octets = parts.map(Number);
    if (
        octets.some(
            (value) => !Number.isInteger(value) || value < 0 || value > 255
        )
    ) {
        return null;
    }

    const [
        a,
        b,
        c,
        d,
    ] = octets;
    if (
        a === undefined ||
        b === undefined ||
        c === undefined ||
        d === undefined
    ) {
        return null;
    }

    return [
        a,
        b,
        c,
        d,
    ];
}

function isPrivateIpvFourOctets(
    octets: readonly [number, number, number, number]
): boolean {
    const [a, b] = octets;

    // 10.0.0.0/8
    if (a === 10) {
        return true;
    }

    // 127.0.0.0/8 loopback
    if (a === 127) {
        return true;
    }

    // 169.254.0.0/16 link-local
    if (a === 169 && b === 254) {
        return true;
    }

    // 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) {
        return true;
    }

    // 192.168.0.0/16
    if (a === 192 && b === 168) {
        return true;
    }

    // 100.64.0.0/10 (CGNAT)
    if (a === 100 && b >= 64 && b <= 127) {
        return true;
    }

    return false;
}

/**
 * Returns true when a URL is safe to open via `shell.openExternal`.
 *
 * @remarks
 * Intentionally strict:
 *
 * - Allows only `http:`, `https:`, and `mailto:`.
 * - Rejects credentials (username/password).
 * - Rejects CR/LF characters to prevent URL injection tricks.
 *
 * This should be used on both sides of IPC (renderer + main) as defense in
 * depth.
 */
export function isAllowedExternalOpenUrl(rawUrl: string): boolean {
    if (rawUrl.length === 0) {
        return false;
    }

    if (getUtfByteLength(rawUrl) > MAX_EXTERNAL_OPEN_URL_BYTES) {
        return false;
    }

    // Reject ASCII control characters (including NUL) defensively.
    if (hasAsciiControlCharacters(rawUrl)) {
        return false;
    }

    if (/[\n\r]/u.test(rawUrl)) {
        return false;
    }

    const parsed = ((): null | URL => {
        try {
            return new URL(rawUrl);
        } catch {
            return null;
        }
    })();

    if (!parsed) {
        return false;
    }

    if (parsed.username.length > 0 || parsed.password.length > 0) {
        return false;
    }

    switch (parsed.protocol) {
        case "http:":
        case "https:": {
            return parsed.hostname.length > 0;
        }
        case "mailto:": {
            return parsed.pathname.length > 0;
        }
        default: {
            return false;
        }
    }
}

/**
 * Validates and normalizes a URL intended to be opened via
 * `shell.openExternal`.
 *
 * @remarks
 * This helper is used at multiple trust boundaries (renderer input, IPC
 * validators, and main-process handlers). Keeping the policy here prevents
 * subtle inconsistencies (e.g. allowing `mailto:` in one layer but rejecting it
 * in another).
 */
export function validateExternalOpenUrlCandidate(
    rawUrl: unknown
): ExternalOpenUrlValidationResult {
    let safeUrlForLogging = FALLBACK_SAFE_URL_FOR_LOGGING;

    if (typeof rawUrl !== "string") {
        return {
            ok: false,
            reason: "must be a string",
            safeUrlForLogging,
        };
    }

    let normalizedUrl = rawUrl.trim();

    if (
        normalizedUrl.length > 0 &&
        getUtfByteLength(normalizedUrl) <= MAX_EXTERNAL_OPEN_URL_BYTES &&
        !/[\n\r]/u.test(normalizedUrl) &&
        !hasAsciiControlCharacters(normalizedUrl)
    ) {
        safeUrlForLogging = getSafeUrlForLogging(normalizedUrl);
    }

    if (normalizedUrl.length === 0) {
        return {
            ok: false,
            reason: "must be a non-empty string",
            safeUrlForLogging,
        };
    }

    if (getUtfByteLength(normalizedUrl) > MAX_EXTERNAL_OPEN_URL_BYTES) {
        return {
            ok: false,
            reason: `must not exceed ${MAX_EXTERNAL_OPEN_URL_BYTES} bytes`,
            safeUrlForLogging,
        };
    }

    if (/[\n\r]/u.test(normalizedUrl)) {
        return {
            ok: false,
            reason: "must not contain newlines",
            safeUrlForLogging,
        };
    }

    if (hasAsciiControlCharacters(normalizedUrl)) {
        return {
            ok: false,
            reason: "must not contain control characters",
            safeUrlForLogging,
        };
    }

    if (!isAllowedExternalOpenUrl(normalizedUrl)) {
        return {
            ok: false,
            reason: "must be an http(s) or mailto URL",
            safeUrlForLogging,
        };
    }

    const normalizedUrlLower = normalizedUrl.toLowerCase();

    // For hierarchical URLs, enforce the stricter validator.js checks.
    if (
        normalizedUrlLower.startsWith("http:") ||
        normalizedUrlLower.startsWith("https:")
    ) {
        const normalizedHttpUrl = normalizeHttpUrlForExternalOpen({
            safeUrlForLogging,
            url: normalizedUrl,
        });

        if (!normalizedHttpUrl.ok) {
            return normalizedHttpUrl;
        }

        const { normalizedUrl: normalizedHttpUrlString } = normalizedHttpUrl;
        normalizedUrl = normalizedHttpUrlString;
    }

    if (normalizedUrlLower.startsWith("mailto:")) {
        const mailtoUrl = new URL(normalizedUrl);
        const email = mailtoUrl.pathname;
        if (!validator.isEmail(email)) {
            return {
                ok: false,
                reason: "mailto URL must include a valid email address",
                safeUrlForLogging,
            };
        }
    }

    return {
        normalizedUrl,
        ok: true,
        // Ensure logging uses a canonical representation (query/hash stripped).
        safeUrlForLogging: getSafeUrlForLogging(normalizedUrl),
    };
}

function parseIpvSixHextet(value: string): null | number {
    if (!/^[\da-f]{1,4}$/iu.test(value)) {
        return null;
    }

    const parsed = Number.parseInt(value, 16);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 0xff_ff) {
        return null;
    }

    return parsed;
}

function isPrivateIpv4(hostname: string): boolean {
    const octets = toIpvOctets(hostname);
    if (!octets) {
        return false;
    }

    return isPrivateIpvFourOctets(octets);
}

function parseIpvFourFromMappedIpvSix(
    mappedHostname: string
): [number, number, number, number] | null {
    if (mappedHostname.includes(".")) {
        return toIpvOctets(mappedHostname);
    }

    const parts = mappedHostname.split(":");
    if (parts.length !== 2) {
        return null;
    }

    const [highPart, lowPart] = parts;
    if (highPart === undefined || lowPart === undefined) {
        return null;
    }

    const high = parseIpvSixHextet(highPart);
    const low = parseIpvSixHextet(lowPart);

    if (high === null || low === null) {
        return null;
    }

    const first = Math.floor(high / 256);
    const second = high % 256;
    const third = Math.floor(low / 256);
    const fourth = low % 256;

    return [
        first,
        second,
        third,
        fourth,
    ];
}

function isPrivateIpv6(hostname: string): boolean {
    const normalized = hostname.toLowerCase();

    if (normalized === "::1") {
        return true;
    }

    if (normalized === "::") {
        return true;
    }

    // Link-local fe80::/10 (fe80..febf)

    if (/^fe[89ab]/u.test(normalized)) {
        return true;
    }

    // Unique local addresses fc00::/7 (fc.. or fd..)
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) {
        return true;
    }

    // IPv4-mapped IPv6 ::ffff:192.168.0.1
    if (normalized.startsWith("::ffff:")) {
        const mapped = normalized.slice("::ffff:".length);
        const octets = parseIpvFourFromMappedIpvSix(mapped);
        return octets ? isPrivateIpvFourOctets(octets) : false;
    }

    return false;
}

/**
 * Returns true when the hostname is considered private/local.
 *
 * @remarks
 * Used to prevent sending internal URLs to third-party services.
 */
export function isPrivateNetworkHostname(hostname: string): boolean {
    const normalized = hostname.trim().toLowerCase();
    const withoutTrailingDot = normalized.endsWith(".")
        ? normalized.slice(0, -1)
        : normalized;

    if (withoutTrailingDot.length === 0) {
        return true;
    }

    // RFC 6761 reserves `localhost` and `*.localhost`.
    if (
        withoutTrailingDot === "localhost" ||
        withoutTrailingDot.endsWith(".localhost")
    ) {
        return true;
    }

    // RFC 6762 reserves `.local` for mDNS.
    if (withoutTrailingDot.endsWith(".local")) {
        return true;
    }

    // Single-label hostnames are overwhelmingly internal/intranet identifiers.
    // We treat them as private to avoid leaking local hostnames to third-party
    // services.
    if (
        !withoutTrailingDot.includes(".") &&
        !withoutTrailingDot.includes(":")
    ) {
        return true;
    }

    if (isPrivateIpv4(withoutTrailingDot)) {
        return true;
    }

    if (withoutTrailingDot.includes(":")) {
        return isPrivateIpv6(withoutTrailingDot);
    }

    return false;
}

/**
 * Returns a sanitized HTTP(S) URL safe to send to third-party services.
 *
 * @remarks
 * This is stricter than {@link getSafeUrlForLogging} because the output must be
 * a _valid_ URL that a third-party can request.
 *
 * - Allows only `http:` and `https:`.
 * - Rejects credentials.
 * - Rejects CR/LF and ASCII control characters.
 * - Rejects private/local hostnames (see {@link isPrivateNetworkHostname}).
 * - Strips query string and hash.
 * - Redacts suspiciously-long path segments to reduce secret leakage.
 *
 * @param rawUrl - Untrusted URL candidate.
 *
 * @returns A safe URL string, or null when the input should not be sent.
 */
export function tryGetSafeThirdPartyHttpUrl(rawUrl: string): null | string {
    if (typeof rawUrl !== "string") {
        return null;
    }

    const normalized = rawUrl.trim();
    if (normalized.length === 0) {
        return null;
    }

    if (getUtfByteLength(normalized) > MAX_EXTERNAL_OPEN_URL_BYTES) {
        return null;
    }

    if (/[\n\r]/u.test(normalized)) {
        return null;
    }

    if (hasAsciiControlCharacters(normalized)) {
        return null;
    }

    const parsed = ((): null | URL => {
        try {
            return new URL(normalized);
        } catch {
            return null;
        }
    })();

    if (!parsed) {
        return null;
    }

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        return null;
    }

    if (parsed.username.length > 0 || parsed.password.length > 0) {
        return null;
    }

    if (parsed.hostname.length === 0) {
        return null;
    }

    if (isPrivateNetworkHostname(parsed.hostname)) {
        return null;
    }

    parsed.search = "";
    parsed.hash = "";

    const safePath = getRedactedPathname(parsed.pathname);
    return `${parsed.origin}${safePath}`;
}
