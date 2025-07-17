/**
 * React components for dynamic monitor UI behavior.
 * These components handle async loading of monitor configurations and provide
 * consistent UI behavior across different monitor types.
 */

import React, { useEffect, useState } from "react";
import type { MonitorType } from "../../types";
import logger from "../../services/logger";
import { formatMonitorDetail, supportsResponseTime as checkSupportsResponseTime } from "../../utils/monitorUiHelpers";

/**
 * Component that dynamically formats monitor detail labels.
 * Handles async loading of monitor configuration.
 */
interface DetailLabelProps {
    readonly monitorType: MonitorType;
    readonly details: string;
    readonly fallback?: string;
}

export function DetailLabel({ monitorType, details, fallback = details }: DetailLabelProps) {
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

/**
 * Component that conditionally renders based on response time support.
 */
interface ConditionalResponseTimeProps {
    readonly monitorType: MonitorType;
    readonly children: React.ReactNode;
    readonly fallback?: React.ReactNode;
}

export function ConditionalResponseTime({ monitorType, children, fallback }: ConditionalResponseTimeProps) {
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
