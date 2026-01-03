import { describe, expect, it } from "vitest";

import {
    extractLogContext,
    normalizeLogValue,
    withLogContext,
} from "../../utils/loggingContext";

describe("logging context helpers", () => {
    it("extracts structured context and hashes identifiers", () => {
        const contextArg = withLogContext({
            channel: "diagnostics",
            siteIdentifier: "site-123",
        });
        const extraPayload = { foo: "bar" };
        const { context, remaining } = extractLogContext(
            [contextArg, extraPayload],
            "info"
        );

        expect(context).toBeDefined();
        expect(context?.correlationId).toHaveLength(16);
        expect(context?.siteHash).toMatch(/^[a-f0-9]{8}$/u);
        expect(remaining).toEqual([extraPayload]);
    });

    it("redacts bearer tokens and URL secrets", () => {
        const sanitized = normalizeLogValue(
            "https://user:pass@example.com?token=abc&Bearer secret"
        );
        expect(typeof sanitized).toBe("string");
        const sanitizedString = sanitized as string;
        expect(sanitizedString).not.toContain("pass");
        expect(sanitizedString).not.toContain("token=abc");
        expect(sanitizedString).not.toMatch(/bearer\s+secret/i);
    });

    it("redacts secret query params even when string is not a URL", () => {
        const sanitized = normalizeLogValue(
            "GET https://example.com/callback?access_token=abc&refresh_token=def"
        );

        expect(typeof sanitized).toBe("string");
        const sanitizedString = sanitized as string;
        expect(sanitizedString).not.toContain("access_token=abc");
        expect(sanitizedString).not.toContain("refresh_token=def");
        expect(sanitizedString).toContain("access_token=[redacted]");
        expect(sanitizedString).toContain("refresh_token=[redacted]");
    });

    it("redacts secrets in object metadata fields", () => {
        const input = {
            access_token: "abc",
            accessToken: "def",
            refresh_token: "ghi",
            clientSecret: "jkl",
            nested: {
                Authorization: "Bearer should-not-leak",
                password: "p@ssw0rd",
            },
        };

        const sanitized = normalizeLogValue(input);
        expect(sanitized).toEqual({
            access_token: "[redacted]",
            accessToken: "[redacted]",
            refresh_token: "[redacted]",
            clientSecret: "[redacted]",
            nested: {
                Authorization: "[redacted]",
                password: "[redacted]",
            },
        });
    });
});
