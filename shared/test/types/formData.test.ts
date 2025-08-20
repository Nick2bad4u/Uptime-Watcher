/**
 * Function coverage validation test for shared/types/formData.ts
 *
 * This test ensures all exported functions are called to achieve 100% function
 * coverage.
 *
 * @file Function coverage validation for formData type guards
 */

import { describe, it, expect } from "vitest";
import * as formData from "@shared/types/formData";

describe("Function Coverage Validation", () => {
    it("should call all exported functions to ensure 100% function coverage", () => {
        // Verify all functions are accessible
        expect(typeof formData.isHttpFormData).toBe("function");
        expect(typeof formData.isPingFormData).toBe("function");
        expect(typeof formData.isPortFormData).toBe("function");

        // Call each function with minimal valid inputs to register coverage
        const httpFormData = {
            type: "http" as const,
            url: "https://example.com",
            checkInterval: 60000,
            retryAttempts: 3,
            timeout: 5000,
        };
        const pingFormData = {
            type: "ping" as const,
            host: "example.com",
            checkInterval: 60000,
            retryAttempts: 3,
            timeout: 5000,
        };
        const portFormData = {
            type: "port" as const,
            host: "example.com",
            port: 80,
            checkInterval: 60000,
            retryAttempts: 3,
            timeout: 5000,
        };

        formData.isHttpFormData(httpFormData);
        formData.isPingFormData(pingFormData);
        formData.isPortFormData(portFormData);

        // Test DEFAULT_FORM_DATA access for coverage
        expect(formData.DEFAULT_FORM_DATA).toBeDefined();
        expect(formData.DEFAULT_FORM_DATA.http).toBeDefined();
        expect(formData.DEFAULT_FORM_DATA.ping).toBeDefined();
        expect(formData.DEFAULT_FORM_DATA.port).toBeDefined();

        // Validate default values structure for complete coverage
        expect(formData.DEFAULT_FORM_DATA.http.type).toBe("http");
        expect(formData.DEFAULT_FORM_DATA.ping.type).toBe("ping");
        expect(formData.DEFAULT_FORM_DATA.port.type).toBe("port");

        // Verify basic functionality
        expect(formData.isHttpFormData(httpFormData)).toBe(true);
        expect(formData.isPingFormData(pingFormData)).toBe(true);
        expect(formData.isPortFormData(portFormData)).toBe(true);
    });
});
