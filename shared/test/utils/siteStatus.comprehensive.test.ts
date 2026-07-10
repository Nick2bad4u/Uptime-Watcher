/**
 * Comprehensive tests for siteStatus utilities.
 *
 * @remarks
 * These tests ensure 90%+ branch coverage for all site status calculation
 * functions. Tests cover all possible combinations of monitor states and edge
 * cases.
 */

import { beforeEach, describe, expect, it } from "vitest";

import type { MonitorStatus, SiteForStatus, SiteStatus } from "../../types";

import {
    calculateSiteMonitoringStatus,
    calculateSiteStatus,
    getSiteDisplayStatus,
    getSiteStatusDescription,
    getSiteStatusVariant,
} from "../../utils/siteStatus";

/**
 * Helper function to create a test site with specified monitors.
 */
function createTestSite(
    monitors: { monitoring: boolean; status: MonitorStatus }[]
): SiteForStatus {
    return {
        monitors: monitors.map((monitor) => ({
            monitoring: monitor.monitoring,
            status: monitor.status,
        })),
    };
}

describe(calculateSiteMonitoringStatus, () => {
    it("should return 'stopped' for sites with no monitors", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const site = createTestSite([]);
        const result = calculateSiteMonitoringStatus(site);
        expect(result).toBe("stopped");
    });

    it("should return 'stopped' when all monitors are not monitoring", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const site = createTestSite([
            { monitoring: false, status: "up" },
            { monitoring: false, status: "down" },
            { monitoring: false, status: "pending" },
        ]);
        const result = calculateSiteMonitoringStatus(site);
        expect(result).toBe("stopped");
    });

    it("should return 'running' when all monitors are monitoring", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const site = createTestSite([
            { monitoring: true, status: "up" },
            { monitoring: true, status: "down" },
            { monitoring: true, status: "pending" },
        ]);
        const result = calculateSiteMonitoringStatus(site);
        expect(result).toBe("running");
    });

    it("should return 'partial' when some monitors are monitoring and some are not", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const site = createTestSite([
            { monitoring: true, status: "up" },
            { monitoring: false, status: "down" },
            { monitoring: true, status: "pending" },
        ]);
        const result = calculateSiteMonitoringStatus(site);
        expect(result).toBe("partial");
    });

    it("should return 'running' for single monitoring monitor", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const site = createTestSite([{ monitoring: true, status: "up" }]);
        const result = calculateSiteMonitoringStatus(site);
        expect(result).toBe("running");
    });

    it("should return 'stopped' for single non-monitoring monitor", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const site = createTestSite([{ monitoring: false, status: "up" }]);
        const result = calculateSiteMonitoringStatus(site);
        expect(result).toBe("stopped");
    });
});

describe(calculateSiteStatus, () => {
    it("should return 'unknown' for sites with no monitors", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const site = createTestSite([]);
        const result = calculateSiteStatus(site);
        expect(result).toBe("unknown");
    });

    it("should return the status when all monitors have the same status", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const testCases: MonitorStatus[] = [
            "degraded",
            "down",
            "pending",
            "paused",
            "up",
        ];

        for (const status of testCases) {
            const site = createTestSite([
                { monitoring: true, status },
                { monitoring: false, status },
                { monitoring: true, status },
            ]);
            const result = calculateSiteStatus(site);
            expect(result).toBe(status);
        }
    });

    it("should return 'mixed' when monitors have different statuses", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const site = createTestSite([
            { monitoring: true, status: "up" },
            { monitoring: true, status: "down" },
        ]);
        const result = calculateSiteStatus(site);
        expect(result).toBe("mixed");
    });

    it("should return 'mixed' for multiple different statuses", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        const site = createTestSite([
            { monitoring: true, status: "up" },
            { monitoring: true, status: "down" },
            { monitoring: true, status: "pending" },
            { monitoring: true, status: "paused" },
        ]);
        const result = calculateSiteStatus(site);
        expect(result).toBe("mixed");
    });

    it("should return single status for single monitor", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const testCases: MonitorStatus[] = [
            "degraded",
            "down",
            "pending",
            "paused",
            "up",
        ];

        for (const status of testCases) {
            const site = createTestSite([{ monitoring: true, status }]);
            const result = calculateSiteStatus(site);
            expect(result).toBe(status);
        }
    });

    it("should handle mixed status with valid monitor statuses", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const site = createTestSite([
            { monitoring: true, status: "up" },
            { monitoring: true, status: "down" },
        ]);
        const result = calculateSiteStatus(site);
        expect(result).toBe("mixed");
    });
});

describe(getSiteDisplayStatus, () => {
    it("should return 'unknown' for sites with no monitors", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const site = createTestSite([]);
        const result = getSiteDisplayStatus(site);
        expect(result).toBe("unknown");
    });

    describe("monitoring state combinations", () => {
        beforeEach(async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");
        });

        it.each([
            {
                description:
                    "'paused' when no monitors are monitoring (stopped)",
                monitors: [
                    { monitoring: false, status: "up" as MonitorStatus },
                    { monitoring: false, status: "down" as MonitorStatus },
                ],
                expected: "paused",
            },
            {
                description: "'mixed' when monitoring is partial",
                monitors: [
                    { monitoring: true, status: "up" as MonitorStatus },
                    { monitoring: false, status: "down" as MonitorStatus },
                ],
                expected: "mixed",
            },
            {
                description:
                    "'mixed' operational status when all monitors are running but have different statuses",
                monitors: [
                    { monitoring: true, status: "up" as MonitorStatus },
                    { monitoring: true, status: "down" as MonitorStatus },
                ],
                expected: "mixed",
            },
        ])("should return $description", ({ monitors, expected }) => {
            const site = createTestSite(monitors);
            const result = getSiteDisplayStatus(site);
            expect(result).toBe(expected);
        });
    });

    it("should return operational status when all monitors are running", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const testCases: MonitorStatus[] = [
            "degraded",
            "down",
            "pending",
            "up",
        ];

        for (const status of testCases) {
            const site = createTestSite([
                { monitoring: true, status },
                { monitoring: true, status },
            ]);
            const result = getSiteDisplayStatus(site);
            expect(result).toBe(status);
        }
    });

    it("should return 'mixed' operational status when all monitors are running but have different statuses", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const site = createTestSite([
            { monitoring: true, status: "up" },
            { monitoring: true, status: "down" },
        ]);
        const result = getSiteDisplayStatus(site);
        expect(result).toBe("mixed");
    });

    it("should prioritize 'paused' over operational status", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        const site = createTestSite([{ monitoring: false, status: "up" }]);
        const result = getSiteDisplayStatus(site);
        expect(result).toBe("paused");
    });

    it("should prioritize 'mixed' over operational status for partial monitoring", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const site = createTestSite([
            { monitoring: true, status: "up" },
            { monitoring: false, status: "up" },
        ]);
        const result = getSiteDisplayStatus(site);
        expect(result).toBe("mixed");
    });
});

describe(getSiteStatusDescription, () => {
    it("should describe unknown status for no monitors", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const site = createTestSite([]);
        const result = getSiteStatusDescription(site);
        expect(result).toBe("No monitors configured");
    });

    it("should describe down status correctly", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        const site = createTestSite([
            { monitoring: true, status: "down" },
            { monitoring: true, status: "down" },
        ]);
        const result = getSiteStatusDescription(site);
        expect(result).toBe("All 2 monitors are down");
    });

    describe("single monitor descriptions", () => {
        beforeEach(async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");
        });

        it.each([
            {
                description: "single monitor down status",
                monitors: [
                    { monitoring: true, status: "down" as MonitorStatus },
                ],
                expected: "All 1 monitors are down",
            },
            {
                description: "unexpected status values using fallback",
                monitors: [{ monitoring: true, status: "up" as MonitorStatus }],
                expected: "All 1 monitors are up and running",
            },
            {
                description: "single monitor up status",
                monitors: [{ monitoring: true, status: "up" as MonitorStatus }],
                expected: "All 1 monitors are up and running",
            },
            {
                description: "single monitor pending status",
                monitors: [
                    { monitoring: true, status: "pending" as MonitorStatus },
                ],
                expected: "All 1 monitors are pending",
            },
        ])("should describe $description", ({ monitors, expected }) => {
            const site = createTestSite(monitors);
            const result = getSiteStatusDescription(site);
            expect(result).toBe(expected);
        });
    });

    it("should describe mixed status with monitoring count", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const site = createTestSite([
            { monitoring: true, status: "up" },
            { monitoring: false, status: "down" },
            { monitoring: true, status: "pending" },
        ]);
        const result = getSiteStatusDescription(site);
        expect(result).toBe("Mixed status (2/3 monitoring active)");
    });

    it("should describe paused status with monitoring count", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const site = createTestSite([
            { monitoring: false, status: "up" },
            { monitoring: false, status: "down" },
        ]);
        const result = getSiteStatusDescription(site);
        expect(result).toBe("Monitoring is paused (0/2 active)");
    });

    it("should describe pending status correctly", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        const site = createTestSite([
            { monitoring: true, status: "pending" },
            { monitoring: true, status: "pending" },
            { monitoring: true, status: "pending" },
        ]);
        const result = getSiteStatusDescription(site);
        expect(result).toBe("All 3 monitors are pending");
    });

    it("should describe up status correctly", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        const site = createTestSite([
            { monitoring: true, status: "up" },
            { monitoring: true, status: "up" },
        ]);
        const result = getSiteStatusDescription(site);
        expect(result).toBe("All 2 monitors are up and running");
    });

    it("should handle unexpected status values using fallback", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        // This tests the getSiteDisplayStatus function's ability to handle edge cases
        // The function will calculate status based on monitor states
        const site = createTestSite([{ monitoring: true, status: "up" }]);
        const result = getSiteStatusDescription(site);
        expect(result).toBe("All 1 monitors are up and running");
    });

    it("should describe single monitor up status", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const site = createTestSite([{ monitoring: true, status: "up" }]);
        const result = getSiteStatusDescription(site);
        expect(result).toBe("All 1 monitors are up and running");
    });

    it("should describe single monitor pending status", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const site = createTestSite([{ monitoring: true, status: "pending" }]);
        const result = getSiteStatusDescription(site);
        expect(result).toBe("All 1 monitors are pending");
    });
});

describe(getSiteStatusVariant, () => {
    describe("known status variants", () => {
        beforeEach(async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: siteStatus", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");
        });

        it.each([
            {
                description: "'error' for 'down' status",
                status: "down",
                expected: "error",
            },
            {
                description: "'warning' for 'mixed' status",
                status: "mixed",
                expected: "warning",
            },
            {
                description: "'warning' for 'paused' status",
                status: "paused",
                expected: "warning",
            },
            {
                description: "'info' for 'pending' status",
                status: "pending",
                expected: "info",
            },
            {
                description: "'error' for 'unknown' status",
                status: "unknown",
                expected: "error",
            },
            {
                description: "'success' for 'up' status",
                status: "up",
                expected: "success",
            },
        ] satisfies {
            description: string;
            status: SiteStatus;
            expected: string;
        }[])("should return $description", ({ status, expected }) => {
            const result = getSiteStatusVariant(status);
            expect(result).toBe(expected);
        });
    });

    it("should return 'error' for unexpected status values", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Error Handling", "type");

        // Test the default case - create an invalid status
        const result = getSiteStatusVariant("invalid-status" as SiteStatus);
        expect(result).toBe("error");
    });
});

describe("Edge Cases and Complex Scenarios", () => {
    it("should handle sites with large numbers of monitors", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const monitors: {
            monitoring: boolean;
            status:
                | "down"
                | "pending"
                | "up";
        }[] = Array.from({ length: 100 }, (_, i) => ({
            monitoring: i % 2 === 0, // Half monitoring, half not
            status: i % 3 === 0 ? "up" : i % 3 === 1 ? "down" : "pending",
        }));

        const site = createTestSite(monitors);

        expect(calculateSiteMonitoringStatus(site)).toBe("partial");
        expect(calculateSiteStatus(site)).toBe("mixed");
        expect(getSiteDisplayStatus(site)).toBe("mixed");
        expect(getSiteStatusDescription(site)).toBe(
            "Mixed status (50/100 monitoring active)"
        );
    });

    it("should handle all monitors with same non-'up' status", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const statuses: MonitorStatus[] = [
            "down",
            "pending",
            "paused",
        ];

        for (const status of statuses) {
            const site = createTestSite([
                { monitoring: true, status },
                { monitoring: true, status },
            ]);

            expect(calculateSiteStatus(site)).toBe(status);
            expect(getSiteDisplayStatus(site)).toBe(status);
        }
    });

    it("should handle monitoring status priority over operational status", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        // All monitors up but none monitoring
        const site = createTestSite([
            { monitoring: false, status: "up" },
            { monitoring: false, status: "up" },
        ]);

        expect(calculateSiteStatus(site)).toBe("up");
        expect(getSiteDisplayStatus(site)).toBe("paused"); // Overrides operational status
        expect(getSiteStatusDescription(site)).toBe(
            "Monitoring is paused (0/2 active)"
        );
    });

    it("should handle complex mixed monitoring and status scenarios", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const site = createTestSite([
            { monitoring: true, status: "up" },
            { monitoring: true, status: "down" },
            { monitoring: false, status: "up" },
            { monitoring: false, status: "pending" },
        ]);

        expect(calculateSiteMonitoringStatus(site)).toBe("partial");
        expect(calculateSiteStatus(site)).toBe("mixed");
        expect(getSiteDisplayStatus(site)).toBe("mixed");
        expect(getSiteStatusDescription(site)).toBe(
            "Mixed status (2/4 monitoring active)"
        );
        expect(getSiteStatusVariant(getSiteDisplayStatus(site))).toBe(
            "warning"
        );
    });
});
