import { isWindowsReservedFileBasename } from "@shared/utils/fileNameSafety";
import { describe, expect, it } from "vitest";

describe(isWindowsReservedFileBasename, () => {
    it("detects Windows reserved device basenames case-insensitively", () => {
        expect(isWindowsReservedFileBasename("CON")).toBe(true);
        expect(isWindowsReservedFileBasename("aux")).toBe(true);
        expect(isWindowsReservedFileBasename("Lpt9")).toBe(true);
    });

    it("does not treat ordinary basenames as reserved", () => {
        expect(isWindowsReservedFileBasename("backup")).toBe(false);
        expect(isWindowsReservedFileBasename("console")).toBe(false);
        expect(isWindowsReservedFileBasename("com10")).toBe(false);
    });
});
