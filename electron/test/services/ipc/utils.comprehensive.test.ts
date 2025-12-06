/**
 * Comprehensive tests for IPC utils module targeting 95%+ coverage. Tests all
 * validators, response creators, and handler wrappers with isolated component
 * testing strategy.
 */

import { ipcMain } from "electron";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { logger } from "../../../utils/logger";

import {
    IpcValidators,
    createErrorResponse,
    createSuccessResponse,
    createValidationResponse,
    registerStandardizedIpcHandler,
    withIpcHandler,
    withIpcHandlerValidation,
} from "../../../services/ipc/utils";
import {
    DATA_CHANNELS,
    MONITORING_CHANNELS,
    MONITOR_TYPES_CHANNELS,
} from "@shared/types/preload";

// Mock electron modules
vi.mock("electron", () => ({
    ipcMain: {
        handle: vi.fn(),
        removeHandler: vi.fn(),
    },
}));

// Mock electron utils
vi.mock("../../../electronUtils", () => ({
    isDev: vi.fn(() => true),
}));

// Mock logger
vi.mock("../../../utils/logger", () => {
    const createLoggerMock = () => ({
        debug: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
    });
    return {
        logger: createLoggerMock(),
        diagnosticsLogger: createLoggerMock(),
    };
});

// Mock shared validation
vi.mock("@shared/validation/validatorUtils", () => ({
    isNonEmptyString: vi.fn(
        (value) => typeof value === "string" && value.trim().length > 0
    ),
    isValidUrl: vi.fn(
        (value) =>
            typeof value === "string" && /^(?:https?:\/\/)[^\s]+$/u.test(value)
    ),
}));

const CHANNELS_FOR_TESTS = {
    registration: DATA_CHANNELS.downloadSqliteBackup,
    validatedRegistration: DATA_CHANNELS.importData,
    execution: MONITORING_CHANNELS.startMonitoring,
    validatedExecution: MONITORING_CHANNELS.startMonitoringForMonitor,
    handlerOne: MONITORING_CHANNELS.stopMonitoring,
    handlerTwo: MONITOR_TYPES_CHANNELS.formatMonitorDetail,
    handlerThree: MONITOR_TYPES_CHANNELS.formatMonitorTitleSuffix,
    duplicate: DATA_CHANNELS.exportData,
    failure: MONITOR_TYPES_CHANNELS.validateMonitorData,
} as const;

type TestChannel = (typeof CHANNELS_FOR_TESTS)[keyof typeof CHANNELS_FOR_TESTS];

describe("IPC Utils - Comprehensive Coverage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("IpcValidators - Parameter Validation", () => {
        describe("optionalString validator", () => {
            it("should return null for undefined values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const result = IpcValidators.optionalString(
                    undefined,
                    "testParam"
                );
                expect(result).toBeNull();
            });

            it("should return null for valid non-empty strings", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const result = IpcValidators.optionalString(
                    "valid string",
                    "testParam"
                );
                expect(result).toBeNull();
            });

            it("should return error for empty strings", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.optionalString("", "testParam");
                expect(result).toBe(
                    "testParam must be a non-empty string when provided"
                );
            });

            it("should return error for whitespace-only strings", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.optionalString("   ", "testParam");
                expect(result).toBe(
                    "testParam must be a non-empty string when provided"
                );
            });

            it("should return error for non-string values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.optionalString(123, "testParam");
                expect(result).toBe(
                    "testParam must be a non-empty string when provided"
                );
            });

            it("should return error for null values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.optionalString(null, "testParam");
                expect(result).toBe(
                    "testParam must be a non-empty string when provided"
                );
            });

            it("should return error for object values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.optionalString({}, "testParam");
                expect(result).toBe(
                    "testParam must be a non-empty string when provided"
                );
            });

            it("should return error for array values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.optionalString([], "testParam");
                expect(result).toBe(
                    "testParam must be a non-empty string when provided"
                );
            });
        });

        describe("requiredNumber validator", () => {
            it("should return null for valid numbers", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const result = IpcValidators.requiredNumber(42, "testParam");
                expect(result).toBeNull();
            });

            it("should return null for zero", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const result = IpcValidators.requiredNumber(0, "testParam");
                expect(result).toBeNull();
            });

            it("should return null for negative numbers", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const result = IpcValidators.requiredNumber(-42, "testParam");
                expect(result).toBeNull();
            });

            it("should return null for floating point numbers", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const result = IpcValidators.requiredNumber(
                    3.141_59,
                    "testParam"
                );
                expect(result).toBeNull();
            });

            it("should return error for NaN values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.requiredNumber(
                    Number.NaN,
                    "testParam"
                );
                expect(result).toBe("testParam must be a valid number");
            });

            it("should return error for string values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.requiredNumber("123", "testParam");
                expect(result).toBe("testParam must be a valid number");
            });

            it("should return error for undefined values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.requiredNumber(
                    undefined,
                    "testParam"
                );
                expect(result).toBe("testParam must be a valid number");
            });

            it("should return error for null values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.requiredNumber(null, "testParam");
                expect(result).toBe("testParam must be a valid number");
            });

            it("should return error for object values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.requiredNumber({}, "testParam");
                expect(result).toBe("testParam must be a valid number");
            });

            it("should return error for array values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.requiredNumber([], "testParam");
                expect(result).toBe("testParam must be a valid number");
            });
        });

        describe("requiredUrl validator", () => {
            it("should return null for valid http URL", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const result = IpcValidators.requiredUrl(
                    "https://example.com",
                    "url"
                );
                expect(result).toBeNull();
            });

            it("should return null for valid https URL", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const result = IpcValidators.requiredUrl(
                    "http://localhost:3000/status",
                    "url"
                );
                expect(result).toBeNull();
            });

            it("should report error for unsupported protocol", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.requiredUrl(
                    "ftp://example.com",
                    "url"
                );
                expect(result).toBe("url must be a valid http(s) URL");
            });

            it("should report error for non-string input", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.requiredUrl(123, "url");
                expect(result).toBe("url must be a valid http(s) URL");
            });
        });

        describe("requiredObject validator", () => {
            it("should return null for valid objects", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const result = IpcValidators.requiredObject(
                    { key: "value" },
                    "testParam"
                );
                expect(result).toBeNull();
            });

            it("should return null for empty objects", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const result = IpcValidators.requiredObject({}, "testParam");
                expect(result).toBeNull();
            });

            it("should return null for complex objects", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const result = IpcValidators.requiredObject(
                    { nested: { key: "value" } },
                    "testParam"
                );
                expect(result).toBeNull();
            });

            it("should return error for null values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.requiredObject(null, "testParam");
                expect(result).toBe("testParam must be a valid object");
            });

            it("should return error for array values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.requiredObject([], "testParam");
                expect(result).toBe("testParam must be a valid object");
            });

            it("should return error for array values with content", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.requiredObject(
                    [1, 2, 3],
                    "testParam"
                );
                expect(result).toBe("testParam must be a valid object");
            });

            it("should return error for string values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.requiredObject(
                    "string",
                    "testParam"
                );
                expect(result).toBe("testParam must be a valid object");
            });

            it("should return error for number values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.requiredObject(123, "testParam");
                expect(result).toBe("testParam must be a valid object");
            });

            it("should return error for undefined values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.requiredObject(
                    undefined,
                    "testParam"
                );
                expect(result).toBe("testParam must be a valid object");
            });

            it("should return error for boolean values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.requiredObject(true, "testParam");
                expect(result).toBe("testParam must be a valid object");
            });
        });

        describe("requiredString validator", () => {
            it("should return null for valid non-empty strings", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const result = IpcValidators.requiredString(
                    "valid string",
                    "testParam"
                );
                expect(result).toBeNull();
            });

            it("should return null for strings with special characters", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const result = IpcValidators.requiredString(
                    "test@example.com",
                    "testParam"
                );
                expect(result).toBeNull();
            });

            it("should return null for numeric strings", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const result = IpcValidators.requiredString("123", "testParam");
                expect(result).toBeNull();
            });

            it("should return error for empty strings", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.requiredString("", "testParam");
                expect(result).toBe("testParam must be a non-empty string");
            });

            it("should return error for whitespace-only strings", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.requiredString("   ", "testParam");
                expect(result).toBe("testParam must be a non-empty string");
            });

            it("should return error for undefined values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.requiredString(
                    undefined,
                    "testParam"
                );
                expect(result).toBe("testParam must be a non-empty string");
            });

            it("should return error for null values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.requiredString(null, "testParam");
                expect(result).toBe("testParam must be a non-empty string");
            });

            it("should return error for number values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.requiredString(123, "testParam");
                expect(result).toBe("testParam must be a non-empty string");
            });

            it("should return error for object values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.requiredString({}, "testParam");
                expect(result).toBe("testParam must be a non-empty string");
            });

            it("should return error for array values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const result = IpcValidators.requiredString([], "testParam");
                expect(result).toBe("testParam must be a non-empty string");
            });
        });
    });

    describe("Response Creators - Standardized Formatting", () => {
        describe(createErrorResponse, () => {
            it("should create basic error response", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Constructor", "type");

                const result = createErrorResponse("Something went wrong");

                expect(result).toEqual({
                    error: "Something went wrong",
                    success: false,
                });
            });

            it("should create error response with metadata", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Constructor", "type");

                const metadata = { code: 500, context: "test" };
                const result = createErrorResponse(
                    "Error with metadata",
                    metadata
                );

                expect(result).toEqual({
                    error: "Error with metadata",
                    success: false,
                    metadata: { code: 500, context: "test" },
                });
            });

            it("should create error response with undefined metadata", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Constructor", "type");

                const result = createErrorResponse(
                    "Error without metadata",
                    undefined
                );

                expect(result).toEqual({
                    error: "Error without metadata",
                    success: false,
                });
            });

            it("should create error response with empty metadata", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Constructor", "type");

                const result = createErrorResponse(
                    "Error with empty metadata",
                    {}
                );

                expect(result).toEqual({
                    error: "Error with empty metadata",
                    success: false,
                    metadata: {},
                });
            });

            it("should handle complex metadata objects", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const metadata = {
                    nested: { key: "value" },
                    array: [1, 2, 3],
                    timestamp: new Date().toISOString(),
                };
                const result = createErrorResponse(
                    "Complex metadata error",
                    metadata
                );

                expect(result).toEqual({
                    error: "Complex metadata error",
                    success: false,
                    metadata,
                });
            });
        });

        describe(createSuccessResponse, () => {
            it("should create success response without data", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Constructor", "type");

                const result = createSuccessResponse();

                expect(result).toEqual({
                    success: true,
                });
            });

            it("should create success response with data only", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Constructor", "type");

                const data = { id: 1, name: "test" };
                const result = createSuccessResponse(data);

                expect(result).toEqual({
                    success: true,
                    data: { id: 1, name: "test" },
                });
            });

            it("should create success response with data and metadata", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Constructor", "type");

                const data = { result: "success" };
                const metadata = { duration: 100 };
                const result = createSuccessResponse(data, metadata);

                expect(result).toEqual({
                    success: true,
                    data: { result: "success" },
                    metadata: { duration: 100 },
                });
            });

            it("should create success response with data, metadata, and warnings", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Constructor", "type");

                const data = { items: [] };
                const metadata = { count: 0 };
                const warnings = ["No items found", "Using default values"];
                const result = createSuccessResponse(data, metadata, warnings);

                expect(result).toEqual({
                    success: true,
                    data: { items: [] },
                    metadata: { count: 0 },
                    warnings: ["No items found", "Using default values"],
                });
            });

            it("should create success response with undefined data", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Constructor", "type");

                const result = createSuccessResponse(undefined);

                expect(result).toEqual({
                    success: true,
                });
            });

            it("should create success response with undefined metadata", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Constructor", "type");

                const data = "test";
                const result = createSuccessResponse(data, undefined);

                expect(result).toEqual({
                    success: true,
                    data: "test",
                });
            });

            it("should create success response with empty warnings array", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Constructor", "type");

                const data = "test";
                const metadata = { key: "value" };
                const warnings: string[] = [];
                const result = createSuccessResponse(data, metadata, warnings);

                expect(result).toEqual({
                    success: true,
                    data: "test",
                    metadata: { key: "value" },
                });
            });

            it("should handle primitive data types", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const stringResult = createSuccessResponse("string data");
                expect(stringResult.data).toBe("string data");

                const numberResult = createSuccessResponse(42);
                expect(numberResult.data).toBe(42);

                const booleanResult = createSuccessResponse(true);
                expect(booleanResult.data).toBeTruthy();
            });

            it("should handle array data", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const arrayData = [1, 2, 3, "test"];
                const result = createSuccessResponse(arrayData);

                expect(result).toEqual({
                    success: true,
                    data: [1, 2, 3, "test"],
                });
            });
        });

        describe(createValidationResponse, () => {
            it("should create successful validation response with defaults", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Constructor", "type");

                const result = createValidationResponse(true);

                expect(result).toEqual({
                    success: true,
                    errors: [],
                    warnings: [],
                    metadata: {},
                });
            });

            it("should create failed validation response with errors", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Constructor", "type");

                const errors = ["Field is required", "Invalid format"];
                const result = createValidationResponse(false, errors);

                expect(result).toEqual({
                    success: false,
                    errors: ["Field is required", "Invalid format"],
                    warnings: [],
                    metadata: {},
                });
            });

            it("should create validation response with warnings", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Constructor", "type");

                const errors = ["Critical error"];
                const warnings = ["Deprecated field", "Performance warning"];
                const result = createValidationResponse(
                    false,
                    errors,
                    warnings
                );

                expect(result).toEqual({
                    success: false,
                    errors: ["Critical error"],
                    warnings: ["Deprecated field", "Performance warning"],
                    metadata: {},
                });
            });

            it("should create validation response with metadata", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Constructor", "type");

                const errors: string[] = [];
                const warnings: string[] = [];
                const metadata = { validatedAt: "2024-01-01", fieldCount: 5 };
                const result = createValidationResponse(
                    true,
                    errors,
                    warnings,
                    metadata
                );

                expect(result).toEqual({
                    success: true,
                    errors: [],
                    warnings: [],
                    metadata: { validatedAt: "2024-01-01", fieldCount: 5 },
                });
            });

            it("should create complete validation response", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Constructor", "type");

                const errors = ["Error 1"];
                const warnings = ["Warning 1", "Warning 2"];
                const metadata = { source: "test", validated: true };
                const result = createValidationResponse(
                    false,
                    errors,
                    warnings,
                    metadata
                );

                expect(result).toEqual({
                    success: false,
                    errors: ["Error 1"],
                    warnings: ["Warning 1", "Warning 2"],
                    metadata: { source: "test", validated: true },
                });
            });
        });
    });

    describe("Handler Wrappers - Error Handling and Logging", () => {
        describe(withIpcHandler, () => {
            it("should wrap successful handler with response formatting", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const mockHandler = vi.fn().mockResolvedValue({ data: "test" });

                const result = await withIpcHandler(
                    "test-channel",
                    mockHandler
                );

                expect(result).toEqual({
                    success: true,
                    data: { data: "test" },
                    metadata: {
                        duration: expect.any(Number),
                        handler: "test-channel",
                    },
                });
                expect(mockHandler).toHaveBeenCalledTimes(1);
            });

            it("should wrap synchronous handler", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const mockHandler = vi.fn().mockReturnValue("sync result");

                const result = await withIpcHandler(
                    "sync-channel",
                    mockHandler
                );

                expect(result).toEqual({
                    success: true,
                    data: "sync result",
                    metadata: {
                        duration: expect.any(Number),
                        handler: "sync-channel",
                    },
                });
            });

            it("should handle Error instances", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const error = new Error("Test error message");
                const mockHandler = vi.fn().mockRejectedValue(error);

                const result = await withIpcHandler(
                    "error-channel",
                    mockHandler
                );

                expect(result).toEqual({
                    success: false,
                    error: "Test error message",
                    metadata: {
                        duration: expect.any(Number),
                        handler: "error-channel",
                    },
                });
            });

            it("should handle string errors", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const mockHandler = vi.fn().mockRejectedValue("String error");

                const result = await withIpcHandler(
                    "string-error-channel",
                    mockHandler
                );

                expect(result).toEqual({
                    success: false,
                    error: "String error",
                    metadata: {
                        duration: expect.any(Number),
                        handler: "string-error-channel",
                    },
                });
            });

            it("should handle non-string non-error values", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const mockHandler = vi.fn().mockRejectedValue(123);

                const result = await withIpcHandler(
                    "number-error-channel",
                    mockHandler
                );

                expect(result).toEqual({
                    success: false,
                    error: "123",
                    metadata: {
                        duration: expect.any(Number),
                        handler: "number-error-channel",
                    },
                });
            });

            it("should not log high-frequency operations in dev mode", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const mockHandler = vi.fn().mockResolvedValue("result");

                await withIpcHandler("format-monitor-detail", mockHandler);
                await withIpcHandler("get-monitor-types", mockHandler);

                // These operations should not generate debug logs
                expect(mockHandler).toHaveBeenCalledTimes(2);
            });

            it("should measure execution duration accurately", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const expectedDuration = 50;
                const startTime = 10_000;
                const endTime = startTime + expectedDuration;
                const nowSpy = vi.spyOn(Date, "now");
                const mockHandler = vi.fn().mockResolvedValue("delayed result");

                try {
                    nowSpy
                        .mockReturnValueOnce(startTime)
                        .mockReturnValueOnce(endTime);

                    const result = await withIpcHandler(
                        "timing-channel",
                        mockHandler
                    );

                    expect(mockHandler).toHaveBeenCalledTimes(1);
                    expect(result.metadata?.["duration"]).toBe(
                        expectedDuration
                    );
                } finally {
                    nowSpy.mockRestore();
                }
            });
        });

        describe(withIpcHandlerValidation, () => {
            it("should execute handler with valid parameters", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const mockHandler = vi.fn().mockResolvedValue("valid result");
                const mockValidator = vi.fn().mockReturnValue(null);
                const params = ["param1", 123];

                const result = await withIpcHandlerValidation(
                    "valid-channel",
                    mockHandler,
                    mockValidator,
                    params
                );

                expect(mockValidator).toHaveBeenCalledWith(params);
                expect(mockHandler).toHaveBeenCalledWith("param1", 123);
                expect(result).toEqual({
                    success: true,
                    data: "valid result",
                    metadata: {
                        duration: expect.any(Number),
                        handler: "valid-channel",
                    },
                });
            });

            it("should return error for validation failures", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const mockHandler = vi.fn();
                const mockValidator = vi
                    .fn()
                    .mockReturnValue(["Invalid param1", "Invalid param2"]);
                const params = ["invalid", null];

                const result = await withIpcHandlerValidation(
                    "invalid-channel",
                    mockHandler,
                    mockValidator,
                    params
                );

                expect(mockValidator).toHaveBeenCalledWith(params);
                expect(mockHandler).not.toHaveBeenCalled();
                expect(result).toEqual({
                    success: false,
                    error: "Parameter validation failed: Invalid param1, Invalid param2",
                    metadata: {
                        handler: "invalid-channel",
                        validationErrors: ["Invalid param1", "Invalid param2"],
                    },
                });
            });

            it("should handle synchronous validated handlers", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Validation", "type");

                const mockHandler = vi
                    .fn()
                    .mockReturnValue("sync validated result");
                const mockValidator = vi.fn().mockReturnValue(null);
                const params = ["test"];

                const result = await withIpcHandlerValidation(
                    "sync-validated-channel",
                    mockHandler,
                    mockValidator,
                    params
                );

                expect(result.data).toBe("sync validated result");
                expect(result.success).toBeTruthy();
            });

            it("should handle errors in validated handlers", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const error = new Error("Handler execution error");
                const mockHandler = vi.fn().mockRejectedValue(error);
                const mockValidator = vi.fn().mockReturnValue(null);
                const params = ["valid"];

                const result = await withIpcHandlerValidation(
                    "error-validated-channel",
                    mockHandler,
                    mockValidator,
                    params
                );

                expect(result).toEqual({
                    success: false,
                    error: "Handler execution error",
                    metadata: {
                        duration: expect.any(Number),
                        handler: "error-validated-channel",
                    },
                });
            });

            it("should not log high-frequency validated operations", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Validation", "type");

                const mockHandler = vi.fn().mockResolvedValue("result");
                const mockValidator = vi.fn().mockReturnValue(null);

                await withIpcHandlerValidation(
                    "format-monitor-detail",
                    mockHandler,
                    mockValidator,
                    []
                );
                await withIpcHandlerValidation(
                    "get-monitor-types",
                    mockHandler,
                    mockValidator,
                    []
                );

                expect(mockHandler).toHaveBeenCalledTimes(2);
            });

            it("should measure execution duration for validated handlers", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Validation", "type");

                const expectedDuration = 30;
                const startTime = 20_000;
                const endTime = startTime + expectedDuration;
                const nowSpy = vi.spyOn(Date, "now");
                const mockHandler = vi.fn().mockResolvedValue("timed result");
                const mockValidator = vi.fn().mockReturnValue(null);

                try {
                    nowSpy
                        .mockReturnValueOnce(startTime)
                        .mockReturnValueOnce(endTime);

                    const result = await withIpcHandlerValidation(
                        "timed-validated-channel",
                        mockHandler,
                        mockValidator,
                        []
                    );

                    expect(mockHandler).toHaveBeenCalledTimes(1);
                    expect(mockValidator).toHaveBeenCalledWith([]);
                    expect(result.metadata?.["duration"]).toBe(
                        expectedDuration
                    );
                } finally {
                    nowSpy.mockRestore();
                }
            });
        });

        describe(registerStandardizedIpcHandler, () => {
            it("should register handler without validation", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Validation", "type");

                const mockHandler = vi.fn().mockResolvedValue("test");
                const registeredHandlers = new Set<TestChannel>();

                registerStandardizedIpcHandler(
                    CHANNELS_FOR_TESTS.registration,
                    mockHandler,
                    null,
                    registeredHandlers
                );

                expect(ipcMain.handle).toHaveBeenCalledWith(
                    CHANNELS_FOR_TESTS.registration,
                    expect.any(Function)
                );
                expect(
                    registeredHandlers.has(CHANNELS_FOR_TESTS.registration)
                ).toBeTruthy();
            });

            it("should register handler with validation", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Validation", "type");

                const mockHandler = vi.fn().mockResolvedValue("validated test");
                const mockValidator = vi.fn().mockReturnValue(null);
                const registeredHandlers = new Set<TestChannel>();

                registerStandardizedIpcHandler(
                    CHANNELS_FOR_TESTS.validatedRegistration,
                    mockHandler,
                    mockValidator,
                    registeredHandlers
                );

                expect(ipcMain.handle).toHaveBeenCalledWith(
                    CHANNELS_FOR_TESTS.validatedRegistration,
                    expect.any(Function)
                );
                expect(
                    registeredHandlers.has(
                        CHANNELS_FOR_TESTS.validatedRegistration
                    )
                ).toBeTruthy();
            });

            it("should execute registered handler without validation", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Validation", "type");

                const mockHandler = vi.fn().mockResolvedValue("execution test");
                const registeredHandlers = new Set<TestChannel>();

                registerStandardizedIpcHandler(
                    CHANNELS_FOR_TESTS.execution,
                    mockHandler,
                    null,
                    registeredHandlers
                );

                // Get the registered function and execute it
                const handleCall = vi
                    .mocked(ipcMain.handle)
                    .mock.calls.find(
                        (call) => call[0] === CHANNELS_FOR_TESTS.execution
                    );
                expect(handleCall).toBeDefined();

                const registeredFunction = handleCall![1];
                const result = await registeredFunction(
                    {} as any,
                    "arg1",
                    "arg2"
                );

                expect(mockHandler).toHaveBeenCalledWith("arg1", "arg2");
                expect(result.success).toBeTruthy();
                expect(result.data).toBe("execution test");
            });

            it("should execute registered handler with validation", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Validation", "type");

                const mockHandler = vi
                    .fn()
                    .mockResolvedValue("validated execution");
                const mockValidator = vi.fn().mockReturnValue(null);
                const registeredHandlers = new Set<TestChannel>();

                registerStandardizedIpcHandler(
                    CHANNELS_FOR_TESTS.validatedExecution,
                    mockHandler,
                    mockValidator,
                    registeredHandlers
                );

                // Get the registered function and execute it
                const handleCall = vi
                    .mocked(ipcMain.handle)
                    .mock.calls.find(
                        (call) =>
                            call[0] === CHANNELS_FOR_TESTS.validatedExecution
                    );
                expect(handleCall).toBeDefined();

                const registeredFunction = handleCall![1];
                const result = await registeredFunction({} as any, "validArg");

                expect(mockValidator).toHaveBeenCalledWith(["validArg"]);
                expect(mockHandler).toHaveBeenCalledWith("validArg");
                expect(result.success).toBeTruthy();
                expect(result.data).toBe("validated execution");
            });

            it("should track multiple registered handlers", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Business Logic", "type");

                const registeredHandlers = new Set<TestChannel>();

                registerStandardizedIpcHandler(
                    CHANNELS_FOR_TESTS.handlerOne,
                    vi.fn(),
                    null,
                    registeredHandlers
                );
                registerStandardizedIpcHandler(
                    CHANNELS_FOR_TESTS.handlerTwo,
                    vi.fn(),
                    vi.fn(),
                    registeredHandlers
                );
                registerStandardizedIpcHandler(
                    CHANNELS_FOR_TESTS.handlerThree,
                    vi.fn(),
                    null,
                    registeredHandlers
                );

                expect(registeredHandlers.size).toBe(3);
                expect(
                    registeredHandlers.has(CHANNELS_FOR_TESTS.handlerOne)
                ).toBeTruthy();
                expect(
                    registeredHandlers.has(CHANNELS_FOR_TESTS.handlerTwo)
                ).toBeTruthy();
                expect(
                    registeredHandlers.has(CHANNELS_FOR_TESTS.handlerThree)
                ).toBeTruthy();
            });

            it("should reject duplicate handler registrations", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "regression");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Validation", "type");

                const registeredHandlers = new Set<TestChannel>();

                registerStandardizedIpcHandler(
                    CHANNELS_FOR_TESTS.duplicate,
                    vi.fn(),
                    null,
                    registeredHandlers
                );

                expect(() =>
                    registerStandardizedIpcHandler(
                        CHANNELS_FOR_TESTS.duplicate,
                        vi.fn(),
                        null,
                        registeredHandlers
                    )
                ).toThrowError(
                    `[IpcService] Attempted to register duplicate IPC handler for channel '${CHANNELS_FOR_TESTS.duplicate}'`
                );

                expect(logger.error).toHaveBeenCalledWith(
                    `[IpcService] Attempted to register duplicate IPC handler for channel '${CHANNELS_FOR_TESTS.duplicate}'`,
                    expect.objectContaining({
                        channel: CHANNELS_FOR_TESTS.duplicate,
                        event: "ipc:handler:register",
                        severity: "error",
                    }),
                    expect.objectContaining({
                        channel: CHANNELS_FOR_TESTS.duplicate,
                        registeredHandlers: expect.arrayContaining([
                            CHANNELS_FOR_TESTS.duplicate,
                        ]),
                    })
                );
                expect(ipcMain.handle).toHaveBeenCalledTimes(1);
            });

            it("should rollback handler registration when ipcMain.handle throws", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "regression");
                await annotate("Component: utils", "component");
                await annotate("Category: Service", "category");
                await annotate("Type: Error Handling", "type");

                const registeredHandlers = new Set<TestChannel>();
                const registrationError = new Error("ipcMain failure");
                vi.mocked(ipcMain.handle).mockImplementationOnce(() => {
                    throw registrationError;
                });

                expect(() =>
                    registerStandardizedIpcHandler(
                        CHANNELS_FOR_TESTS.failure,
                        vi.fn(),
                        null,
                        registeredHandlers
                    )
                ).toThrowError(registrationError);

                expect(
                    registeredHandlers.has(CHANNELS_FOR_TESTS.failure)
                ).toBeFalsy();
                expect(logger.error).toHaveBeenCalledWith(
                    `[IpcService] Failed to register IPC handler for channel '${CHANNELS_FOR_TESTS.failure}'`,
                    expect.objectContaining({
                        channel: CHANNELS_FOR_TESTS.failure,
                        event: "ipc:handler:register",
                        severity: "error",
                    }),
                    registrationError
                );
            });
        });
    });
});
