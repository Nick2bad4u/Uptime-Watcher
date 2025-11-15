/**
 * @remarks
 * Delegates to the canonical configuration located under
 * `storybook/test-runner-jest.config.js` so the runner behaves the same
 * regardless of the working directory that invokes it.
 *
 * @file Entry point for Jest overrides used by the Storybook test runner.
 */
// eslint-disable-next-line unicorn/prefer-module, sonarjs/no-require-or-define -- Storybook consumes CommonJS configuration files
module.exports = require("./storybook/test-runner-jest.config.js").default;
