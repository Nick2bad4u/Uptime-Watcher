/**
 * Tests for shared URL safety helpers.
 */

import { describe, expect, it } from "vitest";

import {
    getSafeUrlForLogging,
    isAllowedExternalOpenUrl,
    isPrivateNetworkHostname,
    tryGetSafeThirdPartyHttpUrl,
    validateExternalOpenUrlCandidate,
    validateHttpUrlCandidate,
} from "../../utils/urlSafety";

describe("urlSafety", () => {
    describe(isPrivateNetworkHostname, () => {
        it("treats localhost and subdomains as private", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: urlSafety", "component");
            await annotate("Category: Security", "category");
            await annotate("Type: Privacy", "type");

            expect(isPrivateNetworkHostname("localhost")).toBeTruthy();
            expect(isPrivateNetworkHostname("LOCALHOST")).toBeTruthy();
            expect(isPrivateNetworkHostname("localhost.")).toBeTruthy();
            expect(isPrivateNetworkHostname("foo.localhost")).toBeTruthy();
            expect(isPrivateNetworkHostname("foo.localhost.")).toBeTruthy();
        });

        it("treats .local hostnames as private", () => {
            expect(isPrivateNetworkHostname("printer.local")).toBeTruthy();
            expect(isPrivateNetworkHostname("PRINTER.LOCAL")).toBeTruthy();
            expect(isPrivateNetworkHostname("printer.local.")).toBeTruthy();
        });

        it("treats single-label hostnames as private", () => {
            expect(isPrivateNetworkHostname("intranet")).toBeTruthy();
            expect(isPrivateNetworkHostname("NAS")).toBeTruthy();
        });

        it("detects private IPv4 ranges", () => {
            expect(isPrivateNetworkHostname("10.0.0.1")).toBeTruthy();
            expect(isPrivateNetworkHostname("127.0.0.1")).toBeTruthy();
            expect(isPrivateNetworkHostname("169.254.10.20")).toBeTruthy();
            expect(isPrivateNetworkHostname("172.16.0.1")).toBeTruthy();
            expect(isPrivateNetworkHostname("172.31.255.254")).toBeTruthy();
            expect(isPrivateNetworkHostname("192.168.1.1")).toBeTruthy();
            expect(isPrivateNetworkHostname("100.64.0.1")).toBeTruthy();
        });

        it("detects IPv6 link-local and ULA addresses", () => {
            expect(isPrivateNetworkHostname("::1")).toBeTruthy();
            expect(isPrivateNetworkHostname("::")).toBeTruthy();
            expect(isPrivateNetworkHostname("fe80::1")).toBeTruthy();
            expect(isPrivateNetworkHostname("fe90::1")).toBeTruthy();
            expect(isPrivateNetworkHostname("febf::1")).toBeTruthy();
            expect(isPrivateNetworkHostname("fd00::1")).toBeTruthy();
            expect(isPrivateNetworkHostname("fc00::1")).toBeTruthy();
        });

        it("detects IPv4-mapped IPv6 private addresses (dotted and hex)", () => {
            expect(isPrivateNetworkHostname("::ffff:192.168.0.1")).toBeTruthy();
            expect(isPrivateNetworkHostname("::ffff:c0a8:0001")).toBeTruthy();
            expect(isPrivateNetworkHostname("::ffff:c0a8:1")).toBeTruthy();
        });

        it("returns false for public-looking hostnames", () => {
            expect(isPrivateNetworkHostname("example.com")).toBeFalsy();
            expect(isPrivateNetworkHostname("8.8.8.8")).toBeFalsy();
            expect(
                isPrivateNetworkHostname("2001:4860:4860::8888")
            ).toBeFalsy();
        });

        it("treats empty/whitespace as private", () => {
            expect(isPrivateNetworkHostname("")).toBeTruthy();
            expect(isPrivateNetworkHostname("   ")).toBeTruthy();
        });
    });

    describe(isAllowedExternalOpenUrl, () => {
        it("allows http/https and mailto", () => {
            expect(
                isAllowedExternalOpenUrl("https://example.com")
            ).toBeTruthy();
            expect(
                isAllowedExternalOpenUrl("http://example.com/path?q=1")
            ).toBeTruthy();
            expect(
                isAllowedExternalOpenUrl("mailto:test@example.com")
            ).toBeTruthy();
        });

        it("blocks non-web protocols", () => {
            expect(
                isAllowedExternalOpenUrl("file:///C:/Windows/System32")
            ).toBeFalsy();
            const scriptUrl = [
                "java",
                "script:",
                "alert(1)",
            ].join("");
            expect(isAllowedExternalOpenUrl(scriptUrl)).toBeFalsy();
            expect(
                isAllowedExternalOpenUrl(
                    "data:text/html;base64,PGgxPkhlbGxvPC9oMT4="
                )
            ).toBeFalsy();
            expect(isAllowedExternalOpenUrl("about:blank")).toBeFalsy();
        });

        it("blocks URLs with credentials", () => {
            expect(
                isAllowedExternalOpenUrl("https://user:pass@example.com")
            ).toBeFalsy();
            expect(
                isAllowedExternalOpenUrl("http://user@example.com")
            ).toBeFalsy();
        });

        it("blocks URLs containing CR/LF", () => {
            expect(
                isAllowedExternalOpenUrl("https://example.com\nInjected")
            ).toBeFalsy();
            expect(
                isAllowedExternalOpenUrl("https://example.com\rInjected")
            ).toBeFalsy();
        });
    });

    describe(validateExternalOpenUrlCandidate, () => {
        it("accepts https and mailto", () => {
            expect(
                validateExternalOpenUrlCandidate("https://example.com").ok
            ).toBeTruthy();
            expect(
                validateExternalOpenUrlCandidate("mailto:test@example.com").ok
            ).toBeTruthy();

            // Scheme checks should be case-insensitive.
            expect(
                validateExternalOpenUrlCandidate("HTTP://example.com").ok
            ).toBeTruthy();
            expect(
                validateExternalOpenUrlCandidate("MAILTO:test@example.com").ok
            ).toBeTruthy();
        });

        it("rejects uppercase mailto when email is invalid", () => {
            const result = validateExternalOpenUrlCandidate(
                "MAILTO:not-an-email"
            );
            expect(result.ok).toBeFalsy();
        });

        it("rejects javascript/file URLs", () => {
            expect(
                validateExternalOpenUrlCandidate("file:///C:/Windows/System32")
                    .ok
            ).toBeFalsy();

            expect(
                // eslint-disable-next-line no-script-url -- Intentional unit test coverage for script URL rejection.
                validateExternalOpenUrlCandidate("javascript:alert(1)").ok
            ).toBeFalsy();
        });

        it("rejects http(s) URLs containing credentials", () => {
            const result = validateExternalOpenUrlCandidate(
                "https://user:pass@example.com"
            );
            expect(result.ok).toBeFalsy();
        });

        it("rejects URLs containing CR/LF", () => {
            const result = validateExternalOpenUrlCandidate(
                "https://example.com\nInjected"
            );
            expect(result.ok).toBeFalsy();
        });

        it("rejects URLs containing ASCII control characters", () => {
            const result = validateExternalOpenUrlCandidate(
                "https://example.com/\0oops"
            );
            expect(result.ok).toBeFalsy();
        });

        it("rejects URLs ending with a bare scheme delimiter", () => {
            const result = validateExternalOpenUrlCandidate(
                "https://example.com://"
            );
            expect(result.ok).toBeFalsy();
        });

        it("rejects URLs containing nested http(s) scheme fragments", () => {
            expect(
                validateExternalOpenUrlCandidate("https://http://foo").ok
            ).toBeFalsy();
            expect(
                validateExternalOpenUrlCandidate("http://https://bar/baz").ok
            ).toBeFalsy();
        });

        it("rejects overly long URLs", () => {
            const url = `https://example.com/${"a".repeat(6000)}`;
            const result = validateExternalOpenUrlCandidate(url);
            expect(result.ok).toBeFalsy();
        });

        it("normalizes URLs with unescaped spaces (Dropbox OAuth scope)", () => {
            // Dropbox's SDK currently generates an OAuth authorize URL where
            // the `scope` query parameter is space-delimited without
            // percent-encoding. Browsers are typically lenient, but our safety
            // helpers should normalize it to a canonical URL.
            const rawDropboxAuthorizeUrl =
                "https://dropbox.com/oauth2/authorize?response_type=code&client_id=app-key&redirect_uri=http://localhost:53682/oauth2/callback&state=STATE&token_access_type=offline&scope=account_info.read files.content.read files.content.write files.metadata.read";

            const result = validateExternalOpenUrlCandidate(
                rawDropboxAuthorizeUrl
            );

            expect(result.ok).toBeTruthy();
            if (result.ok === false) {
                throw new Error(
                    `Expected ok result, got rejection: ${result.reason}`
                );
            }

            // Ensure the spaces in the scope param were encoded.
            expect(result.normalizedUrl).toContain(
                "scope=account_info.read%20files.content.read%20files.content.write%20files.metadata.read"
            );

            // Query is stripped for logs.
            expect(result.safeUrlForLogging).toBe(
                "https://dropbox.com/oauth2/authorize"
            );
        });
    });

    describe(validateHttpUrlCandidate, () => {
        it("accepts http(s) URLs and trims whitespace", () => {
            const result = validateHttpUrlCandidate("  https://example.com  ");
            expect(result.ok).toBeTruthy();
            if (result.ok === false) {
                throw new Error(
                    `Expected ok result, got rejection: ${result.reason}`
                );
            }
            expect(result.normalizedUrl).toBe("https://example.com");
        });

        it("rejects non-http(s) protocols", () => {
            const result = validateHttpUrlCandidate("mailto:test@example.com");
            expect(result.ok).toBeFalsy();
        });

        it("rejects http(s) URLs containing CR/LF", () => {
            const result = validateHttpUrlCandidate(
                "https://example.com\nInjected"
            );
            expect(result.ok).toBeFalsy();
        });

        it("rejects http(s) URLs containing ASCII control characters", () => {
            const result = validateHttpUrlCandidate(
                "https://example.com/\0oops"
            );
            expect(result.ok).toBeFalsy();
        });

        it("honors a custom byte budget", () => {
            const result = validateHttpUrlCandidate("https://example.com", {
                maxBytes: 10,
            });
            expect(result.ok).toBeFalsy();
            if ("reason" in result) {
                expect(result.reason).toContain("must not exceed");
                return;
            }

            throw new Error("Expected rejection");
        });
    });

    describe(getSafeUrlForLogging, () => {
        it("removes query strings and hashes", () => {
            expect(
                getSafeUrlForLogging(
                    "https://example.com/path?token=secret#section"
                )
            ).toBe("https://example.com/path");
        });

        it("redacts suspicious long path segments", () => {
            const tokenSegment = "A1".repeat(40);
            const result = getSafeUrlForLogging(
                `https://example.com/reset/${tokenSegment}`
            );

            expect(result).toBe("https://example.com/reset/[redacted]");
        });

        it("does not redact short normal paths", () => {
            expect(
                getSafeUrlForLogging("https://example.com/docs/index.html")
            ).toBe("https://example.com/docs/index.html");
        });

        it("redacts mailto addresses", () => {
            expect(
                getSafeUrlForLogging("mailto:person@example.com?subject=hi")
            ).toBe("mailto:[redacted]");
        });

        it("redacts file paths", () => {
            expect(
                getSafeUrlForLogging("file:///C:/Users/Nick/Secrets.txt")
            ).toBe("file:[redacted]");
        });
    });

    describe(tryGetSafeThirdPartyHttpUrl, () => {
        it("returns null for non-http(s) URLs", () => {
            expect(tryGetSafeThirdPartyHttpUrl("mailto:test@example.com")).toBe(
                null
            );
            expect(tryGetSafeThirdPartyHttpUrl("file:///C:/Windows")).toBe(
                null
            );
        });

        it("returns null for private/local hostnames", () => {
            expect(tryGetSafeThirdPartyHttpUrl("http://localhost")).toBe(null);
            expect(tryGetSafeThirdPartyHttpUrl("https://192.168.1.1")).toBe(
                null
            );
        });

        it("returns null for URLs with credentials", () => {
            expect(
                tryGetSafeThirdPartyHttpUrl("https://user:pass@example.com")
            ).toBe(null);
        });

        it("strips query strings and hashes", () => {
            expect(
                tryGetSafeThirdPartyHttpUrl(
                    "https://example.com/path?token=secret#section"
                )
            ).toBe("https://example.com/path");
        });

        it("redacts suspicious long path segments", () => {
            const tokenSegment = "A1".repeat(40);
            const result = tryGetSafeThirdPartyHttpUrl(
                `https://example.com/reset/${tokenSegment}`
            );

            expect(result).toBe("https://example.com/reset/[redacted]");
        });
    });
});
