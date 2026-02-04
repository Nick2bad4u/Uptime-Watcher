import * as path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("pathGuards (strict coverage)", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    it("normalizePathForComparison lowercases on win32", async () => {
        const { normalizePathForComparison } =
            await import("../../../../../../electron/services/window/utils/pathGuards");

        const input = "/tmp/SomePath";
        const expected = path.resolve(input).toLowerCase();

        expect(normalizePathForComparison(input, "win32")).toBe(expected);
    });

    it("normalizePathForComparison preserves casing on non-win32 platforms", async () => {
        const { normalizePathForComparison } =
            await import("../../../../../../electron/services/window/utils/pathGuards");

        const input = "/tmp/SomePath";
        const expected = path.resolve(input);

        expect(normalizePathForComparison(input, "linux")).toBe(expected);
    });

    it("isPathWithinDirectory returns true for the directory itself (inclusive)", async () => {
        const { isPathWithinDirectory } =
            await import("../../../../../../electron/services/window/utils/pathGuards");

        const directory = "/tmp/project";

        expect(
            isPathWithinDirectory(directory, directory, "linux")
        ).toBeTruthy();
    });

    it("isPathWithinDirectory returns true for nested paths", async () => {
        const { isPathWithinDirectory } =
            await import("../../../../../../electron/services/window/utils/pathGuards");

        expect(
            isPathWithinDirectory(
                "/tmp/project/subdir/file.txt",
                "/tmp/project",
                "linux"
            )
        ).toBeTruthy();
    });

    it("isPathWithinDirectory avoids false positives on shared prefixes", async () => {
        const { isPathWithinDirectory } =
            await import("../../../../../../electron/services/window/utils/pathGuards");

        expect(
            isPathWithinDirectory(
                "/tmp/project-evil/file.txt",
                "/tmp/project",
                "linux"
            )
        ).toBeFalsy();
    });

    it("isPathWithinDirectory treats win32 comparisons as case-insensitive", async () => {
        const { isPathWithinDirectory } =
            await import("../../../../../../electron/services/window/utils/pathGuards");

        expect(
            isPathWithinDirectory(
                "/tmp/PROJECT/file.txt",
                "/tmp/project",
                "win32"
            )
        ).toBeTruthy();
    });

    it("isPathWithinDirectory handles root directories which end with path.sep", async () => {
        const { isPathWithinDirectory } =
            await import("../../../../../../electron/services/window/utils/pathGuards");

        const root = path.parse(process.cwd()).root;
        const child = path.join(root, "nested", "file.txt");

        expect(
            isPathWithinDirectory(child, root, process.platform)
        ).toBeTruthy();
    });

    it("getProductionDistDirectory resolves ../dist from the provided directory", async () => {
        const { getProductionDistDirectory } =
            await import("../../../../../../electron/services/window/utils/pathGuards");

        const currentDirectory = "/tmp/runtime/electron";
        const expected = path.resolve(path.join(currentDirectory, "../dist"));

        expect(getProductionDistDirectory(currentDirectory)).toBe(expected);
    });
});
