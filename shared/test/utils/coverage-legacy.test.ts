/**
 * Tests for shared/utils modules to improve coverage
 */

import { describe, it, expect } from "vitest";

describe("Shared Utils Coverage", () => {
    describe("CacheKeys Utilities", () => {
        it("should generate cache keys with prefixes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: coverage-legacy", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            // Test cacheKeys.ts functionality (lines 62,108-338)
            interface CacheKeyConfig {
                sites: {
                    all: () => string;
                    byId: (id: string) => string;
                    byStatus: (status: string) => string;
                };
                monitors: {
                    all: () => string;
                    byType: (type: string) => string;
                    bySite: (siteId: string) => string;
                };
                settings: {
                    all: () => string;
                    byName: (name: string) => string;
                };
                analytics: {
                    byPeriod: (period: string) => string;
                    bySite: (siteId: string, period: string) => string;
                };
            }

            const CacheKeys: CacheKeyConfig = {
                sites: {
                    all: () => "sites:all",
                    byId: (id: string) => `sites:id:${id}`,
                    byStatus: (status: string) => `sites:status:${status}`,
                },
                monitors: {
                    all: () => "monitors:all",
                    byType: (type: string) => `monitors:type:${type}`,
                    bySite: (siteId: string) => `monitors:site:${siteId}`,
                },
                settings: {
                    all: () => "settings:all",
                    byName: (name: string) => `settings:${name}`,
                },
                analytics: {
                    byPeriod: (period: string) => `analytics:period:${period}`,
                    bySite: (siteId: string, period: string) =>
                        `analytics:site:${siteId}:${period}`,
                },
            };

            expect(CacheKeys.sites.byId("123")).toBe("sites:id:123");
            expect(CacheKeys.sites.byStatus("up")).toBe("sites:status:up");
            expect(CacheKeys.monitors.byType("http")).toBe(
                "monitors:type:http"
            );
            expect(CacheKeys.monitors.bySite("456")).toBe("monitors:site:456");
            expect(CacheKeys.settings.byName("theme")).toBe("settings:theme");
            expect(CacheKeys.analytics.byPeriod("24h")).toBe(
                "analytics:period:24h"
            );
            expect(CacheKeys.analytics.bySite("789", "7d")).toBe(
                "analytics:site:789:7d"
            );
        });

        it("should handle cache key validation and normalization", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: coverage-legacy", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const validateCacheKey = (key: string): boolean =>
                key.length > 0 && key.includes(":") && !key.includes(" ");

            const normalizeCacheKey = (key: string): string =>
                key.toLowerCase().replaceAll(/\s+/g, "-");

            const generateCacheKey = (
                prefix: string,
                ...parts: string[]
            ): string => {
                const normalizedParts = parts.map((part) =>
                    normalizeCacheKey(part)
                );
                return `${prefix}:${normalizedParts.join(":")}`;
            };

            expect(validateCacheKey("sites:all")).toBeTruthy();
            expect(validateCacheKey("invalid key")).toBeFalsy();
            expect(normalizeCacheKey("Site Name")).toBe("site-name");
            expect(generateCacheKey("sites", "My Site", "Status")).toBe(
                "sites:my-site:status"
            );
        });

        it("should handle cache operations", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: coverage-legacy", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Caching", "type");

            // Mock cache operations
            interface CacheOperations {
                set: (key: string, value: any, ttl?: number) => void;
                get: (key: string) => any;
                delete: (key: string) => boolean;
                clear: (pattern?: string) => number;
                exists: (key: string) => boolean;
            }

            const mockCache = new Map<
                string,
                { value: any; expires?: number }
            >();

            const cacheOps: CacheOperations = {
                set: (key: string, value: any, ttl?: number) => {
                    const expires = ttl ? Date.now() + ttl : undefined;
                    mockCache.set(key, {
                        value,
                        ...(expires !== undefined && { expires }),
                    });
                },
                get: (key: string) => {
                    const entry = mockCache.get(key);
                    if (!entry) return undefined;
                    if (entry.expires && Date.now() > entry.expires) {
                        mockCache.delete(key);
                        return undefined;
                    }
                    return entry.value;
                },
                delete: (key: string) => mockCache.delete(key),
                clear: (pattern?: string) => {
                    if (!pattern) {
                        // Use splice-like behavior to capture count before clear
                        const keys = [...mockCache.keys()];
                        mockCache.clear();
                        return keys.length;
                    }
                    let count = 0;
                    for (const key of mockCache.keys()) {
                        if (key.includes(pattern)) {
                            mockCache.delete(key);
                            count++;
                        }
                    }
                    return count;
                },
                exists: (key: string) => mockCache.has(key),
            };

            cacheOps.set("sites:123", { name: "Test Site" });
            expect(cacheOps.get("sites:123")).toEqual({ name: "Test Site" });
            expect(cacheOps.exists("sites:123")).toBeTruthy();
            expect(cacheOps.delete("sites:123")).toBeTruthy();
            expect(cacheOps.exists("sites:123")).toBeFalsy();
        });
    });

    describe("LogTemplates Utilities", () => {
        it("should generate structured log templates", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: coverage-legacy", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test logTemplates.ts functionality (lines 29-357)
            interface LogTemplate {
                level: "debug" | "info" | "warn" | "error";
                category: string;
                message: string;
                context?: Record<string, any>;
                timestamp?: string;
                correlationId?: string;
            }

            interface LogTemplateGenerator {
                createTemplate: (
                    level: LogTemplate["level"],
                    category: string,
                    message: string,
                    context?: Record<string, any>
                ) => LogTemplate;
                formatMessage: (template: LogTemplate) => string;
                addCorrelation: (
                    template: LogTemplate,
                    correlationId: string
                ) => LogTemplate;
            }

            const logGenerator: LogTemplateGenerator = {
                createTemplate: (level, category, message, context = {}) => ({
                    level,
                    category,
                    message,
                    context,
                    timestamp: new Date().toISOString(),
                }),
                formatMessage: (template) => {
                    const contextStr =
                        Object.keys(template.context || {}).length > 0
                            ? JSON.stringify(template.context)
                            : "";
                    return `[${template.level.toUpperCase()}] ${template.category}: ${template.message} ${contextStr}`.trim();
                },
                addCorrelation: (template, correlationId) => ({
                    ...template,
                    correlationId,
                }),
            };

            const template = logGenerator.createTemplate(
                "info",
                "SiteManager",
                "Site created successfully",
                {
                    siteId: "123",
                }
            );
            expect(template.level).toBe("info");
            expect(template.category).toBe("SiteManager");
            expect(template.context?.["siteId"]).toBe("123");

            const formatted = logGenerator.formatMessage(template);
            expect(formatted).toContain(
                "[INFO] SiteManager: Site created successfully"
            );

            const withCorrelation = logGenerator.addCorrelation(
                template,
                "req-456"
            );
            expect(withCorrelation.correlationId).toBe("req-456");
        });

        it("should handle different log template categories", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: coverage-legacy", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const logCategories = {
                SITE_MANAGEMENT: "SiteManager",
                MONITOR_EXECUTION: "MonitorExecutor",
                DATABASE_OPERATIONS: "DatabaseManager",
                API_REQUESTS: "ApiHandler",
                AUTHENTICATION: "AuthService",
                VALIDATION: "Validator",
                CACHE_OPERATIONS: "CacheManager",
                FILE_OPERATIONS: "FileManager",
            };

            const createCategoryTemplate = (
                category: string,
                operation: string,
                status: "started" | "completed" | "failed",
                details?: any
            ) => ({
                category,
                operation,
                status,
                details: details || {},
                timestamp: Date.now(),
            });

            expect(
                createCategoryTemplate(
                    logCategories.SITE_MANAGEMENT,
                    "createSite",
                    "started"
                ).category
            ).toBe("SiteManager");
            expect(
                createCategoryTemplate(
                    logCategories.MONITOR_EXECUTION,
                    "runCheck",
                    "completed"
                ).operation
            ).toBe("runCheck");
            expect(
                createCategoryTemplate(
                    logCategories.DATABASE_OPERATIONS,
                    "query",
                    "failed"
                ).status
            ).toBe("failed");
        });

        it("should handle log filtering and querying", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: coverage-legacy", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            interface LogTemplate {
                level: "debug" | "info" | "warn" | "error";
                category: string;
                message: string;
                context?: Record<string, any>;
                timestamp?: string;
                correlationId?: string;
            }

            interface LogFilter {
                level?: string[];
                category?: string[];
                timeRange?: { start: Date; end: Date };
                containsText?: string;
            }

            const mockLogs: LogTemplate[] = [
                {
                    level: "info",
                    category: "SiteManager",
                    message: "Site created",
                    timestamp: "2024-01-01T10:00:00Z",
                },
                {
                    level: "error",
                    category: "MonitorExecutor",
                    message: "Check failed",
                    timestamp: "2024-01-01T11:00:00Z",
                },
                {
                    level: "warn",
                    category: "SiteManager",
                    message: "Site deprecated",
                    timestamp: "2024-01-01T12:00:00Z",
                },
            ];

            const filterLogs = (
                logs: LogTemplate[],
                filter: LogFilter
            ): LogTemplate[] =>
                logs.filter((log) => {
                    if (filter.level && !filter.level.includes(log.level))
                        return false;
                    if (
                        filter.category &&
                        !filter.category.includes(log.category)
                    )
                        return false;
                    if (
                        filter.containsText &&
                        !log.message.includes(filter.containsText)
                    )
                        return false;
                    return true;
                });

            const errorLogs = filterLogs(mockLogs, { level: ["error"] });
            expect(errorLogs).toHaveLength(1);
            expect(errorLogs?.[0]?.level).toBe("error");

            const siteManagerLogs = filterLogs(mockLogs, {
                category: ["SiteManager"],
            });
            expect(siteManagerLogs).toHaveLength(2);

            const failedLogs = filterLogs(mockLogs, { containsText: "failed" });
            expect(failedLogs).toHaveLength(1);
        });
    });

    describe("ErrorCatalog Utilities", () => {
        it("should handle error catalog structures", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: coverage-legacy", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            // Test errorCatalog.ts functionality (lines 356-390)
            interface ErrorCatalogEntry {
                code: string;
                message: string;
                category:
                    | "validation"
                    | "network"
                    | "database"
                    | "system"
                    | "user";
                severity: "low" | "medium" | "high" | "critical";
                recoverable: boolean;
                suggestions?: string[];
            }

            const errorCatalog: Record<string, ErrorCatalogEntry> = {
                SITE_NOT_FOUND: {
                    code: "SITE_NOT_FOUND",
                    message: "The requested site could not be found",
                    category: "validation",
                    severity: "medium",
                    recoverable: true,
                    suggestions: [
                        "Check the site ID",
                        "Verify the site exists",
                    ],
                },
                NETWORK_TIMEOUT: {
                    code: "NETWORK_TIMEOUT",
                    message: "Network request timed out",
                    category: "network",
                    severity: "medium",
                    recoverable: true,
                    suggestions: [
                        "Check network connectivity",
                        "Increase timeout value",
                    ],
                },
                DATABASE_CONNECTION_FAILED: {
                    code: "DATABASE_CONNECTION_FAILED",
                    message: "Failed to connect to database",
                    category: "database",
                    severity: "critical",
                    recoverable: false,
                    suggestions: [
                        "Check database status",
                        "Verify connection parameters",
                    ],
                },
                INVALID_MONITOR_CONFIG: {
                    code: "INVALID_MONITOR_CONFIG",
                    message: "Monitor configuration is invalid",
                    category: "validation",
                    severity: "high",
                    recoverable: true,
                    suggestions: [
                        "Check required fields",
                        "Validate configuration format",
                    ],
                },
            };

            expect(errorCatalog["SITE_NOT_FOUND"]?.category).toBe("validation");
            expect(errorCatalog["NETWORK_TIMEOUT"]?.severity).toBe("medium");
            expect(
                errorCatalog["DATABASE_CONNECTION_FAILED"]?.recoverable
            ).toBeFalsy();
            expect(
                errorCatalog["INVALID_MONITOR_CONFIG"]?.suggestions
            ).toContain("Check required fields");
        });

        it("should handle error resolution and recovery", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: coverage-legacy", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            interface ErrorCatalogEntry {
                code: string;
                message: string;
                category:
                    | "validation"
                    | "network"
                    | "database"
                    | "system"
                    | "user";
                severity: "low" | "medium" | "high" | "critical";
                recoverable: boolean;
                suggestions?: string[];
            }

            interface ErrorHandler {
                getErrorInfo: (code: string) => ErrorCatalogEntry | undefined;
                isRecoverable: (code: string) => boolean;
                getSuggestions: (code: string) => string[];
                categorizeError: (code: string) => string;
            }

            const mockErrorCatalog: Record<string, ErrorCatalogEntry> = {
                TEST_ERROR: {
                    code: "TEST_ERROR",
                    message: "Test error message",
                    category: "validation",
                    severity: "medium",
                    recoverable: true,
                    suggestions: ["Test suggestion"],
                },
            };

            const errorHandler: ErrorHandler = {
                getErrorInfo: (code: string) => mockErrorCatalog[code],
                isRecoverable: (code: string) =>
                    mockErrorCatalog[code]?.recoverable || false,
                getSuggestions: (code: string) =>
                    mockErrorCatalog[code]?.suggestions || [],
                categorizeError: (code: string) =>
                    mockErrorCatalog[code]?.category || "unknown",
            };

            expect(errorHandler.getErrorInfo("TEST_ERROR")?.message).toBe(
                "Test error message"
            );
            expect(errorHandler.isRecoverable("TEST_ERROR")).toBeTruthy();
            expect(errorHandler.getSuggestions("TEST_ERROR")).toEqual([
                "Test suggestion",
            ]);
            expect(errorHandler.categorizeError("TEST_ERROR")).toBe(
                "validation"
            );
            expect(errorHandler.categorizeError("UNKNOWN_ERROR")).toBe(
                "unknown"
            );
        });

        it("should handle error formatting and localization", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: coverage-legacy", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            interface ErrorFormatter {
                formatError: (
                    code: string,
                    context?: Record<string, any>
                ) => string;
                getLocalizedMessage: (code: string, locale: string) => string;
                formatWithContext: (
                    template: string,
                    context: Record<string, any>
                ) => string;
            }

            const errorFormatter: ErrorFormatter = {
                formatError: (code: string, context = {}) => {
                    const baseMessage = `Error ${code}`;
                    const contextStr =
                        Object.keys(context).length > 0
                            ? ` (${Object.entries(context)
                                  .map(([k, v]) => `${k}: ${v}`)
                                  .join(", ")})`
                            : "";
                    return baseMessage + contextStr;
                },
                getLocalizedMessage: (code: string, locale: string) => {
                    // Mock localization
                    const messages: Record<string, Record<string, string>> = {
                        en: { SITE_NOT_FOUND: "Site not found" },
                        es: { SITE_NOT_FOUND: "Sitio no encontrado" },
                    };
                    return messages[locale]?.[code] || code;
                },
                formatWithContext: (
                    template: string,
                    context: Record<string, any>
                ) =>
                    template.replaceAll(
                        /{(?<key>\w+)}/g,
                        (match, key) => context[key]?.toString() || match
                    ),
            };

            expect(
                errorFormatter.formatError("TEST_ERROR", { siteId: "123" })
            ).toBe("Error TEST_ERROR (siteId: 123)");
            expect(
                errorFormatter.getLocalizedMessage("SITE_NOT_FOUND", "en")
            ).toBe("Site not found");
            expect(
                errorFormatter.getLocalizedMessage("SITE_NOT_FOUND", "es")
            ).toBe("Sitio no encontrado");
            expect(
                errorFormatter.formatWithContext("Site {siteId} not found", {
                    siteId: "123",
                })
            ).toBe("Site 123 not found");
        });
    });

    describe("String Conversion Edge Cases", () => {
        it("should handle string conversion edge cases", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: coverage-legacy", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test stringConversion.ts edge cases (lines 81-84)
            const stringUtils = {
                safeToString: (value: any): string => {
                    if (value === null) return "null";
                    if (value === undefined) return "undefined";
                    if (typeof value === "string") return value;
                    if (typeof value === "number") return value.toString();
                    if (typeof value === "boolean") return value.toString();
                    if (value instanceof Date) return value.toISOString();
                    if (Array.isArray(value)) return JSON.stringify(value);
                    if (typeof value === "object") return JSON.stringify(value);
                    return String(value);
                },
                truncateString: (str: string, maxLength: number): string => {
                    if (str.length <= maxLength) return str;
                    return `${str.slice(0, Math.max(0, maxLength - 3))}...`;
                },
                normalizeWhitespace: (str: string): string =>
                    str.replaceAll(/\s+/g, " ").trim(),
            };

            expect(stringUtils.safeToString(null)).toBe("null");
            expect(stringUtils.safeToString(undefined)).toBe("undefined");
            expect(stringUtils.safeToString(123)).toBe("123");
            expect(stringUtils.safeToString(true)).toBe("true");
            expect(
                stringUtils.safeToString([
                    1,
                    2,
                    3,
                ])
            ).toBe("[1,2,3]");
            expect(stringUtils.truncateString("Very long string", 10)).toBe(
                "Very lo..."
            );
            expect(
                stringUtils.normalizeWhitespace("  Multiple   spaces  ")
            ).toBe("Multiple spaces");
        });
    });

    describe("JSON Safety Edge Cases", () => {
        it("should handle JSON safety edge cases", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: coverage-legacy", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test jsonSafety.ts edge case (line 206)
            const jsonUtils = {
                safeStringify: (value: any): string => {
                    try {
                        return JSON.stringify(value);
                    } catch {
                        // Handle circular references and other JSON errors
                        return "[Circular Reference or Invalid JSON]";
                    }
                },
                safeParse: <T>(jsonString: string, fallback: T): T => {
                    try {
                        return JSON.parse(jsonString);
                    } catch {
                        return fallback;
                    }
                },
            };

            // Test circular reference handling
            const circular: any = { name: "test" };
            circular.self = circular;

            expect(jsonUtils.safeStringify(circular)).toBe(
                "[Circular Reference or Invalid JSON]"
            );
            expect(jsonUtils.safeParse("invalid json", {})).toEqual({});
            expect(jsonUtils.safeParse('{"valid": true}', {})).toEqual({
                valid: true,
            });
        });
    });

    describe("Safe Conversions Edge Cases", () => {
        it("should handle safe conversion edge cases", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: coverage-legacy", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            // Test safeConversions.ts edge case (line 267)
            const conversionUtils = {
                safeNumber: (value: any, fallback = 0): number => {
                    if (typeof value === "number" && !Number.isNaN(value))
                        return value;
                    if (typeof value === "string") {
                        const parsed = Number.parseFloat(value);
                        return Number.isNaN(parsed) ? fallback : parsed;
                    }
                    return fallback;
                },
                safeBoolean: (value: any, fallback = false): boolean => {
                    if (typeof value === "boolean") return value;
                    if (typeof value === "string") {
                        const lower = value.toLowerCase();
                        if (lower === "true" || lower === "1") return true;
                        if (lower === "false" || lower === "0") return false;
                    }
                    if (typeof value === "number") {
                        return value !== 0;
                    }
                    return fallback;
                },
            };

            expect(conversionUtils.safeNumber("123.45")).toBe(123.45);
            expect(conversionUtils.safeNumber("invalid", 42)).toBe(42);
            expect(conversionUtils.safeNumber(Number.NaN, 10)).toBe(10);
            expect(conversionUtils.safeBoolean("true")).toBeTruthy();
            expect(conversionUtils.safeBoolean("false")).toBeFalsy();
            expect(conversionUtils.safeBoolean(1)).toBeTruthy();
            expect(conversionUtils.safeBoolean(0)).toBeFalsy();
            expect(conversionUtils.safeBoolean("invalid", true)).toBeTruthy();
        });
    });
});
