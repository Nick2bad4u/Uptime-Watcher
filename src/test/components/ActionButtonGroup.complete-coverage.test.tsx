import type {
    ButtonHTMLAttributes,
    PropsWithChildren,
    ReactElement,
    ReactNode,
} from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { ActionButtonGroupProperties } from "../../components/Dashboard/SiteCard/components/ActionButtonGroup";
import type { SiteMonitoringButtonProperties } from "../../components/common/SiteMonitoringButton/SiteMonitoringButton";

import { ActionButtonGroup } from "../../components/Dashboard/SiteCard/components/ActionButtonGroup";
import { ThemeProvider } from "../../theme/components/ThemeProvider";

type ThemedButtonMockProperties = PropsWithChildren<
    ButtonHTMLAttributes<HTMLButtonElement> & {
        readonly size?: string;
        readonly variant?: string;
    }
>;

vi.mock("../../theme/components/ThemedButton", () => ({
    ThemedButton: ({
        children,
        className,
        disabled,
        onClick,
        size,
        variant,
        ...props
    }: ThemedButtonMockProperties) => (
        <button
            className={className}
            data-size={size}
            data-variant={variant}
            disabled={disabled}
            onClick={onClick}
            type="button"
            {...props}
        >
            {children}
        </button>
    ),
}));

vi.mock("../../components/common/Tooltip/Tooltip", () => ({
    Tooltip: ({
        children,
        content,
    }: {
        readonly children: (triggerProps: {
            readonly "aria-describedby": string;
        }) => ReactNode;
        readonly content: ReactNode;
    }) => (
        <>
            {children({ "aria-describedby": "mock-tooltip" })}
            <span role="tooltip">{content}</span>
        </>
    ),
}));

const { siteMonitoringButtonMock } = vi.hoisted(() => ({
    siteMonitoringButtonMock: vi.fn(
        ({
            allMonitorsRunning,
            className,
            compact,
            disabledReason,
            isLoading,
            onStartSiteMonitoring,
            onStopSiteMonitoring,
            size,
        }: SiteMonitoringButtonProperties) => (
            <button
                aria-label={
                    allMonitorsRunning
                        ? "Stop All Monitoring"
                        : "Start All Monitoring"
                }
                className={className}
                data-compact={String(Boolean(compact))}
                data-disabled-reason={disabledReason ?? ""}
                data-size={size}
                disabled={isLoading}
                onClick={
                    allMonitorsRunning
                        ? onStopSiteMonitoring
                        : onStartSiteMonitoring
                }
                type="button"
            >
                {allMonitorsRunning ? "Stop Site" : "Start Site"}
            </button>
        )
    ),
}));

vi.mock(
    "../../components/common/SiteMonitoringButton/SiteMonitoringButton",
    () => ({
        SiteMonitoringButton: siteMonitoringButtonMock,
    })
);

vi.mock("../../utils/icons", () => {
    const createIcon = (name: string) => {
        const Icon = ({ size = 16 }: { readonly size?: number }) => (
            <svg aria-hidden="true" data-icon={name} data-size={size} />
        );
        Icon.displayName = `MockIcon(${name})`;
        return Icon;
    };

    return {
        AppIcons: {
            actions: {
                pause: createIcon("pause"),
                play: createIcon("play"),
                refresh: createIcon("refresh"),
            },
        },
    };
});

const defaultProps = {
    allMonitorsRunning: false,
    disabled: false,
    isLoading: false,
    isMonitoring: false,
    onCheckNow: vi.fn(),
    onStartMonitoring: vi.fn(),
    onStartSiteMonitoring: vi.fn(),
    onStopMonitoring: vi.fn(),
    onStopSiteMonitoring: vi.fn(),
} satisfies ActionButtonGroupProperties;

const renderWithTheme = (ui: ReactElement) =>
    render(<ThemeProvider>{ui}</ThemeProvider>);

const renderActionButtonGroup = (
    props: Partial<ActionButtonGroupProperties> = {}
) => {
    const mergedProps = {
        ...defaultProps,
        onCheckNow: vi.fn(),
        onStartMonitoring: vi.fn(),
        onStartSiteMonitoring: vi.fn(),
        onStopMonitoring: vi.fn(),
        onStopSiteMonitoring: vi.fn(),
        ...props,
    } satisfies ActionButtonGroupProperties;

    const result = renderWithTheme(<ActionButtonGroup {...mergedProps} />);

    return {
        props: mergedProps,
        ...result,
    };
};

const expectButtonIcon = (button: HTMLElement, iconName: string) => {
    expect(button.querySelector(`svg[data-icon="${iconName}"]`)).not.toBeNull();
};

describe("ActionButtonGroup", () => {
    it("renders check, site-wide, and monitor start controls", () => {
        const { container } = renderActionButtonGroup();

        const checkButton = screen.getByRole("button", { name: "Check Now" });
        const startButton = screen.getByRole("button", {
            name: "Start Monitoring",
        });
        const siteButton = screen.getByRole("button", {
            name: "Start All Monitoring",
        });

        expect(container.firstElementChild).toHaveClass("gap-2");
        expect(checkButton).toHaveAttribute("data-variant", "ghost");
        expect(startButton).toHaveAttribute("data-variant", "success");
        expectButtonIcon(checkButton, "refresh");
        expectButtonIcon(startButton, "play");
        expect(siteButton).toHaveClass("min-w-8");
        expect(siteButton).toHaveAttribute("data-compact", "true");
    });

    it("renders monitor stop and site stop controls when monitoring is active", () => {
        renderActionButtonGroup({
            allMonitorsRunning: true,
            isMonitoring: true,
        });

        const stopButton = screen.getByRole("button", {
            name: "Stop Monitoring",
        });
        const siteButton = screen.getByRole("button", {
            name: "Stop All Monitoring",
        });

        expect(stopButton).toHaveAttribute("data-variant", "error");
        expectButtonIcon(stopButton, "pause");
        expect(siteButton).toHaveTextContent("Stop Site");
        expect(
            screen.queryByRole("button", { name: "Start Monitoring" })
        ).not.toBeInTheDocument();
    });

    it("uses compact spacing and smaller icons for extra-small buttons", () => {
        const { container } = renderActionButtonGroup({ buttonSize: "xs" });

        expect(container.firstElementChild).toHaveClass("gap-1.5");
        expect(
            screen.getByRole("button", { name: "Check Now" })
        ).toHaveAttribute("data-size", "xs");
        expect(
            screen
                .getByRole("button", { name: "Check Now" })
                .querySelector("svg")
        ).toHaveAttribute("data-size", "14");
        expect(
            screen.getByRole("button", { name: "Start All Monitoring" })
        ).toHaveAttribute("data-size", "xs");
    });

    it("calls the active action callbacks", async () => {
        const user = userEvent.setup();
        const onCheckNow = vi.fn();
        const onStartMonitoring = vi.fn();
        const onStartSiteMonitoring = vi.fn();

        renderActionButtonGroup({
            onCheckNow,
            onStartMonitoring,
            onStartSiteMonitoring,
        });

        await user.click(screen.getByRole("button", { name: "Check Now" }));
        await user.click(
            screen.getByRole("button", { name: "Start Monitoring" })
        );
        await user.click(
            screen.getByRole("button", { name: "Start All Monitoring" })
        );

        expect(onCheckNow).toHaveBeenCalledTimes(1);
        expect(onStartMonitoring).toHaveBeenCalledTimes(1);
        expect(onStartSiteMonitoring).toHaveBeenCalledTimes(1);
    });

    it("calls stop callbacks from the stop state", async () => {
        const user = userEvent.setup();
        const onStopMonitoring = vi.fn();
        const onStopSiteMonitoring = vi.fn();

        renderActionButtonGroup({
            allMonitorsRunning: true,
            isMonitoring: true,
            onStopMonitoring,
            onStopSiteMonitoring,
        });

        await user.click(
            screen.getByRole("button", { name: "Stop Monitoring" })
        );
        await user.click(
            screen.getByRole("button", { name: "Stop All Monitoring" })
        );

        expect(onStopMonitoring).toHaveBeenCalledTimes(1);
        expect(onStopSiteMonitoring).toHaveBeenCalledTimes(1);
    });

    it("prevents card click handlers from seeing direct action button clicks", () => {
        const onCheckNow = vi.fn();
        const onStartMonitoring = vi.fn();
        const onParentClick = vi.fn();

        renderWithTheme(
            <div onClick={onParentClick}>
                <ActionButtonGroup
                    {...defaultProps}
                    onCheckNow={onCheckNow}
                    onStartMonitoring={onStartMonitoring}
                />
            </div>
        );

        fireEvent.click(screen.getByRole("button", { name: "Check Now" }));
        fireEvent.click(
            screen.getByRole("button", { name: "Start Monitoring" })
        );

        expect(onCheckNow).toHaveBeenCalledTimes(1);
        expect(onStartMonitoring).toHaveBeenCalledTimes(1);
        expect(onParentClick).not.toHaveBeenCalled();
    });

    it.each([
        [
            { isLoading: true },
            "loading",
            /Finishing the previous request\./u,
        ],
        [
            { disabled: true },
            "unconfigured",
            /Select a monitor to enable this action\./u,
        ],
    ] as const)(
        "disables actions with %s context",
        (props, expectedReason, expectedTooltipText) => {
            renderActionButtonGroup(props);

            expect(
                screen.getByRole("button", { name: "Check Now" })
            ).toBeDisabled();
            expect(
                screen.getByRole("button", { name: "Start Monitoring" })
            ).toBeDisabled();
            expect(
                screen.getByRole("button", { name: "Start All Monitoring" })
            ).toBeDisabled();
            expect(
                screen.getByRole("button", { name: "Start All Monitoring" })
            ).toHaveAttribute("data-disabled-reason", expectedReason);
            expect(screen.getAllByRole("tooltip")[0]).toHaveTextContent(
                expectedTooltipText
            );
        }
    );
});
