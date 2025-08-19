/**
 * Response Time Analyzer Performance Benchmarks
 *
 * @file Performance benchmarks for response time analysis operations.
 *
 * @author GitHub Copilot
 * @since 2025-08-19
 * @category Performance
 * @benchmark Monitoring-ResponseTimeAnalyzer
 * @tags ["performance", "monitoring", "response-time", "analysis"]
 */

import { bench, describe } from "vitest";

class MockResponseTimeAnalyzer {
    calculateStats(responseTimes: number[]): any {
        if (responseTimes.length === 0) return null;
        
        const sorted = responseTimes.sort((a, b) => a - b);
        const sum = responseTimes.reduce((a, b) => a + b, 0);
        
        return {
            count: responseTimes.length,
            min: Math.min(...responseTimes),
            max: Math.max(...responseTimes),
            avg: sum / responseTimes.length,
            median: sorted[Math.floor(sorted.length / 2)],
            p95: sorted[Math.floor(sorted.length * 0.95)],
            p99: sorted[Math.floor(sorted.length * 0.99)]
        };
    }

    detectAnomalies(responseTimes: number[], threshold: number = 2): number[] {
        const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const stdDev = Math.sqrt(responseTimes.reduce((sum, rt) => sum + Math.pow(rt - avg, 2), 0) / responseTimes.length);
        
        return responseTimes.filter(rt => Math.abs(rt - avg) > threshold * stdDev);
    }

    getTrend(responseTimes: Array<{ timestamp: number; value: number }>): string {
        if (responseTimes.length < 2) return 'stable';
        
        const recent = responseTimes.slice(-10);
        const older = responseTimes.slice(-20, -10);
        
        const recentAvg = recent.reduce((sum, rt) => sum + rt.value, 0) / recent.length;
        const olderAvg = older.reduce((sum, rt) => sum + rt.value, 0) / older.length;
        
        const change = (recentAvg - olderAvg) / olderAvg;
        
        if (change > 0.1) return 'increasing';
        if (change < -0.1) return 'decreasing';
        return 'stable';
    }
}

describe("Response Time Analyzer Performance", () => {
    let analyzer: MockResponseTimeAnalyzer;

    bench("calculate stats (1000 data points)", () => {
        analyzer = new MockResponseTimeAnalyzer();
        const responseTimes = Array.from({ length: 1000 }, () => Math.random() * 2000);
        analyzer.calculateStats(responseTimes);
    }, { warmupIterations: 5, iterations: 1000 });

    bench("detect anomalies", () => {
        analyzer = new MockResponseTimeAnalyzer();
        const responseTimes = Array.from({ length: 1000 }, () => Math.random() * 1000 + 200);
        analyzer.detectAnomalies(responseTimes);
    }, { warmupIterations: 5, iterations: 500 });

    bench("get trend analysis", () => {
        analyzer = new MockResponseTimeAnalyzer();
        const data = Array.from({ length: 100 }, (_, i) => ({
            timestamp: Date.now() - i * 60000,
            value: Math.random() * 1000 + 200
        }));
        analyzer.getTrend(data);
    }, { warmupIterations: 5, iterations: 2000 });
});
