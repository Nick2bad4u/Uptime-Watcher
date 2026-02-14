import tsParser from "@typescript-eslint/parser";
import { RuleTester } from "@typescript-eslint/rule-tester";
import { readFileSync } from "node:fs";
import * as path from "node:path";
import { afterAll, describe, it } from "vitest";

import { repoPath } from "./ruleTester";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const typedFixturesRoot = repoPath(
    "config",
    "linting",
    "plugins",
    "uptime-watcher",
    "test",
    "fixtures",
    "typed"
);

export const typedFixturePath = (...segments: string[]): string =>
    path.join(typedFixturesRoot, ...segments);

export const readTypedFixture = (...segments: string[]): string =>
    readFileSync(typedFixturePath(...segments), "utf8");

export const createTypedRuleTester = (): RuleTester =>
    new RuleTester({
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: "latest",
                projectService: true,
                sourceType: "module",
                tsconfigRootDir: repoPath(),
            },
        },
    });
