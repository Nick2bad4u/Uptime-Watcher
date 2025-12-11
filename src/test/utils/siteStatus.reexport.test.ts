import { describe, expect, it } from "vitest";

/**
 * Test suite for shared siteStatus utilities
 *
 * @file Tests the shared site status utilities directly
 */

describe("Shared SiteStatus Utilities", () => {
    describe("Shared functions", () => {
        it("should export calculateSiteMonitoringStatus function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.reexport", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const { calculateSiteMonitoringStatus } =
                await import("@shared/utils/siteStatus");
            expect(typeof calculateSiteMonitoringStatus).toBe("function");
        });

        it("should export calculateSiteStatus function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.reexport", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const { calculateSiteStatus } =
                await import("@shared/utils/siteStatus");
            expect(typeof calculateSiteStatus).toBe("function");
        });

        it("should export getSiteDisplayStatus function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.reexport", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const { getSiteDisplayStatus } =
                await import("@shared/utils/siteStatus");
            expect(typeof getSiteDisplayStatus).toBe("function");
        });

        it("should export getSiteStatusDescription function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.reexport", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const { getSiteStatusDescription } =
                await import("@shared/utils/siteStatus");
            expect(typeof getSiteStatusDescription).toBe("function");
        });

        it("should export getSiteStatusVariant function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.reexport", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const { getSiteStatusVariant } =
                await import("@shared/utils/siteStatus");
            expect(typeof getSiteStatusVariant).toBe("function");
        });
    });

    describe("Re-exported types", () => {
        it("should re-export SiteStatus type", async ({ task, annotate }) => {
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

    describe("Functional integration", () => {
        it("should call re-exported calculateSiteStatus with monitor data", async ({
            task,
            annotate,
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
                        id: "test-1",
                        type: "http" as const,
                        status: "up" as const,
                        monitoring: true,
                        checkInterval: 30_000,
                        timeout: 5000,
                        retryAttempts: 3,
                        responseTime: 200,
                        url: "https://example.com",
                    },
                ],
            };

            const result = calculateSiteStatus(site);
            expect(result).toBeDefined();
            expect(typeof result).toBe("string");
        });

        it("should call re-exported getSiteDisplayStatus", async ({
            task,
            annotate,
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
                        type: "http" as const,
                        status: "up" as const,
                        monitoring: true,
                    },
                ],
            };

            const result = getSiteDisplayStatus(site);
            expect(result).toBeDefined();
            expect(typeof result).toBe("string");
        });

        it("should call re-exported getSiteStatusDescription", async ({
            task,
            annotate,
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
                        type: "http" as const,
                        status: "up" as const,
                        monitoring: true,
                    },
                ],
            };

            const result = getSiteStatusDescription(site);
            expect(result).toBeDefined();
            expect(typeof result).toBe("string");
        });

        it("should call re-exported getSiteStatusVariant", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.reexport", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const { getSiteStatusVariant } =
                await import("@shared/utils/siteStatus");

            const result = getSiteStatusVariant("up");
            expect(result).toBeDefined();
            expect(typeof result).toBe("string");
        });

        it("should call re-exported calculateSiteMonitoringStatus", async ({
            task,
            annotate,
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
                        id: "test-1",
                        type: "http" as const,
                        status: "up" as const,
                        monitoring: true,
                        checkInterval: 30_000,
                        timeout: 5000,
                        retryAttempts: 3,
                        responseTime: 200,
                        url: "https://example.com",
                    },
                ],
            };

            const result = calculateSiteMonitoringStatus(site);
            expect(result).toBeDefined();
            expect(typeof result).toBe("string");
        });
    });

    describe("Edge cases", () => {
        it("should handle empty monitor arrays", async ({ task, annotate }) => {
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
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.reexport", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const { getSiteStatusVariant } =
                await import("@shared/utils/siteStatus");

            // These should handle invalid inputs gracefully
            expect(() =>
                getSiteStatusVariant("invalid" as any)).not.toThrowError();
        });
    });
});
