/* eslint-disable @eslint-community/eslint-comments/disable-enable-pair -- single-file tests do not require paired eslint-enable directives. */
/**
 * Property-based tests for global monitoring metrics aggregation.
 *
 * @remarks
 * Uses fast-check to exercise {@link calculateGlobalMonitoringMetrics} across a
 * wide range of site and monitor combinations. The properties focus on
 * invariants such as status counter consistency, uptime percentage bounds, and
 * response-time averaging rules while also driving coverage for rarely-used
 * status and latency combinations.
 */

import { describe, expect } from "vitest";
import { test } from "@fast-check/vitest";
import fc from "fast-check";

import { MONITOR_STATUS_VALUES, type MonitorStatus } from "@shared/types";

import {
    calculateGlobalMonitoringMetrics,
    type GlobalMonitoringMetrics,
} from "../../../utils/monitoring/globalMetrics";
import {
    createMockMonitor,
    createMockSite,
    type CompleteMonitor,
    type CompleteSite,
} from "../../utils/mockFactories";

/**
 * Arbitrary for monitor status values based on the canonical shared constants.
 */
const monitorStatusArbitrary = fc.constantFrom<MonitorStatus>(
    ...MONITOR_STATUS_VALUES
);

/**
 * Arbitrary for monitor overrides used to construct concrete mock monitors.
 */
const monitorOverridesArbitrary = fc.record({
    monitoring: fc.boolean(),
    // Use simple expressions to avoid triggering numeric separator style rules
    responseTime: fc.integer({ min: -5 * 100, max: 5 * 100 }),
    status: monitorStatusArbitrary,
});

/**
 * Arbitrary producing complete monitor instances.
 */
const monitorArbitrary: fc.Arbitrary<CompleteMonitor> =
    monitorOverridesArbitrary.map((overrides) =>
        createMockMonitor({
            // A stable identifier is sufficient for these tests; uniqueness is
            // not required because aggregation logic never relies on IDs.
            id: "monitor-property",
            ...overrides,
        })
    );

/**
 * Arbitrary producing complete site instances with up to five monitors each.
 */
const siteArbitrary: fc.Arbitrary<CompleteSite> = fc
    .array(monitorArbitrary, { maxLength: 5 })
    .map((monitors: CompleteMonitor[]) =>
        createMockSite({
            identifier: "site-property",
            monitors,
        })
    );

describe("calculateGlobalMonitoringMetrics (property-based)", () => {
    test.prop([fc.array(siteArbitrary, { maxLength: 4 })])(
        "derives counters and uptime consistently with underlying monitors",
        (sites) => {
            const metrics: GlobalMonitoringMetrics =
                calculateGlobalMonitoringMetrics(sites);

            const allMonitors = sites.flatMap((site) => site.monitors);
            const totalMonitors = allMonitors.length;

            const expectedActive = allMonitors.filter(
                (monitor) => monitor.monitoring
            ).length;

            const expectedStatusCounts: {
                degraded: number;
                down: number;
                paused: number;
                pending: number;
                total: number;
                up: number;
            } = {
                degraded: 0,
                down: 0,
                paused: 0,
                pending: 0,
                total: totalMonitors,
                up: 0,
            };

            for (const monitor of allMonitors) {
                switch (monitor.status) {
                    case "degraded": {
                        expectedStatusCounts.degraded++;
                        break;
                    }
                    case "down": {
                        expectedStatusCounts.down++;
                        break;
                    }
                    case "paused": {
                        expectedStatusCounts.paused++;
                        break;
                    }
                    case "pending": {
                        expectedStatusCounts.pending++;
                        break;
                    }
                    case "up": {
                        expectedStatusCounts.up++;
                        break;
                    }
                    default: {
                        break;
                    }
                }
            }

            const expectedIncidentCount =
                expectedStatusCounts.down + expectedStatusCounts.degraded;

            const expectedUptimePercentage = totalMonitors
                ? Math.round(
                      ((expectedStatusCounts.up +
                          expectedStatusCounts.degraded * 0.5) /
                          totalMonitors) *
                          100
                  )
                : 0;

            const responseSamples = allMonitors
                .map((monitor) => monitor.responseTime)
                .filter((value) => Number.isFinite(value) && Number(value) > 0);

            let expectedAverageResponseTime: number | undefined;

            if (responseSamples.length > 0) {
                let sum = 0;
                for (const value of responseSamples) {
                    sum += Number(value);
                }

                expectedAverageResponseTime = Math.round(
                    sum / responseSamples.length
                );
            } else {
                expectedAverageResponseTime = undefined;
            }

            // Totals
            expect(metrics.totalSites).toBe(sites.length);
            expect(metrics.totalMonitors).toBe(totalMonitors);

            // Active monitors and incidents
            expect(metrics.activeMonitors).toBe(expectedActive);
            expect(metrics.incidentCount).toBe(expectedIncidentCount);

            // Status counters and totals
            expect(metrics.monitorStatusCounts).toEqual({
                ...expectedStatusCounts,
            });

            // Uptime percentage stays within 0–100 and matches formula
            expect(metrics.uptimePercentage).toBe(expectedUptimePercentage);
            expect(metrics.uptimePercentage).toBeGreaterThanOrEqual(0);
            expect(metrics.uptimePercentage).toBeLessThanOrEqual(100);

            // Average response time behaviour
            if (expectedAverageResponseTime === undefined) {
                expect(metrics.averageResponseTime).toBeUndefined();
            } else {
                expect(metrics.averageResponseTime).toBe(
                    expectedAverageResponseTime
                );
            }
        }
    );

    test("returns zeroed metrics when no sites are provided", () => {
        const metrics = calculateGlobalMonitoringMetrics([]);

        expect(metrics.totalSites).toBe(0);
        expect(metrics.totalMonitors).toBe(0);
        expect(metrics.activeMonitors).toBe(0);
        expect(metrics.incidentCount).toBe(0);
        expect(metrics.monitorStatusCounts).toEqual({
            degraded: 0,
            down: 0,
            paused: 0,
            pending: 0,
            total: 0,
            up: 0,
        });
        expect(metrics.uptimePercentage).toBe(0);
        expect(metrics.averageResponseTime).toBeUndefined();
    });

    test("computes average response time only from finite positive samples", () => {
        const monitors: CompleteMonitor[] = [
            createMockMonitor({ status: "up", responseTime: 200 }),
            createMockMonitor({ status: "up", responseTime: 400 }),
            createMockMonitor({ status: "down", responseTime: 0 }),
            createMockMonitor({ status: "degraded", responseTime: -50 }),
        ];

        const site = createMockSite({ monitors });
        const metrics = calculateGlobalMonitoringMetrics([site]);

        // Only the first two monitors should contribute: (200 + 400) / 2 = 300
        expect(metrics.averageResponseTime).toBe(300);
    });
});
