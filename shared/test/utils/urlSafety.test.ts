/**
 * Tests for shared URL safety helpers.
 */

import { describe, expect, it } from "vitest";

import { isPrivateNetworkHostname } from "../../utils/urlSafety";

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
});
