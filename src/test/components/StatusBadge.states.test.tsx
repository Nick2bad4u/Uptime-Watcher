import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { StatusBadgeProperties } from "../../components/common/StatusBadge";

import { StatusBadge } from "../../components/common/StatusBadge";
import { ThemeProvider } from "../../theme/components/ThemeProvider";

const renderStatusBadge = (props: Partial<StatusBadgeProperties> = {}) =>
    render(
        <ThemeProvider>
            <StatusBadge label="Status" status="up" {...props} />
        </ThemeProvider>
    );

const expectStatusIndicator = (labelText: string) => {
    expect(
        screen
            .getByText(labelText)
            .parentElement?.querySelector(".themed-status-indicator")
    ).toBeInTheDocument();
};

describe("StatusBadge", () => {
    it("renders the default label, status, and icon", () => {
        renderStatusBadge();

        expect(screen.getByText("Status: up")).toBeInTheDocument();
        expectStatusIndicator("Status: up");
    });

    it.each<NonNullable<StatusBadgeProperties["size"]>>([
        "xs",
        "sm",
        "base",
        "lg",
        "xl",
        "2xl",
        "3xl",
        "4xl",
    ])("supports the %s text size", (size) => {
        renderStatusBadge({ label: `Size ${size}`, size });

        expect(screen.getByText(`Size ${size}: up`)).toBeInTheDocument();
        expectStatusIndicator(`Size ${size}: up`);
    });

    it("uses a custom formatter and can hide the icon", () => {
        renderStatusBadge({
            formatter: (label, status) =>
                `${label.toUpperCase()} => ${status.toUpperCase()}`,
            label: "custom",
            showIcon: false,
            status: "paused",
        });

        const badgeLabel = screen.getByText("CUSTOM => PAUSED");

        expect(badgeLabel).toBeInTheDocument();
        expect(
            badgeLabel.parentElement?.querySelector(".themed-status-indicator")
        ).toBeNull();
    });

    it("combines caller classes with the badge layout", () => {
        renderStatusBadge({ className: "custom-badge", label: "Class Test" });

        expect(screen.getByText("Class Test: up").parentElement).toHaveClass(
            "flex",
            "items-center",
            "custom-badge"
        );
    });

    it("falls back to a small icon for an unknown runtime size", () => {
        renderStatusBadge({
            label: "Unknown Size",
            size: "compact" as NonNullable<StatusBadgeProperties["size"]>,
        });

        expect(screen.getByText("Unknown Size: up")).toBeInTheDocument();
        expectStatusIndicator("Unknown Size: up");
    });
});
