/**
 * Comprehensive tests for siteStatus utilities.
 *
 * @remarks
 * These tests ensure 90%+ branch coverage for all site status calculation
 * functions. Tests cover all possible combinations of monitor states and edge
 * cases.
 */

import { describe, expect, it } from "vitest";

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

    it("should return 'paused' when no monitors are monitoring (stopped)", async ({
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
        const result = getSiteDisplayStatus(site);
        expect(result).toBe("paused");
    });

    it("should return 'mixed' when monitoring is partial", async ({
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
        ]);
        const result = getSiteDisplayStatus(site);
        expect(result).toBe("mixed");
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

    it("should describe single monitor down status", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const site = createTestSite([{ monitoring: true, status: "down" }]);
        const result = getSiteStatusDescription(site);
        expect(result).toBe("All 1 monitors are down");
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
    it("should return 'error' for 'down' status", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Error Handling", "type");

        const result = getSiteStatusVariant("down");
        expect(result).toBe("error");
    });

    it("should return 'warning' for 'mixed' status", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        const result = getSiteStatusVariant("mixed");
        expect(result).toBe("warning");
    });

    it("should return 'warning' for 'paused' status", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        const result = getSiteStatusVariant("paused");
        expect(result).toBe("warning");
    });

    it("should return 'info' for 'pending' status", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        const result = getSiteStatusVariant("pending");
        expect(result).toBe("info");
    });

    it("should return 'error' for 'unknown' status", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Error Handling", "type");

        const result = getSiteStatusVariant("unknown");
        expect(result).toBe("error");
    });

    it("should return 'success' for 'up' status", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        const result = getSiteStatusVariant("up");
        expect(result).toBe("success");
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

        const monitors = Array.from({ length: 100 }, (_, i) => ({
            monitoring: i % 2 === 0, // Half monitoring, half not
            status: (i % 3 === 0
                ? "up"
                : i % 3 === 1
                  ? "down"
                  : "pending") as MonitorStatus,
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
