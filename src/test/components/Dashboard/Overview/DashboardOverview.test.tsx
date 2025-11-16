/**
 * Focused tests for the `DashboardOverview` component.
 *
 * @remarks
 * These tests exercise the key conditional branches used when rendering
 * dashboard summary cards, in particular the handling of optional
 * `averageResponseTime` metrics and trend text for monitor health and incident
 * counts.
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import type { GlobalMonitoringMetrics } from "../../../../utils/monitoring/globalMetrics";
import { DashboardOverview } from "../../../../components/Dashboard/Overview/DashboardOverview";

/**
 * Creates a minimal but realistic metrics object for testing.
 */
const createMetrics = (
    overrides: Partial<GlobalMonitoringMetrics> = {}
): GlobalMonitoringMetrics => ({
    activeMonitors: overrides.activeMonitors ?? 3,
    averageResponseTime: overrides.averageResponseTime ?? 250,
    incidentCount: overrides.incidentCount ?? 2,
    monitorStatusCounts: {
        degraded: overrides.monitorStatusCounts?.degraded ?? 1,
        down: overrides.monitorStatusCounts?.down ?? 1,
        paused: overrides.monitorStatusCounts?.paused ?? 1,
        pending: overrides.monitorStatusCounts?.pending ?? 2,
        total: overrides.monitorStatusCounts?.total ?? 7,
        up: overrides.monitorStatusCounts?.up ?? 3,
    },
    totalMonitors: overrides.totalMonitors ?? 7,
    totalSites: overrides.totalSites ?? 2,
    uptimePercentage: overrides.uptimePercentage ?? 99,
});

describe(DashboardOverview, () => {
    it("renders all overview cards with metric values when averageResponseTime is present", ({
        task,
        annotate,
    }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: DashboardOverview", "component");
        annotate("Category: UI", "category");
        annotate("Type: Metrics", "type");

        const metrics = createMetrics({
            activeMonitors: 5,
            averageResponseTime: 123,
            incidentCount: 4,
            monitorStatusCounts: {
                degraded: 1,
                down: 2,
                paused: 1,
                pending: 3,
                total: 10,
                up: 6,
            },
            totalMonitors: 10,
            totalSites: 3,
            uptimePercentage: 98,
        });

        render(
            <DashboardOverview
                metrics={metrics}
                siteCountLabel="Monitored Sites"
            />
        );

        // Sites card
        expect(screen.getByText("Monitored Sites")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();

        // Active monitors card
        expect(screen.getByText("Active Monitors")).toBeInTheDocument();
        expect(screen.getByText("5/10")).toBeInTheDocument();

        // Healthy monitors card with trend text
        expect(screen.getByText("Healthy Monitors")).toBeInTheDocument();
        expect(screen.getByText("6")).toBeInTheDocument();
        expect(screen.getByText("1 paused · 3 pending")).toBeInTheDocument();

        // Global uptime card
        expect(screen.getByText("Global Uptime")).toBeInTheDocument();
        expect(screen.getByText("98%")).toBeInTheDocument();

        // Active incidents card with trend text
        expect(screen.getByText("Active Incidents")).toBeInTheDocument();
        expect(screen.getByText("4")).toBeInTheDocument();
        expect(screen.getByText("2 down · 1 degraded")).toBeInTheDocument();

        // Average response card when metric is present
        expect(screen.getByText("Avg Response")).toBeInTheDocument();
        expect(screen.getByText("123 ms")).toBeInTheDocument();
    });

    it("falls back to em dash when averageResponseTime is missing or zero", ({
        task,
        annotate,
    }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: DashboardOverview", "component");
        annotate("Category: UI", "category");
        annotate("Type: EdgeCase", "type");

        const metrics = createMetrics({
            // Explicit zero should be treated as "no data" in the UI
            averageResponseTime: 0,
        });

        render(
            <DashboardOverview
                metrics={metrics}
                siteCountLabel="Monitored Sites"
            />
        );

        // The Avg Response card should render a placeholder when there is
        // no meaningful response-time metric.
        const avgResponseLabel = screen.getByText("Avg Response");
        expect(avgResponseLabel).toBeInTheDocument();

        // There should be a matching "—" value somewhere in the overview grid.
        expect(screen.getByText("—")).toBeInTheDocument();
    });
});
