/**
 * Segmented control allowing users to switch between site list layouts.
 */

import type { SiteListLayoutMode } from "../../../stores/ui/types";

import {
    memo,
    type MouseEvent,
    type NamedExoticComponent,
    useCallback,
} from "react";

import { ThemedText } from "../../../theme/components/ThemedText";

/**
 * Properties for {@link SiteListLayoutSelector}.
 */
export interface SiteListLayoutSelectorProperties {
    /** Currently active layout mode. */
    readonly layout: SiteListLayoutMode;
    /** Callback invoked when a new layout is selected. */
    readonly onLayoutChange: (layout: SiteListLayoutMode) => void;
}

interface LayoutOption {
    readonly description: string;
    readonly icon: string;
    readonly label: string;
    readonly value: SiteListLayoutMode;
}

const LAYOUT_OPTIONS: readonly LayoutOption[] = [
    {
        description: "Rich cards with full metrics",
        icon: "🧱",
        label: "Large",
        value: "card-large",
    },
    {
        description: "Space-efficient cards for quick scanning",
        icon: "📇",
        label: "Mini",
        value: "card-compact",
    },
    {
        description: "Spreadsheet-style summary",
        icon: "🗒️",
        label: "List",
        value: "list",
    },
];

/**
 * Layout selector for the site list.
 */
export const SiteListLayoutSelector: NamedExoticComponent<SiteListLayoutSelectorProperties> =
    memo(function SiteListLayoutSelector({
        layout,
        onLayoutChange,
    }: SiteListLayoutSelectorProperties) {
        const handleButtonClick = useCallback(
            (event: MouseEvent<HTMLButtonElement>) => {
                const { layoutMode } = event.currentTarget.dataset;
                if (!layoutMode || layoutMode === layout) {
                    return;
                }
                onLayoutChange(layoutMode as SiteListLayoutMode);
            },
            [layout, onLayoutChange]
        );

        return (
            <div
                aria-label="Change site list layout"
                className="site-list__layout-selector"
                role="radiogroup"
            >
                {LAYOUT_OPTIONS.map((option) => {
                    const isActive = option.value === layout;
                    return (
                        <button
                            aria-pressed={isActive}
                            className={
                                isActive
                                    ? "site-list__layout-button site-list__layout-button--active"
                                    : "site-list__layout-button"
                            }
                            data-layout-mode={option.value}
                            key={option.value}
                            onClick={handleButtonClick}
                            type="button"
                        >
                            <span
                                aria-hidden="true"
                                className="site-list__layout-icon"
                            >
                                {option.icon}
                            </span>
                            <ThemedText size="sm" weight="medium">
                                {option.label}
                            </ThemedText>
                            <ThemedText size="xs" variant="tertiary">
                                {option.description}
                            </ThemedText>
                        </button>
                    );
                })}
            </div>
        );
    });
