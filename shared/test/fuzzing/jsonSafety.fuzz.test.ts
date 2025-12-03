import { describe, expect } from "vitest";
import { fc, test } from "@fast-check/vitest";

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

const stringifyUnsafe = (value: unknown) =>
    safeJsonStringify(unsafeJsonifiable(value));

describe("jsonSafety fuzz tests", () => {
    describe(safeJsonStringify, () => {
        test.prop([fc.jsonValue()])(
            "round-trips arbitrary JSON values",
            (value) => {
                const encoded = stringifyUnsafe(value);
                expect(encoded.success).toBeTruthy();

                const parsed = safeJsonParse(encoded.data!, acceptAnyJsonValue);
                expect(parsed.success).toBeTruthy();
                // JSON's semantics do not preserve certain edge cases like the
                // sign of zero ("-0" is serialized as "0"). To avoid
                // asserting a stronger contract than native JSON, we compare
                // against the normalized value produced by JSON.parse.
                const normalized = JSON.parse(encoded.data!);
                expect(parsed.data).toEqual(normalized);
            }
        );

        test.prop([fc.anything()])(
            "never throws for arbitrary inputs",
            (value) => {
                expect(() => stringifyUnsafe(value)).not.toThrowError();
            }
        );
    });

    describe(safeJsonParseArray, () => {
        test.prop([fc.array(fc.jsonValue())])(
            "accepts arbitrary arrays",
            (values) => {
                const encoded = JSON.stringify(values);
                const result = safeJsonParseArray(encoded, acceptAnyJsonValue);
                expect(result.success).toBeTruthy();
                const normalized = JSON.parse(encoded);
                expect(result.data).toEqual(normalized);
            }
        );

        test.prop([fc.jsonValue()])("rejects non-array payloads", (value) => {
            const result = safeJsonParseArray(
                JSON.stringify(value),
                acceptAnyJsonValue
            );

            if (!Array.isArray(value)) {
                expect(result.success).toBeFalsy();
                expect(result.error).toBe("Parsed data is not an array");
            }
        });
    });

    describe(safeJsonParseWithFallback, () => {
        test.prop([fc.string(), fc.string()])(
            "falls back when parsing fails",
            (input, fallback) => {
                const corrupted = `${input}@@`;
                const parsed = safeJsonParseWithFallback(
                    corrupted,
                    acceptAnyJsonValue,
                    fallback
                );
                expect(parsed).toBe(fallback);
            }
        );
    });

    describe(safeJsonStringifyWithFallback, () => {
        test.prop([fc.jsonValue(), fc.string()])(
            "returns JSON for valid payloads",
            (value, fallback) => {
                const json = safeJsonStringifyWithFallback(
                    unsafeJsonifiable(value),
                    fallback
                );
                const serializedValue = JSON.stringify(value);
                const normalized = JSON.parse(serializedValue) as unknown;
                expect(JSON.parse(json)).toEqual(normalized);
            }
        );

        it("returns fallback for unserializable values", () => {
            const fallback = '"fallback"';
            const json = safeJsonStringifyWithFallback(
                unsafeJsonifiable({ fn: () => null }),
                fallback
            );
            expect(json).toBe(fallback);
        });
    });
});
