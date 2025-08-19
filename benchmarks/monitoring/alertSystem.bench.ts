/**
 * Alert System Performance Benchmarks
 *
 * @file Performance benchmarks for alert system operations including
 *   alert generation, processing, and notification delivery.
 *
 * @author GitHub Copilot
 * @since 2025-08-19
 * @category Performance
 * @benchmark Monitoring-AlertSystem
 * @tags ["performance", "monitoring", "alerts", "notifications", "rules"]
 */

import { bench, describe } from "vitest";

interface AlertRule {
    id: string;
    name: string;
    type: 'threshold' | 'anomaly' | 'status_change';
    conditions: Record<string, any>;
    severity: 'low' | 'medium' | 'high' | 'critical';
    isEnabled: boolean;
}

interface Alert {
    id: string;
    ruleId: string;
    monitorId: string;
    severity: string;
    message: string;
    timestamp: number;
    status: 'pending' | 'sent' | 'acknowledged' | 'resolved';
}

class MockAlertSystem {
    private rules = new Map<string, AlertRule>();
    private alerts = new Map<string, Alert>();
    private monitorData = new Map<string, any[]>();

    constructor() {
        this.initializeTestData();
    }

    private initializeTestData() {
        // Create test rules
        for (let i = 0; i < 50; i++) {
            const rule: AlertRule = {
                id: `rule-${i}`,
                name: `Alert Rule ${i}`,
                type: ['threshold', 'anomaly', 'status_change'][i % 3] as any,
                conditions: { threshold: Math.random() * 1000, timeWindow: 300_000 },
                severity: ['low', 'medium', 'high', 'critical'][i % 4] as any,
                isEnabled: Math.random() > 0.1
            };
            this.rules.set(rule.id, rule);
        }

        // Create test monitor data
        for (let i = 0; i < 100; i++) {
            const monitorId = `monitor-${i}`;
            const data = Array.from({ length: 1000 }, (_, j) => ({
                timestamp: Date.now() - j * 60_000,
                responseTime: Math.random() * 2000,
                status: Math.random() > 0.1 ? 'online' : 'offline',
                success: Math.random() > 0.05
            }));
            this.monitorData.set(monitorId, data);
        }
    }

    async evaluateRules(monitorId: string): Promise<Alert[]> {
        const alerts: Alert[] = [];
        const monitorData = this.monitorData.get(monitorId) || [];
        
        for (const [ruleId, rule] of this.rules) {
            if (!rule.isEnabled) continue;
            
            const alertResult = await this.evaluateRule(rule, monitorData, monitorId);
            if (alertResult) {
                alerts.push(alertResult);
            }
        }
        
        return alerts;
    }

    private async evaluateRule(rule: AlertRule, data: any[], monitorId: string): Promise<Alert | null> {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 5));
        
        const shouldTrigger = Math.random() > 0.9; // 10% chance to trigger
        
        if (!shouldTrigger) return null;
        
        const alert: Alert = {
            id: `alert-${Date.now()}-${Math.random()}`,
            ruleId: rule.id,
            monitorId,
            severity: rule.severity,
            message: `Alert triggered: ${rule.name}`,
            timestamp: Date.now(),
            status: 'pending'
        };
        
        this.alerts.set(alert.id, alert);
        return alert;
    }

    async processAlerts(alerts: Alert[]): Promise<void> {
        for (const alert of alerts) {
            await this.processAlert(alert);
        }
    }

    private async processAlert(alert: Alert): Promise<void> {
        // Simulate alert processing
        await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
        
        alert.status = 'sent';
        this.alerts.set(alert.id, alert);
    }

    getActiveAlerts(): Alert[] {
        return Array.from(this.alerts.values())
            .filter(alert => alert.status !== 'resolved');
    }

    getAlertsByMonitor(monitorId: string): Alert[] {
        return Array.from(this.alerts.values())
            .filter(alert => alert.monitorId === monitorId);
    }

    async acknowledgeAlert(alertId: string): Promise<void> {
        const alert = this.alerts.get(alertId);
        if (alert) {
            alert.status = 'acknowledged';
            this.alerts.set(alertId, alert);
        }
    }

    async resolveAlert(alertId: string): Promise<void> {
        const alert = this.alerts.get(alertId);
        if (alert) {
            alert.status = 'resolved';
            this.alerts.set(alertId, alert);
        }
    }
}

describe("Alert System Performance", () => {
    let alertSystem: MockAlertSystem;

    bench("alert system initialization", () => {
        alertSystem = new MockAlertSystem();
    }, { warmupIterations: 5, iterations: 200 });

    bench("evaluate rules for single monitor", async () => {
        alertSystem = new MockAlertSystem();
        await alertSystem.evaluateRules('monitor-0');
    }, { warmupIterations: 5, iterations: 500 });

    bench("evaluate rules for multiple monitors", async () => {
        alertSystem = new MockAlertSystem();
        const monitorIds = ['monitor-0', 'monitor-1', 'monitor-2', 'monitor-3', 'monitor-4'];
        for (const monitorId of monitorIds) {
            await alertSystem.evaluateRules(monitorId);
        }
    }, { warmupIterations: 2, iterations: 100 });

    bench("get active alerts", async () => {
        alertSystem = new MockAlertSystem();
        await alertSystem.evaluateRules('monitor-0');
        alertSystem.getActiveAlerts();
    }, { warmupIterations: 5, iterations: 2000 });

    bench("get alerts by monitor", async () => {
        alertSystem = new MockAlertSystem();
        await alertSystem.evaluateRules('monitor-0');
        alertSystem.getAlertsByMonitor('monitor-0');
    }, { warmupIterations: 5, iterations: 2000 });

    bench("acknowledge alert", async () => {
        alertSystem = new MockAlertSystem();
        const alerts = await alertSystem.evaluateRules('monitor-0');
        if (alerts.length > 0) {
            await alertSystem.acknowledgeAlert(alerts[0].id);
        }
    }, { warmupIterations: 5, iterations: 1000 });

    bench("resolve alert", async () => {
        alertSystem = new MockAlertSystem();
        const alerts = await alertSystem.evaluateRules('monitor-0');
        if (alerts.length > 0) {
            await alertSystem.resolveAlert(alerts[0].id);
        }
    }, { warmupIterations: 5, iterations: 1000 });
});
