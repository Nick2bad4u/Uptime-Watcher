import tsParser from "@typescript-eslint/parser";
import { type Linter,
RuleTester } from "eslint";
import * as path from "node:path";

import uptimeWatcherPlugin from "../../plugin.mjs";

export const repoPath = (...segments: string[]): string =>
    path.join(process.cwd(), ...segments);

export const createRuleTester = (): RuleTester =>
    new RuleTester({
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
    });

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const isRuleModule = (value: unknown): value is Linter.RuleModule => {
    if (!isRecord(value)) {
        return false;
    }

    return typeof value.create === "function";
};

export const getPluginRule = (ruleId: string): Linter.RuleModule => {
    const rules = uptimeWatcherPlugin.rules;
    if (!rules) {
        throw new Error("uptimeWatcherPlugin.rules must be defined");
    }

    const rule = rules[ruleId as keyof typeof rules];
    if (!rule) {
        throw new Error(`Rule '${ruleId}' is not registered in uptimeWatcherPlugin`);
    }

    if (!isRuleModule(rule)) {
        throw new Error(`Rule '${ruleId}' is not a valid ESLint rule module`);
    }

    return rule;
};
