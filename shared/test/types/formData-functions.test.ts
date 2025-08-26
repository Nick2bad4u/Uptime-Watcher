/**
 * @file Tests for shared/types/formData.ts functions
 */

import { describe, expect, it } from "vitest";

import {
    isHttpFormData,
    isPingFormData,
    isPortFormData,
    type HttpFormData,
    type PingFormData,
    type PortFormData,
} from "../../types/formData";

describe("shared/types/formData function coverage", () => {
    describe("isHttpFormData", () => {
        it("should return true for valid HttpFormData", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formData-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const validFormData: HttpFormData = {
                type: "http",
                url: "https://example.com",
                method: "GET",
                timeout: 30,
                checkInterval: 60,
                retryAttempts: 3,
                followRedirects: true,
                expectedStatusCode: 200,
                headers: {},
                auth: {
                    username: "user",
                    password: "pass",
                },
                expectedContent: "Success",
            };

            expect(isHttpFormData(validFormData)).toBe(true);
        });

        it("should return true for minimal valid HttpFormData", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formData-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const minimalFormData: HttpFormData = {
                type: "http",
                url: "",
                method: "GET",
                timeout: 0,
                checkInterval: 0,
                retryAttempts: 0,
                followRedirects: false,
            };

            expect(isHttpFormData(minimalFormData)).toBe(true);
        });

        it("should return false for null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formData-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isHttpFormData(null as any)).toBe(false);
        });

        it("should return false for undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formData-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isHttpFormData(undefined as any)).toBe(false);
        });

        it("should return false for primitive types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formData-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isHttpFormData("string" as any)).toBe(false);
            expect(isHttpFormData(123 as any)).toBe(false);
            expect(isHttpFormData(true as any)).toBe(false);
        });

        it("should return false for object missing required properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formData-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const incompleteFormData = {
                type: "http",
                url: "https://example.com",
                // missing other required properties
            };
            expect(isHttpFormData(incompleteFormData as any)).toBe(false);
        });

        it("should return false for object with wrong type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formData-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const wrongTypeFormData = {
                type: "ping", // should be "http"
                url: "https://example.com",
                method: "GET",
                timeout: 30,
                checkInterval: 60,
                retryAttempts: 3,
                followRedirects: true,
                expectedStatusCode: 200,
                headers: {},
            };

            expect(isHttpFormData(wrongTypeFormData as any)).toBe(false);
        });

        it("should return false for object with wrong property types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formData-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const invalidFormData = {
                type: "http",
                url: 123, // should be string
                method: "GET",
                timeout: 30,
                checkInterval: 60,
                retryAttempts: 3,
                followRedirects: true,
                expectedStatusCode: 200,
                headers: {},
            };

            expect(isHttpFormData(invalidFormData as any)).toBe(false);
        });
    });

    describe("isPingFormData", () => {
        it("should return true for valid PingFormData", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formData-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const validFormData: PingFormData = {
                type: "ping",
                host: "example.com",
                timeout: 5000,
                checkInterval: 30,
                retryAttempts: 3,
                packetCount: 4,
                packetSize: 64,
                maxPacketLoss: 25,
            };

            expect(isPingFormData(validFormData)).toBe(true);
        });

        it("should return true for minimal valid PingFormData", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formData-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const minimalFormData: PingFormData = {
                type: "ping",
                host: "",
                timeout: 0,
                checkInterval: 0,
                retryAttempts: 0,
            };

            expect(isPingFormData(minimalFormData)).toBe(true);
        });

        it("should return false for null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formData-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPingFormData(null as any)).toBe(false);
        });

        it("should return false for undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formData-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPingFormData(undefined as any)).toBe(false);
        });

        it("should return false for primitive types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formData-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPingFormData("string" as any)).toBe(false);
            expect(isPingFormData(123 as any)).toBe(false);
            expect(isPingFormData(true as any)).toBe(false);
        });

        it("should return false for object missing required properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formData-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const incompleteFormData = {
                type: "ping",
                host: "example.com",
                // missing other required properties
            };
            expect(isPingFormData(incompleteFormData as any)).toBe(false);
        });

        it("should return false for object with wrong type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formData-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const wrongTypeFormData = {
                type: "http", // should be "ping"
                host: "example.com",
                timeout: 5000,
                checkInterval: 30,
                retryAttempts: 3,
                packetSize: 64,
            };

            expect(isPingFormData(wrongTypeFormData as any)).toBe(false);
        });
    });

    describe("isPortFormData", () => {
        it("should return true for valid PortFormData", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formData-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const validFormData: PortFormData = {
                type: "port",
                host: "example.com",
                port: 443,
                timeout: 5000,
                checkInterval: 30,
                retryAttempts: 3,
                connectionTimeout: 3000,
            };

            expect(isPortFormData(validFormData)).toBe(true);
        });

        it("should return true for minimal valid PortFormData", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formData-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const minimalFormData: PortFormData = {
                type: "port",
                host: "",
                port: 0,
                timeout: 0,
                checkInterval: 0,
                retryAttempts: 0,
            };

            expect(isPortFormData(minimalFormData)).toBe(true);
        });

        it("should return false for null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formData-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPortFormData(null as any)).toBe(false);
        });

        it("should return false for undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formData-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPortFormData(undefined as any)).toBe(false);
        });

        it("should return false for primitive types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formData-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isPortFormData("string" as any)).toBe(false);
            expect(isPortFormData(123 as any)).toBe(false);
            expect(isPortFormData(true as any)).toBe(false);
        });

        it("should return false for object missing required properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formData-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const incompleteFormData = {
                type: "port",
                host: "example.com",
                port: 443,
                // missing other required properties
            };
            expect(isPortFormData(incompleteFormData as any)).toBe(false);
        });

        it("should return false for object with wrong type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formData-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const wrongTypeFormData = {
                type: "http", // should be "port"
                host: "example.com",
                port: 443,
                timeout: 5000,
                checkInterval: 30,
                retryAttempts: 3,
            };

            expect(isPortFormData(wrongTypeFormData as any)).toBe(false);
        });

        it("should return false for object with wrong property types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formData-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const invalidFormData = {
                type: "port",
                host: "example.com",
                port: "443", // should be number
                timeout: 5000,
                checkInterval: 30,
                retryAttempts: 3,
            };

            expect(isPortFormData(invalidFormData as any)).toBe(false);
        });
    });

    describe("Cross-type validation", () => {
        it("should correctly distinguish between different form data types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: formData-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            // Valid HTTP form data
            const httpFormData: HttpFormData = {
                type: "http",
                url: "https://example.com",
                method: "GET",
                timeout: 30,
                checkInterval: 60,
                retryAttempts: 3,
                followRedirects: true,
                expectedStatusCode: 200,
                headers: {},
            };

            // Valid ping form data
            const pingFormData: PingFormData = {
                type: "ping",
                host: "example.com",
                timeout: 5000,
                checkInterval: 30,
                retryAttempts: 3,
                packetCount: 4,
                packetSize: 64,
                maxPacketLoss: 25,
            };

            // Valid port form data
            const portFormData: PortFormData = {
                type: "port",
                host: "example.com",
                port: 443,
                timeout: 5000,
                checkInterval: 30,
                retryAttempts: 3,
                connectionTimeout: 3000,
            };

            // Each type guard should only return true for its own type
            expect(isHttpFormData(httpFormData)).toBe(true);
            expect(isPingFormData(httpFormData as any)).toBe(false);
            expect(isPortFormData(httpFormData as any)).toBe(false);

            expect(isHttpFormData(pingFormData as any)).toBe(false);
            expect(isPingFormData(pingFormData)).toBe(true);
            expect(isPortFormData(pingFormData as any)).toBe(false);

            expect(isHttpFormData(portFormData as any)).toBe(false);
            expect(isPingFormData(portFormData as any)).toBe(false);
            expect(isPortFormData(portFormData)).toBe(true);
        });
    });
});
