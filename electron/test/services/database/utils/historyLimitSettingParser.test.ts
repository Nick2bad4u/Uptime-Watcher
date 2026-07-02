import { parseHistoryLimitSetting } from "@electron/services/database/utils/historyLimitSettingParser";
import { describe, expect, it } from "vitest";

describe(parseHistoryLimitSetting, () => {
    it("parses trimmed signed integer strings", () => {
        expect(parseHistoryLimitSetting(" 250 ")).toBe(250);
        expect(parseHistoryLimitSetting("+250")).toBe(250);
        expect(parseHistoryLimitSetting("-10")).toBe(-10);
        expect(parseHistoryLimitSetting("0")).toBe(0);
    });

    it("rejects malformed and unsafe numeric strings", () => {
        const invalidValues = [
            "",
            " ".repeat(3),
            "1.5",
            "1e3",
            "100abc",
            "Infinity",
            String(Number.MAX_SAFE_INTEGER + 1),
        ];

        for (const value of invalidValues) {
            expect(parseHistoryLimitSetting(value)).toBeUndefined();
        }
    });
});
