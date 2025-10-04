import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { SiteCardMetrics } from "../components/Dashboard/SiteCard/SiteCardMetrics";

// Mock MetricCard to isolate SiteCardMetrics logic
vi.mock("../components/Dashboard/SiteCard/components/MetricCard", () => ({
    MetricCard: ({ label, value }: any) => (
        <div data-testid="metric-card" data-label={label} data-value={value}>
            {label}:{value}
        </div>
    ),
}));

// Simplify Tooltip behaviour for deterministic rendering
vi.mock("../components/common/Tooltip/Tooltip", () => ({
    Tooltip: ({ children }: any) => (
        <div data-testid="tooltip-wrapper">
            {typeof children === "function" ? children({}) : children}
        </div>
    ),
}));

describe(SiteCardMetrics, () => {
    it("renders all metrics with correct values", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: SiteCardMetrics", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        const metrics = [
            { key: "status", label: "Status", value: "Up" },
            { key: "uptime", label: "Uptime", value: "99.5%" },
            {
                key: "response",
                label: "Last Response",
                value: "123 ms",
            },
            { key: "checks", label: "Checks", value: "42" },
        ] as const;

        render(<SiteCardMetrics metrics={metrics} />);

        const cards = screen.getAllByTestId("metric-card");
        expect(cards).toHaveLength(metrics.length);
        for (const { label, value } of metrics) {
            const card = cards.find(
                (element) => element.dataset["label"] === label
            );

            if (!card) {
                throw new Error(`Metric card with label ${label} not found.`);
            }

            expect(card).toHaveAttribute("data-value", String(value));
        }
    });

    it("supports tooltip-enabled metrics", () => {
        const metrics = [
            { key: "status", label: "Status", value: "Paused" },
            {
                key: "uptime",
                label: "Uptime",
                tooltip: "Calculated from recent checks",
                value: "77.7%",
            },
        ] as const;

        render(<SiteCardMetrics metrics={metrics} />);

        expect(screen.getAllByTestId("metric-card")).toHaveLength(2);
        const tooltipWrappers = screen.getAllByTestId("tooltip-wrapper");
        expect(tooltipWrappers).toHaveLength(1);
        expect(
            tooltipWrappers[0].querySelector('[data-label="Uptime"]')
        ).not.toBeNull();
    });
});
