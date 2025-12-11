/**
 * Alert System Performance Benchmarks using real NotificationService.
 *
 * @remarks
 * Performance benchmarks for alert system operations including notification
 * delivery using the real NotificationService implementation. Tests real-world
 * performance of monitor status change notifications.
 *
 * @file Performance benchmarks for monitoring alert operations
 *
 * @author GitHub Copilot
 *
 * @since 2025-01-18
 *
 * @category Performance
 *
 * @benchmark Monitoring-AlertSystem
 *
 * @tags ["performance", "monitoring", "alerts", "notifications", "real-service"]
 */

import { bench, describe, beforeAll, vi } from "vitest";

import type { Site, MonitorStatus } from "../../shared/types";

import {
    NotificationService,
    type NotificationConfig,
} from "../../electron/services/notifications/NotificationService";

// Mock Electron's Notification API for benchmarking
vi.mock("electron", () => ({
    Notification: {
        isSupported: () => true,
    },
}));

// Mock logger to avoid file I/O during benchmarks
vi.mock("../../electron/utils/logger", () => ({
    logger: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
    },
}));

interface AlertRule {
    id: string;
    name: string;
    type: "threshold" | "anomaly" | "status_change";
    conditions: Record<string, any>;
    severity: "low" | "medium" | "high" | "critical";
    isEnabled: boolean;
}

interface Alert {
    id: string;
    ruleId: string;
    monitorId: string;
    severity: string;
    message: string;
    timestamp: number;
    status: "pending" | "sent" | "acknowledged" | "resolved";
}

// Real notification service instances for benchmarking
const downAlertsService = new NotificationService();
downAlertsService.updateConfig({
    showDownAlerts: true,
    showUpAlerts: false,
});

const upAlertsService = new NotificationService();
upAlertsService.updateConfig({
    showDownAlerts: false,
    showUpAlerts: true,
});

const fullAlertsService = new NotificationService();
fullAlertsService.updateConfig({
    showDownAlerts: true,
    showUpAlerts: true,
});

// Mock monitor data generators
function createMockSite(id: string, monitorCount: number): Site {
    return {
        identifier: id,
        name: `Test Site ${id}`,
        monitoring: true,
        monitors: Array.from({ length: monitorCount }, (_, i) => ({
            id: `monitor-${id}-${i}`,
            type: [
                "http",
                "dns",
                "port",
                "ping",
            ][i % 4] as any,
            status: "pending" as MonitorStatus,
            monitoring: true,
            responseTime: -1,
            history: [],
            checkInterval: 60_000,
            retryAttempts: 3,
            timeout: 5000,
            // Type-specific properties
            ...(i % 4 === 0 ? { url: `https://example${i}.com` } : {}),
            ...(i % 4 === 1 ? { host: `host${i}.com`, recordType: "A" } : {}),
            ...(i % 4 === 2 ? { host: `host${i}.com`, port: 80 + i } : {}),
            ...(i % 4 === 3 ? { host: `host${i}.com` } : {}),
        })) as Site["monitors"],
    };
}

class EnhancedAlertSystem {
    private rules = new Map<string, AlertRule>();
    private alerts = new Map<string, Alert>();
    private monitorData = new Map<string, any[]>();
    private readonly notificationService: NotificationService;

    constructor(notificationService: NotificationService) {
        this.notificationService = notificationService;
        this.initializeTestData();
    }

    private initializeTestData() {
        // Create optimized test rules for benchmarking
        for (let i = 0; i < 20; i++) {
            const rule: AlertRule = {
                id: `rule-${i}`,
                name: `Alert Rule ${i}`,
                type: [
                    "threshold",
                    "anomaly",
                    "status_change",
                ][i % 3] as any,
                conditions: {
                    threshold: Math.random() * 1000,
                    timeWindow: 300_000,
                },
                severity: [
                    "low",
                    "medium",
                    "high",
                    "critical",
                ][i % 4] as any,
                isEnabled: Math.random() > 0.1,
            };
            this.rules.set(rule.id, rule);
        }

        // Create optimized monitor data for benchmarking
        for (let i = 0; i < 30; i++) {
            const monitorId = `monitor-${i}`;
            const data = Array.from({ length: 100 }, (_, j) => ({
                timestamp: Date.now() - j * 60_000,
                responseTime: Math.random() * 2000,
                status: Math.random() > 0.1 ? "online" : "offline",
                success: Math.random() > 0.05,
            }));
            this.monitorData.set(monitorId, data);
        }
    }

    async evaluateRules(site: Site, monitorId: string): Promise<Alert[]> {
        const alerts: Alert[] = [];
        const monitorData = this.monitorData.get(monitorId) || [];

        for (const [ruleId, rule] of this.rules) {
            if (!rule.isEnabled) continue;

            const alertResult = await this.evaluateRule(
                rule,
                monitorData,
                site,
                monitorId
            );
            if (alertResult) {
                alerts.push(alertResult);
            }
        }

        return alerts;
    }

    private async evaluateRule(
        rule: AlertRule,
        data: any[],
        site: Site,
        monitorId: string
    ): Promise<Alert | null> {
        // Optimized evaluation for benchmarking
        const shouldTrigger = Math.random() > 0.9; // 10% chance to trigger

        if (!shouldTrigger) return null;

        const alert: Alert = {
            id: `alert-${Date.now()}-${Math.random()}`,
            ruleId: rule.id,
            monitorId,
            severity: rule.severity,
            message: `Alert triggered: ${rule.name}`,
            timestamp: Date.now(),
            status: "pending",
        };

        this.alerts.set(alert.id, alert);

        // Trigger real notification based on alert type
        if (rule.type === "status_change") {
            if (alert.severity === "critical") {
                this.notificationService.notifyMonitorDown(site, monitorId);
            } else {
                this.notificationService.notifyMonitorUp(site, monitorId);
            }
        }

        return alert;
    }

    async processAlerts(alerts: Alert[]): Promise<void> {
        for (const alert of alerts) {
            await this.processAlert(alert);
        }
    }

    private async processAlert(alert: Alert): Promise<void> {
        // Optimized processing for benchmarking
        alert.status = "sent";
        this.alerts.set(alert.id, alert);
    }

    getActiveAlerts(): Alert[] {
        return Array.from(this.alerts.values()).filter(
            (alert) => alert.status !== "resolved"
        );
    }

    getAlertsByMonitor(monitorId: string): Alert[] {
        return Array.from(this.alerts.values()).filter(
            (alert) => alert.monitorId === monitorId
        );
    }

    async acknowledgeAlert(alertId: string): Promise<void> {
        const alert = this.alerts.get(alertId);
        if (alert) {
            alert.status = "acknowledged";
            this.alerts.set(alertId, alert);
        }
    }

    async resolveAlert(alertId: string): Promise<void> {
        const alert = this.alerts.get(alertId);
        if (alert) {
            alert.status = "resolved";
            this.alerts.set(alertId, alert);
        }
    }
}
describe("Real Alert System Performance", () => {
    let alertSystem: EnhancedAlertSystem;
    let testSites: Site[];

    beforeAll(() => {
        // Pre-generate test sites to avoid affecting benchmark timing
        testSites = Array.from({ length: 10 }, (_, i) =>
            createMockSite(`site-${i}`, 5));
    });

    bench(
        "alert system initialization with real NotificationService",
        () => {
            alertSystem = new EnhancedAlertSystem(downAlertsService);
        },
        { warmupIterations: 5, iterations: 200 }
    );

    bench(
        "evaluate rules for single monitor with real notifications",
        async () => {
            alertSystem = new EnhancedAlertSystem(fullAlertsService);
            const site = testSites[0];
            await alertSystem.evaluateRules(site, site.monitors[0].id);
        },
        { warmupIterations: 5, iterations: 100 }
    );

    bench(
        "evaluate rules for multiple monitors with real notifications",
        async () => {
            alertSystem = new EnhancedAlertSystem(fullAlertsService);
            const site = testSites[0];
            for (const monitor of site.monitors.slice(0, 5)) {
                await alertSystem.evaluateRules(site, monitor.id);
            }
        },
        { warmupIterations: 2, iterations: 50 }
    );

    bench(
        "real notification service - down alerts only",
        () => {
            const site = testSites[0];
            for (const monitor of site.monitors.slice(0, 3)) {
                downAlertsService.notifyMonitorDown(site, monitor.id);
            }
        },
        { warmupIterations: 5, iterations: 500 }
    );

    bench(
        "real notification service - up alerts only",
        () => {
            const site = testSites[0];
            for (const monitor of site.monitors.slice(0, 3)) {
                upAlertsService.notifyMonitorUp(site, monitor.id);
            }
        },
        { warmupIterations: 5, iterations: 500 }
    );

    bench(
        "real notification service - mixed alerts",
        () => {
            const site = testSites[0];
            for (let i = 0; i < 5; i++) {
                const monitor = site.monitors[i];
                if (i % 2 === 0) {
                    fullAlertsService.notifyMonitorDown(site, monitor.id);
                } else {
                    fullAlertsService.notifyMonitorUp(site, monitor.id);
                }
            }
        },
        { warmupIterations: 5, iterations: 300 }
    );

    bench(
        "get active alerts",
        async () => {
            alertSystem = new EnhancedAlertSystem(downAlertsService);
            const site = testSites[0];
            await alertSystem.evaluateRules(site, site.monitors[0].id);
            alertSystem.getActiveAlerts();
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "get alerts by monitor",
        async () => {
            alertSystem = new EnhancedAlertSystem(downAlertsService);
            const site = testSites[0];
            await alertSystem.evaluateRules(site, site.monitors[0].id);
            alertSystem.getAlertsByMonitor(site.monitors[0].id);
        },
        { warmupIterations: 5, iterations: 1000 }
    );

    bench(
        "acknowledge alert",
        async () => {
            alertSystem = new EnhancedAlertSystem(downAlertsService);
            const site = testSites[0];
            const alerts = await alertSystem.evaluateRules(
                site,
                site.monitors[0].id
            );
            if (alerts.length > 0) {
                await alertSystem.acknowledgeAlert(alerts[0].id);
            }
        },
        { warmupIterations: 5, iterations: 500 }
    );

    bench(
        "resolve alert",
        async () => {
            alertSystem = new EnhancedAlertSystem(downAlertsService);
            const site = testSites[0];
            const alerts = await alertSystem.evaluateRules(
                site,
                site.monitors[0].id
            );
            if (alerts.length > 0) {
                await alertSystem.resolveAlert(alerts[0].id);
            }
        },
        { warmupIterations: 5, iterations: 500 }
    );

    bench(
        "notification service configuration updates",
        () => {
            const service = new NotificationService();

            // Benchmark different configuration updates
            service.updateConfig({ showDownAlerts: true, showUpAlerts: false });
            service.updateConfig({ showDownAlerts: false, showUpAlerts: true });
            service.updateConfig({ showDownAlerts: true, showUpAlerts: true });
            service.updateConfig({
                showDownAlerts: false,
                showUpAlerts: false,
            });
        },
        { warmupIterations: 5, iterations: 2000 }
    );

    bench(
        "notification service support check",
        () => {
            const service = new NotificationService();
            for (let i = 0; i < 100; i++) {
                service.isSupported();
            }
        },
        { warmupIterations: 5, iterations: 1000 }
    );
});
