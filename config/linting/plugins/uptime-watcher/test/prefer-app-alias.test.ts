import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("prefer-app-alias", getPluginRule("prefer-app-alias"), {
    invalid: [
        {
            code: "import { foo } from '../src/services/foo';",
            output: "import { foo } from '@app/services/foo';",
            errors: [{ messageId: "useAlias" }],
            filename: repoPath("electron", "main.ts"),
        },
    ],
    valid: [
        {
            code: "import { foo } from '@app/services/foo';",
            filename: repoPath("electron", "main.ts"),
        },
    ],
});
