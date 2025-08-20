"use strict";
/**
 * @file Complete Function Coverage Tests for stringConversion.ts
 *
 *   This test ensures 100% function coverage for the stringConversion module
 *   using the proven Function Coverage Validation pattern with namespace
 *   imports and systematic function calls.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var stringConversionModule = require("@shared/utils/stringConversion");
(0, vitest_1.describe)(
    "StringConversion - Complete Function Coverage",
    function () {
        (0, vitest_1.describe)("Function Coverage Validation", function () {
            (0, vitest_1.it)(
                "should call every exported function for complete coverage",
                function () {
                    // Verify the module exports we expect
                    (0, vitest_1.expect)(typeof stringConversionModule).toBe(
                        "object"
                    );
                    (0, vitest_1.expect)(stringConversionModule).toBeDefined();
                    // Test safeStringify function - the only export
                    (0, vitest_1.expect)(
                        typeof stringConversionModule.safeStringify
                    ).toBe("function");
                    // Test all branches of the switch statement to achieve 100% coverage
                    // Test null and undefined cases
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify(null)
                    ).toBe("");
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify(undefined)
                    ).toBe("");
                    // Test string case
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify("")
                    ).toBe("");
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify("hello")
                    ).toBe("hello");
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify("test string")
                    ).toBe("test string");
                    // Test number case
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify(0)
                    ).toBe("0");
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify(123)
                    ).toBe("123");
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify(-456)
                    ).toBe("-456");
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify(3.14)
                    ).toBe("3.14");
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify(NaN)
                    ).toBe("NaN");
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify(Infinity)
                    ).toBe("Infinity");
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify(-Infinity)
                    ).toBe("-Infinity");
                    // Test boolean case
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify(true)
                    ).toBe("true");
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify(false)
                    ).toBe("false");
                    // Test bigint case
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify(BigInt(123))
                    ).toBe("123");
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify(BigInt(0))
                    ).toBe("0");
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify(BigInt(-456))
                    ).toBe("-456");
                    // Test function case
                    var testFunction = function () {
                        return "test";
                    };
                    var namedFunction = function namedFn() {
                        return "named";
                    };
                    var arrowFunction = function (x) {
                        return x * 2;
                    };
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify(testFunction)
                    ).toBe("[Function]");
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify(namedFunction)
                    ).toBe("[Function]");
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify(arrowFunction)
                    ).toBe("[Function]");
                    // Test symbol case
                    var symbol1 = Symbol();
                    var symbol2 = Symbol("test");
                    var symbol3 = Symbol.for("global");
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify(symbol1)
                    ).toBe("Symbol()");
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify(symbol2)
                    ).toBe("Symbol(test)");
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify(symbol3)
                    ).toBe("Symbol(global)");
                    // Test object case (using safeJsonStringifyWithFallback)
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify({})
                    ).toBe("{}");
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify({ key: "value" })
                    ).toBe('{"key":"value"}');
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify({ a: 1, b: 2 })
                    ).toBe('{"a":1,"b":2}');
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify([])
                    ).toBe("[]");
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify([
                            1,
                            2,
                            3,
                        ])
                    ).toBe("[1,2,3]");
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify([
                            { a: 1 },
                            { b: 2 },
                        ])
                    ).toBe('[{"a":1},{"b":2}]');
                    // Test circular references (should fallback to "[Complex Object]")
                    var circular = { name: "test" };
                    circular.self = circular;
                    (0, vitest_1.expect)(
                        stringConversionModule.safeStringify(circular)
                    ).toBe("[Complex Object]");
                    // Test Date objects
                    var date = new Date("2023-01-01T00:00:00.000Z");
                    var dateResult = stringConversionModule.safeStringify(date);
                    (0, vitest_1.expect)(dateResult).toContain(
                        "2023-01-01T00:00:00.000Z"
                    );
                    // Test other objects that should serialize
                    var regex = /test/gi;
                    var regexResult =
                        stringConversionModule.safeStringify(regex);
                    (0, vitest_1.expect)(regexResult).toBeTruthy();
                    (0, vitest_1.expect)(typeof regexResult).toBe("string");
                }
            );
            (0, vitest_1.it)(
                "should handle complex objects and edge cases",
                function () {
                    // Test complex objects that might fail serialization
                    var complexObject = {
                        func: function () {
                            return "test";
                        },
                        symbol: Symbol("test"),
                        date: new Date(),
                        nested: {
                            deep: {
                                value: "test",
                            },
                        },
                    };
                    var complexResult =
                        stringConversionModule.safeStringify(complexObject);
                    (0, vitest_1.expect)(typeof complexResult).toBe("string");
                    // Should either be valid JSON or fallback to "[Complex Object]"
                    (0, vitest_1.expect)(
                        complexResult === "[Complex Object]" ||
                            complexResult.startsWith("{")
                    ).toBe(true);
                    // Test various object types
                    var map = new Map([["key", "value"]]);
                    var set = new Set([
                        1,
                        2,
                        3,
                    ]);
                    var buffer = new ArrayBuffer(8);
                    var uint8Array = new Uint8Array([
                        1,
                        2,
                        3,
                        4,
                    ]);
                    var promise = Promise.resolve("test");
                    var error = new Error("test error");
                    (0, vitest_1.expect)(
                        typeof stringConversionModule.safeStringify(map)
                    ).toBe("string");
                    (0, vitest_1.expect)(
                        typeof stringConversionModule.safeStringify(set)
                    ).toBe("string");
                    (0, vitest_1.expect)(
                        typeof stringConversionModule.safeStringify(buffer)
                    ).toBe("string");
                    (0, vitest_1.expect)(
                        typeof stringConversionModule.safeStringify(uint8Array)
                    ).toBe("string");
                    (0, vitest_1.expect)(
                        typeof stringConversionModule.safeStringify(promise)
                    ).toBe("string");
                    (0, vitest_1.expect)(
                        typeof stringConversionModule.safeStringify(error)
                    ).toBe("string");
                }
            );
            (0, vitest_1.it)(
                "should be consistent and deterministic",
                function () {
                    // Test that the function always returns a string
                    var testValues = [
                        null,
                        undefined,
                        "",
                        "test",
                        0,
                        123,
                        true,
                        false,
                        BigInt(456),
                        Symbol("test"),
                        {},
                        { key: "value" },
                        [],
                        [
                            1,
                            2,
                            3,
                        ],
                        new Date(),
                        /regex/,
                        function () {},
                        new Error(),
                    ];
                    testValues.forEach(function (value) {
                        var result =
                            stringConversionModule.safeStringify(value);
                        (0, vitest_1.expect)(typeof result).toBe("string");
                        (0, vitest_1.expect)(result).toBeDefined();
                        // Test consistency - same input should produce same output
                        var result2 =
                            stringConversionModule.safeStringify(value);
                        (0, vitest_1.expect)(result).toBe(result2);
                    });
                }
            );
            (0, vitest_1.it)(
                "should cover all switch case branches",
                function () {
                    // Test to ensure all typeof cases are covered for 100% branch coverage
                    // The switch statement has these cases:
                    // - null/undefined (handled early)
                    // - bigint
                    // - boolean
                    // - function
                    // - number
                    // - object
                    // - string
                    // - symbol
                    // - undefined (redundant with early check)
                    // - default
                    // All these are already tested above, but let's be explicit for coverage
                    (0, vitest_1.expect)(
                        typeof stringConversionModule.safeStringify(BigInt(1))
                    ).toBe("string");
                    (0, vitest_1.expect)(
                        typeof stringConversionModule.safeStringify(true)
                    ).toBe("string");
                    (0, vitest_1.expect)(
                        typeof stringConversionModule.safeStringify(
                            function () {}
                        )
                    ).toBe("string");
                    (0, vitest_1.expect)(
                        typeof stringConversionModule.safeStringify(42)
                    ).toBe("string");
                    (0, vitest_1.expect)(
                        typeof stringConversionModule.safeStringify({})
                    ).toBe("string");
                    (0, vitest_1.expect)(
                        typeof stringConversionModule.safeStringify("test")
                    ).toBe("string");
                    (0, vitest_1.expect)(
                        typeof stringConversionModule.safeStringify(Symbol())
                    ).toBe("string");
                    // The default case should theoretically never be reached with current JS types
                    // but it's there for safety and future-proofing
                }
            );
        });
    }
);
