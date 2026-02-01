import { RuleTester } from "eslint";
import tsParser from "@typescript-eslint/parser";

import uptimeWatcherPlugin from "../../config/linting/plugins/uptime-watcher.mjs";

const ruleTester = new RuleTester({
    languageOptions: {
        parser: tsParser,
        parserOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
        },
    },
});

ruleTester.run("uptime-watcher/electron-no-console", uptimeWatcherPlugin.rules["electron-no-console"], {
    valid: [
        {
            code: "console.log('ok');",
            filename: "C:/repo/src/app.ts",
        },
        {
            code: "console.log('ok');",
            filename: "C:/repo/electron/test/something.test.ts",
        },
        {
            code: "logger.info('ok');",
            filename: "C:/repo/electron/main.ts",
        },
    ],
    invalid: [
        {
            code: "console.log('no');",
            filename: "C:/repo/electron/main.ts",
            errors: [{ messageId: "preferLogger" }],
        },
    ],
});

ruleTester.run(
    "uptime-watcher/renderer-no-window-open",
    uptimeWatcherPlugin.rules["renderer-no-window-open"],
    {
        valid: [
            {
                code: "window.location.href = 'https://example.com';",
                filename: "C:/repo/src/components/Foo.tsx",
            },
            {
                code: "window.open('https://example.com');",
                filename: "C:/repo/src/test/something.test.tsx",
            },
        ],
        invalid: [
            {
                code: "window.open('https://example.com');",
                filename: "C:/repo/src/components/Foo.tsx",
                errors: [{ messageId: "noWindowOpen" }],
            },
        ],
    }
);

ruleTester.run(
    "uptime-watcher/require-ensureError-in-catch",
    uptimeWatcherPlugin.rules["require-ensureError-in-catch"],
    {
        valid: [
            {
                code: "try { throw new Error('x'); } catch (error) { ensureError(error); console.log(error.message); }",
                filename: "C:/repo/src/services/foo.ts",
            },
            {
                code: "try { throw new Error('x'); } catch { console.log('no param'); }",
                filename: "C:/repo/src/services/foo.ts",
            },
        ],
        invalid: [
            {
                code: "try { throw new Error('x'); } catch (error) { console.log(error.message); }",
                filename: "C:/repo/src/services/foo.ts",
                errors: [{ messageId: "requireEnsureError" }],
            },
        ],
    }
);
