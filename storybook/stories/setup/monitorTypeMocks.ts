import type { MonitorTypeConfig } from "@shared/types/monitorTypes";

import { useMonitorTypesStore } from "../../../src/stores/monitor/useMonitorTypesStore";
import { clearMonitorTypeCache } from "../../../src/utils/monitorTypeHelper";
import { clearConfigCache } from "../../../src/utils/monitorUiHelpers";
import { setMockMonitorTypes } from "../../setup/electron-api-mock";

export const SAMPLE_MONITOR_TYPES: MonitorTypeConfig[] = [
    {
        description: "HTTP monitor with response time analytics",
        displayName: "HTTP Monitor",
        fields: [
            {
                label: "URL",
                name: "url",
                required: true,
                type: "url",
            },
            {
                label: "Timeout (ms)",
                min: 1000,
                name: "timeout",
                required: true,
                type: "number",
            },
        ],
        type: "http",
        uiConfig: {
            detailFormats: {
                analyticsLabel: "HTTP Response Time",
            },
            helpTexts: {
                primary: "Checks HTTP endpoints and records response time.",
            },
            supportsAdvancedAnalytics: true,
            supportsResponseTime: true,
        },
        version: "1.0.0",
    },
    {
        description: "Ping monitor without response time metrics",
        displayName: "Ping Monitor",
        fields: [
            {
                label: "Host",
                name: "host",
                required: true,
                type: "text",
            },
        ],
        type: "ping",
        uiConfig: {
            supportsAdvancedAnalytics: false,
            supportsResponseTime: false,
        },
        version: "1.0.0",
    },
];

export const prepareMonitorTypeMocks = (
    monitorTypes: MonitorTypeConfig[] = SAMPLE_MONITOR_TYPES
): void => {
    setMockMonitorTypes(monitorTypes);
    clearMonitorTypeCache();
    clearConfigCache();
    useMonitorTypesStore.setState(
        {
            fieldConfigs: {},
            isLoaded: false,
            monitorTypes: [],
        },
        false
    );
};
