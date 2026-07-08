import { MONITOR_TYPES_CHANNELS } from "@shared/types/preload";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { registerMonitorTypeHandlers } from "../../../services/ipc/handlers/monitorTypeHandlers";

const { getMonitorTypeConfigMock, mockIpcMain, mockLogger } = vi.hoisted(
    () => ({
        getMonitorTypeConfigMock: vi.fn(),
        mockIpcMain: {
            handle: vi.fn(),
        },
        mockLogger: {
            debug: vi.fn(),
            error: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
        },
    })
);

vi.mock("electron", () => ({
    ipcMain: mockIpcMain,
}));

vi.mock("../../../electronUtils", () => ({
    isDev: vi.fn(() => true),
}));

vi.mock("../../../utils/logger", () => ({
    logger: mockLogger,
}));

vi.mock("../../../services/monitoring/MonitorTypeRegistry", () => ({
    getAllMonitorTypeConfigs: vi.fn(() => []),
    getMonitorTypeConfig: getMonitorTypeConfigMock,
}));

const createTrustedIpcEvent = () => ({
    senderFrame: {
        isDestroyed: () => false,
        url: "http://localhost:5173/index.html",
    },
});

const createMonitorTypeHandlerHarness = () => {
    registerMonitorTypeHandlers({
        registeredHandlers: new Set(),
    });

    const findHandler = (channelName: string) => {
        const entry = mockIpcMain.handle.mock.calls.find(
            ([channel]) => channel === channelName
        );

        expect(entry).toBeDefined();
        return entry?.[1] as (
            event: ReturnType<typeof createTrustedIpcEvent>,
            ...args: unknown[]
        ) => Promise<{ readonly data?: unknown; readonly success: boolean }>;
    };

    return {
        formatMonitorTitleSuffixHandler: findHandler(
            MONITOR_TYPES_CHANNELS.formatMonitorTitleSuffix
        ),
        validateMonitorDataHandler: findHandler(
            MONITOR_TYPES_CHANNELS.validateMonitorData
        ),
    };
};

describe("monitor type IPC handlers", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getMonitorTypeConfigMock.mockReset();
    });

    it("does not invoke accessor-backed monitor fields while formatting title suffixes", async () => {
        const getter = vi.fn(() => {
            throw new Error("monitor getter should not run");
        });
        const monitor = {
            checkInterval: 30_000,
            history: [],
            monitoring: true,
            responseTime: -1,
            retryAttempts: 3,
            status: "pending",
            timeout: 10_000,
            type: "http",
        };
        Object.defineProperty(monitor, "id", {
            enumerable: true,
            get: getter,
        });
        const formatter = vi.fn((candidate: { readonly id?: unknown }) =>
            typeof candidate.id === "string" ? candidate.id : ""
        );
        getMonitorTypeConfigMock.mockReturnValue({
            uiConfig: {
                formatTitleSuffix: formatter,
            },
        });

        const { formatMonitorTitleSuffixHandler } =
            createMonitorTypeHandlerHarness();
        const result = await formatMonitorTitleSuffixHandler(
            createTrustedIpcEvent(),
            "http",
            monitor
        );

        expect(result).toEqual(
            expect.objectContaining({ data: "", success: true })
        );
        expect(getter).not.toHaveBeenCalled();
        expect(formatter).toHaveBeenCalledOnce();
    });

    it("does not invoke accessor-backed monitor data fields while building validation candidates", async () => {
        const getter = vi.fn(() => {
            throw new Error("monitor data getter should not run");
        });
        const data = {
            url: "https://example.com",
        };
        Object.defineProperty(data, "checkInterval", {
            enumerable: true,
            get: getter,
        });

        const { validateMonitorDataHandler } =
            createMonitorTypeHandlerHarness();
        const result = await validateMonitorDataHandler(
            createTrustedIpcEvent(),
            "http",
            data
        );

        expect(result.success).toBe(true);
        expect(getter).not.toHaveBeenCalled();
    });
});
