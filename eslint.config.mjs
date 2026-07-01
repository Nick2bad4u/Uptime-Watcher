import nick2bad4u from "eslint-config-nick2bad4u";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import tailwind from "eslint-plugin-tailwindcss";

import uptimeWatcherPlugin from "./config/linting/plugins/uptime-watcher.mjs";

const sharedConfig = nick2bad4u.configs.all.map((config) => {
    if (!config.rules?.["unicorn/logical-assignment-operators"]) {
        return config;
    }

    return {
        ...config,
        rules: {
            ...config.rules,
            // eslint-plugin-unicorn 64 exposes an invalid schema for this rule
            // under ESLint 10. Keep the shared preset usable until upstream fixes it.
            "unicorn/logical-assignment-operators": "off",
        },
    };
});

const uptimeWatcherRepoConfigs = uptimeWatcherPlugin.configs?.repo ?? [];

/** @type {import("eslint").Linter.Config[]} */
const config = [
    ...sharedConfig,
    ...uptimeWatcherRepoConfigs,
    {
        files: ["**/*.{js,jsx,mjs,cjs,ts,tsx,cts,mts}"],
        name: "Uptime Watcher: Tailwind plugin wiring",
        plugins: {
            "better-tailwindcss": betterTailwindcss,
            tailwind,
        },
        rules: {
            // Keep these locally wired, but do not introduce new Tailwind lint
            // failures as part of the shared-config migration.
            "better-tailwindcss/multiline": "off",
            "better-tailwindcss/sort-classes": "off",
            "tailwind/classnames-order": "off",
            "tailwind/enforces-negative-arbitrary-values": "off",
            "tailwind/enforces-shorthand": "off",
            "tailwind/migration-from-tailwind-2": "off",
            "tailwind/no-arbitrary-value": "off",
            "tailwind/no-contradicting-classname": "off",
            "tailwind/no-custom-classname": "off",
        },
    },
];

export default config;
