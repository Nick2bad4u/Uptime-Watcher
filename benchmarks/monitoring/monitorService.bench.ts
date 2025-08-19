/**
 * Monitor Service Performance Benchmarks
 *
 * @file Performance benchmarks for monitor service operations including
 *   monitor execution, configuration management, and result processing.
 *
 * @author GitHub Copilot
 * @since 2025-08-19
 * @category Performance
 * @benchmark Monitoring-MonitorService
 * @tags ["performance", "monitoring", "monitors", "execution", "configuration"]
 */

import { bench, describe } from "vitest";

// Mock monitor types
interface MonitorConfig {
    id: string;
    type: 'http' | 'ping' | 'port' | 'dns';
    target: string;
    interval: number;
    timeout: number;
    retries: number;
    settings: Record<string, any>;
}

interface MonitorResult {
    monitorId: string;
    timestamp: number;
    success: boolean;
    responseTime: number;
    statusCode?: number;
    error?: string;
    metadata: Record<string, any>;
}

// Mock monitor implementations
class MockHttpMonitor {
    async execute(config: MonitorConfig): Promise<MonitorResult> {
        const startTime = Date.now();
        
        // Simulate HTTP request
        await new Promise(resolve => setTimeout(resolve, Math.random() * config.timeout));
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        const success = Math.random() > 0.05; // 95% success rate
        
        return {
            monitorId: config.id,
            timestamp: startTime,
            success,
            responseTime,
            statusCode: success ? 200 : [404, 500, 503][Math.floor(Math.random() * 3)],
            error: success ? undefined : 'HTTP request failed',
            metadata: {
                url: config.target,
                method: config.settings.method || 'GET',
                userAgent: 'UptimeWatcher/1.0'
            }
        };
    }
}

class MockPingMonitor {
    async execute(config: MonitorConfig): Promise<MonitorResult> {
        const startTime = Date.now();
        
        // Simulate ping
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        const success = Math.random() > 0.02; // 98% success rate
        
        return {
            monitorId: config.id,
            timestamp: startTime,
            success,
            responseTime,
            error: success ? undefined : 'Ping timeout',
            metadata: {
                host: config.target,
                packetSize: config.settings.packetSize || 32,
                ttl: 64
            }
        };
    }
}

class MockPortMonitor {
    async execute(config: MonitorConfig): Promise<MonitorResult> {
        const startTime = Date.now();
        
        // Simulate port check
        await new Promise(resolve => setTimeout(resolve, Math.random() * 30));
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        const success = Math.random() > 0.03; // 97% success rate
        
        return {
            monitorId: config.id,
            timestamp: startTime,
            success,
            responseTime,
            error: success ? undefined : 'Port unreachable',
            metadata: {
                host: config.target,
                port: config.settings.port || 80,
                protocol: config.settings.protocol || 'tcp'
            }
        };
    }
}

class MockDnsMonitor {
    async execute(config: MonitorConfig): Promise<MonitorResult> {
        const startTime = Date.now();
        
        // Simulate DNS lookup
        await new Promise(resolve => setTimeout(resolve, Math.random() * 20));
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        const success = Math.random() > 0.01; // 99% success rate
        
        return {
            monitorId: config.id,
            timestamp: startTime,
            success,
            responseTime,
            error: success ? undefined : 'DNS resolution failed',
            metadata: {
                hostname: config.target,
                recordType: config.settings.recordType || 'A',
                nameserver: config.settings.nameserver || '8.8.8.8'
            }
        };
    }
}

// Main monitor service
class MockMonitorService {
    private monitors = new Map<string, any>();
    private executors = new Map<string, any>();
    private results = new Map<string, MonitorResult[]>();
    private schedules = new Map<string, NodeJS.Timeout>();

    constructor() {
        this.initializeExecutors();
        this.initializeTestMonitors();
    }

    private initializeExecutors() {
        this.executors.set('http', new MockHttpMonitor());
        this.executors.set('ping', new MockPingMonitor());
        this.executors.set('port', new MockPortMonitor());
        this.executors.set('dns', new MockDnsMonitor());
    }

    private initializeTestMonitors() {
        const monitorTypes = ['http', 'ping', 'port', 'dns'] as const;
        
        for (let i = 0; i < 200; i++) {
            const type = monitorTypes[i % monitorTypes.length];
            const monitor: MonitorConfig = {
                id: `monitor-${i}`,
                type,
                target: this.generateTarget(type, i),
                interval: [30_000, 60_000, 120_000][i % 3],
                timeout: 5000,
                retries: 3,
                settings: this.generateSettings(type, i)
            };
            
            this.monitors.set(monitor.id, monitor);
            this.results.set(monitor.id, []);
        }
    }

    private generateTarget(type: string, index: number): string {
        switch (type) {
            case 'http': {
                return `https://site${index}.example.com`;
            }
            case 'ping': {
                return `host${index}.example.com`;
            }
            case 'port': {
                return `server${index}.example.com`;
            }
            case 'dns': {
                return `domain${index}.example.com`;
            }
            default: {
                return 'localhost';
            }
        }
    }

    private generateSettings(type: string, index: number): Record<string, any> {
        switch (type) {
            case 'http': {
                return {
                    method: ['GET', 'POST', 'HEAD'][index % 3],
                    expectedStatus: 200,
                    followRedirects: true
                };
            }
            case 'ping': {
                return {
                    packetSize: 32,
                    count: 4
                };
            }
            case 'port': {
                return {
                    port: [80, 443, 22, 25][index % 4],
                    protocol: 'tcp'
                };
            }
            case 'dns': {
                return {
                    recordType: ['A', 'AAAA', 'MX', 'TXT'][index % 4],
                    nameserver: '8.8.8.8'
                };
            }
            default: {
                return {};
            }
        }
    }

    async executeMonitor(monitorId: string): Promise<MonitorResult> {
        const monitor = this.monitors.get(monitorId);
        if (!monitor) {
            throw new Error(`Monitor ${monitorId} not found`);
        }

        const executor = this.executors.get(monitor.type);
        if (!executor) {
            throw new Error(`No executor for monitor type ${monitor.type}`);
        }

        let lastError: Error | null = null;
        
        // Implement retry logic
        for (let attempt = 0; attempt <= monitor.retries; attempt++) {
            try {
                const result = await executor.execute(monitor);
                
                // Store result
                const results = this.results.get(monitorId) || [];
                results.push(result);
                if (results.length > 1000) {
                    results.shift(); // Keep only last 1000 results
                }
                this.results.set(monitorId, results);
                
                return result;
            } catch (error) {
                lastError = error as Error;
                if (attempt < monitor.retries) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                }
            }
        }

        // All retries failed
        const failureResult: MonitorResult = {
            monitorId,
            timestamp: Date.now(),
            success: false,
            responseTime: 0,
            error: lastError?.message || 'Unknown error',
            metadata: { retries: monitor.retries }
        };

        const results = this.results.get(monitorId) || [];
        results.push(failureResult);
        this.results.set(monitorId, results);
        
        return failureResult;
    }

    async executeBulkMonitors(monitorIds: string[]): Promise<MonitorResult[]> {
        const promises = monitorIds.map(id => this.executeMonitor(id));
        return Promise.all(promises);
    }

    async executeMonitorsByType(type: string): Promise<MonitorResult[]> {
        const monitorIds = Array.from(this.monitors.values())
            .filter(monitor => monitor.type === type)
            .map(monitor => monitor.id);
        
        return this.executeBulkMonitors(monitorIds);
    }

    scheduleMonitor(monitorId: string): void {
        const monitor = this.monitors.get(monitorId);
        if (!monitor) return;

        // Clear existing schedule
        const existingSchedule = this.schedules.get(monitorId);
        if (existingSchedule) {
            clearInterval(existingSchedule);
        }

        // Create new schedule
        const intervalId = setInterval(async () => {
            try {
                await this.executeMonitor(monitorId);
            } catch (error) {
                console.error(`Scheduled execution failed for ${monitorId}:`, error);
            }
        }, monitor.interval);

        this.schedules.set(monitorId, intervalId);
    }

    unscheduleMonitor(monitorId: string): void {
        const intervalId = this.schedules.get(monitorId);
        if (intervalId) {
            clearInterval(intervalId);
            this.schedules.delete(monitorId);
        }
    }

    getMonitorResults(monitorId: string, limit: number = 100): MonitorResult[] {
        const results = this.results.get(monitorId) || [];
        return results.slice(-limit).reverse();
    }

    getMonitorStats(monitorId: string): any {
        const results = this.results.get(monitorId) || [];
        if (results.length === 0) return null;

        const successful = results.filter(r => r.success);
        const responseTimes = successful.map(r => r.responseTime);
        
        return {
            totalExecutions: results.length,
            successfulExecutions: successful.length,
            successRate: (successful.length / results.length) * 100,
            avgResponseTime: responseTimes.length > 0 ? 
                responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0,
            minResponseTime: responseTimes.length > 0 ? Math.min(...responseTimes) : 0,
            maxResponseTime: responseTimes.length > 0 ? Math.max(...responseTimes) : 0,
            lastExecution: results.at(-1)
        };
    }

    getAllMonitorStats(): Record<string, any> {
        const stats: Record<string, any> = {};
        for (const monitorId of this.monitors.keys()) {
            stats[monitorId] = this.getMonitorStats(monitorId);
        }
        return stats;
    }

    getSystemMetrics(): any {
        const allResults = Array.from(this.results.values()).flat();
        const successfulResults = allResults.filter(r => r.success);
        const totalMonitors = this.monitors.size;
        const scheduledMonitors = this.schedules.size;

        return {
            totalMonitors,
            scheduledMonitors,
            totalExecutions: allResults.length,
            successfulExecutions: successfulResults.length,
            overallSuccessRate: allResults.length > 0 ? 
                (successfulResults.length / allResults.length) * 100 : 0,
            avgSystemResponseTime: successfulResults.length > 0 ?
                successfulResults.reduce((sum, r) => sum + r.responseTime, 0) / successfulResults.length : 0
        };
    }

    cleanupOldResults(retentionDays: number = 30): number {
        const cutoff = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
        let cleaned = 0;

        for (const [monitorId, results] of this.results) {
            const initialLength = results.length;
            const filtered = results.filter(r => r.timestamp > cutoff);
            this.results.set(monitorId, filtered);
            cleaned += initialLength - filtered.length;
        }

        return cleaned;
    }

    pauseMonitor(monitorId: string): void {
        this.unscheduleMonitor(monitorId);
        const monitor = this.monitors.get(monitorId);
        if (monitor) {
            monitor.isPaused = true;
        }
    }

    resumeMonitor(monitorId: string): void {
        const monitor = this.monitors.get(monitorId);
        if (monitor) {
            monitor.isPaused = false;
            this.scheduleMonitor(monitorId);
        }
    }

    updateMonitorConfig(monitorId: string, updates: Partial<MonitorConfig>): void {
        const monitor = this.monitors.get(monitorId);
        if (monitor) {
            Object.assign(monitor, updates);
            
            // Reschedule if interval changed and monitor is scheduled
            if (updates.interval && this.schedules.has(monitorId)) {
                this.unscheduleMonitor(monitorId);
                this.scheduleMonitor(monitorId);
            }
        }
    }

    shutdown(): void {
        // Clear all scheduled monitors
        for (const intervalId of this.schedules.values()) {
            clearInterval(intervalId);
        }
        this.schedules.clear();
    }
}

describe("Monitor Service Performance", () => {
    let service: MockMonitorService;

    bench("monitor service initialization", () => {
        service = new MockMonitorService();
    }, { warmupIterations: 5, iterations: 100 });

    bench("execute single HTTP monitor", async () => {
        service = new MockMonitorService();
        await service.executeMonitor('monitor-0');
    }, { warmupIterations: 5, iterations: 500 });

    bench("execute single ping monitor", async () => {
        service = new MockMonitorService();
        await service.executeMonitor('monitor-1');
    }, { warmupIterations: 5, iterations: 500 });

    bench("execute single port monitor", async () => {
        service = new MockMonitorService();
        await service.executeMonitor('monitor-2');
    }, { warmupIterations: 5, iterations: 500 });

    bench("execute single DNS monitor", async () => {
        service = new MockMonitorService();
        await service.executeMonitor('monitor-3');
    }, { warmupIterations: 5, iterations: 500 });

    bench("execute bulk monitors (10 monitors)", async () => {
        service = new MockMonitorService();
        const monitorIds = Array.from({ length: 10 }, (_, i) => `monitor-${i}`);
        await service.executeBulkMonitors(monitorIds);
    }, { warmupIterations: 2, iterations: 100 });

    bench("execute bulk monitors (50 monitors)", async () => {
        service = new MockMonitorService();
        const monitorIds = Array.from({ length: 50 }, (_, i) => `monitor-${i}`);
        await service.executeBulkMonitors(monitorIds);
    }, { warmupIterations: 2, iterations: 20 });

    bench("execute monitors by type (HTTP)", async () => {
        service = new MockMonitorService();
        await service.executeMonitorsByType('http');
    }, { warmupIterations: 2, iterations: 50 });

    bench("schedule monitor", () => {
        service = new MockMonitorService();
        service.scheduleMonitor('monitor-0');
        service.unscheduleMonitor('monitor-0'); // Clean up
    }, { warmupIterations: 5, iterations: 2000 });

    bench("unschedule monitor", () => {
        service = new MockMonitorService();
        service.scheduleMonitor('monitor-0');
        service.unscheduleMonitor('monitor-0');
    }, { warmupIterations: 5, iterations: 2000 });

    bench("get monitor results", async () => {
        service = new MockMonitorService();
        // Execute a few times to populate results
        await service.executeMonitor('monitor-0');
        await service.executeMonitor('monitor-0');
        service.getMonitorResults('monitor-0', 50);
    }, { warmupIterations: 5, iterations: 1000 });

    bench("get monitor stats", async () => {
        service = new MockMonitorService();
        // Execute a few times to populate results
        for (let i = 0; i < 5; i++) {
            await service.executeMonitor('monitor-0');
        }
        service.getMonitorStats('monitor-0');
    }, { warmupIterations: 2, iterations: 1000 });

    bench("get all monitor stats", async () => {
        service = new MockMonitorService();
        // Execute a few monitors to populate results
        await service.executeMonitor('monitor-0');
        await service.executeMonitor('monitor-1');
        await service.executeMonitor('monitor-2');
        service.getAllMonitorStats();
    }, { warmupIterations: 2, iterations: 100 });

    bench("get system metrics", async () => {
        service = new MockMonitorService();
        // Execute several monitors to populate system data
        const monitorIds = ['monitor-0', 'monitor-1', 'monitor-2', 'monitor-3', 'monitor-4'];
        await service.executeBulkMonitors(monitorIds);
        service.getSystemMetrics();
    }, { warmupIterations: 2, iterations: 500 });

    bench("cleanup old results", async () => {
        service = new MockMonitorService();
        // Execute some monitors to create results
        const monitorIds = Array.from({ length: 10 }, (_, i) => `monitor-${i}`);
        await service.executeBulkMonitors(monitorIds);
        service.cleanupOldResults(30);
    }, { warmupIterations: 2, iterations: 500 });

    bench("pause monitor", () => {
        service = new MockMonitorService();
        service.scheduleMonitor('monitor-0');
        service.pauseMonitor('monitor-0');
    }, { warmupIterations: 5, iterations: 2000 });

    bench("resume monitor", () => {
        service = new MockMonitorService();
        service.pauseMonitor('monitor-0');
        service.resumeMonitor('monitor-0');
        service.unscheduleMonitor('monitor-0'); // Clean up
    }, { warmupIterations: 5, iterations: 2000 });

    bench("update monitor config", () => {
        service = new MockMonitorService();
        service.updateMonitorConfig('monitor-0', {
            interval: 30_000,
            timeout: 10_000,
            retries: 5
        });
    }, { warmupIterations: 5, iterations: 5000 });

    bench("complex monitoring workflow", async () => {
        service = new MockMonitorService();
        
        // Schedule some monitors
        const monitorIds = ['monitor-0', 'monitor-1', 'monitor-2'];
        monitorIds.forEach(id => service.scheduleMonitor(id));
        
        // Execute bulk monitors
        await service.executeBulkMonitors(monitorIds);
        
        // Get system metrics
        service.getSystemMetrics();
        
        // Update a config
        service.updateMonitorConfig('monitor-0', { interval: 45_000 });
        
        // Clean up
        monitorIds.forEach(id => service.unscheduleMonitor(id));
    }, { warmupIterations: 2, iterations: 200 });

    bench("service shutdown", () => {
        service = new MockMonitorService();
        // Schedule some monitors
        service.scheduleMonitor('monitor-0');
        service.scheduleMonitor('monitor-1');
        service.scheduleMonitor('monitor-2');
        
        service.shutdown();
    }, { warmupIterations: 5, iterations: 1000 });
});
