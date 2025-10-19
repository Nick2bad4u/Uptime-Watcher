/**
 * Storybook helper utilities for priming the monitor type store.
 */

import type { MonitorTypeConfig } from "@shared/types/monitorTypes";

import { useMonitorTypesStore } from "@app/stores/monitor/useMonitorTypesStore";

import { SAMPLE_MONITOR_TYPES } from "../stories/setup/monitorTypeMocks";
import { setMockMonitorTypes } from "../setup/electron-api-mock";

const createFieldConfigMap = (
    configs: readonly MonitorTypeConfig[]
): Record<string, MonitorTypeConfig["fields"]> => {
    const fieldEntries = configs.map((config) => [config.type, config.fields]);

    return Object.fromEntries(fieldEntries);
};

/**
 * Primes the monitor type store and electron mock with provided configurations.
 *
 * @param configs - Monitor type configurations to seed. Defaults to
 *   {@link SAMPLE_MONITOR_TYPES}.
 */
export const primeMonitorTypesStore = (
    configs: readonly MonitorTypeConfig[] = SAMPLE_MONITOR_TYPES
): void => {
    const monitorTypes = configs.map((config) => ({ ...config }));
    setMockMonitorTypes(monitorTypes as MonitorTypeConfig[]);

    useMonitorTypesStore.setState({
        fieldConfigs: createFieldConfigMap(monitorTypes),
        isLoaded: true,
        isLoading: false,
        lastError: undefined,
        monitorTypes: monitorTypes as MonitorTypeConfig[],
    });
};
