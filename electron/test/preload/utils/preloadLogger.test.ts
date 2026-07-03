import { buildPayloadPreview } from "@electron/preload/utils/preloadLogger";
import { describe, expect, it } from "vitest";

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

    it("serializes invalid Date values without dropping the whole preview", () => {
        const preview = buildPayloadPreview({
            checkedAt: new Date(Number.NaN),
            ok: true,
        });

        expect(preview).toBeTypeOf("string");
        expect(preview).toContain("[Invalid Date]");
        expect(preview).toContain('"ok": true');
        expect(preview).not.toContain("[unserializable-payload]");
    });

    it("redacts mailto addresses", () => {
        const preview = buildPayloadPreview({
            url: "mailto:person@example.com?subject=hi",
        });

        expect(preview).toBeTypeOf("string");
        expect(preview).toContain("mailto:[redacted]");
        expect(preview).not.toContain("person@example.com");
    });

    it("redacts secrets embedded in raw string payloads", () => {
        const preview = buildPayloadPreview(
            "Authorization: Bearer super-secret refresh_token=refresh-secret"
        );

        expect(preview).toBeTypeOf("string");
        expect(preview).not.toContain("super-secret");
        expect(preview).not.toContain("refresh-secret");
        expect(preview).toContain("[redacted]");
    });

    it("redacts secrets embedded in nested non-sensitive string fields", () => {
        const preview = buildPayloadPreview({
            message:
                "callback failed access_token=access-secret refresh_token=refresh-secret",
        });

        expect(preview).toBeTypeOf("string");
        expect(preview).not.toContain("access-secret");
        expect(preview).not.toContain("refresh-secret");
        expect(preview).toContain("access_token=[redacted]");
        expect(preview).toContain("refresh_token=[redacted]");
    });

    it("redacts sensitive Map values by key name", () => {
        const preview = buildPayloadPreview(
            new Map<string, string>([
                ["refreshToken", "refresh-secret"],
                ["visible", "ordinary-value"],
            ])
        );

        expect(preview).toBeTypeOf("string");
        expect(preview).not.toContain("refresh-secret");
        expect(preview).toContain("[REDACTED]");
        expect(preview).toContain("ordinary-value");
    });

    it("does not invoke object accessors while building previews", () => {
        let getterCalls = 0;
        const payload = {
            safe: "visible",
        };
        Object.defineProperty(payload, "computed", {
            enumerable: true,
            get: () => {
                getterCalls += 1;
                return "secret-from-getter";
            },
        });
        Object.defineProperty(payload, "accessToken", {
            enumerable: true,
            get: () => {
                getterCalls += 1;
                return "secret-token";
            },
        });

        const preview = buildPayloadPreview(payload);

        expect(preview).toBeTypeOf("string");
        expect(preview).toContain("[Accessor]");
        expect(preview).toContain("[REDACTED]");
        expect(preview).not.toContain("secret-from-getter");
        expect(preview).not.toContain("secret-token");
        expect(getterCalls).toBe(0);
    });

    it("does not invoke Error cause accessors while building previews", () => {
        let getterCalls = 0;
        const error = new Error("failed");
        Object.defineProperty(error, "cause", {
            enumerable: true,
            get: () => {
                getterCalls += 1;
                return new Error("nested");
            },
        });

        const preview = buildPayloadPreview({ error });

        expect(preview).toBeTypeOf("string");
        expect(preview).toContain("failed");
        expect(preview).not.toContain("nested");
        expect(getterCalls).toBe(0);
    });

    it("does not invoke Error message, name, or stack accessors while building previews", () => {
        let getterCalls = 0;
        const error = new Error("safe");

        for (const key of [
            "message",
            "name",
            "stack",
        ] as const) {
            Object.defineProperty(error, key, {
                configurable: true,
                enumerable: true,
                get: () => {
                    getterCalls += 1;
                    return `secret-${key}`;
                },
            });
        }

        const preview = buildPayloadPreview({ error });

        expect(preview).toBeTypeOf("string");
        expect(preview).toContain('"message": ""');
        expect(preview).not.toContain("secret-message");
        expect(preview).not.toContain("secret-name");
        expect(preview).not.toContain("secret-stack");
        expect(getterCalls).toBe(0);
    });
});
