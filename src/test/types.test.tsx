/**
 * Tests for types.ts module. Tests type definitions, interfaces, and global
 * window API declarations.
 */

import { describe, expect, it } from "vitest";

import { MONITOR_STATUS, STATUS_HISTORY_VALUES } from "@shared/types";
import type {
    MonitorType,
    Monitor,
    Site,
    StatusHistory,
    StatusUpdate,
} from "@shared/types";
import type { UpdateStatus } from "../stores/types";

const createTestMonitor = (overrides: Partial<Monitor> = {}): Monitor => ({
    ...overrides,
    checkInterval: overrides.checkInterval ?? 60_000,
    history: overrides.history ?? [],
    id: overrides.id ?? "test-monitor-id",
    monitoring: overrides.monitoring ?? true,
    responseTime: overrides.responseTime ?? 0,
    retryAttempts: overrides.retryAttempts ?? 0,
    status: overrides.status ?? "up",
    timeout: overrides.timeout ?? 30_000,
    type: overrides.type ?? "http",
});

describe("Types Module", () => {
    describe("Type Definitions", () => {
        it("should export UpdateStatus type", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: types", "component");
            annotate("Category: Core", "category");
            annotate("Type: Export Operation", "type");

            const updateStatuses: UpdateStatus[] = [
                "idle",
                "checking",
                "available",
                "downloading",
                "downloaded",
                "error",
            ];

            // All values should be valid UpdateStatus
            for (const status of updateStatuses) {
                expect(typeof status).toBe("string");
            }
        });

        it("should export MonitorType type", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: types", "component");
            annotate("Category: Core", "category");
            annotate("Type: Export Operation", "type");

            const monitorTypes: MonitorType[] = ["http", "port"] as const;

            for (const type of monitorTypes) {
                expect(typeof type).toBe("string");
            }
        });
    });

    describe("Monitor Interface", () => {
        it("should create valid Monitor object", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: types", "component");
            annotate("Category: Core", "category");
            annotate("Type: Constructor", "type");

            const monitor: Monitor = {
                id: "test-monitor-id",
                type: "http",
                status: "up",
                url: "https://example.com",
                responseTime: 250,
                lastChecked: new Date(),
                history: [],
                monitoring: true,
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
            };

            expect(monitor.id).toBe("test-monitor-id");
            expect(monitor.type).toBe("http");
            expect(monitor.status).toBe("up");
            expect(monitor.url).toBe("https://example.com");
            expect(monitor.responseTime).toBe(250);
            expect(monitor.lastChecked).toBeInstanceOf(Date);
            expect(Array.isArray(monitor.history)).toBeTruthy();
            expect(monitor.monitoring).toBeTruthy();
            expect(monitor.checkInterval).toBe(60_000);
            expect(monitor.timeout).toBe(5000);
            expect(monitor.retryAttempts).toBe(3);
        });

        it("should create valid HTTP Monitor with minimal fields", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: types", "component");
            annotate("Category: Core", "category");
            annotate("Type: Constructor", "type");

            const monitor: Monitor = {
                id: "http-monitor",
                type: "http",
                status: "pending",
                history: [],
                responseTime: 0,
                monitoring: false,
                checkInterval: 0,
                timeout: 0,
                retryAttempts: 0,
            };

            expect(monitor.id).toBe("http-monitor");
            expect(monitor.type).toBe("http");
            expect(monitor.status).toBe("pending");
            expect(monitor.url).toBeUndefined();
            expect(monitor.host).toBeUndefined();
            expect(monitor.port).toBeUndefined();
        });

        it("should create valid Port Monitor", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: types", "component");
            annotate("Category: Core", "category");
            annotate("Type: Constructor", "type");

            const monitor: Monitor = {
                id: "port-monitor",
                type: "port",
                status: "up",
                host: "example.com",
                port: 80,
                history: [],
                responseTime: 100,
                monitoring: false,
                checkInterval: 0,
                timeout: 0,
                retryAttempts: 0,
            };

            expect(monitor.id).toBe("port-monitor");
            expect(monitor.type).toBe("port");
            expect(monitor.status).toBe("up");
            expect(monitor.host).toBe("example.com");
            expect(monitor.port).toBe(80);
            expect(monitor.responseTime).toBe(100);
        });

        it("should support all status values", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: types", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const statuses = Object.values(MONITOR_STATUS);

            for (const status of statuses) {
                const monitor: Monitor = {
                    id: `monitor-${status}`,
                    type: "http",
                    status,
                    history: [],
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

    describe("Site Interface", () => {
        it("should create valid Site object", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: types", "component");
            annotate("Category: Core", "category");
            annotate("Type: Constructor", "type");

            const site: Site = {
                identifier: "site-123",
                name: "Test Site",
                monitors: [],
                monitoring: true,
            };

            expect(site.identifier).toBe("site-123");
            expect(site.name).toBe("Test Site");
            expect(Array.isArray(site.monitors)).toBeTruthy();
            expect(site.monitoring).toBeTruthy();
        });

        it("should create Site with multiple monitors", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: types", "component");
            annotate("Category: Core", "category");
            annotate("Type: Constructor", "type");

            const httpMonitor: Monitor = {
                id: "http-1",
                type: "http",
                status: "up",
                url: "https://example.com",
                history: [],
                responseTime: 0,
                monitoring: false,
                checkInterval: 0,
                timeout: 0,
                retryAttempts: 0,
            };

            const portMonitor: Monitor = {
                id: "port-1",
                type: "port",
                status: "up",
                host: "example.com",
                port: 443,
                history: [],
                responseTime: 0,
                monitoring: false,
                checkInterval: 0,
                timeout: 0,
                retryAttempts: 0,
            };

            const site: Site = {
                identifier: "multi-monitor-site",
                name: "Multi Monitor Site",
                monitors: [httpMonitor, portMonitor],
                monitoring: false,
            };

            expect(site.monitors).toHaveLength(2);
            expect(site.monitors[0]?.type).toBe("http");
            expect(site.monitors[1]?.type).toBe("port");
        });

        it("should create Site with minimal fields", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: types", "component");
            annotate("Category: Core", "category");
            annotate("Type: Constructor", "type");

            const site: Site = {
                identifier: "minimal-site",
                monitors: [],
                name: "",
                monitoring: false,
            };

            expect(site.identifier).toBe("minimal-site");
            expect(site.name).toBe("");
            expect(site.monitoring).toBeFalsy();
            expect(site.monitors).toHaveLength(0);
        });
    });

    describe("StatusHistory Interface", () => {
        it("should create valid StatusHistory object", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: types", "component");
            annotate("Category: Core", "category");
            annotate("Type: Constructor", "type");

            const history: StatusHistory = {
                timestamp: 1_640_995_200_000,
                status: "up",
                responseTime: 250,
            };

            expect(history.timestamp).toBe(1_640_995_200_000);
            expect(history.status).toBe("up");
            expect(history.responseTime).toBe(250);
        });

        it("should support all status values", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: types", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            for (const status of STATUS_HISTORY_VALUES) {
                const history: StatusHistory = {
                    timestamp: Date.now(),
                    status,
                    responseTime: 200,
                };

                expect(history.status).toBe(status);
            }
        });

        it("should handle zero response time", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: types", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const history: StatusHistory = {
                timestamp: Date.now(),
                status: "down",
                responseTime: 0,
            };

            expect(history.responseTime).toBe(0);
        });
    });

    describe("StatusUpdate Interface", () => {
        it("should create valid StatusUpdate object", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: types", "component");
            annotate("Category: Core", "category");
            annotate("Type: Constructor", "type");

            const monitor = createTestMonitor();
            const site: Site = {
                identifier: "update-site",
                monitors: [monitor],
                name: "",
                monitoring: false,
            };

            const statusUpdate: StatusUpdate = {
                monitor,
                monitorId: monitor.id,
                status: "up",
                siteIdentifier: site.identifier,
                timestamp: new Date().toISOString(),
                site,
                previousStatus: "down",
            };

            expect(statusUpdate.site).toBe(site);
            expect(statusUpdate.previousStatus).toBe("down");
        });

        it("should create StatusUpdate without previous status", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: types", "component");
            annotate("Category: Core", "category");
            annotate("Type: Constructor", "type");

            const monitor = createTestMonitor();
            const site: Site = {
                identifier: "new-site",
                monitors: [monitor],
                name: "",
                monitoring: false,
            };

            const statusUpdate: StatusUpdate = {
                monitor,
                monitorId: monitor.id,
                status: "up",
                siteIdentifier: site.identifier,
                timestamp: new Date().toISOString(),
                site,
            };

            expect(statusUpdate.site).toBe(site);
            expect(statusUpdate.previousStatus).toBeUndefined();
        });

        it("should support all previous status values", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: types", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const statuses = Object.values(MONITOR_STATUS);
            const monitor = createTestMonitor();
            const site: Site = {
                identifier: "test",
                monitors: [monitor],
                name: "",
                monitoring: false,
            };

            for (const status of statuses) {
                const statusUpdate: StatusUpdate = {
                    monitor,
                    monitorId: monitor.id,
                    status: "up",
                    siteIdentifier: site.identifier,
                    timestamp: new Date().toISOString(),
                    site,
                    previousStatus: status,
                };

                expect(statusUpdate.previousStatus).toBe(status);
            }
        });
    });

    describe("Window Electron API", () => {
        it("should have electronAPI structure defined", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: types", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            // Test that the global type is defined properly
            // This validates the interface structure without needing actual implementation
            const mockAPI = {
                data: {
                    exportData: () => Promise.resolve("data"),
                    importData: () => Promise.resolve(true),
                    downloadSqliteBackup: () =>
                        Promise.resolve({
                            buffer: new ArrayBuffer(0),
                            fileName: "backup.db",
                        }),
                },
                events: {
                    onMonitorStatusChanged: () => {
                        const cleanup = () => {};
                        return cleanup;
                    },
                    onMonitorUp: () => {
                        const cleanup = () => {};
                        return cleanup;
                    },
                    onMonitorDown: () => {
                        const cleanup = () => {};
                        return cleanup;
                    },
                    onMonitoringStarted: () => {
                        const cleanup = () => {};
                        return cleanup;
                    },
                    onMonitoringStopped: () => {
                        const cleanup = () => {};
                        return cleanup;
                    },
                    onTestEvent: () => {
                        const cleanup = () => {};
                        return cleanup;
                    },
                    onUpdateStatus: () => {
                        const cleanup = () => {};
                        return cleanup;
                    },
                    removeAllListeners: () => {},
                },
                monitoring: {
                    checkSiteNow: () =>
                        Promise.resolve({
                            details: "Manual check completed",
                            monitor: {
                                checkInterval: 60_000,
                                history: [],
                                id: "monitor-1",
                                monitoring: true,
                                responseTime: 0,
                                retryAttempts: 0,
                                status: "up",
                                timeout: 30_000,
                                type: "http",
                            },
                            monitorId: "monitor-1",
                            previousStatus: "up",
                            site: {
                                identifier: "checked-id",
                                monitors: [
                                    {
                                        checkInterval: 60_000,
                                        history: [],
                                        id: "monitor-1",
                                        monitoring: true,
                                        responseTime: 0,
                                        retryAttempts: 0,
                                        status: "up",
                                        timeout: 30_000,
                                        type: "http",
                                    },
                                ],
                                monitoring: true,
                                name: "Checked",
                            },
                            siteIdentifier: "checked-id",
                            status: "up",
                            timestamp: new Date().toISOString(),
                        }),
                    formatMonitorDetail: () => Promise.resolve("detail"),
                    formatMonitorTitleSuffix: () => Promise.resolve("suffix"),
                    removeMonitor: () => Promise.resolve(true),
                    startMonitoring: () => Promise.resolve(true),
                    startMonitoringForMonitor: () => Promise.resolve(true),
                    startMonitoringForSite: () => Promise.resolve(true),
                    stopMonitoring: () => Promise.resolve(true),
                    stopMonitoringForMonitor: () => Promise.resolve(true),
                    stopMonitoringForSite: () => Promise.resolve(true),
                    validateMonitorData: () =>
                        Promise.resolve({
                            data: {},
                            errors: [],
                            metadata: {},
                            success: true,
                            warnings: [],
                        }),
                },
                settings: {
                    getHistoryLimit: () => Promise.resolve(100),
                    updateHistoryLimit: () => Promise.resolve(100),
                },
                sites: {
                    getSites: () => Promise.resolve([]),
                    addSite: (site: Omit<Site, "id">) =>
                        Promise.resolve({
                            ...site,
                            identifier: "new-id",
                        } as Site),
                    removeMonitor: () => Promise.resolve(true),
                    removeSite: () => Promise.resolve(true),
                    updateSite: () =>
                        Promise.resolve({
                            identifier: "updated-id",
                            monitors: [],
                            monitoring: false,
                            name: "Updated",
                        } as Site),
                },
                system: {
                    quitAndInstall: () => Promise.resolve(true),
                },
            };

            // Validate structure
            expect(typeof mockAPI.data.exportData).toBe("function");
            expect(typeof mockAPI.data.importData).toBe("function");
            expect(typeof mockAPI.data.downloadSqliteBackup).toBe("function");

            expect(typeof mockAPI.events.onMonitorStatusChanged).toBe(
                "function"
            );
            expect(typeof mockAPI.events.onMonitorUp).toBe("function");
            expect(typeof mockAPI.events.onMonitorDown).toBe("function");
            expect(typeof mockAPI.events.removeAllListeners).toBe("function");

            expect(typeof mockAPI.monitoring.startMonitoring).toBe("function");
            expect(typeof mockAPI.monitoring.formatMonitorDetail).toBe(
                "function"
            );
            expect(typeof mockAPI.monitoring.formatMonitorTitleSuffix).toBe(
                "function"
            );
            expect(typeof mockAPI.monitoring.stopMonitoring).toBe("function");
            expect(typeof mockAPI.monitoring.startMonitoringForMonitor).toBe(
                "function"
            );
            expect(typeof mockAPI.monitoring.startMonitoringForSite).toBe(
                "function"
            );
            expect(typeof mockAPI.monitoring.stopMonitoringForMonitor).toBe(
                "function"
            );
            expect(typeof mockAPI.monitoring.stopMonitoringForSite).toBe(
                "function"
            );
            expect(typeof mockAPI.monitoring.validateMonitorData).toBe(
                "function"
            );
            expect(typeof mockAPI.monitoring.checkSiteNow).toBe("function");

            expect(typeof mockAPI.settings.getHistoryLimit).toBe("function");
            expect(typeof mockAPI.settings.updateHistoryLimit).toBe("function");

            expect(typeof mockAPI.sites.getSites).toBe("function");
            expect(typeof mockAPI.sites.addSite).toBe("function");
            expect(typeof mockAPI.sites.removeMonitor).toBe("function");
            expect(typeof mockAPI.sites.removeSite).toBe("function");
            expect(typeof mockAPI.sites.updateSite).toBe("function");

            expect(typeof mockAPI.system.quitAndInstall).toBe("function");
        });
    });

    describe("Type Compatibility", () => {
        it("should allow Monitor in Site monitors array", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: types", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            const monitor: Monitor = {
                id: "test",
                type: "http",
                status: "up",
                history: [],
                responseTime: 0,
                monitoring: false,
                checkInterval: 0,
                timeout: 0,
                retryAttempts: 0,
            };

            const site: Site = {
                identifier: "test-site",
                monitors: [monitor],
                name: "",
                monitoring: false,
            };

            expect(site.monitors[0]).toBe(monitor);
        });

        it("should allow StatusHistory in Monitor history array", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: types", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            const history: StatusHistory = {
                timestamp: Date.now(),
                status: "up",
                responseTime: 200,
            };

            const monitor: Monitor = {
                id: "test",
                type: "http",
                status: "up",
                history: [history],
                responseTime: 0,
                monitoring: false,
                checkInterval: 0,
                timeout: 0,
                retryAttempts: 0,
            };

            expect(monitor.history[0]).toBe(history);
        });

        it("should allow Site in StatusUpdate", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: types", "component");
            annotate("Category: Core", "category");
            annotate("Type: Data Update", "type");

            const monitor = createTestMonitor();
            const site: Site = {
                identifier: "test",
                monitors: [monitor],
                name: "",
                monitoring: false,
            };

            const update: StatusUpdate = {
                monitor,
                monitorId: monitor.id,
                status: "up",
                siteIdentifier: site.identifier,
                timestamp: new Date().toISOString(),
                site,
            };

            expect(update.site).toBe(site);
        });
    });

    describe("Optional Fields", () => {
        it("should handle optional Monitor fields", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: types", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            const minimalMonitor: Monitor = {
                id: "minimal",
                type: "http",
                status: "pending",
                history: [],
                responseTime: 0,
                monitoring: false,
                checkInterval: 0,
                timeout: 0,
                retryAttempts: 0,
            };

            // All optional fields should be undefined
            expect(minimalMonitor.url).toBeUndefined();
            expect(minimalMonitor.host).toBeUndefined();
            expect(minimalMonitor.port).toBeUndefined();
            expect(minimalMonitor.responseTime).toBe(0);
            expect(minimalMonitor.lastChecked).toBeUndefined();
            expect(minimalMonitor.monitoring).toBeFalsy();
            expect(minimalMonitor.checkInterval).toBe(+0);
            expect(minimalMonitor.timeout).toBe(+0);
            expect(minimalMonitor.retryAttempts).toBe(0);
        });

        it("should handle optional Site fields", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: types", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const minimalSite: Site = {
                identifier: "minimal",
                monitors: [],
                name: "",
                monitoring: false,
            };

            expect(minimalSite.name).toBe("");
            expect(minimalSite.monitoring).toBeFalsy();
        });

        it("should handle optional StatusUpdate fields", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: types", "component");
            annotate("Category: Core", "category");
            annotate("Type: Data Update", "type");

            const monitor = createTestMonitor();
            const site: Site = {
                identifier: "test",
                monitors: [monitor],
                name: "",
                monitoring: false,
            };
            const minimalUpdate: StatusUpdate = {
                monitor,
                monitorId: monitor.id,
                status: "up",
                siteIdentifier: site.identifier,
                timestamp: new Date().toISOString(),
                site,
            };

            expect(minimalUpdate.previousStatus).toBeUndefined();
        });
    });
});
