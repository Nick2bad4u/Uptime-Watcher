import { describe, expect, it, vi } from "vitest";

import {
    validateNotificationPreferencesPayload,
    validateNotifyAppEventPayload,
} from "@electron/services/ipc/validators/utils/notificationValidation";

describe("notification IPC validators", () => {
    it("accepts valid notification preference updates", () => {
        expect(
            validateNotificationPreferencesPayload({
                mutedSiteNotificationIdentifiers: ["site-a", "site-b"],
                systemNotificationsEnabled: true,
                systemNotificationsSoundEnabled: false,
            })
        ).toBeNull();
    });

    it("accepts valid app notification requests", () => {
        expect(
            validateNotifyAppEventPayload({
                body: "Body",
                title: "Title",
            })
        ).toBeNull();
    });

    it("rejects reserved keys before schema validation", () => {
        const request = Object.create(null) as Record<string, unknown>;
        request["title"] = "Title";
        Object.defineProperty(request, "__proto__", {
            enumerable: true,
            value: "polluted",
        });

        expect(validateNotifyAppEventPayload(request)).toStrictEqual([
            "request must not include reserved key '__proto__'",
        ]);
    });

    it("rejects exotic notification payload prototypes", () => {
        for (const payload of [
            new Date(),
            new Map<string, unknown>(),
            Object.create({ inherited: true }) as Record<string, unknown>,
        ]) {
            expect(validateNotifyAppEventPayload(payload)).toStrictEqual([
                "request must be a valid object",
            ]);
        }
    });

    it("does not invoke accessor-backed notification request fields", () => {
        const getter = vi.fn(() => {
            throw new Error("notification getter should not run");
        });
        const request = {};
        Object.defineProperty(request, "title", {
            enumerable: true,
            get: getter,
        });

        expect(validateNotifyAppEventPayload(request)).toEqual(
            expect.arrayContaining([expect.stringContaining("expected string")])
        );
        expect(getter).not.toHaveBeenCalled();
    });

    it("does not invoke accessor-backed preference fields", () => {
        const getter = vi.fn(() => {
            throw new Error("preference getter should not run");
        });
        const preferences = {
            systemNotificationsSoundEnabled: true,
        };
        Object.defineProperty(preferences, "systemNotificationsEnabled", {
            enumerable: true,
            get: getter,
        });

        expect(validateNotificationPreferencesPayload(preferences)).toEqual(
            expect.arrayContaining([
                expect.stringContaining("expected boolean"),
            ])
        );
        expect(getter).not.toHaveBeenCalled();
    });
});
