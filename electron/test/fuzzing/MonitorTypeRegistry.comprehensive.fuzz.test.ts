/**
 * Property-based fuzzing tests for MonitorTypeRegistry operations.
 *
 * @remarks
 * Tests MonitorTypeRegistry operations using property-based testing with
 * fast-check. Validates that type registration, validation, and retrieval
 * handle malformed input and edge cases gracefully.
 *
 * Key areas tested:
 *
 * - Monitor type registration and validation
 * - Configuration retrieval robustness
 * - Service factory generation
 * - Type guard operations
 * - Error handling in registry operations
 *
 * @packageDocumentation
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import fc from "fast-check";
import { z } from "zod";
import type { MonitorFieldDefinition, MonitorType } from "@shared/types";
import type { IMonitorService } from "../../services/monitoring/types";
import {
    getMonitorTypeConfig,
    getRegisteredMonitorTypes,
    isValidMonitorType,
    getAllMonitorTypeConfigs,
    getMonitorServiceFactory,
    registerMonitorType,
    createMonitorWithTypeGuards,
    isValidMonitorTypeGuard,
    migrateMonitorType,
    type BaseMonitorConfig,
} from "../../services/monitoring/MonitorTypeRegistry";

describe("MonitorTypeRegistry Fuzzing Tests", () => {
    beforeEach(() => {
        // Note: We preserve the original registry state in memory
        // but don't store it since the registry doesn't support removal
    });

    afterEach(() => {
        // Note: Registry may not support removal, so we handle gracefully
        vi.clearAllMocks();
    });

    describe(getMonitorTypeConfig, () => {
        it("should handle arbitrary string inputs gracefully", () => {
            fc.assert(
                fc.property(fc.string(), (input: string) => {
                    // Property: function should never throw for any string input
                    expect(() => getMonitorTypeConfig(input)).not.toThrow();

                    const result = getMonitorTypeConfig(input);
                    // Property: result is either undefined or a valid config object
                    if (result !== undefined) {
                        expect(typeof result).toBe("object");
                        expect(typeof result.type).toBe("string");
                        expect(typeof result.displayName).toBe("string");
                        expect(typeof result.description).toBe("string");
                        expect(Array.isArray(result.fields)).toBeTruthy();
                    }
                })
            );
        });

        it("should handle edge case strings", () => {
            const edgeCases = [
                "",
                "   ",
                "\n\t",
                "🚀",
                "test123",
                "very-long-string-".repeat(100),
            ];

            for (const testCase of edgeCases) {
                expect(() => getMonitorTypeConfig(testCase)).not.toThrow();
                const result = getMonitorTypeConfig(testCase);
                if (result) {
                    expect(typeof result).toBe("object");
                }
            }
        });
    });

    describe(isValidMonitorType, () => {
        it("should validate monitor types safely with any input", () => {
            fc.assert(
                fc.property(fc.string(), (input: string) => {
                    // Property: validation should never throw
                    expect(() => isValidMonitorType(input)).not.toThrow();

                    const result = isValidMonitorType(input);
                    // Property: result must be a boolean
                    expect(typeof result).toBe("boolean");
                })
            );
        });

        it("should handle malformed input types", () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.string(),
                        fc.constant(null),
                        fc.constant(undefined),
                        fc.integer(),
                        fc.object(),
                        fc.array(fc.string())
                    ),
                    (input: any) => {
                        // Property: should handle non-string inputs gracefully
                        expect(() => isValidMonitorType(input)).not.toThrow();
                    }
                )
            );
        });
    });

    describe(getRegisteredMonitorTypes, () => {
        it("should always return a valid array", () => {
            fc.assert(
                fc.property(fc.constant(null), () => {
                    const types = getRegisteredMonitorTypes();
                    // Property: always returns an array
                    expect(Array.isArray(types)).toBeTruthy();

                    // Property: all elements are non-empty strings
                    for (const type of types) {
                        expect(typeof type).toBe("string");
                        expect(type.length).toBeGreaterThan(0);
                    }
                })
            );
        });
    });

    describe(getAllMonitorTypeConfigs, () => {
        it("should return valid configuration array", () => {
            const configs = getAllMonitorTypeConfigs();
            expect(Array.isArray(configs)).toBeTruthy();

            for (const config of configs) {
                expect(typeof config).toBe("object");
                expect(typeof config.type).toBe("string");
                expect(typeof config.displayName).toBe("string");
                expect(typeof config.description).toBe("string");
                expect(Array.isArray(config.fields)).toBeTruthy();
            }
        });
    });

    describe(getMonitorServiceFactory, () => {
        it("should handle arbitrary string inputs gracefully", () => {
            fc.assert(
                fc.property(fc.string(), (input: string) => {
                    // Property: should never throw for any string input
                    expect(() => getMonitorServiceFactory(input)).not.toThrow();
                })
            );
        });
    });

    describe(registerMonitorType, () => {
        it("should handle valid monitor config registration", () => {
            const validConfig: BaseMonitorConfig = {
                type: "test-fuzz-type",
                displayName: "Test Fuzz Type",
                description: "For fuzzing tests",
                version: "1.0.0",
                fields: [
                    {
                        name: "url",
                        label: "URL",
                        type: "url",
                        required: true,
                    },
                ],
                serviceFactory: () =>
                    ({
                        check: vi.fn().mockResolvedValue({
                            status: "up" as const,
                            responseTime: 100,
                            timestamp: Date.now(),
                        }),
                        getType: vi.fn().mockReturnValue("test-fuzz-type"),
                        updateConfig: vi.fn(),
                    }) as IMonitorService,
                validationSchema: z.object({
                    type: z.string(),
                    url: z.string().url(),
                }),
            };

            expect(() => registerMonitorType(validConfig)).not.toThrow();
            expect(isValidMonitorType(validConfig.type)).toBeTruthy();
            expect(getMonitorTypeConfig(validConfig.type)).toBeDefined();
        });

        it("should handle edge cases in field definitions", () => {
            fc.assert(
                fc.property(
                    fc
                        .record({
                            name: fc.string({ minLength: 1, maxLength: 50 }),
                            label: fc.string({ minLength: 1, maxLength: 100 }),
                            type: fc.constantFrom(
                                "text",
                                "number",
                                "url",
                                "select"
                            ),
                            required: fc.boolean(),
                            helpText: fc.option(fc.string({ maxLength: 200 })),
                            placeholder: fc.option(
                                fc.string({ maxLength: 100 })
                            ),
                            min: fc.option(
                                fc.integer({ min: 0, max: 1_000_000 })
                            ),
                            max: fc.option(
                                fc.integer({ min: 0, max: 1_000_000 })
                            ),
                            options: fc.option(
                                fc.array(
                                    fc.record({
                                        label: fc.string({
                                            minLength: 1,
                                            maxLength: 50,
                                        }),
                                        value: fc.string({
                                            minLength: 1,
                                            maxLength: 50,
                                        }),
                                    }),
                                    { minLength: 1, maxLength: 10 }
                                )
                            ),
                        })
                        .map((obj) => {
                            // Remove undefined properties to match exact optional property types
                            const result: any = {
                                name: obj.name,
                                label: obj.label,
                                type: obj.type,
                                required: obj.required,
                            };
                            if (obj.helpText !== null)
                                result.helpText = obj.helpText;
                            if (obj.placeholder !== null)
                                result.placeholder = obj.placeholder;
                            if (obj.min !== null) result.min = obj.min;
                            if (obj.max !== null) result.max = obj.max;
                            if (obj.options !== null)
                                result.options = obj.options;
                            return result as MonitorFieldDefinition;
                        }),
                    (field: MonitorFieldDefinition) => {
                        const config: BaseMonitorConfig = {
                            type: `test-field-${Math.random()}`,
                            displayName: "Test Field",
                            description: "For field testing",
                            version: "1.0.0",
                            fields: [field],
                            serviceFactory: () =>
                                ({
                                    check: vi.fn().mockResolvedValue({
                                        status: "up" as const,
                                    }),
                                    getType: vi.fn().mockReturnValue("test"),
                                    updateConfig: vi.fn(),
                                }) as IMonitorService,
                            validationSchema: z.object({ type: z.string() }),
                        };

                        // Property: registration with valid field should not throw
                        expect(() => registerMonitorType(config)).not.toThrow();
                    }
                )
            );
        });
    });

    describe(isValidMonitorTypeGuard, () => {
        it("should handle arbitrary input safely", () => {
            fc.assert(
                fc.property(fc.string(), (input: string) => {
                    // Property: type guard should never throw
                    expect(() => isValidMonitorTypeGuard(input)).not.toThrow();

                    const result = isValidMonitorTypeGuard(input);
                    // Property: result must be boolean
                    expect(typeof result).toBe("boolean");
                })
            );
        });
    });

    describe(createMonitorWithTypeGuards, () => {
        it("should handle monitor creation with type guards", () => {
            // Register a test type first
            const testConfig: BaseMonitorConfig = {
                type: "test-guard-type",
                displayName: "Test Guard Type",
                description: "For guard testing",
                version: "1.0.0",
                fields: [],
                serviceFactory: () =>
                    ({
                        check: vi
                            .fn()
                            .mockResolvedValue({ status: "up" as const }),
                        getType: vi.fn().mockReturnValue("test-guard-type"),
                        updateConfig: vi.fn(),
                    }) as IMonitorService,
                validationSchema: z.object({ type: z.string() }),
            };

            registerMonitorType(testConfig);

            const testMonitor = {
                id: "test-123",
                name: "Test Monitor",
                type: "test-guard-type" as MonitorType,
                enabled: true,
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: true,
                history: [],
            };

            expect(() =>
                createMonitorWithTypeGuards("test-guard-type", testMonitor)
            ).not.toThrow();
        });
    });

    describe(migrateMonitorType, () => {
        it("should handle migration parameters safely", () => {
            fc.assert(
                fc.property(
                    fc.string(),
                    fc.string(),
                    fc.record({}),
                    (
                        fromType: string,
                        _toType: string,
                        data: Record<string, any>
                    ) => {
                        // Property: migration should not throw with any parameters
                        expect(() =>
                            migrateMonitorType(
                                fromType as MonitorType,
                                "1.0.0",
                                "2.0.0",
                                data
                            )
                        ).not.toThrow();
                    }
                )
            );
        });
    });

    describe("Edge Cases and Security", () => {
        it("should handle SQL injection attempts", () => {
            const sqlInjectionAttempts = [
                "'; DROP TABLE monitors; --",
                '" OR 1=1 --',
                "admin'/*",
                "1' UNION SELECT * FROM users--",
                "'/**/OR/**/1/**/=/**/1",
                'http"; DELETE FROM monitors WHERE 1=1; --',
            ];

            for (const maliciousInput of sqlInjectionAttempts) {
                expect(() =>
                    getMonitorTypeConfig(maliciousInput)
                ).not.toThrow();
                expect(() => isValidMonitorType(maliciousInput)).not.toThrow();
                expect(() =>
                    getMonitorServiceFactory(maliciousInput)
                ).not.toThrow();

                const result = getMonitorTypeConfig(maliciousInput);
                expect(result).toBeUndefined(); // Should not find malicious "types"
            }
        });

        it("should handle XSS attempts", () => {
            const xssAttempts = [
                "<script>alert('xss')</script>",
                "data:text/html,<script>alert('xss')</script>",
                "<img src=x onerror=alert('xss')>",
                "data:text/html,<script>alert('xss')</script>",
                "&#60;script&#62;alert('xss')&#60;/script&#62;",
            ];

            for (const maliciousInput of xssAttempts) {
                expect(() =>
                    getMonitorTypeConfig(maliciousInput)
                ).not.toThrow();
                expect(() => isValidMonitorType(maliciousInput)).not.toThrow();

                const result = getMonitorTypeConfig(maliciousInput);
                expect(result).toBeUndefined();
            }
        });

        it("should handle unicode and special characters", () => {
            const specialChars = [
                "🚀💻🔥",
                "测试类型",
                "тип мониторинга",
                "نوع المراقبة",
                "\u0000\u0001\u0002",
                "type\nwith\nnewlines",
                "type\twith\ttabs",
                `${String.fromCodePoint(0xfe_ff)}bom-type`,
            ];

            for (const input of specialChars) {
                expect(() => getMonitorTypeConfig(input)).not.toThrow();
                expect(() => isValidMonitorType(input)).not.toThrow();
                expect(() => getMonitorServiceFactory(input)).not.toThrow();
            }
        });

        it("should handle very large inputs", () => {
            const largeString = "a".repeat(100_000);
            const deepObject = { a: { b: { c: { d: { e: "deep" } } } } };

            expect(() => getMonitorTypeConfig(largeString)).not.toThrow();
            expect(() => isValidMonitorType(largeString)).not.toThrow();
            expect(() =>
                migrateMonitorType(
                    "http" as MonitorType,
                    "1.0.0",
                    "2.0.0",
                    deepObject
                )
            ).not.toThrow();
        });
    });

    describe("Performance and Memory Safety", () => {
        it("should handle repeated operations efficiently", () => {
            const startTime = performance.now();

            // Perform many operations
            for (let i = 0; i < 10_000; i++) {
                getRegisteredMonitorTypes();
                isValidMonitorType("nonexistent-type");
                getMonitorTypeConfig("another-nonexistent-type");
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Should complete within reasonable time
            expect(duration).toBeLessThan(5000); // 5 seconds for 10k operations
        });

        it("should not leak memory with many registrations", () => {
            const initialTypes = getRegisteredMonitorTypes().length;

            // Register many test types
            for (let i = 0; i < 100; i++) {
                const config: BaseMonitorConfig = {
                    type: `memory-test-${i}`,
                    displayName: `Memory Test ${i}`,
                    description: "For memory testing",
                    version: "1.0.0",
                    fields: [],
                    serviceFactory: () =>
                        ({
                            check: vi
                                .fn()
                                .mockResolvedValue({ status: "up" as const }),
                            getType: vi
                                .fn()
                                .mockReturnValue(`memory-test-${i}`),
                            updateConfig: vi.fn(),
                        }) as IMonitorService,
                    validationSchema: z.object({ type: z.string() }),
                };

                registerMonitorType(config);
            }

            const finalTypes = getRegisteredMonitorTypes().length;
            expect(finalTypes).toBeGreaterThan(initialTypes);

            // Registry should still function correctly
            expect(isValidMonitorType("memory-test-50")).toBeTruthy();
            expect(getMonitorTypeConfig("memory-test-75")).toBeDefined();
        });
    });
});
