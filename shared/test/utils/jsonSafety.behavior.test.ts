import { describe, expect, it } from "vitest";
import type { JsonValue } from "type-fest";

import {
    safeJsonParse,
    safeJsonParseArray,
    safeJsonParseWithFallback,
    safeJsonStringify,
    safeJsonStringifyWithFallback,
} from "@shared/utils/jsonSafety";
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

        it("returns detailed errors when JSON is invalid", () => {
            const result = safeJsonParse("{invalid", acceptAnyJsonValue);
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
    });
});
