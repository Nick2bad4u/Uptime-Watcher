import { describe, expect, it } from "vitest";

/**
 * Test suite for src/utils/siteStatus.ts re-exports
 *
 * @file Tests the frontend wrapper that re-exports shared site status utilities
 */

describe("Frontend SiteStatus Re-exports", () => {
    describe("Re-exported functions", () => {
        it("should re-export calculateSiteMonitoringStatus function", async () => {
            const { calculateSiteMonitoringStatus } = await import(
                "../../utils/siteStatus"
            );
            expect(typeof calculateSiteMonitoringStatus).toBe("function");
        });

        it("should re-export calculateSiteStatus function", async () => {
            const { calculateSiteStatus } = await import(
                "../../utils/siteStatus"
            );
            expect(typeof calculateSiteStatus).toBe("function");
        });

        it("should re-export getSiteDisplayStatus function", async () => {
            const { getSiteDisplayStatus } = await import(
                "../../utils/siteStatus"
            );
            expect(typeof getSiteDisplayStatus).toBe("function");
        });

        it("should re-export getSiteStatusDescription function", async () => {
            const { getSiteStatusDescription } = await import(
                "../../utils/siteStatus"
            );
            expect(typeof getSiteStatusDescription).toBe("function");
        });

        it("should re-export getSiteStatusVariant function", async () => {
            const { getSiteStatusVariant } = await import(
                "../../utils/siteStatus"
            );
            expect(typeof getSiteStatusVariant).toBe("function");
        });
    });

    describe("Re-exported types", () => {
        it("should re-export SiteStatus type", async () => {
            // Import to verify type export doesn't cause runtime errors
            const module = await import("../../utils/siteStatus");

            // Check that the module has the expected exports
            expect(module).toHaveProperty("calculateSiteMonitoringStatus");
            expect(module).toHaveProperty("calculateSiteStatus");
            expect(module).toHaveProperty("getSiteDisplayStatus");
            expect(module).toHaveProperty("getSiteStatusDescription");
            expect(module).toHaveProperty("getSiteStatusVariant");
        });
    });

    describe("Functional integration", () => {
        it("should call re-exported calculateSiteStatus with monitor data", async () => {
            const { calculateSiteStatus } = await import(
                "../../utils/siteStatus"
            );

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

        it("should call re-exported getSiteDisplayStatus", async () => {
            const { getSiteDisplayStatus } = await import(
                "../../utils/siteStatus"
            );

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

        it("should call re-exported getSiteStatusDescription", async () => {
            const { getSiteStatusDescription } = await import(
                "../../utils/siteStatus"
            );

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

        it("should call re-exported getSiteStatusVariant", async () => {
            const { getSiteStatusVariant } = await import(
                "../../utils/siteStatus"
            );

            const result = getSiteStatusVariant("up");
            expect(result).toBeDefined();
            expect(typeof result).toBe("string");
        });

        it("should call re-exported calculateSiteMonitoringStatus", async () => {
            const { calculateSiteMonitoringStatus } = await import(
                "../../utils/siteStatus"
            );

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
        it("should handle empty monitor arrays", async () => {
            const { calculateSiteStatus } = await import(
                "../../utils/siteStatus"
            );

            const site = { monitors: [] };
            const result = calculateSiteStatus(site);
            expect(result).toBeDefined();
        });

        it("should handle invalid status strings gracefully", async () => {
            const { getSiteStatusVariant } = await import(
                "../../utils/siteStatus"
            );

            // These should handle invalid inputs gracefully
            expect(() => getSiteStatusVariant("invalid" as any)).not.toThrow();
        });
    });
});
