import { describe, expect, it } from "vitest";
import { test, fc } from "@fast-check/vitest";

import { formatByteSize } from "../utils/formatting/formatByteSize";

describe(formatByteSize, () => {
    it("formats 0 bytes as '0 B'", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: formatByteSize", "component");
        await annotate("Category: Formatting", "category");
        await annotate("Type: Business Logic", "type");

        expect(formatByteSize(0)).toBe("0 B");
    });

    it("preserves negative/invalid inputs as raw string", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: formatByteSize", "component");
        await annotate("Category: Formatting", "category");
        await annotate("Type: Error Handling", "type");

        expect(formatByteSize(-1)).toBe("-1");
        expect(formatByteSize(Number.NaN)).toBe("NaN");
        expect(formatByteSize(Number.POSITIVE_INFINITY)).toBe("Infinity");
    });

    it("uses IEC units and stable rounding", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: formatByteSize", "component");
        await annotate("Category: Formatting", "category");
        await annotate("Type: Business Logic", "type");

        expect(formatByteSize(1023)).toBe("1023 B");
        expect(formatByteSize(1024)).toBe("1.0 KB");
        expect(formatByteSize(10 * 1024)).toBe("10 KB");
        expect(formatByteSize(1024 ** 2)).toBe("1.0 MB");
        expect(formatByteSize(1024 ** 3)).toBe("1.0 GB");
        expect(formatByteSize(1024 ** 4)).toBe("1.0 TB");
    });

    test.prop([
        fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER }),
    ])("always returns a compact unit string", (bytes) => {
        const result = formatByteSize(bytes);

        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
        expect(result).toMatch(/\s(?:B|KB|MB|GB|TB)$/);
    });
});
