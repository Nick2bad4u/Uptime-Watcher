/**
 * Unit tests for the `AnalyticsTab` component covering the rich analytics UI
 * branch logic, error fallbacks, and interaction handlers.
 */

import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ChartOptions } from "chart.js";
import { describe, expect, it, beforeEach, vi } from "vitest";

import type { AnalyticsTabProperties } from "../../../../components/SiteDetails/tabs/AnalyticsTab";
import { AnalyticsTab } from "../../../../components/SiteDetails/tabs/AnalyticsTab";
import { CHART_TIME_RANGES } from "../../../../constants";
import type { DowntimePeriod } from "../../../../hooks/site/useSiteAnalytics";
import type {
    ResponseTimeChartData,
    StatusBarChartData,
    UptimeChartData,
} from "../../../../services/chartConfig";

import type { ReactNode } from "react";

interface ButtonInvocation {
    readonly children: ReactNode;
    readonly onClick?: (() => void) | undefined;
    readonly size?: string | undefined;
    readonly variant?: string | undefined;
}

interface ProgressInvocation {
    readonly showLabel?: boolean | undefined;
    readonly value: number;
    readonly variant?: string | undefined;
}

interface BadgeInvocation {
    readonly children: ReactNode;
    readonly size?: string | undefined;
    readonly variant?: string | undefined;
}

interface ChartInvocation {
    readonly data: unknown;
    readonly options: unknown;
}

interface AvailabilityState {
    variant: "success" | "warning" | "danger";
}

const {
    availabilityState,
    badgeInvocations,
    buttonInvocations,
    progressInvocations,
    responseTimeChartInvocations,
    statusChartInvocations,
    uptimeChartInvocations,
    userActionLogs,
    errorLogs,
} = vi.hoisted(() => ({
    availabilityState: { variant: "success" } as AvailabilityState,
    badgeInvocations: [] as BadgeInvocation[],
    buttonInvocations: [] as ButtonInvocation[],
    progressInvocations: [] as ProgressInvocation[],
    responseTimeChartInvocations: [] as ChartInvocation[],
    statusChartInvocations: [] as ChartInvocation[],
    uptimeChartInvocations: [] as ChartInvocation[],
    userActionLogs: [] as {
        readonly event: string;
        readonly payload: unknown;
    }[],
    errorLogs: [] as (readonly [string, Error])[],
}));

const themeStub = vi.hoisted(() => ({
    colors: {
        error: "rgb(255, 77, 79)",
        primary: {
            500: "rgb(52, 152, 219)",
            600: "rgb(41, 128, 185)",
        },
        success: "rgb(46, 204, 113)",
        warning: "rgb(241, 196, 15)",
    },
})) as {
    colors: {
        readonly error: string;
        readonly primary: {
            readonly 500: string;
            readonly 600: string;
        };
        readonly success: string;
        readonly warning: string;
    };
};

vi.mock("../../../../theme/components/ThemedButton", () => ({
    ThemedButton: ({
        children,
        onClick,
        size,
        variant,
    }: {
        readonly children: ReactNode;
        readonly onClick?: () => void;
        readonly size?: string;
        readonly variant?: string;
    }) => {
        buttonInvocations.push({ children, onClick, size, variant });
        return (
            <button onClick={onClick} type="button">
                {children}
            </button>
        );
    },
}));

vi.mock("../../../../theme/components/ThemedCard", () => ({
    ThemedCard: ({ children }: { readonly children: ReactNode }) => (
        <section>{children}</section>
    ),
}));

vi.mock("../../../../theme/components/ThemedBadge", () => ({
    ThemedBadge: ({
        children,
        size,
        variant,
    }: {
        readonly children: ReactNode;
        readonly size?: string;
        readonly variant?: string;
    }) => {
        badgeInvocations.push({ children, size, variant });
        return <span>{children}</span>;
    },
}));

vi.mock("../../../../theme/components/ThemedProgress", () => ({
    ThemedProgress: ({
        showLabel,
        value,
        variant,
    }: {
        readonly showLabel?: boolean;
        readonly value: number;
        readonly variant?: string;
    }) => {
        progressInvocations.push({ showLabel, value, variant });
        return <progress value={value}>{variant}</progress>;
    },
}));

vi.mock("../../../../theme/components/ThemedText", () => ({
    ThemedText: ({
        children,
        style,
    }: {
        readonly children: ReactNode;
        readonly style?: Record<string, string>;
    }) => <span style={style}>{children}</span>,
}));

vi.mock("../../../../theme/useTheme", () => ({
    useTheme: () => ({
        currentTheme: themeStub,
    }),
    useAvailabilityColors: () => ({
        getAvailabilityColor: (percentage: number) =>
            percentage >= 95
                ? themeStub.colors.success
                : themeStub.colors.error,
        getAvailabilityVariant: () => availabilityState.variant,
    }),
}));

vi.mock("../../../../components/common/MonitorUiComponents", () => ({
    ConditionalResponseTime: ({
        children,
    }: {
        readonly children: ReactNode;
    }) => <>{children}</>,
}));

vi.mock("../../../../components/SiteDetails/charts/ResponseTimeChart", () => ({
    ResponseTimeChart: ({ data, options }: ChartInvocation) => {
        responseTimeChartInvocations.push({ data, options });
        return <div data-testid="response-time-chart" />;
    },
}));

vi.mock("../../../../components/SiteDetails/charts/StatusChart", () => ({
    StatusChart: ({ data, options }: ChartInvocation) => {
        statusChartInvocations.push({ data, options });
        return <div data-testid="status-chart" />;
    },
}));

vi.mock("../../../../components/SiteDetails/charts/UptimeChart", () => ({
    UptimeChart: ({ data, options }: ChartInvocation) => {
        uptimeChartInvocations.push({ data, options });
        return <div data-testid="uptime-chart" />;
    },
}));

vi.mock("../../../../services/logger", () => ({
    logger: {
        error: (message: string, error: Error) => {
            errorLogs.push([message, error]);
        },
        user: {
            action: (event: string, payload: unknown) => {
                userActionLogs.push({ event, payload });
            },
        },
    },
}));

type PartialAnalyticsProps = Partial<AnalyticsTabProperties>;

const baseDowntimePeriods: DowntimePeriod[] = [
    { duration: 60_000, end: Date.now(), start: Date.now() - 60_000 },
    {
        duration: 120_000,
        end: Date.now() - 120_000,
        start: Date.now() - 180_000,
    },
];

const baseLineChartData: ResponseTimeChartData = {
    datasets: [
        {
            backgroundColor: "rgba(52, 152, 219, 0.2)",
            borderColor: "#3498db",
            data: [
                100,
                200,
                150,
            ],
            fill: true,
            label: "Response",
            tension: 0.4,
        },
    ],
    labels: [
        "00:00",
        "00:05",
        "00:10",
    ],
};

const baseBarChartData: StatusBarChartData = {
    datasets: [
        {
            backgroundColor: [
                "#2ecc71",
                "#f1c40f",
                "#e74c3c",
            ],
            borderColor: [
                "#27ae60",
                "#f39c12",
                "#c0392b",
            ],
            borderWidth: 1,
            data: [
                42,
                7,
                3,
            ],
            label: "Status",
        },
    ],
    labels: [
        "Up",
        "Degraded",
        "Down",
    ],
};

const baseUptimeChartData: UptimeChartData = {
    datasets: [
        {
            backgroundColor: [
                "#2ecc71",
                "#f1c40f",
                "#e74c3c",
            ],
            borderColor: [
                "#27ae60",
                "#f39c12",
                "#c0392b",
            ],
            borderWidth: 2,
            data: [
                90,
                7,
                3,
            ],
        },
    ],
    labels: [
        "Up",
        "Degraded",
        "Down",
    ],
};

const emptyLineOptions = {} as ChartOptions<"line">;
const emptyBarOptions = {} as ChartOptions<"bar">;
const emptyDoughnutOptions = {} as ChartOptions<"doughnut">;

/**
 * Create analytics tab properties with deterministic defaults for testing.
 *
 * @param overrides - Partial properties to override the defaults.
 *
 * @returns Fully populated analytics tab properties.
 */
const createAnalyticsProps = (
    overrides: PartialAnalyticsProps = {}
): AnalyticsTabProperties => ({
    avgResponseTime: 320,
    barChartData: baseBarChartData,
    barChartOptions: emptyBarOptions,
    doughnutOptions: emptyDoughnutOptions,
    downCount: 3,
    downtimePeriods: baseDowntimePeriods,
    formatDuration: (ms) => `${Math.round(ms / 1000)}s`,
    formatResponseTime: (time) => `${time} ms`,
    getAvailabilityDescription: (percentage) =>
        percentage >= 99 ? "Excellent" : "Solid",
    lineChartData: baseLineChartData,
    lineChartOptions: emptyLineOptions,
    monitorType: "http",
    mttr: 180_000,
    p50: 80,
    p95: 320,
    p99: 720,
    setShowAdvancedMetrics: overrides.setShowAdvancedMetrics ?? vi.fn(),
    setSiteDetailsChartTimeRange:
        overrides.setSiteDetailsChartTimeRange ?? vi.fn(),
    showAdvancedMetrics: overrides.showAdvancedMetrics ?? false,
    siteDetailsChartTimeRange:
        overrides.siteDetailsChartTimeRange ?? CHART_TIME_RANGES[0],
    totalChecks: 52,
    totalDowntime: 540_000,
    upCount: 49,
    uptime: "99.5",
    uptimeChartData: baseUptimeChartData,
    ...overrides,
});

beforeEach(() => {
    availabilityState.variant = "success";
    buttonInvocations.length = 0;
    progressInvocations.length = 0;
    badgeInvocations.length = 0;
    responseTimeChartInvocations.length = 0;
    statusChartInvocations.length = 0;
    uptimeChartInvocations.length = 0;
    userActionLogs.length = 0;
    errorLogs.length = 0;
});

describe(AnalyticsTab, () => {
    it("renders analytics metrics, applies styling, and handles user interactions", () => {
        availabilityState.variant = "danger";
        const setTimeRange = vi.fn();
        const setAdvancedMetrics = vi.fn();
        const props = createAnalyticsProps({
            setShowAdvancedMetrics: setAdvancedMetrics,
            setSiteDetailsChartTimeRange: setTimeRange,
        });

        render(<AnalyticsTab {...props} />);

        const progressInvocation = progressInvocations.at(-1);
        expect(progressInvocation?.variant).toBe("error");
        expect(progressInvocation?.value).toBeCloseTo(99.5);

        const badgeInvocation = badgeInvocations.at(-1);
        expect(badgeInvocation?.variant).toBe("error");

        const advanceToggle = screen.getByRole("button", {
            name: /show advanced/i,
        });
        fireEvent.click(advanceToggle);
        expect(setAdvancedMetrics).toHaveBeenCalledWith(true);
        expect(
            userActionLogs.some(
                (action) => action.event === "Advanced metrics toggle"
            )
        ).toBeTruthy();

        for (const range of CHART_TIME_RANGES) {
            const button = screen.getByRole("button", { name: range });
            fireEvent.click(button);
        }
        expect(setTimeRange).toHaveBeenCalledWith(CHART_TIME_RANGES[1]);
        expect(setTimeRange).toHaveBeenCalledWith(CHART_TIME_RANGES[2]);
        expect(
            userActionLogs.some(
                (action) => action.event === "Chart time range changed"
            )
        ).toBeTruthy();

        expect(screen.getByText("99.5%")).toBeInTheDocument();
        expect(screen.getByText("2 incidents")).toBeInTheDocument();
        expect(screen.getByText("540s")).toBeInTheDocument();
        expect(screen.getByText("52")).toBeInTheDocument();
        expect(screen.getByText("Up: 49 / Down: 3")).toBeInTheDocument();

        const p50Element = screen
            .getAllByText("80 ms")
            .find(
                (element) => element.style.color === themeStub.colors.success
            );
        expect(p50Element).toBeDefined();
        expect(p50Element).toHaveStyle({ color: themeStub.colors.success });

        const p95Element = screen
            .getAllByText("320 ms")
            .find(
                (element) => element.style.color === themeStub.colors.warning
            );
        expect(p95Element).toBeDefined();
        expect(p95Element).toHaveStyle({ color: themeStub.colors.warning });

        const p99Element = screen
            .getAllByText("720 ms")
            .find((element) => element.style.color === themeStub.colors.error);
        expect(p99Element).toBeDefined();
        expect(p99Element).toHaveStyle({ color: themeStub.colors.error });

        expect(responseTimeChartInvocations).toHaveLength(1);
        expect(statusChartInvocations).toHaveLength(1);
        expect(uptimeChartInvocations).toHaveLength(1);
    });

    it("falls back gracefully when formatter callbacks throw", () => {
        availabilityState.variant = "warning";
        const props = createAnalyticsProps({
            formatDuration: () => {
                throw new Error("duration failure");
            },
            formatResponseTime: () => {
                throw new Error("response failure");
            },
            getAvailabilityDescription: () => {
                throw new Error("availability failure");
            },
            totalDowntime: 4500,
            uptime: "94.5",
        });

        render(<AnalyticsTab {...props} />);

        expect(screen.getByText("5s")).toBeInTheDocument();
        const fallbackP95 = screen
            .getAllByText("320ms")
            .find(
                (element) => element.style.color === themeStub.colors.warning
            );
        expect(fallbackP95).toBeDefined();

        const fallbackP99 = screen
            .getAllByText("720ms")
            .find((element) => element.style.color === themeStub.colors.error);
        expect(fallbackP99).toBeDefined();
        expect(screen.getByText("94.5%")).toBeInTheDocument();
        expect(screen.getByText("Poor")).toBeInTheDocument();

        const loggedMessages = errorLogs.map(([message]) => message);
        expect(loggedMessages).toContain("Error formatting duration");
        expect(loggedMessages).toContain("Error formatting response time");
        expect(loggedMessages).toContain(
            "Error getting availability description"
        );
    });

    it("applies success styling when downtime and recovery metrics are optimal", () => {
        availabilityState.variant = "success";
        const props = createAnalyticsProps({
            downtimePeriods: [],
            mttr: 0,
            showAdvancedMetrics: true,
            totalDowntime: 0,
        });

        render(<AnalyticsTab {...props} />);

        const advancedCard = screen
            .getByText("Mean Time To Recovery")
            .closest("section");
        expect(advancedCard).not.toBeNull();

        const mttrValue = within(advancedCard!).getByText("0s");
        expect(mttrValue).toHaveStyle({ color: themeStub.colors.success });

        const incidentsValue = within(advancedCard!).getByText("0");
        expect(incidentsValue).toHaveStyle({ color: themeStub.colors.success });
    });
});
