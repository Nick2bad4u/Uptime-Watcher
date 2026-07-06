import type { Monitor, Site } from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";

import { describe, expect, it, vi } from "vitest";

import type { StatusUpdateMonitorCheckResult } from "../../../services/monitoring/MonitorStatusUpdateService";

import { performCorrelatedCheck } from "../../../services/monitoring/enhancedMonitorChecker/performCorrelatedCheck";

describe(performCorrelatedCheck, () => {
    it("redacts URL-shaped identifiers before interpolating start logs", async () => {
        const info = vi.fn();
        const logger = {
            debug: vi.fn(),
            error: vi.fn(),
            info,
            warn: vi.fn(),
        } as unknown as Logger;
        const monitor = {
            checkInterval: 30_000,
            history: [],
            id: "https://user:pass@monitor.example.com/check?access_token=monitor-secret#monitor-frag",
            monitoring: true,
            responseTime: 0,
            retryAttempts: 3,
            status: "pending",
            timeout: 10_000,
            type: "http",
            url: "https://example.com",
        } satisfies Monitor;
        const site = {
            identifier:
                "https://user:pass@site.example.com/path?refresh_token=site-secret#site-frag",
            monitoring: true,
            monitors: [monitor],
            name: "Sensitive Site",
        } satisfies Site;
        const checkResult = {
            monitorId: monitor.id,
            operationId: "operation-1",
            responseTime: 25,
            status: "up",
            timestamp: new Date("2026-01-01T00:00:00.000Z"),
        } satisfies StatusUpdateMonitorCheckResult;

        await performCorrelatedCheck({
            cleanupOperation: vi.fn(),
            executeMonitorCheck: vi.fn().mockResolvedValue(checkResult),
            handleSuccessfulCheck: vi.fn().mockResolvedValue(undefined),
            logger,
            monitor,
            monitorId: monitor.id,
            saveHistoryEntry: vi.fn().mockResolvedValue(undefined),
            setupOperationCorrelation: vi.fn().mockResolvedValue({
                operationId: "operation-1",
                signal: new AbortController().signal,
            }),
            site,
            updateMonitorStatus: vi.fn().mockResolvedValue(false),
        });

        const serializedInfoLogs = JSON.stringify(info.mock.calls);
        expect(serializedInfoLogs).toContain(
            "https://monitor.example.com/check"
        );
        expect(serializedInfoLogs).toContain("https://site.example.com/path");
        expect(serializedInfoLogs).not.toContain("access_token");
        expect(serializedInfoLogs).not.toContain("refresh_token");
        expect(serializedInfoLogs).not.toContain("monitor-secret");
        expect(serializedInfoLogs).not.toContain("site-secret");
        expect(serializedInfoLogs).not.toContain("pass");
        expect(serializedInfoLogs).not.toContain("frag");
    });
});
