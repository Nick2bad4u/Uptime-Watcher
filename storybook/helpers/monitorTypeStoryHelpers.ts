/**
 * Storybook helper utilities for priming the monitor type store.
 */

import type { MonitorTypeConfig } from "@shared/types/monitorTypes";

import { useMonitorTypesStore } from "@app/stores/monitor/useMonitorTypesStore";

import { setMockMonitorTypes } from "../setup/electron-api-mock";
import { SAMPLE_MONITOR_TYPES } from "../stories/setup/monitorTypeMocks";

const createFieldConfigMap = (
    configs: readonly MonitorTypeConfig[]
): Record<string, MonitorTypeConfig["fields"]> => {
    const fieldConfigs: Record<string, MonitorTypeConfig["fields"]> = {};

    for (const config of configs) {
        fieldConfigs[config.type] = config.fields;
    }

    return fieldConfigs;
};

/**
 * Primes the monitor type store and electron mock with provided configurations.
 *
 * @param configs - Monitor type configurations to seed. Defaults to
 *   {@link SAMPLE_MONITOR_TYPES}.
 */
export const prepareMonitorTypesStore = (
    configs: readonly MonitorTypeConfig[] = SAMPLE_MONITOR_TYPES
): void => {
    const monitorTypes = configs.map(
        (config): MonitorTypeConfig => ({ ...config })
    );
    setMockMonitorTypes(monitorTypes);

    useMonitorTypesStore.setState({
        fieldConfigs: createFieldConfigMap(monitorTypes),
        isLoaded: true,
        isLoading: false,
        lastError: undefined,
        monitorTypes,
    });
};
