import type {
    ButtonHTMLAttributes,
    PropsWithChildren,
    ReactElement,
    ReactNode,
} from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { SiteMonitoringButtonProperties } from "../../components/common/SiteMonitoringButton/SiteMonitoringButton";

import { SiteMonitoringButton } from "../../components/common/SiteMonitoringButton/SiteMonitoringButton";
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
            <span id="mock-tooltip" role="tooltip">
                {content}
            </span>
        </>
    ),
}));

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
                pauseFilled: createIcon("pause-filled"),
                playAll: createIcon("play-all"),
            },
        },
    };
});

const defaultProps = {
    allMonitorsRunning: false,
    isLoading: false,
    onStartSiteMonitoring: vi.fn(),
    onStopSiteMonitoring: vi.fn(),
} satisfies SiteMonitoringButtonProperties;

const renderWithTheme = (ui: ReactElement) =>
    render(<ThemeProvider>{ui}</ThemeProvider>);

const renderButton = (props: Partial<SiteMonitoringButtonProperties> = {}) => {
    const mergedProps = {
        ...defaultProps,
        onStartSiteMonitoring: vi.fn(),
        onStopSiteMonitoring: vi.fn(),
        ...props,
    } satisfies SiteMonitoringButtonProperties;

    renderWithTheme(<SiteMonitoringButton {...mergedProps} />);

    return {
        button: screen.getByRole("button"),
        props: mergedProps,
    };
};

const expectButtonIcon = (button: HTMLElement, iconName: string) => {
    expect(
        [...button.querySelectorAll<SVGElement>("svg[data-icon]")].some(
            (icon) => icon.dataset["icon"] === iconName
        )
    ).toBeTruthy();
};

describe("SiteMonitoringButton", () => {
    it("renders the start state when not all monitors are running", () => {
        const { button } = renderButton();

        expect(button).toHaveAccessibleName("Start All Monitoring");
        expect(button).toHaveAttribute("data-variant", "success");
        expect(button).toHaveAttribute("data-size", "sm");
        expect(button).toHaveClass("min-w-24", "justify-center");
        expectButtonIcon(button, "play-all");
        expect(screen.getByText("Start All")).toBeInTheDocument();
    });

    it("renders the stop state when every monitor is running", () => {
        const { button } = renderButton({ allMonitorsRunning: true });

        expect(button).toHaveAccessibleName("Stop All Monitoring");
        expect(button).toHaveAttribute("data-variant", "error");
        expectButtonIcon(button, "pause-filled");
        expect(screen.getByText("Stop All")).toBeInTheDocument();
    });

    it("supports compact mode, custom classes, and extra button sizes", () => {
        const { button } = renderButton({
            className: "card-action",
            compact: true,
            size: "xs",
        });

        expect(button).toHaveClass("card-action");
        expect(button).not.toHaveClass("min-w-24");
        expect(button).toHaveAttribute("data-size", "xs");
        expect(button.querySelector("svg")).toHaveAttribute("data-size", "14");
        expect(screen.queryByText("Start All")).not.toBeInTheDocument();
    });

    it("disables the button while loading", async () => {
        const user = userEvent.setup();
        const onStartSiteMonitoring = vi.fn();

        const { button } = renderButton({
            isLoading: true,
            onStartSiteMonitoring,
        });

        expect(button).toBeDisabled();

        await user.click(button);

        expect(onStartSiteMonitoring).not.toHaveBeenCalled();
    });

    it("starts or stops site monitoring from the active state", async () => {
        const user = userEvent.setup();
        const onStartSiteMonitoring = vi.fn();
        const onStopSiteMonitoring = vi.fn();

        const { button } = renderButton({
            onStartSiteMonitoring,
            onStopSiteMonitoring,
        });

        await user.click(button);

        expect(onStartSiteMonitoring).toHaveBeenCalledTimes(1);
        expect(onStopSiteMonitoring).not.toHaveBeenCalled();

        renderWithTheme(
            <SiteMonitoringButton
                {...defaultProps}
                allMonitorsRunning
                onStartSiteMonitoring={onStartSiteMonitoring}
                onStopSiteMonitoring={onStopSiteMonitoring}
            />
        );

        await user.click(
            screen.getByRole("button", { name: "Stop All Monitoring" })
        );

        expect(onStartSiteMonitoring).toHaveBeenCalledTimes(1);
        expect(onStopSiteMonitoring).toHaveBeenCalledTimes(1);
    });

    it("prevents card click handlers from seeing button clicks", () => {
        const onStartSiteMonitoring = vi.fn();
        const onParentClick = vi.fn();

        renderWithTheme(
            <div onClick={onParentClick}>
                <SiteMonitoringButton
                    {...defaultProps}
                    onStartSiteMonitoring={onStartSiteMonitoring}
                />
            </div>
        );

        fireEvent.click(
            screen.getByRole("button", { name: "Start All Monitoring" })
        );

        expect(onStartSiteMonitoring).toHaveBeenCalledTimes(1);
        expect(onParentClick).not.toHaveBeenCalled();
    });

    it("updates labels and icons when monitor state changes", () => {
        const { rerender } = renderWithTheme(
            <SiteMonitoringButton {...defaultProps} />
        );

        const startButton = screen.getByRole("button", {
            name: "Start All Monitoring",
        });
        expectButtonIcon(startButton, "play-all");

        rerender(
            <ThemeProvider>
                <SiteMonitoringButton
                    {...defaultProps}
                    allMonitorsRunning
                    className="card-action"
                />
            </ThemeProvider>
        );

        const stopButton = screen.getByRole("button", {
            name: "Stop All Monitoring",
        });
        expectButtonIcon(stopButton, "pause-filled");
        expect(stopButton).toHaveClass("card-action");
    });

    it.each([
        ["loading", /Finishing the previous request\./u],
        ["unconfigured", /Configure a monitor to enable this control\./u],
    ] as const)(
        "adds %s context to the tooltip copy",
        (disabledReason, expectedTooltipCopy) => {
            const { button } = renderButton({
                disabledReason,
                isLoading: true,
            });

            expect(button).toHaveAttribute("aria-describedby", "mock-tooltip");
            expect(screen.getByRole("tooltip")).toHaveTextContent(
                expectedTooltipCopy
            );
        }
    );
});
