/**
 * Test suite for IPC Types
 *
 * @module IpcTypes
 *
 * @file Comprehensive tests for the IPC types and interfaces in the Uptime
 *   Watcher application.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-11
 *
 * @category IPC
 *
 * @tags ["test", "ipc", "types", "interfaces"]
 */

import { describe, it, expect, vi } from "vitest";
import type {
    IpcHandlerConfig,
    IpcResponse,
    IpcValidationResponse,
    IpcParameterValidator,
} from "../../../services/ipc/types.js";
import type { ValidationResult } from "../../../../shared/types/validation";

describe("IPC Types", () => {
    describe("IpcHandlerConfig", () => {
        it("should define the correct interface structure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const mockHandler = vi.fn().mockResolvedValue("test result");
            const mockValidator = vi.fn().mockReturnValue(null);

            const config: IpcHandlerConfig = {
                channelName: "test-channel",
                handler: mockHandler,
                validateParams: mockValidator,
            };

            expect(config.channelName).toBe("test-channel");
            expect(config.handler).toBe(mockHandler);
            expect(config.validateParams).toBe(mockValidator);
        });

        it("should allow configuration without optional validateParams", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Validation", "type");

            const mockHandler = vi.fn().mockReturnValue("sync result");

            const config: IpcHandlerConfig = {
                channelName: "sync-channel",
                handler: mockHandler,
            };

            expect(config.channelName).toBe("sync-channel");
            expect(config.handler).toBe(mockHandler);
            expect(config.validateParams).toBeUndefined();
        });

        it("should support async handlers", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const asyncHandler = vi.fn().mockResolvedValue(42);

            const config: IpcHandlerConfig = {
                channelName: "async-channel",
                handler: asyncHandler,
            };

            expect(config.handler).toBe(asyncHandler);
            expect(typeof config.handler).toBe("function");
        });

        it("should support sync handlers", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const syncHandler = vi.fn().mockReturnValue("result");

            const config: IpcHandlerConfig = {
                channelName: "sync-channel",
                handler: syncHandler,
            };

            expect(config.handler).toBe(syncHandler);
            expect(typeof config.handler).toBe("function");
        });
    });

    describe("IpcResponse", () => {
        it("should create a successful response with data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const response: IpcResponse<string> = {
                success: true,
                data: "test data",
            };

            expect(response.success).toBe(true);
            expect(response.data).toBe("test data");
            expect(response.error).toBeUndefined();
            expect(response.warnings).toBeUndefined();
            expect(response.metadata).toBeUndefined();
        });

        it("should create an error response", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const response: IpcResponse<void> = {
                success: false,
                error: "Something went wrong",
            };

            expect(response.success).toBe(false);
            expect(response.error).toBe("Something went wrong");
            expect(response.data).toBeUndefined();
        });

        it("should include warnings in response", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const response: IpcResponse<number> = {
                success: true,
                data: 42,
                warnings: ["Deprecated method used", "Performance warning"],
            };

            expect(response.success).toBe(true);
            expect(response.data).toBe(42);
            expect(response.warnings).toEqual([
                "Deprecated method used",
                "Performance warning",
            ]);
        });

        it("should include metadata in response", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const metadata = {
                executionTime: 150,
                cacheHit: true,
                version: "1.0.0",
            };

            const response: IpcResponse<string[]> = {
                success: true,
                data: ["item1", "item2"],
                metadata,
            };

            expect(response.success).toBe(true);
            expect(response.data).toEqual(["item1", "item2"]);
            expect(response.metadata).toEqual(metadata);
        });

        it("should support complex data types", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            interface ComplexData {
                id: number;
                name: string;
                nested: {
                    value: boolean;
                };
            }

            const complexData: ComplexData = {
                id: 1,
                name: "test",
                nested: {
                    value: true,
                },
            };

            const response: IpcResponse<ComplexData> = {
                success: true,
                data: complexData,
            };

            expect(response.success).toBe(true);
            expect(response.data).toEqual(complexData);
        });

        it("should support array data types", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const arrayData = [
                1,
                2,
                3,
                4,
                5,
            ];

            const response: IpcResponse<number[]> = {
                success: true,
                data: arrayData,
            };

            expect(response.success).toBe(true);
            expect(response.data).toEqual(arrayData);
        });

        it("should support undefined generic for responses without data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const response: IpcResponse = {
                success: true,
            };

            expect(response.success).toBe(true);
            expect(response.data).toBeUndefined();
        });
    });

    describe("IpcValidationResponse", () => {
        it("should create a successful validation response", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const validationResult: ValidationResult = {
                success: true,
                errors: [],
            };

            const response: IpcValidationResponse = {
                success: true,
                data: validationResult,
                errors: [],
            };

            expect(response.success).toBe(true);
            expect(response.data).toEqual(validationResult);
            expect(response.errors).toEqual([]);
        });

        it("should create a failed validation response", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Constructor", "type");

            const validationResult: ValidationResult = {
                success: false,
                errors: ["Field is required", "Invalid format"],
            };

            const response: IpcValidationResponse = {
                success: false,
                data: validationResult,
                errors: ["Field is required", "Invalid format"],
            };

            expect(response.success).toBe(false);
            expect(response.data).toEqual(validationResult);
            expect(response.errors).toEqual([
                "Field is required",
                "Invalid format",
            ]);
        });

        it("should extend IpcResponse interface", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const response: IpcValidationResponse = {
                success: false,
                data: {
                    success: false,
                    errors: ["Validation failed"],
                },
                errors: ["Validation failed"],
                error: "Validation process failed",
                warnings: ["Data was modified during validation"],
                metadata: {
                    validatedAt: Date.now(),
                },
            };

            // Should have all IpcResponse properties
            expect(response.success).toBe(false);
            expect(response.error).toBe("Validation process failed");
            expect(response.warnings).toEqual([
                "Data was modified during validation",
            ]);
            expect(response.metadata).toBeDefined();

            // Should have IpcValidationResponse-specific properties
            expect(response.errors).toEqual(["Validation failed"]);
            expect(response.data).toBeDefined();
        });
    });

    describe("IpcParameterValidator", () => {
        it("should define a function that returns null for valid parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const validator: IpcParameterValidator = (params: unknown[]) => {
                if (params.length === 0) {
                    return ["No parameters provided"];
                }
                return null;
            };

            const validResult = validator(["param1", "param2"]);
            const invalidResult = validator([]);

            expect(validResult).toBeNull();
            expect(invalidResult).toEqual(["No parameters provided"]);
        });

        it("should define a function that returns error array for invalid parameters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const validator: IpcParameterValidator = (params: unknown[]) => {
                const errors: string[] = [];

                if (params.length < 2) {
                    errors.push("At least 2 parameters required");
                }

                if (typeof params[0] !== "string") {
                    errors.push("First parameter must be a string");
                }

                return errors.length > 0 ? errors : null;
            };

            const validResult = validator(["valid string", 123]);
            const invalidResult1 = validator([123]);
            const invalidResult2 = validator([]);

            expect(validResult).toBeNull();
            expect(invalidResult1).toEqual([
                "At least 2 parameters required",
                "First parameter must be a string",
            ]);
            expect(invalidResult2).toEqual([
                "At least 2 parameters required",
                "First parameter must be a string",
            ]);
        });

        it("should handle complex parameter validation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Validation", "type");

            interface ExpectedParam {
                id: number;
                name: string;
            }

            const validator: IpcParameterValidator = (params: unknown[]) => {
                if (params.length !== 1) {
                    return ["Exactly one parameter required"];
                }

                const param = params[0] as ExpectedParam;
                const errors: string[] = [];

                if (!param || typeof param !== "object") {
                    errors.push("Parameter must be an object");
                    return errors;
                }

                if (typeof param.id !== "number") {
                    errors.push("Parameter.id must be a number");
                }

                if (typeof param.name !== "string") {
                    errors.push("Parameter.name must be a string");
                }

                return errors.length > 0 ? errors : null;
            };

            const validParam: ExpectedParam = { id: 1, name: "test" };
            const invalidParam1 = { id: "not a number", name: "test" };
            const invalidParam2 = { id: 1 }; // missing name

            expect(validator([validParam])).toBeNull();
            expect(validator([invalidParam1])).toEqual([
                "Parameter.id must be a number",
            ]);
            expect(validator([invalidParam2])).toEqual([
                "Parameter.name must be a string",
            ]);
            expect(validator([])).toEqual(["Exactly one parameter required"]);
            expect(validator([validParam, "extra"])).toEqual([
                "Exactly one parameter required",
            ]);
        });
    });

    describe("Type compatibility and usage patterns", () => {
        it("should demonstrate typical success response pattern", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const createSuccessResponse = <T>(data: T): IpcResponse<T> => ({
                success: true,
                data,
            });

            const stringResponse = createSuccessResponse("hello");
            const numberResponse = createSuccessResponse(42);
            const objectResponse = createSuccessResponse({
                id: 1,
                name: "test",
            });

            expect(stringResponse.success).toBe(true);
            expect(stringResponse.data).toBe("hello");

            expect(numberResponse.success).toBe(true);
            expect(numberResponse.data).toBe(42);

            expect(objectResponse.success).toBe(true);
            expect(objectResponse.data).toEqual({ id: 1, name: "test" });
        });

        it("should demonstrate typical error response pattern", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const createErrorResponse = (error: string): IpcResponse<void> => ({
                success: false,
                error,
            });

            const errorResponse = createErrorResponse("Operation failed");

            expect(errorResponse.success).toBe(false);
            expect(errorResponse.error).toBe("Operation failed");
            expect(errorResponse.data).toBeUndefined();
        });

        it("should demonstrate IPC handler configuration patterns", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: types", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Simple handler
            const simpleConfig: IpcHandlerConfig = {
                channelName: "simple-operation",
                handler: vi.fn().mockReturnValue("uppercase"),
            };

            // Handler with validation
            const validatedConfig: IpcHandlerConfig = {
                channelName: "validated-operation",
                handler: vi.fn().mockReturnValue("Number: 42"),
                validateParams: (params) => {
                    if (params.length !== 1 || typeof params[0] !== "number") {
                        return ["Expected exactly one number parameter"];
                    }
                    return null;
                },
            };

            expect(simpleConfig.channelName).toBe("simple-operation");
            expect(validatedConfig.validateParams).toBeDefined();
        });
    });
});
