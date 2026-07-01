/**
 * Tests for site status utility exports
 */

import type { MonitorStatus, SiteForStatus, SiteStatus } from "@shared/types";

import { fc, test } from "@fast-check/vitest";
import {
    calculateSiteMonitoringStatus,
    calculateSiteStatus,
    getSiteDisplayStatus,
    getSiteStatusDescription,
    getSiteStatusVariant,
} from "@shared/utils/siteStatus";
import { arrayFirst, isEmpty, safeCastTo   } from "ts-extras";
import { describe, expect, it } from "vitest";
/**
 * Site Status Utility Tests
 *
 * Tests for site status utility functions
 */

describe("siteStatus exports", () => {
    it("should export calculateSiteMonitoringStatus function", async ({
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Export Operation", "type");

        expect(calculateSiteMonitoringStatus).toBeTypeOf("function");
    });

    it("should export calculateSiteStatus function", async ({
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Export Operation", "type");

        expect(calculateSiteStatus).toBeTypeOf("function");
    });

    it("should export getSiteDisplayStatus function", async ({
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Export Operation", "type");

        expect(getSiteDisplayStatus).toBeTypeOf("function");
    });

    it("should export getSiteStatusDescription function", async ({
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Export Operation", "type");

        expect(getSiteStatusDescription).toBeTypeOf("function");
    });

    it("should export getSiteStatusVariant function", async ({
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Export Operation", "type");

        expect(getSiteStatusVariant).toBeTypeOf("function");
    });

    it("should export SiteStatus type", async ({ annotate, task }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Export Operation", "type");

        // Type test - if this compiles, the type is exported correctly
        const status: SiteStatus = "up";

        expect(status).toBe("up");
    });

    it("should have working calculateSiteStatus function", async ({
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        // Basic functional test with empty monitors array
        const testSite: SiteForStatus = { monitors: [] };
        const result = calculateSiteStatus(testSite);

        expect(result).toBe("unknown");
    });

    it("should have working getSiteDisplayStatus function", async ({
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Data Retrieval", "type");

        // Basic functional test
        const testSite: SiteForStatus = {
            monitors: [{ monitoring: true, status: "up" }],
        };
        const result = getSiteDisplayStatus(testSite);

        expect(result).toBe("up");
    });

    it("should have working getSiteStatusDescription function", async ({
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Data Retrieval", "type");

        // Basic functional test
        const testSite: SiteForStatus = {
            monitors: [{ monitoring: true, status: "up" }],
        };
        const result = getSiteStatusDescription(testSite);

        expect(result).toBeTypeOf("string");
        expect(result.length).toBeGreaterThan(0);
    });

    it("should have working getSiteStatusVariant function", async ({
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: siteStatus", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Data Retrieval", "type");

        // Basic functional test
        const result = getSiteStatusVariant("up");

        expect(result).toBeTypeOf("string");
        expect(result.length).toBeGreaterThan(0);
    });
});

describe("siteStatus Property-based Tests", () => {
    // Arbitraries for test data generation
    const monitorStatusArb = safeCastTo<fc.Arbitrary<MonitorStatus>>(fc.constantFrom(
        "up",
        "down",
        "pending",
        "paused"
    ));
    const siteStatusArb = safeCastTo<fc.Arbitrary<SiteStatus>>(fc.constantFrom(
        "up",
        "down",
        "pending",
        "paused",
        "mixed",
        "unknown"
    ));

    const monitorArb = fc.record({
        monitoring: fc.boolean(),
        status: monitorStatusArb,
    });

    const siteForStatusArb = safeCastTo<fc.Arbitrary<SiteForStatus>>(fc.record({
        monitors: fc.array(monitorArb, { maxLength: 10, minLength: 0 }),
    }));

    describe(calculateSiteMonitoringStatus, () => {
        test.prop([siteForStatusArb])(
            "should return correct monitoring status for any site configuration",
            (site) => {
                const result = calculateSiteMonitoringStatus(site);

                // Property: Result must be one of the expected monitoring states
                expect([
                    "running",
                    "stopped",
                    "partial",
                ]).toContain(result);

                const monitoringCount = site.monitors.filter(
                    (m) => m.monitoring
                ).length;
                const totalCount = site.monitors.length;

                if (totalCount === 0 || monitoringCount === 0) {
                    expect(result).toBe("stopped");
                } else if (monitoringCount === totalCount) {
                    expect(result).toBe("running");
                } else {
                    expect(result).toBe("partial");
                }
            }
        );

        test.prop([fc.array(monitorArb, { maxLength: 5, minLength: 1 })])(
            "should return running when all monitors are monitoring",
            (monitors) => {
                const site: SiteForStatus = {
                    monitors: monitors.map((m) => ({ ...m, monitoring: true })),
                };

                const result = calculateSiteMonitoringStatus(site);

                expect(result).toBe("running");
            }
        );

        test.prop([fc.array(monitorArb, { maxLength: 5, minLength: 1 })])(
            "should return stopped when no monitors are monitoring",
            (monitors) => {
                const site: SiteForStatus = {
                    monitors: monitors.map((m) => ({
                        ...m,
                        monitoring: false,
                    })),
                };

                const result = calculateSiteMonitoringStatus(site);

                expect(result).toBe("stopped");
            }
        );
    });

    describe(calculateSiteStatus, () => {
        test.prop([siteForStatusArb])(
            "should return correct operational status for any site configuration",
            (site) => {
                const result = calculateSiteStatus(site);

                // Property: Result must be a valid SiteStatus
                expect([
                    "up",
                    "down",
                    "pending",
                    "paused",
                    "mixed",
                    "unknown",
                ]).toContain(result);

                if (isEmpty(site.monitors)) {
                    expect(result).toBe("unknown");
                }
            }
        );

        test.prop([monitorStatusArb, fc.integer({ max: 5, min: 1 })])(
            "should return single status when all monitors have same status",
            (status, count) => {
                const site: SiteForStatus = {
                    monitors: Array.from({ length: count }, () => ({
                        monitoring: true,
                        status,
                    })),
                };

                const result = calculateSiteStatus(site);

                expect(result).toBe(status);
            }
        );

        test.prop([fc.array(monitorArb, { maxLength: 5, minLength: 2 })])(
            "should return mixed when monitors have different statuses",
            (monitors) => {
                // Ensure we have at least 2 different statuses
                const differentStatuses: MonitorStatus[] = [
                    "up",
                    "down",
                    "degraded",
                ];
                const status1 = arrayFirst(differentStatuses);
                const status2 = differentStatuses[1];
                if (!status1 || !status2) {
                    throw new Error("Expected status values to be defined");
                }

                const mixedMonitors: {
                    monitoring: boolean;
                    status: MonitorStatus;
                }[] = [
                    { monitoring: true, status: status1 },
                    { monitoring: true, status: status2 },
                    ...monitors.slice(2),
                ];

                const site: SiteForStatus = { monitors: mixedMonitors };
                const result = calculateSiteStatus(site);

                // Check if we actually have mixed statuses
                const uniqueStatuses = [
                    ...new Set(mixedMonitors.map((m) => m.status)),
                ];
                if (uniqueStatuses.length > 1) {
                    expect(result).toBe("mixed");
                }
            }
        );
    });

    describe(getSiteDisplayStatus, () => {
        test.prop([siteForStatusArb])(
            "should return appropriate display status based on monitoring and operational status",
            (site) => {
                const result = getSiteDisplayStatus(site);

                // Property: Result must be a valid SiteStatus
                expect([
                    "up",
                    "down",
                    "pending",
                    "paused",
                    "mixed",
                    "unknown",
                ]).toContain(result);

                if (isEmpty(site.monitors)) {
                    expect(result).toBe("unknown");

                    return; // Early return for empty monitors case
                }

                const monitoringCount = site.monitors.filter(
                    (m) => m.monitoring
                ).length;

                // For sites with monitors, check monitoring status first
                if (monitoringCount === 0) {
                    // No monitors are actively monitoring
                    expect(result).toBe("paused");

                    return;
                }

                if (
                    monitoringCount > 0 &&
                    monitoringCount < site.monitors.length
                ) {
                    // Partial monitoring - mixed status
                    expect(result).toBe("mixed");
                }

                // All monitors are monitoring - result should match operational status
                // (tested separately in calculateSiteStatus tests)
            }
        );

        test.prop([fc.array(monitorArb, { maxLength: 5, minLength: 1 })])(
            "should return paused when no monitors are monitoring",
            (monitors) => {
                const site: SiteForStatus = {
                    monitors: monitors.map((m) => ({
                        ...m,
                        monitoring: false,
                    })),
                };

                const result = getSiteDisplayStatus(site);

                expect(result).toBe("paused");
            }
        );
    });

    describe(getSiteStatusDescription, () => {
        test.prop([siteForStatusArb])(
            "should return descriptive string for any site configuration",
            (site) => {
                const result = getSiteStatusDescription(site);

                // Property: Should always return a non-empty string
                expect(result).toBeTypeOf("string");
                expect(result.length).toBeGreaterThan(0);

                // Property: Should contain monitor count information for sites with monitors
                if (site.monitors.length > 0) {
                    expect(result).toMatch(
                        new RegExp(site.monitors.length.toString())
                    );
                }

                // Property: Should mention "No monitors" for empty sites
                if (isEmpty(site.monitors)) {
                    expect(result.toLowerCase()).toContain("no monitors");
                }
            }
        );

        test.prop([monitorStatusArb, fc.integer({ max: 10, min: 1 })])(
            "should include monitor count in description",
            (status, count) => {
                const site: SiteForStatus = {
                    monitors: Array.from({ length: count }, () => ({
                        monitoring: true,
                        status,
                    })),
                };

                const result = getSiteStatusDescription(site);

                expect(result).toContain(count.toString());
            }
        );
    });

    describe(getSiteStatusVariant, () => {
        test.prop([siteStatusArb])(
            "should return valid variant for any site status",
            (status) => {
                const result = getSiteStatusVariant(status);

                // Property: Result must be one of the expected variant types
                expect([
                    "success",
                    "error",
                    "warning",
                    "info",
                ]).toContain(result);
            }
        );

        test.prop([fc.constantFrom("up")])(
            "should return success variant for up status",
            (status) => {
                const result = getSiteStatusVariant(status);

                expect(result).toBe("success");
            }
        );

        test.prop([fc.constantFrom("down", "unknown")])(
            "should return error variant for error states",
            (status) => {
                const result = getSiteStatusVariant(status);

                expect(result).toBe("error");
            }
        );

        test.prop([fc.constantFrom("mixed", "paused")])(
            "should return warning variant for warning states",
            (status) => {
                const result = getSiteStatusVariant(status);

                expect(result).toBe("warning");
            }
        );

        test.prop([fc.constantFrom("pending")])(
            "should return info variant for pending status",
            (status) => {
                const result = getSiteStatusVariant(status);

                expect(result).toBe("info");
            }
        );
    });

    describe("integration Properties", () => {
        test.prop([siteForStatusArb])(
            "getSiteDisplayStatus and getSiteStatusDescription should be consistent",
            (site) => {
                const displayStatus = getSiteDisplayStatus(site);
                const description = getSiteStatusDescription(site);

                // Property: Description should be consistent with display status
                const lowerDescription = description.toLowerCase();

                switch (displayStatus) {
                    case "down": {
                        expect(lowerDescription).toContain("down");

                        break;
                    }
                    case "mixed": {
                        expect(lowerDescription).toContain("mixed");

                        break;
                    }
                    case "paused": {
                        expect(lowerDescription).toContain("paused");

                        break;
                    }
                    case "pending": {
                        expect(lowerDescription).toContain("pending");

                        break;
                    }
                    case "unknown": {
                        expect(lowerDescription).toMatch(/no monitors|unknown/v);

                        break;
                    }
                    case "up": {
                        expect(lowerDescription).toMatch(/running|up/v);

                        break;
                    }
                }
            }
        );

        test.prop([siteForStatusArb])(
            "status calculation functions should handle edge cases gracefully",
            (site) => {
                // Property: All status functions should handle any valid input without throwing
                expect(() => calculateSiteMonitoringStatus(site)).not.toThrow();
                expect(() => calculateSiteStatus(site)).not.toThrow();
                expect(() => getSiteDisplayStatus(site)).not.toThrow();
                expect(() => getSiteStatusDescription(site)).not.toThrow();

                const displayStatus = getSiteDisplayStatus(site);

                expect(() => getSiteStatusVariant(displayStatus)).not.toThrow();
            }
        );
    });
});
