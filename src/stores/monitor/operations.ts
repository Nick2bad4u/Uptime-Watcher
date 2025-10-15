import type { ValidationResult } from "@shared/types/validation";

/**
 * Operational slice containing async monitor type actions.
 */
import { withErrorHandling } from "@shared/utils/errorHandling";

import type { MonitorTypesStoreGetter, MonitorTypesStoreSetter } from "./state";
import type { MonitorTypesStore } from "./types";

import { MonitorTypesService } from "../../services/MonitorTypesService";
import { logStoreAction } from "../utils";

const isValidMonitorTypeConfig = (
    candidate: unknown
): candidate is MonitorTypesStore["monitorTypes"][0] => {
    if (typeof candidate !== "object" || candidate === null) {
        return false;
    }

    if (!("type" in candidate)) {
        return false;
    }

    const typed = candidate as { type: unknown };

    return typeof typed.type === "string" && typed.type.length > 0;
};

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

                const configs = configsArray.filter(isValidMonitorTypeConfig);

                const fieldMap: MonitorTypesStore["fieldConfigs"] = {};
                for (const config of configs) {
                    fieldMap[config.type] = config.fields;
                }

                setState({
                    fieldConfigs: fieldMap,
                    isLoaded: true,
                    monitorTypes: configs,
                });

                logStoreAction("MonitorTypesStore", "loadMonitorTypes", {
                    success: true,
                    typesCount: configs.length,
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
