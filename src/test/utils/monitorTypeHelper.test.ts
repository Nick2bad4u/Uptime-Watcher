/**
 * @file Tests for monitorTypeHelper utility functions.
 */

import type {
    MonitorTypeConfig,
    MonitorTypeOption,
} from "@shared/types/monitorTypes";

import { CacheKeys } from "@shared/utils/cacheKeys";
import * as errorHandling from "@shared/utils/errorHandling";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppCaches } from "../../utils/cache";
import {
    clearMonitorTypeCache,
    getMonitorTypeConfig,
    getMonitorTypeOptions,
} from "../../utils/monitorTypeHelper";

const cacheMocks = vi.hoisted(() => ({
    clear: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
}));

const monitorTypesStoreState = vi.hoisted(() => ({
    isLoaded: false,
    loadMonitorTypes: vi.fn(),
    monitorTypes: [] as MonitorTypeConfig[],
}));

vi.mock("../../utils/cache", () => ({
    AppCaches: {
        monitorTypes: {
            clear: cacheMocks.clear,
            get: cacheMocks.get,
            set: cacheMocks.set,
        },
    },
}));

vi.mock("../../stores/monitor/useMonitorTypesStore", () => ({
    useMonitorTypesStore: {
        getState: vi.fn(() => monitorTypesStoreState),
    },
}));

vi.mock("@shared/utils/errorHandling", () => ({
    withUtilityErrorHandling: vi.fn(
        async <T>(
            operation: () => Promise<T>,
            _context: string,
            _fallback: T
        ) => operation()
    ),
}));

const ALL_MONITOR_TYPES_CACHE_KEY =
    CacheKeys.config.byName("all-monitor-types");

const createMonitorTypeConfig = (
    overrides: Partial<MonitorTypeConfig> = {}
): MonitorTypeConfig => {
    const config: MonitorTypeConfig = {
        description: overrides.description ?? "Checks service reachability",
        displayName: overrides.displayName ?? "HTTP Monitor",
        fields: overrides.fields ?? [
            {
                label: "URL",
                name: "url",
                required: true,
                type: "url",
            },
        ],
        type: overrides.type ?? "http",
        version: overrides.version ?? "1.0.0",
    };

    if (overrides.uiConfig) {
        config.uiConfig = overrides.uiConfig;
    }

    return config;
};

const httpMonitorType = createMonitorTypeConfig({
    displayName: "HTTP Monitor",
    type: "http",
});

const pingMonitorType = createMonitorTypeConfig({
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
});

const portMonitorType = createMonitorTypeConfig({
    displayName: "Port Monitor",
    fields: [
        {
            label: "Port",
            name: "port",
            required: true,
            type: "number",
        },
    ],
    type: "port",
});

const mockMonitorTypes: MonitorTypeConfig[] = [
    httpMonitorType,
    pingMonitorType,
    portMonitorType,
];

const expectedOptionsFor = (
    configs: readonly MonitorTypeConfig[]
): MonitorTypeOption[] => {
    const seenTypes = new Set<MonitorTypeConfig["type"]>();
    const options: MonitorTypeOption[] = [];

    for (const config of configs) {
        if (seenTypes.has(config.type)) {
            continue;
        }

        seenTypes.add(config.type);
        options.push({
            label: config.displayName,
            value: config.type,
        });
    }

    return options;
};

beforeEach(() => {
    vi.clearAllMocks();

    monitorTypesStoreState.isLoaded = true;
    monitorTypesStoreState.loadMonitorTypes.mockResolvedValue(undefined);
    monitorTypesStoreState.monitorTypes = [...mockMonitorTypes];

    vi.mocked(errorHandling.withUtilityErrorHandling).mockImplementation(
        async <T>(
            operation: () => Promise<T>,
            _context: string,
            _fallback: T
        ) => operation()
    );
});

describe(clearMonitorTypeCache, () => {
    it("clears monitor type cache entries", () => {
        clearMonitorTypeCache();

        expect(AppCaches.monitorTypes.clear).toHaveBeenCalledTimes(1);
    });
});

describe(getMonitorTypeConfig, () => {
    it("reads matching monitor type configs from the cache", async () => {
        vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(mockMonitorTypes);

        await expect(getMonitorTypeConfig("ping")).resolves.toEqual(
            pingMonitorType
        );

        expect(AppCaches.monitorTypes.get).toHaveBeenCalledWith(
            ALL_MONITOR_TYPES_CACHE_KEY
        );
        expect(monitorTypesStoreState.loadMonitorTypes).not.toHaveBeenCalled();
    });

    it("returns undefined when the requested monitor type is absent", async () => {
        vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(mockMonitorTypes);

        await expect(getMonitorTypeConfig("missing")).resolves.toBeUndefined();
    });

    it("loads monitor types from the store on cache miss", async () => {
        monitorTypesStoreState.isLoaded = false;
        vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(undefined);

        await expect(getMonitorTypeConfig("http")).resolves.toEqual(
            httpMonitorType
        );

        expect(monitorTypesStoreState.loadMonitorTypes).toHaveBeenCalledTimes(
            1
        );
        expect(AppCaches.monitorTypes.set).toHaveBeenCalledWith(
            ALL_MONITOR_TYPES_CACHE_KEY,
            mockMonitorTypes
        );
    });

    it("clears invalid cache data before falling back to the store", async () => {
        vi.mocked(AppCaches.monitorTypes.get).mockReturnValue([
            {
                ...httpMonitorType,
                fields: [],
            },
        ]);

        await expect(getMonitorTypeConfig("http")).resolves.toEqual(
            httpMonitorType
        );

        expect(AppCaches.monitorTypes.clear).toHaveBeenCalledTimes(1);
    });
});

describe(getMonitorTypeOptions, () => {
    it("returns de-duplicated options in monitor type order", async () => {
        const duplicatedMonitorTypes = [
            httpMonitorType,
            {
                ...httpMonitorType,
                displayName: "Duplicate HTTP Monitor",
                version: "1.0.1",
            },
            pingMonitorType,
        ];
        vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(
            duplicatedMonitorTypes
        );

        await expect(getMonitorTypeOptions()).resolves.toEqual(
            expectedOptionsFor(duplicatedMonitorTypes)
        );
    });

    it("returns an empty option list from the error fallback", async () => {
        vi.mocked(AppCaches.monitorTypes.get).mockReturnValue(undefined);
        vi.mocked(errorHandling.withUtilityErrorHandling).mockResolvedValue([]);

        await expect(getMonitorTypeOptions()).resolves.toEqual([]);

        expect(errorHandling.withUtilityErrorHandling).toHaveBeenCalledWith(
            expect.any(Function),
            "Fetch monitor types from backend",
            []
        );
        expect(AppCaches.monitorTypes.set).toHaveBeenCalledWith(
            ALL_MONITOR_TYPES_CACHE_KEY,
            []
        );
    });
});
