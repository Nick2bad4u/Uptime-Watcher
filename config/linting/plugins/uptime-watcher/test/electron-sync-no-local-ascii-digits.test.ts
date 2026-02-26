import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "electron-sync-no-local-ascii-digits",
    getPluginRule("electron-sync-no-local-ascii-digits"),
    {
        invalid: [
            {
                code: String.raw`function isAsciiDigits(value: string) { return /\d+/.test(value); }`,
                errors: [{ messageId: "banned" }],
                filename: repoPath("electron", "services", "sync", "foo.ts"),
            },
        ],
        valid: [
            {
                code: String.raw`function isAsciiDigits(value: string) { return /\d+/.test(value); }`,
                filename: repoPath(
                    "electron",
                    "services",
                    "sync",
                    "syncEngineUtils.ts"
                ),
            },
        ],
    }
);
