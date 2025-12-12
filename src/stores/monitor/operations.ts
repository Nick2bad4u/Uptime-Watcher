import type { ValidationResult } from "@shared/types/validation";

/**
 * Operational slice containing async monitor type actions.
 */
import { withErrorHandling } from "@shared/utils/errorHandling";

import type { MonitorTypesStoreGetter, MonitorTypesStoreSetter } from "./state";
import type { MonitorTypesStore } from "./types";

import { MonitorTypesService } from "../../services/MonitorTypesService";
import { logStoreAction } from "../utils";
import { createStoreErrorHandler } from "../utils/storeErrorHandling";

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
            createStoreErrorHandler(
                "monitor-types",
                "monitorTypes.formatMonitorDetail"
            )
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
            createStoreErrorHandler(
                "monitor-types",
                "monitorTypes.formatMonitorTitleSuffix"
            )
        ),
    loadMonitorTypes: async (): Promise<void> => {
        const state = getState();

        if (state.isLoaded) {
            return;
        }

        await withErrorHandling(
            async () => {
                logStoreAction("MonitorTypesStore", "loadMonitorTypes", {});

                // MonitorTypesService already validates the payload via shared
                // Zod schemas (validateMonitorTypeConfigArray). The store
                // intentionally trusts the service boundary to avoid
                // duplicating validation logic and creating diverging
                // codepaths.
                const configs = await MonitorTypesService.getMonitorTypes();

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
            createStoreErrorHandler("monitor-types", "monitorTypes.loadTypes")
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
            createStoreErrorHandler(
                "monitor-types",
                "monitorTypes.validateMonitorData"
            )
        ),
});
