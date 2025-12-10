import type { ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import {
    describe,
    expect,
    it,
    beforeAll,
    afterAll,
    beforeEach,
    vi,
} from "vitest";

import type { Monitor } from "@shared/types";

import { SiteCardMonitorList } from "../../../../components/Dashboard/SiteCard/SiteCardMonitorList";

interface ThemedComponentProperties extends Record<string, unknown> {
    readonly children?: ReactNode;
}

type TooltipRenderFunction = (props: Record<string, unknown>) => ReactNode;

interface TooltipProperties extends Record<string, unknown> {
    readonly children: TooltipRenderFunction;
    readonly content: string;
    readonly position: string;
}

interface MonitorFactoryOverride extends Partial<Monitor> {
    readonly historyTimestamps?: readonly number[];
}

const MILLISECOND = 1e3;

const seconds = (value: number): number => value * MILLISECOND;

const minutes = (value: number): number => seconds(60 * value);

const hours = (value: number): number => minutes(60 * value);

const days = (value: number): number => hours(24 * value);

/**
 * Utility factory for creating monitor objects with sensible defaults.
 */
function createMonitor(
    overrides: MonitorFactoryOverride,
    index: number
): Monitor {
    const {
        historyTimestamps = [],
        status = "up",
        type = "http",
        monitoring = true,
        retryAttempts = 0,
        responseTime = 128,
        checkInterval = seconds(15),
        timeout = 30_000,
        history,
        id,
        ...rest
    } = overrides;

    const resolvedHistory =
        history ??
        historyTimestamps.map((timestamp) => ({
            responseTime,
            status: status === "down" ? "down" : "up",
            timestamp,
        }));

    return {
        checkInterval,
        history: resolvedHistory,
        id: id ?? `monitor-${index}`,
        monitoring,
        responseTime,
        retryAttempts,
        status,
        timeout,
        type,
        ...rest,
    } as Monitor;
}

const { statusIconInvocations, createIconStub } = vi.hoisted(() => {
    const calls: { readonly status: string }[] = [];
    const factory = (status: string) =>
        function IconStub(props: Record<string, unknown>) {
            calls.push({ status });
            return <span aria-label={`icon-${status}`} {...props} />;
        };

    return {
        createIconStub: factory,
        statusIconInvocations: calls,
    } as const;
});

vi.mock("../../../../theme/components/ThemedText", () => ({
    ThemedText: ({ children, ...props }: ThemedComponentProperties) => (
        <span {...(props as Record<string, unknown>)}>{children}</span>
    ),
}));

vi.mock("../../../../utils/icons", () => ({
    AppIcons: {
        metrics: {
            activity: createIconStub("activity"),
            response: createIconStub("response"),
            time: createIconStub("time"),
        },
        status: {
            downFilled: createIconStub("down"),
            pausedFilled: createIconStub("paused"),
            pendingFilled: createIconStub("pending"),
            upFilled: createIconStub("up"),
            warning: createIconStub("degraded"),
        },
    },
}));

vi.mock("../../../../components/common/Tooltip/Tooltip", () => ({
    Tooltip: ({ children }: TooltipProperties) => (
        <>{children({ "data-tooltip": "stub" })}</>
    ),
}));

describe(SiteCardMonitorList, () => {
    beforeAll(() => {
        vi.useFakeTimers();
    });

    afterAll(() => {
        vi.useRealTimers();
    });

    beforeEach(() => {
        statusIconInvocations.length = 0;
        vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
    });

    it("renders an informative empty state when no monitors are provided", () => {
        render(<SiteCardMonitorList monitors={[]} selectedMonitorId="none" />);

        expect(
            screen.getByText(
                "No monitors configured yet — add one to begin tracking this site."
            )
        ).toBeInTheDocument();
    });

    it("displays formatted monitor statistics and selection state", () => {
        const now = Date.now();
        const monitors: Monitor[] = [
            createMonitor(
                {
                    checkInterval: 0,
                    historyTimestamps: [now - seconds(1)],
                    id: "selected-monitor",
                    responseTime: 321,
                    status: "up",
                    url: "https://uptimewatcher.dev/status",
                },
                0
            ),
            createMonitor(
                {
                    baselineUrl: "https://baseline.uptimewatcher.dev",
                    checkInterval: seconds(45),
                    historyTimestamps: [now - seconds(30)],
                    status: "degraded",
                    responseTime: 512,
                    type: "ping",
                },
                1
            ),
            createMonitor(
                {
                    checkInterval: minutes(5),
                    historyTimestamps: [now - minutes(15)],
                    host: "monitor.internal",
                    responseTime: 89,
                    status: "pending",
                    type: "port",
                },
                2
            ),
            createMonitor(
                {
                    checkInterval: minutes(15),
                    historyTimestamps: [now - hours(6)],
                    responseTime: 144,
                    status: "paused",
                    type: "http-keyword",
                    url: "invalid-url",
                },
                3
            ),
            createMonitor(
                {
                    checkInterval: minutes(90),
                    historyTimestamps: [now - days(3)],
                    responseTime: 204,
                    status: "down",
                    type: "dns",
                },
                4
            ),
            createMonitor(
                {
                    checkInterval: hours(10),
                    history: [],
                    responseTime: 65,
                    status: "up",
                    type: "ssl",
                },
                5
            ),
        ];

        render(
            <SiteCardMonitorList
                monitors={monitors}
                selectedMonitorId="selected-monitor"
            />
        );

        expect(screen.getByText("Monitor Health")).toBeInTheDocument();
        expect(screen.getByText("Selected")).toBeInTheDocument();
        expect(screen.getByText("uptimewatcher.dev")).toBeInTheDocument();
        expect(
            screen.getByText("https://baseline.uptimewatcher.dev")
        ).toBeInTheDocument();
        expect(screen.getByText("monitor.internal")).toBeInTheDocument();
        expect(screen.getByText("invalid-url")).toBeInTheDocument();
        expect(screen.getByText("DNS")).toBeInTheDocument();

        // Response times are rendered without a space before the unit suffix
        // (see formatResponseTime in src/utils/time.ts).
        expect(screen.getByText("321ms")).toBeInTheDocument();
        expect(screen.getByText("512ms")).toBeInTheDocument();
        expect(screen.getByText("89ms")).toBeInTheDocument();
        expect(screen.getByText("144ms")).toBeInTheDocument();
        expect(screen.getByText("204ms")).toBeInTheDocument();
        expect(screen.getByText("65ms")).toBeInTheDocument();

        expect(screen.getByText("N/A")).toBeInTheDocument();
        expect(screen.getByText("45s")).toBeInTheDocument();
        expect(screen.getByText("5.0m")).toBeInTheDocument();
        expect(screen.getByText("15m")).toBeInTheDocument();
        expect(screen.getByText("1.5h")).toBeInTheDocument();
        expect(screen.getByText("10h")).toBeInTheDocument();

        expect(screen.getByText("Just now")).toBeInTheDocument();
        expect(screen.getByText("30s ago")).toBeInTheDocument();
        expect(screen.getByText("15m ago")).toBeInTheDocument();
        expect(screen.getByText("6h ago")).toBeInTheDocument();
        expect(screen.getByText("3d ago")).toBeInTheDocument();
        expect(screen.getByText("No history")).toBeInTheDocument();

        const iconStatuses = new Set(
            statusIconInvocations.map((invocation) => invocation.status)
        );

        expect(iconStatuses).toEqual(
            new Set([
                "activity",
                "degraded",
                "down",
                "paused",
                "pending",
                "response",
                "time",
                "up",
            ])
        );
    });
});
