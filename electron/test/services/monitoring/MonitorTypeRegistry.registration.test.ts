import type { Monitor, MonitorType } from "@shared/types";

import { MONITOR_STATUS } from "@shared/types";
import { describe, expect, it } from "vitest";

import {
    getAllMonitorTypeConfigs,
    getMonitorServiceFactory,
    getMonitorTypeConfig,
    getRegisteredMonitorTypes,
    isValidMonitorType,
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
    };
}

describe("MonitorTypeRegistry registration behavior", () => {
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
    });

    it("invokes UI formatters and service factories for every monitor type", () => {
        const configs = getAllMonitorTypeConfigs();
        const remaining = new Set<string>(Object.keys(monitorFixtures));

        for (const config of configs) {
            if (remaining.has(config.type)) {
                remaining.delete(config.type);
            }

            const monitor = buildMonitor(config.type);
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

    it("redacts URL secrets from monitor title suffixes", () => {
        const urlCases: {
            readonly expected: string;
            readonly monitor: Monitor;
            readonly type: MonitorType;
        }[] = [
            {
                expected: " (https://example.com/status)",
                monitor: {
                    ...buildMonitor("http"),
                    url: "https://example.com/status?token=secret#fragment",
                },
                type: "http",
            },
            {
                expected: " (https://origin.example.com/status)",
                monitor: {
                    ...buildMonitor("cdn-edge-consistency"),
                    baselineUrl:
                        "https://origin.example.com/status?access_token=secret#fragment",
                },
                type: "cdn-edge-consistency",
            },
            {
                expected: " (https://primary.example.com/status)",
                monitor: {
                    ...buildMonitor("replication"),
                    primaryStatusUrl:
                        "https://primary.example.com/status?refresh_token=secret#fragment",
                },
                type: "replication",
            },
            {
                expected: " (https://replica.example.com/status)",
                monitor: {
                    ...buildMonitor("replication"),
                    primaryStatusUrl: undefined,
                    replicaStatusUrl:
                        "https://replica.example.com/status?refresh_token=secret#fragment",
                },
                type: "replication",
            },
            {
                expected: " (https://heartbeat.example.com/status)",
                monitor: {
                    ...buildMonitor("server-heartbeat"),
                    url: "https://heartbeat.example.com/status?api_key=secret#fragment",
                },
                type: "server-heartbeat",
            },
            {
                expected: " (wss://socket.example.com/live)",
                monitor: {
                    ...buildMonitor("websocket-keepalive"),
                    url: "wss://socket.example.com/live?token=secret#fragment",
                },
                type: "websocket-keepalive",
            },
        ];

        for (const { expected, monitor, type } of urlCases) {
            const suffix =
                getMonitorTypeConfig(type)?.uiConfig?.formatTitleSuffix?.(
                    monitor
                );

            expect(suffix).toBe(expected);
            expect(suffix).not.toContain("secret");
            expect(suffix).not.toContain("token");
            expect(suffix).not.toContain("fragment");
        }
    });
});
