/**
 * @file Simple debug test for MonitorScheduler to verify method existence
 */

import { describe, it, expect, vi } from "vitest";

// Unmock MonitorScheduler for this test file so we can test the real implementation
vi.unmock("../../../services/monitoring/MonitorScheduler");

import { MonitorScheduler } from "../../../services/monitoring/MonitorScheduler";

describe("MonitorScheduler Debug", () => {
    it("should have performImmediateCheck method", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: MonitorScheduler", "component");
        await annotate("Category: Service", "category");
        await annotate("Type: Business Logic", "type");

        const scheduler = new MonitorScheduler();

        // Debug: Log the scheduler object to see what we have
        console.log("Scheduler object:", scheduler);
        console.log("Scheduler constructor:", scheduler.constructor.name);
        console.log("Scheduler prototype:", Object.getPrototypeOf(scheduler));
        console.log(
            "Available methods:",
            Object.getOwnPropertyNames(Object.getPrototypeOf(scheduler))
        );

        // Check if the method exists
        expect(typeof scheduler.performImmediateCheck).toBe("function");

        // Check all expected methods exist
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
