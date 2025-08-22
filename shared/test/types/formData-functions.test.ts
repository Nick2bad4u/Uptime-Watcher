/**
 * @fileoverview Tests for shared/types/formData.ts functions
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
        it("should return true for valid HttpFormData", () => {
            const validFormData: HttpFormData = {
                type: "http",
                name: "HTTP Monitor",
                url: "https://example.com",
                method: "GET",
                timeout: 30,
                checkInterval: 60,
                retryAttempts: 3,
                followRedirects: true,
                maxRedirects: 5,
                validateSSL: true,
                userAgent: "UptimeBot/1.0",
                headers: {},
                expectedStatusCodes: [200],
                expectedResponseTime: 1000,
                bodyMatch: "",
                bodyNotMatch: "",
            };

            expect(isHttpFormData(validFormData)).toBe(true);
        });

        it("should return true for minimal valid HttpFormData", () => {
            const minimalFormData: HttpFormData = {
                type: "http",
                name: "",
                url: "",
                method: "GET",
                timeout: 0,
                checkInterval: 0,
                retryAttempts: 0,
                followRedirects: false,
                maxRedirects: 0,
                validateSSL: false,
                userAgent: "",
                headers: {},
                expectedStatusCodes: [],
                expectedResponseTime: 0,
                bodyMatch: "",
                bodyNotMatch: "",
            };

            expect(isHttpFormData(minimalFormData)).toBe(true);
        });

        it("should return false for null", () => {
            expect(isHttpFormData(null)).toBe(false);
        });

        it("should return false for undefined", () => {
            expect(isHttpFormData(undefined)).toBe(false);
        });

        it("should return false for primitive types", () => {
            expect(isHttpFormData("string")).toBe(false);
            expect(isHttpFormData(123)).toBe(false);
            expect(isHttpFormData(true)).toBe(false);
        });

        it("should return false for object missing required properties", () => {
            const incompleteFormData = {
                type: "http",
                name: "HTTP Monitor",
                url: "https://example.com",
                // missing other required properties
            };

            expect(isHttpFormData(incompleteFormData)).toBe(false);
        });

        it("should return false for object with wrong type", () => {
            const wrongTypeFormData = {
                type: "ping", // should be "http"
                name: "HTTP Monitor",
                url: "https://example.com",
                method: "GET",
                timeout: 30,
                checkInterval: 60,
                retryAttempts: 3,
                followRedirects: true,
                maxRedirects: 5,
                validateSSL: true,
                userAgent: "UptimeBot/1.0",
                headers: {},
                expectedStatusCodes: [200],
                expectedResponseTime: 1000,
                bodyMatch: "",
                bodyNotMatch: "",
            };

            expect(isHttpFormData(wrongTypeFormData)).toBe(false);
        });

        it("should return false for object with wrong property types", () => {
            const invalidFormData = {
                type: "http",
                name: "HTTP Monitor",
                url: 123, // should be string
                method: "GET",
                timeout: 30,
                checkInterval: 60,
                retryAttempts: 3,
                followRedirects: true,
                maxRedirects: 5,
                validateSSL: true,
                userAgent: "UptimeBot/1.0",
                headers: {},
                expectedStatusCodes: [200],
                expectedResponseTime: 1000,
                bodyMatch: "",
                bodyNotMatch: "",
            };

            expect(isHttpFormData(invalidFormData)).toBe(false);
        });
    });

    describe("isPingFormData", () => {
        it("should return true for valid PingFormData", () => {
            const validFormData: PingFormData = {
                type: "ping",
                name: "Ping Monitor",
                host: "example.com",
                timeout: 5000,
                checkInterval: 30,
                retryAttempts: 3,
                retries: 3,
                interval: 1000,
                packetSize: 64,
                expectedResponseTime: 100,
            };

            expect(isPingFormData(validFormData)).toBe(true);
        });

        it("should return true for minimal valid PingFormData", () => {
            const minimalFormData: PingFormData = {
                type: "ping",
                name: "",
                host: "",
                timeout: 0,
                checkInterval: 0,
                retryAttempts: 0,
                retries: 0,
                interval: 0,
                packetSize: 0,
                expectedResponseTime: 0,
            };

            expect(isPingFormData(minimalFormData)).toBe(true);
        });

        it("should return false for null", () => {
            expect(isPingFormData(null)).toBe(false);
        });

        it("should return false for undefined", () => {
            expect(isPingFormData(undefined)).toBe(false);
        });

        it("should return false for primitive types", () => {
            expect(isPingFormData("string")).toBe(false);
            expect(isPingFormData(123)).toBe(false);
            expect(isPingFormData(true)).toBe(false);
        });

        it("should return false for object missing required properties", () => {
            const incompleteFormData = {
                type: "ping",
                name: "Ping Monitor",
                host: "example.com",
                // missing other required properties
            };

            expect(isPingFormData(incompleteFormData)).toBe(false);
        });

        it("should return false for object with wrong type", () => {
            const wrongTypeFormData = {
                type: "http", // should be "ping"
                name: "Ping Monitor",
                host: "example.com",
                timeout: 5000,
                checkInterval: 30,
                retryAttempts: 3,
                retries: 3,
                interval: 1000,
                packetSize: 64,
                expectedResponseTime: 100,
            };

            expect(isPingFormData(wrongTypeFormData)).toBe(false);
        });
    });

    describe("isPortFormData", () => {
        it("should return true for valid PortFormData", () => {
            const validFormData: PortFormData = {
                type: "port",
                name: "Port Monitor",
                host: "example.com",
                port: 80,
                timeout: 5000,
                checkInterval: 60,
                retryAttempts: 3,
                expectedResponseTime: 1000,
                protocol: "tcp",
            };

            expect(isPortFormData(validFormData)).toBe(true);
        });

        it("should return true for UDP protocol", () => {
            const udpFormData: PortFormData = {
                type: "port",
                name: "DNS Monitor",
                host: "dns.example.com",
                port: 53,
                timeout: 3000,
                checkInterval: 30,
                retryAttempts: 2,
                expectedResponseTime: 500,
                protocol: "udp",
            };

            expect(isPortFormData(udpFormData)).toBe(true);
        });

        it("should return false for null", () => {
            expect(isPortFormData(null)).toBe(false);
        });

        it("should return false for undefined", () => {
            expect(isPortFormData(undefined)).toBe(false);
        });

        it("should return false for primitive types", () => {
            expect(isPortFormData("string")).toBe(false);
            expect(isPortFormData(123)).toBe(false);
            expect(isPortFormData(true)).toBe(false);
        });

        it("should return false for object missing required properties", () => {
            const incompleteFormData = {
                type: "port",
                name: "Port Monitor",
                host: "example.com",
                port: 80,
                // missing other required properties
            };

            expect(isPortFormData(incompleteFormData)).toBe(false);
        });

        it("should return false for object with wrong type", () => {
            const wrongTypeFormData = {
                type: "ping", // should be "port"
                name: "Port Monitor",
                host: "example.com",
                port: 80,
                timeout: 5000,
                checkInterval: 60,
                retryAttempts: 3,
                expectedResponseTime: 1000,
                protocol: "tcp",
            };

            expect(isPortFormData(wrongTypeFormData)).toBe(false);
        });

        it("should return false for object with wrong property types", () => {
            const invalidFormData = {
                type: "port",
                name: "Port Monitor",
                host: "example.com",
                port: "80", // should be number
                timeout: 5000,
                checkInterval: 60,
                retryAttempts: 3,
                expectedResponseTime: 1000,
                protocol: "tcp",
            };

            expect(isPortFormData(invalidFormData)).toBe(false);
        });
    });

    describe("integration tests", () => {
        it("should differentiate between different form data types", () => {
            const httpFormData = {
                type: "http",
                name: "HTTP Monitor",
                url: "https://example.com",
                method: "GET",
                timeout: 30,
                checkInterval: 60,
                retryAttempts: 3,
                followRedirects: false,
                maxRedirects: 0,
                validateSSL: true,
                userAgent: "",
                headers: {},
                expectedStatusCodes: [],
                expectedResponseTime: 0,
                bodyMatch: "",
                bodyNotMatch: "",
            };

            const pingFormData = {
                type: "ping",
                name: "Ping Monitor",
                host: "example.com",
                timeout: 5000,
                checkInterval: 30,
                retryAttempts: 3,
                retries: 3,
                interval: 1000,
                packetSize: 64,
                expectedResponseTime: 100,
            };

            const portFormData = {
                type: "port",
                name: "Port Monitor",
                host: "example.com",
                port: 80,
                timeout: 5000,
                checkInterval: 60,
                retryAttempts: 3,
                expectedResponseTime: 1000,
                protocol: "tcp",
            };

            // Each form data should only match its own type
            expect(isHttpFormData(httpFormData)).toBe(true);
            expect(isPingFormData(httpFormData)).toBe(false);
            expect(isPortFormData(httpFormData)).toBe(false);

            expect(isHttpFormData(pingFormData)).toBe(false);
            expect(isPingFormData(pingFormData)).toBe(true);
            expect(isPortFormData(pingFormData)).toBe(false);

            expect(isHttpFormData(portFormData)).toBe(false);
            expect(isPingFormData(portFormData)).toBe(false);
            expect(isPortFormData(portFormData)).toBe(true);
        });

        it("should handle complex real-world form data", () => {
            const complexHttpFormData: HttpFormData = {
                type: "http",
                name: "API Health Check",
                url: "https://api.example.com/v1/health",
                method: "POST",
                timeout: 60,
                checkInterval: 300,
                retryAttempts: 5,
                followRedirects: true,
                maxRedirects: 3,
                validateSSL: true,
                userAgent: "UptimeBot/2.0 (Health Check)",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer token123",
                    "X-API-Version": "v1",
                },
                expectedStatusCodes: [200, 201, 202],
                expectedResponseTime: 2000,
                bodyMatch: "\"status\":\"healthy\"",
                bodyNotMatch: "maintenance",
            };

            expect(isHttpFormData(complexHttpFormData)).toBe(true);
        });

        it("should handle edge cases with boundary values", () => {
            // Test with extreme but valid values
            const extremePortFormData: PortFormData = {
                type: "port",
                name: "X".repeat(100), // long name
                host: "example.co.uk",
                port: 65535, // max port
                timeout: 1,
                checkInterval: 1,
                retryAttempts: 100,
                expectedResponseTime: 999999,
                protocol: "tcp",
            };

            expect(isPortFormData(extremePortFormData)).toBe(true);
        });
    });
});
