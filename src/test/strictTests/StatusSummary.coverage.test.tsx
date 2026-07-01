/**
 * @file Coverage tests for the StatusSummary component in the header.
 */

import type { ReactNode } from "react";
import type { UnknownRecord } from "type-fest";

import { render, screen } from "@testing-library/react";
import { safeCastTo } from "ts-extras";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { StatusSummary } from "../../components/Header/StatusSummary";

const tooltipMock = vi.hoisted(() => ({
    render: vi.fn(
        ({
            children,
            content,
        }: {
            children: (props: Record<string, never>) => ReactNode;
            content: string;
        }) => (
            <div data-content={content} data-testid="tooltip">
                {children({})}
            </div>
        )
    ),
}));

vi.mock("../../components/common/Tooltip/Tooltip", () => ({
    Tooltip: tooltipMock.render,
}));

const themedBoxMock = vi.hoisted(() => ({
    render: vi.fn(({ children, ...props }: { children?: ReactNode }) => (
        <div data-testid="themed-box" {...props}>
            {children}
        </div>
    )),
}));

vi.mock("../../theme/components/ThemedBox", () => ({
    ThemedBox: themedBoxMock.render,
}));

const themedTextCalls = vi.hoisted(() =>
    safeCastTo<(UnknownRecord & { children?: ReactNode })[]>([])
);

vi.mock("../../theme/components/ThemedText", () => ({
    ThemedText: (props: { children?: ReactNode }) => {
        themedTextCalls.push(props);
        return <span>{props.children}</span>;
    },
}));

const statusIndicatorCalls = vi.hoisted(() => safeCastTo<UnknownRecord[]>([]));

vi.mock("../../theme/components/StatusIndicator", () => ({
    StatusIndicator: (props: UnknownRecord) => {
        statusIndicatorCalls.push(props);
        return <span data-testid={`status-indicator-${props["status"]}`} />;
    },
}));

const healthIndicatorCalls = vi.hoisted(() => safeCastTo<UnknownRecord[]>([]));

vi.mock("../../components/Header/HealthIndicator", () => ({
    HealthIndicator: (props: UnknownRecord) => {
        healthIndicatorCalls.push(props);
        return <div data-testid="health-indicator" />;
    },
}));

describe("StatusSummary coverage", () => {
    beforeEach(() => {
        themedTextCalls.length = 0;
        statusIndicatorCalls.length = 0;
        healthIndicatorCalls.length = 0;
        themedBoxMock.render.mockClear();
        tooltipMock.render.mockClear();
    });

    it("renders all status pills when monitors are available", () => {
        render(
            <StatusSummary
                degradedMonitors={2}
                downMonitors={1}
                getAvailabilityColor={() => "green"}
                pausedMonitors={3}
                pendingMonitors={4}
                totalMonitors={5}
                upMonitors={7}
                uptimePercentage={96}
            />
        );

        expect(screen.getByTestId("health-indicator")).toBeInTheDocument();
        expect(screen.getByTestId("status-indicator-up")).toBeInTheDocument();
        expect(
            screen.getByTestId("status-indicator-degraded")
        ).toBeInTheDocument();
        expect(screen.getByTestId("status-indicator-down")).toBeInTheDocument();
        expect(
            screen.getByTestId("status-indicator-pending")
        ).toBeInTheDocument();
        expect(
            screen.getByTestId("status-indicator-paused")
        ).toBeInTheDocument();
        const healthTooltipCall = tooltipMock.render.mock.calls.find(
            ([props]) =>
                typeof props.content === "string" &&
                props.content.includes("96% uptime across 5 monitors")
        );
        expect(healthTooltipCall).toBeTruthy();
    });

    it("omits health and totals when no monitors exist", () => {
        render(
            <StatusSummary
                degradedMonitors={0}
                downMonitors={0}
                getAvailabilityColor={() => "green"}
                pausedMonitors={0}
                pendingMonitors={0}
                totalMonitors={0}
                upMonitors={0}
                uptimePercentage={0}
            />
        );

        expect(screen.queryByTestId("health-indicator")).toBeNull();
        expect(screen.queryByText("Total")).toBeNull();
        expect(screen.queryByText("Degraded")).toBeNull();
    });

    it("uses singular phrasing for the uptime tooltip with one monitor", () => {
        render(
            <StatusSummary
                degradedMonitors={0}
                downMonitors={0}
                getAvailabilityColor={() => "green"}
                pausedMonitors={0}
                pendingMonitors={0}
                totalMonitors={1}
                upMonitors={1}
                uptimePercentage={99}
            />
        );

        const singularTooltipCall = tooltipMock.render.mock.calls.find(
            ([props]) =>
                typeof props.content === "string" &&
                props.content.includes("1 monitor")
        );
        expect(singularTooltipCall).toBeTruthy();
    });

    it("omits the degraded pill when there are zero degraded monitors", () => {
        render(
            <StatusSummary
                degradedMonitors={0}
                downMonitors={2}
                getAvailabilityColor={() => "green"}
                pausedMonitors={1}
                pendingMonitors={1}
                totalMonitors={5}
                upMonitors={5}
                uptimePercentage={97}
            />
        );

        const degradedIndicator = statusIndicatorCalls.find(
            (call) => call["status"] === "degraded"
        );
        expect(degradedIndicator).toBeUndefined();
        expect(screen.queryByTestId("status-indicator-degraded")).toBeNull();
    });
});
