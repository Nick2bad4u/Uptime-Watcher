import type { CoreComponentProperties } from "@shared/types/componentProps";

import {
    type CSSProperties,
    type JSX,
    memo,
    type NamedExoticComponent,
    useCallback,
    useMemo,
} from "react";

import type { ProgressSize, ProgressVariant } from "./types";

import { useTheme } from "../useTheme";
import { ThemedText } from "./ThemedText";

/**
 * Props for the ThemedProgress component
 *
 * @public
 */
export interface ThemedProgressProperties extends CoreComponentProperties {
    /** Optional label text to display with progress */
    readonly label?: string;
    /** Maximum value for progress calculation */
    readonly max?: number;
    /** Whether to display the label text */
    readonly showLabel?: boolean;
    /** Size variant for the progress bar */
    readonly size?: ProgressSize;
    /** Current progress value */
    readonly value: number;
    /** Color variant for the progress bar */
    readonly variant?: ProgressVariant;
}

/**
 * A themed progress bar component for showing completion status
 *
 * @param props - The progress properties
 *
 * @returns The themed progress JSX element
 *
 * @public
 */
const ThemedProgressComponent = ({
    className = "",
    label,
    max = 100,
    showLabel = false,
    size = "md",
    value,
    variant = "primary",
}: ThemedProgressProperties): JSX.Element => {
    const { currentTheme } = useTheme();

    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const getVariantColor = useCallback((): string => {
        switch (variant) {
            case "error": {
                return currentTheme.colors.error;
            }
            case "info": {
                return currentTheme.colors.primary[300];
            }
            case "primary": {
                return currentTheme.colors.primary[500];
            }
            case "secondary": {
                return currentTheme.colors.primary[400];
            }
            case "success": {
                return currentTheme.colors.success;
            }
            case "warning": {
                return currentTheme.colors.warning;
            }
            default: {
                return currentTheme.colors.primary[500];
            }
        }
    }, [
        currentTheme.colors.error,
        currentTheme.colors.primary,
        currentTheme.colors.success,
        currentTheme.colors.warning,
        variant,
    ]);

    const getHeight = useCallback((): string => {
        switch (size) {
            case "lg": {
                return "12px";
            }
            case "md": {
                return "8px";
            }
            case "sm": {
                return "6px";
            }
            case "xl": {
                return "16px";
            }
            case "xs": {
                return "4px";
            }
            default: {
                return "8px";
            }
        }
    }, [size]);

    const containerStyles = useMemo(
        (): CSSProperties => ({
            backgroundColor: currentTheme.colors.background.secondary,
            borderRadius: currentTheme.borderRadius.full,
            height: getHeight(),
            overflow: "hidden",
            position: "relative",
            width: "100%",
        }),
        [
            currentTheme.borderRadius.full,
            currentTheme.colors.background.secondary,
            getHeight,
        ]
    );

    const progressStyles = useMemo(
        (): CSSProperties => ({
            backgroundColor: getVariantColor(),
            borderRadius: currentTheme.borderRadius.full,
            height: "100%",
            transition: "width 0.3s ease-in-out",
            width: `${percentage}%`,
        }),
        [
            currentTheme.borderRadius.full,
            getVariantColor,
            percentage,
        ]
    );

    const labelContainerStyle = useMemo(
        () => ({
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
            marginBottom: currentTheme.spacing.xs,
        }),
        [currentTheme.spacing.xs]
    );

    const hiddenProgressStyle = useMemo(
        (): CSSProperties => ({
            left: "-9999px",
            position: "absolute" as const,
            top: "-9999px",
        }),
        []
    );

    // Extract labels JSX to avoid IIFE pattern
    const labelsJSX =
        showLabel || label ? (
            <div style={labelContainerStyle}>
                {label ? (
                    <ThemedText size="sm" variant="secondary">
                        {label}
                    </ThemedText>
                ) : null}
                {showLabel ? (
                    <ThemedText size="sm" variant="secondary">
                        {percentage.toFixed(1)}%
                    </ThemedText>
                ) : null}
            </div>
        ) : null;

    return (
        <div className={`themed-progress ${className}`}>
            {labelsJSX}
            <progress max={max} style={hiddenProgressStyle} value={value} />
            <div aria-hidden="true" style={containerStyles}>
                <div style={progressStyles} />
            </div>
        </div>
    );
};

export const ThemedProgress: NamedExoticComponent<ThemedProgressProperties> =
    memo(ThemedProgressComponent);
