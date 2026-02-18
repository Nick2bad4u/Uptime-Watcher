/**
 * StatusIndicator component for displaying status with optional text and
 * various sizes.
 */

import type { SiteStatus } from "@shared/types";
import type { CoreComponentProperties } from "@shared/types/componentProps";
import type { CSSProperties, JSX, NamedExoticComponent } from "react";

import { createElement, memo, useMemo } from "react";

import { formatStatusLabel, getStatusIconComponent } from "../../utils/status";
import { useTheme } from "../useTheme";

type StatusIndicatorStyle = CSSProperties & {
    readonly "--status-indicator-color"?: string;
    readonly "--status-indicator-size"?: string;
};

const STATUS_CONTAINER_STYLE: CSSProperties = {
    alignItems: "center",
    display: "flex",
};

/**
 * Props for the StatusIndicator component
 *
 * @public
 */
export interface StatusIndicatorProperties extends CoreComponentProperties {
    /** Whether to display status text alongside the indicator */
    readonly showText?: boolean;
    /** Size variant for the status indicator */
    readonly size?: "lg" | "md" | "sm";
    /** Current status to display */
    readonly status: SiteStatus;
}

export const StatusIndicator: NamedExoticComponent<StatusIndicatorProperties> =
    memo(function StatusIndicatorComponent({
        className = "",
        showText = false,
        size = "md",
        status,
    }: StatusIndicatorProperties): JSX.Element {
        const { currentTheme, getStatusColor } = useTheme();

        const sizeStyles = useMemo(() => {
            if (size === "lg") {
                return {
                    badgeSize: "2.25rem",
                    dotSize: "18px",
                    fontSize: currentTheme.typography.fontSize.base,
                    iconSize: "22px",
                } as const;
            }

            if (size === "sm") {
                return {
                    badgeSize: "1.5rem",
                    dotSize: "10px",
                    fontSize: currentTheme.typography.fontSize.xs,
                    iconSize: "14px",
                } as const;
            }

            return {
                badgeSize: "1.85rem",
                dotSize: "14px",
                fontSize: currentTheme.typography.fontSize.sm,
                iconSize: "18px",
            } as const;
        }, [
            currentTheme.typography.fontSize.base,
            currentTheme.typography.fontSize.sm,
            currentTheme.typography.fontSize.xs,
            size,
        ]);
        const statusIconComponent = useMemo(
            () => getStatusIconComponent(status),
            [status]
        );
        const iconPixelSize = Number.parseInt(sizeStyles.iconSize, 10) || 16;
        const baseColor = getStatusColor(status);

        const dotStyle = useMemo<StatusIndicatorStyle>(
            () => ({
                "--status-indicator-color": baseColor,
                "--status-indicator-size": sizeStyles.dotSize,
                animation:
                    status === "pending"
                        ? "pulse 1.5s ease-in-out infinite"
                        : undefined,
                borderRadius: currentTheme.borderRadius.full,
            }),
            [
                baseColor,
                currentTheme.borderRadius.full,
                sizeStyles,
                status,
            ]
        );

        const iconStyle = useMemo<StatusIndicatorStyle>(
            () => ({
                "--status-indicator-color": baseColor,
                "--status-indicator-size": sizeStyles.badgeSize,
                alignItems: "center",
                borderRadius: currentTheme.borderRadius.full,
                display: "flex",
                justifyContent: "center",
            }),
            [
                baseColor,
                currentTheme.borderRadius.full,
                sizeStyles,
            ]
        );

        const textStyle = useMemo<CSSProperties>(
            () => ({
                alignItems: "center",
                color: baseColor,
                display: "flex",
                fontSize: sizeStyles.fontSize,
                fontWeight: currentTheme.typography.fontWeight.medium,
                gap: currentTheme.spacing.xs,
                marginInlineStart: currentTheme.spacing.xs,
            }),
            [
                baseColor,
                currentTheme.spacing.xs,
                currentTheme.typography.fontWeight.medium,
                sizeStyles,
            ]
        );

        const containerStyle = STATUS_CONTAINER_STYLE;

        return (
            <div
                className={`themed-status-indicator ${className}`}
                style={containerStyle}
            >
                {showText ? (
                    <div
                        className="themed-status-indicator__icon"
                        style={iconStyle}
                    >
                        {createElement(statusIconComponent, {
                            color: baseColor,
                            size: iconPixelSize,
                        })}
                    </div>
                ) : (
                    <div
                        className="themed-status-indicator__dot"
                        style={dotStyle}
                    />
                )}
                {showText ? (
                    <span
                        className="themed-status-indicator__text"
                        style={textStyle}
                    >
                        {formatStatusLabel(status)}
                    </span>
                ) : null}
            </div>
        );
    });
