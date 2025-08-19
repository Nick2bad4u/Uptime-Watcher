/**
 * Monitor Scheduler Performance Benchmarks
 *
 * @file Performance benchmarks for monitor scheduling operations.
 *
 * @author GitHub Copilot
 * @since 2025-08-19
 * @category Performance
 * @benchmark Monitoring-MonitorScheduler
 * @tags ["performance", "monitoring", "scheduler", "timing"]
 */

import { bench, describe } from "vitest";

class MockMonitorScheduler {
    private schedules = new Map<string, any>();
    private timers = new Map<string, NodeJS.Timeout>();

    schedule(monitorId: string, interval: number): void {
        this.unschedule(monitorId);
        
        const timer = setInterval(() => {
            // Mock execution
        }, interval);
        
        this.timers.set(monitorId, timer);
        this.schedules.set(monitorId, {
            monitorId,
            interval,
            nextRun: Date.now() + interval,
            lastRun: null
        });
    }

    unschedule(monitorId: string): void {
        const timer = this.timers.get(monitorId);
        if (timer) {
            clearInterval(timer);
            this.timers.delete(monitorId);
        }
        this.schedules.delete(monitorId);
    }

    getSchedules(): any[] {
        return Array.from(this.schedules.values());
    }

    bulkSchedule(monitors: { id: string; interval: number }[]): void {
        monitors.forEach(monitor => this.schedule(monitor.id, monitor.interval));
    }

    reschedule(monitorId: string, newInterval: number): void {
        if (this.schedules.has(monitorId)) {
            this.schedule(monitorId, newInterval);
        }
    }

    cleanup(): void {
        this.timers.forEach(timer => clearInterval(timer));
        this.timers.clear();
        this.schedules.clear();
    }
}

describe("Monitor Scheduler Performance", () => {
    let scheduler: MockMonitorScheduler;

    bench("schedule single monitor", () => {
        scheduler = new MockMonitorScheduler();
        scheduler.schedule('monitor-1', 60_000);
        scheduler.cleanup();
    }, { warmupIterations: 5, iterations: 2000 });

    bench("unschedule monitor", () => {
        scheduler = new MockMonitorScheduler();
        scheduler.schedule('monitor-1', 60_000);
        scheduler.unschedule('monitor-1');
    }, { warmupIterations: 5, iterations: 2000 });

    bench("bulk schedule (50 monitors)", () => {
        scheduler = new MockMonitorScheduler();
        const monitors = Array.from({ length: 50 }, (_, i) => ({
            id: `monitor-${i}`,
            interval: 60_000 + i * 1000
        }));
        scheduler.bulkSchedule(monitors);
        scheduler.cleanup();
    }, { warmupIterations: 2, iterations: 200 });

    bench("get schedules", () => {
        scheduler = new MockMonitorScheduler();
        scheduler.bulkSchedule(Array.from({ length: 20 }, (_, i) => ({
            id: `monitor-${i}`,
            interval: 60_000
        })));
        scheduler.getSchedules();
        scheduler.cleanup();
    }, { warmupIterations: 5, iterations: 1000 });

    bench("reschedule monitor", () => {
        scheduler = new MockMonitorScheduler();
        scheduler.schedule('monitor-1', 60_000);
        scheduler.reschedule('monitor-1', 30_000);
        scheduler.cleanup();
    }, { warmupIterations: 5, iterations: 1000 });
});
