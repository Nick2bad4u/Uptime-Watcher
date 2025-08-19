/**
 * Data Analytics Service Performance Benchmarks
 *
 * @file Performance benchmarks for data analytics, metrics calculation, and reporting.
 *
 * @author GitHub Copilot
 * @since 2025-08-19
 * @category Performance
 * @benchmark Services-Analytics
 * @tags ["performance", "services", "analytics", "metrics", "reporting"]
 */

import { bench, describe } from "vitest";

interface MetricPoint {
    timestamp: Date;
    value: number;
    metadata?: Record<string, any>;
}

interface TimeSeries {
    name: string;
    points: MetricPoint[];
    unit: string;
    tags: Record<string, string>;
}

interface AggregatedMetric {
    name: string;
    value: number;
    unit: string;
    aggregationType: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'percentile';
    timeRange: {
        start: Date;
        end: Date;
    };
    tags: Record<string, string>;
}

interface AnalyticsQuery {
    metricNames: string[];
    timeRange: {
        start: Date;
        end: Date;
    };
    aggregation: {
        type: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'percentile';
        interval?: number; // in milliseconds
        percentile?: number; // for percentile aggregation
    };
    filters?: Record<string, any>;
    groupBy?: string[];
}

interface AnalyticsResult {
    metrics: AggregatedMetric[];
    totalPoints: number;
    executionTime: number;
    queryInfo: {
        cached: boolean;
        pointsScanned: number;
        filters: Record<string, any>;
    };
}

interface Dashboard {
    id: string;
    name: string;
    widgets: DashboardWidget[];
    refreshInterval: number;
    lastUpdated: Date;
}

interface DashboardWidget {
    id: string;
    type: 'chart' | 'metric' | 'table' | 'status';
    title: string;
    query: AnalyticsQuery;
    configuration: Record<string, any>;
}

interface AlertRule {
    id: string;
    name: string;
    metricName: string;
    condition: {
        operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
        threshold: number;
        duration: number; // in milliseconds
    };
    isActive: boolean;
    lastTriggered?: Date;
}

interface Alert {
    id: string;
    ruleId: string;
    triggeredAt: Date;
    resolvedAt?: Date;
    value: number;
    threshold: number;
    status: 'active' | 'resolved';
}

class MockMetricsStorage {
    private timeSeries: Map<string, TimeSeries> = new Map();
    private indexByTime: Map<number, string[]> = new Map(); // timestamp -> metric names
    private indexByTags: Map<string, Set<string>> = new Map(); // tag -> metric names

    async store(name: string, points: MetricPoint[], unit: string = 'count', tags: Record<string, string> = {}): Promise<void> {
        let series = this.timeSeries.get(name);
        
        if (!series) {
            series = {
                name,
                points: [],
                unit,
                tags
            };
            this.timeSeries.set(name, series);
        }
        
        // Add points and update indexes
        for (const point of points) {
            series.points.push(point);
            
            // Update time index
            const timeKey = Math.floor(point.timestamp.getTime() / 60000) * 60000; // Round to minute
            if (!this.indexByTime.has(timeKey)) {
                this.indexByTime.set(timeKey, []);
            }
            this.indexByTime.get(timeKey)!.push(name);
            
            // Update tag index
            for (const [tagKey, tagValue] of Object.entries(tags)) {
                const tagIndex = `${tagKey}:${tagValue}`;
                if (!this.indexByTags.has(tagIndex)) {
                    this.indexByTags.set(tagIndex, new Set());
                }
                this.indexByTags.get(tagIndex)!.add(name);
            }
        }
        
        // Sort points by timestamp
        series.points.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    }

    async query(
        metricNames: string[], 
        timeRange: { start: Date; end: Date }, 
        filters?: Record<string, any>
    ): Promise<TimeSeries[]> {
        const results: TimeSeries[] = [];
        
        for (const name of metricNames) {
            const series = this.timeSeries.get(name);
            if (!series) continue;
            
            // Filter by time range
            const filteredPoints = series.points.filter(point => 
                point.timestamp >= timeRange.start && point.timestamp <= timeRange.end
            );
            
            // Apply additional filters
            let finalPoints = filteredPoints;
            if (filters) {
                finalPoints = filteredPoints.filter(point => {
                    if (!point.metadata) return true;
                    
                    for (const [key, value] of Object.entries(filters)) {
                        if (point.metadata[key] !== value) {
                            return false;
                        }
                    }
                    return true;
                });
            }
            
            results.push({
                name,
                points: finalPoints,
                unit: series.unit,
                tags: series.tags
            });
        }
        
        return results;
    }

    async aggregate(series: TimeSeries[], aggregationType: string, interval?: number): Promise<AggregatedMetric[]> {
        const results: AggregatedMetric[] = [];
        
        for (const s of series) {
            if (s.points.length === 0) continue;
            
            let value: number;
            const values = s.points.map(p => p.value);
            
            switch (aggregationType) {
                case 'sum':
                    value = values.reduce((sum, val) => sum + val, 0);
                    break;
                case 'avg':
                    value = values.reduce((sum, val) => sum + val, 0) / values.length;
                    break;
                case 'min':
                    value = Math.min(...values);
                    break;
                case 'max':
                    value = Math.max(...values);
                    break;
                case 'count':
                    value = values.length;
                    break;
                case 'percentile':
                    // Default to 95th percentile
                    const sorted = [...values].sort((a, b) => a - b);
                    const index = Math.ceil(sorted.length * 0.95) - 1;
                    value = sorted[index] || 0;
                    break;
                default:
                    value = 0;
            }
            
            results.push({
                name: s.name,
                value,
                unit: s.unit,
                aggregationType: aggregationType as any,
                timeRange: {
                    start: s.points[0]?.timestamp || new Date(),
                    end: s.points[s.points.length - 1]?.timestamp || new Date()
                },
                tags: s.tags
            });
        }
        
        return results;
    }

    getStats(): any {
        const totalSeries = this.timeSeries.size;
        const totalPoints = Array.from(this.timeSeries.values())
            .reduce((sum, series) => sum + series.points.length, 0);
        
        return {
            totalSeries,
            totalPoints,
            timeIndexSize: this.indexByTime.size,
            tagIndexSize: this.indexByTags.size
        };
    }

    clear(): void {
        this.timeSeries.clear();
        this.indexByTime.clear();
        this.indexByTags.clear();
    }
}

class MockAlertEngine {
    private rules: Map<string, AlertRule> = new Map();
    private alerts: Map<string, Alert> = new Map();
    private nextAlertId = 1;

    addRule(rule: AlertRule): void {
        this.rules.set(rule.id, rule);
    }

    async evaluateRules(metrics: AggregatedMetric[]): Promise<Alert[]> {
        const newAlerts: Alert[] = [];
        
        for (const metric of metrics) {
            const rulesForMetric = Array.from(this.rules.values())
                .filter(rule => rule.metricName === metric.name && rule.isActive);
            
            for (const rule of rulesForMetric) {
                const triggered = this.evaluateCondition(metric.value, rule.condition);
                
                if (triggered) {
                    const alert: Alert = {
                        id: `alert-${this.nextAlertId++}`,
                        ruleId: rule.id,
                        triggeredAt: new Date(),
                        value: metric.value,
                        threshold: rule.condition.threshold,
                        status: 'active'
                    };
                    
                    this.alerts.set(alert.id, alert);
                    newAlerts.push(alert);
                    
                    // Update rule last triggered
                    rule.lastTriggered = new Date();
                }
            }
        }
        
        return newAlerts;
    }

    private evaluateCondition(value: number, condition: AlertRule['condition']): boolean {
        switch (condition.operator) {
            case '>':
                return value > condition.threshold;
            case '<':
                return value < condition.threshold;
            case '>=':
                return value >= condition.threshold;
            case '<=':
                return value <= condition.threshold;
            case '==':
                return value === condition.threshold;
            case '!=':
                return value !== condition.threshold;
            default:
                return false;
        }
    }

    getActiveAlerts(): Alert[] {
        return Array.from(this.alerts.values())
            .filter(alert => alert.status === 'active');
    }

    resolveAlert(alertId: string): void {
        const alert = this.alerts.get(alertId);
        if (alert) {
            alert.status = 'resolved';
            alert.resolvedAt = new Date();
        }
    }

    clear(): void {
        this.rules.clear();
        this.alerts.clear();
        this.nextAlertId = 1;
    }
}

class MockQueryCache {
    private cache: Map<string, { result: AnalyticsResult; expiry: Date }> = new Map();
    private cacheTimeout = 300000; // 5 minutes

    get(query: AnalyticsQuery): AnalyticsResult | null {
        const key = this.generateKey(query);
        const cached = this.cache.get(key);
        
        if (cached && cached.expiry > new Date()) {
            return { ...cached.result, queryInfo: { ...cached.result.queryInfo, cached: true } };
        }
        
        if (cached) {
            this.cache.delete(key);
        }
        
        return null;
    }

    set(query: AnalyticsQuery, result: AnalyticsResult): void {
        const key = this.generateKey(query);
        this.cache.set(key, {
            result: { ...result },
            expiry: new Date(Date.now() + this.cacheTimeout)
        });
    }

    private generateKey(query: AnalyticsQuery): string {
        return JSON.stringify({
            metrics: query.metricNames.sort(),
            timeRange: query.timeRange,
            aggregation: query.aggregation,
            filters: query.filters,
            groupBy: query.groupBy?.sort()
        });
    }

    clear(): void {
        this.cache.clear();
    }

    getStats(): any {
        return {
            cacheSize: this.cache.size,
            entries: Array.from(this.cache.keys())
        };
    }
}

class MockAnalyticsService {
    private storage: MockMetricsStorage;
    private alertEngine: MockAlertEngine;
    private cache: MockQueryCache;
    private dashboards: Map<string, Dashboard> = new Map();

    constructor() {
        this.storage = new MockMetricsStorage();
        this.alertEngine = new MockAlertEngine();
        this.cache = new MockQueryCache();
    }

    async recordMetric(name: string, value: number, timestamp?: Date, metadata?: Record<string, any>): Promise<void> {
        const point: MetricPoint = {
            timestamp: timestamp || new Date(),
            value,
            metadata
        };
        
        await this.storage.store(name, [point]);
    }

    async recordBatchMetrics(metrics: Array<{
        name: string;
        value: number;
        timestamp?: Date;
        metadata?: Record<string, any>;
    }>): Promise<void> {
        const batchMap = new Map<string, MetricPoint[]>();
        
        for (const metric of metrics) {
            if (!batchMap.has(metric.name)) {
                batchMap.set(metric.name, []);
            }
            
            batchMap.get(metric.name)!.push({
                timestamp: metric.timestamp || new Date(),
                value: metric.value,
                metadata: metric.metadata
            });
        }
        
        for (const [name, points] of batchMap) {
            await this.storage.store(name, points);
        }
    }

    async executeQuery(query: AnalyticsQuery): Promise<AnalyticsResult> {
        const startTime = Date.now();
        
        // Check cache first
        const cached = this.cache.get(query);
        if (cached) {
            return cached;
        }
        
        // Execute query
        const timeSeries = await this.storage.query(
            query.metricNames,
            query.timeRange,
            query.filters
        );
        
        const totalPoints = timeSeries.reduce((sum, series) => sum + series.points.length, 0);
        
        // Apply aggregation
        const aggregatedMetrics = await this.storage.aggregate(
            timeSeries,
            query.aggregation.type,
            query.aggregation.interval
        );
        
        const executionTime = Date.now() - startTime;
        
        const result: AnalyticsResult = {
            metrics: aggregatedMetrics,
            totalPoints,
            executionTime,
            queryInfo: {
                cached: false,
                pointsScanned: totalPoints,
                filters: query.filters || {}
            }
        };
        
        // Cache result
        this.cache.set(query, result);
        
        return result;
    }

    async calculateUptime(siteId: string, timeRange: { start: Date; end: Date }): Promise<number> {
        const query: AnalyticsQuery = {
            metricNames: [`site.${siteId}.status`],
            timeRange,
            aggregation: { type: 'avg' },
            filters: { siteId }
        };
        
        const result = await this.executeQuery(query);
        
        if (result.metrics.length === 0) return 0;
        
        // Assuming status metric: 1 = up, 0 = down
        return result.metrics[0].value * 100; // Convert to percentage
    }

    async calculateResponseTimeStats(siteId: string, timeRange: { start: Date; end: Date }): Promise<{
        avg: number;
        min: number;
        max: number;
        p95: number;
        p99: number;
    }> {
        const metricName = `site.${siteId}.response_time`;
        
        const queries = [
            { type: 'avg' as const },
            { type: 'min' as const },
            { type: 'max' as const },
            { type: 'percentile' as const, percentile: 95 },
            { type: 'percentile' as const, percentile: 99 }
        ];
        
        const results = await Promise.all(
            queries.map(agg => this.executeQuery({
                metricNames: [metricName],
                timeRange,
                aggregation: agg,
                filters: { siteId }
            }))
        );
        
        return {
            avg: results[0].metrics[0]?.value || 0,
            min: results[1].metrics[0]?.value || 0,
            max: results[2].metrics[0]?.value || 0,
            p95: results[3].metrics[0]?.value || 0,
            p99: results[4].metrics[0]?.value || 0
        };
    }

    async generateDashboard(dashboardId: string): Promise<Dashboard> {
        const dashboard = this.dashboards.get(dashboardId);
        if (!dashboard) {
            throw new Error(`Dashboard ${dashboardId} not found`);
        }
        
        // Update all widgets
        for (const widget of dashboard.widgets) {
            try {
                await this.executeQuery(widget.query);
            } catch (error) {
                console.error(`Failed to update widget ${widget.id}:`, error);
            }
        }
        
        dashboard.lastUpdated = new Date();
        return { ...dashboard };
    }

    async runAlertEvaluation(): Promise<Alert[]> {
        // Get recent metrics for evaluation
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        
        // Query all metrics from the last 5 minutes
        const allSeries = await this.storage.query(
            [], // Get all metrics
            { start: fiveMinutesAgo, end: now }
        );
        
        const aggregatedMetrics = await this.storage.aggregate(allSeries, 'avg');
        
        return await this.alertEngine.evaluateRules(aggregatedMetrics);
    }

    async generateReport(timeRange: { start: Date; end: Date }, metricNames: string[]): Promise<{
        summary: Record<string, any>;
        metrics: AggregatedMetric[];
        trends: Record<string, number>;
    }> {
        const query: AnalyticsQuery = {
            metricNames,
            timeRange,
            aggregation: { type: 'avg' }
        };
        
        const result = await this.executeQuery(query);
        
        // Calculate trends (simple day-over-day comparison)
        const trends: Record<string, number> = {};
        for (const metric of result.metrics) {
            // Simulate trend calculation
            trends[metric.name] = Math.random() * 20 - 10; // -10% to +10%
        }
        
        const summary = {
            totalMetrics: result.metrics.length,
            totalDataPoints: result.totalPoints,
            timeRange,
            generatedAt: new Date()
        };
        
        return {
            summary,
            metrics: result.metrics,
            trends
        };
    }

    addAlertRule(rule: AlertRule): void {
        this.alertEngine.addRule(rule);
    }

    getActiveAlerts(): Alert[] {
        return this.alertEngine.getActiveAlerts();
    }

    createDashboard(dashboard: Dashboard): void {
        this.dashboards.set(dashboard.id, dashboard);
    }

    getStorageStats(): any {
        return this.storage.getStats();
    }

    getCacheStats(): any {
        return this.cache.getStats();
    }

    clearCache(): void {
        this.cache.clear();
    }

    reset(): void {
        this.storage.clear();
        this.alertEngine.clear();
        this.cache.clear();
        this.dashboards.clear();
    }
}

// Helper functions for creating test data
function generateMetricData(metricName: string, count: number, timeRangeMinutes: number = 60): Array<{
    name: string;
    value: number;
    timestamp: Date;
    metadata?: Record<string, any>;
}> {
    const now = new Date();
    const data: Array<{
        name: string;
        value: number;
        timestamp: Date;
        metadata?: Record<string, any>;
    }> = [];
    
    for (let i = 0; i < count; i++) {
        const timestamp = new Date(now.getTime() - (timeRangeMinutes - i) * 60 * 1000);
        data.push({
            name: metricName,
            value: Math.random() * 1000 + 100,
            timestamp,
            metadata: {
                siteId: `site-${Math.floor(i / 10) + 1}`,
                region: i % 3 === 0 ? 'us-east' : i % 3 === 1 ? 'us-west' : 'eu-west'
            }
        });
    }
    
    return data;
}

function createTestDashboard(): Dashboard {
    return {
        id: 'main-dashboard',
        name: 'Main Monitoring Dashboard',
        refreshInterval: 30000,
        lastUpdated: new Date(),
        widgets: [
            {
                id: 'uptime-widget',
                type: 'metric',
                title: 'Overall Uptime',
                query: {
                    metricNames: ['uptime.percentage'],
                    timeRange: {
                        start: new Date(Date.now() - 24 * 60 * 60 * 1000),
                        end: new Date()
                    },
                    aggregation: { type: 'avg' }
                },
                configuration: { format: 'percentage' }
            },
            {
                id: 'response-time-widget',
                type: 'chart',
                title: 'Response Time Trend',
                query: {
                    metricNames: ['response_time.avg'],
                    timeRange: {
                        start: new Date(Date.now() - 60 * 60 * 1000),
                        end: new Date()
                    },
                    aggregation: { type: 'avg', interval: 300000 }
                },
                configuration: { chartType: 'line' }
            }
        ]
    };
}

describe("Analytics Service Performance", () => {
    let service: MockAnalyticsService;

    bench("service initialization", () => {
        service = new MockAnalyticsService();
    }, { warmupIterations: 10, iterations: 1000 });

    bench("record single metric", () => {
        service = new MockAnalyticsService();
        service.recordMetric('test.metric', 123.45);
    }, { warmupIterations: 10, iterations: 5000 });

    bench("record batch metrics", () => {
        service = new MockAnalyticsService();
        const metrics = generateMetricData('batch.metric', 50, 30);
        service.recordBatchMetrics(metrics);
    }, { warmupIterations: 10, iterations: 1000 });

    bench("simple query execution", () => {
        service = new MockAnalyticsService();
        const metrics = generateMetricData('query.metric', 100, 60);
        
        service.recordBatchMetrics(metrics).then(() => {
            const query: AnalyticsQuery = {
                metricNames: ['query.metric'],
                timeRange: {
                    start: new Date(Date.now() - 60 * 60 * 1000),
                    end: new Date()
                },
                aggregation: { type: 'avg' }
            };
            
            service.executeQuery(query);
        });
    }, { warmupIterations: 10, iterations: 2000 });

    bench("complex aggregation query", () => {
        service = new MockAnalyticsService();
        const metrics = generateMetricData('complex.metric', 200, 120);
        
        service.recordBatchMetrics(metrics).then(() => {
            const query: AnalyticsQuery = {
                metricNames: ['complex.metric'],
                timeRange: {
                    start: new Date(Date.now() - 120 * 60 * 1000),
                    end: new Date()
                },
                aggregation: { type: 'percentile', percentile: 95, interval: 600000 },
                filters: { region: 'us-east' },
                groupBy: ['siteId']
            };
            
            service.executeQuery(query);
        });
    }, { warmupIterations: 10, iterations: 1000 });

    bench("cached query execution", () => {
        service = new MockAnalyticsService();
        const metrics = generateMetricData('cached.metric', 100, 60);
        
        service.recordBatchMetrics(metrics).then(() => {
            const query: AnalyticsQuery = {
                metricNames: ['cached.metric'],
                timeRange: {
                    start: new Date(Date.now() - 60 * 60 * 1000),
                    end: new Date()
                },
                aggregation: { type: 'avg' }
            };
            
            // First query populates cache
            service.executeQuery(query).then(() => {
                // Second query uses cache
                service.executeQuery(query);
            });
        });
    }, { warmupIterations: 10, iterations: 3000 });

    bench("uptime calculation", () => {
        service = new MockAnalyticsService();
        const statusMetrics = Array.from({ length: 60 }, (_, i) => ({
            name: 'site.test-site.status',
            value: Math.random() > 0.1 ? 1 : 0, // 90% uptime
            timestamp: new Date(Date.now() - (60 - i) * 60 * 1000),
            metadata: { siteId: 'test-site' }
        }));
        
        service.recordBatchMetrics(statusMetrics).then(() => {
            service.calculateUptime('test-site', {
                start: new Date(Date.now() - 60 * 60 * 1000),
                end: new Date()
            });
        });
    }, { warmupIterations: 10, iterations: 2000 });

    bench("response time statistics", () => {
        service = new MockAnalyticsService();
        const responseTimeMetrics = Array.from({ length: 100 }, (_, i) => ({
            name: 'site.test-site.response_time',
            value: Math.random() * 500 + 50, // 50-550ms
            timestamp: new Date(Date.now() - (100 - i) * 30 * 1000), // Every 30 seconds
            metadata: { siteId: 'test-site' }
        }));
        
        service.recordBatchMetrics(responseTimeMetrics).then(() => {
            service.calculateResponseTimeStats('test-site', {
                start: new Date(Date.now() - 50 * 60 * 1000),
                end: new Date()
            });
        });
    }, { warmupIterations: 10, iterations: 1500 });

    bench("dashboard generation", () => {
        service = new MockAnalyticsService();
        const dashboard = createTestDashboard();
        service.createDashboard(dashboard);
        
        // Create some test data
        const metrics = [
            ...generateMetricData('uptime.percentage', 30, 24 * 60),
            ...generateMetricData('response_time.avg', 50, 60)
        ];
        
        service.recordBatchMetrics(metrics).then(() => {
            service.generateDashboard(dashboard.id);
        });
    }, { warmupIterations: 10, iterations: 800 });

    bench("alert rule evaluation", () => {
        service = new MockAnalyticsService();
        
        // Add alert rules
        service.addAlertRule({
            id: 'high-response-time',
            name: 'High Response Time',
            metricName: 'response_time.avg',
            condition: { operator: '>', threshold: 500, duration: 300000 },
            isActive: true
        });
        
        service.addAlertRule({
            id: 'low-uptime',
            name: 'Low Uptime',
            metricName: 'uptime.percentage',
            condition: { operator: '<', threshold: 95, duration: 600000 },
            isActive: true
        });
        
        // Create metrics that trigger alerts
        const alertMetrics = [
            {
                name: 'response_time.avg',
                value: 750, // Above threshold
                timestamp: new Date(),
                metadata: { siteId: 'site-1' }
            },
            {
                name: 'uptime.percentage',
                value: 92, // Below threshold
                timestamp: new Date(),
                metadata: { siteId: 'site-2' }
            }
        ];
        
        service.recordBatchMetrics(alertMetrics).then(() => {
            service.runAlertEvaluation();
        });
    }, { warmupIterations: 10, iterations: 1200 });

    bench("report generation", () => {
        service = new MockAnalyticsService();
        
        const reportMetrics = [
            ...generateMetricData('sites.total', 30, 24 * 60),
            ...generateMetricData('incidents.count', 30, 24 * 60),
            ...generateMetricData('uptime.overall', 30, 24 * 60)
        ];
        
        service.recordBatchMetrics(reportMetrics).then(() => {
            service.generateReport(
                {
                    start: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    end: new Date()
                },
                ['sites.total', 'incidents.count', 'uptime.overall']
            );
        });
    }, { warmupIterations: 10, iterations: 600 });

    bench("multi-metric aggregation", () => {
        service = new MockAnalyticsService();
        
        const multiMetrics = [
            ...generateMetricData('cpu.usage', 60, 60),
            ...generateMetricData('memory.usage', 60, 60),
            ...generateMetricData('disk.usage', 60, 60),
            ...generateMetricData('network.throughput', 60, 60)
        ];
        
        service.recordBatchMetrics(multiMetrics).then(() => {
            const query: AnalyticsQuery = {
                metricNames: ['cpu.usage', 'memory.usage', 'disk.usage', 'network.throughput'],
                timeRange: {
                    start: new Date(Date.now() - 60 * 60 * 1000),
                    end: new Date()
                },
                aggregation: { type: 'avg', interval: 300000 }
            };
            
            service.executeQuery(query);
        });
    }, { warmupIterations: 10, iterations: 800 });

    bench("time-based filtering", () => {
        service = new MockAnalyticsService();
        
        const timeMetrics = generateMetricData('time.metric', 200, 200);
        
        service.recordBatchMetrics(timeMetrics).then(() => {
            const query: AnalyticsQuery = {
                metricNames: ['time.metric'],
                timeRange: {
                    start: new Date(Date.now() - 30 * 60 * 1000), // Last 30 minutes only
                    end: new Date()
                },
                aggregation: { type: 'sum' },
                filters: { region: 'us-east' }
            };
            
            service.executeQuery(query);
        });
    }, { warmupIterations: 10, iterations: 1500 });

    bench("large dataset processing", () => {
        service = new MockAnalyticsService();
        
        const largeDataset = generateMetricData('large.dataset', 1000, 24 * 60);
        
        service.recordBatchMetrics(largeDataset).then(() => {
            const query: AnalyticsQuery = {
                metricNames: ['large.dataset'],
                timeRange: {
                    start: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    end: new Date()
                },
                aggregation: { type: 'percentile', percentile: 99 }
            };
            
            service.executeQuery(query);
        });
    }, { warmupIterations: 5, iterations: 200 });

    bench("concurrent queries", () => {
        service = new MockAnalyticsService();
        
        const concurrentMetrics = generateMetricData('concurrent.metric', 150, 90);
        
        service.recordBatchMetrics(concurrentMetrics).then(() => {
            const queries = Array.from({ length: 5 }, (_, i) => ({
                metricNames: ['concurrent.metric'],
                timeRange: {
                    start: new Date(Date.now() - (i + 1) * 30 * 60 * 1000),
                    end: new Date(Date.now() - i * 30 * 60 * 1000)
                },
                aggregation: { type: 'avg' as const }
            }));
            
            Promise.all(queries.map(query => service.executeQuery(query)));
        });
    }, { warmupIterations: 5, iterations: 300 });

    bench("storage statistics", () => {
        service = new MockAnalyticsService();
        
        const statsMetrics = generateMetricData('stats.metric', 100, 120);
        
        service.recordBatchMetrics(statsMetrics).then(() => {
            service.getStorageStats();
        });
    }, { warmupIterations: 10, iterations: 2000 });

    bench("cache management", () => {
        service = new MockAnalyticsService();
        
        const cacheMetrics = generateMetricData('cache.metric', 80, 60);
        
        service.recordBatchMetrics(cacheMetrics).then(() => {
            const query: AnalyticsQuery = {
                metricNames: ['cache.metric'],
                timeRange: {
                    start: new Date(Date.now() - 60 * 60 * 1000),
                    end: new Date()
                },
                aggregation: { type: 'avg' }
            };
            
            // Execute query to populate cache
            service.executeQuery(query).then(() => {
                // Get cache stats
                service.getCacheStats();
                // Clear cache
                service.clearCache();
            });
        });
    }, { warmupIterations: 10, iterations: 1000 });

    bench("service reset", () => {
        service = new MockAnalyticsService();
        
        const resetMetrics = generateMetricData('reset.metric', 50, 60);
        const dashboard = createTestDashboard();
        
        service.recordBatchMetrics(resetMetrics).then(() => {
            service.createDashboard(dashboard);
            service.addAlertRule({
                id: 'test-rule',
                name: 'Test Rule',
                metricName: 'reset.metric',
                condition: { operator: '>', threshold: 100, duration: 60000 },
                isActive: true
            });
            
            service.reset();
        });
    }, { warmupIterations: 10, iterations: 800 });
});
