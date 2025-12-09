import type { ValidationResult } from "@shared/types/validation";

/**
 * Operational slice containing async monitor type actions.
 */
import { isMonitorTypeConfig } from "@shared/types/monitorTypes";
import { withErrorHandling } from "@shared/utils/errorHandling";
import { isRecord as isSharedRecord } from "@shared/utils/typeHelpers";

import type { MonitorTypesStoreGetter, MonitorTypesStoreSetter } from "./state";
import type { MonitorTypesStore } from "./types";

import { logger } from "../../services/logger";
import { MonitorTypesService } from "../../services/MonitorTypesService";
import { logStoreAction } from "../utils";

const isUnknownRecord = (
    candidate: unknown
): candidate is Record<string, unknown> => isSharedRecord(candidate);

/**
 * Creates the operational slice wiring monitor type service calls.
 */
export const createMonitorTypesOperationsSlice = (
    setState: MonitorTypesStoreSetter,
    getState: MonitorTypesStoreGetter
): Pick<
    MonitorTypesStore,
    | "formatMonitorDetail"
    | "formatMonitorTitleSuffix"
    | "loadMonitorTypes"
    | "refreshMonitorTypes"
    | "validateMonitorData"
> => ({
    // MonitorTypesStore wires its error handling inline by passing the
    // store's own clearError/setError/setLoading actions to
    // withErrorHandling. This is an intentional use of the inline
    // ErrorHandlingFrontendStore pattern described in ADR-003 ("Store Error
    // Handling Contexts") so that monitor-type operations can reuse their
    // local error state rather than going through createStoreErrorHandler.
    formatMonitorDetail: async (type, details) =>
        withErrorHandling(
            async () => {
                logStoreAction("MonitorTypesStore", "formatMonitorDetail", {
                    type,
                });

                const result = await MonitorTypesService.formatMonitorDetail(
                    type,
                    details
                );
                const candidate = result as unknown;

                if (candidate === null || candidate === undefined) {
                    throw new Error(
                        `formatMonitorDetail returned null for type: ${type}`
                    );
                }

                logStoreAction("MonitorTypesStore", "formatMonitorDetail", {
                    resultLength: result.length,
                    success: true,
                    type,
                });

                return result;
            },
            {
                clearError: getState().clearError,
                setError: getState().setError,
                setLoading: getState().setLoading,
            }
        ),
    formatMonitorTitleSuffix: async (type, monitor) =>
        withErrorHandling(
            async () => {
                logStoreAction(
                    "MonitorTypesStore",
                    "formatMonitorTitleSuffix",
                    {
                        type,
                    }
                );

                const result =
                    await MonitorTypesService.formatMonitorTitleSuffix(
                        type,
                        monitor
                    );
                const candidate = result as unknown;

                if (candidate === null || candidate === undefined) {
                    throw new Error(
                        `formatMonitorTitleSuffix returned null for type: ${type}`
                    );
                }

                logStoreAction(
                    "MonitorTypesStore",
                    "formatMonitorTitleSuffix",
                    {
                        resultLength: result.length,
                        success: true,
                        type,
                    }
                );

                return result;
            },
            {
                clearError: getState().clearError,
                setError: getState().setError,
                setLoading: getState().setLoading,
            }
        ),
    loadMonitorTypes: async (): Promise<void> => {
        const state = getState();

        if (state.isLoaded && !state.lastError) {
            return;
        }

        await withErrorHandling(
            async () => {
                logStoreAction("MonitorTypesStore", "loadMonitorTypes", {});

                const rawConfigs = await MonitorTypesService.getMonitorTypes();
                const configsArray = Array.isArray(rawConfigs)
                    ? (rawConfigs as unknown[])
                    : [];

                const validConfigs: MonitorTypesStore["monitorTypes"] = [];
                const invalidConfigs: Array<{
                    index: number;
                    kind: string;
                }> = [];

                configsArray.forEach((candidate, index) => {
                    if (isMonitorTypeConfig(candidate)) {
                        validConfigs.push(candidate);
                    } else {
                        const kind = isUnknownRecord(candidate)
                            ? `keys:${Object.keys(candidate).join(",")}`
                            : `type:${typeof candidate}`;

                        invalidConfigs.push({ index, kind });
                    }
                });

                if (invalidConfigs.length > 0) {
                    logger.error(
                        "MonitorTypesStore dropped invalid monitor type configs",
                        undefined,
                        {
                            invalidCount: invalidConfigs.length,
                            samples: invalidConfigs.slice(0, 3),
                        }
                    );
                }

                const fieldMap: MonitorTypesStore["fieldConfigs"] = {};
                for (const config of validConfigs) {
                    fieldMap[config.type] = config.fields;
                }

                setState({
                    fieldConfigs: fieldMap,
                    isLoaded: true,
                    monitorTypes: validConfigs,
                });

                logStoreAction("MonitorTypesStore", "loadMonitorTypes", {
                    invalidCount: invalidConfigs.length,
                    success: true,
                    typesCount: validConfigs.length,
                });
            },
            {
                clearError: getState().clearError,
                setError: getState().setError,
                setLoading: getState().setLoading,
            }
        );
    },
    refreshMonitorTypes: async (): Promise<void> => {
        logStoreAction("MonitorTypesStore", "refreshMonitorTypes", {});
        setState({
            fieldConfigs: {},
            isLoaded: false,
            monitorTypes: [],
        });
        await getState().loadMonitorTypes();
    },
    validateMonitorData: async (type, data) =>
        withErrorHandling(
            async () => {
                logStoreAction("MonitorTypesStore", "validateMonitorData", {
                    type,
                });

                const validationResult =
                    await MonitorTypesService.validateMonitorData(type, data);

                if (!Array.isArray(validationResult.errors)) {
                    throw new TypeError(
                        "Invalid validation result received: errors payload missing"
                    );
                }

                const normalizedResult: ValidationResult = {
                    data: validationResult.data,
                    errors: Array.from(validationResult.errors),
                    metadata: validationResult.metadata
                        ? { ...validationResult.metadata }
                        : {},
                    success: validationResult.success,
                    warnings: validationResult.warnings
                        ? Array.from(validationResult.warnings)
                        : [],
                };

                logStoreAction("MonitorTypesStore", "validateMonitorData", {
                    errorCount: normalizedResult.errors.length,
                    success: normalizedResult.success,
                    type,
                });

                return normalizedResult;
            },
            {
                clearError: getState().clearError,
                setError: getState().setError,
                setLoading: getState().setLoading,
            }
        ),
});
