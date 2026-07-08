import { describe, expect, it } from "vitest";

import { createSanitizedFileName } from "../../../../services/database/dataBackupService/sanitizeBackupFileName";

describe(createSanitizedFileName, () => {
    it("falls back for empty and traversal-only names", () => {
        expect(createSanitizedFileName("")).toBe("backup.sqlite");
        expect(createSanitizedFileName("..")).toBe("backup.sqlite");
        expect(createSanitizedFileName("../")).toBe("backup.sqlite");
    });

    it("sanitizes unsafe characters and reserved Windows basenames", () => {
        expect(createSanitizedFileName("bad:name?.sqlite")).toBe(
            "bad_name_.sqlite"
        );
        expect(createSanitizedFileName("CON.sqlite")).toBe("CON_.sqlite");
    });

    it("normalizes Windows path separators before taking the basename", () => {
        expect(
            createSanitizedFileName(String.raw`C:\Users\Nick\backup.sqlite`)
        ).toBe("backup.sqlite");
        expect(createSanitizedFileName(String.raw`..\backup.sqlite`)).toBe(
            "backup.sqlite"
        );
    });

    it("limits long base names while preserving normal extensions", () => {
        const result = createSanitizedFileName(`${"a".repeat(300)}.sqlite`);

        expect(result).toHaveLength(200);
        expect(result.endsWith(".sqlite")).toBeTruthy();
    });

    it("limits long extension names to the maximum filename length", () => {
        const result = createSanitizedFileName(`backup.${"x".repeat(300)}`);

        expect(result).toHaveLength(200);
        expect(result.startsWith("backup.")).toBeTruthy();
    });
});
