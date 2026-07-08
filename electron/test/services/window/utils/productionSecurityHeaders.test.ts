import { describe, expect, it } from "vitest";

import {
    applyProductionDocumentSecurityHeaders,
    getProductionCspHeaderValue,
    type ElectronResponseHeaders,
} from "../../../../services/window/utils/productionSecurityHeaders";

describe("productionSecurityHeaders", () => {
    it("applies strict production document security headers", () => {
        const productionCsp = getProductionCspHeaderValue();

        expect(
            applyProductionDocumentSecurityHeaders({
                productionCsp,
                responseHeaders: undefined,
            })
        ).toEqual({
            "Content-Security-Policy": [productionCsp],
            "Permissions-Policy": [
                "camera=(), microphone=(), geolocation=(), fullscreen=()",
            ],
            "Referrer-Policy": ["no-referrer"],
            "X-Content-Type-Options": ["nosniff"],
            "X-Frame-Options": ["DENY"],
        });
    });

    it("replaces existing hardened headers case-insensitively", () => {
        const productionCsp = getProductionCspHeaderValue();
        const responseHeaders: ElectronResponseHeaders = {
            "cache-control": ["max-age=60"],
            "content-security-policy": ["default-src *"],
            "Permissions-Policy": ["camera=*"],
            "REFERRER-POLICY": ["unsafe-url"],
            "x-content-type-options": ["none"],
            "x-frame-options": ["SAMEORIGIN"],
        };

        expect(
            applyProductionDocumentSecurityHeaders({
                productionCsp,
                responseHeaders,
            })
        ).toEqual({
            "cache-control": ["max-age=60"],
            "Content-Security-Policy": [productionCsp],
            "Permissions-Policy": [
                "camera=(), microphone=(), geolocation=(), fullscreen=()",
            ],
            "Referrer-Policy": ["no-referrer"],
            "X-Content-Type-Options": ["nosniff"],
            "X-Frame-Options": ["DENY"],
        });
    });
});
