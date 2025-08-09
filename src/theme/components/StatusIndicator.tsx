/**
 * StatusIndicator component for displaying status with optional text and various sizes.
 */

import type { SiteStatus } from "@shared/types";
import type { JSX } from "react/jsx-runtime";

import React from "react";

import { getStatusIcon } from "../../utils/status";
import { useTheme } from "../useTheme";

/**
 * Props for the StatusIndicator component
 *
 * @public
 */
export interface StatusIndicatorProperties {
    readonly className?: string;
    readonly showText?: boolean;
    readonly size?: "lg" | "md" | "sm";
    readonly status: SiteStatus;
}

const StatusIndicator = ({
    className = "",
    showText = false,
    size = "md",
    status,
}: StatusIndicatorProperties): JSX.Element => {
    const { currentTheme, getStatusColor } = useTheme();

    const getSizeStyles = () => {
        switch (size) {
            case "lg": {
                return {
                    fontSize: currentTheme.typography.fontSize.base,
                    height: "16px",
                    iconSize: "20px",
                    width: "16px",
                };
            }
            case "md": {
                return {
                    fontSize: currentTheme.typography.fontSize.sm,
                    height: "12px",
                    iconSize: "16px",
                    width: "12px",
                };
            }
            case "sm": {
                return {
                    fontSize: currentTheme.typography.fontSize.xs,
                    height: "8px",
                    iconSize: "12px",
                    width: "8px",
                };
            }
            default: {
                return { iconSize: "16px" };
            }
        }
    };

    const sizeStyles = getSizeStyles();

    const indicatorStyle: React.CSSProperties = {
        animation:
            status === "pending"
                ? "pulse 1.5s ease-in-out infinite"
                : undefined,
        backgroundColor: getStatusColor(status),
        borderRadius: currentTheme.borderRadius.full,
        boxShadow: `0 0 0 2px ${currentTheme.colors.background.primary}`,
        height: sizeStyles.height,
        position: "relative",
        width: sizeStyles.width,
    };

    const iconStyle: React.CSSProperties = {
        alignItems: "center",
        display: "flex",
        fontSize: sizeStyles.iconSize,
        justifyContent: "center",
        lineHeight: "1",
    };

    const textStyle: React.CSSProperties = {
        alignItems: "center",
        color: getStatusColor(status),
        display: "flex",
        fontSize: sizeStyles.fontSize,
        fontWeight: currentTheme.typography.fontWeight.medium,
        gap: currentTheme.spacing.xs,
        marginLeft: currentTheme.spacing.xs,
    };

    return (
        <div
            className={`themed-status-indicator ${className}`}
            style={{ alignItems: "center", display: "flex" }}
        >
            {showText ? (
                <div style={iconStyle}>{getStatusIcon(status)}</div>
            ) : (
                <div
                    className="themed-status-indicator__dot"
                    style={indicatorStyle}
                />
            )}
            {showText ? (
                <span
                    className="themed-status-indicator__text"
                    style={textStyle}
                >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
            ) : null}
        </div>
    );
};

export default StatusIndicator;
