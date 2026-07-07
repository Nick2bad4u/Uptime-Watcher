import type { JsonValue } from "type-fest";

import {
    safeJsonParse,
    safeJsonParseArray,
    safeJsonParseValue,
    safeJsonParseWithFallback,
    safeJsonStringify,
    safeJsonStringifyWithFallback,
    tryParseJsonRecord,
} from "@shared/utils/jsonSafety";
import { describe, expect, it, vi } from "vitest";

import {
    acceptAnyJsonValue,
    unsafeJsonifiable,
} from "../helpers/jsonTestHelpers";

const isMonitorJsonValue = (value: unknown): value is JsonValue => {
    if (
        !acceptAnyJsonValue(value) ||
        typeof value !== "object" ||
        value === null
    ) {
        return false;
    }
    const record = value as Record<string, JsonValue | undefined>;
    return (
        typeof record["id"] === "string" &&
        typeof record["name"] === "string" &&
        typeof record["enabled"] === "boolean"
    );
};

describe("jsonSafety behavior", () => {
    describe(safeJsonStringify, () => {
        it("stringifies valid data", () => {
            const payload = {
                id: "mon_1",
                url: "https://example.com",
                intervalMs: 30_000,
            } satisfies Record<string, JsonValue | undefined>;

            const result = safeJsonStringify(payload);
            expect(result.success).toBeTruthy();
            expect(JSON.parse(result.data!)).toEqual(payload);
        });

        it("reports serialization errors", () => {
            const result = safeJsonStringify(
                unsafeJsonifiable({ handler: () => null })
            );
            expect(result.success).toBeFalsy();
            expect(result.error).toContain("JSON serialization failed");
        });

        it("rejects objects with mixed unsupported values instead of dropping fields", () => {
            const result = safeJsonStringify(
                unsafeJsonifiable({
                    enabled: true,
                    handler: () => null,
                })
            );

            expect(result.success).toBeFalsy();
            expect(result.error).toContain("JSON serialization failed");
        });

        it("rejects accessor-backed properties without invoking getters", () => {
            const getter = vi.fn(() => "secret");
            const payload = { enabled: true };

            Object.defineProperty(payload, "token", {
                enumerable: true,
                get: getter,
            });

            const result = safeJsonStringify(unsafeJsonifiable(payload));

            expect(result.success).toBeFalsy();
            expect(result.error).toContain("JSON serialization failed");
            expect(getter).not.toHaveBeenCalled();
        });

        it("rejects enumerable symbol keys instead of silently omitting them", () => {
            const symbolKey = Symbol("secret");
            const payload = {
                enabled: true,
                [symbolKey]: "hidden",
            };

            const result = safeJsonStringify(unsafeJsonifiable(payload));

            expect(result.success).toBeFalsy();
            expect(result.error).toContain("JSON serialization failed");
        });
    });

    describe(safeJsonParse, () => {
        it("parses monitor payloads when validator passes", () => {
            const payload = {
                id: "mon_1",
                name: "Example",
                enabled: true,
            };
            const encoded = JSON.stringify(payload);
            const result = safeJsonParse(encoded, isMonitorJsonValue);
            expect(result.success).toBeTruthy();
            expect(result.data).toEqual(payload);
        });

        it("returns parsed records with null prototypes and data-backed dangerous keys", () => {
            const result = safeJsonParse(
                '{"__proto__":{"polluted":true},"constructor":{"name":"evil"},"nested":{"prototype":"data"}}',
                acceptAnyJsonValue
            );

            expect(result.success).toBeTruthy();
            expect(Object.getPrototypeOf(result.data)).toBeNull();
            expect(
                Object.getOwnPropertyDescriptor(result.data, "__proto__")
            ).toMatchObject({
                enumerable: true,
                value: { polluted: true },
            });

            const nested = (result.data as Record<string, unknown>)["nested"];
            expect(Object.getPrototypeOf(nested)).toBeNull();
        });

        it("returns detailed errors when JSON is invalid", () => {
            const result = safeJsonParse("{invalid", acceptAnyJsonValue);
            expect(result.success).toBeFalsy();
            expect(result.error).toContain("JSON parsing failed");
        });
    });

    describe(safeJsonParseValue, () => {
        it("parses any JSON value without a domain validator", () => {
            const result = safeJsonParseValue(
                '{"__proto__":{"polluted":true},"items":[{"constructor":"data"}]}'
            );

            expect(result.success).toBeTruthy();
            expect(Object.getPrototypeOf(result.data)).toBeNull();
            expect(
                Object.getOwnPropertyDescriptor(result.data, "__proto__")
            ).toMatchObject({
                enumerable: true,
                value: { polluted: true },
            });

            const items = (result.data as Record<string, unknown>)["items"];
            expect(Array.isArray(items)).toBeTruthy();
            expect(Object.getPrototypeOf((items as unknown[])[0])).toBeNull();
        });

        it("returns detailed errors when JSON is invalid", () => {
            const result = safeJsonParseValue("{invalid");

            expect(result.success).toBeFalsy();
            expect(result.error).toContain("JSON parsing failed");
        });
    });

    describe(safeJsonParseArray, () => {
        it("validates arrays of monitors", () => {
            const payload = [
                { id: "mon_1", name: "Primary", enabled: true },
                { id: "mon_2", name: "Backup", enabled: false },
            ];
            const result = safeJsonParseArray(
                JSON.stringify(payload),
                (entry): entry is JsonValue => isMonitorJsonValue(entry)
            );
            expect(result.success).toBeTruthy();
            expect(result.data).toEqual(payload);
        });

        it("normalizes object entries without changing the top-level array", () => {
            const result = safeJsonParseArray(
                '[{"__proto__":{"polluted":true}}]',
                acceptAnyJsonValue
            );

            expect(result.success).toBeTruthy();
            expect(Array.isArray(result.data)).toBeTruthy();
            expect(Object.getPrototypeOf(result.data![0])).toBeNull();
            expect(
                Object.getOwnPropertyDescriptor(result.data![0], "__proto__")
            ).toMatchObject({
                enumerable: true,
                value: { polluted: true },
            });
        });

        it("fails gracefully when payload is not an array", () => {
            const result = safeJsonParseArray("{}", isMonitorJsonValue);
            expect(result.success).toBeFalsy();
            expect(result.error).toBe("Parsed data is not an array");
        });
    });

    describe(safeJsonParseWithFallback, () => {
        it("returns parsed value when validator succeeds", () => {
            const fallback: JsonValue[] = [];
            const payload: JsonValue[] = [
                { id: "mon_1", name: "A", enabled: true },
                { id: "mon_2", name: "B", enabled: false },
            ];
            const monitorListValidator = (
                value: unknown
            ): value is JsonValue[] =>
                Array.isArray(value) &&
                value.every((entry) => isMonitorJsonValue(entry));

            const parsed = safeJsonParseWithFallback(
                JSON.stringify(payload),
                monitorListValidator,
                fallback
            );

            expect(parsed).toEqual(payload);
        });

        it("returns fallback when parsing fails", () => {
            const fallback: JsonValue = ["fallback"];
            const parsed = safeJsonParseWithFallback(
                "{invalid",
                isMonitorJsonValue,
                fallback
            );
            expect(parsed).toBe(fallback);
        });
    });

    describe(safeJsonStringifyWithFallback, () => {
        it("returns JSON string for valid payloads", () => {
            const payload = {
                id: "mon_1",
                name: "To stringify",
                enabled: true,
            };
            const fallback = "{}";
            const json = safeJsonStringifyWithFallback(payload, fallback);
            expect(JSON.parse(json)).toEqual(payload);
        });

        it("returns fallback for unsupported values", () => {
            const fallback = '{ "ok": false }';
            const json = safeJsonStringifyWithFallback(
                unsafeJsonifiable({ fn: () => null }),
                fallback
            );
            expect(json).toBe(fallback);
        });

        it("returns fallback for mixed unsupported values", () => {
            const fallback = '{ "ok": false }';
            const json = safeJsonStringifyWithFallback(
                unsafeJsonifiable({ enabled: true, fn: () => null }),
                fallback
            );

            expect(json).toBe(fallback);
        });

        it("does not invoke nested array methods while checking unsupported values", () => {
            const fallback = '{ "ok": false }';
            const some = vi.fn(() => {
                throw new Error("array some should not run");
            });
            const nested = ["safe", Symbol("unsupported")];
            Object.defineProperty(nested, "some", {
                configurable: true,
                value: some,
            });

            const json = safeJsonStringifyWithFallback(
                unsafeJsonifiable({ nested }),
                fallback
            );

            expect(json).toBe(fallback);
            expect(some).not.toHaveBeenCalled();
        });
    });

    describe(tryParseJsonRecord, () => {
        it("returns normalized records for successful object parses", () => {
            const result = tryParseJsonRecord(
                '{"__proto__":{"polluted":true},"nested":{"value":1}}'
            );

            expect(result).not.toBeNull();
            expect(Object.getPrototypeOf(result)).toBeNull();
            expect(
                Object.getOwnPropertyDescriptor(result, "__proto__")
            ).toMatchObject({
                enumerable: true,
                value: { polluted: true },
            });
            expect(Object.getPrototypeOf(result!["nested"])).toBeNull();
        });
    });
});
