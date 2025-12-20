/**
 * Tests for shared runtime assertions.
 */

import { describe, expect, it } from "vitest";

import { assertNever } from "@shared/utils/assertions";

describe(assertNever, () => {
    it("throws with context and includes string value", () => {
        expect(() =>
            assertNever("unexpected" as never, "unit-test")).toThrowError(
            "[unit-test] Reached unreachable code with value: unexpected"
        );
    });

    it("formats functions and falls back to <unserializable> for objects that cannot be JSON stringified", () => {
        expect(() =>
            assertNever(function named() {} as never, "fn")).toThrowError(
            "[fn] Reached unreachable code with value: [Function named]"
        );

        // BigInt cannot be JSON stringified; exercise the catch branch.
        expect(() =>
            assertNever(
                { value: 1n } as unknown as never,
                "bigint"
            )).toThrowError(
            "[bigint] Reached unreachable code with value: <unserializable>"
        );
    });

    it("formats null/undefined and other primitives", () => {
        expect(() =>
            assertNever(null as unknown as never, "null")).toThrowError(
            "[null] Reached unreachable code with value: null"
        );

        expect(() =>
            assertNever(undefined as unknown as never, "undef")).toThrowError(
            "[undef] Reached unreachable code with value: undefined"
        );

        expect(() =>
            assertNever(true as unknown as never, "bool")).toThrowError(
            "[bool] Reached unreachable code with value: true"
        );

        expect(() => assertNever(123 as unknown as never, "num")).toThrowError(
            "[num] Reached unreachable code with value: 123"
        );

        expect(() =>
            assertNever(Symbol("x") as unknown as never, "sym")).toThrowError(
              /\[sym\] Reached unreachable code with value: Symbol\(x\)/u
        );
    });

    it("stringifies plain objects", () => {
        expect(() =>
            assertNever({ ok: true } as unknown as never, "obj")).toThrowError(
            '[obj] Reached unreachable code with value: {"ok":true}'
        );
    });
});
