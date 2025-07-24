/**
 * React components for dynamic monitor UI behavior.
 * These components handle async loading of monitor configurations and provide
 * consistent UI behavior across different monitor types.
 */

import React, { useEffect, useState } from "react";

import type { MonitorType } from "../../types";

import logger from "../../services/logger";
import { supportsResponseTime as checkSupportsResponseTime, formatMonitorDetail } from "../../utils/monitorUiHelpers";

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
 * Component that dynamically formats monitor detail labels.
 * Handles async loading of monitor configuration.
 *
 * @public
 */
export interface DetailLabelProps {
    readonly details: string;
    readonly fallback?: string;
    readonly monitorType: MonitorType;
}

// eslint-disable-next-line sonarjs/function-return-type -- React component can return different node types
export function ConditionalResponseTime({
    children,
    fallback,
    monitorType,
}: ConditionalResponseTimeProps): React.ReactNode {
    const [supportsResponseTime, setSupportsResponseTime] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        let isCancelled = false;

        const checkSupport = async () => {
            try {
                const supports = await checkSupportsResponseTime(monitorType);
                if (!isCancelled) {
                    setSupportsResponseTime(supports);
                    setIsLoading(false);
                }
            } catch (error) {
                logger.warn("Failed to check response time support", error as Error);
                if (!isCancelled) {
                    setSupportsResponseTime(false);
                    setIsLoading(false);
                }
            }
        };

        void checkSupport();

        return () => {
            isCancelled = true;
        };
    }, [monitorType]);

    if (isLoading) {
        return fallback;
    }

    return supportsResponseTime ? children : fallback;
}

export function DetailLabel({ details, fallback = details, monitorType }: DetailLabelProps) {
    const [formattedLabel, setFormattedLabel] = useState<string>(fallback);

    useEffect(() => {
        let isCancelled = false;

        const formatLabel = async () => {
            try {
                const formatted = await formatMonitorDetail(monitorType, details);
                if (!isCancelled) {
                    setFormattedLabel(formatted);
                }
            } catch (error) {
                logger.warn("Failed to format detail label", error as Error);
                if (!isCancelled) {
                    setFormattedLabel(fallback);
                }
            }
        };

        void formatLabel();

        return () => {
            isCancelled = true;
        };
    }, [monitorType, details, fallback]);

    return <span>{formattedLabel}</span>;
}
