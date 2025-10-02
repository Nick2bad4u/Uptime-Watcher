/**
 * Segmented control allowing users to switch between site list layouts.
 */

import type { IconType } from "react-icons";

import {
    memo,
    type MouseEvent,
    type NamedExoticComponent,
    useCallback,
} from "react";

import type {
    SiteCardPresentation,
    SiteListLayoutMode,
} from "../../../stores/ui/types";

import { AppIcons } from "../../../utils/icons";
import { Tooltip } from "../../common/Tooltip/Tooltip";

/**
 * Properties for {@link SiteListLayoutSelector}.
 */
export interface SiteListLayoutSelectorProperties {
    /** Active presentation for large cards. */
    readonly cardPresentation: SiteCardPresentation;
    /** Currently active layout mode. */
    readonly layout: SiteListLayoutMode;
    /** Callback invoked when a new layout is selected. */
    readonly onLayoutChange: (layout: SiteListLayoutMode) => void;
    /** Callback invoked when presentation mode changes. */
    readonly onPresentationChange: (presentation: SiteCardPresentation) => void;
}

interface LayoutOption {
    readonly description: string;
    readonly Icon: IconType;
    readonly label: string;
    readonly value: SiteListLayoutMode;
}

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

interface PresentationOption {
    readonly description: string;
    readonly Icon: IconType;
    readonly label: string;
    readonly value: SiteCardPresentation;
}

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

const isLayoutMode = (value: string): value is SiteListLayoutMode =>
    LAYOUT_OPTIONS.some((option) => option.value === value);

const isPresentationMode = (value: string): value is SiteCardPresentation =>
    PRESENTATION_OPTIONS.some((option) => option.value === value);

/**
 * Layout selector for the site list.
 */
export const SiteListLayoutSelector: NamedExoticComponent<SiteListLayoutSelectorProperties> =
    memo(function SiteListLayoutSelector({
        cardPresentation,
        layout,
        onLayoutChange,
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

        return (
            <div
                aria-label="Site layout controls"
                className="site-list__layout-selector"
            >
                <div
                    aria-label="Card layout"
                    className="site-list__layout-options"
                    role="radiogroup"
                >
                    {LAYOUT_OPTIONS.map((option) => {
                        const { description, Icon, label, value } = option;
                        const isActive = value === layout;
                        return (
                            <Tooltip
                                content={description}
                                key={value}
                                position="bottom"
                            >
                                {(triggerProps) => (
                                    <button
                                        aria-pressed={isActive}
                                        className={
                                            isActive
                                                ? "site-list__layout-button site-list__layout-button--active"
                                                : "site-list__layout-button"
                                        }
                                        data-layout-mode={value}
                                        onClick={handleLayoutButtonClick}
                                        type="button"
                                        {...triggerProps}
                                    >
                                        <Icon className="site-list__layout-icon" />
                                        <span className="site-list__layout-label">
                                            {label}
                                        </span>
                                    </button>
                                )}
                            </Tooltip>
                        );
                    })}
                </div>

                {layout === "card-large" ? (
                    <div
                        aria-label="Large card presentation"
                        className="site-list__presentation-toggle"
                        role="radiogroup"
                    >
                        {PRESENTATION_OPTIONS.map((option) => {
                            const { description, Icon, label, value } = option;
                            const isActive = value === cardPresentation;
                            return (
                                <Tooltip
                                    content={description}
                                    key={value}
                                    position="bottom"
                                >
                                    {(triggerProps) => (
                                        <button
                                            aria-pressed={isActive}
                                            className={
                                                isActive
                                                    ? "site-list__presentation-button site-list__presentation-button--active"
                                                    : "site-list__presentation-button"
                                            }
                                            data-presentation-mode={value}
                                            onClick={
                                                handlePresentationButtonClick
                                            }
                                            type="button"
                                            {...triggerProps}
                                        >
                                            <Icon className="site-list__presentation-icon" />
                                            <span className="site-list__presentation-label">
                                                {label}
                                            </span>
                                        </button>
                                    )}
                                </Tooltip>
                            );
                        })}
                    </div>
                ) : null}
            </div>
        );
    });
