import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "eslint";
import * as path from "node:path";

import uptimeWatcherPlugin from "../plugin.mjs";

const { rules } = uptimeWatcherPlugin;

const repoPath = (...segments: string[]): string =>
    path.join(process.cwd(), ...segments);

if (!rules) {
    throw new Error("uptimeWatcherPlugin.rules must be defined for RuleTester");
}

const ruleTester = new RuleTester({
    languageOptions: {
        parser: tsParser,
        parserOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
        },
    },
});

ruleTester.run("uptime-watcher/electron-no-console", rules["electron-no-console"], {
    invalid: [
        {
            filename: repoPath("electron", "main.ts"),
            code: "console.log('no');",
            errors: [{ messageId: "preferLogger" }],
        },
    ],
    valid: [
        {
            filename: repoPath("src", "app.ts"),
            code: "console.log('ok');",
        },
        {
            filename: repoPath("electron", "test", "something.test.ts"),
            code: "console.log('ok');",
        },
        {
            filename: repoPath("electron", "main.ts"),
            code: "logger.info('ok');",
        },
    ],
});

ruleTester.run(
    "uptime-watcher/renderer-no-window-open",
    rules["renderer-no-window-open"],
    {
        invalid: [
            {
                filename: repoPath("src", "components", "Foo.tsx"),
                code: "window.open('https://example.com');",
                errors: [{ messageId: "avoidWindowOpen" }],
            },
        ],
        valid: [
            {
                filename: repoPath("src", "components", "Foo.tsx"),
                code: "window.location.href = 'https://example.com';",
            },
            {
                filename: repoPath("src", "test", "something.test.tsx"),
                code: "window.open('https://example.com');",
            },
        ],
    }
);

ruleTester.run(
    "uptime-watcher/require-ensure-error-in-catch",
    rules["require-ensure-error-in-catch"],
    {
        invalid: [
            {
                filename: repoPath("src", "services", "foo.ts"),
                code: "try { throw new Error('x'); } catch (error) { console.log(error.message); }",
                errors: [{ messageId: "requireEnsureError" }],
            },
        ],
        valid: [
            {
                filename: repoPath("src", "services", "foo.ts"),
                code: "try { throw new Error('x'); } catch (error) { ensureError(error); console.log(error.message); }",
            },
            {
                filename: repoPath("src", "services", "foo.ts"),
                code: "try { throw new Error('x'); } catch { console.log('no param'); }",
            },
        ],
    }
);
