import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("store-actions-require-finally-reset",
    getPluginRule("store-actions-require-finally-reset"),
    {
        invalid: [
            {
                code: "const action = async () => { set({ isLoading: true }); await doThing(); };",
                errors: [{ messageId: "missingFinallyReset" }],
                filename: repoPath("src", "stores", "fooStore.ts"),
            },
        ],
        valid: [
            {
                code: "const action = async () => { set({ isLoading: true }); try { await doThing(); } finally { set({ isLoading: false }); } };",
                filename: repoPath("src", "stores", "fooStore.ts"),
            },
        ],
    }
);
