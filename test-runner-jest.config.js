/**
 * @remarks
 * Delegates to the canonical configuration located under
 * "storybook/test-runner-jest.config.js" so the runner behaves the same
 * regardless of the working directory that invokes it.
 *
 * @file Storybook test runner entrypoint.
 */

// eslint-disable-next-line unicorn/prefer-module, sonarjs/no-require-or-define -- CommonJS required for Storybook test runner
const path = require("node:path");

/**
 * Re-export the canonical Storybook test runner configuration. Uses absolute
 * path resolution to ensure correct loading regardless of working directory.
 */
// eslint-disable-next-line unicorn/prefer-module -- Storybook consumes CommonJS configuration files
module.exports = require(
    // eslint-disable-next-line unicorn/prefer-module -- __dirname is required for absolute path resolution in CommonJS
    path.resolve(__dirname, "storybook/test-runner-jest.config.js")
);
