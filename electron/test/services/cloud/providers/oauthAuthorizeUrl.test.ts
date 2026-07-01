import { validateOAuthAuthorizeUrl } from "@electron/services/cloud/providers/oauthAuthorizeUrl";
import { describe, expect, it } from "vitest";

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
        const insecureUrl = new URL("https://example.com/oauth?x=1");
        insecureUrl.protocol = "http";

        expect(() =>
            validateOAuthAuthorizeUrl({
                providerName: "Test",
                url: insecureUrl.href,
            })
        ).toThrow(/unexpected.*oauth url/iv);
    });

    it("rejects non-https schemes (mailto)", () => {
        expect(() =>
            validateOAuthAuthorizeUrl({
                providerName: "Test",
                url: "mailto:test@example.com",
            })
        ).toThrow(/unexpected.*oauth url/iv);
    });

    it("rejects disallowed schemes (file)", () => {
        expect(() =>
            validateOAuthAuthorizeUrl({
                providerName: "Test",
                url: "file:///C:/Windows/System32",
            })
        ).toThrow(/disallowed.*oauth url/iv);
    });

    it("rejects credential-bearing URLs", () => {
        expect(() =>
            validateOAuthAuthorizeUrl({
                providerName: "Test",
                url: "https://user:pass@example.com/oauth",
            })
        ).toThrow(/disallowed.*oauth url/iv);
    });
});
