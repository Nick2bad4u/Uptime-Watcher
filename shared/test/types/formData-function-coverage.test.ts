/**
 * Comprehensive function coverage tests for shared/types/formData.ts
 * Target: 50% function coverage -> 100%
 * Missing lines: 279-280,303-306,321
 */

import { describe, expect, it } from "vitest";
import {
    isHttpFormData,
    isPingFormData,
    isPortFormData,
} from "../../types/formData";

describe("FormData Types - Complete Function Coverage", () => {
    describe("isHttpFormData", () => {
        it("should return true for valid HTTP form data", () => {
            const validData = {
                type: "http" as const,
                url: "https://example.com",
                checkInterval: 60000,
                retryAttempts: 3,
                timeout: 5000,
                method: "GET" as const,
                expectedStatusCode: 200
            };
            expect(isHttpFormData(validData)).toBe(true);
        });

        it("should return false for null", () => {
            expect(isHttpFormData(null as any)).toBe(false);
        });

        it("should return false for undefined", () => {
            expect(isHttpFormData(undefined as any)).toBe(false);
        });

        it("should return false for wrong type", () => {
            const data = {
                type: "dns",
                name: "Test",
                checkInterval: 60000,
                retryAttempts: 3,
                timeout: 5000
            };
            expect(isHttpFormData(data as any)).toBe(false);
        });
    });

    describe("isPingFormData (lines 279-280 coverage)", () => {
        it("should return true for valid ping form data", () => {
            const validData = {
                type: "ping" as const,
                host: "example.com",
                checkInterval: 60000,
                retryAttempts: 3,
                timeout: 5000
            };
            expect(isPingFormData(validData)).toBe(true);
        });

        it("should return false for null", () => {
            expect(isPingFormData(null as any)).toBe(false);
        });

        it("should return false for undefined", () => {
            expect(isPingFormData(undefined as any)).toBe(false);
        });

        it("should return false for non-object", () => {
            expect(isPingFormData("string" as any)).toBe(false);
        });

        it("should return false for wrong type", () => {
            const data = {
                type: "http",
                host: "example.com",
                checkInterval: 60000,
                retryAttempts: 3,
                timeout: 5000
            };
            expect(isPingFormData(data as any)).toBe(false);
        });

        it("should return false for missing host", () => {
            const data = {
                type: "ping",
                checkInterval: 60000,
                retryAttempts: 3,
                timeout: 5000
            };
            expect(isPingFormData(data as any)).toBe(false);
        });

        it("should return false for non-string host", () => {
            const data = {
                type: "ping",
                host: 123,
                checkInterval: 60000,
                retryAttempts: 3,
                timeout: 5000
            };
            expect(isPingFormData(data as any)).toBe(false);
        });

        it("should return false for non-number checkInterval", () => {
            const data = {
                type: "ping",
                host: "example.com",
                checkInterval: "60000",
                retryAttempts: 3,
                timeout: 5000
            };
            expect(isPingFormData(data as any)).toBe(false);
        });

        it("should return false for non-number retryAttempts", () => {
            const data = {
                type: "ping",
                host: "example.com",
                checkInterval: 60000,
                retryAttempts: "3",
                timeout: 5000
            };
            expect(isPingFormData(data as any)).toBe(false);
        });

        it("should return false for non-number timeout", () => {
            const data = {
                type: "ping",
                host: "example.com",
                checkInterval: 60000,
                retryAttempts: 3,
                timeout: "5000"
            };
            expect(isPingFormData(data as any)).toBe(false);
        });
    });

    describe("isPortFormData (lines 303-306, 321 coverage)", () => {
        it("should return true for valid port form data", () => {
            const validData = {
                type: "port" as const,
                host: "example.com",
                port: 443,
                checkInterval: 60000,
                retryAttempts: 3,
                timeout: 5000
            };
            expect(isPortFormData(validData)).toBe(true);
        });

        it("should return false for null", () => {
            expect(isPortFormData(null as any)).toBe(false);
        });

        it("should return false for undefined", () => {
            expect(isPortFormData(undefined as any)).toBe(false);
        });

        it("should return false for non-object", () => {
            expect(isPortFormData("string" as any)).toBe(false);
        });

        it("should return false for wrong type", () => {
            const data = {
                type: "ping",
                host: "example.com",
                port: 443,
                checkInterval: 60000,
                retryAttempts: 3,
                timeout: 5000
            };
            expect(isPortFormData(data as any)).toBe(false);
        });

        it("should return false for missing host", () => {
            const data = {
                type: "port",
                port: 443,
                checkInterval: 60000,
                retryAttempts: 3,
                timeout: 5000
            };
            expect(isPortFormData(data as any)).toBe(false);
        });

        it("should return false for non-string host", () => {
            const data = {
                type: "port",
                host: 123,
                port: 443,
                checkInterval: 60000,
                retryAttempts: 3,
                timeout: 5000
            };
            expect(isPortFormData(data as any)).toBe(false);
        });

        it("should return false for missing port", () => {
            const data = {
                type: "port",
                host: "example.com",
                checkInterval: 60000,
                retryAttempts: 3,
                timeout: 5000
            };
            expect(isPortFormData(data as any)).toBe(false);
        });

        it("should return false for non-number port", () => {
            const data = {
                type: "port",
                host: "example.com",
                port: "443",
                checkInterval: 60000,
                retryAttempts: 3,
                timeout: 5000
            };
            expect(isPortFormData(data as any)).toBe(false);
        });

        it("should return false for non-number checkInterval", () => {
            const data = {
                type: "port",
                host: "example.com",
                port: 443,
                checkInterval: "60000",
                retryAttempts: 3,
                timeout: 5000
            };
            expect(isPortFormData(data as any)).toBe(false);
        });

        it("should return false for non-number retryAttempts", () => {
            const data = {
                type: "port",
                host: "example.com",
                port: 443,
                checkInterval: 60000,
                retryAttempts: "3",
                timeout: 5000
            };
            expect(isPortFormData(data as any)).toBe(false);
        });

        it("should return false for non-number timeout", () => {
            const data = {
                type: "port",
                host: "example.com",
                port: 443,
                checkInterval: 60000,
                retryAttempts: 3,
                timeout: "5000"
            };
            expect(isPortFormData(data as any)).toBe(false);
        });
    });

    describe("All Form Data Type Guards Coverage", () => {
        it("should exercise all form data type guard functions", () => {
            // Test HTTP form data
            expect(isHttpFormData({
                type: "http" as const,
                url: "https://test.com",
                checkInterval: 60000,
                retryAttempts: 3,
                timeout: 5000,
                method: "GET" as const,
                expectedStatusCode: 200
            })).toBe(true);

            // Test ping form data
            expect(isPingFormData({
                type: "ping" as const,
                host: "test.com",
                checkInterval: 60000,
                retryAttempts: 3,
                timeout: 5000
            })).toBe(true);

            // Test port form data
            expect(isPortFormData({
                type: "port" as const,
                host: "test.com",
                port: 80,
                checkInterval: 60000,
                retryAttempts: 3,
                timeout: 5000
            })).toBe(true);
        });
    });
});
