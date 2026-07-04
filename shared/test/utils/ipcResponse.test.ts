import type { ExtractIpcResponseDataOptions } from "@shared/utils/ipcResponse";

import {
    extractIpcResponseData,
    safeExtractIpcResponseData,
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
});
