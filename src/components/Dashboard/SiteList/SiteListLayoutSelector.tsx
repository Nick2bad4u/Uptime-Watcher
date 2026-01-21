/**
 * Segmented control allowing users to switch between site list layouts.
 */

import {
    memo,
    type MouseEvent,
    type NamedExoticComponent,
    type ReactNode,
    useCallback,
} from "react";

import type {
    InterfaceDensity,
    SiteCardPresentation,
    SiteListLayoutMode,
} from "../../../stores/ui/types";
import type { ToggleGroupOption } from "./SiteListToggleGroup";

import { AppIcons } from "../../../utils/icons";
import { ToggleGroup } from "./SiteListToggleGroup";

/**
 * Properties for {@link SiteListLayoutSelector}.
 */
export interface SiteListLayoutSelectorProperties {
    /** Active presentation for large cards. */
    readonly cardPresentation: SiteCardPresentation;
    /** Currently active layout mode. */
    readonly layout: SiteListLayoutMode;
    /** Active density for the list (table) layout. */
    readonly listDensity: InterfaceDensity;
    /** Callback invoked when a new layout is selected. */
    readonly onLayoutChange: (layout: SiteListLayoutMode) => void;
    /** Callback invoked when list density changes. */
    readonly onListDensityChange: (density: InterfaceDensity) => void;
    /** Callback invoked when presentation mode changes. */
    readonly onPresentationChange: (presentation: SiteCardPresentation) => void;
}

type LayoutOption = ToggleGroupOption<SiteListLayoutMode>;

const LAYOUT_OPTIONS: readonly LayoutOption[] = [
    {
        description: "Rich cards with full metrics",
        Icon: AppIcons.layout.cards,
        label: "Large",
        value: "card-large",
    },
    {
        description: "Space-efficient cards for quick scanning",
        Icon: AppIcons.layout.compact,
        label: "Mini",
        value: "card-compact",
    },
    {
        description: "Spreadsheet-style summary",
        Icon: AppIcons.layout.listAlt,
        label: "List",
        value: "list",
    },
];

type PresentationOption = ToggleGroupOption<SiteCardPresentation>;

const PRESENTATION_OPTIONS: readonly PresentationOption[] = [
    {
        description: "Balanced grid that shows multiple cards at a glance",
        Icon: AppIcons.layout.gridAlt,
        label: "Grid",
        value: "grid",
    },
    {
        description: "Expanded single-column cards with richer details",
        Icon: AppIcons.layout.stacked,
        label: "Stacked",
        value: "stacked",
    },
];

type DensityOption = ToggleGroupOption<InterfaceDensity>;

const DENSITY_OPTIONS: readonly DensityOption[] = [
    {
        description: "Relaxed spacing ideal for focused reviews",
        Icon: AppIcons.layout.table,
        label: "Comfortable",
        value: "comfortable",
    },
    {
        description: "Balanced spacing for everyday monitoring",
        Icon: AppIcons.layout.listAlt,
        label: "Cozy",
        value: "cozy",
    },
    {
        description: "High information density for large fleets",
        Icon: AppIcons.layout.viewColumns,
        label: "Compact",
        value: "compact",
    },
];

const isLayoutMode = (value: string): value is SiteListLayoutMode =>
    LAYOUT_OPTIONS.some((option) => option.value === value);

const isPresentationMode = (value: string): value is SiteCardPresentation =>
    PRESENTATION_OPTIONS.some((option) => option.value === value);

const isDensityMode = (value: string): value is InterfaceDensity =>
    DENSITY_OPTIONS.some((option) => option.value === value);

const getLayoutDataAttributes = (
    value: SiteListLayoutMode
): Record<string, string> => ({ "data-layout-mode": value });

const getPresentationDataAttributes = (
    value: SiteCardPresentation
): Record<string, string> => ({ "data-presentation-mode": value });

const getDensityDataAttributes = (
    value: InterfaceDensity
): Record<string, string> => ({
    "data-density-mode": value,
});

/**
 * Layout selector for the site list.
 */
export const SiteListLayoutSelector: NamedExoticComponent<SiteListLayoutSelectorProperties> =
    memo(function SiteListLayoutSelector({
        cardPresentation,
        layout,
        listDensity,
        onLayoutChange,
        onListDensityChange,
        onPresentationChange,
    }: SiteListLayoutSelectorProperties) {
        const handleLayoutButtonClick = useCallback(
            (event: MouseEvent<HTMLButtonElement>) => {
                const { layoutMode } = event.currentTarget.dataset;
                if (
                    !layoutMode ||
                    !isLayoutMode(layoutMode) ||
                    layoutMode === layout
                ) {
                    return;
                }
                onLayoutChange(layoutMode);
            },
            [layout, onLayoutChange]
        );

        const handlePresentationButtonClick = useCallback(
            (event: MouseEvent<HTMLButtonElement>) => {
                const { presentationMode } = event.currentTarget.dataset;
                if (
                    !presentationMode ||
                    !isPresentationMode(presentationMode) ||
                    presentationMode === cardPresentation
                ) {
                    return;
                }
                onPresentationChange(presentationMode);
            },
            [cardPresentation, onPresentationChange]
        );

        const handleDensityButtonClick = useCallback(
            (event: MouseEvent<HTMLButtonElement>) => {
                const { densityMode } = event.currentTarget.dataset;
                if (
                    !densityMode ||
                    !isDensityMode(densityMode) ||
                    densityMode === listDensity
                ) {
                    return;
                }

                onListDensityChange(densityMode);
            },
            [listDensity, onListDensityChange]
        );

        const layoutSegment = (
            <ToggleGroup
                ariaLabel="Card layout"
                buttonClassName="site-list__layout-button"
                buttonClassNameActive="site-list__layout-button--active"
                containerClassName="site-list__layout-options"
                getDataAttributes={getLayoutDataAttributes}
                iconClassName="site-list__layout-icon"
                labelClassName="site-list__layout-label"
                onClick={handleLayoutButtonClick}
                options={LAYOUT_OPTIONS}
                selectedValue={layout}
            />
        );

        let secondarySegment: null | ReactNode = null;

        if (layout === "card-large") {
            secondarySegment = (
                <ToggleGroup
                    ariaLabel="Large card presentation"
                    buttonClassName="site-list__presentation-button"
                    buttonClassNameActive="site-list__presentation-button--active"
                    containerClassName="site-list__presentation-toggle"
                    getDataAttributes={getPresentationDataAttributes}
                    iconClassName="site-list__presentation-icon"
                    labelClassName="site-list__presentation-label"
                    onClick={handlePresentationButtonClick}
                    options={PRESENTATION_OPTIONS}
                    selectedValue={cardPresentation}
                />
            );
        } else if (layout === "list") {
            secondarySegment = (
                <ToggleGroup
                    ariaLabel="List density"
                    buttonClassName="site-list__presentation-button"
                    buttonClassNameActive="site-list__presentation-button--active"
                    containerClassName="site-list__presentation-toggle"
                    getDataAttributes={getDensityDataAttributes}
                    iconClassName="site-list__presentation-icon"
                    labelClassName="site-list__presentation-label"
                    onClick={handleDensityButtonClick}
                    options={DENSITY_OPTIONS}
                    selectedValue={listDensity}
                />
            );
        }

        return (
            <div
                aria-label="Site layout controls"
                className="site-list__layout-selector"
            >
                {secondarySegment}
                {layoutSegment}
            </div>
        );
    });
