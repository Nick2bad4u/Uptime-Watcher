import type { Monitor, MonitorType } from "@shared/types";
import { MONITOR_STATUS } from "@shared/types";
import { describe, expect, it } from "vitest";

import {
    createMonitorWithTypeGuards,
    getAllMonitorTypeConfigs,
    getMonitorServiceFactory,
    getMonitorTypeConfig,
    getRegisteredMonitorTypes,
    isValidMonitorType,
    isValidMonitorTypeGuard,
} from "../../../services/monitoring/MonitorTypeRegistry";

const monitorFixtures: Record<MonitorType, Partial<Monitor>> = {
    "cdn-edge-consistency": {
        baselineUrl: "https://origin.example.com",
        edgeLocations: "https://edge.example.com",
    },
    dns: {
        host: "example.com",
        recordType: "A",
    },
    http: {
        url: "https://example.com",
    },
    "http-header": {
        headerName: "x-powered-by",
        expectedHeaderValue: "Example",
        url: "https://headers.example.com",
    },
    "http-json": {
        jsonPath: "data.status",
        expectedJsonValue: "ok",
        url: "https://json.example.com",
    },
    "http-keyword": {
        bodyKeyword: "status: ok",
        url: "https://keyword.example.com",
    },
    "http-latency": {
        maxResponseTime: 1500,
        url: "https://latency.example.com",
    },
    "http-status": {
        expectedStatusCode: 200,
        url: "https://status.example.com",
    },
    ping: {
        host: "ping.example.com",
    },
    port: {
        host: "port.example.com",
        port: 443,
    },
    replication: {
        maxReplicationLagSeconds: 60,
        primaryStatusUrl: "https://primary.example.com/status",
        replicaStatusUrl: "https://replica.example.com/status",
        replicationTimestampField: "data.lastApplied",
    },
    "server-heartbeat": {
        heartbeatExpectedStatus: "ok",
        heartbeatMaxDriftSeconds: 30,
        heartbeatStatusField: "data.status",
        heartbeatTimestampField: "data.timestamp",
        url: "https://heartbeat.example.com",
    },
    ssl: {
        certificateWarningDays: 30,
        host: "ssl.example.com",
        port: 443,
    },
    "websocket-keepalive": {
        maxPongDelayMs: 1500,
        url: "wss://socket.example.com",
    },
} as const;

type FixtureMap = typeof monitorFixtures;

type FixtureKey = keyof FixtureMap;

function buildMonitor<TType extends FixtureKey>(type: TType): Monitor {
    const overrides = monitorFixtures[type];

    return {
        checkInterval: 60_000,
        history: [],
        id: `${type}-monitor`,
        monitoring: true,
        responseTime: -1,
        retryAttempts: 3,
        status: MONITOR_STATUS.PENDING,
        timeout: 10_000,
        type,
        ...overrides,
    } as Monitor;
}

describe("MonitorTypeRegistry runtime coverage", () => {
    it("exposes registered monitor metadata", () => {
        const registers = getRegisteredMonitorTypes();
        expect(registers.length).toBeGreaterThan(0);
        expect(registers).toContain("http");

        const httpConfig = getMonitorTypeConfig("http");
        expect(httpConfig?.displayName).toBe("HTTP (Website/API)");

        const factory = getMonitorServiceFactory("http");
        expect(factory).toBeTypeOf("function");
        expect(factory?.()).toBeTruthy();

        expect(getMonitorServiceFactory("non-existent")).toBeUndefined();
        expect(isValidMonitorType("http")).toBeTruthy();
        expect(isValidMonitorType("non-existent")).toBeFalsy();
        expect(isValidMonitorTypeGuard("http")).toBeTruthy();
        expect(isValidMonitorTypeGuard(123)).toBeFalsy();
    });

    it("creates monitors with sensible defaults and respects validation", () => {
        const created = createMonitorWithTypeGuards("http", {
            id: "http-monitor",
            url: "https://example.com",
        });

        expect(created.success).toBeTruthy();
        expect(created.errors).toStrictEqual([]);
        expect(created.monitor).toMatchObject({
            history: [],
            monitoring: true,
            responseTime: -1,
            retryAttempts: 3,
            status: MONITOR_STATUS.PENDING,
            timeout: 10_000,
            type: "http",
            url: "https://example.com",
        });

        const invalid = createMonitorWithTypeGuards("non-existent", {});

        expect(invalid.success).toBeFalsy();
        expect(invalid.errors[0]).toMatch(/Invalid monitor type/);
    });

    it("invokes UI formatters and service factories for every monitor type", () => {
        const configs = getAllMonitorTypeConfigs();
        const remaining = new Set<string>(Object.keys(monitorFixtures));

        for (const config of configs) {
            if (remaining.has(config.type)) {
                remaining.delete(config.type);
            }

            const monitor = buildMonitor(config.type as FixtureKey);
            const serviceInstance = config.serviceFactory();
            expect(serviceInstance).toBeTruthy();

            config.uiConfig?.detailFormats?.historyDetail?.("200");
            config.uiConfig?.formatDetail?.("detail");

            if (config.uiConfig?.formatTitleSuffix) {
                const suffix = config.uiConfig.formatTitleSuffix(monitor);
                expect(suffix).toBeTypeOf("string");

                const fallbackType: FixtureKey =
                    config.type === "http" ? "dns" : "http";
                const fallbackMonitor = buildMonitor(fallbackType);
                const fallbackSuffix = config.uiConfig.formatTitleSuffix({
                    ...fallbackMonitor,
                    type: fallbackMonitor.type,
                });
                expect(fallbackSuffix).toBeTypeOf("string");
            }
        }

        expect(remaining.size).toBe(0);
    });
});
