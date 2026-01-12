/**
 * @file Strict coverage tests for the renderer AppNotificationService.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AppNotificationRequest } from "@shared/types/notifications";

type EnsureInitialized = () => Promise<void>;

type Wrap = <TParams extends unknown[], TResult>(
    actionName: string,
    handler: (api: unknown, ...params: TParams) => Promise<TResult>
) => (...params: TParams) => Promise<TResult>;

const ensureInitializedMock = vi.fn<EnsureInitialized>();
const notifyAppEventSpy = vi.fn<
    (payload: AppNotificationRequest) => Promise<void>
>(async () => undefined);

const wrapMock = vi.fn<Wrap>();

const getIpcServiceHelpersMock = vi.fn(() => ({
    ensureInitialized: ensureInitializedMock,
    wrap: wrapMock,
}));

vi.mock("@app/services/utils/createIpcServiceHelpers", () => ({
    getIpcServiceHelpers: getIpcServiceHelpersMock,
}));

describe("AppNotificationService (strict coverage)", () => {
    beforeEach(() => {
        vi.resetModules();

        ensureInitializedMock.mockReset().mockResolvedValue(undefined);
        notifyAppEventSpy.mockClear();

        wrapMock
            .mockReset()
            .mockImplementation((_actionName, handler) => async (...params) => {
                await ensureInitializedMock();

                const api = {
                    notifications: {
                        notifyAppEvent: notifyAppEventSpy,
                    },
                };

                return handler(api, ...params);
            });

        getIpcServiceHelpersMock.mockClear();
    });

    it("initializes via ipc helpers", async () => {
        const { AppNotificationService } =
            await import("@app/services/AppNotificationService");

        await AppNotificationService.initialize();

        expect(ensureInitializedMock).toHaveBeenCalledTimes(1);
    });

    it("wraps notifyAppEvent and forwards payload", async () => {
        const { AppNotificationService } =
            await import("@app/services/AppNotificationService");

        const request: AppNotificationRequest = {
            title: "Site is down",
            body: "Example body",
        };

        await AppNotificationService.notifyAppEvent(request);

        expect(wrapMock).toHaveBeenCalledWith(
            "notifyAppEvent",
            expect.any(Function)
        );
        expect(notifyAppEventSpy).toHaveBeenCalledTimes(1);
        expect(notifyAppEventSpy).toHaveBeenCalledWith(request);
    });

    it("surfaces initialization failures and does not call the API", async () => {
        ensureInitializedMock.mockRejectedValueOnce(new Error("not ready"));

        const { AppNotificationService } =
            await import("@app/services/AppNotificationService");

        await expect(
            AppNotificationService.notifyAppEvent({
                title: "T",
                body: "B",
            })
        ).rejects.toThrowError(/not ready/i);

        expect(notifyAppEventSpy).not.toHaveBeenCalled();
    });
});
