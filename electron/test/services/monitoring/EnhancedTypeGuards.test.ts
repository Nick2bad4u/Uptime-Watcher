/**
 * Tests for EnhancedTypeGuards - comprehensive runtime type validation
 */

import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
    EnhancedTypeGuard,
    GenericTypeInference,
    TypeSafeMonitorBuilder,
    TypeSafeMonitorFactory,
    type TypeGuardResult,
    type RuntimeValidationContext,
} from "../../../services/monitoring/EnhancedTypeGuards";
import type { BaseMonitorConfig } from "../../../services/monitoring/MonitorTypeRegistry";

describe("EnhancedTypeGuards", () => {
    describe("EnhancedTypeGuard", () => {
        describe("validateMonitorType", () => {
            it("should validate valid monitor type", () => {
                const result = EnhancedTypeGuard.validateMonitorType("http");
                expect(result.success).toBe(true);
                expect(result.value).toBe("http");
            });

            it("should reject non-string monitor type", () => {
                const result = EnhancedTypeGuard.validateMonitorType(123);
                expect(result.success).toBe(false);
                expect(result.error).toBe("Monitor type must be a string");
                expect(result.details?.expectedType).toBe("string");
                expect(result.details?.actualType).toBe("number");
            });

            it("should reject invalid monitor type", () => {
                const result = EnhancedTypeGuard.validateMonitorType("invalid");
                expect(result.success).toBe(false);
                expect(result.error).toBe("Invalid monitor type: invalid");
                expect(result.details?.suggestions).toContain("Use 'http' for HTTP/HTTPS monitoring");
            });
        });

        describe("validateURL", () => {
            it("should validate valid URL", () => {
                const result = EnhancedTypeGuard.validateURL("https://example.com");
                expect(result.success).toBe(true);
                expect(result.value).toBe("https://example.com");
            });

            it("should reject non-string URL", () => {
                const result = EnhancedTypeGuard.validateURL(123);
                expect(result.success).toBe(false);
                expect(result.error).toBe("URL must be a string");
            });

            it("should reject empty URL", () => {
                const result = EnhancedTypeGuard.validateURL("");
                expect(result.success).toBe(false);
                expect(result.error).toBe("URL cannot be empty");
            });

            it("should reject invalid URL format", () => {
                const result = EnhancedTypeGuard.validateURL("not-a-url");
                expect(result.success).toBe(false);
                expect(result.error).toBe("Invalid URL format");
                expect(result.details?.suggestions).toContain("Ensure URL starts with http:// or https://");
            });

            it("should trim whitespace from valid URL", () => {
                const result = EnhancedTypeGuard.validateURL("  https://example.com  ");
                expect(result.success).toBe(true);
                expect(result.value).toBe("https://example.com");
            });
        });

        describe("validateHostname", () => {
            it("should validate valid hostname", () => {
                const result = EnhancedTypeGuard.validateHostname("example.com");
                expect(result.success).toBe(true);
                expect(result.value).toBe("example.com");
            });

            it("should validate IP address", () => {
                const result = EnhancedTypeGuard.validateHostname("192.168.1.1");
                expect(result.success).toBe(true);
                expect(result.value).toBe("192.168.1.1");
            });

            it("should validate localhost", () => {
                const result = EnhancedTypeGuard.validateHostname("localhost");
                expect(result.success).toBe(true);
                expect(result.value).toBe("localhost");
            });

            it("should reject non-string hostname", () => {
                const result = EnhancedTypeGuard.validateHostname(123);
                expect(result.success).toBe(false);
                expect(result.error).toBe("Hostname must be a string");
            });

            it("should reject empty hostname", () => {
                const result = EnhancedTypeGuard.validateHostname("");
                expect(result.success).toBe(false);
                expect(result.error).toBe("Hostname cannot be empty");
            });

            it("should reject invalid hostname format", () => {
                const result = EnhancedTypeGuard.validateHostname("invalid..hostname");
                expect(result.success).toBe(false);
                expect(result.error).toBe("Invalid hostname format");
                expect(result.details?.suggestions).toContain("Use a valid domain name (e.g., example.com)");
            });
        });

        describe("validatePort", () => {
            it("should validate valid port number", () => {
                const result = EnhancedTypeGuard.validatePort(80);
                expect(result.success).toBe(true);
                expect(result.value).toBe(80);
            });

            it("should validate port as string", () => {
                const result = EnhancedTypeGuard.validatePort("443");
                expect(result.success).toBe(true);
                expect(result.value).toBe(443);
            });

            it("should reject non-numeric string", () => {
                const result = EnhancedTypeGuard.validatePort("abc");
                expect(result.success).toBe(false);
                expect(result.error).toBe("Port must be a valid number");
            });

            it("should reject non-number/string type", () => {
                const result = EnhancedTypeGuard.validatePort(true);
                expect(result.success).toBe(false);
                expect(result.error).toBe("Port must be a number");
            });

            it("should reject decimal port", () => {
                const result = EnhancedTypeGuard.validatePort(80.5);
                expect(result.success).toBe(false);
                expect(result.error).toBe("Port must be an integer");
            });

            it("should reject out of range port", () => {
                const result = EnhancedTypeGuard.validatePort(70000);
                expect(result.success).toBe(false);
                expect(result.error).toBe("Port must be between 1 and 65535");
            });

            it("should reject negative port", () => {
                const result = EnhancedTypeGuard.validatePort(-1);
                expect(result.success).toBe(false);
                expect(result.error).toBe("Port must be between 1 and 65535");
            });
        });

        describe("validateBoolean", () => {
            it("should validate boolean true", () => {
                const result = EnhancedTypeGuard.validateBoolean(true);
                expect(result.success).toBe(true);
                expect(result.value).toBe(true);
            });

            it("should validate boolean false", () => {
                const result = EnhancedTypeGuard.validateBoolean(false);
                expect(result.success).toBe(true);
                expect(result.value).toBe(false);
            });

            it("should convert string 'true' to boolean", () => {
                const result = EnhancedTypeGuard.validateBoolean("true");
                expect(result.success).toBe(true);
                expect(result.value).toBe(true);
            });

            it("should convert string 'false' to boolean", () => {
                const result = EnhancedTypeGuard.validateBoolean("false");
                expect(result.success).toBe(true);
                expect(result.value).toBe(false);
            });

            it("should convert string '1' to boolean true", () => {
                const result = EnhancedTypeGuard.validateBoolean("1");
                expect(result.success).toBe(true);
                expect(result.value).toBe(true);
            });

            it("should convert string '0' to boolean false", () => {
                const result = EnhancedTypeGuard.validateBoolean("0");
                expect(result.success).toBe(true);
                expect(result.value).toBe(false);
            });

            it("should convert string 'yes' to boolean true", () => {
                const result = EnhancedTypeGuard.validateBoolean("yes");
                expect(result.success).toBe(true);
                expect(result.value).toBe(true);
            });

            it("should convert string 'no' to boolean false", () => {
                const result = EnhancedTypeGuard.validateBoolean("no");
                expect(result.success).toBe(true);
                expect(result.value).toBe(false);
            });

            it("should convert number 1 to boolean true", () => {
                const result = EnhancedTypeGuard.validateBoolean(1);
                expect(result.success).toBe(true);
                expect(result.value).toBe(true);
            });

            it("should convert number 0 to boolean false", () => {
                const result = EnhancedTypeGuard.validateBoolean(0);
                expect(result.success).toBe(true);
                expect(result.value).toBe(false);
            });

            it("should reject invalid boolean value", () => {
                const result = EnhancedTypeGuard.validateBoolean("invalid");
                expect(result.success).toBe(false);
                expect(result.error).toBe("Cannot convert to boolean");
                expect(result.details?.suggestions).toContain("Use true/false for boolean values");
            });
        });
    });

    describe("GenericTypeInference", () => {
        const mockConfig: BaseMonitorConfig = {
            type: "http",
            displayName: "HTTP Monitor",
            description: "Monitor HTTP endpoints",
            version: "1.0.0",
            fields: [
                {
                    name: "url",
                    type: "url",
                    label: "URL",
                    required: true,
                    placeholder: "https://example.com",
                },
                {
                    name: "timeout",
                    type: "number",
                    label: "Timeout",
                    required: false,
                    min: 1000,
                    max: 60000,
                    placeholder: "5000",
                },
                {
                    name: "description",
                    type: "text",
                    label: "Description",
                    required: false,
                    placeholder: "Monitor description",
                },
            ],
            validationSchema: z.object({
                url: z.url(),
                timeout: z.number().optional(),
            }),
            serviceFactory: () => ({
                check: async () => ({
                    success: true,
                    responseTime: 200,
                    status: "up" as const,
                    timestamp: Date.now(),
                }),
                getType: () => "http" as const,
                updateConfig: () => {},
                getConfig: () => ({}),
            }),
        };

        describe("inferFieldType", () => {
            it("should infer URL field type", () => {
                const result = GenericTypeInference.inferFieldType(mockConfig, "url");
                expect(result).toBeTruthy();
                expect(result?.type).toBe("url");
                expect(result?.optional).toBe(false);
            });

            it("should infer number field type with constraints", () => {
                const result = GenericTypeInference.inferFieldType(mockConfig, "timeout");
                expect(result).toBeTruthy();
                expect(result?.type).toBe("number");
                expect(result?.optional).toBe(true);
            });

            it("should infer text field type", () => {
                const result = GenericTypeInference.inferFieldType(mockConfig, "description");
                expect(result).toBeTruthy();
                expect(result?.type).toBe("text");
                expect(result?.optional).toBe(true);
            });

            it("should return null for unknown field", () => {
                const result = GenericTypeInference.inferFieldType(mockConfig, "unknown");
                expect(result).toBeNull();
            });
        });

        describe("createTypedAccessor", () => {
            it("should create accessor for valid field", () => {
                const accessor = GenericTypeInference.createTypedAccessor(mockConfig, "url");
                expect(accessor).toBeTruthy();
                expect(typeof accessor.get).toBe("function");
                expect(typeof accessor.set).toBe("function");
                expect(typeof accessor.validate).toBe("function");
            });

            it("should handle get operation", () => {
                const accessor = GenericTypeInference.createTypedAccessor(mockConfig, "url");
                const data = { url: "https://example.com" };
                const result = accessor.get(data);
                expect(result.success).toBe(true);
                expect(result.value).toBe("https://example.com");
            });

            it("should handle missing required field", () => {
                const accessor = GenericTypeInference.createTypedAccessor(mockConfig, "url");
                const data = {};
                const result = accessor.get(data);
                expect(result.success).toBe(false);
                expect(result.error).toBe("Required field url is missing");
            });

            it("should handle set operation with valid value", () => {
                const accessor = GenericTypeInference.createTypedAccessor(mockConfig, "url");
                const data: Record<string, unknown> = {};
                const result = accessor.set(data, "https://example.com");
                expect(result.success).toBe(true);
                expect(data.url).toBe("https://example.com");
            });

            it("should handle set operation with invalid value", () => {
                const accessor = GenericTypeInference.createTypedAccessor(mockConfig, "url");
                const data: Record<string, unknown> = {};
                const result = accessor.set(data, "invalid-url");
                expect(result.success).toBe(false);
                expect(result.error).toBe("Invalid value for field url");
            });

            it("should handle validate operation", () => {
                const accessor = GenericTypeInference.createTypedAccessor(mockConfig, "url");
                const result = accessor.validate("https://example.com");
                expect(result.success).toBe(true);
                expect(result.value).toBe("https://example.com");
            });

            it("should handle unknown field gracefully", () => {
                const accessor = GenericTypeInference.createTypedAccessor(mockConfig, "unknown");
                const result = accessor.get({});
                expect(result.success).toBe(false);
                expect(result.error).toBe("Field unknown not found in configuration");
            });
        });
    });

    describe("TypeSafeMonitorBuilder", () => {
        it("should create builder with monitor type", () => {
            const builder = new TypeSafeMonitorBuilder("http");
            expect(builder).toBeTruthy();
        });

        it("should set field with valid value", () => {
            const builder = new TypeSafeMonitorBuilder("http");
            const result = builder.setField("url", "https://example.com");
            expect(result).toBe(builder); // Should return this for chaining
        });

        it("should get field value", () => {
            const builder = new TypeSafeMonitorBuilder("http");
            builder.setField("url", "https://example.com");
            const result = builder.getField("url");
            expect(result.success).toBe(true);
            expect(result.value).toBe("https://example.com");
        });

        it("should handle missing field", () => {
            const builder = new TypeSafeMonitorBuilder("http");
            const result = builder.getField("missing");
            expect(result.success).toBe(false);
            expect(result.error).toBe("Field missing not found");
        });

        it("should build monitor data successfully", () => {
            const builder = new TypeSafeMonitorBuilder("http");
            builder.setField("url", "https://example.com");
            const result = builder.build();
            expect(result.success).toBe(true);
            expect(result.value?.type).toBe("http");
        });

        it("should handle validation errors in build", () => {
            const builder = new TypeSafeMonitorBuilder("http");
            builder.setField("url", "invalid-url");
            const result = builder.build();
            expect(result.success).toBe(false);
            expect(result.error).toBe("Monitor data has validation errors");
        });

        it("should validate HTTP monitor URL field", () => {
            const builder = new TypeSafeMonitorBuilder("http");
            builder.setField("url", "https://example.com");
            const result = builder.build();
            expect(result.success).toBe(true);
        });

        it("should validate port monitor host field", () => {
            const builder = new TypeSafeMonitorBuilder("port");
            builder.setField("host", "example.com");
            const result = builder.build();
            expect(result.success).toBe(true);
        });

        it("should validate port monitor port field", () => {
            const builder = new TypeSafeMonitorBuilder("port");
            builder.setField("port", 80);
            const result = builder.build();
            expect(result.success).toBe(true);
        });

        it("should validate monitor type field", () => {
            const builder = new TypeSafeMonitorBuilder("http");
            builder.setField("type", "http");
            const result = builder.build();
            expect(result.success).toBe(true);
        });

        it("should validate monitoring boolean field", () => {
            const builder = new TypeSafeMonitorBuilder("http");
            builder.setField("monitoring", true);
            const result = builder.build();
            expect(result.success).toBe(true);
        });

        it("should allow unknown fields", () => {
            const builder = new TypeSafeMonitorBuilder("http");
            builder.setField("customField", "value");
            const result = builder.build();
            expect(result.success).toBe(true);
        });

        it("should handle field validation errors", () => {
            const builder = new TypeSafeMonitorBuilder("http");
            builder.setField("url", "invalid-url");
            const result = builder.build();
            expect(result.success).toBe(false);
        });

        it("should handle exceptions in setField", () => {
            const builder = new TypeSafeMonitorBuilder("http");
            // Mock logger to avoid actual logging
            const mockLogger = {
                warn: vi.fn(),
                error: vi.fn(),
            };
            vi.doMock("../../utils/logger", () => ({
                logger: mockLogger,
            }));

            // This should handle the exception gracefully
            builder.setField("url", "https://example.com");
            const result = builder.build();
            expect(result.success).toBe(true);
        });
    });

    describe("TypeSafeMonitorFactory", () => {
        it("should create monitor builder", () => {
            const builder = TypeSafeMonitorFactory.create("http");
            expect(builder).toBeInstanceOf(TypeSafeMonitorBuilder);
        });

        it("should validate monitor data successfully", () => {
            const data = {
                type: "http",
                url: "https://example.com",
            };
            const result = TypeSafeMonitorFactory.validate(data);
            expect(result.success).toBe(true);
            expect(result.value?.type).toBe("http");
        });

        it("should reject non-object data", () => {
            const result = TypeSafeMonitorFactory.validate("not-an-object");
            expect(result.success).toBe(false);
            expect(result.error).toBe("Monitor data must be an object");
        });

        it("should reject null data", () => {
            const result = TypeSafeMonitorFactory.validate(null);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Monitor data must be an object");
        });

        it("should reject data with invalid monitor type", () => {
            const data = {
                type: "invalid",
                url: "https://example.com",
            };
            const result = TypeSafeMonitorFactory.validate(data);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Invalid monitor type: invalid");
        });

        it("should handle missing type field", () => {
            const data = {
                url: "https://example.com",
            };
            const result = TypeSafeMonitorFactory.validate(data);
            expect(result.success).toBe(false);
        });
    });

    describe("Type interfaces", () => {
        it("should define TypeGuardResult interface", () => {
            const result: TypeGuardResult<string> = {
                success: true,
                value: "test",
            };
            expect(result.success).toBe(true);
            expect(result.value).toBe("test");
        });

        it("should define TypeGuardResult with error", () => {
            const result: TypeGuardResult<string> = {
                success: false,
                error: "Validation failed",
                details: {
                    expectedType: "string",
                    actualType: "number",
                    suggestions: ["Use a string value"],
                },
            };
            expect(result.success).toBe(false);
            expect(result.error).toBe("Validation failed");
        });

        it("should define RuntimeValidationContext interface", () => {
            const context: RuntimeValidationContext = {
                path: ["field"],
                fieldName: "test",
                expectedType: "string",
                actualValue: 123,
                suggestions: ["Use a string"],
            };
            expect(context.fieldName).toBe("test");
            expect(context.expectedType).toBe("string");
        });
    });
});
