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
            return `${url.protocol}${url.pathname}`;
        }

        return `${url.origin}${url.pathname}`;
    } catch {
        return "[unparseable-url]";
    }
}

function toIpvOctets(
    hostname: string
): [number, number, number, number] | null {
    const parts = hostname.split(".");
    if (parts.length !== 4) {
        return null;
    }

    // Guard against cases like "1..1.1" where `Number("")` would become 0.
    // eslint-disable-next-line regexp/require-unicode-sets-regexp -- The `v` flag is not consistently supported across our TypeScript/Electron toolchain; `u` is sufficient for this ASCII-only numeric check.
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

    // eslint-disable-next-line regexp/require-unicode-sets-regexp -- The `v` flag is not consistently supported across our TypeScript/Electron toolchain; `u` is sufficient for this ASCII-only CR/LF check.
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

function parseIpvSixHextet(value: string): null | number {
    // eslint-disable-next-line regexp/require-unicode-sets-regexp -- The `v` flag is not consistently supported across our TypeScript/Electron toolchain; `u` is sufficient for this ASCII-only hex check.
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

    return [first, second, third, fourth];
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
    // eslint-disable-next-line regexp/require-unicode-sets-regexp -- The `v` flag is not consistently supported across our TypeScript/Electron toolchain; `u` is sufficient for this ASCII-only prefix check.
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
    if (!withoutTrailingDot.includes(".") && !withoutTrailingDot.includes(":")) {
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
