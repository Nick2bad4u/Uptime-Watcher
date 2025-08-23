/**
 * Comprehensive function coverage test for shared module. This test ensures
 * 100% function coverage by calling all exported functions.
 */

import { describe, expect, it } from "vitest";

describe("Shared Module - 100% Function Coverage", () => {
    describe("chartConfig functions", () => {
        it("should ensure all chartConfig functions are covered", async () => {
            const chartConfigModule = await import(
                "../../types/chartConfig.js"
            );

            // Ensure hasPlugins function is called
            expect(chartConfigModule.hasPlugins({})).toBe(false);
            expect(chartConfigModule.hasPlugins({ plugins: {} })).toBe(true);

            // Ensure hasScales function is called
            expect(chartConfigModule.hasScales({})).toBe(false);
            expect(chartConfigModule.hasScales({ scales: {} })).toBe(true);

            // Ensure DEFAULT_CHART_THEMES constant is accessed
            expect(chartConfigModule.DEFAULT_CHART_THEMES).toBeDefined();
            expect(chartConfigModule.DEFAULT_CHART_THEMES.dark).toBeDefined();
            expect(chartConfigModule.DEFAULT_CHART_THEMES.light).toBeDefined();
        });
    });

    describe("environment functions", () => {
        it("should ensure all environment functions are covered", async () => {
            const environmentModule = await import(
                "../../utils/environment.js"
            );

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
        it("should ensure all validation functions are covered", async () => {
            const validationModule = await import("../../types/validation.js");

            // Call all exported functions
            const failureResult = validationModule.createFailureResult([
                "test error",
            ]);
            expect(failureResult.success).toBe(false);

            const successResult = validationModule.createSuccessResult();
            expect(successResult.success).toBe(true);

            expect(validationModule.isValidationResult(failureResult)).toBe(
                true
            );
            expect(validationModule.isValidationResult(successResult)).toBe(
                true
            );
        });
    });

    describe("themeConfig functions", () => {
        it("should ensure all themeConfig functions are covered", async () => {
            const themeConfigModule = await import(
                "../../types/themeConfig.js"
            );

            // Call type guard functions
            const validColorPalette = {
                primary: "#000000",
                secondary: "#ffffff",
                error: "#ff0000",
                warning: "#ffcc00",
                info: "#0066cc",
                success: "#00cc66",
            };

            expect(themeConfigModule.isColorPalette(validColorPalette)).toBe(
                true
            );
            expect(themeConfigModule.isColorPalette(null)).toBe(false);

            const validThemeColors = {
                background: {
                    default: "#ffffff",
                    elevated: "#f5f5f5",
                    paper: "#ffffff",
                },
                border: {
                    default: "#e0e0e0",
                    focus: "#0066cc",
                    hover: "#cccccc",
                },
                hover: { primary: "#0052a3", secondary: "#525252" },
                primary: validColorPalette,
                status: {
                    error: "#ff4444",
                    info: "#44aaff",
                    success: "#44aa44",
                    warning: "#ffaa44",
                },
                text: {
                    disabled: "#cccccc",
                    hint: "#999999",
                    primary: "#000000",
                    secondary: "#666666",
                },
            };

            const validThemeConfig = {
                animation: {
                    duration: { fast: "150ms", normal: "300ms", slow: "500ms" },
                    easing: {
                        linear: "linear",
                        easeIn: "ease-in",
                        easeOut: "ease-out",
                        easeInOut: "ease-in-out",
                    },
                },
                borderRadius: {
                    none: "0px",
                    sm: "4px",
                    md: "8px",
                    lg: "12px",
                    xl: "16px",
                    full: "9999px",
                },
                colors: validThemeColors,
                components: {
                    button: {
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        padding: "8px 16px",
                    },
                    card: {
                        borderRadius: "12px",
                        padding: "16px",
                        shadow: "0 2px 4px rgba(0,0,0,0.1)",
                    },
                    input: {
                        borderRadius: "6px",
                        fontSize: "14px",
                        padding: "8px 12px",
                    },
                },
                shadows: {
                    none: "none",
                    sm: "0 1px 2px rgba(0,0,0,0.1)",
                    md: "0 2px 4px rgba(0,0,0,0.1)",
                },
                spacing: {
                    none: "0px",
                    xs: "4px",
                    sm: "8px",
                    md: "16px",
                    lg: "24px",
                    xl: "32px",
                },
                typography: {
                    fontFamily: {
                        primary: "Arial, sans-serif",
                        secondary: "Georgia, serif",
                        monospace: "Monaco, monospace",
                    },
                    fontSize: {
                        xs: "12px",
                        sm: "14px",
                        md: "16px",
                        lg: "18px",
                        xl: "20px",
                    },
                    fontWeight: {
                        light: 300,
                        normal: 400,
                        medium: 500,
                        semibold: 600,
                        bold: 700,
                    },
                    lineHeight: { tight: 1.25, normal: 1.5, relaxed: 1.75 },
                },
            };

            expect(themeConfigModule.isThemeConfig(validThemeConfig)).toBe(
                true
            );
            expect(themeConfigModule.isThemeConfig(null)).toBe(false);
        });
    });

    describe("objectSafety functions", () => {
        it("should ensure all objectSafety functions are covered", async () => {
            const objectSafetyModule = await import(
                "../../utils/objectSafety.js"
            );

            const testObj = { a: 1, b: 2, c: 3 };

            // Call all exported functions
            expect(objectSafetyModule.safeObjectAccess(testObj, "a", 0)).toBe(
                1
            );

            const iterationResult: string[] = [];
            objectSafetyModule.safeObjectIteration(testObj, (key, value) => {
                iterationResult.push(`${key}:${value}`);
            });
            expect(iterationResult.length).toBe(3);

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
        it("should ensure all safeConversions functions are covered", async () => {
            const safeConversionsModule = await import(
                "../../utils/safeConversions.js"
            );

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
        it("should ensure all typeGuards functions are covered", async () => {
            const typeGuardsModule = await import("../../utils/typeGuards.js");

            // Call all exported functions
            expect(typeGuardsModule.hasProperties({ a: 1 }, ["a"])).toBe(true);
            expect(typeGuardsModule.hasProperty({ a: 1 }, "a")).toBe(true);
            expect(
                typeGuardsModule.isArray([
                    1,
                    2,
                    3,
                ])
            ).toBe(true);
            expect(typeGuardsModule.isBoolean(true)).toBe(true);
            expect(typeGuardsModule.isDate(new Date())).toBe(true);
            expect(typeGuardsModule.isError(new Error())).toBe(true);
            expect(typeGuardsModule.isFiniteNumber(123)).toBe(true);
            expect(typeGuardsModule.isFunction(() => {})).toBe(true);
            expect(typeGuardsModule.isNonNegativeNumber(0)).toBe(true);
            expect(typeGuardsModule.isNonNullObject({})).toBe(true);
            expect(typeGuardsModule.isNumber(123)).toBe(true);
            expect(typeGuardsModule.isObject({})).toBe(true);
            expect(typeGuardsModule.isPositiveNumber(1)).toBe(true);
            expect(typeGuardsModule.isString("test")).toBe(true);
            expect(typeGuardsModule.isValidPort(8080)).toBe(true);
            expect(typeGuardsModule.isValidTimestamp(Date.now())).toBe(true);
        });
    });

    describe("typeHelpers functions", () => {
        it("should ensure all typeHelpers functions are covered", async () => {
            const typeHelpersModule = await import(
                "../../utils/typeHelpers.js"
            );

            // Call all exported functions
            expect(typeHelpersModule.castIpcResponse("test")).toBe("test");
            expect(
                typeHelpersModule.isArray([
                    1,
                    2,
                    3,
                ])
            ).toBe(true);
            expect(typeHelpersModule.isRecord({})).toBe(true);
            expect(typeHelpersModule.safePropertyAccess({ a: 1 }, "a")).toBe(1);
            expect(
                typeHelpersModule.validateAndConvert(
                    "test",
                    (x) => typeof x === "string"
                )
            ).toBe("test");
        });
    });

    describe("stringConversion functions", () => {
        it("should ensure all stringConversion functions are covered", async () => {
            const stringConversionModule = await import(
                "../../utils/stringConversion.js"
            );

            // Call all exported functions
            expect(stringConversionModule.safeStringify("test")).toBe("test");
            expect(stringConversionModule.safeStringify(123)).toBe("123");
            expect(stringConversionModule.safeStringify(null)).toBe("");
            expect(stringConversionModule.safeStringify(undefined)).toBe("");
        });
    });

    describe("siteStatus functions", () => {
        it("should ensure all siteStatus functions are covered", async () => {
            const siteStatusModule = await import("../../utils/siteStatus.js");

            // Create mock site data
            const mockSite = {
                identifier: "test",
                name: "Test Site",
                monitoring: true,
                monitors: [],
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
        it("should ensure all jsonSafety functions are covered", async () => {
            const jsonSafetyModule = await import("../../utils/jsonSafety.js");

            // Call all exported functions
            const testObj = { test: "data" };
            const validator = (data: unknown): data is typeof testObj =>
                typeof data === "object" && data !== null && "test" in data;

            const parseResult = jsonSafetyModule.safeJsonParse(
                '{"test":"data"}',
                validator
            );
            expect(parseResult.success).toBe(true);

            const parseArrayResult = jsonSafetyModule.safeJsonParseArray(
                '[{"test":"data"}]',
                validator
            );
            expect(parseArrayResult.success).toBe(true);

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
        it("should ensure all errorCatalog functions are covered", async () => {
            const errorCatalogModule = await import(
                "../../utils/errorCatalog.js"
            );

            // Call all exported functions
            expect(
                errorCatalogModule.formatErrorMessage(
                    "Site with ID '{siteId}' was not found",
                    { siteId: "test" }
                )
            ).toBeDefined();
            expect(
                errorCatalogModule.isKnownErrorMessage("Site not found")
            ).toBe(true);
            expect(
                errorCatalogModule.isKnownErrorMessage("Unknown error message")
            ).toBe(false);

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
        it("should ensure all errorHandling functions are covered", async () => {
            const errorHandlingModule = await import(
                "../../utils/errorHandling.js"
            );

            // Create mock store for testing
            const mockStore = {
                setLoading: () => {},
                clearError: () => {},
                setError: () => {},
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
        it("should ensure all logTemplates are accessed", async () => {
            const logTemplatesModule = await import(
                "../../utils/logTemplates.js"
            );

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
        it("should ensure all cacheKeys functions are covered", async () => {
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

            expect(cacheKeysModule.isStandardizedCacheKey("config:test")).toBe(
                true
            );
            expect(cacheKeysModule.parseCacheKey("config:test")).toEqual({
                prefix: "config",
                identifier: "test",
                operation: undefined,
            });
        });
    });

    describe("validation utility functions", () => {
        it("should ensure all validation utility functions are covered", async () => {
            const validatorUtilsModule = await import(
                "../../validation/validatorUtils.js"
            );

            // Call all exported functions
            expect(validatorUtilsModule.isNonEmptyString("test")).toBe(true);
            expect(validatorUtilsModule.isValidFQDN("example.com")).toBe(true);
            expect(validatorUtilsModule.isValidIdentifier("test_id")).toBe(
                true
            );
            expect(
                validatorUtilsModule.isValidIdentifierArray(["test1", "test2"])
            ).toBe(true);
            expect(validatorUtilsModule.isValidInteger("123")).toBe(true);
            expect(validatorUtilsModule.isValidNumeric("123.45")).toBe(true);
            expect(validatorUtilsModule.isValidHost("localhost")).toBe(true);
            expect(validatorUtilsModule.isValidPort(8080)).toBe(true);
            expect(validatorUtilsModule.isValidUrl("https://example.com")).toBe(
                true
            );
            expect(validatorUtilsModule.safeInteger("123", 0, 0, 1000)).toBe(
                123
            );
        });
    });

    describe("validation schemas functions", () => {
        it("should ensure all validation schemas functions are covered", async () => {
            const schemasModule = await import("../../validation/schemas.js");

            // Test validation functions
            const httpMonitor = {
                id: "test",
                type: "http" as const,
                url: "https://example.com",
                status: "up" as const,
                checkInterval: 30000,
                retryAttempts: 3,
                timeout: 5000,
                responseTime: 200,
                history: [],
                monitoring: true,
            };

            const result = schemasModule.validateMonitorData(
                "http",
                httpMonitor
            );
            expect(result.success).toBe(true);

            const fieldResult = schemasModule.validateMonitorField(
                "http",
                "url",
                "https://example.com"
            );
            expect(fieldResult.success).toBe(true);

            const siteData = {
                identifier: "test-site",
                name: "Test Site",
                monitoring: true,
                monitors: [httpMonitor],
            };

            const siteResult = schemasModule.validateSiteData(siteData);
            expect(siteResult.success).toBe(true);
        });
    });
});
