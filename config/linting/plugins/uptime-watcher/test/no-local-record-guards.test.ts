import { createRuleTester,
getPluginRule,
repoPath } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "uptime-watcher/no-local-record-guards",
    getPluginRule("no-local-record-guards"),
    {
        invalid: [
            {
                code: "function asRecord(value) { return value; }",
                errors: [{ messageId: "noLocalRecordGuards" }],
                filename: repoPath("src", "app.ts"),
            },
        ],
        valid: [
            {
                code: "function asRecord(value) { return value; }",
                filename: repoPath("shared", "utils", "typeGuards.ts"),
            },
        ],
    }
);
