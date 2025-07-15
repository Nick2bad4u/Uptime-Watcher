/**
 * React components for dynamic monitor UI behavior.
 * These components handle async loading of monitor configurations and provide
 * consistent UI behavior across different monitor types.
 */

import React, { useEffect, useState } from "react";
import type { MonitorType } from "../../types";
import { logger } from "../../services";
import {
    formatMonitorDetail,
    supportsResponseTime as checkSupportsResponseTime,
    supportsAdvancedAnalytics as checkSupportsAdvancedAnalytics,
    allSupportsResponseTime,
    allSupportsAdvancedAnalytics,
} from "../../utils/monitorUiHelpers";

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

/**
 * Component that conditionally renders based on advanced analytics support.
 */
interface ConditionalAdvancedAnalyticsProps {
    readonly monitorType: MonitorType;
    readonly children: React.ReactNode;
    readonly fallback?: React.ReactNode;
}

export function ConditionalAdvancedAnalytics({ monitorType, children, fallback }: ConditionalAdvancedAnalyticsProps) {
    const [supportsAdvanced, setSupportsAdvanced] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        let isCancelled = false;

        const checkSupport = async () => {
            try {
                const supports = await checkSupportsAdvancedAnalytics(monitorType);
                if (!isCancelled) {
                    setSupportsAdvanced(supports);
                    setIsLoading(false);
                }
            } catch (error) {
                logger.warn("Failed to check advanced analytics support", error as Error);
                if (!isCancelled) {
                    setSupportsAdvanced(false);
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

    return supportsAdvanced ? children : fallback;
}

/**
 * Component that conditionally renders based on multiple monitor types support.
 */
interface ConditionalMultipleTypesProps {
    readonly monitorTypes: MonitorType[];
    readonly feature: "responseTime" | "advancedAnalytics";
    readonly children: React.ReactNode;
    readonly fallback?: React.ReactNode;
}

export function ConditionalMultipleTypes({ monitorTypes, feature, children, fallback }: ConditionalMultipleTypesProps) {
    const [supportsFeature, setSupportsFeature] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        let isCancelled = false;

        const checkSupport = async () => {
            try {
                const checkFunction =
                    feature === "responseTime" ? allSupportsResponseTime : allSupportsAdvancedAnalytics;
                const supports = await checkFunction(monitorTypes);

                if (!isCancelled) {
                    setSupportsFeature(supports);
                    setIsLoading(false);
                }
            } catch (error) {
                logger.warn(`Failed to check ${feature} support for multiple types`, error as Error);
                if (!isCancelled) {
                    setSupportsFeature(false);
                    setIsLoading(false);
                }
            }
        };

        void checkSupport();

        return () => {
            isCancelled = true;
        };
    }, [monitorTypes, feature]);

    if (isLoading) {
        return fallback;
    }

    return supportsFeature ? children : fallback;
}
