import React from "react";

import { useTheme } from "../useTheme";
import ThemedText from "./ThemedText";

/**
 * Props for the ThemedProgress component
 *
 * @public
 */
export interface ThemedProgressProperties {
    readonly className?: string;
    readonly label?: string;
    readonly max?: number;
    readonly showLabel?: boolean;
    readonly size?: "lg" | "md" | "sm" | "xs";
    readonly value: number;
    readonly variant?: "error" | "primary" | "success" | "warning";
}

/**
 * A themed progress bar component for showing completion status
 *
 * @param props - The progress properties
 * @returns The themed progress JSX element
 * @public
 */
const ThemedProgress = ({
    className = "",
    label,
    max = 100,
    showLabel = false,
    size = "md",
    value,
    variant = "primary",
}: ThemedProgressProperties): React.JSX.Element => {
    const { currentTheme } = useTheme();

    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const getVariantColor = () => {
        switch (variant) {
            case "error": {
                return currentTheme.colors.error;
            }
            case "primary": {
                return currentTheme.colors.primary[500];
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
    };

    const getHeight = () => {
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
            case "xs": {
                return "4px";
            }
            default: {
                return "8px";
            }
        }
    };

    const containerStyles: React.CSSProperties = {
        backgroundColor: currentTheme.colors.background.secondary,
        borderRadius: currentTheme.borderRadius.full,
        height: getHeight(),
        overflow: "hidden",
        position: "relative",
        width: "100%",
    };

    const progressStyles: React.CSSProperties = {
        backgroundColor: getVariantColor(),
        borderRadius: currentTheme.borderRadius.full,
        height: "100%",
        transition: "width 0.3s ease-in-out",
        width: `${percentage}%`,
    };

    return (
        <div className={`themed-progress ${className}`}>
            {showLabel || label ? (
                <div
                    style={{
                        alignItems: "center",
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: currentTheme.spacing.xs,
                    }}
                >
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
            ) : null}
            <progress
                max={max}
                style={{
                    left: "-9999px",
                    position: "absolute",
                    top: "-9999px",
                }}
                value={value}
            />
            <div aria-hidden="true" style={containerStyles}>
                <div style={progressStyles} />
            </div>
        </div>
    );
};

export default ThemedProgress;
