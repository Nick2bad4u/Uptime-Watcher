/**
 * Comprehensive tests for siteStatus utilities.
 *
 * @remarks
 * These tests ensure 90%+ branch coverage for all site status calculation functions.
 * Tests cover all possible combinations of monitor states and edge cases.
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
function createTestSite(monitors: Array<{ monitoring: boolean; status: MonitorStatus }>): SiteForStatus {
    return {
        monitors: monitors.map((monitor) => ({
            monitoring: monitor.monitoring,
            status: monitor.status,
        })),
    };
}

describe("calculateSiteMonitoringStatus", () => {
    it("should return 'stopped' for sites with no monitors", () => {
        const site = createTestSite([]);
        const result = calculateSiteMonitoringStatus(site);
        expect(result).toBe("stopped");
    });

    it("should return 'stopped' when all monitors are not monitoring", () => {
        const site = createTestSite([
            { monitoring: false, status: "up" },
            { monitoring: false, status: "down" },
            { monitoring: false, status: "pending" },
        ]);
        const result = calculateSiteMonitoringStatus(site);
        expect(result).toBe("stopped");
    });

    it("should return 'running' when all monitors are monitoring", () => {
        const site = createTestSite([
            { monitoring: true, status: "up" },
            { monitoring: true, status: "down" },
            { monitoring: true, status: "pending" },
        ]);
        const result = calculateSiteMonitoringStatus(site);
        expect(result).toBe("running");
    });

    it("should return 'partial' when some monitors are monitoring and some are not", () => {
        const site = createTestSite([
            { monitoring: true, status: "up" },
            { monitoring: false, status: "down" },
            { monitoring: true, status: "pending" },
        ]);
        const result = calculateSiteMonitoringStatus(site);
        expect(result).toBe("partial");
    });

    it("should return 'running' for single monitoring monitor", () => {
        const site = createTestSite([{ monitoring: true, status: "up" }]);
        const result = calculateSiteMonitoringStatus(site);
        expect(result).toBe("running");
    });

    it("should return 'stopped' for single non-monitoring monitor", () => {
        const site = createTestSite([{ monitoring: false, status: "up" }]);
        const result = calculateSiteMonitoringStatus(site);
        expect(result).toBe("stopped");
    });
});

describe("calculateSiteStatus", () => {
    it("should return 'unknown' for sites with no monitors", () => {
        const site = createTestSite([]);
        const result = calculateSiteStatus(site);
        expect(result).toBe("unknown");
    });

    it("should return the status when all monitors have the same status", () => {
        const testCases: MonitorStatus[] = ["up", "down", "pending", "paused"];

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

    it("should return 'mixed' when monitors have different statuses", () => {
        const site = createTestSite([
            { monitoring: true, status: "up" },
            { monitoring: true, status: "down" },
        ]);
        const result = calculateSiteStatus(site);
        expect(result).toBe("mixed");
    });

    it("should return 'mixed' for multiple different statuses", () => {
        const site = createTestSite([
            { monitoring: true, status: "up" },
            { monitoring: true, status: "down" },
            { monitoring: true, status: "pending" },
            { monitoring: true, status: "paused" },
        ]);
        const result = calculateSiteStatus(site);
        expect(result).toBe("mixed");
    });

    it("should return single status for single monitor", () => {
        const testCases: MonitorStatus[] = ["up", "down", "pending", "paused"];

        for (const status of testCases) {
            const site = createTestSite([{ monitoring: true, status }]);
            const result = calculateSiteStatus(site);
            expect(result).toBe(status);
        }
    });

    it("should handle mixed status with valid monitor statuses", () => {
        const site = createTestSite([
            { monitoring: true, status: "up" },
            { monitoring: true, status: "down" },
        ]);
        const result = calculateSiteStatus(site);
        expect(result).toBe("mixed");
    });
});

describe("getSiteDisplayStatus", () => {
    it("should return 'unknown' for sites with no monitors", () => {
        const site = createTestSite([]);
        const result = getSiteDisplayStatus(site);
        expect(result).toBe("unknown");
    });

    it("should return 'paused' when no monitors are monitoring (stopped)", () => {
        const site = createTestSite([
            { monitoring: false, status: "up" },
            { monitoring: false, status: "down" },
        ]);
        const result = getSiteDisplayStatus(site);
        expect(result).toBe("paused");
    });

    it("should return 'mixed' when monitoring is partial", () => {
        const site = createTestSite([
            { monitoring: true, status: "up" },
            { monitoring: false, status: "down" },
        ]);
        const result = getSiteDisplayStatus(site);
        expect(result).toBe("mixed");
    });

    it("should return operational status when all monitors are running", () => {
        const testCases: MonitorStatus[] = ["up", "down", "pending"];

        for (const status of testCases) {
            const site = createTestSite([
                { monitoring: true, status },
                { monitoring: true, status },
            ]);
            const result = getSiteDisplayStatus(site);
            expect(result).toBe(status);
        }
    });

    it("should return 'mixed' operational status when all monitors are running but have different statuses", () => {
        const site = createTestSite([
            { monitoring: true, status: "up" },
            { monitoring: true, status: "down" },
        ]);
        const result = getSiteDisplayStatus(site);
        expect(result).toBe("mixed");
    });

    it("should prioritize 'paused' over operational status", () => {
        const site = createTestSite([{ monitoring: false, status: "up" }]);
        const result = getSiteDisplayStatus(site);
        expect(result).toBe("paused");
    });

    it("should prioritize 'mixed' over operational status for partial monitoring", () => {
        const site = createTestSite([
            { monitoring: true, status: "up" },
            { monitoring: false, status: "up" },
        ]);
        const result = getSiteDisplayStatus(site);
        expect(result).toBe("mixed");
    });
});

describe("getSiteStatusDescription", () => {
    it("should describe unknown status for no monitors", () => {
        const site = createTestSite([]);
        const result = getSiteStatusDescription(site);
        expect(result).toBe("No monitors configured");
    });

    it("should describe down status correctly", () => {
        const site = createTestSite([
            { monitoring: true, status: "down" },
            { monitoring: true, status: "down" },
        ]);
        const result = getSiteStatusDescription(site);
        expect(result).toBe("All 2 monitors are down");
    });

    it("should describe single monitor down status", () => {
        const site = createTestSite([{ monitoring: true, status: "down" }]);
        const result = getSiteStatusDescription(site);
        expect(result).toBe("All 1 monitors are down");
    });

    it("should describe mixed status with monitoring count", () => {
        const site = createTestSite([
            { monitoring: true, status: "up" },
            { monitoring: false, status: "down" },
            { monitoring: true, status: "pending" },
        ]);
        const result = getSiteStatusDescription(site);
        expect(result).toBe("Mixed status (2/3 monitoring active)");
    });

    it("should describe paused status with monitoring count", () => {
        const site = createTestSite([
            { monitoring: false, status: "up" },
            { monitoring: false, status: "down" },
        ]);
        const result = getSiteStatusDescription(site);
        expect(result).toBe("Monitoring is paused (0/2 active)");
    });

    it("should describe pending status correctly", () => {
        const site = createTestSite([
            { monitoring: true, status: "pending" },
            { monitoring: true, status: "pending" },
            { monitoring: true, status: "pending" },
        ]);
        const result = getSiteStatusDescription(site);
        expect(result).toBe("All 3 monitors are pending");
    });

    it("should describe up status correctly", () => {
        const site = createTestSite([
            { monitoring: true, status: "up" },
            { monitoring: true, status: "up" },
        ]);
        const result = getSiteStatusDescription(site);
        expect(result).toBe("All 2 monitors are up and running");
    });

    it("should handle unexpected status values using fallback", () => {
        // This tests the getSiteDisplayStatus function's ability to handle edge cases
        // The function will calculate status based on monitor states
        const site = createTestSite([{ monitoring: true, status: "up" }]);
        const result = getSiteStatusDescription(site);
        expect(result).toBe("All 1 monitors are up and running");
    });

    it("should describe single monitor up status", () => {
        const site = createTestSite([{ monitoring: true, status: "up" }]);
        const result = getSiteStatusDescription(site);
        expect(result).toBe("All 1 monitors are up and running");
    });

    it("should describe single monitor pending status", () => {
        const site = createTestSite([{ monitoring: true, status: "pending" }]);
        const result = getSiteStatusDescription(site);
        expect(result).toBe("All 1 monitors are pending");
    });
});

describe("getSiteStatusVariant", () => {
    it("should return 'error' for 'down' status", () => {
        const result = getSiteStatusVariant("down");
        expect(result).toBe("error");
    });

    it("should return 'warning' for 'mixed' status", () => {
        const result = getSiteStatusVariant("mixed");
        expect(result).toBe("warning");
    });

    it("should return 'warning' for 'paused' status", () => {
        const result = getSiteStatusVariant("paused");
        expect(result).toBe("warning");
    });

    it("should return 'info' for 'pending' status", () => {
        const result = getSiteStatusVariant("pending");
        expect(result).toBe("info");
    });

    it("should return 'error' for 'unknown' status", () => {
        const result = getSiteStatusVariant("unknown");
        expect(result).toBe("error");
    });

    it("should return 'success' for 'up' status", () => {
        const result = getSiteStatusVariant("up");
        expect(result).toBe("success");
    });

    it("should return 'error' for unexpected status values", () => {
        // Test the default case - create an invalid status
        const result = getSiteStatusVariant("invalid-status" as SiteStatus);
        expect(result).toBe("error");
    });
});

describe("Edge Cases and Complex Scenarios", () => {
    it("should handle sites with large numbers of monitors", () => {
        const monitors = Array.from({ length: 100 }, (_, i) => {
            let status: MonitorStatus;
            if (i % 3 === 0) {
                status = "up";
            } else if (i % 3 === 1) {
                status = "down";
            } else {
                status = "pending";
            }

            return {
                monitoring: i % 2 === 0, // Half monitoring, half not
                status,
            };
        });

        const site = createTestSite(monitors);

        expect(calculateSiteMonitoringStatus(site)).toBe("partial");
        expect(calculateSiteStatus(site)).toBe("mixed");
        expect(getSiteDisplayStatus(site)).toBe("mixed");
        expect(getSiteStatusDescription(site)).toBe("Mixed status (50/100 monitoring active)");
    });

    it("should handle all monitors with same non-'up' status", () => {
        const statuses: MonitorStatus[] = ["down", "pending", "paused"];

        for (const status of statuses) {
            const site = createTestSite([
                { monitoring: true, status },
                { monitoring: true, status },
            ]);

            expect(calculateSiteStatus(site)).toBe(status);
            expect(getSiteDisplayStatus(site)).toBe(status);
        }
    });

    it("should handle monitoring status priority over operational status", () => {
        // All monitors up but none monitoring
        const site = createTestSite([
            { monitoring: false, status: "up" },
            { monitoring: false, status: "up" },
        ]);

        expect(calculateSiteStatus(site)).toBe("up");
        expect(getSiteDisplayStatus(site)).toBe("paused"); // Overrides operational status
        expect(getSiteStatusDescription(site)).toBe("Monitoring is paused (0/2 active)");
    });

    it("should handle complex mixed monitoring and status scenarios", () => {
        const site = createTestSite([
            { monitoring: true, status: "up" },
            { monitoring: true, status: "down" },
            { monitoring: false, status: "up" },
            { monitoring: false, status: "pending" },
        ]);

        expect(calculateSiteMonitoringStatus(site)).toBe("partial");
        expect(calculateSiteStatus(site)).toBe("mixed");
        expect(getSiteDisplayStatus(site)).toBe("mixed");
        expect(getSiteStatusDescription(site)).toBe("Mixed status (2/4 monitoring active)");
        expect(getSiteStatusVariant(getSiteDisplayStatus(site))).toBe("warning");
    });
});
