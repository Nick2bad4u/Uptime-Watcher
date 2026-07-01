import type { Monitor, MonitorType } from "@shared/types";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
import type { ValidationResult } from "@shared/types/validation";

import { CacheKeys } from "@shared/utils/cacheKeys";
import { safeCastTo } from "ts-extras";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MonitorTypesService } from "../../services/MonitorTypesService";
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

const cacheMocks = vi.hoisted(() => ({
    clear: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
}));

const monitorTypeHelperMocks = vi.hoisted(() => ({
    getAvailableMonitorTypes: vi.fn(),
    getMonitorTypeConfig: vi.fn(),
}));

const monitorTypesServiceMocks = vi.hoisted(() => ({
    formatMonitorDetail: vi.fn(),
    formatMonitorTitleSuffix: vi.fn(),
    getMonitorTypes: vi.fn(),
    initialize: vi.fn(),
    validateMonitorData: vi.fn(),
}));

const monitorTypesStoreState = vi.hoisted(() => ({
    clearError: vi.fn(),
    fieldConfigs: {},
    formatMonitorDetail: vi.fn(),
    formatMonitorTitleSuffix: vi.fn(),
    getFieldConfig: vi.fn(),
    isLoaded: true,
    isLoading: false,
    lastError: undefined,
    loadMonitorTypes: vi.fn(),
    monitorTypes: safeCastTo<MonitorTypeConfig[]>([]),
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
            clear: cacheMocks.clear,
            get: cacheMocks.get,
            set: cacheMocks.set,
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

const configMap = new Map<string, MonitorTypeConfig>();

const getCacheKeyForType = (type: MonitorType): string =>
    CacheKeys.config.byName(`monitor-config-${type}`);

const createConfig = (
    type: MonitorType,
    overrides: Partial<MonitorTypeConfig> = {}
): MonitorTypeConfig => {
    const baseConfig = {
        description: overrides.description ?? "Monitor configuration",
        displayName: overrides.displayName ?? `${type.toUpperCase()} Monitor`,
        fields:
            overrides.fields ??
            ([
                {
                    helpText: "Provide a valid endpoint",
                    label: "Endpoint",
                    name: "endpoint",
                    placeholder: "https://status.example.com",
                    required: true,
                    type: "url",
                },
            ] satisfies MonitorTypeConfig["fields"]),
        type: overrides.type ?? type,
        version: overrides.version ?? "1.0.0",
    } satisfies Omit<MonitorTypeConfig, "uiConfig">;

    if (overrides.uiConfig === null) {
        return baseConfig;
    }

    const detailFormats = overrides.uiConfig?.detailFormats ?? {};
    const display = overrides.uiConfig?.display ?? {};
    const helpTexts = overrides.uiConfig?.helpTexts ?? {};

    const { analyticsLabel, ...detailFormatsRest } = detailFormats;
    const { showUrl, ...displayRest } = display;
    const { primary, secondary, ...helpTextsRest } = helpTexts;

    return {
        ...baseConfig,
        uiConfig: {
            detailFormats: {
                ...detailFormatsRest,
                analyticsLabel:
                    analyticsLabel ?? `${type.toUpperCase()} Response Time`,
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
    } satisfies MonitorTypeConfig;
};

const storeConfig = (
    type: MonitorType,
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
        data: undefined,
        errors: [],
        metadata: {},
        success: true,
        warnings: [],
    } satisfies ValidationResult);
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

        const isResult = await supportsAdvancedAnalytics("http");

        expect(isResult).toBe(true);
    });

    it("returns false when the configuration does not enable the feature", async () => {
        storeConfig("http", {
            uiConfig: {
                supportsAdvancedAnalytics: false,
            },
        });

        const isResult = await supportsAdvancedAnalytics("http");

        expect(isResult).toBe(false);
    });

    it("fetches configuration when cache is empty", async () => {
        configMap.clear();
        mockCacheGet.mockReturnValue(undefined);

        mockGetMonitorTypeConfig.mockResolvedValueOnce(
            createConfig("http", {
                uiConfig: {
                    supportsAdvancedAnalytics: true,
                },
            })
        );

        const isResult = await supportsAdvancedAnalytics("http");

        expect(isResult).toBe(true);
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
        mockCacheGet.mockReturnValue(undefined);
        mockGetMonitorTypeConfig.mockRejectedValueOnce(new Error("boom"));

        const isResult = await supportsAdvancedAnalytics("http");

        expect(isResult).toBe(false);
    });
});

describe(supportsResponseTime, () => {
    it("returns true when the configuration enables response time support", async () => {
        storeConfig("ping", {
            uiConfig: {
                supportsResponseTime: true,
            },
        });

        const isResult = await supportsResponseTime("ping");

        expect(isResult).toBe(true);
    });

    it("returns false when response time support is absent", async () => {
        storeConfig("ping", {
            uiConfig: {
                supportsResponseTime: false,
            },
        });

        const isResult = await supportsResponseTime("ping");

        expect(isResult).toBe(false);
    });

    it("returns false when configuration retrieval fails", async () => {
        configMap.clear();
        mockCacheGet.mockReturnValue(undefined);
        mockGetMonitorTypeConfig.mockRejectedValueOnce(new Error("failed"));

        const isResult = await supportsResponseTime("ping");

        expect(isResult).toBe(false);
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

        const isResult = await allSupportsAdvancedAnalytics(["http", "port"]);

        expect(isResult).toBe(true);
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

        const isResult = await allSupportsAdvancedAnalytics(["http", "port"]);

        expect(isResult).toBe(false);
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

        const isResult = await allSupportsResponseTime(["http", "dns"]);

        expect(isResult).toBe(true);
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

        const isResult = await allSupportsResponseTime(["http", "dns"]);

        expect(isResult).toBe(false);
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
        mockCacheGet.mockReturnValue(undefined);

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
        const invalidMonitorType = "invalid" as unknown as MonitorType;

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
            createConfig(invalidMonitorType, {
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

        const isResult = await shouldShowUrl("http");

        expect(isResult).toBe(true);
    });

    it("returns false when configuration is missing", async () => {
        configMap.clear();
        const isResult = await shouldShowUrl("http");

        expect(isResult).toBe(false);
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
