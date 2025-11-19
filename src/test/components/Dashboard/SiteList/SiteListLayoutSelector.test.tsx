/**
 * Unit tests for the refreshed SiteListLayoutSelector segmented control.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { ReactNode } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { SiteListLayoutSelector } from "../../../../components/Dashboard/SiteList/SiteListLayoutSelector";

vi.mock("../../../../components/common/Tooltip/Tooltip", () => ({
    Tooltip: ({
        children,
    }: {
        children: (props: Record<string, unknown>) => ReactNode;
    }) => <>{children({})}</>,
}));

vi.mock("../../../../utils/icons", () => {
    const createIcon = (name: string) => {
        const Icon = ({
            className,
            size = 16,
        }: {
            className?: string;
            size?: number;
        }) => (
            <svg
                aria-hidden="true"
                className={className}
                data-icon={name}
                data-size={size}
                focusable="false"
            />
        );
        Icon.displayName = `MockIcon(${name})`;
        return Icon;
    };

    return {
        AppIcons: {
            actions: {},
            layout: {
                cards: createIcon("cards"),
                compact: createIcon("compact"),
                grid: createIcon("grid"),
                gridAlt: createIcon("grid-alt"),
                list: createIcon("list"),
                listAlt: createIcon("list-alt"),
                stacked: createIcon("stacked"),
                table: createIcon("table"),
                viewColumns: createIcon("view-columns"),
            },
            metrics: {},
            settings: {},
            status: {},
            theme: {},
            ui: {},
        },
    };
});

describe("site list layout selector", () => {
    const onLayoutChange = vi.fn();
    const onPresentationChange = vi.fn();
    const onListDensityChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should mark the active layout and dispatch layout changes", () => {
        render(
            <SiteListLayoutSelector
                cardPresentation="grid"
                listDensity="comfortable"
                layout="card-large"
                onLayoutChange={onLayoutChange}
                onListDensityChange={onListDensityChange}
                onPresentationChange={onPresentationChange}
            />
        );

        const largeButton = screen.getByRole("button", { name: "Large" });
        expect(largeButton).toHaveAttribute("aria-pressed", "true");

        const listButton = screen.getByRole("button", { name: "List" });
        expect(listButton).toHaveAttribute("aria-pressed", "false");

        fireEvent.click(listButton);
        expect(onLayoutChange).toHaveBeenCalledWith("list");
    });

    it("should toggle presentation when large cards are active", () => {
        render(
            <SiteListLayoutSelector
                cardPresentation="grid"
                listDensity="comfortable"
                layout="card-large"
                onLayoutChange={onLayoutChange}
                onListDensityChange={onListDensityChange}
                onPresentationChange={onPresentationChange}
            />
        );

        const gridButton = screen.getByRole("button", { name: "Grid" });
        const stackedButton = screen.getByRole("button", { name: "Stacked" });

        expect(gridButton).toHaveAttribute("aria-pressed", "true");
        fireEvent.click(stackedButton);
        expect(onPresentationChange).toHaveBeenCalledWith("stacked");
    });

    it("should hide presentation toggles when compact layouts are active", () => {
        render(
            <SiteListLayoutSelector
                cardPresentation="grid"
                listDensity="comfortable"
                layout="list"
                onLayoutChange={onLayoutChange}
                onListDensityChange={onListDensityChange}
                onPresentationChange={onPresentationChange}
            />
        );

        expect(
            screen.queryByRole("button", { name: "Grid" })
        ).not.toBeInTheDocument();

        // Density controls should be present in list mode
        expect(
            screen.getByRole("button", { name: "Comfortable" })
        ).toBeInTheDocument();
    });

    it("should toggle list density when list view is active", () => {
        render(
            <SiteListLayoutSelector
                cardPresentation="grid"
                listDensity="comfortable"
                layout="list"
                onLayoutChange={onLayoutChange}
                onListDensityChange={onListDensityChange}
                onPresentationChange={onPresentationChange}
            />
        );

        const comfortableButton = screen.getByRole("button", {
            name: "Comfortable",
        });
        const compactButton = screen.getByRole("button", {
            name: "Compact",
        });

        expect(comfortableButton).toHaveAttribute("aria-pressed", "true");
        expect(compactButton).toHaveAttribute("aria-pressed", "false");

        fireEvent.click(compactButton);
        expect(onListDensityChange).toHaveBeenCalledWith("compact");
    });
});
