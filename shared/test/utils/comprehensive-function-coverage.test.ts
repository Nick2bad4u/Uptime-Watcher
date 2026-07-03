/**
 * Comprehensive function coverage test for shared module. This test ensures
 * 100% function coverage by calling all exported functions.
 */

import { describe, expect, it } from "vitest";

describe("Shared Module - 100% Function Coverage", () => {
    describe("environment functions", () => {
        it("should ensure all environment functions are covered", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: comprehensive-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const environmentModule =
                await import("../../utils/environment.js");

            // Call all exported functions to ensure coverage
            expect(
                typeof environmentModule.getEnvVar("NODE_ENV")
            ).toBeDefined();
            expect(typeof environmentModule.getEnvironment()).toBe("string");
            expect(typeof environmentModule.getNodeEnv()).toBe("string");
            expect(typeof environmentModule.isBrowserEnvironment()).toBe(
                "boolean"
            );
            expect(typeof environmentModule.isDevelopment()).toBe("boolean");
            expect(typeof environmentModule.isNodeEnvironment()).toBe(
                "boolean"
            );
            expect(typeof environmentModule.isProduction()).toBe("boolean");
            expect(typeof environmentModule.isTest()).toBe("boolean");
        });
    });

    describe("validation functions", () => {
        it("should ensure all validation functions are covered", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: comprehensive-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const validationModule = await import("../../types/validation.js");

            // Call all exported functions
            const failureResult = validationModule.createFailureResult([
                "test error",
            ]);
            expect(failureResult.success).toBeFalsy();

            const successResult = validationModule.createSuccessResult();
            expect(successResult.success).toBeTruthy();

            expect(
                validationModule.isValidationResult(failureResult)
            ).toBeTruthy();
            expect(
                validationModule.isValidationResult(successResult)
            ).toBeTruthy();
        });
    });

    describe("objectSafety functions", () => {
        it("should ensure all objectSafety functions are covered", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: comprehensive-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const objectSafetyModule =
                await import("../../utils/objectSafety.js");

            const testObj = { a: 1, b: 2, c: 3 };

            // Call all exported functions
            expect(objectSafetyModule.safeObjectAccess(testObj, "a", 0)).toBe(
                1
            );

            const iterationResult: string[] = [];
            objectSafetyModule.safeObjectIteration(testObj, (key, value) => {
                iterationResult.push(`${key}:${value}`);
            });
            expect(iterationResult).toHaveLength(3);

            expect(objectSafetyModule.safeObjectOmit(testObj, ["a"])).toEqual({
                b: 2,
                c: 3,
            });
            expect(
                objectSafetyModule.safeObjectPick(testObj, ["a", "b"])
            ).toEqual({ a: 1, b: 2 });

            expect(objectSafetyModule.typedObjectEntries(testObj)).toEqual([
                ["a", 1],
                ["b", 2],
                ["c", 3],
            ]);
            expect(objectSafetyModule.typedObjectKeys(testObj)).toEqual([
                "a",
                "b",
                "c",
            ]);
            expect(objectSafetyModule.typedObjectValues(testObj)).toEqual([
                1,
                2,
                3,
            ]);
        });
    });

    describe("safeConversions functions", () => {
        it("should ensure all safeConversions functions are covered", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: comprehensive-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const safeConversionsModule =
                await import("../../utils/safeConversions.js");

            // Call all exported functions
            expect(safeConversionsModule.safeNumberConversion("123", 0)).toBe(
                123
            );
            expect(
                safeConversionsModule.safeParseCheckInterval(500, 1000)
            ).toBe(1000);
            expect(safeConversionsModule.safeParseFloat("12.34", 0)).toBe(
                12.34
            );
            expect(safeConversionsModule.safeParseInt("123", 0)).toBe(123);
            expect(safeConversionsModule.safeParsePercentage(150, 50)).toBe(
                100
            );
            expect(safeConversionsModule.safeParsePort(8080, 3000)).toBe(8080);
            expect(safeConversionsModule.safeParsePositiveInt(5, 1)).toBe(5);
            expect(safeConversionsModule.safeParseRetryAttempts(3, 1)).toBe(3);
            expect(safeConversionsModule.safeParseTimeout(5000, 1000)).toBe(
                5000
            );
            expect(
                typeof safeConversionsModule.safeParseTimestamp(
                    Date.now(),
                    Date.now()
                )
            ).toBe("number");
        });
    });

    describe("typeGuards functions", () => {
        it("should ensure all typeGuards functions are covered", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: comprehensive-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const guardUtilsModule = await import("../../utils/typeGuards.js");

            // Call all exported functions
            expect(
                guardUtilsModule.hasProperties({ a: 1 }, ["a"])
            ).toBeTruthy();
            expect(guardUtilsModule.hasProperty({ a: 1 }, "a")).toBeTruthy();
            expect(
                guardUtilsModule.isArray([
                    1,
                    2,
                    3,
                ])
            ).toBeTruthy();
            expect(guardUtilsModule.isBoolean(true)).toBeTruthy();
            expect(guardUtilsModule.isDate(new Date())).toBeTruthy();
            expect(
                guardUtilsModule.isError(new Error("test error"))
            ).toBeTruthy();
            expect(guardUtilsModule.isFiniteNumber(123)).toBeTruthy();
            expect(guardUtilsModule.isFunction(() => {})).toBeTruthy();
            expect(guardUtilsModule.isNonNegativeNumber(0)).toBeTruthy();
            expect(guardUtilsModule.isNonNullObject({})).toBeTruthy();
            expect(guardUtilsModule.isNumber(123)).toBeTruthy();
            expect(guardUtilsModule.isObject({})).toBeTruthy();
            expect(guardUtilsModule.isPositiveNumber(1)).toBeTruthy();
            expect(guardUtilsModule.isString("test")).toBeTruthy();
            expect(guardUtilsModule.isValidPort(8080)).toBeTruthy();
            expect(guardUtilsModule.isValidTimestamp(Date.now())).toBeTruthy();
        });
    });

    describe("typeHelpers functions", () => {
        it("should ensure all typeHelpers functions are covered", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: comprehensive-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const helperUtilsModule =
                await import("../../utils/typeHelpers.js");

            // Call all exported functions
            expect(helperUtilsModule.castIpcResponse("test")).toBe("test");
            expect(
                helperUtilsModule.isArray([
                    1,
                    2,
                    3,
                ])
            ).toBeTruthy();
            expect(helperUtilsModule.isRecord({})).toBeTruthy();
            expect(helperUtilsModule.safePropertyAccess({ a: 1 }, "a")).toBe(1);
            expect(
                helperUtilsModule.validateAndConvert(
                    "test",
                    (x) => typeof x === "string"
                )
            ).toBe("test");
        });
    });

    describe("stringConversion functions", () => {
        it("should ensure all stringConversion functions are covered", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: comprehensive-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const stringConversionModule =
                await import("../../utils/stringConversion.js");

            // Call all exported functions
            expect(stringConversionModule.safeStringify("test")).toBe("test");
            expect(stringConversionModule.safeStringify(123)).toBe("123");
            expect(stringConversionModule.safeStringify(null)).toBe("");
            expect(stringConversionModule.safeStringify(undefined)).toBe("");
        });
    });

    describe("siteStatus functions", () => {
        it("should ensure all siteStatus functions are covered", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: comprehensive-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const siteStatusModule = await import("../../utils/siteStatus.js");

            // Create mock site data
            const mockSite = {
                identifier: "test",
                monitoring: true,
                monitors: [],
                name: "Test Site",
            };

            // Call all exported functions that may not be covered
            expect(
                siteStatusModule.calculateSiteMonitoringStatus({ monitors: [] })
            ).toBe("stopped");
            expect(siteStatusModule.calculateSiteStatus(mockSite)).toBe(
                "unknown"
            );
            expect(siteStatusModule.getSiteDisplayStatus(mockSite)).toBe(
                "unknown"
            );
            expect(
                siteStatusModule.getSiteStatusDescription(mockSite)
            ).toBeDefined();
            expect(
                siteStatusModule.getSiteStatusVariant("unknown")
            ).toBeDefined();
        });
    });

    describe("jsonSafety functions", () => {
        it("should ensure all jsonSafety functions are covered", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: comprehensive-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const jsonSafetyModule = await import("../../utils/jsonSafety.js");

            // Call all exported functions
            const testObj = { test: "data" };
            const validator = (data: unknown): data is typeof testObj =>
                typeof data === "object" && data !== null && "test" in data;

            const parseResult = jsonSafetyModule.safeJsonParse(
                '{"test":"data"}',
                validator
            );
            expect(parseResult.success).toBeTruthy();

            const parseArrayResult = jsonSafetyModule.safeJsonParseArray(
                '[{"test":"data"}]',
                validator
            );
            expect(parseArrayResult.success).toBeTruthy();

            const parseWithFallbackResult =
                jsonSafetyModule.safeJsonParseWithFallback(
                    '{"test":"data"}',
                    validator,
                    testObj
                );
            expect(parseWithFallbackResult).toEqual(testObj);

            expect(jsonSafetyModule.safeJsonStringify(testObj).data).toBe(
                '{"test":"data"}'
            );
            expect(
                jsonSafetyModule.safeJsonStringifyWithFallback(testObj, "{}")
            ).toBe('{"test":"data"}');
        });
    });

    describe("errorCatalog functions", () => {
        it("should ensure all errorCatalog functions are covered", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: comprehensive-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const errorCatalogModule =
                await import("../../utils/errorCatalog.js");

            // Call all exported functions
            expect(
                errorCatalogModule.formatErrorMessage(
                    "Site with ID '{siteIdentifier}' was not found",
                    { siteIdentifier: "test" }
                )
            ).toBeDefined();
            expect(
                errorCatalogModule.isKnownErrorMessage("Site not found")
            ).toBeTruthy();
            expect(
                errorCatalogModule.isKnownErrorMessage("Unknown error message")
            ).toBeFalsy();

            // Access error catalogs
            expect(errorCatalogModule.ERROR_CATALOG).toBeDefined();
            expect(errorCatalogModule.SITE_ERRORS).toBeDefined();
            expect(errorCatalogModule.MONITOR_ERRORS).toBeDefined();
            expect(errorCatalogModule.VALIDATION_ERRORS).toBeDefined();
            expect(errorCatalogModule.SYSTEM_ERRORS).toBeDefined();
            expect(errorCatalogModule.NETWORK_ERRORS).toBeDefined();
            expect(errorCatalogModule.DATABASE_ERRORS).toBeDefined();
            expect(errorCatalogModule.IPC_ERRORS).toBeDefined();
        });
    });

    describe("errorHandling functions", () => {
        it("should ensure all errorHandling functions are covered", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: comprehensive-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const errorHandlingModule =
                await import("../../utils/errorHandling.js");

            // Create mock store for testing
            const mockStore = {
                clearError: () => {},
                setError: () => {},
                setLoading: () => {},
            };

            // Test withErrorHandling function
            const result = await errorHandlingModule.withErrorHandling(
                () => Promise.resolve("success"),
                mockStore
            );
            expect(result).toBe("success");
        });
    });

    describe("logTemplates constants", () => {
        it("should ensure all logTemplates are accessed", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: comprehensive-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const logTemplatesModule =
                await import("../../utils/logTemplates.js");

            // Access all template categories
            expect(logTemplatesModule.SERVICE_LOGS).toBeDefined();
            expect(logTemplatesModule.DEBUG_LOGS).toBeDefined();
            expect(logTemplatesModule.ERROR_LOGS).toBeDefined();
            expect(logTemplatesModule.WARNING_LOGS).toBeDefined();
            expect(logTemplatesModule.LOG_TEMPLATES).toBeDefined();
            expect(logTemplatesModule.LOG_TEMPLATES.services).toBeDefined();
            expect(logTemplatesModule.LOG_TEMPLATES.debug).toBeDefined();
            expect(logTemplatesModule.LOG_TEMPLATES.errors).toBeDefined();
            expect(logTemplatesModule.LOG_TEMPLATES.warnings).toBeDefined();
        });
    });

    describe("cacheKeys functions", () => {
        it("should ensure all cacheKeys functions are covered", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: comprehensive-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            const cacheKeysModule = await import("../../utils/cacheKeys.js");

            // Call all exported functions
            expect(
                cacheKeysModule.CacheKeys.config.byName("test")
            ).toBeDefined();
            expect(
                cacheKeysModule.CacheKeys.config.validation("test")
            ).toBeDefined();
            expect(
                cacheKeysModule.CacheKeys.monitor.byId("test")
            ).toBeDefined();
            expect(
                cacheKeysModule.CacheKeys.monitor.bySite("test")
            ).toBeDefined();
            expect(
                cacheKeysModule.CacheKeys.monitor.operation("test")
            ).toBeDefined();
            expect(
                cacheKeysModule.CacheKeys.site.bulkOperation()
            ).toBeDefined();
            expect(
                cacheKeysModule.CacheKeys.site.byIdentifier("test")
            ).toBeDefined();
            expect(
                cacheKeysModule.CacheKeys.site.loading("test")
            ).toBeDefined();
            expect(
                cacheKeysModule.CacheKeys.validation.byType("test", "id")
            ).toBeDefined();
            expect(
                cacheKeysModule.CacheKeys.validation.monitorType("test")
            ).toBeDefined();

            expect(
                cacheKeysModule.isStandardizedCacheKey("config:test")
            ).toBeTruthy();
            expect(cacheKeysModule.parseCacheKey("config:test")).toEqual({
                identifier: "test",
                operation: undefined,
                prefix: "config",
            });
        });
    });

    describe("validation utility functions", () => {
        it("should ensure all validation utility functions are covered", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: comprehensive-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const validatorUtilsModule =
                await import("../../validation/validatorUtils.js");

            // Call all exported functions
            expect(validatorUtilsModule.isNonEmptyString("test")).toBeTruthy();
            expect(
                validatorUtilsModule.isValidFQDN("example.com")
            ).toBeTruthy();
            expect(
                validatorUtilsModule.isValidIdentifier("test_id")
            ).toBeTruthy();
            expect(
                validatorUtilsModule.isValidIdentifierArray(["test1", "test2"])
            ).toBeTruthy();
            expect(validatorUtilsModule.isValidInteger("123")).toBeTruthy();
            expect(validatorUtilsModule.isValidNumeric("123.45")).toBeTruthy();
            expect(validatorUtilsModule.isValidHost("localhost")).toBeTruthy();
            expect(validatorUtilsModule.isValidPort(8080)).toBeTruthy();
            expect(
                validatorUtilsModule.isValidUrl("https://example.com")
            ).toBeTruthy();
            expect(validatorUtilsModule.safeInteger("123", 0, 0, 1000)).toBe(
                123
            );
        });
    });

    describe("validation schemas functions", () => {
        it("should ensure all validation schemas functions are covered", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: comprehensive-function-coverage",
                "component"
            );
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const [
                monitorSchemasModule,
                siteSchemasModule,
                statusUpdateSchemasModule,
            ] = await Promise.all([
                import("../../validation/monitorSchemas.js"),
                import("../../validation/siteSchemas.js"),
                import("../../validation/statusUpdateSchemas.js"),
            ]);
            const schemasModule = {
                ...monitorSchemasModule,
                ...siteSchemasModule,
                ...statusUpdateSchemasModule,
            } as const;

            // Test validation functions
            const httpMonitor = {
                checkInterval: 30_000,
                history: [],
                id: "test",
                monitoring: true,
                responseTime: 200,
                retryAttempts: 3,
                status: "up" as const,
                timeout: 5000,
                type: "http" as const,
                url: "https://example.com",
            };

            const result = schemasModule.validateMonitorData(
                "http",
                httpMonitor
            );
            expect(result.success).toBeTruthy();

            const fieldResult = schemasModule.validateMonitorField(
                "http",
                "url",
                "https://example.com"
            );
            expect(fieldResult.success).toBeTruthy();

            const siteData = {
                identifier: "test-site",
                monitoring: true,
                monitors: [httpMonitor],
                name: "Test Site",
            };

            const siteResult = schemasModule.validateSiteData(siteData);
            expect(siteResult.success).toBeTruthy();
        });
    });
});
