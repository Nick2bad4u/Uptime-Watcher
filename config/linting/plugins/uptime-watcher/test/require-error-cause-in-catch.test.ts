import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "uptime-watcher/require-error-cause-in-catch",
    getPluginRule("require-error-cause-in-catch"),
    {
        invalid: [
            {
                code: `
try {
  doThing();
} catch (err) {
  throw new Error('Failed');
}
`.trim(),
                errors: [{ messageId: "missingCause" }],
                filename: repoPath(
                    "electron",
                    "services",
                    "misc",
                    "someFile.ts"
                ),
            },
            {
                code: `
try {
  doThing();
} catch (err) {
  throw new TypeError('Bad');
}
`.trim(),
                errors: [{ messageId: "missingCause" }],
                filename: repoPath("src", "utils", "someFile.ts"),
            },
            {
                code: `
try {
  doThing();
} catch (err) {
  throw new Error('Failed', { somethingElse: 123 });
}
`.trim(),
                errors: [{ messageId: "missingCause" }],
                filename: repoPath("shared", "utils", "someFile.ts"),
            },
        ],
        valid: [
            {
                code: `
try {
  doThing();
} catch (err) {
  throw err;
}
`.trim(),
                filename: repoPath(
                    "electron",
                    "services",
                    "misc",
                    "someFile.ts"
                ),
            },
            {
                code: `
try {
  doThing();
} catch (err) {
  throw new Error('Failed', { cause: err });
}
`.trim(),
                filename: repoPath(
                    "electron",
                    "services",
                    "misc",
                    "someFile.ts"
                ),
            },
            {
                // Not in repo sources - rule should not run.
                code: `
try {
  doThing();
} catch (err) {
  throw new Error('Failed');
}
`.trim(),
                filename: repoPath("assets", "ignore.ts"),
            },
            {
                // Src/test is excluded
                code: `
try {
  doThing();
} catch (err) {
  throw new Error('Failed');
}
`.trim(),
                filename: repoPath("src", "test", "some.test.ts"),
            },
        ],
    }
);
