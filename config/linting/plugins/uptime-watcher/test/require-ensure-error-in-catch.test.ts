import { createRuleTester,
getPluginRule,
repoPath } from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "uptime-watcher/require-ensure-error-in-catch",
    getPluginRule("require-ensure-error-in-catch"),
    {
        invalid: [
            {
                code: "try { throw new Error('x'); } catch (error) { console.log(error.message); }",
                errors: [{ messageId: "requireEnsureError" }],
                filename: repoPath("src", "services", "foo.ts"),
            },
        ],
        valid: [
            {
                code: "try { throw new Error('x'); } catch (error) { ensureError(error); console.log(error.message); }",
                filename: repoPath("src", "services", "foo.ts"),
            },
            {
                code: "try { throw new Error('x'); } catch { console.log('no param'); }",
                filename: repoPath("src", "services", "foo.ts"),
            },
        ],
    }
);
