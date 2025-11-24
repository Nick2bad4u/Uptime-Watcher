/* eslint-disable jsdoc/require-file-overview, jsdoc/text-escaping */

// eslint-disable-next-line @typescript-eslint/no-require-imports, import-x/no-commonjs, import-x/unambiguous, sonarjs/no-require-or-define, unicorn/prefer-module, n/no-unpublished-require -- Storybook test runner loads CommonJS config files
const { getJestConfig } = require("@storybook/test-runner");

/*
 * Jest's glob-based `testMatch` expands Storybook story globs to absolute
 * paths. Micromatch treats the parentheses in "PC (2)" as extglob tokens on
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
    String.raw`[\\/]\.stryker-tmp[\\/]`,
    String.raw`[\\/]node_modules[\\/]`,
    String.raw`[\\/]dist[\\/]`,
    String.raw`[\\/]build[\\/]`,
    String.raw`[\\/]coverage[\\/]`,
    String.raw`[\\/]storybook-static[\\/]`,
];

delete baseConfig.testMatch;
delete baseConfig.testRegex;

// eslint-disable-next-line import-x/no-commonjs, unicorn/prefer-module -- CommonJS export required by Storybook test runner
module.exports = {
    ...baseConfig,
    testPathIgnorePatterns,
    testRegex: storybookTestPatterns,
};

/* eslint-enable jsdoc/require-file-overview, jsdoc/text-escaping */
