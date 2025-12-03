import { describe, expect, it } from "vitest";
import { fc, test } from "@fast-check/vitest";
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
} from "./helpers/jsonTestHelpers";

const stringifyUnsafe = (value: unknown) =>
    safeJsonStringify(unsafeJsonifiable(value));

const stringifyUnsafeWithFallback = (value: unknown, fallback: string) =>
    safeJsonStringifyWithFallback(unsafeJsonifiable(value), fallback);

describe("jsonSafety property tests", () => {
    describe(safeJsonStringify, () => {
        test.prop([fc.jsonValue()])("produces valid JSON", (sample) => {
            const result = stringifyUnsafe(sample);
            expect(result.success).toBeTruthy();
            const decoded = JSON.parse(result.data!);
            // JSON.stringify/JSON.parse do not preserve certain edge cases
            // like the sign of zero ("-0" is serialized as "0"). To avoid
            // asserting a stronger contract than the underlying JSON
            // semantics, compare against the normalized JSON value.
            const serializedSample = JSON.stringify(sample);
            const normalizedSample = JSON.parse(serializedSample) as JsonValue;
            expect(decoded).toEqual(normalizedSample);
        });

        test.prop([fc.anything()])(
            "never throws for arbitrary values",
            (sample) => {
                expect(() => stringifyUnsafe(sample)).not.toThrowError();
            }
        );

        it("returns an error payload for unserializable inputs", () => {
            const result = safeJsonStringify(
                unsafeJsonifiable({ handler: () => null })
            );
            expect(result.success).toBeFalsy();
            expect(result.error).toContain("JSON serialization failed");
        });
    });

    describe(safeJsonParse, () => {
        test.prop([fc.jsonValue()])("round-trips values", (sample) => {
            const encoded = JSON.stringify(sample);
            const result = safeJsonParse(encoded, acceptAnyJsonValue);
            expect(result.success).toBeTruthy();
            // JSON.stringify/JSON.parse do not preserve certain edge cases
            // like the sign of zero ("-0" is serialized as "0"). To avoid
            // asserting a stronger contract than the underlying JSON
            // semantics, we compare against the normalized value produced by
            // JSON.parse for the same encoded payload.
            const normalizedSample = JSON.parse(encoded) as JsonValue;
            expect(result.data).toEqual(normalizedSample);
        });

        it("returns detailed errors for invalid JSON", () => {
            const result = safeJsonParse("{invalid", acceptAnyJsonValue);
            expect(result.success).toBeFalsy();
            expect(result.error).toContain("JSON parsing failed");
        });

        it("supports domain validators", () => {
            const payload = {
                id: "usr_1",
                name: "Test",
                active: true,
            };
            const validator = (value: unknown): value is JsonValue =>
                acceptAnyJsonValue(value) &&
                typeof value === "object" &&
                value !== null &&
                typeof (value as Record<string, JsonValue | undefined>)[
                    "id"
                ] === "string" &&
                typeof (value as Record<string, JsonValue | undefined>)[
                    "name"
                ] === "string" &&
                typeof (value as Record<string, JsonValue | undefined>)[
                    "active"
                ] === "boolean";

            const result = safeJsonParse(JSON.stringify(payload), validator);
            expect(result.success).toBeTruthy();
            expect(result.data).toEqual(payload);
        });
    });

    describe(safeJsonParseArray, () => {
        test.prop([fc.array(fc.jsonValue())])("parses arrays", (sample) => {
            const encoded = JSON.stringify(sample);
            const result = safeJsonParseArray(encoded, acceptAnyJsonValue);
            expect(result.success).toBeTruthy();
            const normalizedSample = JSON.parse(encoded);
            expect(result.data).toEqual(normalizedSample);
        });

        it("fails when payload is not an array", () => {
            const result = safeJsonParseArray("{}", acceptAnyJsonValue);
            expect(result.success).toBeFalsy();
            expect(result.error).toBe("Parsed data is not an array");
        });
    });

    describe(safeJsonParseWithFallback, () => {
        it("returns fallback on parse failure", () => {
            const fallback: JsonValue = { ok: false };
            const parsed = safeJsonParseWithFallback(
                "{invalid",
                acceptAnyJsonValue,
                fallback
            );
            expect(parsed).toBe(fallback);
        });

        it("returns parsed data when validator passes", () => {
            const json = JSON.stringify([
                1,
                2,
                3,
            ]);
            const fallback: JsonValue = [];
            const parsed = safeJsonParseWithFallback(
                json,
                acceptAnyJsonValue,
                fallback
            );
            expect(parsed).toEqual([
                1,
                2,
                3,
            ]);
        });
    });

    describe(safeJsonStringifyWithFallback, () => {
        test.prop([fc.jsonValue(), fc.string()])(
            "stringifies valid payloads",
            (sample, fallback) => {
                const json = stringifyUnsafeWithFallback(sample, fallback);
                const serializedSample = JSON.stringify(sample);
                const normalizedSample = JSON.parse(
                    serializedSample
                ) as JsonValue;
                expect(JSON.parse(json)).toEqual(normalizedSample);
            }
        );

        it("returns fallback for values JSON cannot serialize", () => {
            const fallback = '{"ok":false}';
            const json = stringifyUnsafeWithFallback(
                { id: 1, budget: 10n },
                fallback
            );
            expect(json).toBe(fallback);
        });
    });
});
