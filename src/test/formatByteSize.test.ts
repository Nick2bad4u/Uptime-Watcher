import { fc, test } from "@fast-check/vitest";
import { describe, expect, it } from "vitest";

import { formatByteSize } from "../utils/formatting/formatByteSize";

describe(formatByteSize, () => {
    it("formats 0 bytes as '0 B'", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: formatByteSize", "component");
        await annotate("Category: Formatting", "category");
        await annotate("Type: Business Logic", "type");

        expect(formatByteSize(0)).toBe("0 B");
    });

    it("returns fallback for negative/invalid inputs", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: formatByteSize", "component");
        await annotate("Category: Formatting", "category");
        await annotate("Type: Error Handling", "type");

        expect(formatByteSize(-1)).toBe("N/A");
        expect(formatByteSize(NaN)).toBe("N/A");
        expect(formatByteSize(Infinity)).toBe("N/A");
        expect(formatByteSize(-Infinity)).toBe("N/A");
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

    test.prop([fc.integer({ min: 0, max: Number.MAX_SAFE_INTEGER })])(
        "always returns a compact unit string",
        (bytes) => {
            const result = formatByteSize(bytes);

            expect(typeof result).toBe("string");
            expect(result.length).toBeGreaterThan(0);
            expect(result).toMatch(/\s(?:B|GB|KB|MB|TB)$/v);
        }
    );

    test.prop([
        fc.oneof(
            fc.integer({ max: -1 }),
            fc.constant(Number.NaN),
            fc.constant(Number.POSITIVE_INFINITY),
            fc.constant(Number.NEGATIVE_INFINITY)
        ),
    ])("always returns fallback for invalid values", (bytes) => {
        expect(formatByteSize(bytes)).toBe("N/A");
    });
});
