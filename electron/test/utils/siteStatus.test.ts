/**
 * @file Tests for site status calculation utilities
 * @description Comprehensive tests for site status logic including paused and mixed states
 */

import { describe, it, expect } from "vitest";
import {
    calculateSiteStatus,
    calculateSiteMonitoringStatus,
    getSiteDisplayStatus,
    getSiteStatusDescription,
    getSiteStatusVariant,
    type SiteStatus,
} from "../../utils/siteStatus";
import type { Site, Monitor } from "../../types";

// Helper function to create test monitor
const createTestMonitor = (partial: Partial<Monitor>): Monitor => ({
    id: "default-id",
    type: "http",
    status: "pending",
    history: [],
    url: "https://example.com",
    checkInterval: 5000,
    monitoring: false,
    ...partial,
});

// Helper function to create test site
const createTestSite = (partial: Partial<Site>): Site => ({
    identifier: "test-site",
    name: "Test Site",
    monitors: [],
    ...partial,
});

describe("Site Status Utilities", () => {
    describe("calculateSiteStatus", () => {
        it("should return 'unknown' for site with no monitors", () => {
            const site = createTestSite({ monitors: [] });
            expect(calculateSiteStatus(site)).toBe("unknown");
        });

        it("should return 'up' when all monitors are up", () => {
            const site = createTestSite({
                monitors: [
                    createTestMonitor({ status: "up" }),
                    createTestMonitor({ status: "up" }),
                ],
            });
            expect(calculateSiteStatus(site)).toBe("up");
        });

        it("should return 'down' when all monitors are down", () => {
            const site = createTestSite({
                monitors: [
                    createTestMonitor({ status: "down" }),
                    createTestMonitor({ status: "down" }),
                ],
            });
            expect(calculateSiteStatus(site)).toBe("down");
        });

        it("should return 'pending' when all monitors are pending", () => {
            const site = createTestSite({
                monitors: [
                    createTestMonitor({ status: "pending" }),
                    createTestMonitor({ status: "pending" }),
                ],
            });
            expect(calculateSiteStatus(site)).toBe("pending");
        });

        it("should return 'paused' when all monitors are paused", () => {
            const site = createTestSite({
                monitors: [
                    createTestMonitor({ status: "paused" }),
                    createTestMonitor({ status: "paused" }),
                ],
            });
            expect(calculateSiteStatus(site)).toBe("paused");
        });

        it("should return 'mixed' when monitors have different statuses", () => {
            const site = createTestSite({
                monitors: [
                    createTestMonitor({ status: "up" }),
                    createTestMonitor({ status: "down" }),
                ],
            });
            expect(calculateSiteStatus(site)).toBe("mixed");
        });

        it("should return 'mixed' for complex mixed statuses", () => {
            const site = createTestSite({
                monitors: [
                    createTestMonitor({ status: "up" }),
                    createTestMonitor({ status: "down" }),
                    createTestMonitor({ status: "pending" }),
                    createTestMonitor({ status: "paused" }),
                ],
            });
            expect(calculateSiteStatus(site)).toBe("mixed");
        });
    });

    describe("calculateSiteMonitoringStatus", () => {
        it("should return 'stopped' for site with no monitors", () => {
            const site = createTestSite({ monitors: [] });
            expect(calculateSiteMonitoringStatus(site)).toBe("stopped");
        });

        it("should return 'stopped' when no monitors are monitoring", () => {
            const site = createTestSite({
                monitors: [
                    createTestMonitor({ monitoring: false }),
                    createTestMonitor({ monitoring: false }),
                ],
            });
            expect(calculateSiteMonitoringStatus(site)).toBe("stopped");
        });

        it("should return 'running' when all monitors are monitoring", () => {
            const site = createTestSite({
                monitors: [
                    createTestMonitor({ monitoring: true }),
                    createTestMonitor({ monitoring: true }),
                ],
            });
            expect(calculateSiteMonitoringStatus(site)).toBe("running");
        });

        it("should return 'partial' when some monitors are monitoring", () => {
            const site = createTestSite({
                monitors: [
                    createTestMonitor({ monitoring: true }),
                    createTestMonitor({ monitoring: false }),
                ],
            });
            expect(calculateSiteMonitoringStatus(site)).toBe("partial");
        });
    });

    describe("getSiteDisplayStatus", () => {
        it("should return 'paused' when no monitoring is active", () => {
            const site = createTestSite({
                monitors: [
                    createTestMonitor({ status: "up", monitoring: false }),
                    createTestMonitor({ status: "down", monitoring: false }),
                ],
            });
            expect(getSiteDisplayStatus(site)).toBe("paused");
        });

        it("should return 'mixed' when monitoring is partial", () => {
            const site = createTestSite({
                monitors: [
                    createTestMonitor({ status: "up", monitoring: true }),
                    createTestMonitor({ status: "up", monitoring: false }),
                ],
            });
            expect(getSiteDisplayStatus(site)).toBe("mixed");
        });

        it("should return operational status when all monitors are running", () => {
            const site = createTestSite({
                monitors: [
                    createTestMonitor({ status: "up", monitoring: true }),
                    createTestMonitor({ status: "up", monitoring: true }),
                ],
            });
            expect(getSiteDisplayStatus(site)).toBe("up");
        });

        it("should return 'mixed' for different operational statuses when all monitoring", () => {
            const site = createTestSite({
                monitors: [
                    createTestMonitor({ status: "up", monitoring: true }),
                    createTestMonitor({ status: "down", monitoring: true }),
                ],
            });
            expect(getSiteDisplayStatus(site)).toBe("mixed");
        });

        it("should return 'unknown' for empty monitors", () => {
            const site = createTestSite({ monitors: [] });
            expect(getSiteDisplayStatus(site)).toBe("unknown");
        });
    });

    describe("getSiteStatusDescription", () => {
        it("should provide correct description for 'up' status", () => {
            const site = createTestSite({
                monitors: [
                    createTestMonitor({ status: "up", monitoring: true }),
                    createTestMonitor({ status: "up", monitoring: true }),
                ],
            });
            expect(getSiteStatusDescription(site)).toBe("All 2 monitors are up and running");
        });

        it("should provide correct description for 'down' status", () => {
            const site = createTestSite({
                monitors: [
                    createTestMonitor({ status: "down", monitoring: true }),
                    createTestMonitor({ status: "down", monitoring: true }),
                ],
            });
            expect(getSiteStatusDescription(site)).toBe("All 2 monitors are down");
        });

        it("should provide correct description for 'pending' status", () => {
            const site = createTestSite({
                monitors: [
                    createTestMonitor({ status: "pending", monitoring: true }),
                    createTestMonitor({ status: "pending", monitoring: true }),
                ],
            });
            expect(getSiteStatusDescription(site)).toBe("All 2 monitors are pending");
        });

        it("should provide correct description for 'paused' status", () => {
            const site = createTestSite({
                monitors: [
                    createTestMonitor({ status: "up", monitoring: false }),
                    createTestMonitor({ status: "down", monitoring: false }),
                ],
            });
            expect(getSiteStatusDescription(site)).toBe("Monitoring is paused (0/2 active)");
        });

        it("should provide correct description for 'mixed' status", () => {
            const site = createTestSite({
                monitors: [
                    createTestMonitor({ status: "up", monitoring: true }),
                    createTestMonitor({ status: "down", monitoring: false }),
                ],
            });
            expect(getSiteStatusDescription(site)).toBe("Mixed status (1/2 monitoring active)");
        });

        it("should provide correct description for 'unknown' status", () => {
            const site = createTestSite({ monitors: [] });
            expect(getSiteStatusDescription(site)).toBe("No monitors configured");
        });
    });

    describe("getSiteStatusVariant", () => {
        it("should return correct variants for all status types", () => {
            expect(getSiteStatusVariant("up")).toBe("success");
            expect(getSiteStatusVariant("down")).toBe("error");
            expect(getSiteStatusVariant("pending")).toBe("info");
            expect(getSiteStatusVariant("paused")).toBe("warning");
            expect(getSiteStatusVariant("mixed")).toBe("warning");
            expect(getSiteStatusVariant("unknown")).toBe("error");
        });

        it("should handle invalid status gracefully", () => {
            expect(getSiteStatusVariant("invalid" as SiteStatus)).toBe("info");
        });
    });

    describe("Edge Cases", () => {
        it("should handle single monitor scenarios correctly", () => {
            const upSite = createTestSite({
                monitors: [createTestMonitor({ status: "up", monitoring: true })],
            });
            expect(getSiteDisplayStatus(upSite)).toBe("up");

            const pausedSite = createTestSite({
                monitors: [createTestMonitor({ status: "up", monitoring: false })],
            });
            expect(getSiteDisplayStatus(pausedSite)).toBe("paused");
        });

        it("should handle large number of monitors efficiently", () => {
            const monitors = Array.from({ length: 100 }, (_, i) =>
                createTestMonitor({
                    id: `monitor-${i}`,
                    status: i % 2 === 0 ? "up" : "down",
                    monitoring: true,
                })
            );
            const site = createTestSite({ monitors });
            expect(getSiteDisplayStatus(site)).toBe("mixed");
        });

        it("should handle complex monitoring scenarios", () => {
            const site = createTestSite({
                monitors: [
                    createTestMonitor({ status: "up", monitoring: true }),
                    createTestMonitor({ status: "up", monitoring: true }),
                    createTestMonitor({ status: "down", monitoring: false }),
                    createTestMonitor({ status: "pending", monitoring: false }),
                ],
            });
            expect(getSiteDisplayStatus(site)).toBe("mixed");
            expect(getSiteStatusDescription(site)).toBe("Mixed status (2/4 monitoring active)");
        });
    });
});
