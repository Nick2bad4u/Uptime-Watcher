/**
 * Tests for monitor-specific type guards.
 *
 * @remarks
 * Provides focused coverage for {@link isMonitorOfType} and
 * {@link assertMonitorType}, ensuring both success and failure paths are
 * exercised with realistic monitor objects.
 */

import { describe, expect, it } from "vitest";

import { MONITOR_STATUS, type Monitor, type MonitorType } from "@shared/types";
import { assertMonitorType, isMonitorOfType } from "@shared/typeGuards/monitor";

function createMonitor(type: MonitorType): Monitor {
    return {
        id: `monitor-${type}`,
        type,
        checkInterval: 60_000,
        history: [],
        monitoring: true,
        responseTime: 0,
        retryAttempts: 0,
        status: MONITOR_STATUS.PENDING,
        timeout: 5000,
    };
}

describe("Monitor type guards", () => {
    describe(isMonitorOfType, () => {
        it("returns true when monitor type matches", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-typeGuards", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Type Safety", "type");

            const httpMonitor = createMonitor("http");

            expect(isMonitorOfType(httpMonitor, "http")).toBeTruthy();
        });

        it("returns false when monitor type does not match", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-typeGuards", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Type Safety", "type");

            const portMonitor = createMonitor("port");

            expect(isMonitorOfType(portMonitor, "http")).toBeFalsy();
        });
    });

    describe(assertMonitorType, () => {
        it("does not throw when monitor type matches", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-typeGuards", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Type Safety", "type");

            const monitor = createMonitor("http");

            expect(() => assertMonitorType(monitor, "http")).not.toThrow();
        });

        it("throws with default context when types do not match", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-typeGuards", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Type Safety", "type");

            const monitor = createMonitor("port");

            expect(() => assertMonitorType(monitor, "http")).toThrow(
                "Expected monitor to be type 'http', received 'port'"
            );
        });

        it("includes custom context in error message", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitor-typeGuards", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Type Safety", "type");

            const monitor = createMonitor("dns");

            expect(() =>
                assertMonitorType(monitor, "http", "monitor config")
            ).toThrow(
                "Expected monitor config to be type 'http', received 'dns'"
            );
        });
    });
});
