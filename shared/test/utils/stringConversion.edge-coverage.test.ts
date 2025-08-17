/**
 * Comprehensive tests for stringConversion.ts to achieve 100% coverage
 * Targeting the unreachable paths in the switch statement
 */

import { describe, it, expect } from "vitest";
import { safeStringify } from "../../utils/stringConversion";

describe("String Conversion - Complete Coverage", () => {
    describe("Edge Cases and Unreachable Code Paths", () => {
        it("should test all reachable switch cases thoroughly", () => {
            // Test all normal cases
            expect(safeStringify(BigInt(123))).toBe("123");
            expect(safeStringify(true)).toBe("true");
            expect(safeStringify(() => {})).toBe("[Function]");
            expect(safeStringify(123)).toBe("123");
            expect(safeStringify({})).toBe("{}");
            expect(safeStringify("test")).toBe("test");
            expect(safeStringify(Symbol("test"))).toContain("Symbol");

            // Test early returns
            expect(safeStringify(null)).toBe("");
            expect(safeStringify(undefined)).toBe("");
        });

        it("should attempt to reach unreachable code paths through type manipulation", () => {
            // The undefined case in the switch is unreachable due to early return
            // The default case is unreachable in normal JS

            // Create an object that might confuse the type system

            // Mock typeof to return unexpected values

            // Create a proxy that might behave oddly
            const proxyValue = new Proxy(
                {},
                {
                    get() {
                        return undefined;
                    },
                    has() {
                        return false;
                    },
                    ownKeys() {
                        return [];
                    },
                }
            );

            // Test with proxy
            const proxyResult = safeStringify(proxyValue);
            expect(typeof proxyResult).toBe("string");

            // Test with object that has custom toString/valueOf
            const customObject = {
                toString() {
                    throw new Error("toString error");
                },
                valueOf() {
                    throw new Error("valueOf error");
                },
            };

            const customResult = safeStringify(customObject);
            expect(typeof customResult).toBe("string");
        });

        it("should ensure complete branch coverage with type coercion edge cases", () => {
            // Test with primitive wrapper objects
            expect(safeStringify(String("test"))).toContain("test");
            expect(safeStringify(Number(123))).toContain("123");
            expect(safeStringify(Boolean(true))).toContain("true");

            // Test with null prototype objects
            const nullProtoObj = Object.create(null);
            nullProtoObj.test = "value";
            expect(typeof safeStringify(nullProtoObj)).toBe("string");

            // Test with frozen objects
            const frozenObj = Object.freeze({ test: "frozen" });
            expect(typeof safeStringify(frozenObj)).toBe("string");

            // Test with circular references (handled by safeJsonStringifyWithFallback)
            const circularObj: any = { prop: "test" };
            circularObj.circular = circularObj;
            expect(typeof safeStringify(circularObj)).toBe("string");
        });

        it("should test symbol edge cases for complete coverage", () => {
            // Test different symbol types
            expect(safeStringify(Symbol())).toContain("Symbol");
            expect(safeStringify(Symbol("named"))).toContain("Symbol");
            expect(safeStringify(Symbol.for("global"))).toContain("Symbol");
            expect(safeStringify(Symbol.iterator)).toContain("Symbol");
        });

        it("should test function edge cases for complete coverage", () => {
            // Test different function types
            expect(safeStringify(function named() {})).toBe("[Function]");
            expect(safeStringify(() => {})).toBe("[Function]");
            expect(safeStringify(async function () {})).toBe("[Function]");
            expect(safeStringify(function* generator() {})).toBe("[Function]");
            // Test class with method for test coverage
            const TestClass = class {
                testMethod(): void {}
            };
            expect(safeStringify(TestClass)).toBe("[Function]");
        });

        it("should test bigint edge cases for complete coverage", () => {
            // Test different bigint values
            expect(safeStringify(BigInt(0))).toBe("0");
            expect(safeStringify(BigInt(-123))).toBe("-123");
            expect(safeStringify(BigInt("999999999999999999"))).toBe(
                "999999999999999999"
            );
        });

        it("should test number edge cases for complete coverage", () => {
            // Test special number values
            expect(safeStringify(Number.NaN)).toBe("NaN");
            expect(safeStringify(Infinity)).toBe("Infinity");
            expect(safeStringify(-Infinity)).toBe("-Infinity");
            expect(safeStringify(0)).toBe("0");
            expect(safeStringify(-0)).toBe("0");
        });
    });
});
