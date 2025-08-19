/**
 * Dashboard Data Provider Performance Benchmarks
 *
 * @file Performance benchmarks for dashboard data provider operations.
 *
 * @author GitHub Copilot
 * @since 2025-08-19
 * @category Performance
 * @benchmark Monitoring-DashboardDataProvider
 * @tags ["performance", "monitoring", "dashboard", "data-provider"]
 */

import { bench, describe } from "vitest";

class MockDashboardDataProvider {
    private sites: any[] = [];
    private monitors: any[] = [];
    private history: any[] = [];

    constructor() {
        this.initializeData();
    }

    private initializeData() {
        // Initialize test data
        this.sites = Array.from({ length: 100 }, (_, i) => ({
            id: `site-${i}`,
            name: `Site ${i}`,
            status: ['online', 'offline', 'degraded'][i % 3],
            lastChecked: Date.now() - Math.random() * 3600000
        }));

        this.monitors = Array.from({ length: 300 }, (_, i) => ({
            id: `monitor-${i}`,
            siteId: `site-${i % 100}`,
            type: ['http', 'ping', 'port'][i % 3],
            status: ['online', 'offline'][i % 2],
            responseTime: Math.random() * 1000
        }));

        this.history = Array.from({ length: 10000 }, (_, i) => ({
            id: `history-${i}`,
            monitorId: `monitor-${i % 300}`,
            timestamp: Date.now() - i * 60000,
            status: ['online', 'offline'][i % 2],
            responseTime: Math.random() * 1000
        }));
    }

    getDashboardSummary(): any {
        const onlineSites = this.sites.filter(s => s.status === 'online').length;
        const totalSites = this.sites.length;
        const avgResponseTime = this.monitors.reduce((sum, m) => sum + m.responseTime, 0) / this.monitors.length;

        return {
            totalSites,
            onlineSites,
            offlineSites: totalSites - onlineSites,
            uptime: (onlineSites / totalSites) * 100,
            avgResponseTime,
            totalMonitors: this.monitors.length
        };
    }

    getSiteStatuses(): any[] {
        return this.sites.map(site => ({
            ...site,
            monitors: this.monitors.filter(m => m.siteId === site.id).length
        }));
    }

    getRecentActivity(limit: number = 50): any[] {
        return this.history
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    getResponseTimeData(period: number = 24 * 60 * 60 * 1000): any[] {
        const cutoff = Date.now() - period;
        return this.history
            .filter(h => h.timestamp >= cutoff)
            .map(h => ({ timestamp: h.timestamp, responseTime: h.responseTime }));
    }

    getUptimeData(siteId: string, period: number = 7 * 24 * 60 * 60 * 1000): any {
        const cutoff = Date.now() - period;
        const siteMonitors = this.monitors.filter(m => m.siteId === siteId);
        const relevantHistory = this.history.filter(h => 
            siteMonitors.some(m => m.id === h.monitorId) && h.timestamp >= cutoff
        );
        
        const uptime = relevantHistory.filter(h => h.status === 'online').length / relevantHistory.length * 100;
        return { siteId, uptime, dataPoints: relevantHistory.length };
    }

    getAlertsData(): any[] {
        return this.sites
            .filter(s => s.status === 'offline')
            .map(s => ({
                siteId: s.id,
                siteName: s.name,
                status: s.status,
                duration: Date.now() - s.lastChecked
            }));
    }
}

describe("Dashboard Data Provider Performance", () => {
    let provider: MockDashboardDataProvider;

    bench("provider initialization", () => {
        provider = new MockDashboardDataProvider();
    }, { warmupIterations: 5, iterations: 100 });

    bench("get dashboard summary", () => {
        provider = new MockDashboardDataProvider();
        provider.getDashboardSummary();
    }, { warmupIterations: 5, iterations: 1000 });

    bench("get site statuses", () => {
        provider = new MockDashboardDataProvider();
        provider.getSiteStatuses();
    }, { warmupIterations: 5, iterations: 500 });

    bench("get recent activity", () => {
        provider = new MockDashboardDataProvider();
        provider.getRecentActivity(100);
    }, { warmupIterations: 5, iterations: 1000 });

    bench("get response time data", () => {
        provider = new MockDashboardDataProvider();
        provider.getResponseTimeData(24 * 60 * 60 * 1000);
    }, { warmupIterations: 5, iterations: 500 });

    bench("get uptime data", () => {
        provider = new MockDashboardDataProvider();
        provider.getUptimeData('site-0', 7 * 24 * 60 * 60 * 1000);
    }, { warmupIterations: 5, iterations: 1000 });

    bench("get alerts data", () => {
        provider = new MockDashboardDataProvider();
        provider.getAlertsData();
    }, { warmupIterations: 5, iterations: 2000 });
});
