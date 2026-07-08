import { buildPayloadPreview } from "@electron/preload/utils/preloadLogger";
import { describe, expect, it, vi } from "vitest";

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

    it("does not invoke shadowed Date methods while building previews", () => {
        const checkedAt = new Date("2026-07-07T12:00:00.000Z");
        const getTime = vi.fn(() => {
            throw new Error("date getTime should not run");
        });
        const toISOString = vi.fn(() => {
            throw new Error("date toISOString should not run");
        });
        Object.defineProperty(checkedAt, "getTime", {
            configurable: true,
            value: getTime,
        });
        Object.defineProperty(checkedAt, "toISOString", {
            configurable: true,
            value: toISOString,
        });

        const preview = buildPayloadPreview({ checkedAt });

        expect(preview).toBeTypeOf("string");
        expect(preview).toContain("2026-07-07T12:00:00.000Z");
        expect(getTime).not.toHaveBeenCalled();
        expect(toISOString).not.toHaveBeenCalled();
    });

    it("does not invoke patched Date prototype methods while building previews", () => {
        const checkedAt = new Date("2026-07-07T12:00:00.000Z");
        const getTime = vi.spyOn(Date.prototype, "getTime");
        const toISOString = vi.spyOn(Date.prototype, "toISOString");
        getTime.mockImplementation(() => {
            throw new Error("Date prototype getTime should not run");
        });
        toISOString.mockImplementation(() => {
            throw new Error("Date prototype toISOString should not run");
        });

        try {
            const preview = buildPayloadPreview({ checkedAt });

            expect(preview).toBeTypeOf("string");
            expect(preview).toContain("2026-07-07T12:00:00.000Z");
            expect(getTime).not.toHaveBeenCalled();
            expect(toISOString).not.toHaveBeenCalled();
        } finally {
            getTime.mockRestore();
            toISOString.mockRestore();
        }
    });

    it("redacts mailto addresses", () => {
        const preview = buildPayloadPreview({
            url: "mailto:person@example.com?subject=hi",
        });

        expect(preview).toBeTypeOf("string");
        expect(preview).toContain("mailto:[redacted]");
        expect(preview).not.toContain("person@example.com");
    });

    it("does not invoke shadowed URL toString while building previews", () => {
        const url = new URL("https://example.com/reset?token=secret");
        const toString = vi.fn(() => {
            throw new Error("url toString should not run");
        });
        Object.defineProperty(url, "toString", {
            configurable: true,
            value: toString,
        });

        const preview = buildPayloadPreview({ url });

        expect(preview).toBeTypeOf("string");
        expect(preview).toContain("https://example.com/");
        expect(preview).not.toContain("secret");
        expect(toString).not.toHaveBeenCalled();
    });

    it("does not invoke patched URL prototype toString while building previews", () => {
        const url = new URL("https://example.com/reset?token=secret");
        const toString = vi.spyOn(URL.prototype, "toString");
        toString.mockImplementation(() => {
            throw new Error("URL prototype toString should not run");
        });

        try {
            const preview = buildPayloadPreview({ url });

            expect(preview).toBeTypeOf("string");
            expect(preview).toContain("https://example.com/");
            expect(preview).not.toContain("secret");
            expect(toString).not.toHaveBeenCalled();
        } finally {
            toString.mockRestore();
        }
    });

    it("does not invoke BigInt prototype toString while building previews", () => {
        const bigintToStringSpy = vi
            .spyOn(BigInt.prototype, "toString")
            .mockImplementation(() => {
                throw new Error("BigInt.prototype.toString called");
            });

        try {
            const preview = buildPayloadPreview({ count: 123n });

            expect(preview).toBeTypeOf("string");
            expect(preview).toContain('"count": "123"');
            expect(bigintToStringSpy).not.toHaveBeenCalled();
        } finally {
            bigintToStringSpy.mockRestore();
        }
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

    it("does not invoke shadowed array methods or item accessors", () => {
        let getterCalls = 0;
        const map = vi.fn(() => {
            throw new Error("array map should not run");
        });
        const payload: unknown[] = ["visible"];
        Object.defineProperty(payload, "map", {
            configurable: true,
            value: map,
        });
        Object.defineProperty(payload, "1", {
            configurable: true,
            enumerable: true,
            get() {
                getterCalls += 1;
                return "hidden";
            },
        });
        payload[2] = {
            token: "SECRET",
            value: "safe",
        };

        const preview = buildPayloadPreview(payload);

        expect(preview).toBeTypeOf("string");
        expect(preview).toContain("visible");
        expect(preview).toContain("[REDACTED]");
        expect(preview).toContain("safe");
        expect(preview).not.toContain("hidden");
        expect(preview).not.toContain("SECRET");
        expect(map).not.toHaveBeenCalled();
        expect(getterCalls).toBe(0);
    });

    it("does not invoke shadowed Map iterator or size accessors", () => {
        const iterator = vi.fn(() => {
            throw new Error("map iterator should not run");
        });
        let sizeGetterCalls = 0;
        const payload = new Map<string, string>([
            ["refreshToken", "refresh-secret"],
            ["visible", "ordinary-value"],
        ]);
        Object.defineProperty(payload, Symbol.iterator, {
            configurable: true,
            value: iterator,
        });
        Object.defineProperty(payload, "size", {
            configurable: true,
            get() {
                sizeGetterCalls += 1;
                return 999;
            },
        });

        const preview = buildPayloadPreview(payload);

        expect(preview).toBeTypeOf("string");
        expect(preview).toContain('"size": 2');
        expect(preview).toContain("[REDACTED]");
        expect(preview).toContain("ordinary-value");
        expect(preview).not.toContain("refresh-secret");
        expect(iterator).not.toHaveBeenCalled();
        expect(sizeGetterCalls).toBe(0);
    });

    it("does not invoke patched Map prototype size accessors", () => {
        const size = vi.spyOn(Map.prototype, "size", "get");
        size.mockImplementation(() => {
            throw new Error("Map prototype size should not run");
        });

        try {
            const preview = buildPayloadPreview(
                new Map<string, string>([
                    ["refreshToken", "refresh-secret"],
                    ["visible", "ordinary-value"],
                ])
            );

            expect(preview).toBeTypeOf("string");
            expect(preview).toContain('"size": 2');
            expect(preview).toContain("[REDACTED]");
            expect(preview).toContain("ordinary-value");
            expect(preview).not.toContain("refresh-secret");
            expect(size).not.toHaveBeenCalled();
        } finally {
            size.mockRestore();
        }
    });

    it("does not invoke patched Map prototype entries while building previews", () => {
        const entries = vi.spyOn(Map.prototype, "entries");
        entries.mockImplementation(() => {
            throw new Error("Map prototype entries should not run");
        });

        try {
            const preview = buildPayloadPreview(
                new Map<string, string>([
                    ["refreshToken", "refresh-secret"],
                    ["visible", "ordinary-value"],
                ])
            );

            expect(preview).toBeTypeOf("string");
            expect(preview).toContain('"size": 2');
            expect(preview).toContain("[REDACTED]");
            expect(preview).toContain("ordinary-value");
            expect(preview).not.toContain("refresh-secret");
            expect(entries).not.toHaveBeenCalled();
        } finally {
            entries.mockRestore();
        }
    });

    it("does not invoke shadowed Set iterator or size accessors", () => {
        const iterator = vi.fn(() => {
            throw new Error("set iterator should not run");
        });
        let sizeGetterCalls = 0;
        const payload = new Set(["first", "second"]);
        Object.defineProperty(payload, Symbol.iterator, {
            configurable: true,
            value: iterator,
        });
        Object.defineProperty(payload, "size", {
            configurable: true,
            get() {
                sizeGetterCalls += 1;
                return 999;
            },
        });

        const preview = buildPayloadPreview(payload);

        expect(preview).toBeTypeOf("string");
        expect(preview).toContain('"size": 2');
        expect(preview).toContain("first");
        expect(preview).toContain("second");
        expect(iterator).not.toHaveBeenCalled();
        expect(sizeGetterCalls).toBe(0);
    });

    it("does not invoke patched Set prototype size accessors", () => {
        const size = vi.spyOn(Set.prototype, "size", "get");
        size.mockImplementation(() => {
            throw new Error("Set prototype size should not run");
        });

        try {
            const preview = buildPayloadPreview(new Set(["first", "second"]));

            expect(preview).toBeTypeOf("string");
            expect(preview).toContain('"size": 2');
            expect(preview).toContain("first");
            expect(preview).toContain("second");
            expect(size).not.toHaveBeenCalled();
        } finally {
            size.mockRestore();
        }
    });

    it("does not invoke patched Set prototype values while building previews", () => {
        const values = vi.spyOn(Set.prototype, "values");
        values.mockImplementation(() => {
            throw new Error("Set prototype values should not run");
        });

        try {
            const preview = buildPayloadPreview(new Set(["first", "second"]));

            expect(preview).toBeTypeOf("string");
            expect(preview).toContain('"size": 2');
            expect(preview).toContain("first");
            expect(preview).toContain("second");
            expect(values).not.toHaveBeenCalled();
        } finally {
            values.mockRestore();
        }
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

    it("preserves protected object keys as preview data", () => {
        const payload = {
            safe: "visible",
        };
        Object.defineProperty(payload, "__proto__", {
            configurable: true,
            enumerable: true,
            value: "proto-value",
            writable: true,
        });

        const preview = buildPayloadPreview(payload);

        expect(preview).toBeTypeOf("string");
        expect(preview).toContain('"__proto__": "proto-value"');
        expect(preview).toContain('"safe": "visible"');
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
