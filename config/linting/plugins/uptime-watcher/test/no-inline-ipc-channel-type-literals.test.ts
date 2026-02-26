import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "no-inline-ipc-channel-type-literals",
    getPluginRule("no-inline-ipc-channel-type-literals"),
    {
        invalid: [
            {
                code: "const channel = 'my.channel' as IpcInvokeChannel;",
                errors: [{ messageId: "noInlineChannelTypeLiteral" }],
                filename: repoPath("src", "app.ts"),
            },
        ],
        valid: [
            {
                code: "const channel = 'my.channel' as string;",
                filename: repoPath("src", "app.ts"),
            },
        ],
    }
);
