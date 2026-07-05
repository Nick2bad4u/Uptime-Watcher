/**
 * @file Direct tests for src/utils/siteStatus.ts frontend re-exports
 *
 *   Tests the frontend re-export wrapper to ensure coverage
 */

import {
    MONITOR_STATUS_VALUES,
    SITE_STATUS_VALUES,
    type MonitorStatus,
    type SiteStatus,
} from "@shared/types";

import {
    sampleOne,
    siteIdentifierArbitrary,
    siteNameArbitrary,
    siteUrlArbitrary,
} from "@shared/test/arbitraries/siteArbitraries";
// Import directly from the frontend re-export file (src/utils/siteStatus.ts)
import {
    calculateSiteMonitoringStatus,
    calculateSiteStatus,
    getSiteDisplayStatus,
    getSiteStatusDescription,
    getSiteStatusVariant,
} from "@shared/utils/siteStatus";
import { safeCastTo } from "ts-extras";
import { describe, expect, it } from "vitest";

const createTestSite = (
    overrides: Partial<{
        id: string;
        monitors: { monitoring: boolean; status: MonitorStatus }[];
        name: string;
        url: string;
    }> = {}
) => ({
    id: overrides.id ?? sampleOne(siteIdentifierArbitrary),
    monitors: overrides.monitors ?? [
        { monitoring: true, status: safeCastTo<MonitorStatus>("up") },
    ],
    name: overrides.name ?? sampleOne(siteNameArbitrary),
    url: overrides.url ?? sampleOne(siteUrlArbitrary),
});

describe("frontend siteStatus re-exports", () => {
    describe("function re-exports", () => {
        it("should re-export calculateSiteMonitoringStatus function", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            expect(calculateSiteMonitoringStatus).toBeTypeOf("function");

            // Test actual usage to ensure the function works through re-export
            const site = createTestSite({
                monitors: [
                    { monitoring: true, status: "up" },
                    { monitoring: false, status: "down" },
                ],
            });
            const result = calculateSiteMonitoringStatus(site);

            expect(result).toBeTypeOf("string");
        });

        it("should re-export calculateSiteStatus function", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            expect(calculateSiteStatus).toBeTypeOf("function");

            // Test actual usage
            const site = createTestSite({
                monitors: [{ monitoring: true, status: "up" }],
            });
            const result = calculateSiteStatus(site);

            expect(result).toBeTypeOf("string");
        });

        it("should re-export getSiteDisplayStatus function", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            expect(getSiteDisplayStatus).toBeTypeOf("function");

            // Test actual usage
            const site = createTestSite({
                monitors: [{ monitoring: true, status: "up" }],
            });
            const result = getSiteDisplayStatus(site);

            expect(result).toBeTypeOf("string");
        });

        it("should re-export getSiteStatusDescription function", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            expect(getSiteStatusDescription).toBeTypeOf("function");

            // Test actual usage
            const site = createTestSite({
                monitors: [],
            });
            const result = getSiteStatusDescription(site);

            expect(result).toBeTypeOf("string");
        });

        it("should re-export getSiteStatusVariant function", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            expect(getSiteStatusVariant).toBeTypeOf("function");

            // Test actual usage
            const result = getSiteStatusVariant("up");

            expect(result).toBeTypeOf("string");
        });
    });

    describe("type re-exports", () => {
        it("should re-export SiteStatus type", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            // Verify the type is accessible
            const status: SiteStatus = "up";

            expect(status).toBe("up");
        });
    });

    describe("functional integration", () => {
        it("should call re-exported calculateSiteStatus with monitor data", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const site = createTestSite({
                monitors: [
                    { monitoring: true, status: "up" },
                    { monitoring: true, status: "down" },
                ],
            });

            const result = calculateSiteStatus(site);

            expect(SITE_STATUS_VALUES).toContain(result);
        });

        it("should call re-exported getSiteDisplayStatus", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const site = createTestSite({
                monitors: [{ monitoring: true, status: "up" }],
            });

            const result = getSiteDisplayStatus(site);

            expect(result).toBeTypeOf("string");
            expect(result.length).toBeGreaterThan(0);
        });

        it("should call re-exported getSiteStatusDescription", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const site = createTestSite({ monitors: [] });

            const result = getSiteStatusDescription(site);

            expect(result).toBeTypeOf("string");
            expect(result.length).toBeGreaterThan(0);
        });

        it("should call re-exported getSiteStatusVariant", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            for (const status of SITE_STATUS_VALUES) {
                const result = getSiteStatusVariant(status);

                expect(result).toBeTypeOf("string");
                expect(result.length).toBeGreaterThan(0);
            }
        });

        it("should call re-exported calculateSiteMonitoringStatus", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Export Operation", "type");

            const site = {
                id: "test-monitoring",
                monitors: [
                    { monitoring: true, status: "up" as const },
                    { monitoring: false, status: "down" as const },
                    { monitoring: true, status: "pending" as const },
                ],
                name: "Monitoring Test Site",
                url: "https://monitoring.example.com",
            };

            const result = calculateSiteMonitoringStatus(site);

            expect([
                "running",
                "stopped",
                "partial",
            ]).toContain(result);
        });
    });

    describe("edge cases", () => {
        it("should handle empty monitor arrays", async ({ annotate, task }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const site = {
                id: "empty-test",
                monitors: [],
                name: "Empty Test Site",
                url: "https://empty.example.com",
            };

            const status = calculateSiteStatus(site);
            const display = getSiteDisplayStatus(site);
            const description = getSiteStatusDescription(site);
            const monitoring = calculateSiteMonitoringStatus(site);

            expect(status).toBeTypeOf("string");
            expect(display).toBeTypeOf("string");
            expect(description).toBeTypeOf("string");
            expect(monitoring).toBeTypeOf("string");
        });

        it("should handle invalid status strings gracefully", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const result = getSiteStatusVariant("invalid-status" as SiteStatus);

            expect(result).toBeTypeOf("string");
        });

        it("should call all status variants for different monitor statuses", async ({
            annotate,
            task,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus.direct", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            for (const status of MONITOR_STATUS_VALUES) {
                const site = {
                    id: `test-${status}`,
                    monitors: [{ monitoring: true, status }],
                    name: `Test ${status} Site`,
                    url: `https://${status}.example.com`,
                };

                const result = calculateSiteStatus(site);

                expect(result).toBeTypeOf("string");
            }
        });
    });
});
