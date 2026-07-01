import { describe, expect, it } from "vitest";

/**
 * Test suite for shared siteStatus utilities
 *
 * @file Tests the shared site status utilities directly
 */

describe("shared SiteStatus Utilities", () => {
    describe("shared functions", () => {
        it("should export calculateSiteMonitoringStatus function", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.reexport", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const { calculateSiteMonitoringStatus } =
                await import("@shared/utils/siteStatus");

            expect(calculateSiteMonitoringStatus).toBeTypeOf("function");
        });

        it("should export calculateSiteStatus function", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.reexport", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const { calculateSiteStatus } =
                await import("@shared/utils/siteStatus");

            expect(calculateSiteStatus).toBeTypeOf("function");
        });

        it("should export getSiteDisplayStatus function", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.reexport", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const { getSiteDisplayStatus } =
                await import("@shared/utils/siteStatus");

            expect(getSiteDisplayStatus).toBeTypeOf("function");
        });

        it("should export getSiteStatusDescription function", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.reexport", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const { getSiteStatusDescription } =
                await import("@shared/utils/siteStatus");

            expect(getSiteStatusDescription).toBeTypeOf("function");
        });

        it("should export getSiteStatusVariant function", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.reexport", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const { getSiteStatusVariant } =
                await import("@shared/utils/siteStatus");

            expect(getSiteStatusVariant).toBeTypeOf("function");
        });
    });

    describe("re-exported types", () => {
        it("should re-export SiteStatus type", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.reexport", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            // Import to verify type export doesn't cause runtime errors
            const module = await import("@shared/utils/siteStatus");

            // Check that the module has the expected exports
            expect(module).toHaveProperty("calculateSiteMonitoringStatus");
            expect(module).toHaveProperty("calculateSiteStatus");
            expect(module).toHaveProperty("getSiteDisplayStatus");
            expect(module).toHaveProperty("getSiteStatusDescription");
            expect(module).toHaveProperty("getSiteStatusVariant");
        });
    });

    describe("functional integration", () => {
        it("should call re-exported calculateSiteStatus with monitor data", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.reexport", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const { calculateSiteStatus } =
                await import("@shared/utils/siteStatus");

            const site = {
                monitors: [
                    {
                        checkInterval: 30_000,
                        id: "test-1",
                        monitoring: true,
                        responseTime: 200,
                        retryAttempts: 3,
                        status: "up" as const,
                        timeout: 5000,
                        type: "http" as const,
                        url: "https://example.com",
                    },
                ],
            };

            const result = calculateSiteStatus(site);

            expect(result).toBeDefined();
            expect(result).toBeTypeOf("string");
        });

        it("should call re-exported getSiteDisplayStatus", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.reexport", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const { getSiteDisplayStatus } =
                await import("@shared/utils/siteStatus");

            const site = {
                monitors: [
                    {
                        id: "test-1",
                        monitoring: true,
                        status: "up" as const,
                        type: "http" as const,
                    },
                ],
            };

            const result = getSiteDisplayStatus(site);

            expect(result).toBeDefined();
            expect(result).toBeTypeOf("string");
        });

        it("should call re-exported getSiteStatusDescription", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.reexport", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const { getSiteStatusDescription } =
                await import("@shared/utils/siteStatus");

            const site = {
                monitors: [
                    {
                        id: "test-1",
                        monitoring: true,
                        status: "up" as const,
                        type: "http" as const,
                    },
                ],
            };

            const result = getSiteStatusDescription(site);

            expect(result).toBeDefined();
            expect(result).toBeTypeOf("string");
        });

        it("should call re-exported getSiteStatusVariant", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.reexport", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const { getSiteStatusVariant } =
                await import("@shared/utils/siteStatus");

            const result = getSiteStatusVariant("up");

            expect(result).toBeDefined();
            expect(result).toBeTypeOf("string");
        });

        it("should call re-exported calculateSiteMonitoringStatus", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.reexport", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const { calculateSiteMonitoringStatus } =
                await import("@shared/utils/siteStatus");

            const site = {
                monitors: [
                    {
                        checkInterval: 30_000,
                        id: "test-1",
                        monitoring: true,
                        responseTime: 200,
                        retryAttempts: 3,
                        status: "up" as const,
                        timeout: 5000,
                        type: "http" as const,
                        url: "https://example.com",
                    },
                ],
            };

            const result = calculateSiteMonitoringStatus(site);

            expect(result).toBeDefined();
            expect(result).toBeTypeOf("string");
        });
    });

    describe("edge cases", () => {
        it("should handle empty monitor arrays", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.reexport", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const { calculateSiteStatus } =
                await import("@shared/utils/siteStatus");

            const site = { monitors: [] };
            const result = calculateSiteStatus(site);

            expect(result).toBeDefined();
        });

        it("should handle invalid status strings gracefully", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.reexport", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const { getSiteStatusVariant } =
                await import("@shared/utils/siteStatus");

            // These should handle invalid inputs gracefully
            expect(() => getSiteStatusVariant("invalid" as any)).not.toThrow();
        });
    });
});
