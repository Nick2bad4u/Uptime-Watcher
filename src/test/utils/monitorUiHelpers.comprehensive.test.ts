import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Monitor, MonitorType } from "../../../shared/types";
import type { MonitorTypeConfig } from "../../../shared/types/monitorTypes";
import { CacheKeys } from "../../../shared/utils/cacheKeys";

const cacheMocks = vi.hoisted(() => ({
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
}));

const monitorTypeHelperMocks = vi.hoisted(() => ({
    getAvailableMonitorTypes: vi.fn(),
    getMonitorTypeConfig: vi.fn(),
}));

const monitorTypesServiceMocks = vi.hoisted(() => ({
    formatMonitorDetail: vi.fn(),
    formatMonitorTitleSuffix: vi.fn(),
    getMonitorTypes: vi.fn(),
    validateMonitorData: vi.fn(),
    initialize: vi.fn(),
}));

const monitorTypesStoreState = vi.hoisted(() => ({
    clearError: vi.fn(),
    fieldConfigs: {} as Record<string, unknown>,
    formatMonitorDetail: vi.fn(),
    formatMonitorTitleSuffix: vi.fn(),
    getFieldConfig: vi.fn(),
    isLoaded: true,
    isLoading: false,
    lastError: undefined as unknown,
    loadMonitorTypes: vi.fn(),
    monitorTypes: [] as MonitorTypeConfig[],
    refreshMonitorTypes: vi.fn(),
    setError: vi.fn(),
    setLoading: vi.fn(),
    validateMonitorData: vi.fn(),
}));

const mockCacheGet = cacheMocks.get;
const mockCacheSet = cacheMocks.set;
const mockCacheClear = cacheMocks.clear;

vi.mock("../../utils/cache", () => ({
    AppCaches: {
        uiHelpers: {
            get: cacheMocks.get,
            set: cacheMocks.set,
            clear: cacheMocks.clear,
        },
    },
}));

vi.mock("@shared/utils/errorHandling", () => ({
    withUtilityErrorHandling: vi.fn(
        async <T>(
            operation: () => Promise<T>,
            _context: string,
            fallback: T
        ) => {
            try {
                return await operation();
            } catch {
                return fallback;
            }
        }
    ),
}));

const mockGetAvailableMonitorTypes =
    monitorTypeHelperMocks.getAvailableMonitorTypes;
const mockGetMonitorTypeConfig = monitorTypeHelperMocks.getMonitorTypeConfig;

vi.mock("../../utils/monitorTypeHelper", () => ({
    getAvailableMonitorTypes: monitorTypeHelperMocks.getAvailableMonitorTypes,
    getMonitorTypeConfig: monitorTypeHelperMocks.getMonitorTypeConfig,
}));

vi.mock("../../services/MonitorTypesService", () => ({
    MonitorTypesService: monitorTypesServiceMocks,
}));

const loadMonitorTypesMock = monitorTypesStoreState.loadMonitorTypes;

vi.mock("../../stores/monitor/useMonitorTypesStore", () => ({
    useMonitorTypesStore: {
        getState: () => monitorTypesStoreState,
    },
}));

import {
    allSupportsAdvancedAnalytics,
    allSupportsResponseTime,
    clearConfigCache,
    formatMonitorDetail,
    formatMonitorTitleSuffix,
    getAnalyticsLabel,
    getDefaultMonitorId,
    getMonitorHelpTexts,
    getTypesWithFeature,
    shouldShowUrl,
    supportsAdvancedAnalytics,
    supportsResponseTime,
} from "../../utils/monitorUiHelpers";
import { MonitorTypesService } from "../../services/MonitorTypesService";

const configMap = new Map<string, MonitorTypeConfig>();

const getCacheKeyForType = (type: string): string =>
    CacheKeys.config.byName(`monitor-config-${type}`);

const createConfig = (
    type: string,
    overrides: Partial<MonitorTypeConfig> = {}
): MonitorTypeConfig => {
    if (overrides.uiConfig === null) {
        return {
            type: overrides.type ?? type,
            displayName:
                overrides.displayName ??
                `${String(type).toUpperCase()} Monitor`,
            description: overrides.description ?? "Monitor configuration",
            fields: overrides.fields ?? [],
            version: overrides.version ?? "1.0.0",
            uiConfig: undefined,
        };
    }

    const detailFormats = overrides.uiConfig?.detailFormats ?? {};
    const display = overrides.uiConfig?.display ?? {};
    const helpTexts = overrides.uiConfig?.helpTexts ?? {};

    const { analyticsLabel, ...detailFormatsRest } = detailFormats;
    const { showUrl, ...displayRest } = display;
    const { primary, secondary, ...helpTextsRest } = helpTexts;

    return {
        type: overrides.type ?? type,
        displayName:
            overrides.displayName ?? `${String(type).toUpperCase()} Monitor`,
        description: overrides.description ?? "Monitor configuration",
        fields: overrides.fields ?? [],
        version: overrides.version ?? "1.0.0",
        uiConfig: {
            detailFormats: {
                ...detailFormatsRest,
                analyticsLabel:
                    analyticsLabel ??
                    `${String(type).toUpperCase()} Response Time`,
            },
            display: {
                ...displayRest,
                showUrl: showUrl ?? true,
            },
            helpTexts: {
                ...helpTextsRest,
                primary: primary ?? "Primary help",
                secondary: secondary ?? "Secondary help",
            },
            supportsAdvancedAnalytics:
                overrides.uiConfig?.supportsAdvancedAnalytics ?? false,
            supportsResponseTime:
                overrides.uiConfig?.supportsResponseTime ?? false,
        },
    };
};

const storeConfig = (
    type: string,
    overrides: Partial<MonitorTypeConfig> = {}
): MonitorTypeConfig => {
    const config = createConfig(type, overrides);
    configMap.set(getCacheKeyForType(type), config);
    return config;
};

const buildMonitor = (overrides: Partial<Monitor> = {}): Monitor => ({
    checkInterval: 30_000,
    history: [],
    id: "monitor-id",
    monitoring: true,
    responseTime: 100,
    retryAttempts: 3,
    status: "up",
    timeout: 5000,
    type: "http",
    url: "https://example.com",
    ...overrides,
});

beforeEach(() => {
    configMap.clear();
    vi.clearAllMocks();

    mockCacheGet.mockImplementation((key: string) => configMap.get(key));
    mockCacheSet.mockImplementation((key: string, value: MonitorTypeConfig) => {
        configMap.set(key, value);
    });
    mockCacheClear.mockImplementation(() => {
        configMap.clear();
    });

    mockGetMonitorTypeConfig.mockResolvedValue(undefined);
    mockGetAvailableMonitorTypes.mockResolvedValue([]);

    monitorTypesStoreState.monitorTypes = [];
    monitorTypesStoreState.isLoaded = true;
    monitorTypesStoreState.isLoading = false;
    monitorTypesStoreState.lastError = undefined;
    monitorTypesStoreState.fieldConfigs = {};

    loadMonitorTypesMock.mockResolvedValue(undefined);

    monitorTypesStoreState.formatMonitorDetail.mockImplementation(
        (type, details) =>
            MonitorTypesService.formatMonitorDetail(type, details)
    );
    monitorTypesStoreState.formatMonitorTitleSuffix.mockImplementation(
        (type, monitor) =>
            MonitorTypesService.formatMonitorTitleSuffix(type, monitor)
    );

    const mockedService = vi.mocked(MonitorTypesService);
    mockedService.formatMonitorDetail.mockResolvedValue("Formatted detail");
    mockedService.formatMonitorTitleSuffix.mockResolvedValue(" (suffix)");
    mockedService.getMonitorTypes.mockResolvedValue([]);
    mockedService.validateMonitorData.mockResolvedValue({
        success: true,
        errors: [],
    });
});

afterEach(() => {
    monitorTypesStoreState.formatMonitorDetail.mockReset();
    monitorTypesStoreState.formatMonitorTitleSuffix.mockReset();
});

describe(supportsAdvancedAnalytics, () => {
    it("returns true when the configuration enables the feature", async () => {
        storeConfig("http", {
            uiConfig: {
                supportsAdvancedAnalytics: true,
            },
        });

        const result = await supportsAdvancedAnalytics("http");
        expect(result).toBeTruthy();
    });

    it("returns false when the configuration does not enable the feature", async () => {
        storeConfig("http", {
            uiConfig: {
                supportsAdvancedAnalytics: false,
            },
        });

        const result = await supportsAdvancedAnalytics("http");
        expect(result).toBeFalsy();
    });

    it("fetches configuration when cache is empty", async () => {
        configMap.clear();
        mockCacheGet.mockImplementation(() => undefined);

        mockGetMonitorTypeConfig.mockResolvedValueOnce(
            createConfig("http", {
                uiConfig: {
                    supportsAdvancedAnalytics: true,
                },
            })
        );

        const result = await supportsAdvancedAnalytics("http");

        expect(result).toBeTruthy();
        expect(mockGetMonitorTypeConfig).toHaveBeenCalledWith("http");
        expect(mockCacheSet).toHaveBeenCalledWith(
            getCacheKeyForType("http"),
            expect.objectContaining({
                uiConfig: expect.objectContaining({
                    supportsAdvancedAnalytics: true,
                }),
            })
        );
    });

    it("returns false when fetching configuration throws", async () => {
        configMap.clear();
        mockCacheGet.mockImplementation(() => undefined);
        mockGetMonitorTypeConfig.mockRejectedValueOnce(new Error("boom"));

        const result = await supportsAdvancedAnalytics("http");
        expect(result).toBeFalsy();
    });
});

describe(supportsResponseTime, () => {
    it("returns true when the configuration enables response time support", async () => {
        storeConfig("ping", {
            uiConfig: {
                supportsResponseTime: true,
            },
        });

        const result = await supportsResponseTime("ping");
        expect(result).toBeTruthy();
    });

    it("returns false when response time support is absent", async () => {
        storeConfig("ping", {
            uiConfig: {
                supportsResponseTime: false,
            },
        });

        const result = await supportsResponseTime("ping");
        expect(result).toBeFalsy();
    });

    it("returns false when configuration retrieval fails", async () => {
        configMap.clear();
        mockCacheGet.mockImplementation(() => undefined);
        mockGetMonitorTypeConfig.mockRejectedValueOnce(new Error("failed"));

        const result = await supportsResponseTime("ping");
        expect(result).toBeFalsy();
    });
});

describe(allSupportsAdvancedAnalytics, () => {
    it("returns true when every type supports advanced analytics", async () => {
        storeConfig("http", {
            uiConfig: {
                supportsAdvancedAnalytics: true,
            },
        });
        storeConfig("port", {
            uiConfig: {
                supportsAdvancedAnalytics: true,
            },
        });

        const result = await allSupportsAdvancedAnalytics(["http", "port"]);
        expect(result).toBeTruthy();
    });

    it("returns false when at least one type does not support advanced analytics", async () => {
        storeConfig("http", {
            uiConfig: {
                supportsAdvancedAnalytics: true,
            },
        });
        storeConfig("port", {
            uiConfig: {
                supportsAdvancedAnalytics: false,
            },
        });

        const result = await allSupportsAdvancedAnalytics(["http", "port"]);
        expect(result).toBeFalsy();
    });
});

describe(allSupportsResponseTime, () => {
    it("returns true when every type supports response time", async () => {
        storeConfig("http", {
            uiConfig: {
                supportsResponseTime: true,
            },
        });
        storeConfig("dns", {
            uiConfig: {
                supportsResponseTime: true,
            },
        });

        const result = await allSupportsResponseTime(["http", "dns"]);
        expect(result).toBeTruthy();
    });

    it("returns false when any type lacks response time support", async () => {
        storeConfig("http", {
            uiConfig: {
                supportsResponseTime: true,
            },
        });
        storeConfig("dns", {
            uiConfig: {
                supportsResponseTime: false,
            },
        });

        const result = await allSupportsResponseTime(["http", "dns"]);
        expect(result).toBeFalsy();
    });
});

describe(formatMonitorDetail, () => {
    it("delegates to the monitor types service", async () => {
        const result = await formatMonitorDetail("http", "200");

        expect(result).toBe("Formatted detail");
        expect(MonitorTypesService.formatMonitorDetail).toHaveBeenCalledWith(
            "http",
            "200"
        );
    });

    it("returns the fallback value when the service throws", async () => {
        vi.mocked(
            MonitorTypesService.formatMonitorDetail
        ).mockRejectedValueOnce(new Error("service down"));

        const result = await formatMonitorDetail("http", "200");
        expect(result).toBe("200");
    });
});

describe(formatMonitorTitleSuffix, () => {
    it("uses the monitor types service to format the suffix", async () => {
        const monitor = buildMonitor();
        const result = await formatMonitorTitleSuffix("http", monitor);

        expect(result).toBe(" (suffix)");
        expect(
            MonitorTypesService.formatMonitorTitleSuffix
        ).toHaveBeenCalledWith("http", monitor);
    });

    it("returns an empty string when formatting fails", async () => {
        const monitor = buildMonitor();
        vi.mocked(
            MonitorTypesService.formatMonitorTitleSuffix
        ).mockRejectedValueOnce(new Error("bad format"));

        const result = await formatMonitorTitleSuffix("http", monitor);
        expect(result).toBe("");
    });
});

describe(getAnalyticsLabel, () => {
    it("returns the configured analytics label when available", async () => {
        storeConfig("http", {
            uiConfig: {
                detailFormats: {
                    analyticsLabel: "Custom Analytics",
                },
            },
        });

        const result = await getAnalyticsLabel("http");
        expect(result).toBe("Custom Analytics");
    });

    it("falls back to an upper-case monitor type when configuration is missing", async () => {
        configMap.clear();

        const result = await getAnalyticsLabel("http");
        expect(result).toBe("HTTP Response Time");
    });

    it("stores fetched configuration in the cache on miss", async () => {
        configMap.clear();
        mockCacheGet.mockImplementation(() => undefined);

        mockGetMonitorTypeConfig.mockResolvedValueOnce(
            createConfig("http", {
                uiConfig: {
                    detailFormats: {
                        analyticsLabel: "Fetched Label",
                    },
                },
            })
        );

        const result = await getAnalyticsLabel("http");
        expect(result).toBe("Fetched Label");
        expect(mockCacheSet).toHaveBeenCalledWith(
            getCacheKeyForType("http"),
            expect.objectContaining({
                uiConfig: expect.objectContaining({
                    detailFormats: expect.objectContaining({
                        analyticsLabel: "Fetched Label",
                    }),
                }),
            })
        );
    });
});

describe(getMonitorHelpTexts, () => {
    it("returns help texts from configuration", async () => {
        storeConfig("http", {
            uiConfig: {
                helpTexts: {
                    primary: "Primary text",
                    secondary: "Secondary text",
                },
            },
        });

        const result = await getMonitorHelpTexts("http");
        expect(result).toEqual({
            primary: "Primary text",
            secondary: "Secondary text",
        });
    });

    it("returns an empty object when help texts are unavailable", async () => {
        configMap.clear();
        const result = await getMonitorHelpTexts("http");
        expect(result).toEqual({});
    });
});

describe(getTypesWithFeature, () => {
    it("returns monitor types that support response time", async () => {
        mockGetAvailableMonitorTypes.mockResolvedValueOnce([
            createConfig("http", {
                uiConfig: {
                    supportsResponseTime: true,
                },
            }),
            createConfig("port", {
                uiConfig: {
                    supportsResponseTime: false,
                },
            }),
            createConfig("invalid", {
                uiConfig: {
                    supportsResponseTime: true,
                },
            }),
        ]);

        const result = await getTypesWithFeature("responseTime");
        expect(result).toEqual(["http"]);
    });

    it("returns monitor types that support advanced analytics", async () => {
        mockGetAvailableMonitorTypes.mockResolvedValueOnce([
            createConfig("http", {
                uiConfig: {
                    supportsAdvancedAnalytics: true,
                },
            }),
            createConfig("dns", {
                uiConfig: {
                    supportsAdvancedAnalytics: false,
                },
            }),
        ]);

        const result = await getTypesWithFeature("advancedAnalytics");
        expect(result).toEqual(["http"]);
    });
});

describe(shouldShowUrl, () => {
    it("returns the display preference from configuration", async () => {
        storeConfig("http", {
            uiConfig: {
                display: {
                    showUrl: true,
                },
            },
        });

        const result = await shouldShowUrl("http");
        expect(result).toBeTruthy();
    });

    it("returns false when configuration is missing", async () => {
        configMap.clear();
        const result = await shouldShowUrl("http");
        expect(result).toBeFalsy();
    });
});

describe(getDefaultMonitorId, () => {
    it("returns the first monitor identifier", () => {
        expect(getDefaultMonitorId(["mon-1", "mon-2"])).toBe("mon-1");
    });

    it("returns an empty string when list is empty", () => {
        expect(getDefaultMonitorId([])).toBe("");
    });
});

describe(clearConfigCache, () => {
    it("clears the cached configuration entries", () => {
        storeConfig("http");
        expect(configMap.size).toBe(1);

        clearConfigCache();

        expect(mockCacheClear).toHaveBeenCalledTimes(1);
    });
});
