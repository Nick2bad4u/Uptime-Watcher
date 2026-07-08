/**
 * Production security headers and CSP utilities.
 */

/**
 * Electron response header bag used by webRequest callbacks.
 */
import type { Arrayable } from "type-fest";

import { arrayJoin } from "ts-extras";

/**
 * Inputs for {@link applyProductionDocumentSecurityHeaders}.
 */
export interface ApplyProductionDocumentSecurityHeadersArgs {
    /** Production CSP header value. */
    productionCsp: string;
    /** Existing headers from Electron (may be undefined). */
    responseHeaders: ElectronResponseHeaders | undefined;
}

export type ElectronResponseHeaders = Record<string, Arrayable<string>>;

const HARDENED_SECURITY_HEADER_NAMES = new Set(
    [
        "Content-Security-Policy",
        "Permissions-Policy",
        "Referrer-Policy",
        "X-Content-Type-Options",
        "X-Frame-Options",
    ].map((headerName) => headerName.toLowerCase())
);

function omitHardenedSecurityHeaders(
    responseHeaders: ElectronResponseHeaders
): ElectronResponseHeaders {
    const retainedHeaders: ElectronResponseHeaders = {};

    for (const [headerName, headerValue] of Object.entries(responseHeaders)) {
        if (HARDENED_SECURITY_HEADER_NAMES.has(headerName.toLowerCase())) {
            continue;
        }

        retainedHeaders[headerName] = headerValue;
    }

    return retainedHeaders;
}

/**
 * Applies strict production security headers to a response header set.
 */
export function applyProductionDocumentSecurityHeaders(
    args: ApplyProductionDocumentSecurityHeadersArgs
): ElectronResponseHeaders {
    const { productionCsp, responseHeaders } = args;

    const hardenedHeaders: ElectronResponseHeaders = {
        "Content-Security-Policy": [productionCsp],
        "Permissions-Policy": [
            "camera=(), microphone=(), geolocation=(), fullscreen=()",
        ],
        "Referrer-Policy": ["no-referrer"],
        "X-Content-Type-Options": ["nosniff"],
        "X-Frame-Options": ["DENY"],
    };

    return responseHeaders
        ? {
              ...omitHardenedSecurityHeaders(responseHeaders),
              ...hardenedHeaders,
          }
        : hardenedHeaders;
}

/**
 * Build the production Content-Security-Policy header value.
 *
 * @remarks
 * Keep this policy intentionally conservative. If a new renderer feature
 * requires expanding it, do so intentionally and with a targeted allow-list.
 */
export function getProductionCspHeaderValue(): string {
    return arrayJoin(
        [
            "default-src 'self'",
            "base-uri 'none'",
            "form-action 'none'",
            "frame-ancestors 'none'",
            "object-src 'none'",
            "script-src 'self'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https://api.microlink.io",
            "font-src 'self' data:",
            "connect-src 'self'",
            "worker-src 'self' blob:",
            "media-src 'self' blob:",
        ],
        "; "
    );
}
