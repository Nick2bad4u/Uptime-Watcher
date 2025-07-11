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

            for (const status of validStatuses) {
                const testStatus: UpdateStatus = status;
                expect(testStatus).toBe(status);
            }
        });
    });

    describe("MonitorType type", () => {
        it("should allow valid monitor types", () => {
            const validTypes: MonitorType[] = ["http", "port"];

            for (const type of validTypes) {
                const testType: MonitorType = type;
                expect(testType).toBe(type);
            }
        });
    });

    describe("Monitor interface", () => {
        it("should validate a complete HTTP monitor object", () => {
            const httpMonitor: Monitor = {
                checkInterval: 300000,
                history: [],
                id: "test-id",
                lastChecked: new Date(),
                monitoring: true,
                responseTime: 100,
                retryAttempts: 3,
                status: "up",
                timeout: 10000,
                type: "http",
                url: "https://example.com",
            };

            expect(httpMonitor.id).toBe("test-id");
            expect(httpMonitor.type).toBe("http");
            expect(httpMonitor.status).toBe("up");
            expect(httpMonitor.url).toBe("https://example.com");
            expect(Array.isArray(httpMonitor.history)).toBe(true);
        });

        it("should validate a complete port monitor object", () => {
            const portMonitor: Monitor = {
                history: [],
                host: "example.com",
                id: "port-test-id",
                lastChecked: new Date(),
                monitoring: false,
                port: 80,
                responseTime: 500,
                status: "down",
                type: "port",
                checkInterval: 0,
                timeout: 0,
                retryAttempts: 0,
            };

            expect(portMonitor.id).toBe("port-test-id");
            expect(portMonitor.type).toBe("port");
            expect(portMonitor.host).toBe("example.com");
            expect(portMonitor.port).toBe(80);
        });

        it("should validate minimal monitor object", () => {
            const minimalMonitor: Monitor = {
                history: [],
                id: "minimal-id",
                status: "pending",
                type: "http",
                responseTime: 0,
                monitoring: false,
                checkInterval: 0,
                timeout: 0,
                retryAttempts: 0,
            };

            expect(minimalMonitor.id).toBe("minimal-id");
            expect(minimalMonitor.history).toEqual([]);
        });

        it("should validate monitor status values", () => {
            const statuses = ["up", "down", "pending"] as const;

            for (const status of statuses) {
                const monitor: Monitor = {
                    history: [],
                    id: "test",
                    status: status,
                    type: "http",
                    responseTime: 0,
                    monitoring: false,
                    checkInterval: 0,
                    timeout: 0,
                    retryAttempts: 0,
                };
                expect(monitor.status).toBe(status);
            }
        });
    });

    describe("Site interface", () => {
        it("should validate a complete site object", () => {
            const site: Site = {
                identifier: "site-uuid",
                monitoring: true,
                monitors: [
                    {
                        history: [],
                        id: "monitor-1",
                        status: "up",
                        type: "http",
                        url: "https://test.com",
                        responseTime: 0,
                        monitoring: false,
                        checkInterval: 0,
                        timeout: 0,
                        retryAttempts: 0,
                    },
                ],
                name: "Test Site",
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
                name: "",
                monitoring: false,
            };

            expect(minimalSite.identifier).toBe("minimal-site-uuid");
            expect(minimalSite.monitors).toEqual([]);
        });

        it("should allow site with multiple monitors", () => {
            const site: Site = {
                identifier: "multi-monitor-site",
                monitors: [
                    {
                        history: [],
                        id: "1",
                        status: "up",
                        type: "http",
                        responseTime: 0,
                        monitoring: false,
                        checkInterval: 0,
                        timeout: 0,
                        retryAttempts: 0,
                    },
                    {
                        history: [],
                        id: "2",
                        status: "down",
                        type: "port",
                        responseTime: 0,
                        monitoring: false,
                        checkInterval: 0,
                        timeout: 0,
                        retryAttempts: 0,
                    },
                ],
                name: "",
                monitoring: false,
            };

            expect(site.monitors).toHaveLength(2);
            expect(site.monitors[0]?.type).toBe("http");
            expect(site.monitors[1]?.type).toBe("port");
        });
    });

    describe("StatusHistory interface", () => {
        it("should validate status history object", () => {
            const history: StatusHistory = {
                responseTime: 250,
                status: "up",
                timestamp: Date.now(),
            };

            expect(typeof history.timestamp).toBe("number");
            expect(history.status).toBe("up");
            expect(typeof history.responseTime).toBe("number");
        });

        it("should validate status history status values", () => {
            const statuses = ["up", "down"] as const;

            for (const status of statuses) {
                const history: StatusHistory = {
                    responseTime: 100,
                    status: status,
                    timestamp: Date.now(),
                };
                expect(history.status).toBe(status);
            }
        });
    });

    describe("StatusUpdate interface", () => {
        it("should validate status update object", () => {
            const site: Site = {
                identifier: "update-site",
                monitors: [],
                name: "",
                monitoring: false,
            };

            const statusUpdate: StatusUpdate = {
                previousStatus: "down",
                site: site,
            };

            expect(statusUpdate.site).toBe(site);
            expect(statusUpdate.previousStatus).toBe("down");
        });

        it("should validate status update without previous status", () => {
            const site: Site = {
                identifier: "new-site",
                monitors: [],
                name: "",
                monitoring: false,
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
                history: [],
                id: "http-test",
                status: "up",
                type: "http",
                url: "https://example.com",
                responseTime: 0,
                monitoring: false,
                checkInterval: 0,
                timeout: 0,
                retryAttempts: 0,
            };

            // Port monitor should have host and port
            const portMonitor: Monitor = {
                history: [],
                host: "example.com",
                id: "port-test",
                port: 443,
                status: "up",
                type: "port",
                responseTime: 0,
                monitoring: false,
                checkInterval: 0,
                timeout: 0,
                retryAttempts: 0,
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
                        history: [],
                        id: "child-monitor",
                        status: "up",
                        type: "http",
                        responseTime: 0,
                        monitoring: false,
                        checkInterval: 0,
                        timeout: 0,
                        retryAttempts: 0,
                    },
                ],
                name: "",
                monitoring: false,
            };

            expect(site.monitors).toHaveLength(1);
            expect(site.monitors[0]?.id).toBe("child-monitor");
        });

        it("should ensure status update contains valid site", () => {
            const site: Site = {
                identifier: "status-update-site",
                monitors: [
                    {
                        history: [],
                        id: "monitor",
                        status: "up",
                        type: "http",
                        responseTime: 0,
                        monitoring: false,
                        checkInterval: 0,
                        timeout: 0,
                        retryAttempts: 0,
                    },
                ],
                name: "",
                monitoring: false,
            };

            const update: StatusUpdate = {
                previousStatus: "down",
                site: site,
            };

            expect(update.site.identifier).toBe("status-update-site");
            expect(update.site.monitors).toHaveLength(1);
        });
    });

    describe("Type Safety", () => {
        it("should validate timestamp as number in StatusHistory", () => {
            const history: StatusHistory = {
                responseTime: 100,
                status: "up",
                timestamp: 1640995200000,
            };

            expect(typeof history.timestamp).toBe("number");
            expect(history.timestamp).toBeGreaterThan(0);
        });

        it("should handle optional properties correctly", () => {
            const monitor: Monitor = {
                history: [],
                id: "optional-test",
                status: "pending",
                type: "http",
                responseTime: 0,
                monitoring: false,
                checkInterval: 0,
                timeout: 0,
                retryAttempts: 0,
            };

            expect(monitor.url).toBeUndefined();
            expect(monitor.responseTime).toBe(0);
            expect(monitor.lastChecked).toBeUndefined();
            expect(monitor.monitoring).toBe(false);
            expect(monitor.checkInterval).toBe(0);
            expect(monitor.timeout).toBe(0);
            expect(monitor.retryAttempts).toBe(0);
        });
    });
});
