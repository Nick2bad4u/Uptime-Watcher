import { describe, expect, it, vi } from "vitest";

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
        expect(context?.siteHash).toMatch(/^[0-9a-f]{8}$/v);
        expect(remaining).toEqual([extraPayload]);
    });

    it("requires an own data marker when extracting structured context", () => {
        const inherited = Object.create(
            withLogContext({ channel: "inherited" })
        ) as unknown;
        const extraPayload = { foo: "bar" };

        const { context, remaining } = extractLogContext(
            [inherited, extraPayload],
            "info"
        );

        expect(context).toBeUndefined();
        expect(remaining).toEqual([inherited, extraPayload]);
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

    it("redacts colon-separated secrets in free-form log strings", () => {
        const sanitized = normalizeLogValue(
            "OAuth failed: access_token: abc123, refresh_token : def456; tokenizer: safe"
        );

        expect(typeof sanitized).toBe("string");
        const sanitizedString = sanitized as string;
        expect(sanitizedString).not.toContain("abc123");
        expect(sanitizedString).not.toContain("def456");
        expect(sanitizedString).toContain("access_token: [redacted]");
        expect(sanitizedString).toContain("refresh_token : [redacted]");
        expect(sanitizedString).toContain("tokenizer: safe");
    });

    it("preserves common colon-separated diagnostic labels", () => {
        const sanitized = normalizeLogValue(
            "Request failed: state: failed, code: ENOENT, auth: denied"
        );

        expect(sanitized).toBe(
            "Request failed: state: failed, code: ENOENT, auth: denied"
        );
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

    it("does not invoke accessors while normalizing object metadata", () => {
        let getterCalls = 0;
        const input = {
            stable: "value",
        };

        Object.defineProperty(input, "token", {
            enumerable: true,
            get() {
                getterCalls += 1;
                return "SECRET";
            },
        });

        const sanitized = normalizeLogValue(input);

        expect(sanitized).toEqual({
            stable: "value",
        });
        expect(getterCalls).toBe(0);
    });

    it("does not invoke array map overrides or item accessors", () => {
        let getterCalls = 0;
        const map = vi.fn(() => {
            throw new Error("array map should not run");
        });
        const input: unknown[] = ["visible"];
        Object.defineProperty(input, "map", {
            configurable: true,
            value: map,
        });
        Object.defineProperty(input, "1", {
            configurable: true,
            enumerable: true,
            get() {
                getterCalls += 1;
                return "hidden";
            },
        });
        input[2] = {
            token: "SECRET",
            value: "safe",
        };

        const sanitized = normalizeLogValue(input);

        expect(Array.isArray(sanitized)).toBeTruthy();
        const sanitizedArray = sanitized as unknown[];
        expect(sanitizedArray).toHaveLength(3);
        expect(sanitizedArray[0]).toBe("visible");
        expect(Object.hasOwn(sanitizedArray, "1")).toBeFalsy();
        expect(sanitizedArray[2]).toEqual({
            token: "[redacted]",
            value: "safe",
        });
        expect(map).not.toHaveBeenCalled();
        expect(getterCalls).toBe(0);
    });

    it("normalizes object metadata into prototype-free records", () => {
        const input = {
            stable: "value",
        };
        Object.defineProperty(input, "__proto__", {
            configurable: true,
            enumerable: true,
            value: "metadata-value",
        });

        const sanitized = normalizeLogValue(input);

        expect(typeof sanitized).toBe("object");
        expect(sanitized).not.toBeNull();

        const sanitizedRecord = sanitized as Record<string, unknown>;
        expect(Object.getPrototypeOf(sanitizedRecord)).toBeNull();
        expect(Object.hasOwn(sanitizedRecord, "__proto__")).toBeTruthy();
        expect(Reflect.get(sanitizedRecord, "__proto__")).toBe(
            "metadata-value"
        );
        expect(Object.hasOwn({}, "__proto__")).toBeFalsy();
    });

    it("handles circular references safely", () => {
        const input: Record<string, unknown> = {
            name: "root",
        };

        input["self"] = input;
        input["nested"] = { parent: input };

        expect(() => normalizeLogValue(input)).not.toThrow();

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

    it("does not invoke Error cause accessors while normalizing errors", () => {
        let getterCalls = 0;
        const error = new Error("boom");

        Object.defineProperty(error, "cause", {
            enumerable: false,
            get() {
                getterCalls += 1;
                return {
                    token: "SECRET",
                };
            },
        });

        const sanitized = normalizeLogValue(error);

        expect(sanitized).toEqual(
            expect.objectContaining({
                message: "boom",
                name: "Error",
            })
        );
        expect(sanitized).not.toHaveProperty("cause");
        expect(getterCalls).toBe(0);
    });

    it("does not invoke Error core field accessors while normalizing errors", () => {
        let getterCalls = 0;
        const error = new Error("fallback");

        for (const key of [
            "message",
            "name",
            "stack",
        ] as const) {
            Object.defineProperty(error, key, {
                configurable: true,
                enumerable: key === "message",
                get() {
                    getterCalls += 1;
                    return `accessor ${key}`;
                },
            });
        }

        const sanitized = normalizeLogValue(error);

        expect(sanitized).toEqual({
            message: "",
        });
        expect(getterCalls).toBe(0);
    });

    it("serializes Date values instead of dropping them", () => {
        const date = new Date("2025-01-02T03:04:05.000Z");
        expect(normalizeLogValue(date)).toBe("2025-01-02T03:04:05.000Z");
    });

    it("does not invoke shadowed Date methods while serializing dates", () => {
        const date = new Date("2025-01-02T03:04:05.000Z");
        const getTime = vi.fn(() => {
            throw new Error("date getTime should not run");
        });
        const toISOString = vi.fn(() => {
            throw new Error("date toISOString should not run");
        });

        Object.defineProperty(date, "getTime", {
            configurable: true,
            value: getTime,
        });
        Object.defineProperty(date, "toISOString", {
            configurable: true,
            value: toISOString,
        });

        expect(normalizeLogValue(date)).toBe("2025-01-02T03:04:05.000Z");
        expect(getTime).not.toHaveBeenCalled();
        expect(toISOString).not.toHaveBeenCalled();
    });

    it("serializes invalid Date values without throwing", () => {
        const invalidDate = new Date(Number.NaN);

        expect(() =>
            normalizeLogValue({ checkedAt: invalidDate })
        ).not.toThrow();
        expect(normalizeLogValue({ checkedAt: invalidDate })).toEqual({
            checkedAt: "[Invalid Date]",
        });
    });

    it("serializes URL values and redacts secrets", () => {
        const url = new URL("https://user:pass@example.com?token=abc");
        const sanitized = normalizeLogValue(url);
        expect(sanitized).toBeTypeOf("string");
        expect(String(sanitized)).not.toContain("pass");
        expect(String(sanitized)).not.toContain("token=abc");
        expect(String(sanitized)).toContain("token=[redacted]");
    });

    it("does not invoke shadowed URL toString while serializing URLs", () => {
        const url = new URL("https://example.com/callback?token=abc");
        const toString = vi.fn(() => {
            throw new Error("url toString should not run");
        });
        Object.defineProperty(url, "toString", {
            configurable: true,
            value: toString,
        });

        const sanitized = normalizeLogValue(url);

        expect(sanitized).toBe("https://example.com/callback?token=[redacted]");
        expect(toString).not.toHaveBeenCalled();
    });

    it("does not invoke patched URL prototype toString while masking string URLs", () => {
        const originalToString = Object.getOwnPropertyDescriptor(
            URL.prototype,
            "toString"
        );
        const toString = vi.fn(() => {
            throw new Error("URL prototype toString should not run");
        });
        Object.defineProperty(URL.prototype, "toString", {
            configurable: true,
            value: toString,
        });

        try {
            expect(
                normalizeLogValue(
                    "https://user:pass@example.com/callback?token=abc"
                )
            ).toBe(
                "https://%5Bredacted%5D:%5Bredacted%5D@example.com/callback?token=[redacted]"
            );
            expect(toString).not.toHaveBeenCalled();
        } finally {
            if (originalToString) {
                Object.defineProperty(
                    URL.prototype,
                    "toString",
                    originalToString
                );
            }
        }
    });

    it("serializes ArrayBuffer metadata to a summary", () => {
        const buffer = new ArrayBuffer(12);
        expect(normalizeLogValue(buffer)).toEqual({
            byteLength: 12,
            type: "ArrayBuffer",
        });
    });

    it("does not invoke shadowed ArrayBuffer byteLength accessors", () => {
        const buffer = new ArrayBuffer(12);
        const byteLength = vi.fn(() => {
            throw new Error("array buffer byteLength should not run");
        });
        Object.defineProperty(buffer, "byteLength", {
            configurable: true,
            get: byteLength,
        });

        expect(normalizeLogValue(buffer)).toEqual({
            byteLength: 12,
            type: "ArrayBuffer",
        });
        expect(byteLength).not.toHaveBeenCalled();
    });

    it("does not treat ArrayBuffer prototype impostors as native buffers", () => {
        const impostor = Object.create(ArrayBuffer.prototype) as ArrayBuffer;

        expect(impostor).toBeInstanceOf(ArrayBuffer);
        expect(() => normalizeLogValue(impostor)).not.toThrow();

        const sanitized = normalizeLogValue(impostor);
        expect(sanitized).not.toEqual({
            byteLength: expect.any(Number),
            type: "ArrayBuffer",
        });
    });

    it("serializes Map and Set metadata to summaries", () => {
        expect(normalizeLogValue(new Map([["key", "value"]]))).toEqual({
            size: 1,
            type: "Map",
        });
        expect(normalizeLogValue(new Set(["value"]))).toEqual({
            size: 1,
            type: "Set",
        });
    });

    it("does not invoke shadowed Map or Set size accessors", () => {
        const map = new Map([["key", "value"]]);
        const set = new Set(["value"]);
        const mapSize = vi.fn(() => {
            throw new Error("map size should not run");
        });
        const setSize = vi.fn(() => {
            throw new Error("set size should not run");
        });
        Object.defineProperty(map, "size", {
            configurable: true,
            get: mapSize,
        });
        Object.defineProperty(set, "size", {
            configurable: true,
            get: setSize,
        });

        expect(normalizeLogValue(map)).toEqual({
            size: 1,
            type: "Map",
        });
        expect(normalizeLogValue(set)).toEqual({
            size: 1,
            type: "Set",
        });
        expect(mapSize).not.toHaveBeenCalled();
        expect(setSize).not.toHaveBeenCalled();
    });

    it("does not treat Map or Set prototype impostors as native collections", () => {
        const mapImpostor = Object.create(Map.prototype) as Map<
            unknown,
            unknown
        >;
        const setImpostor = Object.create(Set.prototype) as Set<unknown>;

        expect(mapImpostor).toBeInstanceOf(Map);
        expect(setImpostor).toBeInstanceOf(Set);
        expect(() => normalizeLogValue(mapImpostor)).not.toThrow();
        expect(() => normalizeLogValue(setImpostor)).not.toThrow();

        expect(normalizeLogValue(mapImpostor)).not.toEqual({
            size: expect.any(Number),
            type: "Map",
        });
        expect(normalizeLogValue(setImpostor)).not.toEqual({
            size: expect.any(Number),
            type: "Set",
        });
    });
});
