// eslint-disable-next-line @typescript-eslint/no-require-imports, import-x/no-commonjs, import-x/unambiguous, sonarjs/no-require-or-define, unicorn/prefer-module -- Storybook test runner loads CommonJS config files
const { getJestConfig } = require("@storybook/test-runner");

/**
 * Jest's glob-based `testMatch` expands Storybook story globs to absolute
 * paths. Micromatch treats the parentheses in `"PC (2)"` as extglob tokens on
 * Windows, which makes the default patterns skip every file. Regex-based
 * matching keeps the patterns relative and avoids the extglob interpretation
 * entirely.
 */
const baseConfig = getJestConfig();

const storybookTestPatterns = [
    String.raw`storybook[\\/](?:stories|docs)[\\/].*\.mdx$`,
    String.raw`storybook[\\/](?:stories|docs)[\\/].*\.(?:stories|story)\.[tj]sx?$`,
];

const testPathIgnorePatterns = [
    ...(baseConfig.testPathIgnorePatterns ?? []),
    String.raw`[\\/]\.cache[\\/]`,
];

delete baseConfig.testMatch;
delete baseConfig.testRegex;

// eslint-disable-next-line import-x/no-commonjs, unicorn/prefer-module -- CommonJS export required by Storybook test runner
module.exports = {
    ...baseConfig,
    testPathIgnorePatterns,
    testRegex: storybookTestPatterns,
};
