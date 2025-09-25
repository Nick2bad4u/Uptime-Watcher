/**
 * @file Fixed tests for MonitorFactory using correct API
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    getMonitor,
    getAvailableMonitorTypes,
    clearMonitorFactoryCache,
    updateMonitorConfig,
} from "../../../services/monitoring/MonitorFactory";
import type { MonitorConfig } from "../../../services/monitoring/types.js";

describe("MonitorFactory - Fixed", () => {
    let mockMonitorConfig: MonitorConfig;

    beforeEach(() => {
        vi.clearAllMocks();
        mockMonitorConfig = {
            timeout: 5000,
            userAgent: "Test-Agent/1.0",
        };
    });

    describe(getMonitor, () => {
        it("should get a ping monitor", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorFactory", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Retrieval", "type");

            const monitor = getMonitor("ping", mockMonitorConfig);
            expect(monitor).toBeDefined();
            expect(typeof monitor.check).toBe("function");
        });

        it("should get an http monitor", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorFactory", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Retrieval", "type");

            const monitor = getMonitor("http", mockMonitorConfig);
            expect(monitor).toBeDefined();
            expect(typeof monitor.check).toBe("function");
        });

        it("should get a port monitor", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorFactory", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Retrieval", "type");

            const monitor = getMonitor("port", mockMonitorConfig);
            expect(monitor).toBeDefined();
            expect(typeof monitor.check).toBe("function");
        });

        it("should handle invalid monitor type", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorFactory", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            expect(() =>
                getMonitor("invalid" as any, mockMonitorConfig)
            ).toThrow();
        });

        it("should get monitor with configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorFactory", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Retrieval", "type");

            const monitor = getMonitor("ping", mockMonitorConfig);
            expect(monitor).toBeDefined();
        });
    });

    describe("getAvailableTypes", () => {
        it("should return available monitor types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorFactory", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const types = getAvailableMonitorTypes();
            expect(types).toContain("ping");
            expect(types).toContain("http");
            expect(types).toContain("port");
        });
    });

    describe("clearCache", () => {
        it("should clear monitor cache", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorFactory", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            // Get a monitor to populate cache
            getMonitor("ping", mockMonitorConfig);

            // Clear cache should not throw
            expect(() => clearMonitorFactoryCache()).not.toThrow();
        });
    });

    describe("updateConfig", () => {
        it("should update config for all monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorFactory", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Data Update", "type");

            const newConfig = {
                timeout: 10_000,
                userAgent: "Updated-Agent/1.0",
            };
            expect(() => updateMonitorConfig(newConfig)).not.toThrow();
        });
    });
});
