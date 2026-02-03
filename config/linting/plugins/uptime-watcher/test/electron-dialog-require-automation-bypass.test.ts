import {
    createRuleTester,
    getPluginRule,
    repoPath,
} from "./_internal/ruleTester.js";

const ruleTester = createRuleTester();

ruleTester.run(
    "uptime-watcher/electron-dialog-require-automation-bypass",
    getPluginRule("electron-dialog-require-automation-bypass"),
    {
        invalid: [
            {
                code: `
import { dialog } from "electron";

async function save() {
    await dialog.showSaveDialog({ title: "Save" });
}
`.trim(),
                errors: [{ messageId: "missingAutomationBypass" }],
                filename: repoPath(
                    "electron",
                    "services",
                    "ipc",
                    "handlers",
                    "dataHandlers.ts"
                ),
            },
        ],
        valid: [
            {
                code: `
import { dialog } from "electron";
import { readProcessEnv } from "@shared/utils/environment";

const isPlaywright = readProcessEnv("PLAYWRIGHT_TEST")?.toLowerCase() === "true";

async function save() {
    if (isPlaywright) {
        return;
    }

    await dialog.showSaveDialog({ title: "Save" });
}
`.trim(),
                filename: repoPath(
                    "electron",
                    "services",
                    "ipc",
                    "handlers",
                    "dataHandlers.ts"
                ),
            },
            {
                code: `
import { dialog } from "electron";

const isHeadless = true; // HEADLESS

async function save() {
    if (isHeadless) {
        return;
    }

    dialog.showMessageBoxSync({ message: "Hello" });
}
`.trim(),
                filename: repoPath(
                    "electron",
                    "services",
                    "ipc",
                    "handlers",
                    "dataHandlers.ts"
                ),
            },
            {
                // Not in electron/test - rule should not run.
                code: `
import { dialog } from "electron";

dialog.showSaveDialog({});
`.trim(),
                filename: repoPath("electron", "test", "some.test.ts"),
            },
        ],
    }
);
