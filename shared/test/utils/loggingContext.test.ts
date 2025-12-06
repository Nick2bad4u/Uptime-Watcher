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
});
