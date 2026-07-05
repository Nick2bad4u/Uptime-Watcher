import {
    rowToSettingValue,
    settingsToRecord,
} from "../../../services/database/utils/mappers/settingsMapper";
import { describe, expect, it } from "vitest";

const PROTOTYPE_KEY = "__proto__" as const;

describe("settingsMapper", () => {
    it("preserves empty setting values", () => {
        expect(rowToSettingValue({ value: "" })).toBe("");
    });

    it("returns null-prototype records with prototype-named settings as data", () => {
        const record = settingsToRecord([
            { key: PROTOTYPE_KEY, value: "prototype-value" },
            { key: "constructor", value: "constructor-value" },
            { key: "theme", value: "dark" },
        ]);

        expect(Object.getPrototypeOf(record)).toBeNull();
        expect(Object.hasOwn(record, PROTOTYPE_KEY)).toBe(true);
        expect(record[PROTOTYPE_KEY]).toBe("prototype-value");
        expect(record["constructor"]).toBe("constructor-value");
        expect(record["theme"]).toBe("dark");
    });
});
