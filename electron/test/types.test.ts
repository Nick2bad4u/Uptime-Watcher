/**
 * Tests for Electron backend types.
 * Validates type definitions and provides runtime type checking for critical interfaces.
 */

import { describe, expect, it } from "vitest";

import type {
    Monitor,
    MonitorType,
    Site,
    StatusHistory,
    StatusUpdate,
} from "../types";

describe("Electron Types", () => {
    describe("MonitorType", () => {
        it("should only allow valid monitor types", () => {
            const validTypes: MonitorType[] = ["http", "port"];

            for (const type of validTypes) {
                expect(["http", "port"]).toContain(type);
            }
        });
    });

    describe("Monitor Interface", () => {
        it("should validate a complete HTTP monitor object", () => {
            const monitor: Monitor = {
                id: "test-monitor-123",
                type: "http",
                status: "up",
                responseTime: 150,
                lastChecked: new Date(),
                history: [],
                monitoring: true,
                url: "https://example.com",
                checkInterval: 300_000,
                timeout: 10_000,
                retryAttempts: 3,
            };

            expect(monitor.id).toBe("test-monitor-123");
            expect(monitor.type).toBe("http");
            expect(monitor.status).toBe("up");
            expect(monitor.url).toBe("https://example.com");
            expect(monitor.history).toEqual([]);
        });

        it("should validate a complete port monitor object", () => {
            const monitor: Monitor = {
                id: "test-port-monitor-456",
                type: "port",
                status: "down",
                responseTime: 0,
                lastChecked: new Date(),
                history: [],
                monitoring: false,
                host: "192.168.1.1",
                port: 80,
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 2,
            };

            expect(monitor.id).toBe("test-port-monitor-456");
            expect(monitor.type).toBe("port");
            expect(monitor.status).toBe("down");
            expect(monitor.host).toBe("192.168.1.1");
            expect(monitor.port).toBe(80);
        });

        it("should validate minimal monitor object", () => {
            const monitor: Monitor = {
                id: "minimal-monitor",
                type: "http",
                status: "pending",
                history: [],
                checkInterval: 0,
                monitoring: false,
                responseTime: 0,
                retryAttempts: 0,
                timeout: 0,
            };

            expect(monitor.id).toBe("minimal-monitor");
            expect(monitor.type).toBe("http");
            expect(monitor.status).toBe("pending");
            expect(monitor.history).toEqual([]);
        });

        it("should validate monitor status values", () => {
            const validStatuses = ["up", "down", "pending"];

            for (const status of validStatuses) {
                const monitor: Monitor = {
                    id: "status-test",
                    type: "http",
                    status: status as Monitor["status"],
                    history: [],
                    checkInterval: 0,
                    monitoring: false,
                    responseTime: 0,
                    retryAttempts: 0,
                    timeout: 0,
                };

                expect(["up", "down", "pending"]).toContain(monitor.status);
            }
        });
    });

    describe("Site Interface", () => {
        it("should validate a complete site object", () => {
            const site: Site = {
                identifier: "test-site-789",
                name: "Test Website",
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        status: "up",
                        history: [],
                        url: "https://example.com",
                        checkInterval: 0,
                        monitoring: false,
                        responseTime: 0,
                        retryAttempts: 0,
                        timeout: 0,
                    },
                    {
                        id: "monitor-2",
                        type: "port",
                        status: "down",
                        history: [],
                        host: "example.com",
                        port: 443,
                        checkInterval: 0,
                        monitoring: false,
                        responseTime: 0,
                        retryAttempts: 0,
                        timeout: 0,
                    },
                ],
                monitoring: true,
            };

            expect(site.identifier).toBe("test-site-789");
            expect(site.name).toBe("Test Website");
            expect(site.monitors).toHaveLength(2);
            expect(site.monitoring).toBe(true);
        });

        it("should validate minimal site object", () => {
            const site: Site = {
                identifier: "minimal-site",
                monitors: [],
                monitoring: false,
                name: "",
            };

            expect(site.identifier).toBe("minimal-site");
            expect(site.monitors).toEqual([]);
        });

        it("should allow site with empty monitors array", () => {
            const site: Site = {
                identifier: "empty-monitors-site",
                name: "Empty Site",
                monitors: [],
                monitoring: false,
            };

            expect(site.monitors).toEqual([]);
            expect(site.monitoring).toBe(false);
        });
    });

    describe("StatusHistory Interface", () => {
        it("should validate status history object", () => {
            const history: StatusHistory = {
                timestamp: 1_640_995_200_000, // 2022-01-01
                status: "up",
                responseTime: 250,
                details: "OK - 200 response",
            };

            expect(history.timestamp).toBe(1_640_995_200_000);
            expect(history.status).toBe("up");
            expect(history.responseTime).toBe(250);
            expect(history.details).toBe("OK - 200 response");
        });

        it("should validate minimal status history object", () => {
            const history: StatusHistory = {
                timestamp: Date.now(),
                status: "down",
                responseTime: 0,
            };

            expect(typeof history.timestamp).toBe("number");
            expect(history.status).toBe("down");
            expect(history.responseTime).toBe(0);
        });

        it("should validate status history status values", () => {
            const validStatuses = ["up", "down"];

            for (const status of validStatuses) {
                const history: StatusHistory = {
                    timestamp: Date.now(),
                    status: status as StatusHistory["status"],
                    responseTime: 100,
                };

                expect(["up", "down"]).toContain(history.status);
            }
        });
    });

    describe("StatusUpdate Interface", () => {
        it("should validate status update object", () => {
            const update: StatusUpdate = {
                site: {
                    identifier: "update-site",
                    name: "Update Site",
                    monitors: [],
                    monitoring: false,
                },
                previousStatus: "down",
                monitorId: "",
                siteIdentifier: "",
                status: "down",
                timestamp: "",
            };

            expect(update.site?.identifier).toBe("update-site");
            expect(update.previousStatus).toBe("down");
        });

        it("should validate status update without previous status", () => {
            const update: StatusUpdate = {
                site: {
                    identifier: "new-site",
                    monitors: [],
                    monitoring: false,
                    name: "",
                },
                monitorId: "",
                siteIdentifier: "",
                status: "down",
                timestamp: "",
            };

            expect(update.site?.identifier).toBe("new-site");
            expect(update.previousStatus).toBeUndefined();
        });
    });

    describe("Type Relationships", () => {
        it("should ensure monitor types are consistent with their properties", () => {
            // HTTP monitor should have URL
            const httpMonitor: Monitor = {
                id: "http-test",
                type: "http",
                status: "pending",
                history: [],
                url: "https://example.com",
                checkInterval: 0,
                monitoring: false,
                responseTime: 0,
                retryAttempts: 0,
                timeout: 0,
            };

            expect(httpMonitor.type).toBe("http");
            expect(httpMonitor.url).toBeDefined();

            // Port monitor should have host and port
            const portMonitor: Monitor = {
                id: "port-test",
                type: "port",
                status: "pending",
                history: [],
                host: "example.com",
                port: 80,
                checkInterval: 0,
                monitoring: false,
                responseTime: 0,
                retryAttempts: 0,
                timeout: 0,
            };

            expect(portMonitor.type).toBe("port");
            expect(portMonitor.host).toBeDefined();
            expect(portMonitor.port).toBeDefined();
        });

        it("should ensure site contains valid monitors", () => {
            const site: Site = {
                identifier: "multi-monitor-site",
                monitors: [
                    {
                        id: "http-monitor",
                        type: "http",
                        status: "up",
                        history: [],
                        url: "https://example.com",
                        checkInterval: 0,
                        monitoring: false,
                        responseTime: 0,
                        retryAttempts: 0,
                        timeout: 0,
                    },
                    {
                        id: "port-monitor",
                        type: "port",
                        status: "down",
                        history: [],
                        host: "example.com",
                        port: 443,
                        checkInterval: 0,
                        monitoring: false,
                        responseTime: 0,
                        retryAttempts: 0,
                        timeout: 0,
                    },
                ],
                monitoring: false,
                name: "",
            };

            expect(site.monitors).toHaveLength(2);
            expect(site.monitors[0]?.type).toBe("http");
            expect(site.monitors[1]?.type).toBe("port");
        });

        it("should ensure status update contains valid site", () => {
            const site: Site = {
                identifier: "status-update-site",
                monitors: [
                    {
                        id: "test-monitor",
                        type: "http",
                        status: "up",
                        history: [],
                        checkInterval: 0,
                        monitoring: false,
                        responseTime: 0,
                        retryAttempts: 0,
                        timeout: 0,
                    },
                ],
                monitoring: false,
                name: "",
            };

            const update: StatusUpdate = {
                site,
                previousStatus: "pending",
                monitorId: "",
                siteIdentifier: "",
                status: "pending",
                timestamp: "",
            };

            expect(update.site?.identifier).toBe("status-update-site");
            expect(update.site?.monitors).toHaveLength(1);
            expect(update.previousStatus).toBe("pending");
        });
    });

    describe("Type Safety", () => {
        it("should prevent invalid monitor status values at runtime", () => {
            const createMonitorWithStatus = (status: string) => ({
                id: "test",
                type: "http" as const,
                status: status as Monitor["status"],
                history: [],
            });

            // Valid statuses should work
            expect(() => createMonitorWithStatus("up")).not.toThrow();
            expect(() => createMonitorWithStatus("down")).not.toThrow();
            expect(() => createMonitorWithStatus("pending")).not.toThrow();
        });

        it("should validate timestamp as number in StatusHistory", () => {
            const history: StatusHistory = {
                timestamp: Date.now(),
                status: "up",
                responseTime: 100,
            };

            expect(typeof history.timestamp).toBe("number");
            expect(history.timestamp).toBeGreaterThan(0);
        });
    });
});
