/**
 * @file Coverage tests for the themed StatusIndicator component.
 */

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const themeMock = vi.hoisted(() => ({
    currentTheme: {
        borderRadius: {
            full: "9999px",
        },
        spacing: {
            xs: "0.5rem",
        },
        typography: {
            fontSize: {
                base: "1rem",
                sm: "0.875rem",
                xs: "0.75rem",
            },
            fontWeight: {
                medium: 500,
            },
        },
    },
    getStatusColor: vi.fn((status: string) =>
        status === "down" ? "#ff4d4f" : "#22c55e"
    ),
}));

vi.mock("../../theme/useTheme", () => ({
    useTheme: () => themeMock,
}));

const statusUtilsMock = vi.hoisted(() => ({
    formatStatusLabel: vi.fn((status: string) => `label-${status}`),
    getStatusIconComponent: vi.fn(() =>
        vi.fn(({ color, size }: { color: string; size: number }) => (
            <span
                data-testid="status-icon"
                data-color={color}
                data-size={size}
            />
        ))
    ),
}));

vi.mock("../../utils/status", () => statusUtilsMock);

import { StatusIndicator } from "../../theme/components/StatusIndicator";

describe("StatusIndicator coverage", () => {
    beforeEach(() => {
        themeMock.getStatusColor.mockClear();
        statusUtilsMock.formatStatusLabel.mockClear();
        statusUtilsMock.getStatusIconComponent.mockClear();
    });

    it("renders a pulsing dot for pending status when text is hidden", () => {
        const { container } = render(
            <StatusIndicator showText={false} size="sm" status="pending" />
        );

        // eslint-disable-next-line testing-library/no-container -- Component does not expose semantic roles for the indicator dot
        const dot = container.querySelector(
            ".themed-status-indicator__dot"
        ) as HTMLElement | null;
        expect(dot).not.toBeNull();
        expect(dot).toHaveClass("themed-status-indicator__dot");
        expect(dot?.style.animation).toContain("pulse");
        expect(themeMock.getStatusColor).toHaveBeenCalledWith("pending");
        expect(statusUtilsMock.getStatusIconComponent).toHaveBeenCalledWith(
            "pending"
        );
    });

    it("renders icon badge and formatted label when text is requested", () => {
        render(<StatusIndicator showText size="lg" status="down" />);

        const iconContainer = screen.getByTestId("status-icon");
        expect(iconContainer).toHaveAttribute("data-color", "#ff4d4f");
        expect(iconContainer).toHaveAttribute("data-size", "22");
        expect(statusUtilsMock.formatStatusLabel).toHaveBeenCalledWith("down");
        expect(
            screen.getByText("label-down", { selector: "span" })
        ).toBeInTheDocument();
    });

    it("falls back to medium sizing by default", () => {
        const { container } = render(<StatusIndicator status="up" />);

        // eslint-disable-next-line testing-library/no-container -- Component does not render semantic roles for sizing assertions
        const dot = container.querySelector(
            ".themed-status-indicator__dot"
        ) as HTMLElement | null;
        expect(dot).not.toBeNull();
        expect(dot?.style.getPropertyValue("--status-indicator-size")).toBe(
            "14px"
        );
        expect(themeMock.getStatusColor).toHaveBeenCalledWith("up");
    });
});
