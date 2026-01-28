/**
 * React components for dynamic monitor UI behavior. These components handle
 * async loading of monitor configurations and provide consistent UI behavior
 * across different monitor types.
 */

import type { MonitorType } from "@shared/types";
import type { JSX } from "react/jsx-runtime";

import { type ReactNode, useEffect, useState } from "react";

import { logger } from "../../services/logger";
import {
    supportsResponseTime as checkSupportsResponseTime,
    formatMonitorDetail,
} from "../../utils/monitorUiHelpers";

/**
 * Component that conditionally renders based on response time support.
 *
 * @public
 */
export interface ConditionalResponseTimeProperties {
    /** React node to render when response time is supported */
    readonly children: ReactNode;
    /** React node to render when response time is not supported or while loading */
    readonly fallback?: ReactNode;
    /** Type of monitor to check for response time support */
    readonly monitorType: MonitorType;
}

/**
 * Component that dynamically formats monitor detail labels. Handles async
 * loading of monitor configuration.
 *
 * @public
 */
export interface DetailLabelProperties {
    /** Raw details string to format */
    readonly details: string;
    /** Fallback text to display if formatting fails */
    readonly fallback?: string;
    /** Type of monitor for context-specific formatting */
    readonly monitorType: MonitorType;
}

/**
 * Conditionally renders children based on monitor type's response time support.
 *
 * @remarks
 * Asynchronously checks if the monitor type supports response time measurements
 * and renders children only if supported, otherwise renders fallback content.
 *
 * @param props - Component properties
 *
 * @returns React node based on response time support
 *
 * @public
 */
export function ConditionalResponseTime({
    children,
    fallback,
    monitorType,
}: ConditionalResponseTimeProperties): ReactNode {
    const [supportsResponseTime, setSupportsResponseTime] =
        useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(
        function checkResponseTimeSupport() {
            let isCancelled = false;

            const checkSupport = async (): Promise<void> => {
                try {
                    const supports =
                        await checkSupportsResponseTime(monitorType);
                    if (!isCancelled) {
                        setSupportsResponseTime(supports);
                        setIsLoading(false);
                    }
                } catch (error) {
                    // Log the error but gracefully degrade to false (no
                    // response time support) This follows project pattern of
                    // non-critical feature degradation
                    logger.warn(
                        "Failed to check response time support",
                        error
                    );
                    if (!isCancelled) {
                        setSupportsResponseTime(false);
                        setIsLoading(false);
                    }
                    // Note: Error is not re-thrown here as this is a UI
                    // enhancement feature that should degrade gracefully rather
                    // than break the component
                }
            };

            void checkSupport();

            return (): void => {
                isCancelled = true;
            };
        },
        [monitorType]
    );

    if (isLoading) {
        return fallback;
    }

    return supportsResponseTime ? children : fallback;
}

/**
 * Dynamically formats and displays monitor detail labels.
 *
 * @remarks
 * Asynchronously formats detail strings using monitor type-specific formatting
 * rules. Gracefully degrades to fallback text if formatting fails.
 *
 * @param props - Component properties
 *
 * @returns JSX element containing the formatted label
 *
 * @public
 */
export const DetailLabel = ({
    details,
    fallback = details,
    monitorType,
}: DetailLabelProperties): JSX.Element => {
    const [formattedLabel, setFormattedLabel] = useState<string>(fallback);

    useEffect(
        function formatDetailLabel() {
            let isCancelled = false;

            const formatLabel = async (): Promise<void> => {
                try {
                    const formatted = await formatMonitorDetail(
                        monitorType,
                        details
                    );
                    if (!isCancelled) {
                        setFormattedLabel(formatted);
                    }
                } catch (error) {
                    // Log the error but gracefully degrade to fallback text
                    // This follows project pattern of non-critical feature
                    // degradation
                    logger.warn(
                        "Failed to format detail label",
                        error
                    );
                    if (!isCancelled) {
                        setFormattedLabel(fallback);
                    }
                    // Note: Error is not re-thrown here as this is a UI
                    // enhancement feature that should degrade gracefully rather
                    // than break the component
                }
            };

            void formatLabel();

            return (): void => {
                isCancelled = true;
            };
        },
        [
            details,
            fallback,
            monitorType,
        ]
    );

    return <span>{formattedLabel}</span>;
};
