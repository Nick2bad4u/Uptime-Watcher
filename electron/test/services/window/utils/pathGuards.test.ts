import { describe, expect, it } from "vitest";

import { isPathWithinDirectory } from "../../../../services/window/utils/pathGuards";

describe("pathGuards", () => {
    it("keeps POSIX child paths within their directory", () => {
        expect(
            isPathWithinDirectory(
                "/opt/uptime-watcher/dist/index.html",
                "/opt/uptime-watcher/dist",
                "linux"
            )
        ).toBeTruthy();
    });

    it("rejects POSIX sibling paths with a shared prefix", () => {
        expect(
            isPathWithinDirectory(
                "/opt/uptime-watcher/dist-malicious/index.html",
                "/opt/uptime-watcher/dist",
                "linux"
            )
        ).toBeFalsy();
    });

    it("accepts POSIX child paths whose names start with two dots", () => {
        expect(
            isPathWithinDirectory(
                "/opt/uptime-watcher/dist/..assets/index.html",
                "/opt/uptime-watcher/dist",
                "linux"
            )
        ).toBeTruthy();
    });

    it("uses Windows separators and case-insensitive comparison for win32", () => {
        expect(
            isPathWithinDirectory(
                String.raw`C:\Apps\Uptime-Watcher\DIST\index.html`,
                String.raw`c:\apps\uptime-watcher\dist`,
                "win32"
            )
        ).toBeTruthy();
    });

    it("rejects Windows sibling paths with a shared prefix", () => {
        expect(
            isPathWithinDirectory(
                String.raw`C:\Apps\Uptime-Watcher\dist-malicious\index.html`,
                String.raw`C:\Apps\Uptime-Watcher\dist`,
                "win32"
            )
        ).toBeFalsy();
    });
});
