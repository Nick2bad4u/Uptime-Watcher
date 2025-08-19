/**
 * Site Monitoring Performance Benchmarks
 *
 * @file Performance benchmarks for site monitoring operations including
 *   health checks, status updates, and monitoring logic.
 *
 * @author GitHub Copilot
 * @since 2025-08-19
 * @category Performance
 * @benchmark Monitoring-SiteMonitoring
 * @tags ["performance", "monitoring", "health-checks", "status", "sites"]
 */

import { bench, describe } from "vitest";

// Mock site monitoring service
class MockSiteMonitor {
    private sites = new Map<string, any>();
    private monitoringResults = new Map<string, any[]>();

    constructor() {
        this.initializeTestSites();
    }

    private initializeTestSites() {
        for (let i = 0; i < 100; i++) {
            const siteId = `site-${i}`;
            this.sites.set(siteId, {
                id: siteId,
                url: `https://site${i}.example.com`,
                name: `Site ${i}`,
                isActive: Math.random() > 0.1,
                checkInterval: [30_000, 60_000, 120_000][i % 3],
                timeout: 5000,
                expectedStatus: 200,
                lastChecked: null,
                status: 'unknown'
            });
            this.monitoringResults.set(siteId, []);
        }
    }

    async performHealthCheck(siteId: string) {
        const site = this.sites.get(siteId);
        if (!site) {
            throw new Error(`Site ${siteId} not found`);
        }

        const startTime = Date.now();
        
        // Simulate HTTP request
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        const isHealthy = Math.random() > 0.1; // 90% uptime simulation
        
        const result = {
            siteId,
            timestamp: startTime,
            responseTime,
            statusCode: isHealthy ? site.expectedStatus : [404, 500, 503][Math.floor(Math.random() * 3)],
            isHealthy,
            error: isHealthy ? null : 'Simulated error'
        };

        // Store result
        const results = this.monitoringResults.get(siteId) || [];
        results.push(result);
        if (results.length > 100) {
            results.shift(); // Keep only last 100 results
        }
        this.monitoringResults.set(siteId, results);

        // Update site status
        site.status = isHealthy ? 'online' : 'offline';
        site.lastChecked = startTime;

        return result;
    }

    async performBulkHealthChecks(siteIds: string[]) {
        const promises = siteIds.map(siteId => this.performHealthCheck(siteId));
        return Promise.all(promises);
    }

    async performSequentialHealthChecks(siteIds: string[]) {
        const results: any[] = [];
        for (const siteId of siteIds) {
            results.push(await this.performHealthCheck(siteId));
        }
        return results;
    }

    getMonitoringHistory(siteId: string, limit: number = 50) {
        const results = this.monitoringResults.get(siteId) || [];
        return results.slice(-limit).reverse();
    }

    getAggregatedStats(siteId: string) {
        const results = this.monitoringResults.get(siteId) || [];
        if (results.length === 0) {
            return null;
        }

        const responseTimes = results.map(r => r.responseTime);
        const uptime = results.filter(r => r.isHealthy).length / results.length * 100;

        return {
            totalChecks: results.length,
            uptime,
            avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
            minResponseTime: Math.min(...responseTimes),
            maxResponseTime: Math.max(...responseTimes),
            lastCheck: results.at(-1),
            statusCodes: this.getStatusCodeDistribution(results)
        };
    }

    private getStatusCodeDistribution(results: any[]) {
        const distribution: Record<number, number> = {};
        for (const result of results) {
            distribution[result.statusCode] = (distribution[result.statusCode] || 0) + 1;
        }
        return distribution;
    }

    getAllSiteStatuses() {
        const statuses: any[] = [];
        for (const [siteId, site] of this.sites) {
            statuses.push({
                siteId,
                name: site.name,
                url: site.url,
                status: site.status,
                lastChecked: site.lastChecked,
                isActive: site.isActive
            });
        }
        return statuses;
    }

    getActiveSites() {
        return Array.from(this.sites.values()).filter(site => site.isActive);
    }

    getOfflineSites() {
        return Array.from(this.sites.values()).filter(site => site.status === 'offline');
    }

    async scheduleMonitoring(siteIds: string[]) {
        const schedules: any[] = [];
        for (const siteId of siteIds) {
            const site = this.sites.get(siteId);
            if (site && site.isActive) {
                schedules.push({
                    siteId,
                    nextCheck: Date.now() + site.checkInterval,
                    interval: site.checkInterval
                });
            }
        }
        return schedules;
    }

    async detectStatusChanges(previousStatuses: Map<string, string>) {
        const changes: any[] = [];
        for (const [siteId, site] of this.sites) {
            const previousStatus = previousStatuses.get(siteId);
            if (previousStatus && previousStatus !== site.status) {
                changes.push({
                    siteId,
                    previousStatus,
                    currentStatus: site.status,
                    timestamp: Date.now()
                });
            }
        }
        return changes;
    }

    async generateAlerts(alertRules: any[]) {
        const alerts: any[] = [];
        const now = Date.now();

        for (const rule of alertRules) {
            for (const [siteId, site] of this.sites) {
                const results = this.monitoringResults.get(siteId) || [];
                const recentResults = results.filter(r => now - r.timestamp < rule.timeWindow);

                if (this.evaluateAlertRule(rule, recentResults, site)) {
                    alerts.push({
                        siteId,
                        rule: rule.name,
                        severity: rule.severity,
                        message: `Alert triggered for ${site.name}: ${rule.message}`,
                        timestamp: now
                    });
                }
            }
        }

        return alerts;
    }

    private evaluateAlertRule(rule: any, results: any[], site: any) {
        switch (rule.type) {
            case 'uptime': {
                const uptime = results.filter(r => r.isHealthy).length / results.length * 100;
                return uptime < rule.threshold;
            }
            case 'response_time': {
                const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
                return avgResponseTime > rule.threshold;
            }
            case 'consecutive_failures': {
                const recentFailures = results.slice(-rule.threshold).every(r => !r.isHealthy);
                return recentFailures && results.length >= rule.threshold;
            }
            default: {
                return false;
            }
        }
    }

    async performMaintenanceCheck() {
        let processed = 0;
        
        // Clean old monitoring results
        for (const [siteId, results] of this.monitoringResults) {
            const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days
            const filtered = results.filter(r => r.timestamp > cutoff);
            this.monitoringResults.set(siteId, filtered);
            processed++;
        }

        return { processed, timestamp: Date.now() };
    }

    getSystemHealth() {
        const activeSites = this.getActiveSites().length;
        const offlineSites = this.getOfflineSites().length;
        const totalChecks = Array.from(this.monitoringResults.values())
            .reduce((sum, results) => sum + results.length, 0);

        return {
            totalSites: this.sites.size,
            activeSites,
            offlineSites,
            totalChecks,
            systemUptime: (activeSites / (activeSites + offlineSites)) * 100 || 0
        };
    }
}

describe("Site Monitoring Performance", () => {
    let monitor: MockSiteMonitor;

    bench("site monitor initialization", () => {
        monitor = new MockSiteMonitor();
    }, { warmupIterations: 10, iterations: 500 });

    bench("single site health check", async () => {
        monitor = new MockSiteMonitor();
        await monitor.performHealthCheck('site-0');
    }, { warmupIterations: 5, iterations: 1000 });

    bench("bulk health checks (10 sites)", async () => {
        monitor = new MockSiteMonitor();
        const siteIds = Array.from({ length: 10 }, (_, i) => `site-${i}`);
        await monitor.performBulkHealthChecks(siteIds);
    }, { warmupIterations: 2, iterations: 200 });

    bench("bulk health checks (50 sites)", async () => {
        monitor = new MockSiteMonitor();
        const siteIds = Array.from({ length: 50 }, (_, i) => `site-${i}`);
        await monitor.performBulkHealthChecks(siteIds);
    }, { warmupIterations: 2, iterations: 50 });

    bench("sequential health checks (10 sites)", async () => {
        monitor = new MockSiteMonitor();
        const siteIds = Array.from({ length: 10 }, (_, i) => `site-${i}`);
        await monitor.performSequentialHealthChecks(siteIds);
    }, { warmupIterations: 2, iterations: 100 });

    bench("get monitoring history", () => {
        monitor = new MockSiteMonitor();
        // Populate some history
        for (let i = 0; i < 5; i++) {
            monitor.performHealthCheck('site-0');
        }
        monitor.getMonitoringHistory('site-0', 50);
    }, { warmupIterations: 5, iterations: 2000 });

    bench("get aggregated stats", async () => {
        monitor = new MockSiteMonitor();
        // Populate some history
        for (let i = 0; i < 10; i++) {
            await monitor.performHealthCheck('site-0');
        }
        monitor.getAggregatedStats('site-0');
    }, { warmupIterations: 2, iterations: 1000 });

    bench("get all site statuses", () => {
        monitor = new MockSiteMonitor();
        monitor.getAllSiteStatuses();
    }, { warmupIterations: 5, iterations: 2000 });

    bench("get active sites", () => {
        monitor = new MockSiteMonitor();
        monitor.getActiveSites();
    }, { warmupIterations: 5, iterations: 5000 });

    bench("get offline sites", () => {
        monitor = new MockSiteMonitor();
        monitor.getOfflineSites();
    }, { warmupIterations: 5, iterations: 5000 });

    bench("schedule monitoring", async () => {
        monitor = new MockSiteMonitor();
        const siteIds = Array.from({ length: 20 }, (_, i) => `site-${i}`);
        await monitor.scheduleMonitoring(siteIds);
    }, { warmupIterations: 5, iterations: 1000 });

    bench("detect status changes", async () => {
        monitor = new MockSiteMonitor();
        const previousStatuses = new Map([
            ['site-0', 'online'],
            ['site-1', 'offline'],
            ['site-2', 'online']
        ]);
        await monitor.detectStatusChanges(previousStatuses);
    }, { warmupIterations: 5, iterations: 2000 });

    bench("generate alerts", async () => {
        monitor = new MockSiteMonitor();
        
        // Populate some monitoring data
        for (let i = 0; i < 5; i++) {
            await monitor.performHealthCheck('site-0');
            await monitor.performHealthCheck('site-1');
        }

        const alertRules = [
            { name: 'uptime_alert', type: 'uptime', threshold: 90, timeWindow: 300_000, severity: 'warning', message: 'Low uptime detected' },
            { name: 'response_time_alert', type: 'response_time', threshold: 1000, timeWindow: 300_000, severity: 'critical', message: 'High response time' }
        ];
        
        await monitor.generateAlerts(alertRules);
    }, { warmupIterations: 2, iterations: 500 });

    bench("maintenance check", async () => {
        monitor = new MockSiteMonitor();
        await monitor.performMaintenanceCheck();
    }, { warmupIterations: 5, iterations: 1000 });

    bench("get system health", () => {
        monitor = new MockSiteMonitor();
        monitor.getSystemHealth();
    }, { warmupIterations: 5, iterations: 5000 });

    bench("complex monitoring workflow", async () => {
        monitor = new MockSiteMonitor();
        
        // Perform health checks
        const siteIds = Array.from({ length: 5 }, (_, i) => `site-${i}`);
        await monitor.performBulkHealthChecks(siteIds);
        
        // Get aggregated stats
        for (const siteId of siteIds) {
            monitor.getAggregatedStats(siteId);
        }
        
        // Check system health
        monitor.getSystemHealth();
        
        // Schedule next monitoring
        await monitor.scheduleMonitoring(siteIds);
    }, { warmupIterations: 2, iterations: 200 });
});
