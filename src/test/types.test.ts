/**
 * Tests for type definitions and interfaces.
 * Validates type structures and their relationships.
 */

import { describe, expect, it } from "vitest";

import type { UpdateStatus, MonitorType, Monitor, Site, StatusHistory, StatusUpdate } from "../types";

describe("Type Definitions", () => {
    describe("UpdateStatus type", () => {
        it("should allow valid update status values", () => {
            const validStatuses: UpdateStatus[] = [
                "idle",
                "checking",
                "available",
                "downloading",
                "downloaded",
                "error",
            ];

            validStatuses.forEach((status) => {
                const testStatus: UpdateStatus = status;
                expect(testStatus).toBe(status);
            });
        });
    });

    describe("MonitorType type", () => {
        it("should allow valid monitor types", () => {
            const validTypes: MonitorType[] = ["http", "port"];

            validTypes.forEach((type) => {
                const testType: MonitorType = type;
                expect(testType).toBe(type);
            });
        });
    });

    describe("Monitor interface", () => {
        it("should validate a complete HTTP monitor object", () => {
            const httpMonitor: Monitor = {
                id: "test-id",
                type: "http",
                status: "up",
                url: "https://example.com",
                responseTime: 100,
                lastChecked: new Date(),
                history: [],
                monitoring: true,
                checkInterval: 300000,
                timeout: 10000,
                retryAttempts: 3,
            };

            expect(httpMonitor.id).toBe("test-id");
            expect(httpMonitor.type).toBe("http");
            expect(httpMonitor.status).toBe("up");
            expect(httpMonitor.url).toBe("https://example.com");
            expect(Array.isArray(httpMonitor.history)).toBe(true);
        });

        it("should validate a complete port monitor object", () => {
            const portMonitor: Monitor = {
                id: "port-test-id",
                type: "port",
                status: "down",
                host: "example.com",
                port: 80,
                responseTime: 500,
                lastChecked: new Date(),
                history: [],
                monitoring: false,
            };

            expect(portMonitor.id).toBe("port-test-id");
            expect(portMonitor.type).toBe("port");
            expect(portMonitor.host).toBe("example.com");
            expect(portMonitor.port).toBe(80);
        });

        it("should validate minimal monitor object", () => {
            const minimalMonitor: Monitor = {
                id: "minimal-id",
                type: "http",
                status: "pending",
                history: [],
            };

            expect(minimalMonitor.id).toBe("minimal-id");
            expect(minimalMonitor.history).toEqual([]);
        });

        it("should validate monitor status values", () => {
            const statuses = ["up", "down", "pending"] as const;

            statuses.forEach((status) => {
                const monitor: Monitor = {
                    id: "test",
                    type: "http",
                    status: status,
                    history: [],
                };
                expect(monitor.status).toBe(status);
            });
        });
    });

    describe("Site interface", () => {
        it("should validate a complete site object", () => {
            const site: Site = {
                identifier: "site-uuid",
                name: "Test Site",
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        status: "up",
                        url: "https://test.com",
                        history: [],
                    },
                ],
                monitoring: true,
            };

            expect(site.identifier).toBe("site-uuid");
            expect(site.name).toBe("Test Site");
            expect(Array.isArray(site.monitors)).toBe(true);
            expect(site.monitors).toHaveLength(1);
        });

        it("should validate minimal site object", () => {
            const minimalSite: Site = {
                identifier: "minimal-site-uuid",
                monitors: [],
            };

            expect(minimalSite.identifier).toBe("minimal-site-uuid");
            expect(minimalSite.monitors).toEqual([]);
        });

        it("should allow site with multiple monitors", () => {
            const site: Site = {
                identifier: "multi-monitor-site",
                monitors: [
                    { id: "1", type: "http", status: "up", history: [] },
                    { id: "2", type: "port", status: "down", history: [] },
                ],
            };

            expect(site.monitors).toHaveLength(2);
            expect(site.monitors[0].type).toBe("http");
            expect(site.monitors[1].type).toBe("port");
        });
    });

    describe("StatusHistory interface", () => {
        it("should validate status history object", () => {
            const history: StatusHistory = {
                timestamp: Date.now(),
                status: "up",
                responseTime: 250,
            };

            expect(typeof history.timestamp).toBe("number");
            expect(history.status).toBe("up");
            expect(typeof history.responseTime).toBe("number");
        });

        it("should validate status history status values", () => {
            const statuses = ["up", "down"] as const;

            statuses.forEach((status) => {
                const history: StatusHistory = {
                    timestamp: Date.now(),
                    status: status,
                    responseTime: 100,
                };
                expect(history.status).toBe(status);
            });
        });
    });

    describe("StatusUpdate interface", () => {
        it("should validate status update object", () => {
            const site: Site = {
                identifier: "update-site",
                monitors: [],
            };

            const statusUpdate: StatusUpdate = {
                site: site,
                previousStatus: "down",
            };

            expect(statusUpdate.site).toBe(site);
            expect(statusUpdate.previousStatus).toBe("down");
        });

        it("should validate status update without previous status", () => {
            const site: Site = {
                identifier: "new-site",
                monitors: [],
            };

            const statusUpdate: StatusUpdate = {
                site: site,
            };

            expect(statusUpdate.site).toBe(site);
            expect(statusUpdate.previousStatus).toBeUndefined();
        });
    });

    describe("Type Relationships", () => {
        it("should ensure monitor types are consistent with their properties", () => {
            // HTTP monitor should have URL
            const httpMonitor: Monitor = {
                id: "http-test",
                type: "http",
                status: "up",
                url: "https://example.com",
                history: [],
            };

            // Port monitor should have host and port
            const portMonitor: Monitor = {
                id: "port-test",
                type: "port",
                status: "up",
                host: "example.com",
                port: 443,
                history: [],
            };

            expect(httpMonitor.type).toBe("http");
            expect(httpMonitor.url).toBeDefined();
            expect(portMonitor.type).toBe("port");
            expect(portMonitor.host).toBeDefined();
            expect(portMonitor.port).toBeDefined();
        });

        it("should ensure site contains valid monitors", () => {
            const site: Site = {
                identifier: "relationship-test",
                monitors: [
                    {
                        id: "child-monitor",
                        type: "http",
                        status: "up",
                        history: [],
                    },
                ],
            };

            expect(site.monitors).toHaveLength(1);
            expect(site.monitors[0].id).toBe("child-monitor");
        });

        it("should ensure status update contains valid site", () => {
            const site: Site = {
                identifier: "status-update-site",
                monitors: [{ id: "monitor", type: "http", status: "up", history: [] }],
            };

            const update: StatusUpdate = {
                site: site,
                previousStatus: "down",
            };

            expect(update.site.identifier).toBe("status-update-site");
            expect(update.site.monitors).toHaveLength(1);
        });
    });

    describe("Type Safety", () => {
        it("should validate timestamp as number in StatusHistory", () => {
            const history: StatusHistory = {
                timestamp: 1640995200000,
                status: "up",
                responseTime: 100,
            };

            expect(typeof history.timestamp).toBe("number");
            expect(history.timestamp).toBeGreaterThan(0);
        });

        it("should handle optional properties correctly", () => {
            const monitor: Monitor = {
                id: "optional-test",
                type: "http",
                status: "pending",
                history: [],
                // Optional properties not set
            };

            expect(monitor.url).toBeUndefined();
            expect(monitor.responseTime).toBeUndefined();
            expect(monitor.lastChecked).toBeUndefined();
            expect(monitor.monitoring).toBeUndefined();
            expect(monitor.checkInterval).toBeUndefined();
            expect(monitor.timeout).toBeUndefined();
            expect(monitor.retryAttempts).toBeUndefined();
        });
    });
});
