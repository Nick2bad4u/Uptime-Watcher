/**
 * Comprehensive test suite for SiteValidator Focuses on complete branch
 * coverage and edge cases
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { MonitorValidator as MonitorValidatorType } from "../../../managers/validators/MonitorValidator";

const monitorValidatorCtor = vi.hoisted(() => {
    const wrapper = vi.fn(function MockMonitorValidator() {
        const instance: Partial<MonitorValidatorType> = {
            validateMonitorConfiguration: vi.fn(),
        };

        wrapper.latestInstance = instance;

        return instance;
    }) as unknown as typeof vi.fn & {
        latestInstance?: Partial<MonitorValidatorType>;
    };

    wrapper.latestInstance = undefined;

    return wrapper;
});

vi.mock("../../../managers/validators/MonitorValidator", () => ({
    MonitorValidator: monitorValidatorCtor,
}));

import { SiteValidator } from "../../../managers/validators/SiteValidator";
import { MonitorValidator } from "../../../managers/validators/MonitorValidator";
import type { Site } from "@shared/types";

describe("SiteValidator - Comprehensive Coverage", () => {
    let siteValidator: SiteValidator;
    let mockMonitorValidator: Partial<MonitorValidator>;

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        siteValidator = new SiteValidator();

        const latestInstance = monitorValidatorCtor.latestInstance;
        mockMonitorValidator = (latestInstance ??
            new monitorValidatorCtor()) as Partial<MonitorValidator>;
    });

    describe("Constructor", () => {
        it("should create instance with MonitorValidator", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Constructor", "type");

            expect(siteValidator).toBeInstanceOf(SiteValidator);
            expect(MonitorValidator).toHaveBeenCalledTimes(1);
        });
    });

    describe("shouldIncludeInExport", () => {
        it("should return true for valid non-empty identifier", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

            const site: Site = {
                identifier: "valid-site",
                name: "Test Site",
                monitoring: true,
                monitors: [],
            };

            const result = siteValidator.shouldIncludeInExport(site);
            expect(result).toBeTruthy();
        });

        it("should return false for empty string identifier", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

            const site: Site = {
                identifier: "",
                name: "Test Site",
                monitoring: true,
                monitors: [],
            };

            const result = siteValidator.shouldIncludeInExport(site);
            expect(result).toBeFalsy();
        });
    });

    describe("validateSiteConfiguration", () => {
        it("should return valid result for complete valid site", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

            const site: Site = {
                identifier: "valid-site",
                name: "Test Site",
                monitoring: true,
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        url: "https://example.com",
                        timeout: 5000,
                        retryAttempts: 3,
                        checkInterval: 60_000,
                        monitoring: true,
                        status: "up",
                        responseTime: 150,
                        history: [],
                    },
                ],
            };

            // Mock monitor validation to return valid
            mockMonitorValidator.validateMonitorConfiguration = vi
                .fn()
                .mockReturnValue({
                    isValid: true,
                    errors: [],
                });

            const result = siteValidator.validateSiteConfiguration(site);

            expect(result.success).toBeTruthy();
            expect(result.errors).toEqual([]);
        });

        it("should handle invalid monitors array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: SiteValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

            const site: any = {
                identifier: "valid-site",
                name: "Test Site",
                monitoring: true,
                monitors: "not-an-array",
            };

            const result = siteValidator.validateSiteConfiguration(site);

            expect(result.success).toBeFalsy();
            expect(result.errors).toContain("Site monitors must be an array");
        });
    });
});
