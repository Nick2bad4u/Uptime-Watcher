/**
 * React components for dynamic monitor UI behavior. These components handle
 * async loading of monitor configurations and provide consistent UI behavior
 * across different monitor types.
 */

import type { MonitorType } from "@shared/types";
import type { JSX } from "react/jsx-runtime";

import React, { useEffect, useState } from "react";

import logger from "../../services/logger";
import {
    supportsResponseTime as checkSupportsResponseTime,
    formatMonitorDetail,
} from "../../utils/monitorUiHelpers";

/**
 * Component that conditionally renders based on response time support.
 *
 * @public
 */
export interface ConditionalResponseTimeProps {
    readonly children: React.ReactNode;
    readonly fallback?: React.ReactNode;
    readonly monitorType: MonitorType;
}

/**
 * Component that dynamically formats monitor detail labels. Handles async
 * loading of monitor configuration.
 *
 * @public
 */
export interface DetailLabelProps {
    readonly details: string;
    readonly fallback?: string;
    readonly monitorType: MonitorType;
}

// eslint-disable-next-line sonarjs/function-return-type -- React components legitimately return different node types (JSX elements, fragments, null, etc.)
export function ConditionalResponseTime({
    children,
    fallback,
    monitorType,
}: ConditionalResponseTimeProps): React.ReactNode {
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
                        error as Error
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

export const DetailLabel = ({
    details,
    fallback = details,
    monitorType,
}: DetailLabelProps): JSX.Element => {
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
                        error as Error
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
