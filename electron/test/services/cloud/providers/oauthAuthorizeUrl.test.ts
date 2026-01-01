import { describe, expect, it } from "vitest";

import { validateOAuthAuthorizeUrl } from "@electron/services/cloud/providers/oauthAuthorizeUrl";

describe("validateOAuthAuthorizeUrl()", () => {
    it("accepts https URLs", () => {
        expect(
            validateOAuthAuthorizeUrl({
                providerName: "Test",
                url: "https://example.com/oauth?x=1",
            })
        ).toEqual({
            normalizedUrl: "https://example.com/oauth?x=1",
            // UrlForLog is intentionally redacted (query/hash stripped)
            // to avoid leaking tokens.
            urlForLog: "https://example.com/oauth",
        });
    });

    it("rejects http URLs", () => {
        expect(() =>
            validateOAuthAuthorizeUrl({
                providerName: "Test",
                url: "http://example.com/oauth?x=1",
            })
        ).toThrowError(/unexpected.*OAuth URL/iu);
    });

    it("rejects non-https schemes (mailto)", () => {
        expect(() =>
            validateOAuthAuthorizeUrl({
                providerName: "Test",
                url: "mailto:test@example.com",
            })
        ).toThrowError(/unexpected.*OAuth URL/iu);
    });

    it("rejects disallowed schemes (file)", () => {
        expect(() =>
            validateOAuthAuthorizeUrl({
                providerName: "Test",
                url: "file:///C:/Windows/System32",
            })
        ).toThrowError(/disallowed.*OAuth URL/iu);
    });

    it("rejects credential-bearing URLs", () => {
        expect(() =>
            validateOAuthAuthorizeUrl({
                providerName: "Test",
                url: "https://user:pass@example.com/oauth",
            })
        ).toThrowError(/disallowed.*OAuth URL/iu);
    });
});
