import type { ExtractIpcResponseDataOptions } from "@shared/utils/ipcResponse";

import {
    extractIpcResponseData,
    safeExtractIpcResponseData,
    validateVoidIpcResponse,
} from "@shared/utils/ipcResponse";
import { describe, expect, it } from "vitest";

const addThrowingOptionGetter = <T>(
    options: ExtractIpcResponseDataOptions<T>,
    key: keyof ExtractIpcResponseDataOptions<T>,
    onAccess: () => void
): void => {
    Object.defineProperty(options, key, {
        configurable: true,
        enumerable: true,
        get() {
            onAccess();
            throw new Error(`${key} getter should not run`);
        },
    });
};

const addThrowingGetter = (
    source: object,
    key: PropertyKey,
    onAccess: () => void
): void => {
    Object.defineProperty(source, key, {
        configurable: true,
        enumerable: true,
        get() {
            onAccess();
            throw new Error(`${String(key)} getter should not run`);
        },
    });
};

describe("ipcResponse", () => {
    it("extracts data without invoking accessor-backed parser options", () => {
        let getterCalls = 0;
        const options: ExtractIpcResponseDataOptions<string> = {};
        addThrowingOptionGetter(options, "parse", () => {
            getterCalls += 1;
        });

        const result = extractIpcResponseData<string>(
            { data: "ok", success: true },
            options
        );

        expect(result).toBe("ok");
        expect(getterCalls).toBe(0);
    });

    it("safely extracts data without spreading accessor-backed options", () => {
        let getterCalls = 0;
        const options: ExtractIpcResponseDataOptions<string> = {};
        addThrowingOptionGetter(options, "requireData", () => {
            getterCalls += 1;
        });

        const result = safeExtractIpcResponseData<string>(
            { data: "ok", success: true },
            "fallback",
            options
        );

        expect(result).toBe("ok");
        expect(getterCalls).toBe(0);
    });

    it("preserves plain parser and requireData options", () => {
        const result = safeExtractIpcResponseData(
            { data: "42", success: true },
            0,
            {
                parse: (data) => (data === "42" ? 42 : 0),
                requireData: true,
            }
        );

        expect(result).toBe(42);
    });

    it("trims failed response messages before throwing", () => {
        expect(() =>
            extractIpcResponseData({
                error: "  backend unavailable  ",
                success: false,
            })
        ).toThrow("backend unavailable");
    });

    it("trims void failed response messages before throwing", () => {
        expect(() =>
            validateVoidIpcResponse({
                error: "\nlogging failed\t",
                success: false,
            })
        ).toThrow("logging failed");
    });

    it("uses a stable fallback for blank failed response messages", () => {
        expect(() =>
            validateVoidIpcResponse({
                error: " ".repeat(3),
                success: false,
            })
        ).toThrow("IPC operation failed");
    });

    it("does not invoke accessor-backed success fields", () => {
        let getterCalls = 0;
        const response = {};
        addThrowingGetter(response, "success", () => {
            getterCalls += 1;
        });

        expect(() => extractIpcResponseData(response)).toThrow(
            "Invalid IPC response format"
        );
        expect(getterCalls).toBe(0);
    });

    it("does not invoke accessor-backed error fields", () => {
        let getterCalls = 0;
        const response = { success: false };
        addThrowingGetter(response, "error", () => {
            getterCalls += 1;
        });

        expect(() => validateVoidIpcResponse(response)).toThrow(
            "IPC operation failed"
        );
        expect(getterCalls).toBe(0);
    });

    it("does not invoke accessor-backed data fields", () => {
        let getterCalls = 0;
        const response = { success: true };
        addThrowingGetter(response, "data", () => {
            getterCalls += 1;
        });

        const result = extractIpcResponseData(response, {
            requireData: false,
        });

        expect(result).toBeUndefined();
        expect(getterCalls).toBe(0);
    });
});
