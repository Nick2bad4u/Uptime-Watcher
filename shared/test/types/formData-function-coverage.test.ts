/**
 * Comprehensive function coverage tests for shared/types/formData.ts Target:
 * 50% function coverage -> 100% Missing lines: 279-280,303-306,321
 */

import { describe, expect, it } from "vitest";
import {
    isHttpFormData,
    isPingFormData,
    isPortFormData,
} from "../../types/formData";

describe("FormData Types - Complete Function Coverage", () => {
    describe(isHttpFormData, () => {
        it("should return true for valid HTTP form data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const validData = {
                type: "http" as const,
                url: "https://example.com",
                checkInterval: 60_000,
                retryAttempts: 3,
                timeout: 5000,
                method: "GET" as const,
                expectedStatusCode: 200,
            };
            expect(isHttpFormData(validData)).toBeTruthy();
        });

        it("should return false for null", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isHttpFormData(null as any)).toBeFalsy();
        });

        it("should return false for undefined", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isHttpFormData(undefined as any)).toBeFalsy();
        });

        it("should return false for wrong type", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "dns",
                name: "Test",
                checkInterval: 60_000,
                retryAttempts: 3,
                timeout: 5000,
            };
            expect(isHttpFormData(data as any)).toBeFalsy();
        });
    });

    describe("isPingFormData (lines 279-280 coverage)", () => {
        it("should return true for valid ping form data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const validData = {
                type: "ping" as const,
                host: "example.com",
                checkInterval: 60_000,
                retryAttempts: 3,
                timeout: 5000,
            };
            expect(isPingFormData(validData)).toBeTruthy();
        });

        it("should return false for null", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPingFormData(null as any)).toBeFalsy();
        });

        it("should return false for undefined", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPingFormData(undefined as any)).toBeFalsy();
        });

        it("should return false for non-object", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPingFormData("string" as any)).toBeFalsy();
        });

        it("should return false for wrong type", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "http",
                host: "example.com",
                checkInterval: 60_000,
                retryAttempts: 3,
                timeout: 5000,
            };
            expect(isPingFormData(data as any)).toBeFalsy();
        });

        it("should return false for missing host", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "ping",
                checkInterval: 60_000,
                retryAttempts: 3,
                timeout: 5000,
            };
            expect(isPingFormData(data as any)).toBeFalsy();
        });

        it("should return false for non-string host", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "ping",
                host: 123,
                checkInterval: 60_000,
                retryAttempts: 3,
                timeout: 5000,
            };
            expect(isPingFormData(data as any)).toBeFalsy();
        });

        it("should return false for non-number checkInterval", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "ping",
                host: "example.com",
                checkInterval: "60000",
                retryAttempts: 3,
                timeout: 5000,
            };
            expect(isPingFormData(data as any)).toBeFalsy();
        });

        it("should return false for non-number retryAttempts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "ping",
                host: "example.com",
                checkInterval: 60_000,
                retryAttempts: "3",
                timeout: 5000,
            };
            expect(isPingFormData(data as any)).toBeFalsy();
        });

        it("should return false for non-number timeout", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "ping",
                host: "example.com",
                checkInterval: 60_000,
                retryAttempts: 3,
                timeout: "5000",
            };
            expect(isPingFormData(data as any)).toBeFalsy();
        });
    });

    describe("isPortFormData (lines 303-306, 321 coverage)", () => {
        it("should return true for valid port form data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const validData = {
                type: "port" as const,
                host: "example.com",
                port: 443,
                checkInterval: 60_000,
                retryAttempts: 3,
                timeout: 5000,
            };
            expect(isPortFormData(validData)).toBeTruthy();
        });

        it("should return false for null", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPortFormData(null as any)).toBeFalsy();
        });

        it("should return false for undefined", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPortFormData(undefined as any)).toBeFalsy();
        });

        it("should return false for non-object", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPortFormData("string" as any)).toBeFalsy();
        });

        it("should return false for wrong type", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "ping",
                host: "example.com",
                port: 443,
                checkInterval: 60_000,
                retryAttempts: 3,
                timeout: 5000,
            };
            expect(isPortFormData(data as any)).toBeFalsy();
        });

        it("should return false for missing host", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "port",
                port: 443,
                checkInterval: 60_000,
                retryAttempts: 3,
                timeout: 5000,
            };
            expect(isPortFormData(data as any)).toBeFalsy();
        });

        it("should return false for non-string host", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "port",
                host: 123,
                port: 443,
                checkInterval: 60_000,
                retryAttempts: 3,
                timeout: 5000,
            };
            expect(isPortFormData(data as any)).toBeFalsy();
        });

        it("should return false for missing port", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "port",
                host: "example.com",
                checkInterval: 60_000,
                retryAttempts: 3,
                timeout: 5000,
            };
            expect(isPortFormData(data as any)).toBeFalsy();
        });

        it("should return false for non-number port", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "port",
                host: "example.com",
                port: "443",
                checkInterval: 60_000,
                retryAttempts: 3,
                timeout: 5000,
            };
            expect(isPortFormData(data as any)).toBeFalsy();
        });

        it("should return false for non-number checkInterval", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "port",
                host: "example.com",
                port: 443,
                checkInterval: "60000",
                retryAttempts: 3,
                timeout: 5000,
            };
            expect(isPortFormData(data as any)).toBeFalsy();
        });

        it("should return false for non-number retryAttempts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "port",
                host: "example.com",
                port: 443,
                checkInterval: 60_000,
                retryAttempts: "3",
                timeout: 5000,
            };
            expect(isPortFormData(data as any)).toBeFalsy();
        });

        it("should return false for non-number timeout", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const data = {
                type: "port",
                host: "example.com",
                port: 443,
                checkInterval: 60_000,
                retryAttempts: 3,
                timeout: "5000",
            };
            expect(isPortFormData(data as any)).toBeFalsy();
        });
    });

    describe("All Form Data Type Guards Coverage", () => {
        it("should exercise all form data type guard functions", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: formData-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            // Test HTTP form data
            expect(
                isHttpFormData({
                    type: "http" as const,
                    url: "https://test.com",
                    checkInterval: 60_000,
                    retryAttempts: 3,
                    timeout: 5000,
                    method: "GET" as const,
                    expectedStatusCode: 200,
                })
            ).toBeTruthy();

            // Test ping form data
            expect(
                isPingFormData({
                    type: "ping" as const,
                    host: "test.com",
                    checkInterval: 60_000,
                    retryAttempts: 3,
                    timeout: 5000,
                })
            ).toBeTruthy();

            // Test port form data
            expect(
                isPortFormData({
                    type: "port" as const,
                    host: "test.com",
                    port: 80,
                    checkInterval: 60_000,
                    retryAttempts: 3,
                    timeout: 5000,
                })
            ).toBeTruthy();
        });
    });
});
