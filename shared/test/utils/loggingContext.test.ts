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

    it("handles circular references safely", () => {
        const input: Record<string, unknown> = {
            name: "root",
        };

        input["self"] = input;
        input["nested"] = { parent: input };

        expect(() => normalizeLogValue(input)).not.toThrowError();

        const sanitized = normalizeLogValue(input);
        expect(sanitized).toEqual({
            name: "root",
            nested: {
                parent: "[Circular]",
            },
            self: "[Circular]",
        });
    });

    it("preserves Error details in metadata", () => {
        const error = new Error(
            "Request failed: https://example.com?access_token=abc"
        );
        error.name = "NetworkError";
        (error as Error & { cause?: unknown }).cause = {
            Authorization: "Bearer secret",
        };

        const sanitized = normalizeLogValue(error);
        expect(sanitized).toEqual(
            expect.objectContaining({
                name: "NetworkError",
                message: expect.stringContaining("access_token=[redacted]"),
                cause: {
                    Authorization: "[redacted]",
                },
            })
        );
    });

    it("serializes Date values instead of dropping them", () => {
        const date = new Date("2025-01-02T03:04:05.000Z");
        expect(normalizeLogValue(date)).toBe("2025-01-02T03:04:05.000Z");
    });

    it("serializes URL values and redacts secrets", () => {
        const url = new URL("https://user:pass@example.com?token=abc");
        const sanitized = normalizeLogValue(url);
        expect(sanitized).toBeTypeOf("string");
        expect(String(sanitized)).not.toContain("pass");
        expect(String(sanitized)).not.toContain("token=abc");
        expect(String(sanitized)).toContain("token=[redacted]");
    });

    it("serializes ArrayBuffer metadata to a summary", () => {
        const buffer = new ArrayBuffer(12);
        expect(normalizeLogValue(buffer)).toEqual({
            byteLength: 12,
            type: "ArrayBuffer",
        });
    });
});
