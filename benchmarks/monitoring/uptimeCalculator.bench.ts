/**
 * Uptime Calculator Performance Benchmarks
 *
 * @file Performance benchmarks for uptime calculation operations.
 *
 * @author GitHub Copilot
 * @since 2025-08-19
 * @category Performance
 * @benchmark Monitoring-UptimeCalculator
 * @tags ["performance", "monitoring", "uptime", "calculations"]
 */

import { bench, describe } from "vitest";

class MockUptimeCalculator {
    calculateUptime(data: { timestamp: number; isUp: boolean }[], period: number): number {
        const now = Date.now();
        const cutoff = now - period;
        const relevantData = data.filter(d => d.timestamp >= cutoff);
        if (relevantData.length === 0) return 100;
        return (relevantData.filter(d => d.isUp).length / relevantData.length) * 100;
    }

    calculateSLA(data: { timestamp: number; isUp: boolean }[], targetSLA: number): any {
        const uptime = this.calculateUptime(data, 30 * 24 * 60 * 60 * 1000);
        return {
            actual: uptime,
            target: targetSLA,
            met: uptime >= targetSLA,
            deficit: Math.max(0, targetSLA - uptime)
        };
    }
}

describe("Uptime Calculator Performance", () => {
    let calculator: MockUptimeCalculator;
    let testData: { timestamp: number; isUp: boolean }[];

    bench("calculator initialization", () => {
        calculator = new MockUptimeCalculator();
        testData = Array.from({ length: 10_000 }, (_, i) => ({
            timestamp: Date.now() - i * 60_000,
            isUp: Math.random() > 0.05
        }));
    }, { warmupIterations: 5, iterations: 500 });

    bench("calculate uptime (1000 data points)", () => {
        calculator = new MockUptimeCalculator();
        const data = Array.from({ length: 1000 }, (_, i) => ({
            timestamp: Date.now() - i * 60_000,
            isUp: Math.random() > 0.05
        }));
        calculator.calculateUptime(data, 24 * 60 * 60 * 1000);
    }, { warmupIterations: 5, iterations: 1000 });

    bench("calculate SLA", () => {
        calculator = new MockUptimeCalculator();
        const data = Array.from({ length: 5000 }, (_, i) => ({
            timestamp: Date.now() - i * 60_000,
            isUp: Math.random() > 0.05
        }));
        calculator.calculateSLA(data, 99.9);
    }, { warmupIterations: 5, iterations: 500 });
});
