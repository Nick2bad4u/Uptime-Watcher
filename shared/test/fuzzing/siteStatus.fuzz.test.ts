/**
 * @file Fuzzing tests for siteStatus utilities
 *
 * @author AI Generated
 *
 * @since 2024
 */

import fc from "fast-check";
import { test } from "@fast-check/vitest";
import { describe, expect, it } from "vitest";
import {
    calculateSiteMonitoringStatus,
    calculateSiteStatus,
    getSiteDisplayStatus,
    getSiteStatusDescription,
    getSiteStatusVariant,
} from "../../utils/siteStatus";
import type { SiteForStatus } from "@shared/types";

describe("SiteStatus utilities fuzzing tests", () => {
    const monitorStatusArbitrary = fc.constantFrom(
        "up",
        "down",
        "pending",
        "paused"
    );
    const siteStatusArbitrary = fc.constantFrom(
        "up",
        "down",
        "pending",
        "paused",
        "mixed",
        "unknown"
    );

    const monitorArbitrary = fc.record({
        monitoring: fc.boolean(),
        status: monitorStatusArbitrary,
    });

    const siteArbitrary = fc.record({
        monitors: fc.array(monitorArbitrary, { minLength: 0, maxLength: 10 }),
    });

    describe(calculateSiteMonitoringStatus, () => {
        test.prop([siteArbitrary])(
            "should return one of the three monitoring states",
            (site) => {
                const result = calculateSiteMonitoringStatus(
                    site as SiteForStatus
                );
                expect([
                    "running",
                    "stopped",
                    "partial",
                ]).toContain(result);
            }
        );

        test.prop([
            fc.array(monitorArbitrary, { minLength: 1, maxLength: 10 }),
        ])(
            "should return running when all monitors are monitoring",
            (monitors) => {
                const allMonitoring = monitors.map((m) => ({
                    ...m,
                    monitoring: true,
                }));
                const site = { monitors: allMonitoring };

                const result = calculateSiteMonitoringStatus(
                    site as SiteForStatus
                );
                expect(result).toBe("running");
            }
        );

        test.prop([
            fc.array(monitorArbitrary, { minLength: 1, maxLength: 10 }),
        ])(
            "should return stopped when no monitors are monitoring",
            (monitors) => {
                const noneMonitoring = monitors.map((m) => ({
                    ...m,
                    monitoring: false,
                }));
                const site = { monitors: noneMonitoring };

                const result = calculateSiteMonitoringStatus(
                    site as SiteForStatus
                );
                expect(result).toBe("stopped");
            }
        );

        test.prop([
            fc.array(monitorArbitrary, { minLength: 2, maxLength: 10 }),
        ])(
            "should return partial when some monitors are monitoring",
            (monitors) => {
                fc.pre(monitors.length >= 2);

                // Ensure at least one monitoring and one not monitoring
                const mixedMonitors = monitors.map((m, index) => ({
                    ...m,
                    monitoring:
                        index === 0 ? true : index === 1 ? false : m.monitoring,
                }));

                const site = { monitors: mixedMonitors };
                const result = calculateSiteMonitoringStatus(
                    site as SiteForStatus
                );

                const monitoringCount = mixedMonitors.filter(
                    (m) => m.monitoring
                ).length;
                if (monitoringCount === 0) {
                    expect(result).toBe("stopped");
                } else if (monitoringCount === mixedMonitors.length) {
                    expect(result).toBe("running");
                } else {
                    expect(result).toBe("partial");
                }
            }
        );

        it("should return stopped for empty monitors array", () => {
            const site = { monitors: [] };
            const result = calculateSiteMonitoringStatus(site as SiteForStatus);
            expect(result).toBe("stopped");
        });

        it("should handle null/undefined monitors gracefully", () => {
            const site = { monitors: null } as any;
            const result = calculateSiteMonitoringStatus(site);
            expect(result).toBe("stopped");
        });
    });

    describe(calculateSiteStatus, () => {
        test.prop([siteArbitrary])(
            "should return valid site status",
            (site) => {
                const result = calculateSiteStatus(site as SiteForStatus);
                expect([
                    "up",
                    "down",
                    "pending",
                    "paused",
                    "mixed",
                    "unknown",
                ]).toContain(result);
            }
        );

        test.prop([
            fc.array(monitorArbitrary, { minLength: 1, maxLength: 10 }),
        ])(
            "should return same status when all monitors have same status",
            (monitors) => {
                const [status] = fc.sample(monitorStatusArbitrary, 1);
                const sameStatusMonitors = monitors.map((m) => ({
                    ...m,
                    status,
                }));
                const site = { monitors: sameStatusMonitors };

                const result = calculateSiteStatus(site as SiteForStatus);
                expect(result).toBe(status);
            }
        );

        test.prop([
            fc.array(monitorArbitrary, { minLength: 2, maxLength: 10 }),
        ])(
            "should return mixed when monitors have different statuses",
            (monitors) => {
                fc.pre(monitors.length >= 2);

                // Ensure at least two different statuses
                const mixedMonitors = monitors.map((m, index) => ({
                    ...m,
                    status:
                        index === 0 ? "up" : index === 1 ? "down" : m.status,
                }));

                const site = { monitors: mixedMonitors };
                const result = calculateSiteStatus(site as SiteForStatus);

                const statuses = [
                    ...new Set(mixedMonitors.map((m) => m.status)),
                ];
                if (statuses.length === 1) {
                    expect(result).toBe(statuses[0]);
                } else {
                    expect(result).toBe("mixed");
                }
            }
        );

        it("should return unknown for empty monitors array", () => {
            const site = { monitors: [] };
            const result = calculateSiteStatus(site as SiteForStatus);
            expect(result).toBe("unknown");
        });
    });

    describe(getSiteDisplayStatus, () => {
        test.prop([siteArbitrary])(
            "should return valid display status",
            (site) => {
                const result = getSiteDisplayStatus(site as SiteForStatus);
                expect([
                    "up",
                    "down",
                    "pending",
                    "paused",
                    "mixed",
                    "unknown",
                ]).toContain(result);
            }
        );

        test.prop([
            fc.array(monitorArbitrary, { minLength: 1, maxLength: 10 }),
        ])(
            "should return paused when no monitors are monitoring",
            (monitors) => {
                const noneMonitoring = monitors.map((m) => ({
                    ...m,
                    monitoring: false,
                }));
                const site = { monitors: noneMonitoring };

                const result = getSiteDisplayStatus(site as SiteForStatus);
                expect(result).toBe("paused");
            }
        );

        test.prop([
            fc.array(monitorArbitrary, { minLength: 2, maxLength: 10 }),
        ])("should return mixed when monitoring is partial", (monitors) => {
            fc.pre(monitors.length >= 2);

            // Ensure partial monitoring
            const partialMonitors = monitors.map((m, index) => ({
                ...m,
                monitoring:
                    index === 0 ? true : index === 1 ? false : m.monitoring,
            }));

            const site = { monitors: partialMonitors };
            const monitoringCount = partialMonitors.filter(
                (m) => m.monitoring
            ).length;

            if (monitoringCount === 0) {
                expect(getSiteDisplayStatus(site as SiteForStatus)).toBe(
                    "paused"
                );
            } else if (monitoringCount === partialMonitors.length) {
                // All monitoring - should return operational status
                const result = getSiteDisplayStatus(site as SiteForStatus);
                expect([
                    "up",
                    "down",
                    "pending",
                    "paused",
                    "mixed",
                ]).toContain(result);
            } else {
                expect(getSiteDisplayStatus(site as SiteForStatus)).toBe(
                    "mixed"
                );
            }
        });

        it("should return unknown for empty monitors array", () => {
            const site = { monitors: [] };
            const result = getSiteDisplayStatus(site as SiteForStatus);
            expect(result).toBe("unknown");
        });
    });

    describe(getSiteStatusDescription, () => {
        test.prop([siteArbitrary])(
            "should return non-empty string description",
            (site) => {
                const result = getSiteStatusDescription(site as SiteForStatus);
                expect(typeof result).toBe("string");
                expect(result.length).toBeGreaterThan(0);
            }
        );

        test.prop([
            fc.array(monitorArbitrary, { minLength: 1, maxLength: 10 }),
        ])("should include monitor count in description", (monitors) => {
            const site = { monitors };
            const result = getSiteStatusDescription(site as SiteForStatus);

            expect(result).toContain(monitors.length.toString());
        });

        test.prop([
            fc.array(monitorArbitrary, { minLength: 1, maxLength: 10 }),
        ])("should describe monitoring status correctly", (monitors) => {
            const site = { monitors };
            const runningCount = monitors.filter((m) => m.monitoring).length;
            const result = getSiteStatusDescription(site as SiteForStatus);

            if (runningCount < monitors.length) {
                expect(result).toContain(`${runningCount}/${monitors.length}`);
            }
        });

        it("should return specific message for no monitors", () => {
            const site = { monitors: [] };
            const result = getSiteStatusDescription(site as SiteForStatus);
            expect(result).toBe("No monitors configured");
        });

        test.prop([
            fc.array(monitorArbitrary, { minLength: 1, maxLength: 10 }),
        ])("should handle all possible display statuses", (monitors) => {
            const site = { monitors };
            const result = getSiteStatusDescription(site as SiteForStatus);

            // Should not return the default case
            expect(result).not.toBe("Unknown status");
        });
    });

    describe(getSiteStatusVariant, () => {
        test.prop([siteStatusArbitrary])(
            "should return valid color variant",
            (status) => {
                const result = getSiteStatusVariant(status);
                expect([
                    "success",
                    "error",
                    "warning",
                    "info",
                ]).toContain(result);
            }
        );

        it("should map statuses to correct variants", () => {
            expect(getSiteStatusVariant("up")).toBe("success");
            expect(getSiteStatusVariant("down")).toBe("error");
            expect(getSiteStatusVariant("unknown")).toBe("error");
            expect(getSiteStatusVariant("mixed")).toBe("warning");
            expect(getSiteStatusVariant("paused")).toBe("warning");
            expect(getSiteStatusVariant("pending")).toBe("info");
        });

        test.prop([fc.string()])(
            "should handle invalid status gracefully",
            (invalidStatus) => {
                // Type assertion to test runtime behavior
                const result = getSiteStatusVariant(invalidStatus as any);
                expect([
                    "success",
                    "error",
                    "warning",
                    "info",
                ]).toContain(result);
            }
        );
    });

    describe("Integration and consistency", () => {
        test.prop([siteArbitrary])(
            "all functions should handle any site input without throwing",
            (site) => {
                expect(() =>
                    calculateSiteMonitoringStatus(site as SiteForStatus)
                ).not.toThrow();
                expect(() =>
                    calculateSiteStatus(site as SiteForStatus)
                ).not.toThrow();
                expect(() =>
                    getSiteDisplayStatus(site as SiteForStatus)
                ).not.toThrow();
                expect(() =>
                    getSiteStatusDescription(site as SiteForStatus)
                ).not.toThrow();
            }
        );

        test.prop([siteArbitrary])(
            "display status should be consistent with monitoring and operational status",
            (site) => {
                const monitoringStatus = calculateSiteMonitoringStatus(
                    site as SiteForStatus
                );
                const operationalStatus = calculateSiteStatus(
                    site as SiteForStatus
                );
                const displayStatus = getSiteDisplayStatus(
                    site as SiteForStatus
                );

                if (site.monitors.length === 0) {
                    expect(monitoringStatus).toBe("stopped");
                    expect(operationalStatus).toBe("unknown");
                    expect(displayStatus).toBe("unknown");
                } else
                    switch (monitoringStatus) {
                        case "stopped": {
                            expect(displayStatus).toBe("paused");

                            break;
                        }
                        case "partial": {
                            expect(displayStatus).toBe("mixed");

                            break;
                        }
                        case "running": {
                            expect(displayStatus).toBe(operationalStatus);

                            break;
                        }
                        // No default
                    }
            }
        );

        test.prop([siteArbitrary])(
            "status variant should match display status",
            (site) => {
                const displayStatus = getSiteDisplayStatus(
                    site as SiteForStatus
                );
                const variant = getSiteStatusVariant(displayStatus);

                switch (displayStatus) {
                    case "up": {
                        expect(variant).toBe("success");
                        break;
                    }
                    case "down":
                    case "unknown": {
                        expect(variant).toBe("error");
                        break;
                    }
                    case "mixed":
                    case "paused": {
                        expect(variant).toBe("warning");
                        break;
                    }
                    case "pending": {
                        expect(variant).toBe("info");
                        break;
                    }
                    default: {
                        expect(variant).toBe("error"); // Default case
                    }
                }
            }
        );

        test.prop([
            fc.array(monitorArbitrary, { minLength: 1, maxLength: 100 }),
        ])("should perform well with large monitor arrays", (monitors) => {
            const site = { monitors };
            const startTime = Date.now();

            calculateSiteMonitoringStatus(site as SiteForStatus);
            calculateSiteStatus(site as SiteForStatus);
            getSiteDisplayStatus(site as SiteForStatus);
            getSiteStatusDescription(site as SiteForStatus);

            const duration = Date.now() - startTime;
            expect(duration).toBeLessThan(50); // Should complete within 50ms
        });

        test.prop([siteArbitrary])(
            "monitoring status should be deterministic",
            (site) => {
                const result1 = calculateSiteMonitoringStatus(
                    site as SiteForStatus
                );
                const result2 = calculateSiteMonitoringStatus(
                    site as SiteForStatus
                );
                expect(result1).toBe(result2);
            }
        );

        test.prop([siteArbitrary])(
            "all results should be valid enum values",
            (site) => {
                const monitoringStatus = calculateSiteMonitoringStatus(
                    site as SiteForStatus
                );
                const operationalStatus = calculateSiteStatus(
                    site as SiteForStatus
                );
                const displayStatus = getSiteDisplayStatus(
                    site as SiteForStatus
                );
                const variant = getSiteStatusVariant(displayStatus);
                const description = getSiteStatusDescription(
                    site as SiteForStatus
                );

                expect([
                    "running",
                    "stopped",
                    "partial",
                ]).toContain(monitoringStatus);
                expect([
                    "up",
                    "down",
                    "pending",
                    "paused",
                    "mixed",
                    "unknown",
                ]).toContain(operationalStatus);
                expect([
                    "up",
                    "down",
                    "pending",
                    "paused",
                    "mixed",
                    "unknown",
                ]).toContain(displayStatus);
                expect([
                    "success",
                    "error",
                    "warning",
                    "info",
                ]).toContain(variant);
                expect(typeof description).toBe("string");
                expect(description.length).toBeGreaterThan(0);
            }
        );
    });
});
