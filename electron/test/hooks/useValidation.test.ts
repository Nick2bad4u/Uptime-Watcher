/**
 * Tests for useValidation hook.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { Site } from "../../types";
import { useValidation } from "../../hooks/useValidation";
import { ValidationError } from "../../hooks/correlationUtils";

// Helper function to avoid nesting issues
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock the ConfigurationManager
vi.mock("../../managers/ConfigurationManager", () => ({
    configurationManager: {
        validateSiteConfiguration: vi.fn(),
        validateMonitorConfiguration: vi.fn(),
    },
}));

import { configurationManager } from "../../managers/ConfigurationManager";

describe("useValidation", () => {
    const mockConfigurationManager = vi.mocked(configurationManager);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("validateSite", () => {
        it("should validate site configuration", () => {
            const validation = useValidation();
            const mockSite = { identifier: "test-site", name: "Test Site" } as Site;
            const mockResult = { isValid: true, errors: [] };

            mockConfigurationManager.validateSiteConfiguration.mockReturnValue(mockResult);

            const result = validation.validateSite(mockSite);

            expect(result).toBe(mockResult);
            expect(mockConfigurationManager.validateSiteConfiguration).toHaveBeenCalledWith(mockSite);
        });

        it("should return validation errors for invalid site", () => {
            const validation = useValidation();
            const mockSite = { identifier: "", name: "" } as Site;
            const mockResult = { isValid: false, errors: ["Invalid identifier", "Name is required"] };

            mockConfigurationManager.validateSiteConfiguration.mockReturnValue(mockResult);

            const result = validation.validateSite(mockSite);

            expect(result).toBe(mockResult);
            expect(result.isValid).toBe(false);
            expect(result.errors).toEqual(["Invalid identifier", "Name is required"]);
        });
    });

    describe("validateMonitor", () => {
        it("should validate monitor configuration", () => {
            const validation = useValidation();
            const mockMonitor = { id: "test-monitor", type: "http" } as Site["monitors"][0];
            const mockResult = { isValid: true, errors: [] };

            mockConfigurationManager.validateMonitorConfiguration.mockReturnValue(mockResult);

            const result = validation.validateMonitor(mockMonitor);

            expect(result).toBe(mockResult);
            expect(mockConfigurationManager.validateMonitorConfiguration).toHaveBeenCalledWith(mockMonitor);
        });

        it("should return validation errors for invalid monitor", () => {
            const validation = useValidation();
            const mockMonitor = { type: "invalid" } as unknown as Site["monitors"][0];
            const mockResult = { isValid: false, errors: ["Invalid monitor type"] };

            mockConfigurationManager.validateMonitorConfiguration.mockReturnValue(mockResult);

            const result = validation.validateMonitor(mockMonitor);

            expect(result).toBe(mockResult);
            expect(result.isValid).toBe(false);
            expect(result.errors).toEqual(["Invalid monitor type"]);
        });
    });

    describe("withValidation", () => {
        it("should execute operation when validation passes", async () => {
            const validation = useValidation();
            const mockData = { test: "data" };
            const mockValidator = vi.fn().mockReturnValue({ isValid: true, errors: [] });
            const mockOperation = vi.fn().mockResolvedValue("operation-result");

            const result = await validation.withValidation(mockData, mockValidator, mockOperation);

            expect(result).toBe("operation-result");
            expect(mockValidator).toHaveBeenCalledWith(mockData);
            expect(mockOperation).toHaveBeenCalledOnce();
        });

        it("should throw ValidationError when validation fails", async () => {
            const validation = useValidation();
            const mockData = { test: "invalid-data" };
            const mockErrors = ["Field is required", "Invalid format"];
            const mockValidator = vi.fn().mockReturnValue({ isValid: false, errors: mockErrors });
            const mockOperation = vi.fn();

            await expect(validation.withValidation(mockData, mockValidator, mockOperation)).rejects.toThrow(
                ValidationError
            );

            expect(mockValidator).toHaveBeenCalledWith(mockData);
            expect(mockOperation).not.toHaveBeenCalled();

            try {
                await validation.withValidation(mockData, mockValidator, mockOperation);
            } catch (error) {
                expect(error).toBeInstanceOf(ValidationError);
                expect((error as ValidationError).errors).toEqual(mockErrors);
                expect((error as ValidationError).message).toBe("Validation failed: Field is required, Invalid format");
            }
        });

        it("should propagate operation errors", async () => {
            const validation = useValidation();
            const mockData = { test: "data" };
            const mockValidator = vi.fn().mockReturnValue({ isValid: true, errors: [] });
            const operationError = new Error("Operation failed");
            const mockOperation = vi.fn().mockRejectedValue(operationError);

            await expect(validation.withValidation(mockData, mockValidator, mockOperation)).rejects.toThrow(
                "Operation failed"
            );

            expect(mockValidator).toHaveBeenCalledWith(mockData);
            expect(mockOperation).toHaveBeenCalledOnce();
        });

        it("should handle async operations correctly", async () => {
            const validation = useValidation();
            const mockData = { test: "data" };
            const mockValidator = vi.fn().mockReturnValue({ isValid: true, errors: [] });

            const mockOperation = vi.fn().mockImplementation(async () => {
                await delay(10);
                return "async-result";
            });

            const result = await validation.withValidation(mockData, mockValidator, mockOperation);

            expect(result).toBe("async-result");
            expect(mockValidator).toHaveBeenCalledWith(mockData);
            expect(mockOperation).toHaveBeenCalledOnce();
        });

        it("should work with complex validation scenarios", async () => {
            const validation = useValidation();

            // Test with site validation
            const mockSite = { identifier: "test", name: "Test Site" } as Site;
            const siteValidator = (data: unknown) => validation.validateSite(data as Site);
            const mockOperation = vi.fn().mockResolvedValue("site-validated");

            mockConfigurationManager.validateSiteConfiguration.mockReturnValue({ isValid: true, errors: [] });

            const result = await validation.withValidation(mockSite, siteValidator, mockOperation);

            expect(result).toBe("site-validated");
            expect(mockConfigurationManager.validateSiteConfiguration).toHaveBeenCalledWith(mockSite);
            expect(mockOperation).toHaveBeenCalledOnce();
        });
    });
});
