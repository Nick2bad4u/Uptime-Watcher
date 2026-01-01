import { describe, test, expect } from "vitest";
import { test as fcTest } from "@fast-check/vitest";
import * as fc from "fast-check";
import * as objectSafety from "../../utils/objectSafety";
import * as guardUtils from "../../utils/typeGuards";
import { getMonitorValidationErrors } from "../../validation/monitorSchemas";
import { validateSiteData } from "../../validation/siteSchemas";
import { validateMonitorType } from "../../utils/validation";

const validation = {
    getMonitorValidationErrors,
    validateMonitorType,
    validateSite: (site: unknown) => validateSiteData(site as any).success,
};
import * as siteStatus from "../../utils/siteStatus";
import * as errorCatalog from "../../utils/errorCatalog";
import * as environment from "../../utils/environment";
import * as safeConversions from "../../utils/safeConversions";
import * as stringConversion from "../../utils/stringConversion";

/** Arbitrary for generating test objects with various properties */
const testRecordArbitrary = fc.record({
    identifier: fc.string({ minLength: 1, maxLength: 30 }),
    count: fc.integer({ min: 0, max: 1000 }),
    enabled: fc.boolean(),
});

describe("Corrected Function Coverage Tests", () => {
    describe("objectSafety functions", () => {
        test("safeObjectAccess function exists", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: corrected-function-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            expect(objectSafety.safeObjectAccess).toBeDefined();
            expect(typeof objectSafety.safeObjectAccess).toBe("function");

            // Test basic functionality with correct signature
            const sampleRecord = { identifier: "item-001", count: 42 };
            expect(
                objectSafety.safeObjectAccess(
                    sampleRecord,
                    "identifier",
                    "fallback"
                )
            ).toBe("item-001");
            expect(
                objectSafety.safeObjectAccess(
                    sampleRecord,
                    "missing",
                    "fallback"
                )
            ).toBe("fallback");
        });

        test("safeObjectIteration function exists", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: corrected-function-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            expect(objectSafety.safeObjectIteration).toBeDefined();
            expect(typeof objectSafety.safeObjectIteration).toBe("function");

            // Test iteration with correct signature
            const sampleRecord = { alpha: 1, beta: 2 };
            const results: [string, unknown][] = [];
            objectSafety.safeObjectIteration(sampleRecord, (key, value) => {
                results.push([key, value]);
            });
            expect(results).toHaveLength(2);
        });

        test("typedObjectEntries function exists", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: corrected-function-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            expect(objectSafety.typedObjectEntries).toBeDefined();
            expect(typeof objectSafety.typedObjectEntries).toBe("function");

            // Test typed entries
            const sampleRecord = { alpha: 1, beta: 2 };
            const entries = objectSafety.typedObjectEntries(sampleRecord);
            expect(Array.isArray(entries)).toBeTruthy();
        });

        describe("Property-based Tests for objectSafety", () => {
            fcTest.prop([testRecordArbitrary, fc.string({ minLength: 1 })])(
                "should return fallback for missing keys",
                (record, fallbackValue) => {
                    const result = objectSafety.safeObjectAccess(
                        record,
                        "nonExistentKey" as keyof typeof record,
                        fallbackValue
                    );
                    expect(result).toBe(fallbackValue);
                }
            );

            fcTest.prop([testRecordArbitrary])(
                "should iterate over all keys in object",
                (record) => {
                    const visitedKeys: string[] = [];
                    objectSafety.safeObjectIteration(record, (key) => {
                        visitedKeys.push(key);
                    });
                    expect(visitedKeys).toHaveLength(
                        Object.keys(record).length
                    );
                }
            );

            fcTest.prop([testRecordArbitrary])(
                "should return correct number of entries",
                (record) => {
                    const entries = objectSafety.typedObjectEntries(record);
                    expect(entries).toHaveLength(Object.keys(record).length);
                }
            );
        });
    });

    describe("guardUtils functions", () => {
        test("basic guardUtils functions exist", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: corrected-function-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            expect(guardUtils.isObject).toBeDefined();
            expect(guardUtils.isString).toBeDefined();
            expect(guardUtils.isNumber).toBeDefined();
            expect(guardUtils.isBoolean).toBeDefined();
            expect(guardUtils.isArray).toBeDefined();
            expect(guardUtils.isFunction).toBeDefined();
            expect(guardUtils.isDate).toBeDefined();
            expect(guardUtils.isError).toBeDefined();
        });

        describe("Property-based Tests for guardUtils", () => {
            fcTest.prop([fc.string()])(
                "isString should correctly identify strings",
                (value) => {
                    expect(guardUtils.isString(value)).toBeTruthy();
                }
            );

            fcTest.prop([fc.integer()])(
                "isNumber should correctly identify integers",
                (value) => {
                    expect(guardUtils.isNumber(value)).toBeTruthy();
                }
            );

            fcTest.prop([fc.boolean()])(
                "isBoolean should correctly identify booleans",
                (value) => {
                    expect(guardUtils.isBoolean(value)).toBeTruthy();
                }
            );

            fcTest.prop([fc.array(fc.anything())])(
                "isArray should correctly identify arrays",
                (value) => {
                    expect(guardUtils.isArray(value)).toBeTruthy();
                }
            );
        });
    });

    describe("validation functions", () => {
        test("validation functions exist", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: corrected-function-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Validation", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: corrected-function-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Validation", "type");

            expect(validation.validateMonitorType).toBeDefined();
            expect(validation.getMonitorValidationErrors).toBeDefined();
            expect(validation.validateSite).toBeDefined();
        });
    });

    describe("siteStatus functions", () => {
        test("siteStatus functions exist", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: corrected-function-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: corrected-function-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Business Logic", "type");

            expect(siteStatus.calculateSiteMonitoringStatus).toBeDefined();
            expect(siteStatus.calculateSiteStatus).toBeDefined();
            expect(siteStatus.getSiteDisplayStatus).toBeDefined();
            expect(siteStatus.getSiteStatusDescription).toBeDefined();
            expect(siteStatus.getSiteStatusVariant).toBeDefined();
        });
    });

    describe("errorCatalog functions", () => {
        test("errorCatalog functions exist", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: corrected-function-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: corrected-function-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Error Handling", "type");

            expect(errorCatalog.formatErrorMessage).toBeDefined();
            expect(errorCatalog.isKnownErrorMessage).toBeDefined();
        });
    });

    describe("environment functions", () => {
        test("environment module is importable", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: corrected-function-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Import Operation", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: corrected-function-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Import Operation", "type");

            expect(environment).toBeDefined();
        });
    });

    describe("safeConversions functions", () => {
        test("safeConversions module is importable", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: corrected-function-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Import Operation", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: corrected-function-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Import Operation", "type");

            expect(safeConversions).toBeDefined();
        });
    });

    describe("stringConversion functions", () => {
        test("stringConversion module is importable", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: corrected-function-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Import Operation", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: corrected-function-coverage", "component");
            annotate("Category: Utility", "category");
            annotate("Type: Import Operation", "type");

            expect(stringConversion).toBeDefined();
        });
    });
});
