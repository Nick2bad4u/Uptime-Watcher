import { describe, expect, it } from "vitest";

import {
    hasHttpAuthorityDelimiterIssue,
    hasMissingProtocolDelimiter,
    hasNestedHttpSchemeAfterFirstDelimiter,
    isSchemeOnlyUrl,
} from "@shared/utils/urlSchemeValidation";

describe("urlSchemeValidation", () => {
    describe(isSchemeOnlyUrl, () => {
        it("returns true for scheme-only values", () => {
            expect(isSchemeOnlyUrl("http://")).toBeTruthy();
            expect(isSchemeOnlyUrl("HTTPS://")).toBeTruthy();
        });

        it("returns false when authority/path exists", () => {
            expect(isSchemeOnlyUrl("https://example.com")).toBeFalsy();
        });
    });

    describe(hasMissingProtocolDelimiter, () => {
        it("flags values missing :// when protocol is required", () => {
            expect(
                hasMissingProtocolDelimiter("https:example.com", true)
            ).toBeTruthy();
        });

        it("allows missing delimiter when protocol is not required", () => {
            expect(
                hasMissingProtocolDelimiter("example.com/path", false)
            ).toBeFalsy();
        });
    });

    describe(hasHttpAuthorityDelimiterIssue, () => {
        it("detects malformed HTTP(S) authority delimiters", () => {
            expect(
                hasHttpAuthorityDelimiterIssue("http:/example.com", ["http"])
            ).toBeTruthy();
            expect(
                hasHttpAuthorityDelimiterIssue("https:/example.com", ["https"])
            ).toBeTruthy();
        });

        it("does not enforce authority delimiters for non-http protocols", () => {
            expect(
                hasHttpAuthorityDelimiterIssue("ws:/example.com", ["ws"])
            ).toBeFalsy();
        });
    });

    describe(hasNestedHttpSchemeAfterFirstDelimiter, () => {
        it("detects nested scheme fragments", () => {
            expect(
                hasNestedHttpSchemeAfterFirstDelimiter("https://http://foo")
            ).toBeTruthy();
            expect(
                hasNestedHttpSchemeAfterFirstDelimiter("http://https://bar/baz")
            ).toBeTruthy();
        });

        it("detects bare scheme delimiter suffixes", () => {
            expect(
                hasNestedHttpSchemeAfterFirstDelimiter("https://example.com://")
            ).toBeTruthy();
        });

        it("returns false for normal URLs", () => {
            expect(
                hasNestedHttpSchemeAfterFirstDelimiter(
                    "https://example.com/path"
                )
            ).toBeFalsy();
        });
    });
});
