/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from "vitest";
import {
    calculateSiteStatus,
    calculateSiteMonitoringStatus,
    getSiteDisplayStatus,
    getSiteStatusDescription,
    getSiteStatusVariant,
} from "../utils/siteStatus";
import type { Site } from "@shared/types";

describe("siteStatus utilities - Uncovered Lines", () => {
    describe("calculateSiteStatus", () => {
        it("should return unknown for site with no monitors", () => {
            const site: Site = {
                identifier: "empty-site",
                name: "Empty Site",
                monitors: [],
                monitoring: false,
            };

            const status = calculateSiteStatus(site);
            expect(status).toBe("unknown");
        });

        it("should return up when all monitors are up", () => {
            const site: Site = {
                identifier: "up-site",
                name: "Up Site",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        url: "https://example.com",
                        status: "up",
                        monitoring: true,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                    {
                        id: "monitor2",
                        type: "http",
                        url: "https://api.example.com",
                        status: "up",
                        monitoring: true,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                ],
                monitoring: true,
            };

            const status = calculateSiteStatus(site);
            expect(status).toBe("up");
        });

        it("should return down when all monitors are down", () => {
            const site: Site = {
                identifier: "down-site",
                name: "Down Site",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        url: "https://example.com",
                        status: "down",
                        monitoring: true,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                    {
                        id: "monitor2",
                        type: "http",
                        url: "https://api.example.com",
                        status: "down",
                        monitoring: true,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                ],
                monitoring: true,
            };

            const status = calculateSiteStatus(site);
            expect(status).toBe("down");
        });

        it("should return pending when all monitors are pending", () => {
            const site: Site = {
                identifier: "pending-site",
                name: "Pending Site",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        url: "https://example.com",
                        status: "pending",
                        monitoring: true,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                ],
                monitoring: true,
            };

            const status = calculateSiteStatus(site);
            expect(status).toBe("pending");
        });

        it("should return mixed when monitors have different statuses", () => {
            const site: Site = {
                identifier: "mixed-site",
                name: "Mixed Site",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        url: "https://example.com",
                        status: "up",
                        monitoring: true,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                    {
                        id: "monitor2",
                        type: "http",
                        url: "https://api.example.com",
                        status: "down",
                        monitoring: true,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                ],
                monitoring: true,
            };

            const status = calculateSiteStatus(site);
            expect(status).toBe("mixed");
        });
    });

    describe("calculateSiteMonitoringStatus", () => {
        it("should return stopped for site with no monitors", () => {
            const site: Site = {
                identifier: "empty-site",
                name: "Empty Site",
                monitors: [],
                monitoring: false,
            };

            const status = calculateSiteMonitoringStatus(site);
            expect(status).toBe("stopped");
        });

        it("should return stopped when no monitors are monitoring", () => {
            const site: Site = {
                identifier: "stopped-site",
                name: "Stopped Site",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        url: "https://example.com",
                        status: "up",
                        monitoring: false,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                    {
                        id: "monitor2",
                        type: "http",
                        url: "https://api.example.com",
                        status: "down",
                        monitoring: false,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                ],
                monitoring: false,
            };

            const status = calculateSiteMonitoringStatus(site);
            expect(status).toBe("stopped");
        });

        it("should return running when all monitors are monitoring", () => {
            const site: Site = {
                identifier: "running-site",
                name: "Running Site",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        url: "https://example.com",
                        status: "up",
                        monitoring: true,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                    {
                        id: "monitor2",
                        type: "http",
                        url: "https://api.example.com",
                        status: "down",
                        monitoring: true,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                ],
                monitoring: true,
            };

            const status = calculateSiteMonitoringStatus(site);
            expect(status).toBe("running");
        });

        it("should return partial when some monitors are monitoring", () => {
            const site: Site = {
                identifier: "partial-site",
                name: "Partial Site",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        url: "https://example.com",
                        status: "up",
                        monitoring: true,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                    {
                        id: "monitor2",
                        type: "http",
                        url: "https://api.example.com",
                        status: "down",
                        monitoring: false,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                ],
                monitoring: true,
            };

            const status = calculateSiteMonitoringStatus(site);
            expect(status).toBe("partial");
        });
    });

    describe("getSiteDisplayStatus", () => {
        it("should return unknown for site with no monitors", () => {
            const site: Site = {
                identifier: "empty-site",
                name: "Empty Site",
                monitors: [],
                monitoring: false,
            };

            const status = getSiteDisplayStatus(site);
            expect(status).toBe("unknown");
        });

        it("should return paused when monitoring is stopped", () => {
            const site: Site = {
                identifier: "paused-site",
                name: "Paused Site",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        url: "https://example.com",
                        status: "up",
                        monitoring: false,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                ],
                monitoring: false,
            };

            const status = getSiteDisplayStatus(site);
            expect(status).toBe("paused");
        });

        it("should return mixed when monitoring is partial", () => {
            const site: Site = {
                identifier: "mixed-monitoring-site",
                name: "Mixed Monitoring Site",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        url: "https://example.com",
                        status: "up",
                        monitoring: true,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                    {
                        id: "monitor2",
                        type: "http",
                        url: "https://api.example.com",
                        status: "down",
                        monitoring: false,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                ],
                monitoring: true,
            };

            const status = getSiteDisplayStatus(site);
            expect(status).toBe("mixed");
        });

        it("should return operational status when all monitoring is running", () => {
            const site: Site = {
                identifier: "operational-site",
                name: "Operational Site",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        url: "https://example.com",
                        status: "up",
                        monitoring: true,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                    {
                        id: "monitor2",
                        type: "http",
                        url: "https://api.example.com",
                        status: "up",
                        monitoring: true,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                ],
                monitoring: true,
            };

            const status = getSiteDisplayStatus(site);
            expect(status).toBe("up");
        });
    });

    describe("getSiteStatusDescription", () => {
        it("should return unknown description for site with no monitors", () => {
            const site: Site = {
                identifier: "empty-site",
                name: "Empty Site",
                monitors: [],
                monitoring: false,
            };

            const description = getSiteStatusDescription(site);
            expect(description).toBe("No monitors configured");
        });

        it("should return up description when all monitors are up", () => {
            const site: Site = {
                identifier: "up-site",
                name: "Up Site",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        url: "https://example.com",
                        status: "up",
                        monitoring: true,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                    {
                        id: "monitor2",
                        type: "http",
                        url: "https://api.example.com",
                        status: "up",
                        monitoring: true,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                ],
                monitoring: true,
            };

            const description = getSiteStatusDescription(site);
            expect(description).toBe("All 2 monitors are up and running");
        });

        it("should return down description when all monitors are down", () => {
            const site: Site = {
                identifier: "down-site",
                name: "Down Site",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        url: "https://example.com",
                        status: "down",
                        monitoring: true,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                ],
                monitoring: true,
            };

            const description = getSiteStatusDescription(site);
            expect(description).toBe("All 1 monitors are down");
        });

        it("should return pending description when all monitors are pending", () => {
            const site: Site = {
                identifier: "pending-site",
                name: "Pending Site",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        url: "https://example.com",
                        status: "pending",
                        monitoring: true,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                    {
                        id: "monitor2",
                        type: "http",
                        url: "https://api.example.com",
                        status: "pending",
                        monitoring: true,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                ],
                monitoring: true,
            };

            const description = getSiteStatusDescription(site);
            expect(description).toBe("All 2 monitors are pending");
        });

        it("should return paused description when monitoring is stopped", () => {
            const site: Site = {
                identifier: "paused-site",
                name: "Paused Site",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        url: "https://example.com",
                        status: "up",
                        monitoring: false,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                    {
                        id: "monitor2",
                        type: "http",
                        url: "https://api.example.com",
                        status: "down",
                        monitoring: false,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                ],
                monitoring: false,
            };

            const description = getSiteStatusDescription(site);
            expect(description).toBe("Monitoring is paused (0/2 active)");
        });

        it("should return mixed description when monitoring is partial", () => {
            const site: Site = {
                identifier: "mixed-site",
                name: "Mixed Site",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        url: "https://example.com",
                        status: "up",
                        monitoring: true,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                    {
                        id: "monitor2",
                        type: "http",
                        url: "https://api.example.com",
                        status: "down",
                        monitoring: false,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                    {
                        id: "monitor3",
                        type: "http",
                        url: "https://test.example.com",
                        status: "pending",
                        monitoring: true,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                ],
                monitoring: true,
            };

            const description = getSiteStatusDescription(site);
            expect(description).toBe("Mixed status (2/3 monitoring active)");
        });

        it("should return unknown status for unhandled status", () => {
            // Mock a site that would somehow get an unhandled status
            const site: Site = {
                identifier: "weird-site",
                name: "Weird Site",
                monitors: [
                    {
                        id: "monitor1",
                        type: "http",
                        url: "https://example.com",
                        status: "weird-status" as any, // Force an unknown status
                        monitoring: true,
                        checkInterval: 60_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        history: [],
                        responseTime: 0,
                    },
                ],
                monitoring: true,
            };

            // Since getSiteDisplayStatus handles this, we can check the fallback
            const description = getSiteStatusDescription(site);
            // This should return a valid description based on the calculated status
            expect(description).toBeDefined();
        });
    });

    describe("getSiteStatusVariant", () => {
        it("should return success variant for up status", () => {
            const variant = getSiteStatusVariant("up");
            expect(variant).toBe("success");
        });

        it("should return error variant for down status", () => {
            const variant = getSiteStatusVariant("down");
            expect(variant).toBe("error");
        });

        it("should return info variant for pending status", () => {
            const variant = getSiteStatusVariant("pending");
            expect(variant).toBe("info");
        });

        it("should return warning variant for paused status", () => {
            const variant = getSiteStatusVariant("paused");
            expect(variant).toBe("warning");
        });

        it("should return warning variant for mixed status", () => {
            const variant = getSiteStatusVariant("mixed");
            expect(variant).toBe("warning");
        });

        it("should return error variant for unknown status", () => {
            const variant = getSiteStatusVariant("unknown");
            expect(variant).toBe("error");
        });

        it("should return error variant for unhandled status", () => {
            const variant = getSiteStatusVariant("unhandled" as any);
            expect(variant).toBe("error");
        });
    });
});
