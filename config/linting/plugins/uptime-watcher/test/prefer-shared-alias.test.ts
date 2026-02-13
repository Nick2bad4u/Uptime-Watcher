import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run("prefer-shared-alias",
    getPluginRule("prefer-shared-alias"),
    {
        invalid: [
            {
                code: "import { foo } from '../shared/utils/foo';",
                output: "import { foo } from '@shared/utils/foo';",
                errors: [{ messageId: "useAlias" }],
                filename: repoPath("src", "app.ts"),
            },
        ],
        valid: [
            {
                code: "import { foo } from '@shared/utils/foo';",
                filename: repoPath("src", "app.ts"),
            },
        ],
    }
);
