import { describe, expect, it } from "vitest";

import { buildPayloadPreview } from "@electron/preload/utils/preloadLogger";

describe(buildPayloadPreview, () => {
    it("serializes circular references instead of returning undefined", () => {
        const payload: { a: number; self?: unknown } = { a: 1 };
        payload.self = payload;

        const preview = buildPayloadPreview(payload);
        expect(preview).toBeTypeOf("string");
        expect(preview).toContain("[Circular]");
    });

    it("redacts likely secret fields by key name", () => {
        const payload = {
            accessToken: "Bearer super-secret",
            nested: {
                refreshToken: "refresh-secret",
            },
            ok: 1,
        };

        const preview = buildPayloadPreview(payload);
        expect(preview).toBeTypeOf("string");
        expect(preview).not.toContain("Bearer super-secret");
        expect(preview).not.toContain("refresh-secret");
        expect(preview).toContain("[REDACTED]");
    });

    it("truncates long previews to the specified limit", () => {
        const payload = {
            data: "x".repeat(2000),
        };

        const preview = buildPayloadPreview(payload, 64);
        expect(preview).toBeTypeOf("string");
        expect(preview!.length).toBeLessThanOrEqual(65);
    });

    it("redacts URL query strings", () => {
        const preview = buildPayloadPreview({
            url: "https://example.com/reset?token=super-secret&x=1",
        });

        expect(preview).toBeTypeOf("string");
        expect(preview).toContain("https://example.com/");
        expect(preview).not.toContain("token");
        expect(preview).not.toContain("super-secret");
        expect(preview).not.toContain("?");
    });

    it("redacts mailto addresses", () => {
        const preview = buildPayloadPreview({
            url: "mailto:person@example.com?subject=hi",
        });

        expect(preview).toBeTypeOf("string");
        expect(preview).toContain("mailto:[redacted]");
        expect(preview).not.toContain("person@example.com");
    });
});
