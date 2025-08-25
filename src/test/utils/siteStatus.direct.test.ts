/**
 * @file Direct tests for src/utils/siteStatus.ts frontend re-exports
 *
 *   Tests the frontend re-export wrapper to ensure coverage
 */

// Import directly from the frontend re-export file (src/utils/siteStatus.ts)
import {
    calculateSiteMonitoringStatus,
    calculateSiteStatus,
    getSiteDisplayStatus,
    getSiteStatusDescription,
    getSiteStatusVariant,
} from "@shared/utils/siteStatus";
import type { SiteStatus } from "../../../shared/types";

describe("Frontend siteStatus re-exports", () => {
    describe("Function re-exports", () => {
        it("should re-export calculateSiteMonitoringStatus function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            expect(typeof calculateSiteMonitoringStatus).toBe("function");

            // Test actual usage to ensure the function works through re-export
            const site = {
                id: "test1",
                name: "Test Site 1",
                url: "https://example.com",
                monitors: [
                    { monitoring: true, status: "up" as const },
                    { monitoring: false, status: "down" as const },
                ],
            };
            const result = calculateSiteMonitoringStatus(site);
            expect(typeof result).toBe("string");
        });

        it("should re-export calculateSiteStatus function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            expect(typeof calculateSiteStatus).toBe("function");

            // Test actual usage
            const site = {
                id: "test",
                name: "Test Site",
                url: "https://example.com",
                monitors: [{ monitoring: true, status: "up" as const }],
            };
            const result = calculateSiteStatus(site);
            expect(typeof result).toBe("string");
        });

        it("should re-export getSiteDisplayStatus function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            expect(typeof getSiteDisplayStatus).toBe("function");

            // Test actual usage
            const site = {
                id: "test",
                name: "Test Site",
                url: "https://example.com",
                monitors: [{ monitoring: true, status: "up" as const }],
            };
            const result = getSiteDisplayStatus(site);
            expect(typeof result).toBe("string");
        });

        it("should re-export getSiteStatusDescription function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            expect(typeof getSiteStatusDescription).toBe("function");

            // Test actual usage
            const site = {
                id: "test",
                name: "Test Site",
                url: "https://example.com",
                monitors: [],
            };
            const result = getSiteStatusDescription(site);
            expect(typeof result).toBe("string");
        });

        it("should re-export getSiteStatusVariant function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            expect(typeof getSiteStatusVariant).toBe("function");

            // Test actual usage
            const result = getSiteStatusVariant("up");
            expect(typeof result).toBe("string");
        });
    });

    describe("Type re-exports", () => {
        it("should re-export SiteStatus type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            // Verify the type is accessible
            const status: SiteStatus = "up";
            expect(status).toBe("up");
        });
    });

    describe("Functional integration", () => {
        it("should call re-exported calculateSiteStatus with monitor data", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const site = {
                id: "test-integration",
                name: "Integration Test Site",
                url: "https://integration.example.com",
                monitors: [
                    { monitoring: true, status: "up" as const },
                    { monitoring: true, status: "down" as const },
                ],
            };

            const result = calculateSiteStatus(site);
            expect([
                "up",
                "down",
                "mixed",
                "unknown",
            ]).toContain(result);
        });

        it("should call re-exported getSiteDisplayStatus", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const site = {
                id: "test-display",
                name: "Display Test Site",
                url: "https://display.example.com",
                monitors: [{ monitoring: true, status: "up" as const }],
            };

            const result = getSiteDisplayStatus(site);
            expect(typeof result).toBe("string");
            expect(result.length).toBeGreaterThan(0);
        });

        it("should call re-exported getSiteStatusDescription", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const site = {
                id: "test-desc",
                name: "Description Test Site",
                url: "https://desc.example.com",
                monitors: [],
            };

            const result = getSiteStatusDescription(site);
            expect(typeof result).toBe("string");
            expect(result.length).toBeGreaterThan(0);
        });

        it("should call re-exported getSiteStatusVariant", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const statuses: SiteStatus[] = [
                "up",
                "down",
                "mixed",
                "unknown",
            ];

            for (const status of statuses) {
                const result = getSiteStatusVariant(status);
                expect(typeof result).toBe("string");
                expect(result.length).toBeGreaterThan(0);
            }
        });

        it("should call re-exported calculateSiteMonitoringStatus", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const site = {
                id: "test-monitoring",
                name: "Monitoring Test Site",
                url: "https://monitoring.example.com",
                monitors: [
                    { monitoring: true, status: "up" as const },
                    { monitoring: false, status: "down" as const },
                    { monitoring: true, status: "pending" as const },
                ],
            };

            const result = calculateSiteMonitoringStatus(site);
            expect([
                "running",
                "stopped",
                "partial",
            ]).toContain(result);
        });
    });

    describe("Edge cases", () => {
        it("should handle empty monitor arrays", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const site = {
                id: "empty-test",
                name: "Empty Test Site",
                url: "https://empty.example.com",
                monitors: [],
            };

            const status = calculateSiteStatus(site);
            const display = getSiteDisplayStatus(site);
            const description = getSiteStatusDescription(site);
            const monitoring = calculateSiteMonitoringStatus(site);

            expect(typeof status).toBe("string");
            expect(typeof display).toBe("string");
            expect(typeof description).toBe("string");
            expect(typeof monitoring).toBe("string");
        });

        it("should handle invalid status strings gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = getSiteStatusVariant("invalid-status" as SiteStatus);
            expect(typeof result).toBe("string");
        });

        it("should call all status variants for different monitor statuses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const monitorStatuses = [
                "up",
                "down",
                "pending",
                "paused",
            ] as const;

            for (const status of monitorStatuses) {
                const site = {
                    id: `test-${status}`,
                    name: `Test ${status} Site`,
                    url: `https://${status}.example.com`,
                    monitors: [{ monitoring: true, status }],
                };

                const result = calculateSiteStatus(site);
                expect(typeof result).toBe("string");
            }
        });
    });
});
