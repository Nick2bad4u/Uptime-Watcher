import type { Monitor, MonitorType } from "@shared/types";
import type { ReactElement } from "react";

import { createValidMonitor } from "@shared/test/testHelpers";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { MonitorSelectorProperties } from "../../components/Dashboard/SiteCard/components/MonitorSelector";

import { MonitorSelector } from "../../components/Dashboard/SiteCard/components/MonitorSelector";
import { ThemeProvider } from "../../theme/components/ThemeProvider";

const createMockMonitor = (
    id: string,
    type: MonitorType,
    options: Partial<Monitor> = {}
): Monitor => {
    const hasUrlOverride = Object.hasOwn(options, "url");
    const { url: overrideUrl, ...restOptions } = options;
    const monitor = createValidMonitor({
        host: "example.com",
        id,
        monitoring: false,
        responseTime: 0,
        status: "pending",
        type,
        ...restOptions,
    });
    if (overrideUrl !== undefined) {
        monitor.url = overrideUrl;
    }

    if (hasUrlOverride && overrideUrl === undefined) {
        Reflect.deleteProperty(monitor, "url");
    }

    if (type === "ping" || type === "port") {
        Reflect.deleteProperty(monitor, "url");
    }

    return monitor;
};

const defaultProps = {
    monitors: [
        createMockMonitor("monitor-1", "http", {
            url: "https://example.com/status",
        }),
        createMockMonitor("monitor-2", "port", { port: 8080 }),
        createMockMonitor("monitor-3", "ping"),
    ],
    onChange: vi.fn(),
    selectedMonitorId: "monitor-1",
} satisfies MonitorSelectorProperties;

const renderWithTheme = (ui: ReactElement) =>
    render(<ThemeProvider>{ui}</ThemeProvider>);

const renderMonitorSelector = (
    props: Partial<MonitorSelectorProperties> = {}
) => {
    const mergedProps = {
        ...defaultProps,
        onChange: vi.fn(),
        ...props,
    } satisfies MonitorSelectorProperties;

    const view = renderWithTheme(<MonitorSelector {...mergedProps} />);

    return {
        props: mergedProps,
        select: screen.getByRole("combobox", { name: "Select monitor" }),
        ...view,
    };
};

const selectableOptions = () =>
    screen
        .getAllByRole("option")
        .filter((option) => option.getAttribute("value") !== "");

describe("MonitorSelector", () => {
    it("renders the selected monitor with formatted options", () => {
        const { container, select } = renderMonitorSelector({
            className: "custom-selector",
            selectedMonitorId: "monitor-2",
        });

        expect(container.firstElementChild).toHaveClass(
            "monitor-selector__wrapper",
            "monitor-selector",
            "custom-selector"
        );
        expect(select).toHaveValue("monitor-2");
        expect(select).not.toBeDisabled();
        expect(selectableOptions()).toHaveLength(3);
        expect(
            screen.getByRole("option", {
                name: "Website URL: https://example.com/status",
            })
        ).toHaveValue("monitor-1");
        expect(
            screen.getByRole("option", {
                name: "Host & Port: example.com:8080",
            })
        ).toHaveValue("monitor-2");
        expect(
            screen.getByRole("option", { name: "Ping Monitor: example.com" })
        ).toHaveValue("monitor-3");
    });

    it("shows an empty disabled placeholder when no monitors are available", () => {
        const { container, select } = renderMonitorSelector({
            monitors: [],
            selectedMonitorId: "",
        });

        expect(select).toBeDisabled();
        expect(select).toHaveValue("");
        expect(container.firstElementChild).toHaveAttribute(
            "data-disabled",
            "true"
        );
        expect(
            screen.getByRole("option", { name: "No monitors available" })
        ).toBeDisabled();
    });

    it("shows a placeholder when the selected monitor is missing", () => {
        const { container, select } = renderMonitorSelector({
            selectedMonitorId: "missing-monitor",
        });

        expect(select).toHaveValue("");
        expect(container.firstElementChild).toHaveAttribute(
            "title",
            "Select a monitor"
        );
        expect(
            screen.getByRole("option", { name: "Select a monitor" })
        ).toBeDisabled();
        expect(selectableOptions()).toHaveLength(3);
    });

    it("emits changes and prevents row activation events", async () => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        const onParentClick = vi.fn();
        const onParentMouseDown = vi.fn();

        renderWithTheme(
            <div onClick={onParentClick} onMouseDown={onParentMouseDown}>
                <MonitorSelector {...defaultProps} onChange={onChange} />
            </div>
        );

        const select = screen.getByRole("combobox", {
            name: "Select monitor",
        });

        await user.selectOptions(select, "monitor-2");
        fireEvent.click(select);
        fireEvent.mouseDown(select);

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onParentClick).not.toHaveBeenCalled();
        expect(onParentMouseDown).not.toHaveBeenCalled();
    });

    it("redacts URL query strings in rendered labels", () => {
        renderMonitorSelector({
            monitors: [
                createMockMonitor("with-query", "http", {
                    url: "https://example.com/path?token=secret&debug=true",
                }),
            ],
            selectedMonitorId: "with-query",
        });

        expect(
            screen.getByRole("option", {
                name: "Website URL: https://example.com/path",
            })
        ).toBeInTheDocument();
        expect(screen.queryByText(/token=secret/u)).not.toBeInTheDocument();
        expect(screen.queryByText(/debug=true/u)).not.toBeInTheDocument();
    });

    it.each([
        [
            createMockMonitor("unknown-port", "port", {
                host: "example.com",
                port: 1234,
                type: "type-a" as MonitorType,
            }),
            "Type A Monitor: example.com:1234",
        ],
        [
            createMockMonitor("unknown-url", "http", {
                type: "type-b" as MonitorType,
                url: "https://test.com/status",
            }),
            "Type B Monitor: https://test.com/status",
        ],
        [
            (() => {
                const monitor = createMockMonitor("unknown-host", "ping", {
                    type: "type-c" as MonitorType,
                });
                Reflect.deleteProperty(monitor, "port");
                return monitor;
            })(),
            "Type C Monitor: example.com",
        ],
    ])(
        "formats unknown monitor types with available connection data",
        (monitor, label) => {
            renderMonitorSelector({
                monitors: [monitor],
                selectedMonitorId: monitor.id,
            });

            expect(
                screen.getByRole("option", { name: label })
            ).toBeInTheDocument();
        }
    );

    it("keeps advanced monitor type labels readable", () => {
        renderMonitorSelector({
            monitors: [
                createMockMonitor("cdn", "cdn-edge-consistency", {
                    baselineUrl: "https://origin.example.com/status",
                    edgeLocations: "https://edge.example.com/status",
                }),
                createMockMonitor("heartbeat", "server-heartbeat", {
                    heartbeatExpectedStatus: "ok",
                    heartbeatStatusField: "status",
                    heartbeatTimestampField: "timestamp",
                    url: "https://api.example.com/heartbeat",
                }),
                createMockMonitor("replication", "replication", {
                    primaryStatusUrl: "https://primary.example.com/status",
                    replicaStatusUrl: "https://replica.example.com/status",
                    replicationTimestampField: "timestamp",
                }),
            ],
            selectedMonitorId: "cdn",
        });

        expect(
            screen.getByRole("option", {
                name: "CDN Edge Consistency: https://origin.example.com/status",
            })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("option", {
                name: "Server Heartbeat: https://api.example.com/heartbeat",
            })
        ).toBeInTheDocument();
        expect(
            screen.getByRole("option", {
                name: "Replication Lag: https://primary.example.com/status",
            })
        ).toBeInTheDocument();
    });
});
