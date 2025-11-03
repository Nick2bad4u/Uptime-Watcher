/**
 * Fast-check coverage for MonitoringStatusDisplay component.
 */

import type { Monitor, StatusHistory } from "@shared/types";

import { render, screen } from "@testing-library/react";
import { describe, expect } from "vitest";
import { fc, test as fcTest } from "@fast-check/vitest";

import { MonitoringStatusDisplay } from "../../../components/SiteDetails/MonitoringStatusDisplay";
import {
    getMonitorDisplayIdentifier,
    getMonitorTypeDisplayLabel,
} from "../../../utils/fallbacks";
import { formatTitleSuffix } from "../../../utils/monitorTitleFormatters";

const THOUSAND = 1000;
const MAX_INTERVAL = 600 * THOUSAND;
const MAX_TIMEOUT = 120 * THOUSAND;
const MAX_PORT = 65_535;

const identifierArbitrary = fc
    .string({ maxLength: 16, minLength: 3 })
    .filter((value) => /^[a-zA-Z0-9-]+$/u.test(value));

const monitorStatusArbitrary = fc.constantFrom(
    "up",
    "down",
    "degraded",
    "pending",
    "paused"
);

const BASE_TIMESTAMP = 1600 * 1000 * 1000 * 1000;
const TIMESTAMP_RANGE = 300 * 1000 * 1000 * 1000;

const statusHistoryArbitrary = fc.array(
    fc.record({
        details: fc.option(fc.string({ maxLength: 30 }), { nil: undefined }),
        responseTime: fc.integer({ max: 5000, min: 0 }),
        status: fc.constantFrom<StatusHistory["status"]>(
            "up",
            "down",
            "degraded"
        ),
        timestamp: fc
            .nat({ max: TIMESTAMP_RANGE })
            .map((offset) => BASE_TIMESTAMP + offset),
    }) as fc.Arbitrary<StatusHistory>,
    { maxLength: 4, minLength: 1 }
);

const monitorTypeArbitrary = fc.constantFrom(
    "http",
    "http-status",
    "port",
    "ssl",
    "ping",
    "replication",
    "dns",
    "cdn-edge-consistency",
    "websocket-keepalive"
);

const monitorArbitrary = fc
    .record({
        baselineUrl: fc.option(fc.webUrl(), { nil: undefined }),
        checkInterval: fc.integer({ max: MAX_INTERVAL, min: THOUSAND }),
        history: statusHistoryArbitrary,
        host: fc.option(identifierArbitrary, { nil: undefined }),
        id: identifierArbitrary,
        monitoring: fc.boolean(),
        port: fc.option(fc.integer({ max: MAX_PORT, min: 1 }), {
            nil: undefined,
        }),
        primaryStatusUrl: fc.option(fc.webUrl(), { nil: undefined }),
        recordType: fc.option(fc.constantFrom("A", "AAAA", "CNAME"), {
            nil: undefined,
        }),
        replicaStatusUrl: fc.option(fc.webUrl(), { nil: undefined }),
        responseTime: fc.integer({ max: 5000, min: 0 }),
        retryAttempts: fc.integer({ max: 5, min: 0 }),
        status: monitorStatusArbitrary,
        timeout: fc.integer({ max: MAX_TIMEOUT, min: THOUSAND }),
        type: monitorTypeArbitrary,
        url: fc.option(fc.webUrl(), { nil: undefined }),
    })
    .map((raw) => raw as Monitor);

describe("MonitoringStatusDisplay fast-check coverage", () => {
    it("renders empty state when no monitors are provided", () => {
        const { unmount } = render(<MonitoringStatusDisplay monitors={[]} />);

        expect(
            screen.getByText("No monitors configured", { exact: true })
        ).toBeInTheDocument();

        unmount();
    });

    fcTest.prop([
        fc.uniqueArray(monitorArbitrary, {
            maxLength: 4,
            minLength: 1,
            selector: (monitor) => monitor.id,
        }),
    ])("renders monitor summaries with accurate status badges", (monitors) => {
        const { unmount } = render(
            <MonitoringStatusDisplay monitors={monitors} />
        );

        const runningCount = monitors.filter(
            (monitor) => monitor.monitoring
        ).length;
        const totalCount = monitors.length;

        expect(
            screen.getByText(`${runningCount}/${totalCount} active`, {
                exact: true,
            })
        ).toBeInTheDocument();

        for (const monitor of monitors) {
            const item = screen.getByTestId(`monitor-status-${monitor.id}`);
            const indicator = item.querySelector<HTMLDivElement>(".h-2.w-2");
            expect(indicator).not.toBeNull();
            const expectedIndicatorClass = monitor.monitoring
                ? "themed-status-up"
                : "themed-status-paused";
            expect(indicator).toHaveClass(expectedIndicatorClass);

            const tooltipTitle = `${getMonitorTypeDisplayLabel(
                monitor.type
            )}: ${monitor.monitoring ? "Running" : "Stopped"}`;
            expect(indicator?.getAttribute("title")).toBe(tooltipTitle);

            const suffix = formatTitleSuffix(monitor).trim();
            const normalizedSuffix =
                suffix.startsWith("(") && suffix.endsWith(")")
                    ? suffix.slice(1, -1)
                    : suffix;
            const fallbackIdentifier = getMonitorDisplayIdentifier(
                monitor,
                monitor.id
            );
            const expectedConnectionInfo =
                normalizedSuffix.length > 0
                    ? normalizedSuffix
                    : fallbackIdentifier;

            const connectionElement =
                item.querySelector<HTMLSpanElement>("span.block");
            if (expectedConnectionInfo.length > 0) {
                expect(connectionElement).not.toBeNull();
                expect(connectionElement?.textContent).toBe(
                    expectedConnectionInfo
                );
            } else {
                expect(connectionElement).toBeNull();
            }
        }

        unmount();
    });
});
