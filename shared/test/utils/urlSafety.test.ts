/**
 * Tests for shared URL safety helpers.
 */

import { describe, expect, it } from "vitest";

import {
    getSafeUrlForDisplay,
    getSafeUrlForLogging,
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
            expect(isPrivateNetworkHostname("0.0.0.0")).toBeTruthy();
            expect(isPrivateNetworkHostname("0.1.2.3")).toBeTruthy();
            expect(isPrivateNetworkHostname("10.0.0.1")).toBeTruthy();
            expect(isPrivateNetworkHostname("127.0.0.1")).toBeTruthy();
            expect(isPrivateNetworkHostname("169.254.10.20")).toBeTruthy();
            expect(isPrivateNetworkHostname("172.16.0.1")).toBeTruthy();
            expect(isPrivateNetworkHostname("172.31.255.254")).toBeTruthy();
            expect(isPrivateNetworkHostname("192.168.1.1")).toBeTruthy();
            expect(isPrivateNetworkHostname("100.64.0.1")).toBeTruthy();
        });

        it("detects special-use IPv4 ranges that should not reach third parties", () => {
            expect(isPrivateNetworkHostname("192.0.0.8")).toBeTruthy();
            expect(isPrivateNetworkHostname("192.0.2.10")).toBeTruthy();
            expect(isPrivateNetworkHostname("192.88.99.1")).toBeTruthy();
            expect(isPrivateNetworkHostname("198.18.0.1")).toBeTruthy();
            expect(isPrivateNetworkHostname("198.19.255.254")).toBeTruthy();
            expect(isPrivateNetworkHostname("198.51.100.20")).toBeTruthy();
            expect(isPrivateNetworkHostname("203.0.113.30")).toBeTruthy();
            expect(isPrivateNetworkHostname("224.0.0.1")).toBeTruthy();
            expect(isPrivateNetworkHostname("240.0.0.1")).toBeTruthy();
            expect(isPrivateNetworkHostname("255.255.255.255")).toBeTruthy();
        });

        it("detects private IPv4 ranges in browser-normalized legacy forms", () => {
            expect(isPrivateNetworkHostname("0177.0.0.1")).toBeTruthy();
            expect(isPrivateNetworkHostname("0x7f.0.0.1")).toBeTruthy();
            expect(isPrivateNetworkHostname("127.1")).toBeTruthy();
            expect(isPrivateNetworkHostname("10.1")).toBeTruthy();
            expect(isPrivateNetworkHostname("192.168.1")).toBeTruthy();
            expect(isPrivateNetworkHostname("172.16.1")).toBeTruthy();
        });

        it("detects IPv6 link-local and ULA addresses", () => {
            expect(isPrivateNetworkHostname("::1")).toBeTruthy();
            expect(isPrivateNetworkHostname("[::1]")).toBeTruthy();
            expect(isPrivateNetworkHostname("::")).toBeTruthy();
            expect(isPrivateNetworkHostname("[::]")).toBeTruthy();
            expect(isPrivateNetworkHostname("fe80::1")).toBeTruthy();
            expect(isPrivateNetworkHostname("[fe80::1]")).toBeTruthy();
            expect(isPrivateNetworkHostname("fe90::1")).toBeTruthy();
            expect(isPrivateNetworkHostname("febf::1")).toBeTruthy();
            expect(isPrivateNetworkHostname("fd00::1")).toBeTruthy();
            expect(isPrivateNetworkHostname("[fd00::1]")).toBeTruthy();
            expect(isPrivateNetworkHostname("fc00::1")).toBeTruthy();
        });

        it("detects deprecated IPv6 site-local addresses", () => {
            expect(isPrivateNetworkHostname("fec0::1")).toBeTruthy();
            expect(isPrivateNetworkHostname("[fec0::1]")).toBeTruthy();
            expect(isPrivateNetworkHostname("fedf::1")).toBeTruthy();
            expect(isPrivateNetworkHostname("feff::1")).toBeTruthy();
        });

        it("detects IPv4-mapped IPv6 private addresses (dotted and hex)", () => {
            expect(isPrivateNetworkHostname("::ffff:192.168.0.1")).toBeTruthy();
            expect(
                isPrivateNetworkHostname("[::ffff:192.168.0.1]")
            ).toBeTruthy();
            expect(isPrivateNetworkHostname("::ffff:c0a8:0001")).toBeTruthy();
            expect(isPrivateNetworkHostname("[::ffff:c0a8:0001]")).toBeTruthy();
            expect(isPrivateNetworkHostname("::ffff:c0a8:1")).toBeTruthy();
        });

        it("detects 6to4 hostnames that embed private or special-use IPv4 addresses", () => {
            expect(isPrivateNetworkHostname("2002:0a00:0001::")).toBeTruthy();
            expect(isPrivateNetworkHostname("[2002:0a00:0001::]")).toBeTruthy();
            expect(isPrivateNetworkHostname("2002:c0a8:0101::")).toBeTruthy();
            expect(isPrivateNetworkHostname("2002:7f00:0001::")).toBeTruthy();
            expect(isPrivateNetworkHostname("2002:c000:020a::")).toBeTruthy();
            expect(isPrivateNetworkHostname("2002:0808:0808::")).toBeFalsy();
        });

        it("detects deprecated IPv4-compatible IPv6 private addresses", () => {
            expect(isPrivateNetworkHostname("::192.168.1.1")).toBeTruthy();
            expect(isPrivateNetworkHostname("[::192.168.1.1]")).toBeTruthy();
            expect(isPrivateNetworkHostname("::c0a8:101")).toBeTruthy();
            expect(isPrivateNetworkHostname("[::c0a8:101]")).toBeTruthy();
            expect(isPrivateNetworkHostname("::7f00:1")).toBeTruthy();
            expect(isPrivateNetworkHostname("::808:808")).toBeFalsy();
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
            expect(isPrivateNetworkHostname(" ".repeat(3))).toBeTruthy();
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
                validateExternalOpenUrlCandidate("https://example.com").ok
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

        it("rejects mailto URLs with query or hash parameters", () => {
            expect(
                validateExternalOpenUrlCandidate(
                    "mailto:test@example.com?subject=hello"
                ).ok
            ).toBeFalsy();

            expect(
                validateExternalOpenUrlCandidate(
                    "mailto:test@example.com?subject=Hi%0D%0ABcc:evil@example.com"
                ).ok
            ).toBeFalsy();

            expect(
                validateExternalOpenUrlCandidate("mailto:test@example.com#body")
                    .ok
            ).toBeFalsy();
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
                validateExternalOpenUrlCandidate("https://https://bar/baz").ok
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
            if (!result.ok) {
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
            if (!result.ok) {
                throw new Error(
                    `Expected ok result, got rejection: ${result.reason}`
                );
            }
            expect(result.normalizedUrl).toBe("https://example.com");
        });

        it("rejects non-http(s) protocols", () => {
            expect(
                validateHttpUrlCandidate("mailto:test@example.com").ok
            ).toBeFalsy();
            expect(
                validateHttpUrlCandidate("ftp://example.com/file.txt").ok
            ).toBeFalsy();
        });

        it("rejects HTTP URLs without an explicit protocol", () => {
            expect(validateHttpUrlCandidate("example.com").ok).toBeFalsy();
            expect(validateHttpUrlCandidate("//example.com").ok).toBeFalsy();
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

    describe(getSafeUrlForDisplay, () => {
        it("removes query strings and hashes", () => {
            expect(
                getSafeUrlForDisplay(
                    "https://example.com/path?token=secret#section"
                )
            ).toBe("https://example.com/path");
        });

        it("preserves host-only display without a trailing slash", () => {
            expect(getSafeUrlForDisplay("https://example.com")).toBe(
                "https://example.com"
            );
        });

        it("preserves explicit root paths", () => {
            expect(getSafeUrlForDisplay("https://example.com/")).toBe(
                "https://example.com/"
            );
        });

        it("redacts suspicious long path segments", () => {
            const tokenSegment = "A1".repeat(40);
            expect(
                getSafeUrlForDisplay(
                    `https://example.com/reset/${tokenSegment}`
                )
            ).toBe("https://example.com/reset/[redacted]");
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
            expect(tryGetSafeThirdPartyHttpUrl("http://0.0.0.0")).toBe(null);
            expect(tryGetSafeThirdPartyHttpUrl("https://192.168.1.1")).toBe(
                null
            );
            expect(tryGetSafeThirdPartyHttpUrl("http://[::1]")).toBe(null);
            expect(
                tryGetSafeThirdPartyHttpUrl("https://[::ffff:192.168.1.1]")
            ).toBe(null);
            expect(tryGetSafeThirdPartyHttpUrl("https://[fec0::1]")).toBe(null);
            expect(tryGetSafeThirdPartyHttpUrl("https://[::192.168.1.1]")).toBe(
                null
            );
            expect(tryGetSafeThirdPartyHttpUrl("https://[::c0a8:101]")).toBe(
                null
            );
            expect(
                tryGetSafeThirdPartyHttpUrl("https://[2002:c0a8:0101::]")
            ).toBe(null);
        });

        it("returns null for IPv4 special-use hostnames", () => {
            expect(tryGetSafeThirdPartyHttpUrl("https://192.0.2.10")).toBe(
                null
            );
            expect(tryGetSafeThirdPartyHttpUrl("https://198.18.0.1")).toBe(
                null
            );
            expect(tryGetSafeThirdPartyHttpUrl("https://198.51.100.20")).toBe(
                null
            );
            expect(tryGetSafeThirdPartyHttpUrl("https://203.0.113.30")).toBe(
                null
            );
            expect(tryGetSafeThirdPartyHttpUrl("https://224.0.0.1")).toBe(null);
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
