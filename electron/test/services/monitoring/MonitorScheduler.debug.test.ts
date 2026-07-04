/**
 * @file Contract test for MonitorScheduler public method availability.
 */

import { describe, expect, it, vi } from "vitest";

import { MonitorScheduler } from "../../../services/monitoring/MonitorScheduler";

// Unmock MonitorScheduler for this test file so we can test the real implementation
vi.unmock("../../../services/monitoring/MonitorScheduler");

describe("MonitorScheduler public contract", () => {
    it("should have performImmediateCheck method", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: MonitorScheduler", "component");
        await annotate("Category: Service", "category");
        await annotate("Type: Business Logic", "type");

        const scheduler = new MonitorScheduler();

        expect(typeof scheduler.performImmediateCheck).toBe("function");

        expect(typeof scheduler.setCheckCallback).toBe("function");
        expect(typeof scheduler.startMonitor).toBe("function");
        expect(typeof scheduler.stopMonitor).toBe("function");
        expect(typeof scheduler.startSite).toBe("function");
        expect(typeof scheduler.stopSite).toBe("function");
        expect(typeof scheduler.stopAll).toBe("function");
        expect(typeof scheduler.getActiveCount).toBe("function");
        expect(typeof scheduler.getActiveMonitors).toBe("function");
        expect(typeof scheduler.isMonitoring).toBe("function");
        expect(typeof scheduler.restartMonitor).toBe("function");
    });

    it("should instantiate properly", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: MonitorScheduler", "component");
        await annotate("Category: Service", "category");
        await annotate("Type: Business Logic", "type");

        const scheduler = new MonitorScheduler();
        expect(scheduler).toBeInstanceOf(MonitorScheduler);
        expect(scheduler.getActiveCount()).toBe(0);
    });
});
