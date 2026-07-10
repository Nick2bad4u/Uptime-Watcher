/**
 * Comprehensive tests for siteStatus utilities.
 *
 * @remarks
 * These tests ensure 90%+ branch coverage for all site status calculation
 * functions. Tests cover all possible combinations of monitor states and edge
 * cases.
 */

import type { MonitorStatus, SiteForStatus, SiteStatus } from "@shared/types";

import {
    calculateSiteMonitoringStatus,
    calculateSiteStatus,
    getSiteDisplayStatus,
    getSiteStatusDescription,
    getSiteStatusVariant,
} from "@shared/utils/siteStatus";
import { describe, expect, it } from "vitest";

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
        annotate,
        task,
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
        annotate,
        task,
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
        annotate,
        task,
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
        annotate,
        task,
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
        annotate,
        task,
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
        annotate,
        task,
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
        annotate,
        task,
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
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const testCases: MonitorStatus[] = [
            "up",
            "down",
            "pending",
            "paused",
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
        annotate,
        task,
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
        annotate,
        task,
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
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const testCases: MonitorStatus[] = [
            "up",
            "down",
            "pending",
            "paused",
        ];

        for (const status of testCases) {
            const site = createTestSite([{ monitoring: true, status }]);
            const result = calculateSiteStatus(site);

            expect(result).toBe(status);
        }
    });

    it("should handle mixed status with valid monitor statuses", async ({
        annotate,
        task,
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
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const site = createTestSite([]);
        const result = getSiteDisplayStatus(site);

        expect(result).toBe("unknown");
    });

    it.each([
        {
            description:
                "should return 'paused' when no monitors are monitoring (stopped)",
            expected: "paused",
            monitors: [
                { monitoring: false, status: "up" },
                { monitoring: false, status: "down" },
            ] satisfies { monitoring: boolean; status: MonitorStatus }[],
        },
        {
            description: "should return 'mixed' when monitoring is partial",
            expected: "mixed",
            monitors: [
                { monitoring: true, status: "up" },
                { monitoring: false, status: "down" },
            ] satisfies { monitoring: boolean; status: MonitorStatus }[],
        },
        {
            description:
                "should return 'mixed' operational status when all monitors are running but have different statuses",
            expected: "mixed",
            monitors: [
                { monitoring: true, status: "up" },
                { monitoring: true, status: "down" },
            ] satisfies { monitoring: boolean; status: MonitorStatus }[],
        },
    ])("$description", async ({ expected, monitors }) => {
        const site = createTestSite(monitors);
        const result = getSiteDisplayStatus(site);

        expect(result).toBe(expected);
    });

    it("should return operational status when all monitors are running", async ({
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const testCases: MonitorStatus[] = [
            "up",
            "down",
            "pending",
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

    it("should prioritize 'paused' over operational status", async ({
        annotate,
        task,
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
        annotate,
        task,
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
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

        const site = createTestSite([]);
        const result = getSiteStatusDescription(site);

        expect(result).toBe("No monitors configured");
    });

    it.each([
        {
            description: "should describe down status correctly",
            expected: "All 2 monitors are down",
            monitors: [
                { monitoring: true, status: "down" },
                { monitoring: true, status: "down" },
            ] satisfies { monitoring: boolean; status: MonitorStatus }[],
        },
        {
            description:
                "should handle unexpected status values using fallback",
            expected: "All 1 monitors are up and running",
            monitors: [{ monitoring: true, status: "up" }] satisfies {
                monitoring: boolean;
                status: MonitorStatus;
            }[],
        },
        {
            description: "should describe single monitor up status",
            expected: "All 1 monitors are up and running",
            monitors: [{ monitoring: true, status: "up" }] satisfies {
                monitoring: boolean;
                status: MonitorStatus;
            }[],
        },
        {
            description: "should describe single monitor pending status",
            expected: "All 1 monitors are pending",
            monitors: [{ monitoring: true, status: "pending" }] satisfies {
                monitoring: boolean;
                status: MonitorStatus;
            }[],
        },
    ])("$description", async ({ expected, monitors }) => {
        const site = createTestSite(monitors);
        const result = getSiteStatusDescription(site);

        expect(result).toBe(expected);
    });

    it("should describe single monitor down status", async ({
        annotate,
        task,
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
        annotate,
        task,
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
        annotate,
        task,
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
        annotate,
        task,
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

    it("should describe up status correctly", async ({ annotate, task }) => {
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
});

describe(getSiteStatusVariant, () => {
    it.each([
        {
            description: "should return 'error' for 'down' status",
            expected: "error",
            status: "down",
        },
        {
            description: "should return 'warning' for 'mixed' status",
            expected: "warning",
            status: "mixed",
        },
        {
            description: "should return 'warning' for 'paused' status",
            expected: "warning",
            status: "paused",
        },
        {
            description: "should return 'info' for 'pending' status",
            expected: "info",
            status: "pending",
        },
        {
            description: "should return 'error' for 'unknown' status",
            expected: "error",
            status: "unknown",
        },
        {
            description: "should return 'success' for 'up' status",
            expected: "success",
            status: "up",
        },
    ] satisfies ReadonlyArray<{
        description: string;
        expected: string;
        status: SiteStatus;
    }>)("$description", async ({ expected, status }) => {
        const result = getSiteStatusVariant(status);

        expect(result).toBe(expected);
    });

    it("should return 'error' for unexpected status values", async ({
        annotate,
        task,
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

describe("edge Cases and Complex Scenarios", () => {
    it("should handle sites with large numbers of monitors", async ({
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Monitoring", "type");

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
        expect(getSiteStatusDescription(site)).toBe(
            "Mixed status (50/100 monitoring active)"
        );
    });

    it("should handle all monitors with same non-'up' status", async ({
        annotate,
        task,
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
        annotate,
        task,
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
        annotate,
        task,
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
