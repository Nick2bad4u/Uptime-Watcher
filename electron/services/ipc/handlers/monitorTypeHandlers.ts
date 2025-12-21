import type { IpcInvokeChannel } from "@shared/types/ipc";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";

import { isMonitorTypeConfig } from "@shared/types/monitorTypes";
import { MONITOR_TYPES_CHANNELS } from "@shared/types/preload";
import { LOG_TEMPLATES } from "@shared/utils/logTemplates";
import { isRecord } from "@shared/utils/typeHelpers";
import { validateMonitorData } from "@shared/validation/monitorSchemas";

import { logger } from "../../../utils/logger";
import {
    getAllMonitorTypeConfigs,
    getMonitorTypeConfig,
} from "../../monitoring/MonitorTypeRegistry";
import {
    createValidationResponse,
    registerStandardizedIpcHandler,
} from "../utils";
import { MonitorTypeHandlerValidators } from "../validators";

type BaseMonitorUiConfig = ReturnType<
    typeof getAllMonitorTypeConfigs
>[0]["uiConfig"];

const pickOptionalString = (value: unknown): string | undefined =>
    typeof value === "string" ? value : undefined;

const pickBooleanWithFallback = (value: unknown, fallback: boolean): boolean =>
    typeof value === "boolean" ? value : fallback;

const ConfigPropertyValidator = {
    assertNoUnexpectedProperties(
        unexpectedProperties: Record<string, unknown>,
        monitorType: string
    ): void {
        const unexpectedEntries = Object.entries(unexpectedProperties);

        if (unexpectedEntries.length === 0) {
            return;
        }

        const errorMessage = `Monitor config '${monitorType}' contains unexpected properties`;
        const diagnosticError = new Error(errorMessage);

        logger.error(
            "[IpcService] Unexpected properties detected in monitor config",
            diagnosticError,
            {
                monitorType,
                unexpectedProperties: unexpectedEntries,
            }
        );

        throw diagnosticError;
    },

    extractAndValidateBaseProperties(
        config: ReturnType<typeof getAllMonitorTypeConfigs>[0]
    ): {
        baseProperties: {
            description: string;
            displayName: string;
            fields: ReturnType<typeof getAllMonitorTypeConfigs>[0]["fields"];
            type: string;
            uiConfig: BaseMonitorUiConfig;
            version: string;
        };
        unexpectedProperties: Record<string, unknown>;
    } {
        const {
            description,
            displayName,
            fields,
            type,
            uiConfig,
            version,
            ...rest
        } = config;

        const knownProperties = new Set([
            "description",
            "displayName",
            "fields",
            "serviceFactory",
            "type",
            "uiConfig",
            "validationSchema",
            "version",
        ]);

        const unexpectedProperties = Object.fromEntries(
            Object.entries(rest).filter(([key]) => !knownProperties.has(key))
        );

        return {
            baseProperties: {
                description,
                displayName,
                fields,
                type,
                uiConfig,
                version,
            },
            unexpectedProperties,
        };
    },
} as const;

const UiConfigSerializer = {
    serializeDetailFormats(
        detailFormats?: unknown
    ): undefined | { analyticsLabel?: string } {
        if (!isRecord(detailFormats)) {
            return undefined;
        }

        const analyticsLabel = pickOptionalString(
            detailFormats["analyticsLabel"]
        );

        if (analyticsLabel === undefined) {
            return undefined;
        }

        return { analyticsLabel };
    },

    serializeDisplayPreferences(
        display?: unknown
    ): undefined | { showAdvancedMetrics: boolean; showUrl: boolean } {
        if (!isRecord(display)) {
            return undefined;
        }

        return {
            showAdvancedMetrics: pickBooleanWithFallback(
                display["showAdvancedMetrics"],
                false
            ),
            showUrl: pickBooleanWithFallback(display["showUrl"], false),
        };
    },

    serializeHelpTexts(
        helpTexts?: unknown
    ): undefined | { primary?: string; secondary?: string } {
        if (!isRecord(helpTexts)) {
            return undefined;
        }

        const result: { primary?: string; secondary?: string } = {};

        const primary = pickOptionalString(helpTexts["primary"]);
        const secondary = pickOptionalString(helpTexts["secondary"]);

        if (primary !== undefined) {
            result.primary = primary;
        }

        if (secondary !== undefined) {
            result.secondary = secondary;
        }

        return Object.keys(result).length > 0 ? result : undefined;
    },

    serializeUiConfig(
        uiConfig?: BaseMonitorUiConfig
    ): MonitorTypeConfig["uiConfig"] {
        if (!uiConfig) {
            return undefined;
        }

        const result: NonNullable<MonitorTypeConfig["uiConfig"]> = {
            supportsAdvancedAnalytics:
                uiConfig.supportsAdvancedAnalytics ?? false,
            supportsResponseTime: uiConfig.supportsResponseTime ?? false,
        };

        const detailFormats = this.serializeDetailFormats(
            uiConfig.detailFormats
        );
        if (detailFormats) {
            result.detailFormats = detailFormats;
        }

        const display = this.serializeDisplayPreferences(uiConfig.display);
        if (display) {
            result.display = display;
        }

        const helpTexts = this.serializeHelpTexts(uiConfig.helpTexts);
        if (helpTexts) {
            result.helpTexts = helpTexts;
        }

        return result;
    },
} as const;

const serializeMonitorTypeConfig = (
    config: ReturnType<typeof getAllMonitorTypeConfigs>[0]
): MonitorTypeConfig => {
    const { baseProperties, unexpectedProperties } =
        ConfigPropertyValidator.extractAndValidateBaseProperties(config);

    ConfigPropertyValidator.assertNoUnexpectedProperties(
        unexpectedProperties,
        baseProperties.type
    );

    const serializedUiConfig = UiConfigSerializer.serializeUiConfig(
        baseProperties.uiConfig
    );

    const sanitizedConfig: MonitorTypeConfig = {
        description: baseProperties.description,
        displayName: baseProperties.displayName,
        fields: baseProperties.fields,
        type: baseProperties.type,
        version: baseProperties.version,
        ...(serializedUiConfig ? { uiConfig: serializedUiConfig } : {}),
    };

    if (!isMonitorTypeConfig(sanitizedConfig)) {
        logger.error(
            "[IpcService] Sanitized monitor type config failed validation",
            undefined,
            {
                monitorType: baseProperties.type,
                sanitizedConfig,
            }
        );

        throw new Error(
            `[IpcService] Invalid monitor type config produced for '${baseProperties.type}': ${JSON.stringify(
                sanitizedConfig
            )}`
        );
    }

    return sanitizedConfig;
};

/**
 * Dependencies required to register monitor type IPC handlers.
 */
export interface MonitorTypeHandlersDependencies {
    readonly registeredHandlers: Set<IpcInvokeChannel>;
}

/**
 * Registers IPC handlers that expose monitor type metadata.
 */
export function registerMonitorTypeHandlers({
    registeredHandlers,
}: MonitorTypeHandlersDependencies): void {
    registerStandardizedIpcHandler(
        MONITOR_TYPES_CHANNELS.getMonitorTypes,
        () => {
            const configs = getAllMonitorTypeConfigs();
            return configs.map((config) => serializeMonitorTypeConfig(config));
        },
        MonitorTypeHandlerValidators.getMonitorTypes,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        MONITOR_TYPES_CHANNELS.formatMonitorDetail,
        (monitorType, details) => {
            const config = getMonitorTypeConfig(monitorType.trim());
            if (!config) {
                logger.warn(
                    LOG_TEMPLATES.warnings.MONITOR_TYPE_UNKNOWN_DETAIL,
                    { monitorType }
                );
                return details;
            }

            if (config.uiConfig?.formatDetail) {
                return config.uiConfig.formatDetail(details);
            }

            return details;
        },
        MonitorTypeHandlerValidators.formatMonitorDetail,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        MONITOR_TYPES_CHANNELS.formatMonitorTitleSuffix,
        (monitorType, monitor) => {
            const config = getMonitorTypeConfig(monitorType.trim());
            if (!config) {
                logger.warn(LOG_TEMPLATES.warnings.MONITOR_TYPE_UNKNOWN_TITLE, {
                    monitorType,
                });
                return "";
            }

            if (config.uiConfig?.formatTitleSuffix) {
                return config.uiConfig.formatTitleSuffix(monitor);
            }

            return "";
        },
        MonitorTypeHandlerValidators.formatMonitorTitleSuffix,
        registeredHandlers
    );

    registerStandardizedIpcHandler(
        MONITOR_TYPES_CHANNELS.validateMonitorData,
        (monitorType, data) => {
            const result = validateMonitorData(monitorType.trim(), data);

            const metadata = isRecord(result.metadata)
                ? result.metadata
                : undefined;

            return createValidationResponse(
                result.success,
                result.errors,
                result.warnings,
                metadata
            );
        },
        MonitorTypeHandlerValidators.validateMonitorData,
        registeredHandlers
    );
}
