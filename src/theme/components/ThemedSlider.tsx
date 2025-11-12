/**
 * Themed slider component with consistent styling and accessibility support.
 *
 * @remarks
 * Provides a range input that adopts the application's theme tokens for the
 * track and thumb. The component exposes the standard set of range input
 * properties alongside accessibility attributes, ensuring a11y-compliant volume
 * and intensity controls throughout the UI surface.
 *
 * @example Basic slider usage:
 *
 * ```tsx
 * <ThemedSlider
 *     aria-label="Adjust polling interval"
 *     min={0}
 *     max={100}
 *     step={5}
 *     value={pollingInterval}
 *     onChange={handlePollingIntervalChange}
 * />;
 * ```
 *
 * @public
 */

import type {
    AccessibilityProperties,
    CoreComponentProperties,
    EventHandlers,
} from "@shared/types/componentProps";

import {
    type CSSProperties,
    type JSX,
    memo,
    type NamedExoticComponent,
    useMemo,
} from "react";

import type { Theme } from "../types";

import { ARIA_LABEL, TRANSITION_ALL } from "../../constants";
import { useThemeValue } from "../useTheme";

const selectSliderAccentColor = (theme: Theme): string =>
    theme.colors.primary[500];

/**
 * Properties for the themed slider component.
 *
 * @public
 */
export interface ThemedSliderProperties
    extends AccessibilityProperties,
        CoreComponentProperties {
    /** Textual representation for assistive tech */
    readonly "aria-valuetext"?: string;
    /** Optional identifier associated with the range input */
    readonly id?: string;
    /** Maximum slider value */
    readonly max?: number;
    /** Minimum slider value */
    readonly min?: number;
    /** Form name attribute */
    readonly name?: string;
    /** Pointer blur handler */
    readonly onBlur?: EventHandlers.Blur;
    /** Change handler invoked with the DOM event */
    readonly onChange?: EventHandlers.ChangeWithEvent;
    /** Pointer focus handler */
    readonly onFocus?: EventHandlers.Focus;
    /** Slider granularity */
    readonly step?: number;
    /** Current slider value */
    readonly value?: number;
}

/**
 * Themed slider primitive built on top of the native range input.
 *
 * @param props - Slider configuration options.
 *
 * @returns Slider element matching the active theme.
 */
const ThemedSliderComponent = ({
    "aria-describedby": ariaDescribedBy,
    "aria-valuetext": ariaValueText,
    [ARIA_LABEL]: ariaLabel,
    className = "",
    disabled = false,
    id,
    max = 100,
    min = 0,
    name,
    onBlur,
    onChange,
    onFocus,
    step = 1,
    value,
}: ThemedSliderProperties): JSX.Element => {
    const accentColor = useThemeValue(selectSliderAccentColor);

    const sliderStyles = useMemo(
        (): CSSProperties => ({
            accentColor,
            blockSize: "0.375rem",
            transition: TRANSITION_ALL,
            width: "100%",
        }),
        [accentColor]
    );

    const sliderValue = value ?? 0;

    return (
        <input
            aria-describedby={ariaDescribedBy}
            aria-label={ariaLabel}
            aria-valuetext={ariaValueText}
            className={`themed-slider ${className}`.trim()}
            disabled={disabled}
            id={id}
            max={max}
            min={min}
            name={name}
            onBlur={onBlur}
            onChange={onChange}
            onFocus={onFocus}
            step={step}
            style={sliderStyles}
            type="range"
            value={sliderValue}
        />
    );
};

export const ThemedSlider: NamedExoticComponent<ThemedSliderProperties> = memo(
    ThemedSliderComponent
);
