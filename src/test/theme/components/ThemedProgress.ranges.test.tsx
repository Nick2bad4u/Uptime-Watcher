import type { ReactElement } from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ThemedProgress } from "../../../theme/components/ThemedProgress";
import { ThemeProvider } from "../../../theme/components/ThemeProvider";

const renderWithTheme = (ui: ReactElement) =>
    render(<ThemeProvider>{ui}</ThemeProvider>);

const renderProgress = (
    props: Partial<React.ComponentProps<typeof ThemedProgress>> = {}
) => renderWithTheme(<ThemedProgress max={100} value={50} {...props} />);

const getVisualBar = () => {
    const visualBar = document.querySelector(
        ".themed-progress [aria-hidden='true'] > div"
    );

    expect(visualBar).toBeInstanceOf(HTMLElement);

    return visualBar as HTMLElement;
};

describe("ThemedProgress", () => {
    it("renders the native progress element and visual progress width", () => {
        renderProgress({ max: 200, value: 60 });

        const progress = screen.getByRole("progressbar");

        expect(progress).toHaveAttribute("max", "200");
        expect(progress).toHaveAttribute("value", "60");
        expect(getVisualBar()).toHaveStyle({ width: "30%" });
    });

    it.each([
        [-50, "0%"],
        [0, "0%"],
        [100, "100%"],
        [150, "100%"],
    ])("clamps value %s to %s", (value, expectedWidth) => {
        renderProgress({ value });

        expect(getVisualBar()).toHaveStyle({ width: expectedWidth });
    });

    it("supports non-standard max values and fractional percentages", () => {
        renderProgress({ max: 3, showLabel: true, value: 1 });

        expect(getVisualBar()).toHaveStyle({ width: "33.33333333333333%" });
        expect(screen.getByText("33.3%")).toBeInTheDocument();
    });

    it("renders optional labels and custom classes", () => {
        renderProgress({
            className: "custom-progress",
            label: "Upload",
            showLabel: true,
            value: 25,
        });

        expect(document.querySelector(".themed-progress")).toHaveClass(
            "custom-progress"
        );
        expect(screen.getByText("Upload")).toBeInTheDocument();
        expect(screen.getByText("25.0%")).toBeInTheDocument();
    });

    it.each([
        "error",
        "info",
        "primary",
        "secondary",
        "success",
        "warning",
    ] as const)("renders the %s color variant", (variant) => {
        renderProgress({ variant });

        expect(getVisualBar().style.backgroundColor).not.toBe("");
    });

    it.each([
        ["xs", "4px"],
        ["sm", "6px"],
        ["md", "8px"],
        ["lg", "12px"],
        ["xl", "16px"],
    ] as const)("renders the %s height", (size, expectedHeight) => {
        renderProgress({ size });

        const track = getVisualBar().parentElement;

        expect(track).toHaveStyle({ height: expectedHeight });
    });
});
