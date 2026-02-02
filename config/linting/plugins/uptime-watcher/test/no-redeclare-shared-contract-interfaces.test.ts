import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "uptime-watcher/no-redeclare-shared-contract-interfaces",
    getPluginRule("no-redeclare-shared-contract-interfaces"),
    {
        invalid: [
            {
                code: "interface MonitorTypeOption { value: string }",
                errors: [{ messageId: "noRedeclare" }],
                filename: repoPath("src", "app.ts"),
            },
        ],
        valid: [
            {
                code: "interface MyLocalInterface { value: string }",
                filename: repoPath("src", "app.ts"),
            },
        ],
    }
);
