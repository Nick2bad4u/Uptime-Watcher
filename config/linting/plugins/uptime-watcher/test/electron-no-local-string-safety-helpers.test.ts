import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "uptime-watcher/electron-no-local-string-safety-helpers",
    getPluginRule("electron-no-local-string-safety-helpers"),
    {
        invalid: [
            {
                code: "function hasAsciiControlCharacters(value) { return false; }",
                errors: [{ messageId: "banned" }],
                filename: repoPath("electron", "services", "foo.ts"),
            },
        ],
        valid: [
            {
                code: "function hasAsciiControlCharacters(value) { return false; }",
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
