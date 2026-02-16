import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import * as path from "node:path";
import { afterAll, describe, it } from "vitest";

import uptimeWatcherTypeUtilsPlugin from "../../plugin.mjs";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

type PluginRuleModule = Parameters<RuleTester["run"]>[1];

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

const isRuleModule = (value: unknown): value is PluginRuleModule => {
    if (!isRecord(value)) {
        return false;
    }

    const maybeCreate = (value as { create?: unknown }).create;

    return typeof maybeCreate === "function";
};

export const getPluginRule = (ruleId: string): PluginRuleModule => {
    const rules = uptimeWatcherTypeUtilsPlugin.rules;
    if (!rules) {
        throw new Error("uptimeWatcherTypeUtilsPlugin.rules must be defined");
    }

    const dynamicRules = rules as Record<string, unknown>;
    if (!Object.hasOwn(dynamicRules, ruleId)) {
        throw new TypeError(
            `Rule '${ruleId}' is not registered in uptimeWatcherTypeUtilsPlugin`
        );
    }

    const rule = dynamicRules[ruleId];

    if (!isRuleModule(rule)) {
        throw new Error(`Rule '${ruleId}' is not a valid ESLint rule module`);
    }

    return rule;
};
