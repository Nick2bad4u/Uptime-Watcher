/**
 * Monitor-type display identifier behavior tests.
 *
 * @remarks
 * Supplements the broader fallback utility suites with focused assertions that
 * exercise every monitor-type-specific generator declared in
 * `src/utils/fallbacks.ts`. The existing suites already validate the most
 * common monitors (HTTP, Port, Ping, CDN, DNS, Replication). These tests cover
 * less frequently used monitor types such as `http-json`, `http-header`, and
 * `websocket-keepalive`, then add a Fast-Check property to ensure fallback
 * behavior remains stable across all URL-based monitor types.
 */

import { test } from "@fast-check/vitest";
import { type Monitor, MONITOR_STATUS } from "@shared/types";
import * as fc from "fast-check";
import { describe, expect, it } from "vitest";

import { getMonitorDisplayIdentifier } from "../../utils/fallbacks";

/**
 * Build a complete {@link Monitor} object with sane defaults for tests.
 *
 * @param type - Monitor type being validated.
 * @param overrides - Optional field overrides for scenario-specific data.
 *
 * @returns Fully-populated monitor fixture that can be safely mutated by
 *   individual tests without duplicating boilerplate.
 */
function createMonitorFixture(
    type: Monitor["type"],
    overrides: Partial<Monitor> = {}
): Monitor {
    return {
        activeOperations: [],
        baselineUrl: undefined,
        bodyKeyword: undefined,
        certificateWarningDays: undefined,
        checkInterval: 60_000,
        edgeLocations: undefined,
        expectedHeaderValue: undefined,
        expectedJsonValue: undefined,
        expectedStatusCode: undefined,
        expectedValue: undefined,
        headerName: undefined,
        heartbeatExpectedStatus: undefined,
        heartbeatMaxDriftSeconds: undefined,
        heartbeatStatusField: undefined,
        heartbeatTimestampField: undefined,
        history: [],
        host: undefined,
        id: `${type}-monitor`,
        jsonPath: undefined,
        lastChecked: undefined,
        maxPongDelayMs: undefined,
        maxReplicationLagSeconds: undefined,
        maxResponseTime: undefined,
        monitoring: true,
        port: undefined,
        primaryStatusUrl: undefined,
        recordType: undefined,
        replicaStatusUrl: undefined,
        replicationTimestampField: undefined,
        responseTime: -1,
        retryAttempts: 3,
        status: MONITOR_STATUS.PENDING,
        timeout: 10_000,
        type,
        url: undefined,
        ...overrides,
    };
}

describe("getMonitorDisplayIdentifier monitor type behavior", () => {
    const fallbackLabel = "Site Fallback";

    interface MonitorTypeCase {
        readonly description: string;
        readonly expected: string;
        readonly monitor: Monitor;
    }

    const monitorTypeCases = [
        {
            description: "http-header monitors reuse the request URL",
            expected: "https://headers.example.com/inspect",
            monitor: createMonitorFixture("http-header", {
                expectedHeaderValue: "MISS",
                headerName: "x-cache",
                url: "https://headers.example.com/inspect",
            }),
        },
        {
            description: "http-json monitors expose the JSON endpoint URL",
            expected: "https://json.example.com/health",
            monitor: createMonitorFixture("http-json", {
                expectedJsonValue: "ok",
                jsonPath: "$.status",
                url: "https://json.example.com/health",
            }),
        },
        {
            description: "http-keyword monitors surface their target URL",
            expected: "https://keyword.example.com/check",
            monitor: createMonitorFixture("http-keyword", {
                bodyKeyword: "success",
                url: "https://keyword.example.com/check",
            }),
        },
        {
            description: "http-latency monitors keep the observed URL",
            expected: "https://latency.example.com/api",
            monitor: createMonitorFixture("http-latency", {
                maxResponseTime: 1500,
                url: "https://latency.example.com/api",
            }),
        },
        {
            description: "http-status monitors return their status URL",
            expected: "https://status.example.com/ready",
            monitor: createMonitorFixture("http-status", {
                expectedStatusCode: 204,
                url: "https://status.example.com/ready",
            }),
        },
        {
            description:
                "server-heartbeat monitors rely on their heartbeat URL",
            expected: "https://heartbeat.example.com/metrics",
            monitor: createMonitorFixture("server-heartbeat", {
                heartbeatExpectedStatus: "running",
                heartbeatMaxDriftSeconds: 30,
                heartbeatStatusField: "data.status",
                heartbeatTimestampField: "data.timestamp",
                url: "https://heartbeat.example.com/metrics",
            }),
        },
        {
            description: "SSL monitors stitch together host and port",
            expected: "secure.example.com:443",
            monitor: createMonitorFixture("ssl", {
                host: "secure.example.com",
                port: 443,
            }),
        },
        {
            description: "WebSocket keepalive monitors emit their endpoint URL",
            expected: "wss://socket.example.com/keepalive",
            monitor: createMonitorFixture("websocket-keepalive", {
                maxPongDelayMs: 5000,
                url: "wss://socket.example.com/keepalive",
            }),
        },
    ] as const satisfies readonly MonitorTypeCase[];

    it.each(monitorTypeCases)("$description", ({ expected, monitor }) => {
        expect(getMonitorDisplayIdentifier(monitor, fallbackLabel)).toBe(
            expected
        );
    });

    const urlBasedMonitorTypes = [
        "http-header",
        "http-json",
        "http-keyword",
        "http-latency",
        "http-status",
        "server-heartbeat",
        "websocket-keepalive",
    ] as const satisfies readonly Monitor["type"][];

    test.prop([
        fc.constantFrom(...urlBasedMonitorTypes),
        fc
            .string({ maxLength: 40, minLength: 3 })
            .filter((label) => label.trim().length > 0),
    ])(
        "returns fallback label when URL data is unavailable",
        (monitorType, siteIdentifier) => {
            const monitorWithoutUrl = createMonitorFixture(monitorType, {
                url: undefined,
            });

            expect(
                getMonitorDisplayIdentifier(monitorWithoutUrl, siteIdentifier)
            ).toBe(siteIdentifier);
        }
    );
});
